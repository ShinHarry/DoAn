import React from "react";
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as orderService from '~/services/orderService';

import classNames from "classnames/bind";
import styles from "./Order.module.scss";

const cx = classNames.bind(styles);

function Order() {

    const [orders, setOrders] = useState([]);

    const getToken = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return null;
        try {
            const decoded = jwtDecode(token);
            return {
                userId: decoded.userId,
                userRole: decoded.userRole,
                avatar: decoded.userAvatar || null,
            };
        } catch (error) {
             console.error('Token decode error:', error);
            return null;
        }
    };
    
    const { userId, avatar } = getToken() || {};


    useEffect(() => {
      const fetchOrders = async () => {
        try {
          const response = await orderService.getOrder(userId);
          console.log(response)
          setOrders(response);
        } catch (error) {
          console.error("Lỗi khi lấy đơn hàng:", error);
        }
      };
  
      fetchOrders();
    }, []);


  return (
    <div className={cx("wrapper")}>
        <br/>
      <h2 className={cx("title")}>Danh sách đơn hàng</h2>
      <div className={cx("table-wrapper")}>
        <table className={cx("order-table")}>
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
            {orders.map((order, index) => (
              <tr key={index}>
                <td>{order.name}</td>
                <td>{order.address}</td>
                <td>{order.phone}</td>
                <td>{order._id}</td>
                <td>{new Date(order.date).toLocaleDateString('vi-VN')}</td>
                <td>{order.totalAmount.toLocaleString()} VNĐ</td>
                <td>
                  <span className={cx("status", {
                    processing: order.orderStatus === "processing",
                    confirmed: order.orderStatus === "confirmed",
                    shipped: order.orderStatus === "shipped",
                    completed: order.orderStatus === "completed",
                    cancelled: order.orderStatus === "cancelled",
                  })}>
                    {order.orderStatus}
                  </span>
                </td>
                <td>
                  <button className={cx("detail-btn")}>Xem chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Order;
