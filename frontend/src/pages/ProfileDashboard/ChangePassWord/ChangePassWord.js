import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ChangePassWord.module.scss';
import Button from '~/components/Button';
import * as userService from '~/services/userService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function ChangePassWord() {
    const { userId } = useParams();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Xử lý submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) return;

        const { newPassword, confirmPassword } = formData;

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp!', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                draggable: true,
            });
            return;
        }

        try {
            setIsLoading(true);
            await userService.changePassword(userId, formData);
            toast.success('Đổi mật khẩu thành công!', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                draggable: true,
            });
            setFormData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
            <div className={cx('container')}>
                <h2 className={cx('title')}>Đổi mật khẩu</h2>
                <form className={cx('form')} onSubmit={handleSubmit}>
                    <div className={cx('form-group')}>
                        <label htmlFor="oldPassword">Mật khẩu cũ</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="oldPassword"
                            name="oldPassword"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="newPassword">Mật khẩu mới</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={cx('form-group')}>
                        <label>
                            <input type="checkbox" checked={showPassword} onChange={togglePasswordVisibility} /> Hiện
                            mật khẩu
                        </label>
                    </div>

                    <Button primary type="submit" disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </Button>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
}

export default ChangePassWord;
