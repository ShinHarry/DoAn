import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as productServices from '~/services/productService';
import * as cartService from '~/services/cartService';
import * as wishlistService from '~/services/wishlistService';
import classNames from 'classnames/bind';
import styles from './ProductDetail.module.scss';
import config from '~/config';
import Image from '~/components/Image';
import Swal from 'sweetalert2';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';

const cx = classNames.bind(styles);

function ProductDetail() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [productLoading, setProductLoading] = useState(true);

    const [userData, setUserData] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    const [isLiked, setIsLiked] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUser) {
            try {
                setUserData(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse user data:', error);
            }
        }
        setUserLoading(false);
    }, []);

    useEffect(() => {
        const fetchProductDetails = async () => {
            setProductLoading(true);
            try {
                const response = await productServices.getProductById(productId);
                setProduct(response);
            } catch (error) {
                console.error('Error fetching product details:', error);
            }
            setProductLoading(false);
        };
        fetchProductDetails();
    }, [productId]);

    useEffect(() => {
        if (!userData || !product) return;

        const checkLiked = async () => {
            try {
                const data = await wishlistService.getWishlistByUser(userData._id);
                const existed = data.find((item) => item.productId === product._id);
                setIsLiked(!!existed);
            } catch (err) {
                console.error('Lỗi khi kiểm tra wishlist:', err);
            }
        };

        checkLiked();
    }, [userData, product]);

    const handleAddToCart = async () => {
        if (!userData) {
            Swal.fire({
                icon: 'warning',
                title: 'Bạn chưa đăng nhập',
                text: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
                confirmButtonText: 'Đăng nhập',
            }).then(() => navigate('/login'));
            return;
        }

        if (!product || product.productStatus !== 'available') {
            Swal.fire({
                icon: 'error',
                title: 'Không thể thêm sản phẩm',
                text: 'Sản phẩm hiện không có sẵn hoặc đã hết hàng.',
                confirmButtonText: 'OK',
            });
            return;
        }

        try {
            const response = await cartService.addToCart(productId, 1);
            if (response.success) {
                Swal.fire('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng', 'success');
            } else {
                Swal.fire('Thêm thất bại', response.message || 'Không thể thêm sản phẩm vào giỏ hàng.', 'error');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng.';
            Swal.fire('Thất bại', errorMessage, 'error');
        }
    };

    const handleLike = async () => {
        if (!userData) {
            Swal.fire({
                icon: 'warning',
                title: 'Bạn chưa đăng nhập',
                text: 'Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích',
                confirmButtonText: 'Đăng nhập',
            }).then(() => navigate('/login'));
            return;
        }

        if (isLiked) {
            try {
                const existing = await wishlistService.getWishlistByUser(userData._id);
                const item = existing.find((i) => i.productId === product._id);
                if (item) {
                    await wishlistService.deleteWishlist(item._id);
                    setIsLiked(false);
                    Swal.fire('Đã xóa', 'Đã xóa khỏi danh sách yêu thích', 'info');
                }
            } catch (err) {
                Swal.fire('Lỗi', 'Không thể xóa khỏi danh sách yêu thích.', 'error');
            }
        } else {
            try {
                const wishlistItem = {
                    productId: product._id,
                    name: product.productName,
                    price: productUnitPrice * (1 - productSupPrice / 100),
                    image: product.productImgs[0]?.link,
                };
                const res = await wishlistService.addToWishlist(wishlistItem);
                if (res && res._id) {
                    setIsLiked(true);
                    Swal.fire('Thành công', 'Đã thêm vào danh sách yêu thích!', 'success');
                }
            } catch (err) {
                Swal.fire('Lỗi', 'Không thể thêm sản phẩm vào danh sách yêu thích.', 'error');
            }
        }
    };

    const handleDeleteProduct = async () => {
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
            Swal.fire('Lỗi', 'Đã xảy ra lỗi khi xóa sản phẩm.', 'error');
        }
    };

    if (productLoading || !product) {
        return <div>Đang tải thông tin sản phẩm...</div>;
    }

    const {
        productName,
        productImgs,
        productDescription,
        productUnitPrice,
        productSupPrice,
        productQuantity,
        productSoldQuantity,
        productAvgRating,
        productCategory,
        productManufacturer,
        productOrigin,
        productUnit,
        productWarranty,
        productStatus,
    } = product;

    const hasDiscount = productSupPrice > 0;
    const productFinallyPrice = productUnitPrice * (1 - productSupPrice / 100);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('product-item')}>
                <Slider
                    dots={true}
                    fade={true}
                    infinite={true}
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    className={cx('product-slider')}
                >
                    {productImgs?.map((img, index) => (
                        <div key={index}>
                            <Image className={cx('product-images')} src={img.link} alt={img.alt || productName} />
                        </div>
                    ))}
                </Slider>

                <div className={cx('product-info')}>
                    <h2 className={cx('product-name')}>{productName}</h2>

                    <div className={cx('price')}>
                        {hasDiscount ? (
                            <>
                                <span className={cx('discount-price')}>{productFinallyPrice.toLocaleString()}VNĐ</span>
                                <span className={cx('old-price')}>{productUnitPrice.toLocaleString()}VNĐ</span>
                            </>
                        ) : (
                            <span className={cx('normal-price')}>{productUnitPrice.toLocaleString()} VNĐ</span>
                        )}
                    </div>

                    <div className={cx('product-quantity')}>
                        <p className={cx('description-product')}>
                            <span>Số lượng còn lại:</span> {productQuantity}
                        </p>
                        <p className={cx('description-product')}>
                            <span>Số lượng đã bán:</span> {productSoldQuantity}
                        </p>
                        <p className={cx('description-product')}>
                            <span>Đánh giá trung bình:</span> {productAvgRating}
                        </p>
                    </div>

                    <div className={cx('product-actions')}>
                        {!userLoading && userData?.role === 'cus' && (
                            <>
                                <button onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
                                <button
                                    onClick={handleLike}
                                    style={{ backgroundColor: isLiked ? 'red' : 'gray', color: 'white' }}
                                >
                                    {isLiked ? 'Bỏ thích' : 'Thích'}
                                </button>
                            </>
                        )}

                        {!userLoading && userData?.role === 'mod' && (
                            <>
                                <Link to={config.routes.updateProduct.replace(':productId', product._id)}>
                                    <button>Sửa sản phẩm</button>
                                </Link>
                                <button onClick={handleDeleteProduct} className={cx('delete-button')}>
                                    Xóa sản phẩm
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className={cx('product-details')}>
                <h3>Chi tiết sản phẩm</h3>
                <p className={cx('description-product')}>
                    <span>Danh mục:</span> {productCategory.nameCategory}
                </p>
                <p className={cx('description-product')}>
                    <span>Nhà sản xuất:</span> {productManufacturer.nameManufacturer}
                </p>
                <p className={cx('description-product')}>
                    <span>Xuất xứ:</span> {productOrigin.nameOrigin}
                </p>
                <p className={cx('description-product')}>
                    <span>Đơn vị:</span> {productUnit.nameUnit}
                </p>
                <p className={cx('description-product')}>
                    <span>Bảo hành:</span> {productWarranty} tháng
                </p>
                <p className={cx('description-product')}>
                    <span>Trạng thái:</span> {productStatus === 'available' ? 'Còn hàng' : 'Hết hàng'}
                </p>
                <p className={cx('description-product')}>
                    <span>Mô tả:</span> {productDescription}
                </p>
            </div>
        </div>
    );
}

export default ProductDetail;
