import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as saleService from '~/services/saleService';
import classNames from 'classnames/bind';
import styles from './UpdateDiscount.module.scss';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function UpdateDiscount() {

    const { DiscountId } = useParams();
    const navigate = useNavigate();
    
    const [discount, setDiscount] = useState({
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

    useEffect(() => {
        const fetchDiscountDetails = async () => {
            try {
                const result = await saleService.getDiscountById(DiscountId);
                setDiscount({
                    name: result.name || '',
                    type: result.type || '',
                    dateStart: result.dateStart ? result.dateStart.substring(0, 10) : '',
                    dateEnd: result.dateEnd ? result.dateEnd.substring(0, 10) : '',
                    minimumOrder: result.minimumOrder || '',
                    discount: result.discount || '',
                    minimizeOrder: result.minimizeOrder || '',
                    count: result.count || '',
                    image: result.image || null,
                });
            } catch (err) {
                 toast.error('Không thể tải thông tin mã giảm giá. Vui lòng thử lại.', err);
            }
        };
        fetchDiscountDetails();
    }, [DiscountId]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setDiscount((prev) => ({
                ...prev,
                image: files[0], // chỉ lấy file đầu tiên
            }));
        }else {
            setDiscount((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
         e.preventDefault();
                try {
                    const formDataFinal = new FormData();
                    formDataFinal.append('name', discount.name);
                    formDataFinal.append('type', discount.type);
                    formDataFinal.append('dateStart', discount.dateStart);
                    formDataFinal.append('dateEnd', discount.dateEnd);
                    formDataFinal.append('minimumOrder', discount.minimumOrder);
                    formDataFinal.append('discount', discount.discount);
                    formDataFinal.append('minimizeOrder', discount.minimizeOrder);
                    formDataFinal.append('count', discount.count);
        
                    if (discount.image) {
                        formDataFinal.append('image', discount.image);
                    }
                    await saleService.updateDiscountById(DiscountId, formDataFinal, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    toast.success('Sửa discount thành công!');
                    setTimeout(() => navigate('/moddashboard/sales'), 2000);
                
                    }  catch (error) {
                    console.error('Lỗi sửa mã giam giá:', error);
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
                <h2>Sửa Khuyến Mãi</h2>
                <form onSubmit={handleSubmit} className={cx('form')}>
                    <div className={cx('form-group')}>
                        <label>Tên giảm giá:</label>
                        <input
                            type="text"
                            name="name"
                            value={discount.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={cx('form-group')}>
                        <label>Loại mã:</label>
                        <select
                            name="type"
                            value={discount.type}
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
                            value={discount.dateStart}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={cx('form-group')}>
                        <label>Ngày kết thúc:</label>
                        <input
                            type="date"
                            name="dateEnd"
                            value={discount.dateEnd}
                            onChange={handleChange}
                            required
                        />
                    </div>

                   <div className={cx('form-group')}>
                        <label>Đơn hàng tối thiểu: {Number(discount.minimumOrder || 0).toLocaleString('vi-VN')} VND</label>
                        <input
                            type="number"
                            name="minimumOrder"
                            value={discount.minimumOrder}
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
                            value={discount.discount}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={cx('form-group')}>
                        <label>Giảm giá tối đa: {Number(discount.minimizeOrder || 0).toLocaleString('vi-VN')} VND</label>
                        <input
                            type="number"
                            name="minimizeOrder"
                            value={discount.minimizeOrder}
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
                            value={discount.count}
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
                        {discount.image && (
                            // <div className={cx('preview')}>
                            //     <img
                            //         src={URL.createObjectURL(discount.image)}
                            //         alt="Preview"
                            //         className={cx('preview-img')}
                            //     />
                            // </div>
                            <div className={cx('preview')}>
                                {discount.image instanceof File ? (
                                    <img src={URL.createObjectURL(discount.image)} alt="Preview" />
                                ) : (
                                    <img src={discount.image?.link} alt={discount.image?.alt || 'Preview'} />
                                )}
                            </div>
                        )}
                    </div>

                    <button type="submit" className={cx('submit-btn')}>
                        Sửa khuyến mãi
                    </button>
                </form>
            </div>
                </>
    );
    
}

export default UpdateDiscount;
