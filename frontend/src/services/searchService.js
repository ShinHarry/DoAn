import * as httpRequest from '~/utils/httpRequest';

export const search = async ({ page, limit, q }) => {
    try {
        const res = await httpRequest.get('products/search', {
            params: { page, limit, q },
        });
        console.log('res', res);
        return res;
    } catch (err) {
        console.log(err);
    }
};
