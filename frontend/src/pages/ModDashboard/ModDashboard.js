import { Outlet } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ModDashboard.module.scss';
import Sidebar from './Sidebar';

const cx = classNames.bind(styles);

function ModDashboard() {
    return (
        <div className={cx('wrapper')}>
            <Sidebar />
            <div className={cx('container')}>
                <h1 className={cx('title')}>Mod Dashboard</h1>
                <Outlet />
            </div>
        </div>
    );
}

export default ModDashboard;
