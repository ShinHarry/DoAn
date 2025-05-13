import * as httpRequest from '~/utils/httpRequest';

// Lấy danh sách sản phẩm có phân trang
// export const getProducts = async ({ page, limit }) => {
//     try {
//         return await httpRequest.get('/products', {
//             params: { page, limit },
//         });
//     } catch (err) {
//         console.log(err);
//         throw err;
//     }
// };

export const getProducts = async ({
    page = 1,
    limit = 12,
    search = '',
    category = '',
    origin = '',
    manufacturer = '',
    sortBy = 'productName',
    sortOrder = 'asc',
}) => {
    try {
        return await httpRequest.get('/products', {
            params: {
                page,
                limit,
                search,
                category,
                origin,
                manufacturer,
                sortBy,
                sortOrder,
            },
        });
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const addProduct = async (product) => {
    try {
        return await httpRequest.post('/products', product);
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const updateProduct = async (id, product) => {
    try {
        return await httpRequest.put(`/products/${id}`, product);
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// Lấy sản phẩm theo `_id`
export const getProductById = async (id) => {
    try {
        return await httpRequest.get(`/products/${id}`);
    } catch (err) {
        console.log(err);
        throw err;
    }
};
// Xóa sản phẩm
export const deleteProductById = async (id) => {
    try {
        return await httpRequest.del(`/products/${id}`);
    } catch (err) {
        console.log(err);
        throw err;
    }
};
// API cập nhật lượt thích (like/unlike) theo `_id`
export const toggleLikeProduct = async (id, isLiked) => {
    try {
        return await httpRequest.post(`/products/${id}/like`, { isLiked });
    } catch (err) {
        console.error('Error toggling like:', err);
        throw err;
    }
};
