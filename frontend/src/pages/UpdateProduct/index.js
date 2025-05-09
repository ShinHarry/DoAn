import { useState, useEffect } from 'react';
import * as productService from '~/services/productService';
import * as manufacturerService from '~/services/manufacturerService';
import * as originService from '~/services/originService';
import * as categoryService from '~/services/categoryService';
import * as unitService from '~/services/unitService';
import * as productServices from '~/services/productService';

import { useNavigate, useParams } from 'react-router-dom';
import styles from './UpdateProduct.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);
function UpdateProduct() {
    const { productId } = useParams();
    const [product, setProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [origins, setOrigins] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            try {
                const result = await productServices.getProductById(productId);
                setProduct(result);
            } catch (error) {
                console.error('Error fetching product details:', error);
            }
            setLoading(false);
        };
        fetchProductDetails();
        const fetchCategories = async () => {
            try {
                const categoryData = await categoryService.getCategories();
                setCategories(categoryData);
            } catch (error) {
                setError('Không thể tải danh mục. Vui lòng thử lại.');
            }
        };

        const fetchManufacturer = async () => {
            try {
                const manufacturerData = await manufacturerService.getManufacturer();
                setManufacturers(manufacturerData);
            } catch (error) {
                setError('Không thể tải nhà sản xuất. Vui lòng thử lại.');
            }
        };

        const fetchOrigin = async () => {
            try {
                const originData = await originService.getOrigin();
                setOrigins(originData);
            } catch (error) {
                setError('Không thể tải xuất xứ. Vui lòng thử lại.');
            }
        };

        const fetchUnit = async () => {
            try {
                const unitData = await unitService.getUnit();
                setUnits(unitData);
            } catch (error) {
                setError('Không thể tải đơn vị. Vui lòng thử lại.');
            }
        };

        fetchCategories();
        fetchManufacturer();
        fetchOrigin();
        fetchUnit();
    }, [productId]);

    const formatCurrency = (value) => {
        if (!value) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const parseCurrency = (value) => {
        return value.replace(/\./g, '');
    };
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'productImgs') {
            if (files.length > 0) {
                setProduct((prevProduct) => ({
                    ...prevProduct,
                    productImgs: Array.from(files),
                }));
            }
        } else if (name === 'productUnitPrice' || name === 'productSupPrice') {
            const numericValue = parseCurrency(value);
            if (!/^\d*$/.test(numericValue)) return;
            setProduct((prevProduct) => ({
                ...prevProduct,
                [name]: numericValue,
            }));
        } else {
            setProduct((prevProduct) => ({
                ...prevProduct,
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
            formData.append('productName', product.productName);
            formData.append('productUnitPrice', product.productUnitPrice);
            formData.append('productSupPrice', product.productSupPrice);
            formData.append('productCategory', product.productCategory);
            formData.append('productUnit', product.productUnit);
            formData.append('productManufacturer', product.productManufacturer);
            formData.append('productOrigin', product.productOrigin);
            formData.append('productDescription', product.productDescription);

            if (product.productImgs && product.productImgs.length > 0) {
                product.productImgs.forEach((img) => {
                    formData.append('productImgs', img);
                });
            }
            await productService.updateProduct(productId, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Sửa sản phẩm thành công!');
            navigate('/');
        } catch (error) {
            setError('Có lỗi xảy ra khi sửa sản phẩm. Vui lòng thử lại.1');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <h2 className={cx('heading')}>Sửa Sản Phẩm </h2>
            {error && <p className={cx('error-message')}>{error}</p>}
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
                    <label className={cx('label')}>Ảnh sản phẩm:</label>
                    <input type="file" name="productImgs" onChange={handleChange} className={cx('input')} multiple />
                    <div className={cx('preview')}>
                        {Array.isArray(product.productImgs) &&
                            product.productImgs.map((img, index) => {
                                if (img instanceof File) {
                                    return (
                                        <img
                                            key={index}
                                            src={URL.createObjectURL(img)}
                                            alt="Mới chọn"
                                            className={cx('preview-img')}
                                        />
                                    );
                                } else if (img.link) {
                                    return (
                                        <img
                                            key={index}
                                            src={img.link}
                                            alt={img.alt || `Ảnh ${index + 1}`}
                                            className={cx('preview-img')}
                                        />
                                    );
                                }
                                return null;
                            })}
                    </div>
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

                <button type="submit" className={cx('submit-button')} disabled={loading}>
                    {loading ? 'Đang sửa...' : 'Sửa sản phẩm'}
                </button>
            </form>
        </div>
    );
}

export default UpdateProduct;
