import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as saleService from '~/services/saleService';
import * as categoryService from '~/services/categoryService';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import classNames from 'classnames/bind';
import styles from './AddSale.module.scss';

const cx = classNames.bind(styles);

function AddSale() {

    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        dateStart: '',
        dateEnd: '',
        discount: '',
        product: '',
    });

    useEffect(() => {
            const fetchCategories = async () => {
                try {
                    const categoryData = await categoryService.getCategories();
                    setCategories(categoryData);
                } catch (error) {
                    toast.error('Không thể tải danh mục. Vui lòng thử lại.');
                }
            };
            fetchCategories();
        }, []);


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
        <ToastContainer
            position="bottom-right"  //  Đặt ở góc dưới bên trái
            autoClose={3000}         // Tự động tắt sau 3 giây (có thể chỉnh)
            hideProgressBar={true}  //  thanh tiến trình
            newestOnTop={false}    //Toast mới sẽ hiện dưới các toast cũ.
            closeOnClick            //Cho phép đóng toast
            draggable               // cho phép kéo
        />
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
                    <select
                        name="product"
                        value={formData.productCategory}
                        onChange={handleChange}
                        className={cx('input')}
                        required
                    >
                        <option value="">Chọn danh mục</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category.nameCategory}>
                                {category.nameCategory}
                            </option>
                        ))}
                    </select>
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
