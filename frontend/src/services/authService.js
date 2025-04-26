import * as httpRequest from '~/utils/httpRequest';

export const login = async ({ userNameAccount, userPassword }) => {
    try {
        const res = await httpRequest.post('auth/login', { userNameAccount, userPassword });
        return res;
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
