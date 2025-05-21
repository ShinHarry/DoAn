import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as wishlistService from '~/services/wishlistService';
import styles from './Wishlist.module.scss';
import classNames from 'classnames/bind';
import { fetchUser } from '~/redux/actions/authActions';
import { useDispatch, useSelector } from 'react-redux';

const cx = classNames.bind(styles);

function Wishlist() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.auth.login.currentUser);
    console.log('currentUser', currentUser.user._id);
    useEffect(() => {
        if (!currentUser) {
            dispatch(fetchUser());
        }
    }, [currentUser, dispatch]);

    const [wishlist, setWishlist] = useState([]);
    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const data = await wishlistService.getWishlistByUser(currentUser.user._id);
                console.log(data);
                setWishlist(data);
            } catch (error) {
                console.error('Lỗi khi lấy wishlist:', error);
            }
        };
        fetchWishlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                                        <button onClick={() => navigate(`/product/${item.productId}`)}>
                                            Xem chi tiết
                                        </button>
                                        <button className={cx('remove')} onClick={() => handleRemove(item._id)}>
                                            Xoá
                                        </button>
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
