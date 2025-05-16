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

// 3. Xuất Excel (VD cho sản phẩm)
export const exportProductsToExcel = (params) => {
    try {
        return httpRequest.default.get('statistics/products/export', { 
            params,
            responseType: 'blob', // Khi tải file từ backend (Excel,...),  responseType === 'blob'
            // backend sẽ trả về binary data - mảng bytes, để chuyển sang file ko phải json
        //     {
        //         data: Blob { ... }, // Dữ liệu file thực tế
        //         status: 200,
        //         statusText: "OK",
        //         headers: { ... },
        //         ...
        //     }
        });    
    } catch (err) {
        console.log(err);
        throw err;
    }
};