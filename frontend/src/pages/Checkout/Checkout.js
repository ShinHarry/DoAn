import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { jwtDecode } from 'jwt-decode';

import Button from '~/components/Button';
import styles from './Checkout.module.scss';
import { toast, ToastContainer  } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import * as checkoutService from '~/services/checkoutService';

const cx = classNames.bind(styles);

function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [shippingFee, setShippingFee] = useState(20000);
    const [finalTotal, setFinalTotal] = useState(0);
    const [selectedAddress, setSelectedAddress] = useState('');

    const [paymentMethod, setPaymentMethod] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

    const getToken = () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) return null;
            try {
                const decoded = jwtDecode(token);
                return {
                    userId: decoded.userId,
                    userRole: decoded.userRole,
                    avatar: decoded.userAvatar || null,
                };
            } catch (error) {
                 console.error('Token decode error:', error);
                return null;
            }
        };
        
        const { userId, avatar } = getToken() || {};


    const addresses = [
        '123 Đường A, Quận 1, TP.HCM',
        '456 Đường B, Quận 2, TP.HCM',
        '789 Đường C, Hà Nội',
    ];


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
                <div className={cx('checkoutLeft')}>
                    <h2>Đơn hàng của bạn</h2>
                    {/* {cartItems.length > 0 ? ( */}
                        {/* cartItems.map((item) => ( */}
                            <div className={cx('checkoutItem')}>
                                <img
                                    // src={item.image}
                                    // alt={item.name}
                                    className={cx('checkoutItemImage')}
                                />
                                <div className={cx('checkoutItemInfo')}>
                                    <span className={cx('checkoutItemName')}>name</span>
                                    <span className={cx('checkoutItemQuantity')}>
                                        Số lượng: 
                                    </span>
                                    <span className={cx('checkoutItemPrice')}>
                                        Giá:  VND
                                    </span>
                                </div>
                            </div>
                        {/* )) */}
                    {/* ) : (
                        <p>Không có sản phẩm nào.</p>
                    )} */}
                </div>

                <div className={cx('checkoutRight')}>
                    <div className={cx('checkoutSummary')}>
                        <h2>Tóm tắt đơn hàng</h2>

                        <div className={cx('summaryItem')}>
                            <span>Tạm tính:</span>
                            <span> VND</span>
                        </div>

                        <div className={cx('summarySection')}>
                            <span>Chọn phương thức giao hàng:</span>
                            <select value={shippingMethod} >
                                <option value="standard">Giao hàng tiêu chuẩn (20,000 VND)</option>
                                <option value="express">Giao hàng nhanh (50,000 VND)</option>
                            </select>
                        </div>

                        <div className={cx('summarySection')}>
                            <span>Chọn địa chỉ giao hàng:</span>
                            <select value={selectedAddress} >
                                <option value="">-- Chọn địa chỉ --</option>
                            </select>
                        </div>

                        <div className={cx('summarySection')}>
                            <span>Chọn phương thức thanh toán:</span>
                            <select value={paymentMethod} >
                                    <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                                    <option value="vnpay">Thanh toán qua VNPay</option>
                                </select>
                        </div>

                        <div className={cx('summaryItem')}>
                            <span>Phí vận chuyển:</span>
                            <span> VND</span>
                        </div>

                        <div className={cx('summaryItemTotal')}>
                            <span>Thành tiền:</span>
                            <span> VND</span>
                        </div>
                       
                        
                        <Button primary >
                            Đặt hàng
                        </Button>
                        
                        
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;