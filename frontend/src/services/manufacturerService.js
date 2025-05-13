import * as httpRequest from '~/utils/httpRequest';

export const getManufacturer = async () => {
    try {
        return await httpRequest.get('/manufacturers');
    } catch (err) {
        console.log(err);
        throw err;
    }
};


export const addManufacturer= async (manufacturers) => {
    try {
        return await httpRequest.post('/manufacturers', manufacturers, 
    );
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const updateManufacturerById = async (manufacturers) => {
    try {
        return await httpRequest.put(`/manufacturers/${manufacturers.manufacturerId}`, manufacturers);
    } catch (err) {
        console.log(err);
        throw err;
    }
};


// Xóa origin
export const deleteManufacturerById = async (id) => {
    try {
        console.log("vao day r", id)
        return await httpRequest.del(`/manufacturers/${id}`);
    } catch (err) {
        console.log(err);
        throw err;
    }
};