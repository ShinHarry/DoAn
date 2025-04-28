import * as httpRequest from '~/utils/httpRequest';

export const getSale = async () => {
    try {
        return await httpRequest.get('/sales');
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const addSale= async (sales) => {
    try {
        return await httpRequest.post('/sales', sales, 
    );
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const updateSale = async (id, sales) => {
    try {
        return await httpRequest.put(`/sales/${id}`, sales);
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// Lấy sản phẩm theo `_id`
export const getSaleById = async (id) => {
    try {
        return await httpRequest.get(`/sales/${id}`);
    } catch (err) {
        console.log(err);
        throw err;
    }
};
// Xóa sản phẩm
export const deleteSaleById = async (id) => {
    try {
        return await httpRequest.del(`/sales/${id}`);
    } catch (err) {
        console.log(err);
        throw err;
    }
};