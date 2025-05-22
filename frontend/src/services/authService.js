import * as httpRequest from '~/utils/httpRequest';

export const login = async ({ userNameAccount, userPassword, rememberMe }) => {
    try {
        const res = await httpRequest.post('auth/login', { userNameAccount, userPassword, rememberMe });
        const user = res.user;
        return { user };
    } catch (error) {
        throw error;
    }
};
export const fetchUser = async () => {
    try {
        const res = await httpRequest.get('users/me');
        return res;
    } catch (err) {
        throw err;
    }
};
export const register = async (registerData) => {
    try {
        const res = await httpRequest.post('auth/register', registerData);
        return res;
    } catch (error) {
        throw error;
    }
};

export const forgotPassword = async (email) => {
    try {
        const res = await httpRequest.post('auth/forgot-password', email);
        return res;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        await httpRequest.post('auth/logout');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
    } catch (error) {
        throw error;
    }
};
