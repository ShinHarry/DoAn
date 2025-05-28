import { Outlet } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './AdminDashboard.module.scss';
import Sidebar from '../components/Sidebar';

const cx = classNames.bind(styles);

function AdminDashboard() {
    return (
        <div className={cx('wrapper')}>
            <Sidebar />
            <div className={cx('container')}>
                <Outlet />
            </div>
        </div>
    );
}

export default AdminDashboard;
