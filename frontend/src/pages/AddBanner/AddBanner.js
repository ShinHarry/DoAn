import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as newService from '~/services/newService';
import classNames from 'classnames/bind';
import styles from './AddBanner.module.scss';
import { toast, ToastContainer  } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function AddBanner() {
    const navigate = useNavigate();
    const [banner, setBanner] = useState({
        title: '',
        summary: '',
        content: '',
        newImage: null, // chỉ 1 file
        author: '',
        state: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            setBanner((prev) => ({
                ...prev,
                newImage: files[0], // chỉ lấy file đầu tiên
            }));
        } else if (type === 'checkbox') {
            setBanner((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else {
            setBanner((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        try {
            const formData = new FormData();
            formData.append('title', banner.title);
            formData.append('summary', banner.summary);
            formData.append('content', banner.content);
            formData.append('author', banner.author);
            formData.append('state', banner.state ? 'true' : 'false');

            if (banner.newImage) {
                formData.append('newImage', banner.newImage);
            }
            // console log form-data
            for (let pair of formData.entries()) {
             console.log(pair[0] + ':', pair[1]);
            }
            //
            await newService.addNew(formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            toast.success('Thêm banner thành công!');
            setTimeout(() => navigate('/news'), 2000);
        } catch (err) {
            console.error(err);
            setError('Có lỗi xảy ra khi thêm banner. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };
    

    return (
        
        <div className={cx('wrapper')}>
            <ToastContainer 
                    position="bottom-right"  //  Đặt ở góc dưới bên trái
                    autoClose={3000}         // Tự động tắt sau 3 giây (có thể chỉnh)
                    hideProgressBar={true}  //  thanh tiến trình
                    newestOnTop={false}    //Toast mới sẽ hiện dưới các toast cũ.
                    closeOnClick            //Cho phép đóng toast
                    draggable
                />
            <h2 className={cx('heading')}>Thêm Banner Mới</h2>
            {error && <p className={cx('error-message')}>{error}</p>}

            <form onSubmit={handleSubmit} className={cx('form')}>
                <div className={cx('form-group')}>
                    <label className={cx('label')}>Tiêu đề:</label>
                    <input
                        type="text"
                        name="title"
                        value={banner.title}
                        onChange={handleChange}
                        className={cx('input')}
                        required
                    />
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Tóm tắt:</label>
                    <textarea
                        name="summary"
                        value={banner.summary}
                        onChange={handleChange}
                        className={cx('input')}
                        required
                    />
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Nội dung:</label>
                    <textarea
                        name="content"
                        value={banner.content}
                        onChange={handleChange}
                        className={cx('input')}
                        required
                    />
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Tác giả:</label>
                    <input
                        type="text"
                        name="author"
                        value={banner.author}
                        onChange={handleChange}
                        className={cx('input')}
                        required
                    />
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Ảnh banner:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className={cx('input')}
                    />
                    {banner.newImage && (
                        <div className={cx('preview')}>
                            <img
                                src={URL.createObjectURL(banner.newImage)}
                                alt="Preview"
                                className={cx('preview-img')}
                            />
                        </div>
                    )}
                </div>

                <div className={cx('form-group-checkbox')}>
                    <input
                        type="checkbox"
                        name="state"
                        checked={banner.state}
                        onChange={handleChange}
                    />
                    <label>Hiển thị banner</label>
                </div>

                <button type="submit" className={cx('submit-button')} disabled={loading}>
                    {loading ? 'Đang thêm...' : 'Thêm Banner'
                    }
                </button>
            </form>
        </div>
    );
}

export default AddBanner;
