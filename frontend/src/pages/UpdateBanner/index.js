import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as newService from '~/services/newService';
import classNames from 'classnames/bind';
import styles from './UpdateBanner.module.scss'; 

const cx = classNames.bind(styles);

function UpdateBanner() {
    const { bannerId } = useParams();
    const navigate = useNavigate();

    const [banner, setBanner] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBannerDetails = async () => {
            try {
                const result = await newService.getNewById(bannerId); // Cần có API get 1 banner
                setBanner(result); 
               // newImage: null, // ảnh đang là link, ko phải file, nên để null để upload mới nếu cần

            } catch (err) {
                console.error('Error fetching banner details:', err);
                setError('Không thể tải banner. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchBannerDetails();
    }, [bannerId]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            if (files && files.length > 0) {
                setBanner((prev) => ({
                    ...prev,
                    newImage: files[0], // Chỉ lấy 1 file
                }));
            }
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

            // Log kiểm tra dữ liệu gửi đi
            for (let pair of formData.entries()) {
                console.log(pair[0] + ':', pair[1]);
            }

            await newService.updateNews(bannerId, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            alert('Sửa banner thành công!');
            navigate('/news');
        } catch (err) {
            console.error(err);
            setError('Có lỗi xảy ra khi sửa banner. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p>Đang tải dữ liệu...</p>;
    }

    return (
        <div className={cx('wrapper')}>
            <h2 className={cx('heading')}>Sửa Banner</h2>
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
                    <label className={cx('label')}>Ảnh banner mới (nếu muốn thay đổi):</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className={cx('input')}
                    />
                    {banner.newImage && (
                        <div className={cx('preview')}>
                        {banner.newImage instanceof File ? (
                          <img src={URL.createObjectURL(banner.newImage)} alt="Preview" />
                        ) : (
                          <img src={banner.newImage?.link} alt={banner.newImage?.alt || 'Preview'} />
                        )}
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
                    {loading ? 'Đang sửa...' : 'Sửa Banner'}
                </button>
            </form>
        </div>
    );
}

export default UpdateBanner;
