import { useState, useEffect } from 'react';
import * as categoryService from '~/services/categoryService';
import { useParams } from 'react-router-dom';
import styles from './Category.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);
function Category() {
    const { categoryId } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await categoryService.getProductsByCategories(categoryId);
                setProducts(response);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId]);
    return (
        <div className={cx('wrapper')}>
            <h2>Danh sách sản phẩm</h2>
            {loading && <p>Đang tải...</p>}
            {error && <p>Lỗi: {error}</p>}
            <div className={cx('product-list')}>
                {products.map((product) => (
                    <div key={product._id} className={cx('product-item')}>
                        <div className={cx('product-info')}>
                            {product._id}
                            <p>Name: {product.productName}</p>
                            {product.productUnitPrice}
                            <img src={product.productImgs[0]?.link} alt={product.productImgs[0]?.alt}></img>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Category;
