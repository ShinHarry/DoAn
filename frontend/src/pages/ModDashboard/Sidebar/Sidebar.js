import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import Menu, { MenuItem } from './Menu';
import { UserGroupIcon, BannerIcon, FileIcon, LocationIc, VoucherIcon, HomeIcon, OriginIcon } from '~/components/Icons';
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
                    title="Danh sách sản phẩm"
                    to={'productlist'}
                    icon={<UserGroupIcon />}
                    activeIcon={<UserGroupIcon />}
                />
                {/* <MenuItem
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
                /> */}
                <MenuItem title="Banner quảng cáo" to={'news'} icon={<BannerIcon />} activeIcon={<BannerIcon />} />
                <MenuItem title="Khuyến mãi" to={'sales'} icon={<VoucherIcon />} activeIcon={<VoucherIcon />} />
                <MenuItem title="Hãng sản xuất" to={'manufacturers'} icon={<HomeIcon />} activeIcon={<HomeIcon />} />
                <MenuItem title="Nơi xuất xứ" to={'origins'} icon={<OriginIcon />} activeIcon={<OriginIcon />} />
            </Menu>
        </aside>
    );
}

export default Sidebar;
