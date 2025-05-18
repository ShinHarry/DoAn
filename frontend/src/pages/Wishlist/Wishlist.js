import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as wishlistService from '~/services/wishlistService';
import * as cartService from '~/services/cartService';
import styles from './Wishlist.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function Wishlist() {
  
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;

  //Data test
//  const [wishlist, setWishlist] = useState([
//     {
//       _id: '1',
//       image: 'https://via.placeholder.com/100',
//       price: 199000,
//       product: {
//         _id: 'p1',
//         name: 'Tai nghe Bluetooth Sony WH-1000XM4',
//       },
//     },
//     {
//       _id: '2',
//       image: 'https://via.placeholder.com/100',
//       price: 35000000,
//       product: {
//         _id: 'p2',
//         name: 'Laptop MacBook Pro M2 14-inch',
//       },
//     },
//     {
//       _id: '3',
//       image: 'https://via.placeholder.com/100',
//       price: 5500000,
//       product: {
//         _id: 'p3',
//         name: 'Màn hình LG UltraWide 34"',
//       },
//     },
//   ]);



const [wishlist, setWishlist] = useState([]);
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await wishlistService.getWishlistByUser(userId);
        console.log(data);
        setWishlist(data);
      } catch (error) {
        console.error('Lỗi khi lấy wishlist:', error);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (id) => {
    try {
      await wishlistService.deleteWishlist(id);
      setWishlist((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error('Lỗi khi xoá:', error);
    }
  };


  return (
    <div className={cx('wrapper')}>
      <h2 className={cx('title')}>Danh sách yêu thích</h2>
      {wishlist.length === 0 ? (
        <p>Không có sản phẩm nào trong danh sách yêu thích.</p>
      ) : (
        <>
          <div className={cx('list')}>
            {wishlist.map((item) => (
  <div key={item._id} className={cx('item')}>
    <img src={item.image} alt="product" />
    <div className={cx('info')}>
      <h3>{item.name}</h3>
      <p>{item.price.toLocaleString()} VNĐ</p>
      <div className={cx('actions')}>
        <button onClick={() => navigate(`/product/${item.productId}`)}>Xem chi tiết</button>
        <button className={cx('remove')} onClick={() => handleRemove(item._id)}>Xoá</button>
      </div>
    </div>
  </div>
))}

          </div>
         
        </>
      )}
    </div>
  );
}

export default Wishlist;