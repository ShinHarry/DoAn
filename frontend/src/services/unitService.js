import * as httpRequest from '~/utils/httpRequest';

export const getUnit = async () => {
    try {
        return await httpRequest.get('/units'); // Thay đổi URL tùy theo API của bạn
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const addUnit = async (units) => {
    try {
        return await httpRequest.post('/units', units);
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const updateUnitById = async (units) => {
    try {
        console.log('unit::', units);
        return await httpRequest.put(`/units/${units.unitId}`, units);
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const deleteUnitById = async (id) => {
    try {
        console.log('vao day r', id);
        return await httpRequest.del(`/units/${id}`);
    } catch (err) {
        console.log(err);
        throw err;
    }
};
