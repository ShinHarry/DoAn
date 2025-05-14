import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './AdminLayout.module.scss';
import HeaderAdmin from '~/layouts/components/HeaderAdmin.js';

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
    return (
        <div className={cx('wrapper')}>
            <HeaderAdmin />
            <div className={cx('container')}>
                <div className={cx('content')}>{children}</div>
            </div>
        </div>
    );
}

AdminLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AdminLayout;
