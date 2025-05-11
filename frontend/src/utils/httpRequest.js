import axios from 'axios';

const httpRequest = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
};

//  Interceptor thêm Authorization header vào mọi request nếu có token
httpRequest.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

export const get = async (path, options = {}) => {
    const response = await httpRequest.get(path, options);
    return response.data;
};

export const post = async (path, data, options = {}) => {
    const response = await httpRequest.post(path, data, options);
    return response.data;
};

export const put = async (path, data, options = {}) => {
    const response = await httpRequest.put(path, data, options);
    return response.data;
};

export const del = async (path, options = {}) => {
    const response = await httpRequest.delete(path, options);
    return response.data;
};

export default httpRequest;
