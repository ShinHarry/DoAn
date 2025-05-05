import Header from '~/layouts/components/Header';
import Sidebar from '../components/Sidebar';
import classNames from 'classnames/bind';
import styles from './HeaderSideBar.module.scss';

import PropTypes from 'prop-types';
const cx = classNames.bind(styles);

function HeaderSideBar({ children }) {
    return (
        <div className={cx('wrapper')}>
            <Header />
            <div className={cx('container')}>
                <Sidebar />
                <div className={cx('content')}>{children}</div>
            </div>
        </div>
    );
}

HeaderSideBar.propTypes = {
    children: PropTypes.node.isRequired,
};
export default HeaderSideBar;
