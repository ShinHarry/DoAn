import { useState, useEffect } from 'react';
import * as saleService from '~/services/saleService';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Sale.module.scss';
import classNames from 'classnames/bind';
import Swal from 'sweetalert2'; // thư viện hiện alert
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Button from '~/components/Button';

const cx = classNames.bind(styles);

function Sale() {
    const [sales, setSales] = useState([]);
    const [discounts, setDiscounts] = useState([]);

    const navigate = useNavigate();
    useEffect(() => {
        const fetchSales = async () => {
            try {
                const response = await saleService.getSale(); 
                setSales(response);
            } catch (error) {
                console.error('Lỗi lấy danh sách khuyến mãi', error);
            }
        };
        fetchSales();
    }, [sales]);

    useEffect(() => {
         const fetchDiscounts = async () => {
            try {
                const response = await saleService.getDiscount(); 
                // console.log('response :', response);
                setDiscounts(response);
            } catch (error) {
                console.error('Lỗi lấy danh sách mã giảm giá', error);
            }
        };

        fetchDiscounts();
    }, []);
    

     const formatCurrency = (value) => {
        if (!value) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleDelete = async ({ type, id }) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn xóa?',
            text: 'Mã sẽ bị xóa !',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6', // màu nút OK
            cancelButtonColor: '#d33', // màu nút Cancel
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });
        if (result.isConfirmed) {
            if(type === 'promotion'){
                try {
                    await saleService.deleteSaleById(id);
                    Swal.fire('Đã xóa!', 'Giảm giá đã được xóa thành công.', 'success');
                    // Ví dụ: gọi lại danh sách nếu cần
                    setSales(sales.filter((item) => item._id !== id));
                } catch (error) {
                    Swal.fire('Lỗi!', 'Xóa giảm giá thất bại.', 'error');
                }
            }
            if(type === 'discount'){
                try {
                    await saleService.deleteDiscountById(id);
                    Swal.fire('Đã xóa!', 'Giảm giá đã được xóa thành công.', 'success');
                    // Ví dụ: gọi lại danh sách nếu cần
                    setDiscounts(discounts.filter((item) => item._id !== id));
                } catch (error) {
                    Swal.fire('Lỗi!', 'Xóa giảm giá thất bại.', 'error');
                }
            }
          
        }
    };

    const handleAddNew = async ({ type }) => {
        if (type === 'promotion') {
            navigate('/addSale');
        }
        if (type === 'discount') {
            navigate('/addDiscount');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h2>Danh sách mã giảm giá theo danh mục</h2>
                <div className={cx('box-add-btn')}>
                    <Button className={cx('add-btn')} onClick={() => handleAddNew({ type: 'promotion'})}>
                        <FontAwesomeIcon icon={faPlus} /> Thêm mã theo danh mục
                    </Button>
                </div>
            </div>
            <table className={cx('promotion-table')}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã giảm giá</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
                        <th>Giảm giá (%)</th>
                        <th>Sản phẩm</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map((sale, index) => (
                        <tr key={sale._id}>
                            <td>{index + 1}</td>
                            <td>{sale.name}</td>
                            <td> {new Date(sale.dateStart).toLocaleDateString('vi-VN')}</td>
                            <td>{new Date(sale.dateEnd).toLocaleDateString('vi-VN')}</td>
                            <td>{sale.discount}%</td>
                            <td>{sale.product}</td>
                            <td>
                                <div className={cx('box-btn')}>
                                    <Link to={`/updateSale/${sale._id}`} className={cx('edit-btn')}>
                                        Sửa
                                    </Link>
                                    <button className={cx('delete-btn')} onClick={() => handleDelete({ type: 'promotion', id : sale._id})}>
                                        Xóa
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Discount */}
            <div className={cx('header')}>
                <br/>
                <h2>Danh sách mã giảm giá cho người dùng</h2>
                <div className={cx('box-add-btn')}>
                    <Button className={cx('add-btn')} onClick={() => handleAddNew({ type: 'discount'})}>
                        <FontAwesomeIcon icon={faPlus} /> Thêm mã giảm giá
                    </Button>
                </div>
                <table className={cx('promotion-table')}>
                <thead>
                    <tr>
                        <th>Tên giảm giá</th>
                        <th>Hình ảnh</th>
                        <th>Loại mã</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
                        <th>Đơn tối thiểu</th>
                        <th>Giảm giá (%)</th>
                        <th>Giảm tối đa</th>
                        <th>Số lượng</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {discounts.map((discount, index) => (
                        <tr key={discount._id}>
                            <td>{discount.name}</td>
                            <td>
                                <img
                                    src={discount.image?.link}
                                    alt={discount.image?.alt || "discount image"}
                                    className={cx('discount-image')}
                                />
                            </td>
                            <td>{discount.type}</td>
                            <td> {new Date(discount.dateStart).toLocaleDateString('vi-VN')}</td>
                            <td>{new Date(discount.dateEnd).toLocaleDateString('vi-VN')}</td>
                            <td>{formatCurrency(discount.minimumOrder)}</td>
                            <td>{discount.discount}</td>
                            <td>{formatCurrency(discount.minimizeOrder)}</td>
                            <td>{discount.count}</td>
                            <td>
                                <div className={cx('box-btn')}>
                                    <Link to={`/updateDiscount/${discount._id}`} className={cx('edit-btn')}>
                                        Sửa
                                    </Link>
                                    <button className={cx('delete-btn')} onClick={() => handleDelete({ type: 'discount', id : discount._id})}>
                                        Xóa
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}
export default Sale;
