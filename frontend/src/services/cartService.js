import * as httpRequest from '~/utils/httpRequest';

export const getCart = async () => {
    try {
        // dùng GET /carts 
        return await httpRequest.get("/carts");
    } catch (err) {
        console.error('Error fetching cart:', err);
        throw err;
    }
};


// Thêm sản phẩm vào giỏ hàng hoặc cập nhật số lượng sản phẩm
export const addToCart = async (productId, quantity = 1) => {
    try {
        // dùng POST /carts 
        return await httpRequest.post('/carts', { productId, quantity });
    } catch (err) {
        console.error('Error adding to cart:', err);
        throw err;
    }
};
