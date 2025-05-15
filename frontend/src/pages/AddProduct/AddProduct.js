import { useState, useEffect } from 'react';
import * as productService from '~/services/productService';
import * as manufacturerService from '~/services/manufacturerService';
import * as originService from '~/services/originService';
import * as categoryService from '~/services/categoryService';
import * as unitService from '~/services/unitService';

import { useNavigate } from 'react-router-dom';
import styles from './AddProduct.module.scss';
import classNames from 'classnames/bind';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function AddProduct() {
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        productName: '',
        productUnitPrice: 0,
        productSupPrice: 0,
        productQuantity: 0,
        productWarranty: 0,
        productStatus: 'available',
        productCategory: '',
        productUnit: '',
        productManufacturer: '',
        productOrigin: '',
        productImgs: [],
        productDescription: '',
    });

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [origins, setOrigins] = useState([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [categoryData, manufacturerData, originData, unitData] = await Promise.all([
                    categoryService.getCategories(),
                    manufacturerService.getManufacturer(),
                    originService.getOrigin(),
                    unitService.getUnit(),
                ]);
                setCategories(categoryData);
                setManufacturers(manufacturerData);
                setOrigins(originData);
                setUnits(unitData);
            } catch (error) {
                toast.error('Lỗi khi tải dữ liệu. Vui lòng thử lại!', {
                    position: 'top-center',
                });
            }
        };
        fetchAll();
    }, []);

    const formatCurrency = (value) => {
        if (!value) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const parseCurrency = (value) => value.replace(/\./g, '');

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'productImgs') {
            setProduct((prev) => ({
                ...prev,
                productImgs: Array.from(files),
            }));
        } else if (name === 'productUnitPrice' || name === 'productSupPrice') {
            const numericValue = parseCurrency(value);
            if (!/^\d*$/.test(numericValue)) return;
            setProduct((prev) => ({
                ...prev,
                [name]: numericValue,
            }));
        } else {
            setProduct((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            for (let key in product) {
                if (key === 'productImgs') {
                    product.productImgs.forEach((img) => formData.append('productImgs', img));
                } else {
                    formData.append(key, product[key]);
                }
            }

            await productService.addProduct(formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Thêm sản phẩm thành công!', {
                position: 'top-center',
            });

            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            toast.error('Có lỗi xảy ra khi thêm sản phẩm. Vui lòng thử lại.', {
                position: 'top-center',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <h2 className={cx('heading')}>Thêm Sản Phẩm Mới</h2>

            <form onSubmit={handleSubmit} className={cx('form')}>
                <div className={cx('form-group')}>
                    <label className={cx('label')}>Tên sản phẩm:</label>
                    <input
                        type="text"
                        name="productName"
                        value={product.productName}
                        onChange={handleChange}
                        className={cx('input')}
                        required
                    />
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Giá sản phẩm:</label>
                    <input
                        type="text"
                        name="productUnitPrice"
                        value={formatCurrency(product.productUnitPrice)}
                        onChange={handleChange}
                        className={cx('input')}
                        required
                    />
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Khuyến mãi (%):</label>
                    <input
                        type="number"
                        name="productSupPrice"
                        value={product.productSupPrice}
                        onChange={handleChange}
                        className={cx('input')}
                    />
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Số lượng:</label>
                    <input
                        type="number"
                        name="productQuantity"
                        value={product.productQuantity}
                        onChange={handleChange}
                        className={cx('input')}
                        required
                    />
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Bảo hành (tháng):</label>
                    <input
                        type="number"
                        name="productWarranty"
                        value={product.productWarranty}
                        onChange={handleChange}
                        className={cx('input')}
                    />
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Trạng thái:</label>
                    <select
                        name="productStatus"
                        value={product.productStatus}
                        onChange={handleChange}
                        className={cx('input')}
                    >
                        <option value="available">Còn hàng</option>
                        <option value="out_of_stock">Hết hàng</option>
                    </select>
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Danh mục:</label>
                    <select
                        name="productCategory"
                        value={product.productCategory}
                        onChange={handleChange}
                        className={cx('input')}
                        required
                    >
                        <option value="">Chọn danh mục</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.nameCategory}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Đơn vị:</label>
                    <select
                        name="productUnit"
                        value={product.productUnit}
                        onChange={handleChange}
                        className={cx('input')}
                        required
                    >
                        <option value="">Chọn đơn vị</option>
                        {units.map((unit) => (
                            <option key={unit._id} value={unit._id}>
                                {unit.nameUnit}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Xuất xứ:</label>
                    <select
                        name="productOrigin"
                        value={product.productOrigin}
                        onChange={handleChange}
                        className={cx('input')}
                        required
                    >
                        <option value="">Chọn xuất xứ</option>
                        {origins.map((origin) => (
                            <option key={origin._id} value={origin._id}>
                                {origin.nameOrigin}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Công ty:</label>
                    <select
                        name="productManufacturer"
                        value={product.productManufacturer}
                        onChange={handleChange}
                        className={cx('input')}
                        required
                    >
                        <option value="">Chọn công ty</option>
                        {manufacturers.map((manufacturer) => (
                            <option key={manufacturer._id} value={manufacturer._id}>
                                {manufacturer.nameManufacturer}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Mô tả sản phẩm:</label>
                    <textarea
                        name="productDescription"
                        value={product.productDescription}
                        onChange={handleChange}
                        className={cx('input')}
                        required
                    />
                </div>

                <div className={cx('form-group')}>
                    <label className={cx('label')}>Ảnh sản phẩm:</label>
                    <input type="file" name="productImgs" multiple onChange={handleChange} className={cx('input')} />
                    <div className={cx('preview')}>
                        {product.productImgs.map((img, index) => (
                            <img
                                key={index}
                                src={URL.createObjectURL(img)}
                                alt="Preview"
                                className={cx('preview-img')}
                            />
                        ))}
                    </div>
                </div>

                <button type="submit" className={cx('submit-button')} disabled={loading}>
                    {loading ? 'Đang thêm...' : 'Thêm sản phẩm'}
                </button>
            </form>
        </div>
    );
}

export default AddProduct;
