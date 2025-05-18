import { useState, useEffect, useCallback } from 'react';

import * as productService from '~/services/productService';
import * as categoryService from '~/services/categoryService';
import * as originService from '~/services/originService';
import * as manufacturerService from '~/services/manufacturerService';
import { useDebounce } from '~/hooks';

import config from '~/config';
import Image from '~/components/Image';

import classNames from 'classnames/bind';
import styles from './Home.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import Banner from '~/layouts/components/BannerImage';
const cx = classNames.bind(styles);

const Home = () => {
    const [categoryMap, setCategoryMap] = useState({});
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    const [originMap, setOriginMap] = useState({});
    const [origins, setOrigins] = useState([]);
    const [selectedOrigin, setSelectedOrigin] = useState('');

    const [manufacturerMap, setManufacturerMap] = useState({});
    const [manufacturers, setManufacturers] = useState([]);
    const [selectedManufacturer, setSelectedManufacturer] = useState('');

    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortPrice, setSortPrice] = useState('');
    const debouncedMinPrice = useDebounce(minPrice, 500);
    const debouncedMaxPrice = useDebounce(maxPrice, 500);
    // 'asc' hoặc 'desc'
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(0);
    const [total, setTotal] = useState(0);

    // const navigate = useNavigate();

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
                category: selectedCategory,
                origin: selectedOrigin,
                manufacturer: selectedManufacturer,
                sortBy: sortPrice ? 'productUnitPrice' : 'productName',
                sortOrder: sortPrice || 'asc',
                minPrice: debouncedMinPrice || undefined,
                maxPrice: debouncedMaxPrice || undefined,
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
    }, [selectedCategory, selectedOrigin, selectedManufacturer, sortPrice, debouncedMinPrice, debouncedMaxPrice]);

    useEffect(() => {
        fetchCategories();
        fetchOrigins();
        fetchManufacturers();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const formatNumber = (value) => {
        if (!value) return '';
        return Number(value).toLocaleString('vi-VN');
    };

    const parseNumber = (formattedValue) => {
        return formattedValue.replace(/\./g, '');
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('slide')}>
                <Banner />
            </div>
            <br />
            <div className={cx('product-filter')}>
                {error && <div className={cx('error')}>{error}</div>}
                <h1 className={cx('title')}>Danh sách sản phẩm</h1>
                <div className={cx('filter-bar')}>
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
                            Object.keys(manufacturerMap).find((key) => manufacturerMap[key] === selectedManufacturer) ||
                            ''
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
                    <input
                        type="text"
                        placeholder="Giá từ"
                        value={formatNumber(minPrice)}
                        onChange={(e) => {
                            const raw = parseNumber(e.target.value);
                            if (!isNaN(raw)) {
                                setMinPrice(raw);
                            }
                        }}
                    />

                    <input
                        type="text"
                        placeholder="Đến"
                        value={formatNumber(maxPrice)}
                        onChange={(e) => {
                            const raw = parseNumber(e.target.value);
                            if (!isNaN(raw)) {
                                setMaxPrice(raw);
                            }
                        }}
                    />

                    <select value={sortPrice} onChange={(e) => setSortPrice(e.target.value)}>
                        <option value="">Sắp xếp theo giá</option>
                        <option value="asc">Giá tăng dần</option>
                        <option value="desc">Giá giảm dần</option>
                    </select>
                </div>

                <div className={cx('product-grid')}>
                    {loading ? (
                        <p>Đang tải sản phẩm...</p>
                    ) : products.length === 0 ? (
                        <p>Không tìm thấy sản phẩm nào.</p>
                    ) : (
                        products.map((product) => {
                            const hasDiscount = product.productSupPrice > 0;
                            const productFinallyPrice =
                                product.productUnitPrice * (1 - (product.productSupPrice || 0) / 100);

                            return (
                                <div className={cx('product-card')} key={product._id}>
                                    <div className={cx('product-item')}>
                                        <Link to={`${config.routes.productDetail.replace(':productId', product._id)}`}>
                                            <Image
                                                className={cx('product-image')}
                                                src={product.productImgs?.[0]?.link || ''}
                                                alt={product.productName}
                                            />
                                            <div className={cx('product-info')}>
                                                <h3>{product.productName}</h3>
                                                <p>
                                                    Giá:{' '}
                                                    {hasDiscount ? (
                                                        <>
                                                            <span
                                                                style={{
                                                                    textDecoration: 'line-through',
                                                                    color: 'gray',
                                                                    marginRight: '8px',
                                                                }}
                                                            >
                                                                {product.productUnitPrice.toLocaleString()} VND
                                                            </span>
                                                            <span style={{ color: 'red', fontWeight: 'bold' }}>
                                                                {productFinallyPrice.toLocaleString()} VND
                                                            </span>
                                                        </>
                                                    ) : (
                                                        `${product.productUnitPrice.toLocaleString()} VND`
                                                    )}
                                                </p>
                                                <p>
                                                    Trạng thái:{' '}
                                                    {product.productStatus === 'available' ? 'Còn hàng' : 'Hết hàng'}
                                                </p>
                                                <p>Đã bán: {product.productSoldQuantity}</p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
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
        </div>
    );
};

export default Home;
