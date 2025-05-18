import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as orderService from '~/services/orderService';
import { FiX } from 'react-icons/fi';
import styles from './OrderDetail.module.scss';
import classNames from 'classnames/bind';
import Swal from 'sweetalert2';

const cx = classNames.bind(styles);

function OrderDetail() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isRating, setIsRating] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);

    const handleCancelOrder = async () => {
        const result = await Swal.fire({
            title: 'Xác nhận huỷ đơn hàng?',
            text: 'Bạn sẽ không thể hoàn tác thao tác này!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Huỷ đơn hàng',
            cancelButtonText: 'Đóng',
        });

        if (result.isConfirmed) {
            try {
                setIsCancelling(true);
                await orderService.updateOrderStatus(orderId, 'cancelled');
                setOrder((prev) => ({
                    ...prev,
                    orderStatus: 'cancelled',
                }));

                Swal.fire('Đã huỷ!', 'Đơn hàng của bạn đã được huỷ.', 'success');
            } catch (error) {
                console.error('Lỗi huỷ đơn hàng:', error);
                Swal.fire('Lỗi!', 'Không thể huỷ đơn hàng. Vui lòng thử lại sau.', 'error');
            } finally {
                setIsCancelling(false);
            }
        }
    };

    // const handleCancelOrder = async () => {
    //     if (window.confirm('Bạn có chắc chắn muốn huỷ đơn hàng này?')) {
    //         try {
    //             setIsCancelling(true);
    //             await orderService.updateOrderStatus(orderId, 'cancelled');
    //             setOrder((prev) => ({
    //                 ...prev,
    //                 orderStatus: 'cancelled',
    //             }));
    //         } catch (error) {
    //             console.error('Lỗi huỷ đơn hàng:', error);
    //             alert('Không thể huỷ đơn hàng. Vui lòng thử lại sau.');
    //         } finally {
    //             setIsCancelling(false);
    //         }
    //     }
    // };

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const response = await orderService.getOrderDetail(orderId);
                setOrder(response);
            } catch (error) {
                console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
            }
        };
        fetchOrderDetail();
    }, [orderId]);

    if (!order) return <p>Đang tải...</p>;

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h2>Chi tiết đơn hàng #{order._id}</h2>
                <button className={cx('close-btn')} onClick={() => navigate('/orders')}>
                    <FiX size={24} />
                </button>
            </div>

            <p>
                <strong>Người đặt:</strong> {order.user}
            </p>
            <p>
                <strong>Số điện thoại:</strong> {order.phone}
            </p>
            <p>
                <strong>Địa chỉ:</strong> {order.address}
            </p>
            <p>
                <strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString()}
            </p>
            <p>
                <strong>Trạng thái đơn hàng:</strong> {order.orderStatus}
            </p>
            <p>
                <strong>Tổng tiền:</strong> {order.totalAmount != null ? order.totalAmount.toLocaleString() : 'N/A'} VNĐ
            </p>
            <p>
                <strong>Phương thức thanh toán:</strong> {order.paymentMethod}
            </p>
            <p>
                <strong>Trạng thái thanh toán:</strong> {order.paymentStatus}
            </p>

            <h3>Sản phẩm:</h3>
            <ul>
                {Array.isArray(order.items) &&
                    order.items.map((item, idx) => (
                        <li key={idx}>
                            <img src={item.productImage} alt={item.productName} width={50} height={50} />
                            <p>
                                {item.productName} - SL: {item.quantity} - Giá: {item.unitPrice.toLocaleString()} VNĐ -
                                Tổng: {(item.quantity * item.unitPrice).toLocaleString()} VNĐ
                            </p>
                        </li>
                    ))}
            </ul>

            {order.orderStatus === 'completed' && (
                <div className={cx('rating-wrapper')}>
                    {!isRating && !order.hasRated ? (
                        <button onClick={() => setIsRating(true)} className={cx('rate-btn')}>
                            Đánh giá đơn hàng
                        </button>
                    ) : order.hasRated ? (
                        <button className={cx('rated-btn')} disabled>
                            Đã đánh giá
                        </button>
                    ) : (
                        <div className={cx('rating-box')}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={cx('star', { active: selectedRating >= star })}
                                    onClick={() => setSelectedRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                            <button
                                onClick={async () => {
                                    try {
                                        await orderService.submitRating(orderId, selectedRating);
                                        alert('Cảm ơn bạn đã đánh giá!');
                                        setIsRating(false);
                                        // Update order.hasRated = true locally
                                        setOrder((prev) => ({ ...prev, hasRated: true }));
                                    } catch (err) {
                                        console.error(err);
                                        alert('Lỗi khi gửi đánh giá');
                                    }
                                }}
                                className={cx('submit-btn')}
                            >
                                Xác nhận
                            </button>
                        </div>
                    )}
                </div>
            )}

            {(order.orderStatus === 'processing' || order.orderStatus === 'cancelled') && (
                <div className={cx('cancel-wrapper')}>
                    <button
                        className={cx('cancel-btn')}
                        onClick={handleCancelOrder}
                        disabled={order.orderStatus === 'cancelled' || isCancelling}
                    >
                        {order.orderStatus === 'cancelled' ? 'Đã huỷ' : 'Huỷ đơn hàng'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default OrderDetail;
