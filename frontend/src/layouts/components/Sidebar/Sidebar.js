import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import Menu, { MenuItem } from './Menu';
import { ProfileIcon, FileIcon, LocationIcon } from '~/components/Icons';
import { jwtDecode } from 'jwt-decode';

const cx = classNames.bind(styles);

function Sidebar() {
    const getToken = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) navigator('/login');
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
    const { userId } = getToken() || {};
    return (
        <aside className={cx('wrapper')}>
            <Menu>
                <MenuItem
                    title="Thông tin cá nhân"
                    to={`/profile/${userId}`}
                    icon={<ProfileIcon />}
                    activeIcon={<ProfileIcon />}
                />
                <MenuItem
                    title="Sổ địa chỉ"
                    to={`/profile/${userId}/address`}
                    icon={<LocationIcon />}
                    activeIcon={<LocationIcon />}
                />
                <MenuItem
                    title="Quên mật khẩu"
                    to={`/profile/${userId}/changepassword`}
                    icon={<FileIcon />}
                    activeIcon={<FileIcon />}
                />
            </Menu>
        </aside>
    );
}

export default Sidebar;
