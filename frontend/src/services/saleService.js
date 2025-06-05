import * as httpRequest from '~/utils/httpRequest';

// lấy all khuyến mãimãi
export const getSale = async () => {
    try {
        return await httpRequest.get('/sales/sale');
    } catch (err) {
        console.log(err);
        throw err;
    }
};
//thêm khuyến mãi
export const addSale= async (sales) => {
    try {
        return await httpRequest.post('/sales', sales, 
    );
    } catch (err) {
        console.log(err);
        throw err;
    }
};
//sửa khuyến mãi
export const updateSaleById = async (id, sales) => {
    try {
        return await httpRequest.put(`/sales/${id}`, sales);
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// Lấy khuyến mãi theo `_id`
export const getSaleById = async (id) => {
    try {
        return await httpRequest.get(`/sales/${id}`);
    } catch (err) {
        console.log(err);
        throw err;
    }
};
// Xóa khuyến mãi
export const deleteSaleById = async (id) => {
    try {
        return await httpRequest.del(`/sales/${id}`);
    } catch (err) {
        console.log(err);
        throw err;
    }
};

//thêm discount
export const addDiscount= async (sales) => {
    try {
        return await httpRequest.post('/sales/discount', sales, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    } catch (err) {
        console.log(err);
        throw err;
    }
};
//lấy all Discount
export const getDiscount = async () => {
    try {
        return await httpRequest.get('/sales/discount');
    } catch (err) {
        console.log(err);
        throw err;
    }
};
//lấy all Discount của người dùng
export const getDiscountUser = async () => {
    try {
        return await httpRequest.get('/sales/myDiscount');
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// Lấy chi tiết discount theo ID
export const getDiscountById = async (id) => {
  try {
    return await httpRequest.get(`/sales/discount/${id}`);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Cập nhật discount
export const updateDiscountById = async (id, discountData) => {
  try {
    return await httpRequest.put(`/sales/discount/${id}`, discountData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Xóa discount
export const deleteDiscountById = async (id) => {
  try {
    return await httpRequest.del(`/sales/discount/${id}`);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

//lưu discount cho người dùng
export const saveDiscount = async (discountId) => {
  try {
    return await httpRequest.post('/sales/saveDiscount', {discountId} );
  } catch (err) {
    console.error('Lỗi gọi API saveDiscount:', err);
    return { success: false, message: 'Lỗi kết nối server' };
  }
};