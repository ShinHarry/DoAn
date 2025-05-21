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
    const navigate = useNavigate();
    useEffect(() => {
        const fetchSales = async () => {
            try {
                const response = await saleService.getSale(); // API lấy danh sách sale
                console.log('response :', response);
                setSales(response);
            } catch (error) {
                console.error('Lỗi lấy danh sách khuyến mãi', error);
            }
        };
        fetchSales();
    }, []);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn xóa?',
            text: 'Banner sẽ bị xóa !',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6', // màu nút OK
            cancelButtonColor: '#d33', // màu nút Cancel
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });
        if (result.isConfirmed) {
            try {
                await saleService.deleteSaleById(id);
                Swal.fire('Đã xóa!', 'Giảm giá đã được xóa thành công.', 'success');
                // Ví dụ: gọi lại danh sách nếu cần
                setSales(sales.filter((item) => item._id !== id));
            } catch (error) {
                Swal.fire('Lỗi!', 'Xóa giảm giá thất bại.', 'error');
            }
        }
    };

    const handleAddNew = async () => {
        navigate('/addSale');
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h2>Danh sách mã giảm giá</h2>
                <div className={cx('box-add-btn')}>
                    <Button className={cx('add-btn')} onClick={() => handleAddNew()}>
                        <FontAwesomeIcon icon={faPlus} /> Thêm mã
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
                                    <button className={cx('delete-btn')} onClick={() => handleDelete(sale._id)}>
                                        Xóa
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default Sale;
