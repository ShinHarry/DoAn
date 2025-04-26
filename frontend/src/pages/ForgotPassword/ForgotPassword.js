import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '~/services/authService';
import classNames from 'classnames/bind';
import styles from './ForgotPassword.module.scss';

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
                alert('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.');
                alert(`Mật khẩu mới của bạn à: ${res.newPassword}`);
                navigate('/login');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Có lỗi xảy ra, vui lòng thử lại.');
            }
        }
    };

    return (
        <div className={cx('wrapper')}>
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
