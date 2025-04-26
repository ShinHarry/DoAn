import { useEffect, useState } from 'react';
import * as productService from '~/services/productService';
import classNames from 'classnames/bind';
import styles from './Home.module.scss';
import { Link } from 'react-router-dom';
import config from '~/config';
import Image from '~/components/Image';
import Banner from '~/layouts/components/BannerImage';
const cx = classNames.bind(styles);

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(0);
    const [total, setTotal] = useState(0);
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await productService.getProducts({ page: 1, limit: 12 });

                setProducts(response.products);
                setTotal(response.total);
                setLimit(response.limit);
            } catch (error) {
                setError('Lỗi khi lấy danh sách sản phẩm');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [page, limit]);

    return (
        <div className={cx('wrapper')}>
            <Banner />

            <br /><h2>Danh sách sản phẩm</h2>
           
            {error && <p>{error}</p>}
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <>
                    <div className={cx('product-list')} tabIndex={-1}>
                        {products.map((product) => {
                            const hasDiscount = product.productSupPrice > 0;
                            const productFinallyPrice = product.productUnitPrice * (1 - product.productSupPrice / 100);
                            return (
                                <div key={product._id} className={cx('product-item')}>
                                    <Link to={`${config.routes.productDetail.replace(':productId', product._id)}`}>
                                        <Image
                                            className={cx('product-avatar')}
                                            src={product.productImgs[0].link}
                                            alt={product.productName}
                                        />
                                    </Link>
                                    <div className={cx('product-info')}>
                                        <Link to={`${config.routes.productDetail.replace(':productId', product._id)}`}>
                                            <h3>{product.productName}</h3>
                                        </Link>
                                        <p>
                                            {hasDiscount ? (
                                                <>
                                                    <span className={cx('old-price')}>
                                                        {product.productUnitPrice.toLocaleString()} VNĐ
                                                    </span>{' '}
                                                    <span className={cx('discount-price')}>
                                                        {productFinallyPrice.toLocaleString()} VNĐ
                                                    </span>
                                                </>
                                            ) : (
                                                <span className={cx('normal-price')}>
                                                    {product.productUnitPrice.toLocaleString()} VNĐ
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Phân trang */}
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
                </>
            )}
        </div>
    );
}

export default Home;
