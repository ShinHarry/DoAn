import * as httpRequest from '~/utils/httpRequest';

export const login = async ({ userNameAccount, userPassword, rememberMe }) => {
    try {
        const res = await httpRequest.post('auth/login', { userNameAccount, userPassword });

        const token = res.token;
        const user = res.user;
        if (rememberMe) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));
        }

        return { token, user };
    } catch (error) {
        throw error;
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
