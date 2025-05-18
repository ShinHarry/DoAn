import React from 'react';
import classNames from 'classnames/bind';
import styles from './Infor.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faTruckFast, faComment } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
const Infor = () => {
    return (
        <>
            <div className={cx('wrapper')}>
                <div className={cx('container')}>
                    <div className={cx('Infor-item')}>
                        <FontAwesomeIcon icon={faTruckFast} className={cx('Infor-icon')} />
                        <div className={cx('Infor-item-description')}>
                            <h3>Giao hàng nhanh chóng</h3>
                            <span>Giao hàng nhanh chóng mọi lúc mọi nơi</span>
                        </div>
                    </div>
                    <div className={cx('Infor-item')}>
                        <FontAwesomeIcon icon={faCreditCard} className={cx('Infor-icon')} />

                        <div className={cx('Infor-item-description')}>
                            <h3>Phương thức thanh toán</h3>
                            <span>Đa dạng các thương thức thanh toán</span>
                        </div>
                    </div>
                    <div className={cx('Infor-item')}>
                        <FontAwesomeIcon icon={faComment} className={cx('Infor-icon')} />
                        <div className={cx('Infor-item-description')}>
                            <h3>Chăm sóc khách hàng</h3>
                            <span>Luôn có nhân viên trực giải đáp mọi thắc mắc</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Infor;
