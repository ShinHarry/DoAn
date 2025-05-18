import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        selectedCartItems: [],
    },
    reducers: {
        setSelectedCartItems: (state, action) => {
        state.selectedCartItems = action.payload;
        },
        clearSelectedCartItems: (state) => {
        state.selectedCartItems = [];
        }
    },
});

export const { setSelectedCartItems, clearSelectedCartItems } = cartSlice.actions;
export default cartSlice.reducer;
