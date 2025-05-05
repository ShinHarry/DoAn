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

// Cập nhật số lượng 1 sản phẩm trong giỏ hàng
export const updateCartItemQuantity = async (itemId, quantity) => {
    try {
        // dùng PUT /carts/:itemId
        return await httpRequest.put(`/carts/${itemId}`, { quantity });
    } catch (err) {
        console.error('Error updating cart item quantity:', err);
        throw err;
    }
};


// xóa giỏ hàng theo id
export const removeCartItem = async (itemId) => {
    try {
        // Use DELETE /cart/:itemId (singular)
        return await httpRequest.del(`/carts/${itemId}`);
    } catch (err) {
        console.error('Error removing cart item:', err);
        throw err;
    }
};