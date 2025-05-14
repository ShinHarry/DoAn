// import Header from '~/layouts/components/Header';

// function HeaderOnly({ children }) {
//     return (
//         <div>
//             <Header />
//             <div className="container">
//                 <div className="content">{children}</div>
//             </div>
//         </div>
//     );
// }

// export default HeaderOnly;
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { logout } from '~/redux/actions/authActions';
import { useDispatch } from 'react-redux';
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import 'tippy.js/dist/tippy.css';
import config from '~/config';
import Button from '~/components/Button';
import styles from './HeaderAdmin.module.scss';
import images from '~/assets/images';
import Menu from '~/components/Popper/Menu';
import Image from '~/components/Image';
import { useEffect, useState } from 'react';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function HeaderAdmin() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [userData, setUserData] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUser) {
            try {
                setUserData(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse user data:', error);
            }
        }
        setUserLoading(false);
    }, []);

    const currentUser = !!userData;
    const userId = userData?.id;
    const avatar = userData?.avatar;

    const handleLogout = () => {
        try {
            dispatch(logout());
            setUserData(null);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Đã xảy ra lỗi khi đăng xuất.');
        }
    };

    const userMenu = [
        {
            icon: <FontAwesomeIcon icon={faUser} />,
            title: 'Thông tin cá nhân',
            to: `/profile/${userId}`,
        },
        {
            icon: <FontAwesomeIcon icon={faSignOutAlt} />,
            title: 'Đăng xuất',
            separate: true,
            onClick: handleLogout,
        },
    ];

    return (
        <header className={cx('wrapper')}>
            <div className={cx('inner')}>
                <Link to={config.routes.admindashboard} className={cx('logo-link')}>
                    <img src={images.logo} alt="Logo" />
                </Link>

                <div className={cx('actions')}>
                    {!currentUser && (
                        <Button primary to="/login">
                            Log in
                        </Button>
                    )}
                    <ToastContainer
                        position="top-center"
                        autoClose={3000} // Tự động tắt
                        hideProgressBar={true} //  thanh tiến trình
                        newestOnTop={false} //Toast mới sẽ hiện dưới các toast cũ.
                        closeOnClick //Cho phép đóng toast
                        draggable // kéo
                    />
                    {!userLoading && (
                        <Menu items={currentUser ? userMenu : []}>
                            {currentUser && <Image className={cx('user-avatar')} src={avatar} alt="Avatar User" />}
                        </Menu>
                    )}
                </div>
            </div>
        </header>
    );
}

export default HeaderAdmin;
