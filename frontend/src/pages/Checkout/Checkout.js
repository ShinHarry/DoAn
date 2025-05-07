import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import Button from '~/components/Button';
import styles from './Checkout.module.scss';
import * as cartService from '~/services/cartService';
import * as userService from '~/services/userService';
import * as paymentMethodService from '~/services/paymentMethodService';
import * as orderService from '~/services/orderService';
import * as paymentService from '~/services/paymentService';
import { toast, ToastContainer  } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function Checkout() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [shippingFee, setShippingFee] = useState(0);
    const [finalTotal, setFinalTotal] = useState(0);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');



    //lấy danh sách địa chỉ và setaddress bằng địa chỉ đầu
    const fetchUserDataAndAddresses = useCallback(async () => {
        try {
            const userFromStorage = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
            if (!userFromStorage?.id) {
                throw new Error("User not logged in");
            }
            setUserData(userFromStorage);
            const fetchedAddresses = await userService.getUserAddresses();
            setAddresses(fetchedAddresses || []);
            
            if (fetchedAddresses && fetchedAddresses.length > 0) {
                const firstAddress = fetchedAddresses[0];
                const firstAddressString = `${firstAddress.address}, ${firstAddress.city}, ${firstAddress.country}`;
                setSelectedAddress(firstAddress._id);
                setAddress(firstAddressString);
                setPhone(firstAddress.phoneNumber);
                setName(firstAddress.fullName);
    
            } else {
                setSelectedAddress('');
            }
        } catch (err) {
            console.error("Error fetching user data/addresses:", err);
            if (err.message === "User not logged in" || err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
            }
        }
    }, [navigate]);

    //lấy sản phẩm trong giỏ
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
            // const tempTotal = (data.cart || []).reduce(
            //     (sum, item) => sum + item.unitPrice * item.quantity,
            //     0
            // );
            setTotal(data.totalPrice);
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

    // lấy paymment method
    useEffect(() => {
        const fetchMethod= async () => {
            try {
              const response = await paymentMethodService.getPaymentMethod(); 
              console.log(response)
              setPaymentMethods(response);
            } catch (error) {
              console.error('Lỗi lấy danh sách phương thức thanh toán', error);
            }
        }
        fetchMethod();

        }, []);

    useEffect(() => {
        const loadCheckoutData = async () => {
            setIsLoading(true);
            await fetchUserDataAndAddresses();
            await fetchCart();
            setIsLoading(false);
        };
        loadCheckoutData();
    }, [fetchCart, fetchUserDataAndAddresses]);

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

    const handleAddressChange = (e) => {
        const newSelectedId = e.target.value;
        setSelectedAddress(newSelectedId);
        
        const selectedAddr = addresses.find(addr => addr._id === newSelectedId);
        if (selectedAddr) {
            const fullAddress = `${selectedAddr.address}, ${selectedAddr.city}, ${selectedAddr.country}`;
            setAddress(fullAddress);
            setPhone(selectedAddr.phoneNumber);
            setName(selectedAddr.fullName);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.warning('Vui lòng chọn địa chỉ giao hàng!');
            return;
        }
        if (cartItems.some(item => item.quantity > item.availableQuantity)) { // duyệt qua mảng nếu có sl lớn hơn trả về true
            toast.error('Một số sản phẩm trong giỏ hàng không đủ số lượng tồn kho. Vui lòng kiểm tra lại giỏ hàng.');
            navigate('/cart-detail');
            return;
        }

        const orderDetails = {
            orderItems: cartItems.map(item => ({
                product: item.productId,
                quantity: item.quantity,
                price: item.unitPrice,
            })),
            shippingAddress: address,
            phone: phone,
            name: name,
            shippingMethod,
            shippingFee,
            totalPrice: total,
            totalAmount: finalTotal,
            paymentMethod,
            user: userData?.id,
        };

        console.log('Placing Order:', orderDetails);
        setIsLoading(true);

        if (paymentMethod === 'cod') {
            try {
                const response = await orderService.createOrder(orderDetails);
                console.log("COD Order Response:", response);
                // toast.error('Đặt hàng COD thành công!');
                if (response.order?._id) {
                    navigate(`/order-success/${response.order._id}`);
                } else {
                    navigate('/order-success');
                }
            } catch (err) {
                console.error("COD Order Error:", err);
                toast.error(err.response?.data?.message || 'Đặt hàng COD thất bại. Vui lòng thử lại.');
            }
        }else if (paymentMethod === 'vnpay') {
            try {
                const returnUrl = `${window.location.origin}/payment-return`;
                
                const orderInfo = `Thanh toan don hang checkout #${Date.now()}`;
                
                const response = await paymentService.createVnpayPaymentUrl(
                    finalTotal,
                    orderInfo, 
                    returnUrl
                );
                
                console.log("VNPay URL Response:", response);
                if (response.success && response.paymentUrl) {
                    console.log("VNPay URL Response: thành công");
                    window.location.href = response.paymentUrl; 
                } else {
                    toast.error(response.message || 'Không thể tạo link thanh toán VNPay. Vui lòng thử lại hoặc chọn phương thức khác.');
                }
            } catch (err) {
                console.error("VNPay Error:", err);
                toast.error(err.response?.data?.message || 'Tạo thanh toán VNPay thất bại. Vui lòng thử lại hoặc chọn phương thức khác.');
            }
        }
        setIsLoading(false);

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
                                <select className={cx('selectSmall')} value={selectedAddress}  onChange={handleAddressChange} required>
                                    <option value="" disabled={addresses.length > 0}>-- Chọn địa chỉ --</option>
                                    {
                                        addresses.map((addr, index) => {
                                            const addressString = `${addr.address}, ${addr.city}, ${addr.country}`;
                                            return (
                                                <option key={index} value={addr._id}>
                                                    {addressString}
                                                </option>
                                            );
                                        })
                                    }
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
                                    {paymentMethods.map((method) => (
                                        <option key={method._id} value={method.paymentType}>
                                            {method.name}
                                        </option>
                                    ))}
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