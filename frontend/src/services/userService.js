import * as httpRequest from '~/utils/httpRequest';

export const getUserById = async (userId) => {
    try {
        return await httpRequest.get(`/users/${userId}`);
    } catch (err) {
        console.log(err);
        throw err;
    }
};
// Cập nhật user theo ID
export const updateUserById = async (userId, user) => {
    try {
        console.log('user:', user);
        return await httpRequest.put(`/users/${userId}`, user, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// Lấy địa chỉ của user theo ID
export const getAddressByUserId = async (userId) => {
    try {
        return await httpRequest.get(`/users/${userId}/addresses`);
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

// thêm địa chỉ mới người dùng hiện tại
export const addAddress = async (addressData) => {
    console.log(addressData);
    try {
        const response = await httpRequest.post('/users/me/addresses', addressData);
        return response;
    } catch (err) {
        console.error('Error adding address:', err);
        throw err;
    }
};

// xóa địa chỉ
export const deleteAddress = async (addressId) => {
    try {
        const response = await httpRequest.del('/users/me/addresses', {
            data: { addressId: addressId },
        });
        return response;
    } catch (err) {
        console.error('Error deleting address:', err);
        throw err;
    }
};

export const updateAddress = async (updatedData) => {
    console.log(updatedData);
    try {
        const response = await httpRequest.put('/users/me/addresses', updatedData);
        return response;
    } catch (err) {
        console.error('Error deleting address:', err);
        throw err;
    }
};

export const changePassword = async (userId, passwordData) => {
    try {
        const response = await httpRequest.put(`/users/${userId}/change-password`, passwordData);
        console.log('response:', response);
        return response;
    } catch (err) {
        console.error('Error changing password:', err);
        throw err;
    }
};
