import { loginSuccess, logoutSuccess, registerStart, registerSuccess, registerFailure } from '../slices/authSlice';
import * as authService from '~/services/authService';

export const login = (formData) => async (dispatch) => {
    try {
        const res = await authService.login(formData);
        console.log('Login successful:', res);
        dispatch(loginSuccess(res));
        return res;
    } catch (err) {
        console.error('Login failed:', err.message);
        throw err;
    }
};
export const fetchUser = () => async (dispatch) => {
    try {
        const user = await authService.fetchUser();
        console.log('Fetch user successful:', user);
        dispatch(loginSuccess(user));
        return user;
    } catch (err) {
        // console.error('Fetch user failed:', err.message);
    }
};

export const logout = () => async (dispatch) => {
    try {
        await authService.logout(); // Gọi API logout trên server
        dispatch(logoutSuccess()); // Sau đó reset state user trên client
    } catch (err) {
        console.error('Logout failed:', err.message);
        throw err;
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
