import classNames from 'classnames/bind';
import Drawer from '@mui/material/Drawer';
import styles from './Header.module.scss';

const cx = classNames.bind(styles);

function CartDrawer({ open, onClose, cartItems, totalPrice }) {
    const formatPrice = (price) => price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <div className={cx('drawer')}>
                <h2>Giỏ hàng</h2>
                {cartItems.length === 0 ? (
                    <p>Giỏ hàng của bạn trống.</p>
                ) : (
                    <>
                        {cartItems.map((item) => (
                            <div key={item._id} className={cx('cart-item')}>
                                <img src={item.image} alt={item.name} />
                                <div>
                                    <p>{item.name}</p>
                                    <p>Số lượng: {item.quantity}</p>
                                    <p>{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            </div>
                        ))}
                        <div className={cx('cart-total')}>
                            Tổng tiền: <strong>{formatPrice(totalPrice)}</strong>
                        </div>
                    </>
                )}
            </div>
        </Drawer>
    );
}

export default CartDrawer;
