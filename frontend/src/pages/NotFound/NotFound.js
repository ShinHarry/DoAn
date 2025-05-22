import { Button } from '@mui/material';
import React from 'react';

const NotFound = () => {
    return (
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <h1>404 - Không tìm thấy trang</h1>
            <p>Trang bạn tìm không tồn tại hoặc đã bị xóa.</p>
            <Button primary to="/">
                Quay về trang chủ
            </Button>
        </div>
    );
};

export default NotFound;
