import { useState, useEffect } from 'react';
import * as saleService from '~/services/saleService';
import {  Link, useNavigate } from 'react-router-dom';
import styles from './Sale.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);


function Sale() {

    const [sales, setSales] = useState([]);

    useEffect(() => {
      const fetchSales = async () => {
        try {
          const response = await saleService.getSale(); // API lấy danh sách sale
          console.log("response :", response);
          setSales(response);
        } catch (error) {
          console.error('Lỗi lấy danh sách khuyến mãi', error);
        }
      };
      fetchSales();
    }, []);

    const handleEdit = (id) => {
        
      };
    const handleDelete = async (id) => {
       const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này không?');
               if (!confirmDelete) return;
       
               try {
                   await saleService.deleteSaleById(id);
                   alert('Khuyến mãi đã được xóa thành công!');
                   setSales(sales.filter((sale) => sale._id !== id));
                   // navigate('/new');
               } catch (error) {
                   console.error('Lỗi khi xóa khuyến mãi:', error);
               }
      };
      
    const handleAddNew = async () => {
      // navigate('/sale/add'); 
    };


    return (
      <div className={cx('wrapper')}>
         <div className={cx('header')}>
                <h2>Danh sách khuyến mãi</h2>
               <div  className={cx('box-add-btn')}>
                  <Link to="/addSale" className={cx('add-btn')} onClick={handleAddNew}> ➕ Thêm mới</Link>
               </div>
                
          </div>
        <table className={cx('promotion-table')}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên khuyến mãi</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Giảm giá (%)</th>
              <th>Sản phẩm</th>
              <th>Hành động</th> 
            </tr>
          </thead>
          <tbody>
           
              {sales.map((sale,index) => (
                 <tr key={sale._id}>
                 <td>{index +1}</td>
                 <td>{sale.name}</td>
                 <td> {new Date(sale.dateStart).toLocaleDateString('vi-VN')}</td>
                 <td>{new Date(sale.dateEnd).toLocaleDateString('vi-VN')}</td>
                 <td>{sale.discount}%</td>
                 <td>{sale.product}</td>
                 <td>
                     <button className={cx('edit-btn')} onClick={() => handleEdit(sale._id)}>Sửa</button>
                     <button className={cx('delete-btn')} onClick={() => handleDelete(sale._id)}>Xóa</button>
                 </td>
               </tr>
             ))}
             
          </tbody>
        </table>
      </div>
    );
  }
  export default Sale;