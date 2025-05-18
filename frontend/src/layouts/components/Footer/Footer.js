import React from 'react';
import classNames from 'classnames/bind';
import styles from './Footer.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faTruckFast, faComment } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
const Footer = () => {
    return (
        <>
            <div className={cx('wrapper')}>
                <div className={cx('container')}>
                    <div className={cx('footer-item')}>
                        <FontAwesomeIcon icon={faTruckFast} className={cx('footer-icon')} />
                        <div className={cx('footer-item-description')}>
                            <a href="google.com">
                                <h3>Giao hàng nhanh chóng</h3>
                            </a>
                            <span>Giao hàng nhanh chóng mọi lúc mọi nơi</span>
                        </div>
                    </div>
                    <div className={cx('footer-item')}>
                        <FontAwesomeIcon icon={faCreditCard} className={cx('footer-icon')} />

                        <div className={cx('footer-item-description')}>
                            <a href="google.com">
                                <h3>Phương thức thanh toán</h3>
                            </a>
                            <span>Đa dạng các thương thức thanh toán</span>
                        </div>
                    </div>
                    <div className={cx('footer-item')}>
                        <FontAwesomeIcon icon={faComment} className={cx('footer-icon')} />
                        <div className={cx('footer-item-description')}>
                            <a href="google.com">
                                <h3>Chăm sóc khách hàng</h3>
                            </a>
                            <span>Luôn có nhân viên trực giải đáp mọi thắc mắc</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Footer;
