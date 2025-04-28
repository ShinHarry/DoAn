import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as saleService from '~/services/saleService';
import * as categoryService from '~/services/categoryService';
import classNames from 'classnames/bind';
import styles from './UpdateSale.module.scss';
import Swal from 'sweetalert2';

const cx = classNames.bind(styles);

function UpdateSale() {

    const { saleId } = useParams();
    const navigate = useNavigate();
    
    const [categories, setCategories] = useState([]);
    const [sale, setSale] = useState({
        name: '',
        dateStart: '',
        dateEnd: '',
        discount: '',
        product: '',
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSaleDetails = async () => {
            try {
                const result = await saleService.getSaleById(saleId); // Cần API get 1 sale
                setSale({
                    name: result.name || '',
                    dateStart: result.dateStart ? result.dateStart.substring(0, 10) : '',
                    dateEnd: result.dateEnd ? result.dateEnd.substring(0, 10) : '',
                    discount: result.discount || '',
                    product: result.product || '',
                });
            } catch (err) {
                console.error('Error fetching sale details:', err);
                setError('Không thể tải thông tin khuyến mãi. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const categoryData = await categoryService.getCategories();
                setCategories(categoryData);
                } catch (error) {
                    setError('Không thể tải danh mục. Vui lòng thử lại.');
                }
        };

        fetchSaleDetails();
        fetchCategories();
    }, [saleId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSale((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await saleService.updateSaleById(saleId, sale); // API update 1 sale
            await Swal.fire({
                icon: 'success',
                title: 'Cập nhật thành công!',
                text: 'Khuyến mãi đã được cập nhật.',
                confirmButtonText: 'OK',
            });
                      
            navigate('/sales');
        } catch (err) {
            console.error('Error updating sale:', err);
            setError('Có lỗi xảy ra khi cập nhật khuyến mãi. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p>Đang tải dữ liệu...</p>;
    }

    return (
        <>
               
                <div className={cx('wrapper')}>
                    <h2>Sửa Khuyến Mãi</h2>
                    <form onSubmit= {handleSubmit} className={cx('form')}>
                        <div className={cx('form-group')}>
                            <label>Tên Khuyến Mãi</label>
                            <input
                                type="text"
                                name="name"
                                value={sale.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
        
                        <div className={cx('form-group')}>
                            <label>Ngày bắt đầu:</label>
                            <input
                                type="date"
                                name="dateStart"
                                value={sale.dateStart}
                                onChange={handleChange}
                                required
                            />
                        </div>
        
                        <div className={cx('form-group')}>
                            <label>Ngày kết thúc:</label>
                            <input
                                type="date"
                                name="dateEnd"
                                value={sale.dateEnd}
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
                                value={sale.discount}
                                onChange={handleChange}
                                required
                            />
                        </div>
        
                        <div className={cx('form-group')}>
                            <label>Sản phẩm áp dụng:</label>
                            <select
                                name="product"
                                value={sale.product}
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

export default UpdateSale;
