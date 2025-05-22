import { setOrder, clearOrder } from '../slices/orderSlice';

export const saveTempOrderInfo = (orderInfo) => (dispatch) => {
    dispatch(setOrder(orderInfo));
};

export const clearTempOrders = () => (dispatch) => {
    dispatch(clearOrder());
};