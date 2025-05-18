import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
    },
    reducers: {
        setCartItems: (state, action) => {
            state.items = action.payload;
        },
        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const { setCartItems, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
