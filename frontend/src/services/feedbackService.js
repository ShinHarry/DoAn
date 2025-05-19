import * as httpRequest from '~/utils/httpRequest';

export const getRatingsByProductId = async (productId) => {
  try {
    return await httpRequest.get(`/products/rating/${productId}`);
  } catch (err) {
    console.error('Lỗi getRatingsByProduct:', err);
    throw err;
  }
};

export const getFeedbacksByProductId = async (productId) => {
  try {
    return await httpRequest.get(`/feedback/${productId}`);
  } catch (err) {
    console.error('Lỗi getFeedbackByProduct:', err);
    throw err;
  }
};


