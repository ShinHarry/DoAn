import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faKeyboard,
    faUser,
    faLaptop,
    faDesktop,
    faHeadphones,
    faBoxes,
    faLocationDot,
    faPlus,
    faSignOutAlt,
    faImage,
    faMobilePhone,

} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { jwtDecode } from 'jwt-decode';
import config from '~/config';
import Button from '~/components/Button';
import styles from './Header.module.scss';
import images from '~/assets/images';
import Menu from '~/components/Popper/Menu';
import { InboxIcon, CartIcons, BarsIcon, ComponentElectronicIcon } from '~/components/Icons';
import Image from '~/components/Image';
import Search from '../Search';
import * as categoryService from '~/services/categoryService';
import { useEffect, useState } from 'react';


const cx = classNames.bind(styles);

function Header() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categoryMap, setCategoryMap] = useState({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoryData = await categoryService.getCategories();
                const map = {};
                categoryData.forEach((cat) => {
                    map[cat.nameCategory.trim()] = cat._id;
                });
                setCategoryMap(map);
                setLoading(true);
            } catch (error) {
                setError('Không thể tải danh mục. Vui lòng thử lại.');
                setLoading(true);
            }
        };
        fetchCategories();
    }, []);

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
    console.log('userId:', userId);
    console.log('avatarUser:', avatar);

    const currentUser = !!userId;
    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.reload();
    };
    const MENU_ITEMS = [
        {
            icon: <FontAwesomeIcon icon={faLaptop} />,
            title: 'Laptop',
            to: `/category/${categoryMap['Laptop'] || ''}`,
        },
        {
            icon: <FontAwesomeIcon icon={faMobilePhone} />,
            title: 'Điện thoại',
            to: `/category/${categoryMap['Điện thoại'] || ''}`,
        },
        {
            icon: <FontAwesomeIcon icon={faDesktop} />,
            title: 'PC',
            to: `/category/${categoryMap['PC'] || ''}`,
        },
        {
            icon: <ComponentElectronicIcon />,
            title: 'Electronic devices',
            to: `/category/${categoryMap['Electronic devices'] || ''}`,
        },
        {
            icon: <FontAwesomeIcon icon={faKeyboard} />,
            title: 'Keyboards',
            to: `/category/${categoryMap['Keyboards'] || ''}`,
        },
        {
            icon: <FontAwesomeIcon icon={faHeadphones} />,
            title: 'Headphones',
            to: `/category/${categoryMap['Headphones'] || ''}`,
        },
    ];

    const userMenu = [
        {
            icon: <FontAwesomeIcon icon={faUser} />,
            title: 'Thông tin cá nhân',
            to: `/profile/${userId}`,
        },
        {
            icon: <FontAwesomeIcon icon={faBoxes} />,
            title: 'Đơn hàng của tôi',
            to: '/order',
        },
        {
            icon: <FontAwesomeIcon icon={faLocationDot} />,
            title: 'Sổ địa chỉ',
            to: '/address',
        },
        {
            icon: <FontAwesomeIcon icon={faPlus} />,
            title: 'Thêm sản phẩm',
            to: '/addProduct',
        },
        {
            icon: <FontAwesomeIcon icon={faImage} />,
            title: 'Banner',
            to: '/new',
        },
        {
            icon: <FontAwesomeIcon icon={faSignOutAlt} />, // thêm icon logout
            icon: <FontAwesomeIcon icon={faSignOutAlt} />,
            title: 'Đăng xuất',
            separate: true,
            onClick: handleLogout,
        },
    ];

    return (
        <header className={cx('wrapper')}>
            {!error && !loading ? (
                <div className={cx('loading')}>Loading...</div>
            ) : (
                <div className={cx('inner')}>
                    <Link to={config.routes.home} className={cx('logo-link')}>
                        <img src={images.logo} alt="Logo" />
                    </Link>
                    <Menu items={MENU_ITEMS}>
                        <button className={cx('action-btn')}>
                            <BarsIcon />
                        </button>
                    </Menu>
                    <Search />

                    <div className={cx('actions')}>
                        {currentUser ? (
                            <>
                                <Tippy delay={[0, 50]} content="Thông báo" placement="bottom">
                                    <button className={cx('action-btn')}>
                                        <InboxIcon />
                                        {/* <span className={cx('badge')}>12</span> */}
                                    </button>
                                </Tippy>
                            </>
                        ) : (
                            <>
                                <Button primary to="/login">
                                    Log in
                                </Button>
                            </>
                        )}

                        <Menu items={currentUser ? userMenu : MENU_ITEMS}>
                            {currentUser ? (
                                <Image className={cx('user-avatar')} src={avatar} alt="Avatar User" />
                            ) : (
                                <></>
                            )}
                        </Menu>
                        <Tippy delay={[0, 50]} content="Giỏ hàng" placement="bottom">
                            <button className={cx('action-btn')}>
                                <CartIcons />
                            </button>
                        </Tippy>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;
