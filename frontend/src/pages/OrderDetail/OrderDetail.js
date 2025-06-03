import {Link, useParams, useNavigate } from 'react-router-dom';
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
    const [feedbackText, setFeedbackText] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');

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

const handleConfirmReceived = async () => {
        const result = await Swal.fire({
    title: 'Xác nhận đã nhận hàng?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Đã nhận',
    cancelButtonText: 'Đóng',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
});

if (result.isConfirmed) {

            try {
                await orderService.updateOrderStatus(orderId, 'completed');
                setOrder((prev) => ({
                    ...prev,
                    orderStatus: 'completed',
                }));
            } catch (error) {
                console.error('Lỗi khi xác nhận đã nhận hàng:', error);
                Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'error',
    title: 'Không thể cập nhật trạng thái đơn hàng.',
    showConfirmButton: false,
    timer: 3000
});

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

            <p><strong>Người đặt:</strong> {order.name}</p>
            <p><strong>Số điện thoại:</strong> {order.phone}</p> {/* Thêm trường phone */}
            <p><strong>Địa chỉ:</strong> {order.address}</p>
            <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Trạng thái đơn hàng:</strong> {order.orderStatus}</p>
            <p><strong>Tạm tính:</strong> {order.subTotalPrice != null ? order.subTotalPrice.toLocaleString() : 'N/A'} VNĐ</p>
            <p><strong>Giảm giá: -</strong> {order.discount != null ? order.discount.toLocaleString() : 'N/A'} VNĐ</p>
            <p><strong>Phí ship:</strong> {order.shippingFee != null ? order.shippingFee.toLocaleString() : 'N/A'} VNĐ</p>
            <p><strong>Tổng tiền:</strong> {order.totalAmount != null ? order.totalAmount.toLocaleString() : 'N/A'} VNĐ</p>
            <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod}</p>
            <p><strong>Trạng thái thanh toán:</strong> {order.paymentStatus}</p>

            <h3>Sản phẩm:</h3>
            <ul>
                {Array.isArray(order.items) && order.items.map((item, idx) => (
                    <li key={idx} className={cx('item-row')}>
                        <Link to={`/product/${item.productId}`}>
                            <img src={item.productImage} alt={item.productName} width={50} height={50} />
                        </Link>                  
                        <div className={cx('item-info')}>
                        <p>{item.productName} - SL: {item.quantity}</p>
                        <br/>
                        <p>Giá: {item.unitPrice.toLocaleString()} VNĐ - Tổng: {(item.quantity * item.unitPrice).toLocaleString()} VNĐ</p>
                    </div>
                </li>
                ))}
            </ul>
{(order.orderStatus === 'shipped' || order.orderStatus === 'confirm') && (
                <div className={cx('confirm-receive-wrapper')}>
                    <button
                        className={cx('receive-btn')}
                        onClick={handleConfirmReceived}
                        disabled={order.orderStatus === 'confirm'}
                    >
                        {order.orderStatus === 'confirm' ? 'Chờ vận chuyển' : 'Đã nhận được hàng'}
                    </button>
                </div>
            )}
            {order.orderStatus === 'completed' && (
                <div className={cx('rating-wrapper')}>
                    {!isRating && !order.hasRated ? (
                        <button onClick={() => {
                            setIsRating(true);
                            setSelectedProductId(order.items[0]?.productId || order.items[0]?.product?._id);
                        }} className={cx('rate-btn')}>
                            Đánh giá đơn hàng
                        </button>
                    ) : order.hasRated ? (
                        <button className={cx('rated-btn')} disabled>
                            Đã đánh giá
                        </button>
                    ) : (
                        <div className={cx('rating-box')}>
                            {order.items.length > 1 && (
                                <select
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    style={{ marginTop: '10px', padding: '8px', width: '100%', fontSize: '14px' }}
                                >
                                    {order.items.map((item, index) => {
                                        const pid = item.productId || item.product?._id;
                                        return (
                                            <option key={index} value={pid}>
                                                {item.productName}
                                            </option>
                                        );
                                    })}
                                </select>
                            )}

                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={cx('star', { active: selectedRating >= star })}
                                    onClick={() => setSelectedRating(star)}
                                    style={{ cursor: 'pointer', fontSize: '24px', color: selectedRating >= star ? '#ffc107' : '#e4e5e9' }}
                                >
                                    ★
                                </span>
                            ))}

                            <textarea
                                placeholder="Viết phản hồi của bạn về sản phẩm..."
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                rows={4}
                                style={{ width: '100%', marginTop: '10px', padding: '8px', fontSize: '14px' }}
                            />

                            <button
                                onClick={async () => {
                                    if (selectedRating === 0) {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Vui lòng chọn số sao đánh giá.',
        showConfirmButton: false,
        timer: 3000
    });
    return;
}
if (feedbackText.trim().length < 30) {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Phản hồi phải chứa ít nhất 30 ký tự.',
        showConfirmButton: false,
        timer: 3000
    });
    return;
}
if (!selectedProductId) {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Vui lòng chọn sản phẩm cần đánh giá.',
        showConfirmButton: false,
        timer: 3000
    });
    return;
}


                                    try {const productId = order.items[0]?.productId || order.items[0]?.product?._id;
    if (!productId) {
      alert('Không tìm thấy ID sản phẩm để gửi phản hồi');
      return;
    }
                                        await orderService.submitFeedback({
                                            product: selectedProductId,
                                            user: order.user,
                                            order: order._id,
                                            comment: feedbackText.trim(),
                                            rating: selectedRating,
                                        });

                                        await orderService.submitRating(orderId, selectedRating);

                                        Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: 'Cảm ơn bạn đã phản hồi!',
    showConfirmButton: false,
    timer: 3000
});

                                        setIsRating(false);
                                        setFeedbackText('');
                                        setSelectedRating(0);
                                        setSelectedProductId('');
                                        setOrder(prev => ({ ...prev, hasRated: true }));
                                    } catch (err) {
                                        console.error(err);
                                        Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'error',
    title: 'Lỗi khi gửi phản hồi',
    showConfirmButton: false,
    timer: 3000
});

                                    }
                                }}
                                className={cx('submit-btn')}
                                style={{ marginTop: '10px' }}
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
