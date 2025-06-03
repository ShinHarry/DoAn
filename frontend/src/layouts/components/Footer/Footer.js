import React from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadset } from '@fortawesome/free-solid-svg-icons';
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
                            <Link to="/">
                                <h3>SMarket - Thiên đường công nghệ</h3>
                            </Link>
                            <div className={cx('call-us-container')}>
                                <FontAwesomeIcon icon={faHeadset} className={cx('call-us-icon')} />
                                <div className={cx('call-us-info')}>
                                    <span className={cx('call-us-title')}>Liên hệ với chúng tôi</span>
                                    <span className={cx('call-us-text')}>0362025195</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={cx('footer-item')}>
                        <div className={cx('footer-item-description')}>
                            <h3>Các danh mục</h3>
                            <Link to="/category/682ebe2b9559c47cf91c0cd7">
                                <span>Laptop</span>
                            </Link>
                            <Link to="/category/682ebe529559c47cf91c0cdb">
                                <span>Điện thoại</span>
                            </Link>
                            <Link to="/category/682ebf239559c47cf91c0ce5">
                                <span>PC</span>
                            </Link>
                            <Link to="/category/682ebf129559c47cf91c0ce1">
                                <span>Thiết bị điện tử</span>
                            </Link>
                            <Link to="/category/682ebf389559c47cf91c0ce9">
                                <span>Bàn phím</span>
                            </Link>
                            <Link to="/category/6831bb0865e0ec03ef98b86d">
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
