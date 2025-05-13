import * as httpRequest from '~/utils/httpRequest';

export const getOrigin = async () => {
    try {
        return await httpRequest.get('/origins'); // Thay đổi URL tùy theo API của bạn
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const addOrigin= async (origins) => {
    try {
        return await httpRequest.post('/origins', origins, 
    );
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const updateOriginById = async (origins) => {
    try {
        console.log("vao day r", origins, origins.originId)
        return await httpRequest.put(`/origins/${origins.originId}`, origins);
    } catch (err) {
        console.log(err);
        throw err;
    }
};


// Xóa origin
export const deleteOriginById = async (id) => {
    try {
        console.log("vao day r", id)
        return await httpRequest.del(`/origins/${id}`);
    } catch (err) {
        console.log(err);
        throw err;
    }
};