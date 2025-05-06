import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './PaymentReturn.module.scss';
import Button from '~/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import * as paymentService from '~/services/paymentService';
import * as orderService from '~/services/orderService';
import * as cartService from '~/services/cartService';
import * as userService from '~/services/userService';

const cx = classNames.bind(styles);

function PaymentReturn() {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, verifying, processing_order, success, error
    const [message, setMessage] = useState('Đang xác thực thanh toán...');
    const [details, setDetails] = useState(true);
    const [createdOrderId, setCreatedOrderId] = useState(null);


    return (
        <div className={cx('wrapper')}>
            <FontAwesomeIcon 
                icon={faCheckCircle} 
                className={cx('icon', status)} 
                spin={status === 'loading' || status === 'verifying' || status === 'processing_order'} 
            />
            <h1 className={cx('title')}>
                {status === 'success' && 'Thanh toán và Đặt hàng thành công'}
                {status === 'error' && 'Giao dịch thất bại'}
                {(status === 'loading' || status === 'verifying' || status === 'processing_order') && 'Đang xử lý giao dịch'}
            </h1>
            <p className={cx('message')}>{message}</p>
            
            {details && (
                 <div className={cx('details')}>
                    <p>Mã giao dịch VNPay: <code></code></p>
                    {<p>Mã đơn hàng: <code></code></p>}
                    {<p>Số tiền: <code>VND</code></p>}
                    {<p>Ngân hàng: <code></code></p>}
                    {<p>Mã lỗi VNPay: <code></code></p>}
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