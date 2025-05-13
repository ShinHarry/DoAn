import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptop, faMobile, faTablet, faKeyboard, faHeadphones } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';

const cx = classNames.bind(styles);

const MENU_ITEMS = [
    { icon: faLaptop, title: 'Laptop', slug: 'Laptop' },
    { icon: faMobile, title: 'Điện thoại', slug: 'Điện thoại' },
    { icon: faTablet, title: 'Máy tính bảng', slug: 'Máy tính bảng' },
    { icon: faKeyboard, title: 'Phụ kiện', slug: 'Phụ kiện' },
    { icon: faHeadphones, title: 'Âm thanh', slug: 'Âm thanh' },
];

function CategoryMenu({ categoryMap }) {
    const navigate = useNavigate();

    return (
        <div className={cx('menu')}>
            {MENU_ITEMS.map((item, index) => (
                <div
                    key={index}
                    className={cx('menu-item')}
                    onClick={() => navigate(`/category/${categoryMap[item.slug] || ''}`)}
                >
                    <FontAwesomeIcon icon={item.icon} className={cx('menu-icon')} />
                    <span>{item.title}</span>
                </div>
            ))}
        </div>
    );
}

export default CategoryMenu;
