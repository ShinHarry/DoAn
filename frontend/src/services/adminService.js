import * as httpRequest from '~/utils/httpRequest';

export const getUser = async () => {
    try {
        return await httpRequest.get('/admindashboard');
    } catch (err) {
        console.error('Error fetching admindashboard:', err);
        throw err;
    }
};

export const updateUserById = async (userId, userData) => {
    try {
        const formData = new FormData();

        formData.append('userId', userId);
        formData.append('userName', userData.userName);
        // formData.append('userEmail', userData.userEmail);
        // formData.append('userPhone', userData.userPhone);
        // formData.append('userGender', userData.userGender);
        formData.append('userRole', userData.userRole);

        const response = await httpRequest.put(`/admindashboard/${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};
export const deleteUserById = async (userId) => {
    try {
        const response = await httpRequest.del(`/admindashboard/${userId}`);
        return response;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};
