import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Address.module.scss';
import Button from '~/components/Button';

const cx = classNames.bind(styles);


function AddressUI() {
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);

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

        </div>
    );
}

export default AddressUI;
