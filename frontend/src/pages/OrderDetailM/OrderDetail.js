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

    const fetchOrderDetail = async () => {
        try {
            const response = await orderService.getOrderDetail(orderId);
            setOrder(response);
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
        }
    };

    useEffect(() => {
        fetchOrderDetail();
    }, []);

    const handleStatusUpdate = async () => {
        if (!order) return;

        let nextStatus = null;
        if (order.orderStatus === 'processing') nextStatus = 'confirmed';
        else if (order.orderStatus === 'confirmed') nextStatus = 'shipped';
        else if (order.orderStatus === 'shipped') nextStatus = 'completed';

        if (nextStatus) {
            try {
                await orderService.updateOrderStatus(order._id, nextStatus);
                setOrder(prev => ({ ...prev, orderStatus: nextStatus }));
            } catch (error) {
                console.error('Lỗi cập nhật trạng thái đơn hàng:', error);
                alert('Cập nhật trạng thái thất bại.');
            }
        }
    };

    const getButtonLabel = () => {
        switch (order?.orderStatus) {
            case 'processing':
                return 'Xác nhận';
            case 'confirmed':
                return 'Bắt đầu giao hàng';
            case 'shipped':
                return 'Khách đã nhận hàng';
            default:
                return '';
        }
    };

    if (!order) return <p>Đang tải...</p>;

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h2>Chi tiết đơn hàng #{order._id}</h2>
                <button className={cx('close-btn')} onClick={() => navigate('/moddashboard/orderManage')}>
                    <FiX size={24} />
                </button>
            </div>

            <p><strong>Người đặt:</strong> {order.name}</p>
            <p><strong>Số điện thoại:</strong> {order.phone}</p>
            <p><strong>Địa chỉ:</strong> {order.address}</p>
            <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Trạng thái đơn hàng:</strong> {order.orderStatus}</p>
            <p><strong>Tổng tiền:</strong> {order.totalAmount?.toLocaleString() ?? 'N/A'} VNĐ</p>
            <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod}</p>
            <p><strong>Trạng thái thanh toán:</strong> {order.paymentStatus}</p>

            <h3>Sản phẩm:</h3>
            <ul>
                {Array.isArray(order.items) && order.items.map((item, idx) => (
                    <li key={idx}>
                        <img src={item.productImage} alt={item.productName} width={50} height={50} />
                        <p>{item.productName} - SL: {item.quantity} - Giá: {item.unitPrice.toLocaleString()} VNĐ - Tổng: {(item.quantity * item.unitPrice).toLocaleString()} VNĐ</p>
                    </li>
                ))}
            </ul>

            {order.orderStatus !== 'cancelled' && (
  <div className={cx('action-wrapper')}>
    <button
      className={cx('status-btn')}
      onClick={handleStatusUpdate}
      disabled={order.orderStatus === 'returned' || order.orderStatus === 'completed'}
    >
      {order.orderStatus === 'returned' || order.orderStatus === 'completed'
        ? 'Xác nhận'
        : getButtonLabel()}
    </button>


<button
  className={cx('return-btn')}
  disabled={
    order.orderStatus !== 'completed' &&
    order.orderStatus !== 'shipped'
  }
  onClick={async () => {
    let confirmMsg = '';
    let nextStatus = '';
    let newPaymentStatus = order.paymentStatus;

    if (order.orderStatus === 'completed') {
      confirmMsg = 'Xác nhận đánh dấu đơn này là hoàn trả?';
      nextStatus = 'returned';
    } else if (order.orderStatus === 'shipped') {
      confirmMsg = 'Khách không nhận hàng. Bạn có chắc muốn hủy đơn?';
      nextStatus = 'cancelled';
      newPaymentStatus = 'failed';
    }

    const result = await Swal.fire({
      title: 'Xác nhận hành động',
      text: confirmMsg,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Huỷ',
    });

    if (result.isConfirmed) {
      try {
        await orderService.updateOrderStatus(order._id, nextStatus, newPaymentStatus);
        setOrder(prev => ({
          ...prev,
          orderStatus: nextStatus,
          paymentStatus: newPaymentStatus
        }));

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Cập nhật trạng thái thành công',
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (error) {
        console.error('Lỗi cập nhật trạng thái đơn hàng:', error);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Không thể cập nhật trạng thái đơn hàng',
          showConfirmButton: false,
          timer: 2000,
        });
      }
    }
  }}
>
  {order.orderStatus === 'returned'
    ? 'Đã hoàn trả'
    : order.orderStatus === 'shipped'
    ? 'Khách không nhận hàng'
    : 'Đơn hoàn trả'}
</button>


  </div>
)}



        </div>
    );
}

export default OrderDetail;
