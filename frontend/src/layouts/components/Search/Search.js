import React, { useState, useEffect, useRef } from 'react';
import { faCircleXmark, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import HeadlessTippy from '@tippyjs/react/headless';
import classNames from 'classnames/bind';
import * as searchServices from '~/services/searchService';
import { Wrapper as PopperWrapper } from '~/components/Popper';
import { SearchIcon } from '~/components/Icons';
import { useDebounce } from '~/hooks';
import styles from './Search.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import config from '~/config';

const cx = classNames.bind(styles);

function Search() {
    const [searchValue, setSearchValue] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);

    const debouncedValue = useDebounce(searchValue, 500);
    const navigate = useNavigate();
    const inputRef = useRef();

    useEffect(() => {
        if (!debouncedValue) {
            setSearchResult([]);
            return;
        }
        const fetchAPI = async () => {
            setLoading(true);
            const result = await searchServices.search({ debouncedValue });
            setSearchResult(result.products);
            setLoading(false);
        };
        fetchAPI();
    }, [debouncedValue]);

    const handleClear = () => {
        setSearchValue('');
        setSearchResult([]);
        inputRef.current.focus();
    };

    const handleHideResult = () => {
        setShowResult(false);
    };

    const handleChange = (e) => {
        const searchValue = e.target.value;
        if (!searchValue.startsWith(' ')) {
            setSearchValue(searchValue);
        }
    };

    const handleSearch = () => {
        if (searchValue.trim()) {
            navigate(`${config.routes.search}?q=${searchValue}`);
        }
    };

    return (
        <div>
            <HeadlessTippy
                interactive
                visible={showResult && searchResult.length > 0}
                render={(attrs) => (
                    <div className={cx('search-result')} tabIndex="-1" {...attrs}>
                        <PopperWrapper>
                            <h4 className={cx('search-title')}>Product</h4>
                            {searchResult.slice(0, 7).map((result) => {
                                const hasDiscount = result.productSupPrice > 0;
                                const productFinallyPrice =
                                    result.productUnitPrice * (1 - result.productSupPrice / 100);
                                return (
                                    <Link to={`${config.routes.productDetail.replace(':productId', result._id)}`}>
                                        <div key={result._id} className={cx('product-item')}>
                                            <img
                                                className={cx('product-avatar')}
                                                src={result.productImgs[0].link}
                                                alt={result.productName}
                                            />
                                            <div className={cx('product-info')}>
                                                <h3>{result.productName}</h3>
                                                <p>
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className={cx('old-price')}>
                                                                {result.productUnitPrice.toLocaleString()} VNĐ
                                                            </span>{' '}
                                                            <span className={cx('discount-price')}>
                                                                {productFinallyPrice.toLocaleString()} VNĐ
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className={cx('normal-price')}>
                                                            {result.productUnitPrice.toLocaleString()} VNĐ
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </PopperWrapper>
                    </div>
                )}
                onClickOutside={handleHideResult}
            >
                <div className={cx('search')}>
                    <input
                        ref={inputRef}
                        value={searchValue}
                        placeholder="Search products...."
                        spellCheck={false}
                        onChange={handleChange}
                        onFocus={() => setShowResult(true)}
                    />
                    {!!searchValue && !loading && (
                        <button className={cx('clear')} onClick={handleClear}>
                            <FontAwesomeIcon icon={faCircleXmark} />
                        </button>
                    )}
                    {loading && <FontAwesomeIcon className={cx('loading')} icon={faSpinner} />}
                    <button className={cx('search-btn')} onClick={handleSearch}>
                        <SearchIcon />
                    </button>
                </div>
            </HeadlessTippy>
        </div>
    );
}

export default Search;
