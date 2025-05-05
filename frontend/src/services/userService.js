import * as httpRequest from '~/utils/httpRequest';

export const getUserById = async (userId) => {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        return await httpRequest.get(`/users/${userId}`, { headers });
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// Cập nhật user theo ID
export const updateUserById = async (userId, user) => {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers = {
            Authorization: `Bearer ${token}`,
        };
        return await httpRequest.put(`/users/${userId}`, user, { headers });
    } catch (err) {
        console.log(err);
        throw err;
    }
};
