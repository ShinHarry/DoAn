import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as orderService from '~/services/orderService';
import { FiX } from 'react-icons/fi'; // Icon đóng
import styles from './OrderDetail.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function OrderDetail() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);

    const handleCancelOrder = async () => {
        if (window.confirm('Bạn có chắc chắn muốn huỷ đơn hàng này?')) {
            try {
                // await orderService.cancelOrder(orderId);
                alert('Yêu cầu huỷ đơn hàng đã được gửi.');
                navigate('/orders');
            } catch (error) {
                console.error('Lỗi huỷ đơn hàng:', error);
                alert('Không thể huỷ đơn hàng. Vui lòng thử lại sau.');
            }
        }
    };
    
    //gọi API lấy chi tiết đơn hàng từ backend
    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                console.log(orderId)
                const response = await orderService.getOrderDetail(orderId);
                console.log(response)
                setOrder(response);
            } catch (error) {
                console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
            }
        };
        fetchOrderDetail();
    }, []);

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
                        <p>Giá: {item.unitPrice.toLocaleString()} VNĐ - Tổng: {(item.quantity * item.unitPrice).toLocaleString()} VNĐ</p>
                    </div>
                </li>
                
                ))}
            </ul>
            {order.orderStatus === 'processing' && (
                <div className={cx('cancel-wrapper')}>
                    <button
                        className={cx('cancel-btn')}
                        onClick={handleCancelOrder}
                    >
                        Yêu cầu huỷ đơn hàng
                    </button>
                </div>
            )}
        </div>
      
    );
}

export default OrderDetail;
