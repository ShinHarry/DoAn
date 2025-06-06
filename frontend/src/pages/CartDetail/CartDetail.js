import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './CartDetail.module.scss';
import * as cartService from '~/services/cartService';
import Image from '~/components/Image';
import Button from '~/components/Button';
import { RiDeleteBin5Fill } from "react-icons/ri";
import images from '~/assets/images'; 
import Swal from 'sweetalert2'; // thư viện hiện alert 
import { toast, ToastContainer } from 'react-toastify';

const cx = classNames.bind(styles);

function CartDetail() {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchCart = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await cartService.getCart();
            console.log("Cart data for detail page:", data);
            setCartItems(data.cart || []);
        } catch (err) {
            console.error('Error fetching cart details:', err);
            setError('Không thể tải chi tiết giỏ hàng. Vui lòng thử lại.');
            setCartItems([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

   // hàm xóa sản phẩm khỏi giỏ
    const handleDeleteItem = async (id) => {

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
                Swal.fire('Thành công', 'Đã xóa sản phẩm khỏi giỏ hàng.', 'success');
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
            Swal.fire('Lỗi', 'Lỗi khi xóa sản phẩm!', 'error');
        }
        } catch (error) {
            console.error('Lỗi xóa sản phẩm khỏi giỏ:', error);
        }
    };

    // hàm xử lý cập nhật lại số lượng khi ấn + -
        const handleUpdateQuantity = async (id, newQuantity) => {
        if ( newQuantity < 1) return;

        const itemToUpdate = cartItems.find(item => item._id === id);
        if (!itemToUpdate) return;

        // Ngăn vượt số lượng hàng còn sẵn
        if (newQuantity > itemToUpdate.availableQuantity) {
            Swal.fire(
                'Thất bại',
                `Số lượng tồn kho không đủ. Chỉ còn ${itemToUpdate.availableQuantity} sản phẩm.`,
                'warning'
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
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                Swal.fire('Thất bại', response.message || 'Lỗi khi cập nhật số lượng.','error');
                fetchCart(); // gọi lại cart
            }
        } catch (error) {
                Swal.fire('Thất bại', 'Đã xảy ra lỗi khi cập nhật số lượng.','error');
                fetchCart();
        }
    };

    // hàm xử lý khi ấn checkbox
    const handleToggleSelect = (id) => {
        setCartItems((prevItems) =>
            prevItems.map((item) => (item._id === id ? { ...item, selected: !item.selected } : item)),
        );
    };
     //hàm xử lý khi nhấn thanh toán
    const handleCheckout = () => {
        const selectedItems = cartItems.filter((item) => item.selected);
        if (selectedItems.length === 0) {
            toast.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
            return;
        }
        // dispatch(saveSelectedCartItems(selectedItems));  // Gửi vào Redux
        sessionStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));
        navigate('/checkout');
    };
    
    const calculateSubtotal = (item) => {
        return item.unitPrice * item.quantity;
    };

    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => total + calculateSubtotal(item), 0);
    };

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const finalTotalPrice = calculateTotalPrice();

    if (isLoading) {
        return <div className={cx('loading')}>Đang tải giỏ hàng...</div>;
    }

    if (error) {
        return <div className={cx('error')}>{error}</div>;
    }

    if (cartItems.length === 0) {
        return (
            <div className={cx('wrapper', 'empty-cart')}>
                <p>Giỏ hàng của bạn đang trống.</p>
                <Link to="/">
                    <Button primary>Tiếp tục mua sắm</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <h1 className={cx('title')}>Chi Tiết Giỏ Hàng</h1>
            <ToastContainer
                        position="top-center"
                        autoClose={3000} // Tự động tắt
                        hideProgressBar={true} //  thanh tiến trình
                        newestOnTop={false} //Toast mới sẽ hiện dưới các toast cũ.
                        closeOnClick //Cho phép đóng toast
                        draggable // kéo
                    />
            <div className={cx('cart-content')}>
                {/* Danh sách */}
                <div className={cx('cart-items-list')}>
                    <div className={cx('cart-header')}>
                        <div className={cx('header-product')}>Sản phẩm</div>
                        <div>Đơn giá</div>
                        <div>Số lượng</div>
                        <div>Thành tiền</div>
                        <div>Xóa</div>
                    </div>

                    {/* Sản phẩm */}
                    {cartItems.map((item) => (
                        <div key={item._id} className={cx('cart-item', { 'not-available': item.quantity > item.availableQuantity })}>
                            <div className={cx('item-product')}>
                                <input
                                        type="checkbox"
                                        checked={!!item.selected}
                                        onChange={() => handleToggleSelect(item._id)}
                                />
                                <Image
                                    src={item.image || images.noImage}
                                    alt={item.name}
                                    className={cx('item-image')}
                                />
                                <span className={cx('item-name')}>{item.name}</span>
                            </div>

                            <div className={cx('item-price')}>{item.unitPrice.toLocaleString()} VND</div>

                            <div className={cx('item-quantity')}>
                                <button
                                    className={cx('quantity-btn')}
                                    onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    // đamr bảo ko nhâp < 1
                                        onChange={(e) =>{
                                            const val = e.target.value;
                                            if (val === '') {
                                                setCartItems((prev) =>
                                                    prev.map((cart) => cart._id === item._id ? { ...cart, quantity: '' } : cart)
                                                );
                                            } else {
                                                const parsed = parseInt(val);
                                                if (!isNaN(parsed)) {
                                                    setCartItems((prev) =>
                                                        prev.map((cart) => cart._id === item._id ? { ...cart, quantity: parsed } : cart)
                                                    );
                                                }
                                            }
                                        }}
                                        //kiểm tra lại giá trị tránh bug do onChange không cập nhật đúng
                                        onBlur={(e) => {
                                            const parsed = parseInt(e.target.value);
                                                if (!parsed || parsed < 1) {
                                                    handleUpdateQuantity(item._id, 1);
                                                } else if (parsed > item.availableQuantity) {
                                                    Swal.fire(
                                                        'Thất bại',
                                                        `Số lượng tồn kho không đủ. Chỉ còn ${item.availableQuantity} sản phẩm.`,
                                                        'warning'
                                                    );
                                                    handleUpdateQuantity(item._id, item.availableQuantity);
                                                } else {
                                                    handleUpdateQuantity(item._id, parsed);
                                                }
                                        }}
                                    className={cx('quantity-input')}
                                    min="1"
                                    max={item.availableQuantity}
                                />
                                <button
                                    className={cx('quantity-btn')}
                                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                     disabled={item.quantity >= item.availableQuantity}
                                >
                                    +
                                </button>
                                {item.quantity > item.availableQuantity && (
                                    <span className={cx('stock-warning')}>Hết hàng</span>
                                )}
                            </div>

                            <div className={cx('item-total')}>{calculateSubtotal(item).toLocaleString()} VND</div>

                            <button className={cx('item-delete')} onClick={() => handleDeleteItem(item._id)}>
                                <RiDeleteBin5Fill />
                            </button>
                        </div>
                    ))}
                </div>

                {/* tóm tắt giỏ hàng */}
                <div className={cx('cart-summary')}>
                    <h2>Tổng cộng giỏ hàng</h2>
                    <div className={cx('summary-row')}>
                        <span>Tổng sản phẩm:</span>
                        <span>{totalQuantity}</span>
                    </div>
 
                    <div className={cx('summary-row', 'total-final')}>
                        <span>Tổng tiền:</span>
                        <span>{finalTotalPrice.toLocaleString()} VND</span>
                    </div>
                    <Button
                        primary
                        className={cx('checkout-button')}
                        onClick={handleCheckout}
                        disabled={cartItems.some(item => item.quantity > item.availableQuantity)} //tắt button nếu có sản phẩm ko đủ số lượng
                    >
                        Tiến hành thanh toán
                    </Button>
                  
                     <Link to="/" className={cx('continue-shopping')}>

                        <Button text>Tiếp tục mua sắm</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default CartDetail; 