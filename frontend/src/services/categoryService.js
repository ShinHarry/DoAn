import * as httpRequest from '~/utils/httpRequest';

export const getCategories = async () => {
    try {
        return await httpRequest.get('/categories');
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const getProductsByCategories = async (id, { page, limit, sortBy = 'productName', sortOrder = 'asc' }) => {
    try {
        return await httpRequest.get(`/categories/${id}`, {
            params: { page, limit, sortBy, sortOrder },
        });
    } catch (err) {
        console.log(err);
        throw err;
    }
};
// export const getCategoryById = async (id, {
//   params = {},
//   page = 1,
//   limit = 12,
//   sortBy = 'productName',
//   sortOrder = 'asc',
// }) => {
//   try {
//     return await httpRequest.get(`/categories/${id}`, { params });
//   } catch (err) {
//     console.log(err);
//     throw err;
//   }
// };

export const getAllCategories = async () => {
    try {
        return await httpRequest.get('/category');
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const addCategory = async (formData) => {
    try {
        return await httpRequest.post('/category', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const updateCategory = async (id, data) => {
    try {
        const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        return await httpRequest.put(`/category/${id}`, data, config);
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const deleteCategory = async (id) => {
    try {
        return await httpRequest.del(`/category/${id}`);
    } catch (err) {
        console.log(err);
        throw err;
    }
};
