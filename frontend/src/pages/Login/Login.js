import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '~/redux/actions/authActions';
import classNames from 'classnames/bind';
import styles from './Login.module.scss';

const cx = classNames.bind(styles);

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const currentUser = useSelector((state) => state.auth.login.currentUser);

    useEffect(() => {
        if (currentUser) {
            const role = currentUser.role;
            if (role === 'admin') {
                navigate('/admindashboard');
            } else if (role === 'mod') {
                navigate('/moddashboard');
            } else if (role === 'cus') {
                navigate('/');
            }
        }
    }, [currentUser, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await dispatch(
                login({
                    userNameAccount: username,
                    userPassword: password,
                    rememberMe,
                }),
            );
            alert('Đăng nhập thành công!');
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Đăng nhập thất bại, vui lòng thử lại.');
            }
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
                        onChange={(e) => setUsername(e.target.value)}
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
        </div>
    );
}

export default Login;
