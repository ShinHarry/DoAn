import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import Button from '~/components/Button';
import styles from './Checkout.module.scss';
import * as cartService from '~/services/cartService';

import { toast, ToastContainer  } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import * as checkoutService from '~/services/checkoutService';

const cx = classNames.bind(styles);

function Checkout() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [shippingFee, setShippingFee] = useState(0);
    const [finalTotal, setFinalTotal] = useState(0);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCart = useCallback(async () => {
        setError(null);
        try {
            const data = await cartService.getCart();
            // console.log("Cart data for checkout:", data);
            if (!data.cart || data.cart.length === 0) {
                toast.warning("Giỏ hàng của bạn đang trống. Không thể thanh toán.");
                navigate('/');
                return;
            }
            setCartItems(data.cart || []);
            const tempTotal = (data.cart || []).reduce(
                (sum, item) => sum + item.unitPrice * item.quantity,
                0
            );
            setTotal(tempTotal);
        } catch (err) {
            console.error('Error fetching cart for checkout:', err);
            setError('Không thể tải giỏ hàng. Vui lòng thử lại.');
            setCartItems([]);
            setTotal(0);
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
            }
        }
    }, [navigate]);

    useEffect(() => {
        const loadCheckoutData = async () => {
            setIsLoading(true);
            // await fetchUserDataAndAddresses();
            await fetchCart();
            setIsLoading(false);
        };
        loadCheckoutData();
    }, [fetchCart]);

    useEffect(() => {
        let fee = 0;
        if (shippingMethod === 'standard') fee = 20000;
        else if (shippingMethod === 'express') fee = 50000;
        setShippingFee(fee);
        setFinalTotal(total + fee);
    }, [shippingMethod, total]);

    
    const handleShippingChange = (e) => {
        setShippingMethod(e.target.value);
    };

    const handlePaymentChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handlePlaceOrder = async () => {
     
    };

    if (isLoading) {
        return <div className={cx('loading')}>Đang tải trang thanh toán...</div>;
    }

    if (error) {
        return <div className={cx('error')}>{error}</div>;
    }

    return (
        <div className={cx('checkoutWrapper')}>
             <ToastContainer 
                    position="top-center"  //  Đặt ở góc dưới bên trái
                    autoClose={3000}         // Tự động tắt sau 3 giây (có thể chỉnh)
                    hideProgressBar={true}  //  thanh tiến trình
                    newestOnTop={false}    //Toast mới sẽ hiện dưới các toast cũ.
                    closeOnClick            //Cho phép đóng toast
                    draggable
                />
            <div className={cx('checkoutContainer')}>
                        <section className={cx('checkoutLeft', 'section')}>
                    <h2>Đơn hàng của bạn ({cartItems.length} sản phẩm)</h2>
                    {cartItems.map((item) => (
                        <div key={item._id} className={cx('checkoutItem')}>
                            <img
                                src={item.image || 'https://via.placeholder.com/80'}
                                alt={item.name}
                                className={cx('checkoutItemImage')}
                            />
                            <div className={cx('checkoutItemInfo')}>
                                <span className={cx('checkoutItemName')}>{item.name}</span>
                                <span className={cx('checkoutItemQuantity')}>
                                    Số lượng: {item.quantity}
                                </span>
                                <span className={cx('checkoutItemPrice')}>
                                    {(item.unitPrice * item.quantity).toLocaleString()} VND
                                </span>
                            </div>
                        </div>
                    ))}
                </section>

                <section className={cx('checkoutRight', 'section')}>
                    <div className={cx('checkoutSummary')}>
                        <h2>Tóm tắt đơn hàng</h2>

                        <div className={cx('formGroup')}>
                            <div className={cx('summarySection')}>
                                <span>Chọn địa chỉ giao hàng:</span>
                                <select value={selectedAddress} required>
                                    
                                </select>
                            </div>

                            <div className={cx('summarySection')}>
                                <span>Chọn phương thức giao hàng:</span>
                                <select value={shippingMethod} onChange={handleShippingChange}>
                                    <option value="standard">Giao hàng tiêu chuẩn ({ (20000).toLocaleString() } VND)</option>
                                    <option value="express">Giao hàng nhanh ({ (50000).toLocaleString() } VND)</option>
                                </select>
                            </div>

                            <div className={cx('summarySection')}>
                                <span>Chọn phương thức thanh toán:</span>
                                <select value={paymentMethod} onChange={handlePaymentChange}>
                                    <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                                    <option value="vnpay">Thanh toán qua VNPay</option>
                                </select>
                            </div>
                        </div>

                        <div className={cx('calculationSummary')}>
                            <div className={cx('summaryItem')}>
                                <span>Tạm tính:</span>
                                <span>{total.toLocaleString()} VND</span>
                            </div>
                            <div className={cx('summaryItem')}>
                                <span>Phí vận chuyển:</span>
                                <span>{shippingFee.toLocaleString()} VND</span>
                            </div>
                            <div className={cx('summaryItemTotal')}>
                                <span>Thành tiền:</span>
                                <span>{finalTotal.toLocaleString()} VND</span>
                            </div>
                        </div>

                        <div className={cx('checkoutButtonContainer')}>
                            <Button
                                primary
                                className={cx('checkoutButton')}
                                onClick={handlePlaceOrder}
                                disabled={!selectedAddress || isLoading || cartItems.some(item => item.quantity > item.availableQuantity)}
                            >
                                {isLoading ? 'Đang xử lý...' : (paymentMethod === 'vnpay' ? 'Thanh toán VNPay' : 'Đặt hàng COD')}
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Checkout;