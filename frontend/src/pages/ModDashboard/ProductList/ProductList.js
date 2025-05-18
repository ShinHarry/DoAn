import { useState, useEffect, useCallback } from 'react';

import * as productService from '~/services/productService';
import * as categoryService from '~/services/categoryService';
import * as originService from '~/services/originService';
import * as manufacturerService from '~/services/manufacturerService';
import config from '~/config';
import Image from '~/components/Image';
import * as productServices from '~/services/productService';

import classNames from 'classnames/bind';
import styles from './ProductList.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Button from '~/components/Button';
const cx = classNames.bind(styles);

const ProductList = () => {
    const [categoryMap, setCategoryMap] = useState({});
    const [originMap, setOriginMap] = useState({});
    const [manufacturerMap, setManufacturerMap] = useState({});
    const [categories, setCategories] = useState([]);
    const [origins, setOrigins] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedOrigin, setSelectedOrigin] = useState('');
    const [selectedManufacturer, setSelectedManufacturer] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(0);
    const [total, setTotal] = useState(0);

    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const categoryData = await categoryService.getCategories();
            const map = {};
            categoryData.forEach((cat) => {
                map[cat.nameCategory.trim()] = cat._id;
            });
            setCategoryMap(map);
            setCategories(categoryData);
        } catch {
            setError('Không thể tải danh mục. Vui lòng thử lại.');
        }
    };

    const fetchOrigins = async () => {
        try {
            const originData = await originService.getOrigin();
            const map = {};
            originData.forEach((origin) => {
                map[origin.nameOrigin.trim()] = origin._id;
            });
            setOriginMap(map);
            setOrigins(originData);
        } catch {
            setError('Không thể tải xuất xứ. Vui lòng thử lại.');
        }
    };

    const fetchManufacturers = async () => {
        try {
            const manufacturerData = await manufacturerService.getManufacturer();
            const map = {};
            manufacturerData.forEach((manufacturer) => {
                map[manufacturer.nameManufacturer.trim()] = manufacturer._id;
            });
            setManufacturerMap(map);
            setManufacturers(manufacturerData);
        } catch {
            setError('Không thể tải nhà sản xuất. Vui lòng thử lại.');
        }
    };

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await productService.getProducts({
                search: searchTerm,
                category: selectedCategory,
                origin: selectedOrigin,
                manufacturer: selectedManufacturer,
                sortBy: 'productName',
                sortOrder: 'asc',
            });
            setTotal(response.total);
            setLimit(response.limit);
            setProducts(response.products);
        } catch (err) {
            console.error(err);
            setError('Lỗi khi lấy danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedCategory, selectedOrigin, selectedManufacturer]);

    useEffect(() => {
        fetchCategories();
        fetchOrigins();
        fetchManufacturers();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDeleteProduct = async (productId) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (!result.isConfirmed) return;

        try {
            await productServices.deleteProductById(productId);
            await Swal.fire('Đã xóa!', 'Sản phẩm đã được xóa thành công.', 'success');
            navigate('/moddashboard/productlist');
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            Swal.fire('Lỗi', 'Đã xảy ra lỗi khi xóa sản phẩm.', 'error');
        }
    };

    return (
        <div className={cx('product-filter')}>
            {error && <div className={cx('error')}>{error}</div>}
            <h1 className={cx('title')}>Danh sách sản phẩm</h1>
            <div className={cx('filter-bar')}>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    value={Object.keys(categoryMap).find((key) => categoryMap[key] === selectedCategory) || ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        setSelectedCategory(val === '' ? '' : categoryMap[val]);
                    }}
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((c) => (
                        <option key={c._id} value={c.nameCategory}>
                            {c.nameCategory}
                        </option>
                    ))}
                </select>

                <select
                    value={Object.keys(originMap).find((key) => originMap[key] === selectedOrigin) || ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        setSelectedOrigin(val === '' ? '' : originMap[val]);
                    }}
                >
                    <option value="">Tất cả xuất xứ</option>
                    {origins.map((o) => (
                        <option key={o._id} value={o.nameOrigin}>
                            {o.nameOrigin}
                        </option>
                    ))}
                </select>

                <select
                    value={
                        Object.keys(manufacturerMap).find((key) => manufacturerMap[key] === selectedManufacturer) || ''
                    }
                    onChange={(e) => {
                        const val = e.target.value;
                        setSelectedManufacturer(val === '' ? '' : manufacturerMap[val]);
                    }}
                >
                    <option value="">Tất cả nhà máy</option>
                    {manufacturers.map((m) => (
                        <option key={m._id} value={m.nameManufacturer}>
                            {m.nameManufacturer}
                        </option>
                    ))}
                </select>
            </div>
            <div className={cx('btn-actions')}>
                <Button
                    className={cx('btn-add')}
                    leftIcon={<FontAwesomeIcon icon={faPlus} />}
                    onClick={() => navigate('/addProduct')}
                >
                    Thêm sản phẩm
                </Button>
            </div>
            <div className={cx('product-grid')}>
                {loading ? (
                    <p>Đang tải sản phẩm...</p>
                ) : products.length === 0 ? (
                    <p>Không tìm thấy sản phẩm nào.</p>
                ) : (
                    products.map((product) => (
                        <div className={cx('product-card')} key={product._id}>
                            <Link to={`${config.routes.productDetail.replace(':productId', product._id)}`}>
                                <Image
                                    className={cx('product-image')}
                                    src={product.productImgs[0].link}
                                    alt={product.productName}
                                />

                                <div className={cx('product-info')}>
                                    <h3>{product.productName}</h3>
                                    <p>Giá: {product.productUnitPrice.toLocaleString()} VND</p>
                                    <p>Danh mục: {product.productCategory?.nameCategory || 'Không có'}</p>
                                    <p>Xuất xứ: {product.productOrigin?.nameOrigin || 'Không rõ'}</p>
                                    <p>Nhà sản xuất: {product.productManufacturer?.nameManufacturer || 'Không rõ'}</p>
                                    <p>Trạng thái: {product.productStatus === 'available' ? 'Còn hàng' : 'Hết hàng'}</p>

                                    <p>Đã bán: {product.productSoldQuantity}</p>
                                </div>
                            </Link>
                            <div className={cx('btn-actions')}>
                                <button
                                    className={cx('btn-edit')}
                                    onClick={() => navigate(`/updateProduct/${product._id}`)}
                                >
                                    Sửa
                                </button>
                                <button className={cx('btn-delete')} onClick={() => handleDeleteProduct(product._id)}>
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className={cx('pagination')}>
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                    Trước
                </button>
                <span>
                    Trang {page} / {Math.ceil(total / limit)}
                </span>
                <button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>
                    Tiếp
                </button>
            </div>
        </div>
    );
};

export default ProductList;
