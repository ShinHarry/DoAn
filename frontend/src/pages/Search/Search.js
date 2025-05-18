import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as searchServices from '~/services/searchService';

import classNames from 'classnames/bind';
import styles from './Search.module.scss';
import config from '~/config';
import Image from '~/components/Image';

const cx = classNames.bind(styles);

function Search() {
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(0);
    const [total, setTotal] = useState(0);

    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');

    useEffect(() => {
        if (query) {
            const fetchSearchResults = async () => {
                setLoading(true);
                const result = await searchServices.search({ page, limit: 12, q: query });
                setSearchResult(result.products);
                setLimit(result.limit);
                setTotal(result.total);
                setLoading(false);
            };
            fetchSearchResults();
        }
    }, [query, page]);

    return (
        <div className={cx('wrapper')}>
            <h3 className={cx('title')}>Kết quả tìm kiếm: {query}</h3>
            {loading ? (
                <p>Loading...!</p>
            ) : (
                <>
                    <div className={cx('product-list')} tabIndex={-1}>
                        {searchResult.map((product) => {
                            const hasDiscount = product.productSupPrice > 0;
                            const productFinallyPrice = product.productUnitPrice * (1 - product.productSupPrice / 100);
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
                                                            <br />
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
                                                <p>Đánh giá: {product.productAvgRating} ⭐</p>
                                            </div>
                                        </Link>
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

export default Search;
