import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as newService from '~/services/newService';
import classNames from 'classnames/bind';
import styles from './AddBanner.module.scss';

const cx = classNames.bind(styles);

function AddBanner() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        content: '',
        newImage: { link: '', alt: '' },
        author: '',
        state: true,
    });

    const [error, setError] = useState(null);
    console.log("abc");
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'link' || name === 'alt') {
            setFormData((prev) => ({
                ...prev,
                newImage: {
                    ...prev.newImage,
                    [name]: value,
                },
            }));
        } else if (type === 'checkbox') {
            setFormData((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await newService.addNew(formData);
            navigate('/banner'); // Sau khi thêm xong thì về trang quản lý
        } catch (err) {
            console.error(err);
            setError('Lỗi khi thêm banner');
        }
    };

    return (
        <div className={cx('add-banner')}>
            <h1>Thêm Banner Mới</h1>

            {error && <p className={cx('error')}>{error}</p>}

            <form onSubmit={handleSubmit} className={cx('form')}>
                <div className={cx('form-group')}>
                    <label>Tiêu đề:</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className={cx('form-group')}>
                    <label>Tóm tắt:</label>
                    <textarea name="summary" value={formData.summary} onChange={handleChange} required />
                </div>

                <div className={cx('form-group')}>
                    <label>Nội dung:</label>
                    <textarea name="content" value={formData.content} onChange={handleChange} required />
                </div>

                <div className={cx('form-group')}>
                    <label>Link ảnh:</label>
                    <input type="text" name="link" value={formData.newImage.link} onChange={handleChange} required />
                </div>

                <div className={cx('form-group')}>
                    <label>Alt ảnh:</label>
                    <input type="text" name="alt" value={formData.newImage.alt} onChange={handleChange} />
                </div>

                <div className={cx('form-group')}>
                    <label>Tác giả:</label>
                    <input type="text" name="author" value={formData.author} onChange={handleChange} required />
                </div>

                <div className={cx('form-group')}>
                    <label>
                        <input type="checkbox" name="state" checked={formData.state} onChange={handleChange} />
                        Hiển thị banner
                    </label>
                </div>

                <button type="submit" className={cx('btn-submit')}>Thêm Banner</button>
            </form>
        </div>
    );
}

export default AddBanner;
