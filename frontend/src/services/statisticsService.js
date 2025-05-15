import * as httpRequest from '~/utils/httpRequest';

// 1. Thống kê doanh thu
export const getRevenueStatistics = async (period) => {
    try {
        return await httpRequest.get('/statistics/revenue' , { params: { period } });
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// 2. Thống kê sản phẩm
export const getProductStatistics = (params) => {
    // params: { groupBy, sortBy, sortOrder }
    try {
    return httpRequest.get('statistics/products', { params });
    } catch (err) {
        console.log(err);
        throw err;
    }
};

//Lấy danh sách danh mục
export const getCategoryList = () => {
    try {
    return httpRequest.get('statistics/categories');
    } catch (err) {
        console.log(err);
        throw err;
    }
}; 