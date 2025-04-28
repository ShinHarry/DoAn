import * as httpRequest from '~/utils/httpRequest';

export const getNew = async () => {
    try {
        return await httpRequest.get('/news');
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const addNew = async (news) => {
    try {
        return await httpRequest.post('/news', news, 
            //{
            // headers: {
            //     'Content-Type': 'multipart/form-data',
            // },
            //}
    );
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const updateNews = async (id, news) => {
    try {
        return await httpRequest.put(`/news/${id}`, news);
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// Lấy sản phẩm theo `_id`
export const getNewById = async (id) => {
    try {
        return await httpRequest.get(`/news/${id}`);
    } catch (err) {
        console.log(err);
        throw err;
    }
};
// Xóa sản phẩm
export const deleteNewById= async (id) => {
    try {
        return await httpRequest.del(`/news/${id}`);
    } catch (err) {
        console.log(err);
        throw err;
    }
};