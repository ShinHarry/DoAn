import * as httpRequest from '~/utils/httpRequest';

//tạo vnpayPaymentUrl
export const createVnpayPaymentUrl = async (amount, orderInfo, returnUrl) => {
    try {
        console.log('Requesting VNPay URL from backend with:', { amount, orderInfo, returnUrl });

        const response = await httpRequest.post('/payments/vnpay/create_payment_url', { 
            amount: amount, 
            orderInfo: orderInfo,
            returnUrl: returnUrl // url để xử lý phản hồi của vnpay
        });
        return response;
    } catch (err) {
        console.error('Error creating VNPay payment URL:', err);
        throw err; 
    }
};

// xác nhận query parameters trả về từ VNPay bằng gọi backend
export const verifyVnpayReturn = async (queryObject) => {
    try {
        console.log('Verifying VNPay return with params:', queryObject);
        const response = await httpRequest.get('/payments/vnpay/vnpay_return', { 
            params: queryObject 
         }); 
        return response;
    } catch (err) {
        console.error('Error verifying VNPay return:', err);
        throw err;
    }
};
