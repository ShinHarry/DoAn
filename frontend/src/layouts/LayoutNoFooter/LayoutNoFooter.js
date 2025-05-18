import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Header from '~/layouts/components/Header';
import styles from './LayoutNoFooter.module.scss';

const cx = classNames.bind(styles);

function LayoutNoFooter({ children }) {
    return (
        <div className={cx('wrapper')}>
            <Header />
            <div className={cx('container')}>
                <div className={cx('content')}>{children}</div>
            </div>
        </div>
    );
}

LayoutNoFooter.propTypes = {
    children: PropTypes.node.isRequired,
};

export default LayoutNoFooter;
