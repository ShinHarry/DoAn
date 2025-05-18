import * as httpRequest from '~/utils/httpRequest';

export const getWishlistByUser = async (userId) => {
    try {
        return await httpRequest.get('/wishlist', {
            params: { userId },
        });
    } catch (err) {
        console.error('Lỗi getWishlistByUser:', err);
        throw err;
    }
};

export const addToWishlist = async (data) => {
    try {
        return await httpRequest.post('/wishlist', data);
    } catch (err) {
        console.error('Lỗi addToWishlist:', err);
        throw err;
    }
};

export const deleteWishlist = async (wishlistId) => {
    try {
        return await httpRequest.del(`/wishlist/${wishlistId}`);
    } catch (err) {
        console.error('Lỗi deleteWishlist:', err);
        throw err;
    }
};

export const clearWishlistByUser = async (userId) => {
    try {
        return await httpRequest.del(`/wishlist/clear`);
    } catch (err) {
        console.error('Lỗi clearWishlistByUser:', err);
        throw err;
    }
};
