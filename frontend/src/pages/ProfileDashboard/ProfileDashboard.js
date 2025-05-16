import { Outlet } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProfileDashboard.module.scss';
import Sidebar from './Sidebar';

const cx = classNames.bind(styles);

function ProfileDashboard() {
    return (
        <div className={cx('wrapper')}>
            <Sidebar />
            <div className={cx('container')}>
                <Outlet />
            </div>
        </div>
    );
}

export default ProfileDashboard;
