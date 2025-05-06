import * as httpRequest from '~/utils/httpRequest';

//lấy đơn hàng
export const getOrder = async (userId) => {
    try {
        console.log("da vao dayy")
        return await httpRequest.get("/orders");
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

