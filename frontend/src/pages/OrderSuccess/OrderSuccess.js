import React from 'react';
import { Link, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './OrderSuccess.module.scss';
import Button from '~/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'; 

const cx = classNames.bind(styles);

function OrderSuccess() {
    const { orderId } = useParams(); // lấy order ID từ URL parameter

    return (
        <div className={cx('wrapper')}>
            <FontAwesomeIcon icon={faCheckCircle} className={cx('icon')} />
            <h1 className={cx('title')}>Đặt hàng thành công!</h1>
            <p className={cx('message')}>
                Cảm ơn bạn đã mua hàng tại Smart Market. 
                Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
            </p>
            {orderId && (
                <p className={cx('orderId')}>
                    Mã đơn hàng của bạn là: <code>{orderId}</code>
                </p>
            )}
            <div className={cx('actions')}>
                <Link to="/">
                    <Button outline>Tiếp tục mua sắm</Button>
                </Link>
                <Link to="/order"> 
                    <Button primary>Xem đơn hàng của tôi</Button>
                </Link>
            </div>
        </div>
    );
}

export default OrderSuccess; 