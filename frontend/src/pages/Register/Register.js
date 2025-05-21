import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '~/services/authService';
import classNames from 'classnames/bind';
import styles from './Register.module.scss';

const cx = classNames.bind(styles);

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu không khớp!');
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
            alert(res.message || 'Đăng ký thành công!'); // Dùng message server trả về
            navigate('/login');
            setLoading(false);
        } catch (err) {
            setLoading(false);
            setError('Đăng ký thất bại, vui lòng thử lại1.');
            console.log(err);
        }
    };
    return (
        <div className={cx('wrapper')}>
            <form className={cx('login-form')} onSubmit={handleSubmit}>
                <h1 className={cx('title')}>Đăng ký tài khoản</h1>

                {error && <p className={cx('error-message')}>{error}</p>}

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Tên đăng nhập</label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Tên đăng nhập"
                        value={formData.username}
                        onChange={handleChange}
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
                    />
                </div>

                <button className={cx('register-btn')} type="submit">
                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>
                <div className={cx('action-btn')}>
                    <p className={cx('text')}>Bạn đã có tài khoản?</p>
                    <button className={cx('login-btn')} type="button" onClick={() => navigate('/login')}>
                        Đăng nhập
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Register;
