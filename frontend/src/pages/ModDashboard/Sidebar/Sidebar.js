import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import Menu, { MenuItem } from './Menu';
import { UserGroupIcon, BannerIcon, FileIcon, VoucherIcon, HomeIcon, OriginIcon } from '~/components/Icons';

const cx = classNames.bind(styles);

function Sidebar() {
    return (
        <aside className={cx('wrapper')}>
            <Menu>
                <MenuItem
                    title="Danh sách sản phẩm"
                    to={'productlist'}
                    icon={<UserGroupIcon />}
                    activeIcon={<UserGroupIcon />}
                />

                <MenuItem title="Banner quảng cáo" to={'news'} icon={<BannerIcon />} activeIcon={<BannerIcon />} />
                <MenuItem title="Quản lý đơn hàng" to={'orderManage'} icon={<FileIcon />} activeIcon={<FileIcon />} />
                <MenuItem
                    title="Danh mục sản phẩm"
                    to={'categoryManager'}
                    icon={<FileIcon />}
                    activeIcon={<FileIcon />}
                />
                <MenuItem title="Khuyến mãi" to={'sales'} icon={<VoucherIcon />} activeIcon={<VoucherIcon />} />
                <MenuItem title="Hãng sản xuất" to={'manufacturers'} icon={<HomeIcon />} activeIcon={<HomeIcon />} />
                <MenuItem title="Nơi xuất xứ" to={'origins'} icon={<OriginIcon />} activeIcon={<OriginIcon />} />
                <MenuItem title="Thống kê" to={'statistics'} icon={<FileIcon />} activeIcon={<FileIcon />} />
            </Menu>
        </aside>
    );
}

export default Sidebar;
