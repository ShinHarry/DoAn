import * as httpRequest from '~/utils/httpRequest';

export const getCart = async () => {
    try {
        // dùng GET /cart 
        return await httpRequest.get("/carts");
    } catch (err) {
        console.error('Error fetching cart:', err);
        throw err;
    }
};
