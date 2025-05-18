import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { logout } from '~/redux/actions/authActions';
import { FiHeart } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import {
    faKeyboard,
    faUser,
    faLaptop,
    faDesktop,
    faHeadphones,
    faBoxes,
    faPlus,
    faSignOutAlt,
    faMobilePhone,
    faCartPlus,
} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import config from '~/config';
import Button from '~/components/Button';
import styles from './Header.module.scss';
import images from '~/assets/images';
import Menu from '~/components/Popper/Menu';
import { CartIcons, BarsIcon, ComponentElectronicIcon } from '~/components/Icons';
import Image from '~/components/Image';
import Search from '../Search';
import * as categoryService from '~/services/categoryService';
import { useEffect, useState, useCallback } from 'react';

// cart
import Drawer from '@mui/material/Drawer';
import { IoCloseSharp } from 'react-icons/io5';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import * as cartService from '~/services/cartService';
import Swal from 'sweetalert2'; // thư viện hiện alert
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//cart

const cx = classNames.bind(styles);

function Header() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categoryMap, setCategoryMap] = useState({});
    const [userData, setUserData] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    //cart
    const [cartItems, setCartItems] = useState([]);
    const [openCartPanel, setOpenCartPanel] = useState(false);
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [cartError, setCartError] = useState(null);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    //cart

    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUser) {
            try {
                setUserData(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse user data:', error);
            }
        }
        setUserLoading(false);

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
        try {
            dispatch(logout());
            setUserData(null);
            setCartItems([]);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Đã xảy ra lỗi khi đăng xuất.');
        }
    };

    //cart // hàm lấy cart, thay đổi theo currentUser
    const fetchCart = useCallback(async () => {
        if (!currentUser) return;
        setIsCartLoading(true);
        setCartError(null);
        try {
            const data = await cartService.getCart();
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
        cartItems.forEach((item) => {
            if (item.selected) {
                price += item.unitPrice * item.quantity;
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
        setCartItems((prevItems) =>
            prevItems.map((item) => (item._id === id ? { ...item, selected: !item.selected } : item)),
        );
    };

    // hàm xóa sản phẩm khỏi giỏ
    const handleDeleteItem = async (id) => {
        if (!currentUser) return;

        const result = await Swal.fire({
            title: 'Bạn có chắc muốn xóa sản phẩm này?',
            text: 'Thao tác này không thể hoàn tác.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (!result.isConfirmed) return; // Nếu không xác nhận thì không làm gì

        try {
            const response = await cartService.removeCartItem(id);
            if (response.success) {
                setCartItems((prevItems) => prevItems.filter((item) => item._id !== id));
                toast.success('Đã xóa sản phẩm khỏi giỏ hàng.');
            } else {
                toast.error('Lỗi khi xóa sản phẩm!');
            }
        } catch (error) {
            console.error('Lỗi xóa sản phẩm khỏi giỏ:', error);
            toast.error('Đã xảy ra lỗi khi xóa sản phẩm.');
        }
    };

    // hàm xử lý cập nhật lại số lượng khi ấn + -
    const handleUpdateQuantity = async (id, newQuantity) => {
        if (!currentUser || newQuantity < 1) return;

        const itemToUpdate = cartItems.find((item) => item._id === id);
        if (!itemToUpdate) return;

        // Ngăn vượt số lượng hàng còn sẵn
        if (newQuantity > itemToUpdate.availableQuantity) {
            Swal.fire(
                'Thất bại',
                `Số lượng tồn kho không đủ. Chỉ còn ${itemToUpdate.availableQuantity} sản phẩm.`,
                'warning',
            );
            setCartItems([...cartItems]);
            return;
        }

        try {
            const response = await cartService.updateCartItemQuantity(id, newQuantity);
            if (response.success && response.cartItem) {
                // cập nhật lại
                setCartItems((prevItems) =>
                    prevItems.map((item) =>
                        item._id === id
                            ? { ...item, quantity: response.cartItem.quantity, selected: item.selected }
                            : item,
                    ),
                );
            } else {
                Swal.fire('Thất bại', response.message || 'Lỗi khi cập nhật số lượng.', 'error');
                fetchCart(); // gọi lại cart
            }
        } catch (error) {
            Swal.fire('Thất bại', 'Đã xảy ra lỗi khi cập nhật số lượng.', 'error');
            fetchCart();
        }
    };

    // tăng số lượng sản phẩm +
    const handleIncrease = (id) => {
        const item = cartItems.find((item) => item._id === id);
        if (item) {
            handleUpdateQuantity(id, item.quantity + 1);
        }
    };

    //giảm số lượng sản phẩm -
    const handleDecrease = (id) => {
        const item = cartItems.find((item) => item._id === id);
        if (item && item.quantity > 1) {
            // ngăn nhỏ hơn 1
            handleUpdateQuantity(id, item.quantity - 1);
        }
    };

    //hàm xử lý khi nhấn thanh toán
    const handleCheckout = () => {
        const selectedItems = cartItems.filter((item) => item.selected);
        if (selectedItems.length === 0) {
            toast.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
            return;
        }
        setOpenCartPanel(false);
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

    const userCusMenu = [
        {
            icon: <FontAwesomeIcon icon={faUser} />,
            title: 'Thông tin cá nhân',
            to: `/profiledashboard/profile/${userId}`,
        },
        {
            icon: <FontAwesomeIcon icon={faBoxes} />,
            title: 'Đơn hàng của tôi',
            to: '/orders',
        },

        {
            icon: <FontAwesomeIcon icon={faSignOutAlt} />,
            title: 'Đăng xuất',
            separate: true,
            onClick: handleLogout,
        },
    ];
    const userModMenu = [
        {
            icon: <FontAwesomeIcon icon={faUser} />,
            title: 'Thông tin cá nhân',
            to: `/profiledashboard/profile/${userId}`,
        },
        {
            icon: <FontAwesomeIcon icon={faPlus} />,
            title: 'Thêm sản phẩm',
            to: '/addProduct',
        },

        {
            icon: <FontAwesomeIcon icon={faSignOutAlt} />,
            title: 'Đăng xuất',
            separate: true,
            onClick: handleLogout,
        },
    ];
    const adminMenu = [
        {
            icon: <FontAwesomeIcon icon={faUser} />,
            title: 'Thông tin cá nhân',
            to: `/profiledashboard/profile/${userId}`,
        },
        {
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
                    {!userLoading && userData?.role !== 'mod' && userData?.role !== 'admin' && (
                        <Link to={config.routes.home} className={cx('logo-link')}>
                            <img src={images.logo} alt="Logo" />
                        </Link>
                    )}
                    {!userLoading && userData?.role === 'mod' && (
                        <Link to={`${config.routes.moddashboard}/productlist`} className={cx('logo-link')}>
                            <img src={images.logo} alt="Logo" />
                        </Link>
                    )}
                    {!userLoading && userData?.role === 'admin' && (
                        <Link to={`${config.routes.admindashboard}/productlist`} className={cx('logo-link')}>
                            <img src={images.logo} alt="Logo" />
                        </Link>
                    )}
                    {!userLoading && userData?.role !== 'mod' && userData?.role !== 'admin' && (
                        <>
                            <Menu items={MENU_ITEMS}>
                                <button className={cx('action-btn')}>
                                    <BarsIcon />
                                </button>
                            </Menu>
                            <Search />
                        </>
                    )}

                    <div className={cx('actions')}>
                        {!userLoading && userData?.role !== 'mod' && userData?.role !== 'admin' && (
                            <Tippy delay={[0, 50]} content="Danh sách yêu thích" placement="bottom">
                                <button className={cx('action-btn')} onClick={() => navigate('/wishlist')}>
                                    <FiHeart />
                                </button>
                            </Tippy>
                        )}
                        {!currentUser && (
                            <Button primary to="/login">
                                Log in
                            </Button>
                        )}
                        {!userLoading && userData?.role === 'cus' && (
                            <Menu items={currentUser ? userCusMenu : MENU_ITEMS}>
                                {currentUser && (
                                    <Image className={cx('user-avatar')} src={avatar[0].link || ''} alt="Avatar User" />
                                )}
                            </Menu>
                        )}
                        {!userLoading && userData?.role === 'mod' && (
                            <Menu items={currentUser ? userModMenu : MENU_ITEMS}>
                                {currentUser && (
                                    <Image className={cx('user-avatar')} src={avatar[0].link || ''} alt="Avatar User" />
                                )}
                            </Menu>
                        )}
                        {!userLoading && userData?.role === 'admin' && (
                            <Menu items={currentUser ? adminMenu : MENU_ITEMS}>
                                {currentUser && (
                                    <Image
                                        className={cx('user-avatar')}
                                        src={avatar[0]?.link || ''}
                                        alt="Avatar User"
                                    />
                                )}
                            </Menu>
                        )}

                        {!userLoading && userData?.role !== 'mod' && userData?.role !== 'admin' && (
                            <Tippy delay={[0, 50]} content="Giỏ hàng" placement="bottom">
                                <button className={cx('action-btn')} onClick={handleOpenCart}>
                                    <CartIcons />
                                    {currentUser && totalQuantity > 0 && (
                                        <span className={cx('badge')}>{totalQuantity}</span>
                                    )}
                                </button>
                            </Tippy>
                        )}
                    </div>
                </div>
            )}

            <Drawer open={openCartPanel} onClose={() => setOpenCartPanel(false)} anchor="right" style={{ zIndex: 10 }}>
                <div className={cx('cartDrawer')}>
                    <ToastContainer
                        position="top-center"
                        autoClose={3000} // Tự động tắt
                        hideProgressBar={true} //  thanh tiến trình
                        newestOnTop={false} //Toast mới sẽ hiện dưới các toast cũ.
                        closeOnClick //Cho phép đóng toast
                        draggable // kéo
                    />
                    <div className={cx('cartHeader')}>
                        <h1 className={cx('cartTitle')}>{`Giỏ hàng(${totalQuantity})`}</h1>
                        <IoCloseSharp className={cx('cartClose')} onClick={() => setOpenCartPanel(false)} />
                    </div>
                    <div className={cx('cartItems')}>
                        {isCartLoading ? (
                            <p>Đang tải giỏ hàng...</p>
                        ) : cartError ? (
                            <p className={cx('error-message')}>{cartError}</p>
                        ) : cartItems.length === 0 ? (
                            <div className={cx('emptyCart')}>
                                <FontAwesomeIcon icon={faCartPlus} className={cx('emptyCartIcon')} />
                                <p className={cx('emptyCartText')}>
                                    {!currentUser
                                        ? 'Vui lòng đăng nhập để xem giỏ hàng'
                                        : 'Giỏ hàng của bạn đang trống'}
                                </p>
                            </div>
                        ) : (
                            cartItems.map((item) => (
                                <div
                                    key={item._id}
                                    className={cx('cartItem', {
                                        'not-available': item.quantity > item.availableQuantity,
                                    })}
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!item.selected}
                                        onChange={() => handleToggleSelect(item._id)}
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
                                                <button
                                                    onClick={() => handleDecrease(item._id)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    // đamr bảo ko nhâp < 1
                                                    onChange={(e) =>
                                                        handleUpdateQuantity(
                                                            item._id,
                                                            Math.max(1, parseInt(e.target.value) || 1),
                                                        )
                                                    }
                                                    //kiểm tra lại giá trị tránh bug do onChange không cập nhật đúng
                                                    onBlur={(e) => {
                                                        const validatedQuantity = Math.max(
                                                            1,
                                                            parseInt(e.target.value) || 1,
                                                        );
                                                        //Chỉ gọi lại cập nhật nếu giá trị được xác thực khác
                                                        if (
                                                            validatedQuantity !== item.quantity &&
                                                            validatedQuantity <= item.availableQuantity
                                                        ) {
                                                            handleUpdateQuantity(item._id, validatedQuantity);
                                                        }
                                                    }}
                                                    className={cx('quantityInput')}
                                                    min="1"
                                                    max={item.availableQuantity} // để max = số lượng hàng còn
                                                />
                                                <button
                                                    onClick={() => handleIncrease(item._id)}
                                                    disabled={item.quantity >= item.availableQuantity}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span>
                                                Đơn giá: {(item.unitPrice * item.quantity).toLocaleString()} VND
                                            </span>
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
                                <span className={cx('totalLabel')}>
                                    Tạm tính ({cartItems.filter((i) => i.selected).length} sản phẩm):{' '}
                                </span>
                                <span className={cx('totalValue')}>{totalPrice.toLocaleString()} VND</span>
                            </div>
                            <Link
                                to="/cart-detail"
                                className={cx('view-detail-link')}
                                onClick={() => setOpenCartPanel(false)}
                            >
                                <Button className={cx('view-detail-btn')} outline>
                                    Xem chi tiết
                                </Button>
                            </Link>
                            <Link to="/checkout" onClick={() => setOpenCartPanel(false)}>
                                <Button className={cx('checkout-btn')} primary onClick={handleCheckout}>
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
