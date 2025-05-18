import { useState, useEffect } from 'react';
import * as categoryService from '~/services/categoryService';
import { Link, useParams } from 'react-router-dom';
import styles from './Category.module.scss';
import classNames from 'classnames/bind';
import Image from '~/components/Image';
import config from '~/config';

const cx = classNames.bind(styles);

function Category() {
    const { categoryId } = useParams();
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [total, setTotal] = useState(0);
    const [sortOrder, setSortOrder] = useState('asc');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await categoryService.getProductsByCategories(categoryId, {
                    page,
                    limit,
                    sortOrder,
                });
                setProducts(response.products);
                setTotal(response.total);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId, page, limit, sortOrder]);

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
        setPage(1);
    };

    return (
        <div className={cx('wrapper')}>
            <h2>Danh sách sản phẩm</h2>
            <div className={cx('filter-bar')}>
                <label>Sắp xếp theo giá: </label>
                <select value={sortOrder} onChange={handleSortChange}>
                    <option value="asc">Tăng dần</option>
                    <option value="desc">Giảm dần</option>
                </select>
            </div>

            {loading && <p>Đang tải...</p>}
            {error && <p>Lỗi: {error}</p>}

            <div className={cx('product-list')}>
                {products.map((product) => (
                    <div key={product._id} className={cx('product-item')}>
                        <div className={cx('product-info')}>
                            <Link to={`${config.routes.productDetail.replace(':productId', product._id)}`}>
                                <Image
                                    className={cx('product-image')}
                                    src={product.productImgs[0].link}
                                    alt={product.productName}
                                />
                                <h3>{product.productName}</h3>
                                <p>Giá: {product.productUnitPrice.toLocaleString()} VND</p>
                                <p>Xuất xứ: {product.productOrigin?.nameOrigin || 'Không rõ'}</p>
                                <p>Nhà sản xuất: {product.productManufacturer?.nameManufacturer || 'Không rõ'}</p>
                                <p>Trạng thái: {product.productStatus === 'available' ? 'Còn hàng' : 'Hết hàng'}</p>
                                <p>Đã bán: {product.productSoldQuantity}</p>
                            </Link>
                        </div>
                    </div>
                ))}
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
}

export default Category;
