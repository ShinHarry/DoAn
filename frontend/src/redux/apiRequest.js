import { loginSuccess, registerStart, registerSuccess, registerFailure, logoutSuccess } from './authSlice';
import axios from 'axios';

// Login function
export const login = async (dispatch, navigate, credentials) => {
    try {
        const response = await axios.post('/api/login', credentials); // Gọi API login của bạn
        dispatch(loginSuccess(response.data)); // Lưu thông tin người dùng vào Redux
        localStorage.setItem('token', response.data.token); // Lưu token vào localStorage nếu cần
        navigate('/'); // Điều hướng đến trang chủ sau khi login thành công
    } catch (error) {
        console.error('Login failed', error);
        // Xử lý lỗi nếu cần
    }
};

// Logout function
export const logout = (dispatch, navigate) => {
    localStorage.removeItem('token'); // Xoá token khỏi localStorage
    dispatch(logoutSuccess()); // Xóa thông tin người dùng trong Redux
    navigate('/login'); // Điều hướng đến trang login
};

// Register function
export const register = async (dispatch, navigate, userData) => {
    dispatch(registerStart()); // Đánh dấu trạng thái là 'loading'
    try {
        const response = await axios.post('/api/register', userData); // Gọi API register của bạn
        dispatch(registerSuccess()); // Đánh dấu đăng ký thành công
        navigate('/login'); // Điều hướng đến trang đăng nhập
    } catch (error) {
        console.error('Registration failed', error);
        dispatch(registerFailure(error.response?.data?.message || 'Registration failed'));
    }
};
