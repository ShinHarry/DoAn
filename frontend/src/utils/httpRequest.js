import axios from 'axios';

const httpRequest = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
});

// Hàm lấy token từ storage
const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
};

// hàm trợ giúp thêm Authorization header
const addAuthHeader = (options = {}) => {
    const token = getToken();
    if (token) {
        if (!options.headers) {
            options.headers = {};
        }
        options.headers.Authorization = `Bearer ${token}`;
    }
    return options;
};

export const get = async (path, options = {}) => {
    const requestOptions = addAuthHeader(options);
    const response = await httpRequest.get(path, options);
    return response.data;
};

export const post = async (path, data, options = {}) => {
    const requestOptions = addAuthHeader(options);
    const response = await httpRequest.post(path, data, options);
    return response.data;
};

export const put = async (path, data, options = {}) => {
    const requestOptions = addAuthHeader(options);
    const response = await httpRequest.put(path, data, options);
    return response.data;
};

export const del = async (path, options = {}) => {
    const requestOptions = addAuthHeader(options);
    const response = await httpRequest.delete(path, options);
    return response.data;
};

export default httpRequest;
