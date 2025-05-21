import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as orderService from '~/services/orderService';

import classNames from 'classnames/bind';
import styles from './Order.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '~/redux/actions/authActions';

const cx = classNames.bind(styles);

function Order() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const handleViewDetail = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    const currentUser = useSelector((state) => state.auth.login.currentUser);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!currentUser) {
            dispatch(fetchUser());
        }
        const fetchOrders = async () => {
            try {
                const response = await orderService.getOrder(currentUser?.user?._id);
                const sortedOrders = [...response].sort((a, b) => new Date(b.date) - new Date(a.date));
                setOrders(sortedOrders);
                setFilteredOrders(sortedOrders);
            } catch (error) {
                console.error('Lỗi khi lấy đơn hàng:', error);
            }
        };
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let filtered = [...orders];

        if (statusFilter !== 'all') {
            filtered = filtered.filter((order) => order.orderStatus === statusFilter);
        }

        // Gộp lọc theo ngày và kiểm tra hợp lệ
        if (fromDate && toDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);
            if (from > to) {
                setFilteredOrders([]); // Từ ngày vượt quá đến ngày => không hợp lệ
                return;
            }
            filtered = filtered.filter((order) => {
                const orderDate = new Date(order.date);
                return orderDate >= from && orderDate <= to;
            });
        } else if (fromDate) {
            const from = new Date(fromDate);
            filtered = filtered.filter((order) => new Date(order.date) >= from);
        } else if (toDate) {
            const to = new Date(toDate);
            filtered = filtered.filter((order) => new Date(order.date) <= to);
        }

        if (searchTerm.trim() !== '') {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (order) =>
                    order.name?.toLowerCase().includes(lowerSearch) || order._id?.toLowerCase().includes(lowerSearch),
            );
        }

        setFilteredOrders(filtered);
    }, [orders, statusFilter, fromDate, toDate, searchTerm]);

    return (
        <div className={cx('wrapper')}>
            <br />
            <h2 className={cx('title')}>Danh sách đơn hàng</h2>
            <div className={cx('search-container')}>
                <input
                    type="text"
                    placeholder="Tìm theo tên hoặc mã đơn hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cx('search-input')}
                />
            </div>
            <div className={cx('filters')}>
                <label>
                    Trạng thái:&nbsp;
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="processing">processing</option>
                        <option value="confirmed">confirmed</option>
                        <option value="shipped">shipped</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                        <option value="returned">returned</option>
                    </select>
                </label>
                &nbsp;&nbsp;
                <label>
                    Từ ngày:&nbsp;
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </label>
                &nbsp;&nbsp;
                <label>
                    Đến ngày:&nbsp;
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </label>
            </div>

            <div className={cx('table-wrapper')}>
                <table className={cx('order-table')}>
                    <thead>
                        <tr>
                            <th>Người đặt</th>
                            <th>Địa chỉ</th>
                            <th>Điện thoại</th>
                            <th>Mã đơn</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order, index) => (
                            <tr key={index}>
                                <td>{order.name}</td>
                                <td>{order.address}</td>
                                <td>{order.phone}</td>
                                <td>{order._id}</td>
                                <td>{new Date(order.date).toLocaleDateString('vi-VN')}</td>
                                <td>{order.totalAmount.toLocaleString()} VNĐ</td>
                                <td>
                                    <span
                                        className={cx('status', {
                                            processing: order.orderStatus === 'processing',
                                            confirmed: order.orderStatus === 'confirmed',
                                            shipped: order.orderStatus === 'shipped',
                                            completed: order.orderStatus === 'completed',
                                            cancelled: order.orderStatus === 'cancelled',
                                            returned: order.orderStatus === 'returned',
                                        })}
                                    >
                                        {order.orderStatus}
                                    </span>
                                </td>
                                <td>
                                    <button className={cx('detail-btn')} onClick={() => handleViewDetail(order._id)}>
                                        Xem chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredOrders.length === 0 && (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center' }}>
                                    Không tìm thấy đơn hàng phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Order;
