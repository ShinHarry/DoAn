// import { useEffect, useState } from 'react';
// import * as productService from '~/services/productService';
// import classNames from 'classnames/bind';
// import styles from './Home.module.scss';
// import { Link } from 'react-router-dom';
// import config from '~/config';
// import Image from '~/components/Image';
// import Banner from '~/layouts/components/BannerImage';

// const cx = classNames.bind(styles);

// function Home() {
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [page, setPage] = useState(1);
//     const [limit, setLimit] = useState(0);
//     const [total, setTotal] = useState(0);

//     useEffect(() => {
//         const fetchProducts = async () => {
//             setLoading(true);
//             try {
//                 const response = await productService.getProducts({ page: 1, limit: 12 });

//                 setProducts(response.products);
//                 setTotal(response.total);
//                 setLimit(response.limit);
//             } catch (error) {
//                 setError('Lỗi khi lấy danh sách sản phẩm');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchProducts();
//     }, [page, limit]);

//     return (
//         <div className={cx('wrapper')}>
//             <div className={cx('slide')}>
//                 <Banner />
//             </div>

//             <br />
//             <h2>Danh sách sản phẩm</h2>

//             {error && <p>{error}</p>}
//             {loading ? (
//                 <p>Đang tải...</p>
//             ) : (
//                 <>
//                     <div className={cx('product-list')} tabIndex={-1}>
//                         {products.map((product) => {
//                             const hasDiscount = product.productSupPrice > 0;
//                             const productFinallyPrice = product.productUnitPrice * (1 - product.productSupPrice / 100);
//                             return (
//                                 <div key={product._id} className={cx('product-item')}>
//                                     <Link to={`${config.routes.productDetail.replace(':productId', product._id)}`}>
//                                         <Image
//                                             className={cx('product-avatar')}
//                                             src={product.productImgs[0].link}
//                                             alt={product.productName}
//                                         />
//                                     </Link>
//                                     <div className={cx('product-info')}>
//                                         <Link to={`${config.routes.productDetail.replace(':productId', product._id)}`}>
//                                             <h3>{product.productName}</h3>
//                                         </Link>
//                                         <p>
//                                             {hasDiscount ? (
//                                                 <>
//                                                     <span className={cx('old-price')}>
//                                                         {product.productUnitPrice.toLocaleString()} VNĐ
//                                                     </span>{' '}
//                                                     <span className={cx('discount-price')}>
//                                                         {productFinallyPrice.toLocaleString()} VNĐ
//                                                     </span>
//                                                 </>
//                                             ) : (
//                                                 <span className={cx('normal-price')}>
//                                                     {product.productUnitPrice.toLocaleString()} VNĐ
//                                                 </span>
//                                             )}
//                                         </p>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>

//                     {/* Phân trang */}
//                     <div className={cx('pagination')}>
//                         <button disabled={page === 1} onClick={() => setPage(page - 1)}>
//                             Trước
//                         </button>
//                         <span>
//                             Trang {page} / {Math.ceil(total / limit)}
//                         </span>
//                         <button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>
//                             Tiếp
//                         </button>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

// export default Home;
import { useState, useEffect, useCallback } from 'react';

import * as productService from '~/services/productService';
import * as categoryService from '~/services/categoryService';
import * as originService from '~/services/originService';
import * as manufacturerService from '~/services/manufacturerService';
import config from '~/config';
import Image from '~/components/Image';

import classNames from 'classnames/bind';
import styles from './Home.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import Banner from '~/layouts/components/BannerImage';
const cx = classNames.bind(styles);

const Home = () => {
    const [categoryMap, setCategoryMap] = useState({});
    const [originMap, setOriginMap] = useState({});
    const [manufacturerMap, setManufacturerMap] = useState({});
    const [categories, setCategories] = useState([]);
    const [origins, setOrigins] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedOrigin, setSelectedOrigin] = useState('');
    const [selectedManufacturer, setSelectedManufacturer] = useState('');
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
    }, [selectedCategory, selectedOrigin, selectedManufacturer]);

    useEffect(() => {
        fetchCategories();
        fetchOrigins();
        fetchManufacturers();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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
                </div>

                <div className={cx('product-grid')}>
                    {loading ? (
                        <p>Đang tải sản phẩm...</p>
                    ) : products.length === 0 ? (
                        <p>Không tìm thấy sản phẩm nào.</p>
                    ) : (
                        products.map((product) => (
                            <div className={cx('product-card')} key={product._id}>
                                <div className={cx('product-item')}>
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
                                            <p>
                                                Nhà sản xuất:{' '}
                                                {product.productManufacturer?.nameManufacturer || 'Không rõ'}
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
        </div>
    );
};

export default Home;
