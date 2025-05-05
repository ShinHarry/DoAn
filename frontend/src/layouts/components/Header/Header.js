import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faKeyboard,
    faUser,
    faLaptop,
    faDesktop,
    faHeadphones,
    faBoxes,
    faLocationDot,
    faPlus,
    faSignOutAlt,
    faImage,
    faStar,
    faMobilePhone,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { jwtDecode } from 'jwt-decode';
import config from '~/config';
import Button from '~/components/Button';
import styles from './Header.module.scss';
import images from '~/assets/images';
import Menu from '~/components/Popper/Menu';
import { InboxIcon, CartIcons, BarsIcon, ComponentElectronicIcon } from '~/components/Icons';
import Image from '~/components/Image';
import Search from '../Search';
import * as categoryService from '~/services/categoryService';
import { useEffect, useState, useCallback } from 'react';

// cart
import Drawer from '@mui/material/Drawer';
import { IoCloseSharp } from "react-icons/io5";
import { RiDeleteBin5Fill } from "react-icons/ri";
import * as cartService from '~/services/cartService';
//cart

const cx = classNames.bind(styles);

function Header() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categoryMap, setCategoryMap] = useState({});
    const [userData, setUserData] = useState(null);

    //cart
    const [cartItems, setCartItems] = useState([]);
    const [openCartPanel, setOpenCartPanel] = useState(false);
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [cartError, setCartError] = useState(null);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    //cart

    useEffect(() => {
        // lấy user data từ storage
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUser) {
            try {
                setUserData(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse user data from storage:', error);
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
            }
        }

        const fetchCategories = async () => {
            try {
                const categoryData = await categoryService.getCategories();
                const map = {};
                categoryData.forEach((cat) => {
                    map[cat.nameCategory.trim()] = cat._id;
                });
                setCategoryMap(map);
                setLoading(true);
            } catch (error) {
                setError('Không thể tải danh mục. Vui lòng thử lại.');
                setLoading(true);
            }
        };

        fetchCategories();
    }, []);

    const currentUser = !!userData;
    const userId = userData?.id;
    const avatar = userData?.avatar;

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        setUserData(null);
        setCartItems([]);
        window.location.reload();
    };

    //cart // hàm lấy cart, thay đổi theo currentUser
    const fetchCart = useCallback(async () => {
        if (!currentUser) return;
        setIsCartLoading(true);
        setCartError(null);
        try {
            const data = await cartService.getCart();
            console.log("Dữ liệu cart từ server:", data);
            setCartItems(data.cart || []);
        } catch (error) {
            console.error('Lỗi lấy cart:', error);
            setCartError('Không thể tải giỏ hàng. Vui lòng thử lại.');
            setCartItems([]);
        } finally {
            setIsCartLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchCart();
        }
    }, [currentUser, fetchCart]);

    useEffect(() => {
        let quantity = 0;
        let price = 0;
        cartItems.forEach(item => {
            if (item.selected) {
                price += (item.unitPrice * item.quantity);
            }
            quantity += item.quantity;
        });
        setTotalQuantity(quantity);
        setTotalPrice(price);
    }, [cartItems]);

    // hàm xử lý đóng mở giỏ hàng drawer
    const handleOpenCart = () => {
        if (currentUser) {
            fetchCart(); // làm mới lại giỏ hàng khi mở
        }
        setOpenCartPanel(true);
    };

    // hàm xử lý khi ấn checkbox
    const handleToggleSelect = (id) => {

    };

    // hàm xóa sản phẩm khỏi giỏ
    const handleDeleteItem = async (id) => {
  
    };

     // hàm xử lý cập nhật lại số lượng khi ấn + -
     const handleUpdateQuantity = async (id, newQuantity) => {
        
    };

    // tăng số lượng sản phẩm +
    const handleIncrease = (id) => {
        
    };

    //giảm số lượng sản phẩm -
    const handleDecrease = (id) => {
        const item = cartItems.find(item => item._id === id);
        if (item && item.quantity > 1) { // Prevent going below 1
            // Call the function that updates backend
            handleUpdateQuantity(id, item.quantity - 1);
        }
    };

    //hàm xử lý khi nhấn thanh toán
    const handleCheckout = () => {
       
    };

    const MENU_ITEMS = [
        {
            icon: <FontAwesomeIcon icon={faLaptop} />,
            title: 'Laptop',
            to: `/category/${categoryMap['Laptop'] || ''}`,
        },
        {
            icon: <FontAwesomeIcon icon={faMobilePhone} />,
            title: 'Điện thoại',
            to: `/category/${categoryMap['Điện thoại'] || ''}`,
        },
        {
            icon: <FontAwesomeIcon icon={faDesktop} />,
            title: 'PC',
            to: `/category/${categoryMap['PC'] || ''}`,
        },
        {
            icon: <ComponentElectronicIcon />,
            title: 'Electronic devices',
            to: `/category/${categoryMap['Electronic devices'] || ''}`,
        },
        {
            icon: <FontAwesomeIcon icon={faKeyboard} />,
            title: 'Keyboards',
            to: `/category/${categoryMap['Keyboards'] || ''}`,
        },
        {
            icon: <FontAwesomeIcon icon={faHeadphones} />,
            title: 'Headphones',
            to: `/category/${categoryMap['Headphones'] || ''}`,
        },
    ];

    const userMenu = [
        {
            icon: <FontAwesomeIcon icon={faUser} />,
            title: 'Thông tin cá nhân',
            to: `/profile/${userId}`,
        },
        {
            icon: <FontAwesomeIcon icon={faBoxes} />,
            title: 'Đơn hàng của tôi',
            to: '/order',
        },
        {
            icon: <FontAwesomeIcon icon={faLocationDot} />,
            title: 'Sổ địa chỉ',
            to: '/address',
        },
        {
            icon: <FontAwesomeIcon icon={faPlus} />,
            title: 'Thêm sản phẩm',
            to: '/addProduct',
        },
        {
            icon: <FontAwesomeIcon icon={faImage} />,
            title: 'Banner',
            to: '/news',
        },
        {
            icon: <FontAwesomeIcon icon={faStar} />,
            title: 'Khuyến mãi',
            to: '/sales',
        },
        {
            icon: <FontAwesomeIcon icon={faSignOutAlt} />, // thêm icon logout
            icon: <FontAwesomeIcon icon={faSignOutAlt} />,
            title: 'Đăng xuất',
            separate: true,
            onClick: handleLogout,
        },
        
    ];

    return (
        <header className={cx('wrapper')}>
            {!error && !loading ? (
                <div className={cx('loading')}>Loading...</div>
            ) : (
                <div className={cx('inner')}>
                    <Link to={config.routes.home} className={cx('logo-link')}>
                        <img src={images.logo} alt="Logo" />
                    </Link>
                    <Menu items={MENU_ITEMS}>
                        <button className={cx('action-btn')}>
                            <BarsIcon />
                        </button>
                    </Menu>
                    <Search />

                    <div className={cx('actions')}>
                        {currentUser ? (
                            <>
                                <Tippy delay={[0, 50]} content="Thông báo" placement="bottom">
                                    <button className={cx('action-btn')}>
                                        <InboxIcon />
                                        {/* <span className={cx('badge')}>12</span> */}
                                    </button>
                                </Tippy>
                            </>
                        ) : (
                            <>
                                <Button primary to="/login">
                                    Log in
                                </Button>
                            </>
                        )}

                        <Menu items={currentUser ? userMenu : MENU_ITEMS}>
                            {currentUser ? (
                                <Image className={cx('user-avatar')} src={avatar} alt="Avatar User" />
                            ) : (
                                <></>
                            )}
                        </Menu>
                        <Tippy delay={[0, 50]} content="Giỏ hàng" placement="bottom">
                            <button className={cx('action-btn')} onClick={handleOpenCart}>
                                <CartIcons />
                            </button>
                        </Tippy>
                    </div>
                </div>
            )}

            <Drawer open={openCartPanel} onClose={() => setOpenCartPanel(false)} anchor="right">
                <div className={cx('cartDrawer')}>
                    <div className={cx('cartHeader')}>
                        <h1 className={cx('cartTitle')}></h1>
                        <IoCloseSharp
                            className={cx('cartClose')}
                            onClick={() => setOpenCartPanel(false)}
                        />
                    </div>
                    <div className={cx('cartItems')}>
                        {isCartLoading ? (
                            <p>Đang tải giỏ hàng...</p>
                        ) : cartError ? (
                            <p className={cx('error-message')}>{cartError}</p>
                        ) : cartItems.length === 0 ? (
                            <p>Giỏ hàng của bạn đang trống.</p>
                        ) : (
                            cartItems.map((item) => (
                                <div key={item._id} className={cx('cartItem', { 'not-available': item.quantity > item.availableQuantity })}>
                                    <input
                                        type="checkbox"
                                        checked={!!item.selected}
                                        // onChange={() => handleToggleSelect(item._id)}
                                        className={cx('cartItemCheckbox')}
                                    />
                                    <Image
                                        src={item.image || images.noImage}
                                        alt={item.name}
                                        className={cx('cartItemImage')}
                                    />
                                    <div className={cx('cartItemInfo')}>
                                        <span className={cx('cartItemName')}>{item.name}</span>
                                        <div className={cx('cartItemDetails')}>
                                            <div className={cx('quantityControl')}>
                                                <button onClick={() => handleDecrease(item._id)} disabled={item.quantity <= 1}>-</button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    // // Call handleUpdateQuantity directly on change
                                                    // onChange={(e) => handleUpdateQuantity(item._id, Math.max(1, parseInt(e.target.value) || 1))}
                                                    // // Keep onBlur for validation if needed, but primary update is onChange
                                                    // onBlur={(e) => {
                                                    //     const validatedQuantity = Math.max(1, parseInt(e.target.value) || 1);
                                                    //      // Only call update again if the validated value is different AND less than/equal to stock
                                                    //     if (validatedQuantity !== item.quantity && validatedQuantity <= item.availableQuantity) {
                                                    //         handleUpdateQuantity(item._id, validatedQuantity);
                                                    //      } else if (validatedQuantity > item.availableQuantity) {
                                                    //         // If user leaves input with invalid qty > stock, maybe reset to max stock?
                                                    //         // Or rely on the alert within handleUpdateQuantity
                                                    //         // For simplicity, we might just let handleUpdateQuantity handle the alert on the next attempt.
                                                    //      }
                                                    // }}
                                                    className={cx('quantityInput')}
                                                    min="1"
                                                    max={item.availableQuantity} // Set max based on stock
                                                />
                                                <button onClick={() => handleIncrease(item._id)} disabled={item.quantity >= item.availableQuantity}>+</button>
                                            </div>
                                            <span>Đơn giá: {item.unitPrice.toLocaleString()} VND</span>
                                            {/* {item.quantity > item.availableQuantity && (
                                                <span className={cx('stockWarning')}> (Chỉ còn {item.availableQuantity})</span>
                                            )} */}
                                        </div>
                                    </div>
                                    <RiDeleteBin5Fill
                                        className={cx('cartItemDelete')}
                                        onClick={() => handleDeleteItem(item._id)}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                    {currentUser && cartItems.length > 0 && (
                        <div className={cx('cartFooter')}>
                            <div className={cx('cartTotal')}>
                                <span className={cx('totalLabel')}>Tạm tính ({cartItems.filter(i => i.selected).length} sản phẩm): </span>
                                <span className={cx('totalValue')}>
                                    {totalPrice.toLocaleString()} VND
                                </span>
                            </div>
                            <Link to="/cart-detail" className={cx('view-detail-link')} onClick={() => setOpenCartPanel(false)}>
                                <Button className={cx('view-detail-btn')} outline>
                                    Xem chi tiết
                                </Button>
                            </Link>
                            <Link to="/checkout" className={cx('checkout-link')} onClick={() => setOpenCartPanel(false)}>
                                <Button className={cx('checkout-btn')} primary onClick={handleCheckout} disabled={cartItems.filter(i => i.selected).length === 0}>
                                    Thanh toán
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </Drawer>

        </header>
    );
}

export default Header;
