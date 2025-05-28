import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import Menu, { MenuItem } from './Menu';
import { UserGroupIcon, BannerIcon, FileIcon, VoucherIcon, HomeIcon, OriginIcon } from '~/components/Icons';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '~/redux/actions/authActions';
const cx = classNames.bind(styles);

function Sidebar() {
    const dispatch = useDispatch();

    const currentUser = useSelector((state) => state.auth.login.currentUser);
    useEffect(() => {
        if (!currentUser) {
            dispatch(fetchUser());
        }
    }, [currentUser, dispatch]);
    const userRole = currentUser?.user?.userRole;
    return (
        <aside className={cx('wrapper')}>
            <Menu>
                {(userRole === 'mod' || userRole === 'admin') && (
                    <>
                        <MenuItem
                            title="Danh sách sản phẩm"
                            to={'productlist'}
                            icon={<UserGroupIcon />}
                            activeIcon={<UserGroupIcon />}
                        />
                        <MenuItem
                            title="Danh sách sản phẩm"
                            to={'productlist'}
                            icon={<UserGroupIcon />}
                            activeIcon={<UserGroupIcon />}
                        />

                        <MenuItem
                            title="Banner quảng cáo"
                            to={'news'}
                            icon={<BannerIcon />}
                            activeIcon={<BannerIcon />}
                        />
                        <MenuItem
                            title="Quản lý đơn hàng"
                            to={'orderManage'}
                            icon={<FileIcon />}
                            activeIcon={<FileIcon />}
                        />
                        <MenuItem
                            title="Danh mục sản phẩm"
                            to={'categoryManager'}
                            icon={<FileIcon />}
                            activeIcon={<FileIcon />}
                        />
                        <MenuItem
                            title="Mã giảm giá"
                            to={'sales'}
                            icon={<VoucherIcon />}
                            activeIcon={<VoucherIcon />}
                        />
                        <MenuItem
                            title="Hãng sản xuất"
                            to={'manufacturers'}
                            icon={<HomeIcon />}
                            activeIcon={<HomeIcon />}
                        />
                        <MenuItem
                            title="Nơi xuất xứ"
                            to={'origins'}
                            icon={<OriginIcon />}
                            activeIcon={<OriginIcon />}
                        />
                        <MenuItem title="Đơn vị" to={'unit'} icon={<OriginIcon />} activeIcon={<OriginIcon />} />
                    </>
                )}

                {(userRole === 'accountant' || userRole === 'admin') && (
                    <MenuItem title="Thống kê" to={'statistics'} icon={<FileIcon />} activeIcon={<FileIcon />} />
                )}
            </Menu>
        </aside>
    );
}

export default Sidebar;
