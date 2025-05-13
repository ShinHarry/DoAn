// src/redux/actions/authActions.js
import { loginSuccess, logoutSuccess, registerStart, registerSuccess, registerFailure } from '../slices/authSlice';

import * as authService from '~/services/authService';

export const login = (formData) => async (dispatch) => {
    try {
        const { token, user } = await authService.login(formData);
        dispatch(loginSuccess(user));
        return { token, user }; // Trả về token và user nếu cần thiết
    } catch (err) {
        console.error('Login failed:', err.message);
        throw err;
    }
};
export const logout = () => async (dispatch) => {
    try {
        // Gọi API nếu cần hoặc đơn giản chỉ xóa token
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        dispatch(logoutSuccess());
    } catch (err) {
        console.error('Logout failed:', err.message);
    }
};

export const register = (formData) => async (dispatch) => {
    dispatch(registerStart());
    try {
        await authService.register(formData);
        dispatch(registerSuccess());
    } catch (err) {
        dispatch(registerFailure(err.message));
    }
};
