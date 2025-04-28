import { useEffect, useState } from 'react';
import * as newService from '~/services/newService';
import { Link, useNavigate} from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Banner.module.scss';
import Swal from 'sweetalert2'; // thư viện hiện alert 


const cx = classNames.bind(styles);

function Banner() {
    const [news, setBanners] = useState([]);
    const [error, setError] = useState(null);
    // const navigate = useNavigate();

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
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn xóa?',
            text: 'Banner sẽ bị xóa !',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',   // màu nút OK
            cancelButtonColor: '#d33',        // màu nút Cancel
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
          });
        
          if (result.isConfirmed) {
            try {
              await newService.deleteNewById(id);
              Swal.fire(
                'Đã xóa!',
                'Banner đã được xóa thành công.',
                'success'
              );
              // Ví dụ: gọi lại danh sách nếu cần
              setBanners(news.filter((item) => item._id !== id));
            } catch (error) {
              Swal.fire(
                'Lỗi!',
                'Xóa banner thất bại.',
                'error'
              );
            }
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
                            <Link to={`/updateNew/${item._id}`} className={cx('btn-edit')}>Sửa</Link>
                            <button onClick={() => handleDelete(item._id)} className={cx('btn-delete')}>Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Banner;