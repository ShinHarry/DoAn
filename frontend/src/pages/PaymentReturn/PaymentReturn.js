import React, { useEffect, useState } from 'react';
// import { clearSelectedCartItems } from '~/redux/slices/cartSlice'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './PaymentReturn.module.scss';
import Button from '~/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import * as paymentService from '~/services/paymentService';
import * as orderService from '~/services/orderService';

const cx = classNames.bind(styles);

function PaymentReturn() {
    const location = useLocation();
    const navigate = useNavigate();

    const [status, setStatus] = useState('loading'); // loading, verifying, processing_order, success, error
    const [message, setMessage] = useState('Đang xác thực thanh toán...');
    const [details, setDetails] = useState(null);
    const [createdOrderId, setCreatedOrderId] = useState(null);

    useEffect(() => {
        const processPaymentReturn = async () => {
            setStatus('verifying');
            const queryParams = new URLSearchParams(location.search); // lấy query parameters sau ? trên url chuyển sang object
            const paramsObject = Object.fromEntries(queryParams.entries()); //chuyển sang object

            if (!paramsObject.vnp_TxnRef || !paramsObject.vnp_ResponseCode || !paramsObject.vnp_SecureHash) {
                setStatus('error');
                setMessage('URL trả về không hợp lệ hoặc thiếu thông tin.');
                return;
            }

            try {
                // 1. gọi varify bên phía backend
                const verificationResponse = await paymentService.verifyVnpayReturn(paramsObject);

                if (verificationResponse.success && verificationResponse.code === '00') {
                    // xác minh thành công
                    setStatus('processing_order');
                    setMessage('Xác thực thành công. Đang tạo đơn hàng...');
                    setDetails({
                        vnpTxnRef: paramsObject.vnp_TxnRef,
                        amount: paramsObject.vnp_Amount / 100,
                        bank: paramsObject.vnp_BankCode,
                    });

                    try {
                        // 2. lấy giỏ hàng hiện tại
                        const cartData = JSON.parse(sessionStorage.getItem('selectedCartItems'));
                        if (!cartData && cartData.length === 0) {
                            throw new Error('Không tìm thấy giỏ hàng hoặc giỏ hàng trống để tạo đơn hàng.');
                        }
                        console.log('du lieu', cartData);

                        // 3.chuẩn bị thông tin chi tiết đơn hàng
                        const shippingFee = parseInt(sessionStorage.getItem('shippingFee')) || 0;
                        const shippingAddress = sessionStorage.getItem('shippingAddress');
                        const discountCode = sessionStorage.getItem('discountCode') || '';
                        console.log(discountCode);
                        const discount = parseInt(sessionStorage.getItem('discountValue')) || 0;
                        const name = sessionStorage.getItem('name');
                        const phone = sessionStorage.getItem('phone');
                        //giải thóng sessionStorage
                        sessionStorage.removeItem('selectedCartItems');
                        sessionStorage.removeItem('shippingFee');
                        sessionStorage.removeItem('shippingAddress');
                        sessionStorage.removeItem('discountCode');
                        sessionStorage.removeItem('discountValue');
                        sessionStorage.removeItem('name');
                        sessionStorage.removeItem('phone');

                        const currentSubtotal = cartData.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
                        const hardcodedShippingMethod = shippingFee === 20000 ? 'standard' : 'express';
                        // const discount = (currentSubtotal * discountValue) / 100;
                        const finalAmountFromVnpay = parseInt(paramsObject.vnp_Amount) / 100 - discount;
                        const orderDetails = {
                            orderItems: cartData.map((item) => ({
                                product: item.productId,
                                quantity: item.quantity,
                                price: item.unitPrice,
                            })),
                            shippingAddress: shippingAddress,
                            phone: phone,
                            name: name,
                            shippingMethod: hardcodedShippingMethod,
                            shippingFee: shippingFee,
                            totalPrice: currentSubtotal,
                            totalAmount: Math.max(finalAmountFromVnpay, 0),
                            discountCode: discountCode,
                            discount: discount,
                            paymentMethod: 'vnpay',
                            paymentStatus: 'completed',
                            orderStatus: 'processing',
                            // vnpTransactionRef: paramsObject.vnp_TxnRef,
                        };

                        // 4. tạo order
                        // console.log('Creating order with data:', orderDetails);
                        const orderResponse = await orderService.createOrder(orderDetails);

                        if (orderResponse.success && orderResponse.order?._id) {
                            window.dispatchEvent(new Event('cartUpdated'));
                            setStatus('success');
                            setMessage('Thanh toán và đặt hàng thành công! Cảm ơn bạn.');
                            setCreatedOrderId(orderResponse.order._id);
                        } else {
                            throw new Error(orderResponse.message || 'Không thể tạo đơn hàng sau khi thanh toán.');
                        }
                    } catch (orderError) {
                        console.error('Error creating order after VNPay success:', orderError);
                        setStatus('error');
                        setMessage(
                            `Thanh toán VNPay thành công nhưng đã xảy ra lỗi khi tạo đơn hàng: ${
                                orderError.message || 'Lỗi không xác định'
                            }. Vui lòng liên hệ hỗ trợ.`,
                        );
                    }
                } else {
                    // xác nhận thất bại
                    setStatus('error');
                    setMessage(verificationResponse.message || 'Thanh toán không thành công hoặc chữ ký không hợp lệ.');
                    setDetails({
                        vnpTxnRef: paramsObject.vnp_TxnRef,
                        responseCode: paramsObject.vnp_ResponseCode,
                    });
                }
            } catch (verifyError) {
                console.error('Error verifying VNPay return:', verifyError);
                setStatus('error');
                setMessage('Đã xảy ra lỗi trong quá trình xác thực thanh toán.');
                setDetails({ vnpTxnRef: paramsObject.vnp_TxnRef });
            }
        };

        processPaymentReturn();
    }, [location, navigate]);

    const renderIcon = () => {
        if (status === 'loading' || status === 'verifying' || status === 'processing_order') return faSpinner;
        if (status === 'success') return faCheckCircle;
        return faTimesCircle; // error
    };

    return (
        <div className={cx('wrapper')}>
            <FontAwesomeIcon
                icon={renderIcon()}
                className={cx('icon', status)}
                spin={status === 'loading' || status === 'verifying' || status === 'processing_order'}
            />
            <h1 className={cx('title')}>
                {status === 'success' && 'Thanh toán và Đặt hàng thành công'}
                {status === 'error' && 'Giao dịch thất bại'}
                {(status === 'loading' || status === 'verifying' || status === 'processing_order') &&
                    'Đang xử lý giao dịch'}
            </h1>
            <p className={cx('message')}>{message}</p>

            {details && (
                <div className={cx('details')}>
                    <p>
                        Mã giao dịch VNPay: <code>{details.vnpTxnRef}</code>
                    </p>
                    {createdOrderId && (
                        <p>
                            Mã đơn hàng: <code>{createdOrderId}</code>
                        </p>
                    )}
                    {details.amount && (
                        <p>
                            Số tiền: <code>{details.amount.toLocaleString()} VND</code>
                        </p>
                    )}
                    {details.bank && (
                        <p>
                            Ngân hàng: <code>{details.bank}</code>
                        </p>
                    )}
                    {details.responseCode && (
                        <p>
                            Mã lỗi VNPay: <code>{details.responseCode}</code>
                        </p>
                    )}
                </div>
            )}

            <div className={cx('actions')}>
                <Link to="/">
                    <Button outline>Về trang chủ</Button>
                </Link>
                {status === 'success' && (
                    <Link to={`/orders/${createdOrderId || ''}`}>
                        <Button primary>Xem chi tiết đơn hàng</Button>
                    </Link>
                )}
                {status === 'error' && message !== 'URL trả về không hợp lệ hoặc thiếu thông tin.' && (
                    <Link to={`/checkout`}>
                        <Button primary>Thử lại thanh toán</Button>
                    </Link>
                )}
            </div>
        </div>
    );
}

export default PaymentReturn;
