import { useEffect, useState } from 'react';
import * as newService from '~/services/newService';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Banner.module.scss';

const cx = classNames.bind(styles);

function Banner() {
    const [news, setBanners] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await newService.getNew();
                setBanners(response);
            } catch (error) {
                console.error(error);
                setError('Lỗi khi lấy danh sách banner');
            }
        };
        fetchBanners();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa banner này không?');
        if (!confirmDelete) return;

        try {
            await newService.deleteNewById(id);
            setBanners(news.filter((item) => item._id !== id));
        } catch (error) {
            console.error('Lỗi khi xóa banner:', error);
        }
    };

    return (
        <div className={cx('new-manager')}>
            <h1>Quản lý Banner</h1>
            <div className={cx('actions')}>
                <Link to="/addNew" className={cx('btn-add')}>
                    Thêm mới
                </Link>
            </div>

            {error && <p>{error}</p>}

            <div className={cx('new-list')}>
                {news.map((item) => (
                    <div key={item._id} className={cx('new-item')}>
                        <img src={item.newImage?.link} alt={item.newImage?.alt } />
                        <h3>{item.title}</h3>
                        <p><strong>Tóm tắt:</strong> {item.summary}</p>
                        <p><strong>Tác giả:</strong> {item.author}</p>
                        <p><strong>Trạng thái:</strong> {item.state ? 'Hiển thị' : 'Ẩn'}</p>
                        <p><strong>Ngày tạo:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                        <div className={cx('buttons')}>
                            <Link to={`/edit-item/${item._id}`} className={cx('btn-edit')}>Sửa</Link>
                            <button onClick={() => handleDelete(item._id)} className={cx('btn-delete')}>Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Banner;