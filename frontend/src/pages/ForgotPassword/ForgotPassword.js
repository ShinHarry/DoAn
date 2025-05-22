import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '~/services/authService';
import classNames from 'classnames/bind';
import styles from './ForgotPassword.module.scss';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        if (name === 'email') {
            setEmail(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await authService.forgotPassword({ email });

            if (res) {
                toast.success('Quên mật khẩu thành công. Bạn hãy kiểm tra email để lấy mật khẩu mới!!', {
                    position: 'top-center',
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    draggable: true,
                });
                setTimeout(() => navigate('/login'), 2500);
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Có lỗi xảy ra, vui lòng thử lại.');
            }
        }
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <form className={cx('forgot-password-form')} onSubmit={handleSubmit}>
                <h2 className={cx('title')}>Forgot Password</h2>
                {error && <p className={cx('error-message')}>{error}</p>}
                <div className={cx('form-group')}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        required
                        onChange={handleOnChange}
                    />
                </div>
                <button type="submit" className={cx('forgot-password-btn')}>
                    Xác nhận
                </button>
                <button type="button" className={cx('cancel-btn')} onClick={() => navigate('/login')}>
                    Quay lại
                </button>
            </form>
        </div>
    );
}

export default ForgotPassword;
