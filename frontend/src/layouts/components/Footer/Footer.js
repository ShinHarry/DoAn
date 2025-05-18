import React from 'react';
import classNames from 'classnames/bind';
import styles from './Footer.module.scss';

import images from '~/assets/images';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);
const Footer = () => {
    return (
        <>
            <div className={cx('wrapper')}>
                <div className={cx('container')}>
                    <div className={cx('footer-item')}>
                        <div className={cx('footer-item-description')}>
                            <img src={images.logo} alt="Logo" />
                            <a href="google.com">
                                <h3>SMarket - Thiên đường công nghệ</h3>
                            </a>
                        </div>
                    </div>
                    <div className={cx('footer-item')}>
                        <div className={cx('footer-item-description')}>
                            <h3>Các danh mục</h3>
                            <Link to="/category/660000000000000000000001">
                                <span>Laptop</span>
                            </Link>
                            <Link to="/category/660000000000000000000002">
                                <span>Điện thoại</span>
                            </Link>
                            <Link to="/category/682986e0fea2b56fb6e5faef">
                                <span>PC</span>
                            </Link>
                            <Link to="/category/682985cafea2b56fb6e5faaa">
                                <span>Thiết bị điện tử</span>
                            </Link>
                            <Link to="/category/6829874bfea2b56fb6e5faf7">
                                <span>Bàn phím</span>
                            </Link>
                            <Link to="/category/6829882bfea2b56fb6e62201">
                                <span>Tai nghe</span>
                            </Link>
                        </div>
                    </div>
                    <div className={cx('footer-item')}>
                        <div className={cx('footer-item-description')}>
                            <h3>Chăm sóc khách hàng</h3>
                            <span>Luôn có nhân viên trực giải đáp mọi thắc mắc</span>
                            <span>Liên hệ hotline CSKH: 0979341723</span>
                            <span>Liên hệ mail CSKH: quan90923@st.vimaru.edu.vn</span>
                            <span>Địa chỉ: 484 Lạch Tray, Đằng Giang, Ngô Quyền, Hải Phòng</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Footer;
