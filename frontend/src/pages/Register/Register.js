import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '~/services/authService';
import classNames from 'classnames/bind';
import styles from './Register.module.scss';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Mật khẩu không khớp!', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                draggable: true,
            });
            return;
        }

        setLoading(true);
        try {
            const dataSend = {
                userNameAccount: formData.username,
                userName: formData.username,
                userEmail: formData.email,
                userPassword: formData.password,
            };
            const res = await authService.register(dataSend);
            toast.success(res.message || 'Đăng ký thành công!', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                draggable: true,
            });

            setTimeout(() => {
                navigate('/login');
            }, 1500); // delay một chút để toast hiển thị
        } catch (err) {
            toast.error('Đăng ký thất bại, vui lòng thử lại.', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                draggable: true,
            });
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <form className={cx('login-form')} onSubmit={handleSubmit}>
                <h1 className={cx('title')}>Đăng ký tài khoản</h1>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Tên đăng nhập</label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Tên đăng nhập"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={cx('form-group')}>
                    <label className={cx('label')}>Mật khẩu</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Mật khẩu"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={cx('form-group')}>
                    <label className={cx('label')}>Xác nhận mật khẩu</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Xác nhận mật khẩu"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={cx('form-group')}>
                    <label className={cx('label')}>Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button className={cx('register-btn')} type="submit" disabled={loading}>
                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>

                <div className={cx('action-btn')}>
                    <p className={cx('text')}>Bạn đã có tài khoản?</p>
                    <button className={cx('login-btn')} type="button" onClick={() => navigate('/login')}>
                        Đăng nhập
                    </button>
                </div>
            </form>

            {/* Toast container hiển thị thông báo */}
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
        </div>
    );
}

export default Register;
