import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '~/redux/actions/authActions';
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const result = await dispatch(
                login({
                    userNameAccount: username,
                    userPassword: password,
                    rememberMe,
                }),
            );

            const user = result?.user;
            if (user) {
                const role = user.userRole;
                const status = user.userStatus;

                if (status === 'banned') {
                    toast.error('Tài khoản của bạn đã bị khóa!', {
                        position: 'top-center',
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        draggable: true,
                    });
                    return;
                }

                toast.success('Đăng nhập thành công!', {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    draggable: true,
                });

                if (role === 'admin') {
                    navigate('/admindashboard');
                } else if (role === 'mod') {
                    navigate('/moddashboard/productlist');
                } else if (role === 'accountant') {
                    navigate('/moddashboard/statistics');
                } else if (role === 'cus') {
                    navigate('/');
                }
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Đăng nhập thất bại, vui lòng thử lại.';
            setError(message);
            console.log('err:', err);
            toast.error(message, {
                position: 'top-center',
                autoClose: 3000,
            });
        }
    };

    return (
        <div className={cx('wrapper')}>
            <form className={cx('login-form')} onSubmit={handleLogin}>
                <h1 className={cx('title')}>Login to Smart Market</h1>

                {error && <p className={cx('error-message')}>{error}</p>}

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Tên đăng nhập</label>
                    <input
                        className={cx('input')}
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.trim().toLowerCase())}
                        required
                    />
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Mật khẩu</label>
                    <input
                        className={cx('input')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className={cx('options')}>
                    <div className={cx('remember-me')}>
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="rememberMe" className={cx('remember-label')}>
                            Ghi nhớ đăng nhập
                        </label>
                    </div>

                    <div className={cx('show-password')}>
                        <input
                            type="checkbox"
                            id="showPassword"
                            checked={showPassword}
                            onChange={(e) => setShowPassword(e.target.checked)}
                        />
                        <label htmlFor="showPassword" className={cx('show-label')}>
                            Hiện mật khẩu
                        </label>
                    </div>
                </div>

                <button className={cx('login-btn')} type="submit">
                    Login
                </button>

                <div className={cx('action-btn')}>
                    <button className={cx('register-btn')} type="button" onClick={() => navigate('/register')}>
                        Register
                    </button>
                    <button
                        className={cx('forgot-password-btn')}
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                    >
                        Forgot Password
                    </button>
                </div>
            </form>

            <ToastContainer />
        </div>
    );
}

export default Login;
