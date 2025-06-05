import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as saleService from '~/services/saleService';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import classNames from 'classnames/bind';
import styles from './AddDiscount.module.scss';

const cx = classNames.bind(styles);

function AddSale() {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        image: null,
        type: '',
        dateStart: '',
        dateEnd: '',
        minimumOrder: '',
        discount: '',
        minimizeOrder: '',
        count: '',
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData((prev) => ({
                ...prev,
                image: files[0], // chỉ lấy file đầu tiên
            }));
        }else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
                    const formDataFinal = new FormData();
                    formDataFinal.append('name', formData.name);
                    formDataFinal.append('type', formData.type);
                    formDataFinal.append('dateStart', formData.dateStart);
                    formDataFinal.append('dateEnd', formData.dateEnd);
                    formDataFinal.append('minimumOrder', formData.minimumOrder);
                    formDataFinal.append('discount', formData.discount);
                    formDataFinal.append('minimizeOrder', formData.minimizeOrder);
                    formDataFinal.append('count', formData.count);
        
                    if (formData.image) {
                        formDataFinal.append('image', formData.image);
                    }
                    await saleService.addDiscount(formDataFinal, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    toast.success('Thêm discount thành công!');
                    setTimeout(() => navigate('/moddashboard/sales'), 2000);
        
            }  catch (error) {
            console.error('Lỗi thêm mã giam giá:', error);
            if (error.response?.status === 402){
                toast.error("Ngày kết thúc phải sau ngày bắt đầu.");
            }
             else {
                toast.error('Đã xảy ra lỗi khi thêm mãi giảm giá!');
            }
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
                    <label>Tên giảm giá:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={cx('form-group')}>
                    <label>Loại mã:</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Chọn loại</option>
                        <option value="Phí vận chuyển">Phí vận chuyển</option>
                        <option value="Giảm theo đơn hàng">Giảm theo đơn hàng</option>
                    </select>
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
                    <label>Đơn hàng tối thiểu: {Number(formData.minimumOrder || 0).toLocaleString('vi-VN')} VND</label>
                    <input
                        type="number"
                        name="minimumOrder"
                        value={formData.minimumOrder}
                        onChange={handleChange}
                        
                        required
                        min="0"
                        step="1000" // Tùy chọn: bước nhảy là 1000đ
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
                    <label>Giảm giá tối đa: {Number(formData.minimizeOrder || 0).toLocaleString('vi-VN')} VND</label>
                    <input
                        type="number"
                        name="minimizeOrder"
                        value={formData.minimizeOrder}
                        onChange={handleChange}
                        
                        required
                        min="0"
                        step="1000" // Tùy chọn: bước nhảy là 1000đ
                    />
                </div>

                <div className={cx('form-group')}>
                    <label>Số lượng mã:</label>
                    <input
                        type="number"
                        name="count"
                        value={formData.count}
                        onChange={handleChange}
                        min="0"
                    />
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Hình ảnh:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className={cx('input')}
                    />
                    {formData.image && (
                        <div className={cx('preview')}>
                            <img
                                src={URL.createObjectURL(formData.image)}
                                alt="Preview"
                                className={cx('preview-img')}
                            />
                        </div>
                    )}
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
