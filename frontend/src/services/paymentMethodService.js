import * as httpRequest from '~/utils/httpRequest';
// payment-method
export const getPaymentMethod = async () => {
    try {
        return await httpRequest.get('/'); // Gọi backend API
    } catch (err) {
        console.log(err);
        throw err;
    }
};
