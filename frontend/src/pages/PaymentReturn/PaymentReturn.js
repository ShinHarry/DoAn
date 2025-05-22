import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './PaymentReturn.module.scss';
import Button from '~/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import * as paymentService from '~/services/paymentService';
import * as orderService from '~/services/orderService';
import { fetchUser } from '~/redux/actions/authActions';
import { useDispatch, useSelector } from 'react-redux';

import { clearCart } from '~/redux/slices/cartSlice';

const cx = classNames.bind(styles);

function PaymentReturn() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Đang xác thực thanh toán...');
    const [details, setDetails] = useState(null);
    const [createdOrderId, setCreatedOrderId] = useState(null);
    const currentUser = useSelector((state) => state.auth.login.currentUser);

    // Fetch user nếu chưa có
    useEffect(() => {
        if (!currentUser) {
            dispatch(fetchUser());
        }
    }, [currentUser, dispatch]);

    // Xử lý khi currentUser đã sẵn sàng
    useEffect(() => {
        const processPaymentReturn = async () => {
            if (!currentUser?.user?._id) return; // Đảm bảo có user trước khi tiếp tục

            setStatus('verifying');
            const queryParams = new URLSearchParams(location.search);
            const paramsObject = Object.fromEntries(queryParams.entries());

            if (!paramsObject.vnp_TxnRef || !paramsObject.vnp_ResponseCode || !paramsObject.vnp_SecureHash) {
                setStatus('error');
                setMessage('URL trả về không hợp lệ hoặc thiếu thông tin.');
                return;
            }

            try {
                const verificationResponse = await paymentService.verifyVnpayReturn(paramsObject);

                if (verificationResponse.success && verificationResponse.code === '00') {
                    setStatus('processing_order');
                    setMessage('Xác thực thành công. Đang tạo đơn hàng...');
                    setDetails({
                        vnpTxnRef: paramsObject.vnp_TxnRef,
                        amount: paramsObject.vnp_Amount / 100,
                        bank: paramsObject.vnp_BankCode,
                    });

                    try {
                        const cartData = JSON.parse(sessionStorage.getItem('selectedCartItems'));
                        if (!cartData || cartData.length === 0) {
                            throw new Error('Không tìm thấy giỏ hàng hoặc giỏ hàng trống để tạo đơn hàng.');
                        }

                        const userId = currentUser?.user?._id;
                        if (!userId) {
                            throw new Error('Không tìm thấy thông tin người dùng.');
                        }

                        const shippingFee = parseInt(sessionStorage.getItem('shippingFee')) || 0;
                        const shippingAddress = sessionStorage.getItem('shippingAddress');
                        const discountValue = parseInt(sessionStorage.getItem('discountValue')) || 0;
                        const name = sessionStorage.getItem('name');
                        const phone = sessionStorage.getItem('phone');

                        sessionStorage.removeItem('selectedCartItems');
                        sessionStorage.removeItem('shippingFee');
                        sessionStorage.removeItem('shippingAddress');
                        sessionStorage.removeItem('discountValue');
                        sessionStorage.removeItem('name');
                        sessionStorage.removeItem('phone');

                        const currentSubtotal = cartData.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
                        const hardcodedShippingMethod = shippingFee === 20000 ? 'standard' : 'express';
                        const discount = (currentSubtotal * discountValue) / 100;
                        const finalAmountFromVnpay = parseInt(paramsObject.vnp_Amount) / 100 - discount;

                        const orderDetails = {
                            orderItems: cartData.map((item) => ({
                                product: item.productId,
                                quantity: item.quantity,
                                price: item.unitPrice,
                            })),
                            shippingAddress,
                            phone,
                            name,
                            shippingMethod: hardcodedShippingMethod,
                            shippingFee,
                            totalPrice: currentSubtotal,
                            totalAmount: finalAmountFromVnpay,
                            discount,
                            paymentMethod: 'vnpay',
                            user: userId,
                            paymentStatus: 'completed',
                            orderStatus: 'processing',
                            vnpTransactionRef: paramsObject.vnp_TxnRef,
                        };

                        const orderResponse = await orderService.createOrder(orderDetails);

                        if (orderResponse.success && orderResponse.order?._id) {
                            // window.dispatchEvent(new Event('cartUpdated'));
                            // setStatus('success');
                            // setMessage('Thanh toán và đặt hàng thành công! Cảm ơn bạn.');
                            // setCreatedOrderId(orderResponse.order._id);
                            dispatch(clearCart()); // Xóa cart trong Redux
                            localStorage.removeItem('cart'); // Xóa luôn nếu bạn lưu cart ở localStorage (nếu có)
                            window.dispatchEvent(new Event('cartUpdated'));
                            setStatus('success');
                            setMessage('Thanh toán và đặt hàng thành công! Cảm ơn bạn.');
                            setCreatedOrderId(orderResponse.order._id);
                        } else {
                            throw new Error(orderResponse.message || 'Không thể tạo đơn hàng sau khi thanh toán.');
                        }
                    } catch (orderError) {
                        console.error('Lỗi khi tạo đơn hàng:', orderError);
                        setStatus('error');
                        setMessage(
                            `Thanh toán VNPay thành công nhưng lỗi khi tạo đơn hàng: ${
                                orderError.message || 'Không rõ nguyên nhân'
                            }.`,
                        );
                    }
                } else {
                    setStatus('error');
                    setMessage(verificationResponse.message || 'Thanh toán không thành công hoặc chữ ký không hợp lệ.');
                    setDetails({
                        vnpTxnRef: paramsObject.vnp_TxnRef,
                        responseCode: paramsObject.vnp_ResponseCode,
                    });
                }
            } catch (verifyError) {
                console.error('Lỗi xác thực VNPay:', verifyError);
                setStatus('error');
                setMessage('Đã xảy ra lỗi khi xác thực thanh toán.');
                setDetails({ vnpTxnRef: paramsObject.vnp_TxnRef });
            }
        };

        if (currentUser?.user?._id) {
            processPaymentReturn();
        }
    }, [currentUser, location]);

    const renderIcon = () => {
        if (status === 'loading' || status === 'verifying' || status === 'processing_order') return faSpinner;
        if (status === 'success') return faCheckCircle;
        return faTimesCircle;
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
