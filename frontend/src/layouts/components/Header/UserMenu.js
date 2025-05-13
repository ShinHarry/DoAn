import Tippy from '@tippyjs/react/headless';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOut } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';

const cx = classNames.bind(styles);

function UserMenu({ user, onLogout }) {
    const navigate = useNavigate();

    return (
        <Tippy
            interactive
            placement="bottom-end"
            render={() => (
                <div className={cx('menu-list')}>
                    <div className={cx('menu-item')} onClick={() => navigate(`/profile/${user._id}`)}>
                        <FontAwesomeIcon icon={faUser} /> Trang cá nhân
                    </div>
                    <div className={cx('menu-item')} onClick={onLogout}>
                        <FontAwesomeIcon icon={faSignOut} /> Đăng xuất
                    </div>
                </div>
            )}
        >
            <img src={user.avatar} alt="User avatar" className={cx('user-avatar')} />
        </Tippy>
    );
}

export default UserMenu;
