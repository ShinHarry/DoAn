import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        login: {
            currentUser: null,
        },
        register: {
            status: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
            error: null,
        },
    },
    reducers: {
        loginSuccess: (state, action) => {
            console.log('loginSuccess payload:', action.payload);
            state.login.currentUser = action.payload;
        },
        logoutSuccess: (state) => {
            state.login.currentUser = null;
        },
        registerStart: (state) => {
            state.register.status = 'loading';
            state.register.error = null;
        },
        registerSuccess: (state) => {
            state.register.status = 'succeeded';
        },
        registerFailure: (state, action) => {
            state.register.status = 'failed';
            state.register.error = action.payload;
        },
    },
});

export const { loginSuccess, logoutSuccess, registerStart, registerSuccess, registerFailure } = authSlice.actions;
export default authSlice.reducer;
