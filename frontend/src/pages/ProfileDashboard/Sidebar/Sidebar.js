import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import Menu, { MenuItem } from './Menu';
import { LocationIcon, PassWordIcon, ProfileIcon } from '~/components/Icons';
import * as authService from '~/services/authService';
import { useEffect, useState } from 'react';

const cx = classNames.bind(styles);

function Sidebar() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await authService.fetchUser();
                setUser(response);
                console.log('fetchUser', response);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);
    return (
        <aside className={cx('wrapper')}>
            {loading && <div>Đang kiểm tra quyền truy cập...</div>}
            <Menu>
                <MenuItem
                    title="Thông tin cá nhân"
                    to={`profile/${user?.user?._id}`}
                    icon={<ProfileIcon />}
                    activeIcon={<ProfileIcon />}
                />
                <MenuItem
                    title="Sổ địa chỉ"
                    to={`profile/${user?.user?._id}/address`}
                    icon={<LocationIcon />}
                    activeIcon={<LocationIcon />}
                />

                <MenuItem
                    title="Quên mật khẩu"
                    to={`profile/${user?.user?._id}/changepassword`}
                    icon={<PassWordIcon />}
                    activeIcon={<PassWordIcon />}
                />
            </Menu>
        </aside>
    );
}

export default Sidebar;
