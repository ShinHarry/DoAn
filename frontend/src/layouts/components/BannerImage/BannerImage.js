import classNames from 'classnames/bind';
import styles from './BannerImage.module.scss';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import * as newService from '~/services/newService';
import { useEffect, useState } from 'react';

const cx = classNames.bind(styles);

function BannerImage() {
    const [news, setNews] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await newService.getNew();
                console.log(response);
                setNews(response);
            } catch (error) {
                console.error(error);
                setError('Lỗi khi lấy banner');
            }
        };
        fetchNews();
    }, []);

    return (
        <div className={cx('container')}>
            {error && <div className={cx('error')}>{error}</div>}
            <Swiper
                spaceBetween={30}
                centeredSlides={true}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: true,
                }}
                pagination={{
                    //dot
                    clickable: true,
                }}
                modules={[Autoplay, Pagination, Navigation]} //Import các module cần dùng cho Swiper
                className={cx('mySwiper')}
            >
                {news.map(
                    (item) =>
                        item.state && (
                            <SwiperSlide key={item._id}>
                                <img src={item.newImage?.link} alt={item.newImage?.alt || 'image'} />
                            </SwiperSlide>
                        ),
                )}
            </Swiper>
        </div>
    );
}

export default BannerImage;
