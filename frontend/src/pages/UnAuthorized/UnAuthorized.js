import React from 'react';
import Button from '~/components/Button';

const UnAuthorized = () => {
    return (
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <h1>401 - Không đủ thẩm quyền</h1>
            <p>Bạn không đủ thẩm quyền để truy cập trang</p>

            <Button primary to="/">
                Quay về trang chủ
            </Button>
        </div>
    );
};

export default UnAuthorized;
