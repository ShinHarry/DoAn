import { Button } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './NotFound.module.scss';

const cx = classNames.bind(styles);
function NotFound() {
    return (
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <h1>404 - Không tìm thấy trang</h1>
            <p>Trang bạn tìm không tồn tại hoặc đã bị xóa.</p>
            <Link to="/">
                <Button className={cx('btn')} primary to="/">
                    Quay về trang chủ
                </Button>
            </Link>
        </div>
    );
}

export default NotFound;
