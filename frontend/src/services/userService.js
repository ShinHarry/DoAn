import * as httpRequest from '~/utils/httpRequest';

export const getUserById = async (userId) => {
    try {
        // const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        // const headers = {
        //     Authorization: `Bearer ${token}`,
        // };
        // return await httpRequest.get(`/users/${userId}`, { headers });
        return await httpRequest.get(`/users/${userId}`);
    } catch (err) {
        console.log(err);
        throw err;
    }
};


// --- Thêm phần quản lý địa chỉ--- //

// lấy addresses người dùng hiện tại
export const getUserAddresses = async () => {
    try {
        const response = await httpRequest.get('/users/me/addresses');
        return response.addresses; // []
    } catch (err) {
        console.error('Error getting user addresses:', err);
        throw err;
    }
};