import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as saleService from '~/services/saleService';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import classNames from 'classnames/bind';
import styles from './AddSale.module.scss';

const cx = classNames.bind(styles);

function AddSale() {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        dateStart: '',
        dateEnd: '',
        discount: '',
        product: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await saleService.addSale(formData);  //  API addSale bên services
            toast.success('Thêm khuyến mãi thành công!');
            setTimeout(() => navigate('/sales'), 1500); // Chờ toast hiện rồi chuyển trang
        } catch (error) {
            console.error('Lỗi thêm khuyến mãi:', error);
            toast.error('Đã xảy ra lỗi khi thêm khuyến mãi!');
        }
    };
    

    return (
        <>
        <ToastContainer position="bottom-left" />
        <div className={cx('wrapper')}>
            <h2>Thêm khuyến mãi mới</h2>
            <form onSubmit={handleSubmit} className={cx('form')}>
                <div className={cx('form-group')}>
                    <label>Tên chương trình:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={cx('form-group')}>
                    <label>Ngày bắt đầu:</label>
                    <input
                        type="date"
                        name="dateStart"
                        value={formData.dateStart}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={cx('form-group')}>
                    <label>Ngày kết thúc:</label>
                    <input
                        type="date"
                        name="dateEnd"
                        value={formData.dateEnd}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={cx('form-group')}>
                    <label>Giảm giá (%):</label>
                    <input
                        type="number"
                        name="discount"
                        min="0"
                        max="100"
                        value={formData.discount}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={cx('form-group')}>
                    <label>Sản phẩm áp dụng:</label>
                    <input
                        type="text"
                        name="product"
                        value={formData.product}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className={cx('submit-btn')}>
                    Thêm khuyến mãi
                </button>
            </form>
        </div>
        </>
    );
    
}

export default AddSale;
