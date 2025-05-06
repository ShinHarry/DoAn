import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Address.module.scss';
import Button from '~/components/Button';
import * as userService from '~/services/userService';

const cx = classNames.bind(styles);

const initialFormData = {
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    country: '', // Or set a default country if applicable
};

function AddressUI() {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const navigate = useNavigate();
    const [user, setUser] = useState(null);

     // lấy userdata
     useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
        if (!storedUser) {
            navigate('/login'); 
        } else {
            setUser(storedUser);
        }
    }, [navigate]);

    // Fetch lấy address
    const fetchAddresses = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await userService.getUserAddresses(user.id); 
            setAddresses(response || []); // đảm bảo là 1 array
        } catch (err) {
            console.error("Error fetching addresses:", err);
            setError('Không thể tải danh sách địa chỉ.');
            // xử lý lỗi unauthorized
            if (err.response?.status === 401 || err.response?.status === 403) {
                 navigate('/login');
             }
        } finally {
            setIsLoading(false);
        }
    }, [user, navigate]);

    // có người dùng thì gọi fetchAddress
    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user, fetchAddresses]);

    return (
        <div className={cx('wrapper')}>
            <h1 className={cx('title')}>Sổ Địa Chỉ</h1>

            <Button 
                primary 
                className={cx('addAddressBtn')}
                onClick={() => setShowForm(!showForm)}
            >
                {showForm ? 'Đóng Form' : 'Thêm địa chỉ mới'}
            </Button>

            {showForm && (
                <form className={cx('addressForm')} >
                    <h3>Thêm địa chỉ mới</h3>
                    <div className={cx('formGroup')}>
                        <label htmlFor="fullName">Họ và tên</label>
                        <input type="text" id="fullName" name="fullName" value="" required />
                    </div>
                    <div className={cx('formGroup')}>
                        <label htmlFor="phoneNumber">Số điện thoại</label>
                        <input type="tel" id="phoneNumber" name="phoneNumber" value="" required />
                    </div>
                    <div className={cx('formGroup')}>
                        <label htmlFor="address">Địa chỉ cụ thể</label>
                        <input type="text" id="address" name="address" value="" required />
                    </div>
                    <div className={cx('formGroup')}>
                        <label htmlFor="city">Tỉnh/Thành phố</label>
                        <input type="text" id="city" name="city" value="" required />
                    </div>
                    <div className={cx('formGroup')}>
                        <label htmlFor="country">Quốc gia</label>
                        <input type="text" id="country" name="country" value="" required />
                    </div>
                    <div className={cx('formActions')}>
                        <Button type="button" onClick={() => {  }}>Hủy</Button>
                        <Button primary type="submit">Lưu địa chỉ</Button>
                    </div>
                </form>
            )}

            {addresses.length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '30px' }}>Bạn chưa có địa chỉ nào được lưu.</p>
            )}

            <ul className={cx('addressList')}>
                {addresses.map((addr) => (
                    <li key={addr._id} className={cx('addressItem')}>
                        <div className={cx('addressInfo')}>
                            <p><strong>Họ tên:</strong> {addr.fullName}</p>
                            <p><strong>Điện thoại:</strong> {addr.phoneNumber}</p>
                            <p><strong>Địa chỉ:</strong> {`${addr.address}, ${addr.city}, ${addr.country}`}</p>
                        </div>
                        <div className={cx('addressActions')}>
                            <Button 
                                small 
                                danger 
                                // onClick={() => handleDeleteAddress(addr._id)} 
                                disabled={isLoading}
                            >
                                Xóa
                            </Button>
                        </div>
                    </li> 
                ))}
            </ul>
        </div>
    );
}

export default AddressUI;
