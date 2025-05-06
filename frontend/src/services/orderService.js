import * as httpRequest from '~/utils/httpRequest';

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

