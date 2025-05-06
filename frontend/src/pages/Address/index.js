import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Address.module.scss';
import Button from '~/components/Button';
import * as userService from '~/services/userService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    const [formData, setFormData] = useState(initialFormData);
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

      // xử lý thay đổi input
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // xử lý thêm địa chỉ mới
    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);
        try {
            await userService.addAddress(formData); 
            toast.success('Thêm địa chỉ thành công!');
            setFormData(initialFormData); // Reset form
            setShowForm(false); // Ẩn form
            await fetchAddresses(); // làm mới lại address list
        } catch (err) {
            console.error("Error adding address:", err);
            toast.error(err.response?.data?.message || 'Thêm địa chỉ thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    // xử lý xóa address
    const handleDeleteAddress = async (addressId) => {
        if (!user) return;
        if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
            setIsLoading(true);
            try {
                await userService.deleteAddress(addressId); 
                toast.success('Xóa địa chỉ thành công!');
                await fetchAddresses(); 
            } catch (err) {
                console.error("Error deleting address:", err);
                toast.error(err.response?.data?.message || 'Xóa địa chỉ thất bại.');
            } finally {
                 setIsLoading(false);
            }
        }
    };

    // Render logic
    if (!user) {
        return null; 
   }

   if (isLoading && addresses.length === 0) {
       return <div className={cx('loading')}>Đang tải địa chỉ...</div>;
   }

   if (error) {
       return <div className={cx('error')}>{error}</div>;
   }

    return (
        <div className={cx('wrapper')}>
            <ToastContainer 
                        position="top-center" 
                        autoClose={3000}         // Tự động tắt
                        hideProgressBar={true}  //  thanh tiến trình
                        newestOnTop={false}    //Toast mới sẽ hiện dưới các toast cũ.
                        closeOnClick            //Cho phép đóng toast
                        draggable             // kéo 
                    />
            <h1 className={cx('title')}>Sổ Địa Chỉ</h1>

            <Button 
                primary 
                className={cx('addAddressBtn')}
                onClick={() => setShowForm(!showForm)}
            >
                {showForm ? 'Đóng Form' : 'Thêm địa chỉ mới'}
            </Button>

            {/* Address Form */}
            {showForm && (
                <form className={cx('addressForm')} onSubmit={handleAddAddress}>
                    <h3>Thêm địa chỉ mới</h3> 
                    <div className={cx('formGroup')}>
                        <label htmlFor="fullName">Họ và tên</label>
                        <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                    </div>
                    <div className={cx('formGroup')}>
                        <label htmlFor="phoneNumber">Số điện thoại</label>
                        <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required />
                    </div>
                    <div className={cx('formGroup')}>
                        <label htmlFor="address">Địa chỉ cụ thể (Số nhà, tên đường, phường/xã)</label>
                        <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} required />
                    </div>
                    <div className={cx('formGroup')}>
                        <label htmlFor="city">Tỉnh/Thành phố</label>
                        <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                    </div>
                    <div className={cx('formGroup')}>
                        <label htmlFor="country">Quốc gia</label>
                        <input type="text" id="country" name="country" value={formData.country} onChange={handleInputChange} required />
                    </div>
                    <div className={cx('formActions')}>
                        <Button type="button" onClick={() => { setShowForm(false); setFormData(initialFormData); }}>Hủy</Button>
                        <Button primary type="submit" disabled={isLoading}>
                            {isLoading ? 'Đang lưu...' : 'Lưu địa chỉ'}
                        </Button>
                    </div>
                </form>
            )}

            {/* Address List */}
            {addresses.length === 0 && !isLoading && (
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
                                onClick={() => handleDeleteAddress(addr._id)} 
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
