import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import Select from 'react-select';
import classNames from 'classnames/bind';
import Button from '~/components/Button';
import styles from './Checkout.module.scss';
import * as userService from '~/services/userService';
import * as paymentMethodService from '~/services/paymentMethodService';
import * as orderService from '~/services/orderService';
import * as paymentService from '~/services/paymentService';
import * as saleService from '~/services/saleService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchUser } from '~/redux/actions/authActions';

const cx = classNames.bind(styles);

function Checkout() {
    const navigate = useNavigate();
    // const cartItemsFromRedux = useSelector((state) => state.cart.items);
    const [cartItems, setCartItems] = useState([]);
    const [discount, setDiscount] = useState([]);
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [addresses, setAddresses] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);

    const [total, setTotal] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);
    const [finalTotal, setFinalTotal] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // payment method
    const [paymentMethod, setPaymentMethod] = useState('cod');
    // address
    const [selectedAddress, setSelectedAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    //giam gia
    const [discountCategory, setDiscountCategory] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [discountMessage, setDiscountMessage] = useState('');
    const [discountMessageType, setDiscountMessageType] = useState('');

    const [myDiscounts, setMyDiscounts] = useState([]);
    const [myDiscountType, setMyDiscountType] = useState(0);
    const [myDiscountAmount, setMyDiscountAmount] = useState(0);
    const [myDiscountMessage, setMyDiscountMessage] = useState('');
    const [myDiscountMessageType, setMyDiscountMessageType] = useState('');
    // tạo option cho my discount
    const discountOptions = [
        {
            value: '',
            label: (
                <div className={cx('discountOption')}>
                    <em>-- Không áp dụng mã giảm giá --</em>
                </div>
            ),
        },
        ...myDiscounts.map((item) => {
            const d = item.discount;
            return {
                value: d._id,
                label: (
                    <div className={cx('discountOption')}>
                        <img src={d.image?.link || null} alt={d.image?.alt || ''} className={cx('discountImage')} />
                        <div className={cx('discountInfo')}>
                            <div className={cx('discountTitle')}>
                                <strong>Áp dụng: {d.type}</strong>{' '}
                            </div>
                            <div className={cx('discountDesc')}>
                                Giảm {d.discount}% | Đơn tối thiểu {d.minimumOrder.toLocaleString()}đ | Giảm tối đa{' '}
                                {d.minimizeOrder.toLocaleString()}đ
                            </div>
                            <div className={cx('discountDate')}>
                                Ngày bắt đầu: {new Date(d.dateEnd).toLocaleDateString('vi-VN')} - Hết hạn:{' '}
                                {new Date(d.dateEnd).toLocaleDateString('vi-VN')}{' '}
                            </div>
                        </div>
                    </div>
                ),
            };
        }),
    ];
    const defaultDiscountOption = {
        value: '',
        label: (
            <div className={cx('discountOption')}>
                <em>-- Không áp dụng mã giảm giá --</em>
            </div>
        ),
    };
    const [selectedDiscount, setSelectedDiscount] = useState(defaultDiscountOption);
    //
    const currentUser = useSelector((state) => state.auth.login.currentUser);
    const dispatch = useDispatch();

    //lấy danh sách địa chỉ và setaddress bằng địa chỉ đầu
    const fetchUserDataAndAddresses = useCallback(async () => {
        try {
            const fetchedAddresses = await userService.getUserAddresses(currentUser?.user?._id);
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
            console.error('Error fetching user data/addresses:', err);
            if (err.message === 'User not logged in' || err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    //lấy sản phẩm trong giỏ
    const fetchCart = useCallback(async () => {
        setError(null);
        try {
            const cartData = JSON.parse(sessionStorage.getItem('selectedCartItems'));
            // console.log(cartData)
            if (!cartData && cartData.length === 0) {
                throw new Error('Không tìm thấy giỏ hàng hoặc giỏ hàng trống để tạo đơn hàng.');
            }
            setCartItems(cartData);
            const tempTotal = cartData.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
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

    // lấy paymment method và discount
    useEffect(() => {
        if (!currentUser) {
            dispatch(fetchUser());
        }
        const fetchMethod = async () => {
            try {
                const response = await paymentMethodService.getPaymentMethod();
                setPaymentMethods(response);
            } catch (error) {
                console.error('Lỗi lấy danh sách phương thức thanh toán', error);
            }
        };
        const fetchSales = async () => {
            try {
                const response = await saleService.getSale(); // API lấy danh sách discount
                // console.log('response :', response);
                setDiscount(response);
            } catch (error) {
                console.error('Lỗi lấy danh sách khuyến mãi', error);
            }
        };

        fetchSales();
        fetchMethod();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // lấy disscount hiện có của người dùng
    useEffect(() => {
        const fetchDiscountUser = async () => {
            try {
                const data = await saleService.getDiscountUser();
                const now = new Date();

                const filtered = (data || []).filter((item) => {
                    const discount = item.discount;
                    if (!discount || !discount.dateEnd) return false;
                    return new Date(discount.dateEnd) > now;
                });
                setMyDiscounts(filtered);
            } catch (error) {
                console.error('Lỗi lấy discount:', error);
                setMyDiscounts([]);
            }
        };
        fetchDiscountUser();
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
        setFinalTotal(total - discountAmount - myDiscountAmount + fee);
    }, [shippingMethod, total, discountAmount, myDiscountAmount]);

    //tính lại giảm giá vận chuyển khi phương thức vận chuyển thay đổi
    useEffect(() => {
        if (selectedDiscount && myDiscountType === 'phí vận chuyển') {
            handleApplyUserDiscount(selectedDiscount);
        }
    }, [shippingFee]);

    const handleShippingChange = (e) => {
        setShippingMethod(e.target.value);
    };

    const handlePaymentChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handleAddressChange = (e) => {
        const newSelectedId = e.target.value;
        setSelectedAddress(newSelectedId);

        const selectedAddr = addresses.find((addr) => addr._id === newSelectedId);
        if (selectedAddr) {
            const fullAddress = `${selectedAddr.address}, ${selectedAddr.city}, ${selectedAddr.country}`;
            setAddress(fullAddress);
            setPhone(selectedAddr.phoneNumber);
            setName(selectedAddr.fullName);
        }
    };
    //áp dụng discount danh mụcmục
    const handleApplyDiscountDM = (code) => {
        const selectedCode = code?.trim();
        const foundDiscount = discount.find((item) => item.name === selectedCode);

        const now = new Date();
        const discountEnd = new Date(foundDiscount.dateEnd);

        if (now > discountEnd) {
            setDiscountMessage('Mã giảm giá đã hết hạn.');
            setDiscountMessageType('errorMessage');
            return;
        }
        // Áp dụng giảm giá
        const discountPercent = foundDiscount.discount;
        const discountCategory = foundDiscount.product;
        let discountAmountCalc = 0;
        let hasEligibleProduct = false;

        cartItems.forEach((item) => {
            if (item.nameCategory === discountCategory) {
                hasEligibleProduct = true;
                const itemTotal = item.unitPrice * item.quantity;
                discountAmountCalc += (itemTotal * discountPercent) / 100;
            }
        });

        if (!hasEligibleProduct) {
            setDiscountMessage('Mã giảm giá không áp dụng được cho sản phẩm nào trong giỏ hàng.');
            setDiscountMessageType('errorMessage');
        } else {
            setDiscountMessage(`Áp dụng mã giảm giá thành công ${discountPercent}%!`);
            setDiscountMessageType('successMessage');
        }

        setDiscountCategory(discountCategory);
        setDiscountAmount(discountAmountCalc);
        // setFinalTotal(total + shippingFee - discountAmountCalc);
    };
    //áp dụng discount người  dùng
    const handleApplyUserDiscount = (e) => {
        if (e.value === '') {
            setMyDiscountAmount(0);
            setMyDiscountMessage('');
            setMyDiscountMessageType('');
            // setFinalTotal(total + shippingFee);
            return;
        }

        const selectedDiscountData = myDiscounts.find((item) => item.discount._id === e.value);

        if (!selectedDiscountData) return;

        const discountData = selectedDiscountData.discount;
        const now = new Date();
        const end = new Date(discountData.dateEnd);
        const start = new Date(discountData.dateStart);

        if (now < start) {
            setMyDiscountMessage('Mã giảm giá chưa đến ngày sử dụng.');
            setMyDiscountMessageType('errorMessage');
            return;
        }
        if (now > end) {
            setMyDiscountMessage('Mã giảm giá đã hết hạn.');
            setMyDiscountMessageType('errorMessage');
            return;
        }

        const discountPercent = discountData.discount;
        const type = discountData.type;
        const minimumOrder = discountData.minimumOrder;
        const maxDiscount = discountData.minimizeOrder;

        if (total < minimumOrder) {
            setMyDiscountMessage(`Đơn hàng phải đạt tối thiểu ${minimumOrder.toLocaleString()} VND để áp dụng mã.`);
            setMyDiscountMessageType('errorMessage');
            return;
        }

        let baseAmount = 0;

        if (type === 'Phí vận chuyển') {
            baseAmount = shippingFee;
            setMyDiscountType('phí vận chuyển');
        } else {
            baseAmount = total;
            setMyDiscountType('giá trị đơn hàng');
        }

        let calculatedDiscount = (baseAmount * discountPercent) / 100;
        if (calculatedDiscount > maxDiscount) {
            calculatedDiscount = maxDiscount;
        }

        setMyDiscountAmount(calculatedDiscount);
        setMyDiscountMessage(`Áp dụng mã giảm giá ${discountPercent}% - ${discountData.type} thành công!`);
        setMyDiscountMessageType('successMessage');
        setSelectedDiscount(e);
        // setFinalTotal(total + shippingFee - calculatedDiscount);
    };
    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.warning('Vui lòng chọn địa chỉ giao hàng!');
            return;
        }
        if (cartItems.some((item) => item.quantity > item.availableQuantity)) {
            // duyệt qua mảng nếu có sl lớn hơn trả về true
            toast.error('Một số sản phẩm trong giỏ hàng không đủ số lượng tồn kho. Vui lòng kiểm tra lại giỏ hàng.');
            navigate('/cart-detail');
            return;
        }

        const orderDetails = {
            orderItems: cartItems.map((item) => ({
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
            totalAmount: Math.max(finalTotal, 0),
            discountCode: selectedDiscount.value,
            discount: discountAmount + myDiscountAmount || 0,
            paymentMethod,
        };

        // console.log('Placing Order:', orderDetails);
        setIsLoading(true);

        if (paymentMethod === 'cod') {
            try {
                const response = await orderService.createOrder(orderDetails);
                console.log('COD Order Response:', response);
                // toast.success('Đặt hàng COD thành công!');
                if (response.order?._id) {
                    sessionStorage.removeItem('selectedCartItems');
                    window.dispatchEvent(new Event('cartUpdated'));
                    navigate(`/order-success/${response.order._id}`);
                } else {
                    navigate('/order-success');
                }
            } catch (err) {
                console.error('COD Order Error:', err);
                toast.error(err.response?.data?.message || 'Đặt hàng COD thất bại. Vui lòng thử lại.');
            }
        } else if (paymentMethod === 'vnpay') {
            try {
                const returnUrl = `${window.location.origin}/payment-return`;
                sessionStorage.setItem('shippingFee', shippingFee);
                sessionStorage.setItem('shippingAddress', address);
                sessionStorage.setItem('discountCode', selectedDiscount.value);
                sessionStorage.setItem('discountValue', discountAmount + myDiscountAmount);
                sessionStorage.setItem('name', name);
                sessionStorage.setItem('phone', phone);

                const orderInfo = `Thanh toan don hang checkout #${Date.now()}`;
                const amountVnpay = Math.round(finalTotal); // hoặc Math.floor
                const response = await paymentService.createVnpayPaymentUrl(amountVnpay, orderInfo, returnUrl);

                console.log('VNPay URL Response:', response);
                if (response.success && response.paymentUrl) {
                    console.log('VNPay URL Response: thành công');
                    window.location.href = response.paymentUrl;
                } else {
                    toast.error(
                        response.message ||
                            'Không thể tạo link thanh toán VNPay. Vui lòng thử lại hoặc chọn phương thức khác.',
                    );
                }
            } catch (err) {
                console.error('VNPay Error:', err);
                toast.error(
                    err.response?.data?.message ||
                        'Tạo thanh toán VNPay thất bại. Vui lòng thử lại hoặc chọn phương thức khác.',
                );
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
                position="top-center" //  Đặt ở góc dưới bên trái
                autoClose={3000} // Tự động tắt sau 3 giây (có thể chỉnh)
                hideProgressBar={true} //  thanh tiến trình
                newestOnTop={false} //Toast mới sẽ hiện dưới các toast cũ.
                closeOnClick //Cho phép đóng toast
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
                                    Số lượng: {item.quantity} - Danh mục: {item.nameCategory}
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
                                <select
                                    className={cx('selectSmall')}
                                    value={selectedAddress}
                                    onChange={handleAddressChange}
                                    required
                                >
                                    <option value="" disabled={addresses.length > 0}>
                                        -- Chọn địa chỉ --
                                    </option>
                                    {addresses.map((addr, index) => {
                                        const addressString = `${addr.address}, ${addr.city}, ${addr.country}`;
                                        return (
                                            <option key={index} value={addr._id}>
                                                {addressString}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className={cx('summarySection')}>
                                <span>Chọn phương thức giao hàng:</span>
                                <select value={shippingMethod} onChange={handleShippingChange}>
                                    <option value="standard">
                                        Giao hàng tiêu chuẩn ({(20000).toLocaleString()} VND)
                                    </option>
                                    <option value="express">Giao hàng nhanh ({(50000).toLocaleString()} VND)</option>
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

                            <div className={cx('summarySection')}>
                                <span>Chọn mã giảm giá hiện có:</span>
                                <div className={cx('discountWrapper')}>
                                    <Select
                                        options={discountOptions}
                                        value={selectedDiscount}
                                        onChange={(e) => {
                                            setSelectedDiscount(e);
                                            handleApplyUserDiscount(e);
                                        }}
                                        placeholder="Chọn mã giảm giá..."
                                        className={cx('customSelect')}
                                    />
                                </div>
                                {myDiscountMessage && (
                                    <div
                                        className={cx('discountMessage', {
                                            successMessage: myDiscountMessageType === 'successMessage',
                                            errorMessage: myDiscountMessageType === 'errorMessage',
                                        })}
                                    >
                                        {myDiscountMessage}
                                    </div>
                                )}
                                <span>Chọn mã giảm giá cho danh mục sản phẩm:</span>
                                <div className={cx('discountWrapper')}>
                                    <select
                                        value={discountCode}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setDiscountCode(value);
                                            if (value === '') {
                                                setDiscountAmount(0);
                                                setFinalTotal(total + shippingFee);
                                                setDiscountMessage('');
                                                setDiscountMessageType('');
                                                return;
                                            }

                                            // Khi chọn xong thì áp dụng luôn
                                            handleApplyDiscountDM(value);
                                        }}
                                        className={cx('discountSelect')}
                                    >
                                        <option value="">-- Lựa chọn --</option>
                                        {discount.map((item, index) => (
                                            <option key={index} value={item.name}>
                                                {item.name} - Giảm {item.discount}% cho sản phẩm {item.product}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {discountMessage && (
                                    <div
                                        className={cx('discountMessage', {
                                            successMessage: discountMessageType === 'successMessage',
                                            errorMessage: discountMessageType === 'errorMessage',
                                        })}
                                    >
                                        {discountMessage}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={cx('calculationSummary')}>
                            <div className={cx('summaryItem')}>
                                <span>Tạm tính:</span>
                                <span>{total.toLocaleString()} VND</span>
                            </div>
                            {myDiscountAmount > 0 && (
                                <div className={cx('summaryItem')}>
                                    <span>Giảm giá theo {myDiscountType} :</span>
                                    <span>-{myDiscountAmount.toLocaleString()} VND</span>
                                </div>
                            )}
                            {discountAmount > 0 && (
                                <div className={cx('summaryItem')}>
                                    <span>Giảm giá theo sản phẩm {discountCategory} :</span>
                                    <span>-{discountAmount.toLocaleString()} VND</span>
                                </div>
                            )}
                            <div className={cx('summaryItem')}>
                                <span>Phí vận chuyển:</span>
                                <span>{shippingFee.toLocaleString()} VND</span>
                            </div>
                            <div className={cx('summaryItemTotal')}>
                                <span>Thành tiền:</span>
                                <span>{Math.max(finalTotal, 0).toLocaleString()} VND</span>
                            </div>
                        </div>

                        <div className={cx('checkoutButtonContainer')}>
                            <Button
                                primary
                                className={cx('checkoutButton')}
                                onClick={handlePlaceOrder}
                                disabled={
                                    !selectedAddress ||
                                    isLoading ||
                                    cartItems.some((item) => item.quantity > item.availableQuantity)
                                }
                            >
                                {isLoading
                                    ? 'Đang xử lý...'
                                    : paymentMethod === 'vnpay'
                                    ? 'Thanh toán VNPay'
                                    : 'Đặt hàng COD'}
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Checkout;
