import * as httpRequest from '~/utils/httpRequest';

//lấy đơn hàng
export const getOrder = async (userId) => {
    try {
        return await httpRequest.get('/orders');
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const response = await httpRequest.put(`/orders/${orderId}/orderStatus`, {
            status: newStatus,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getOrderManage = async () => {
    try {
        return await httpRequest.get('/orderM');
    } catch (err) {
        console.log(err);
        throw err;
    }
};

//Đánh giá
export const submitRating = async (orderId, rating) => {
    try {
        const response = await httpRequest.post(`/orders/${orderId}/rating`, { rating });
        return response.data;
    } catch (error) {
        console.error('Lỗi gửi đánh giá:', error);
        throw error;
    }
};

//Lay chi tiet don hang
export const getOrderDetail = async (orderId) => {
    try {
        console.log(orderId);
        return await httpRequest.get(`/orders/${orderId}`);
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// tạo mới đơn hàng
export const createOrder = async (orderData) => {
    try {
        console.log('Creating order with data:', orderData);
        const response = await httpRequest.post('/orders', orderData);
        return response;
    } catch (err) {
        console.error('Error creating order:', err);
        throw err;
    }
};
