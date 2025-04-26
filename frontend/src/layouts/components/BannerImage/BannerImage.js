import classNames from 'classnames/bind';
import styles from './BannerImage.module.scss';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/scss';
import 'swiper/scss/pagination';
import 'swiper/scss/navigation';
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
                setNews(response);
            } catch (error) {
                console.error(error);
                setError('Lỗi khi lấy banner');
            }
        };
        fetchNews();
    }, []);
   
    return (
        <div className={cx('slide')}>
            <div className={cx('container')}>
                <Swiper spaceBetween={30}
                        centeredSlides={true}
                        autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                        }}
                        pagination={{
                        clickable: true,
                        }}
                        navigation={true}
                        modules={[Autoplay, Pagination, Navigation]}
                        className={cx('mySwiper')}>
                        
                        {news.map((item) => (
                            <SwiperSlide key={item._id}>
                                <img src={item.newImage?.link} alt={item.newImage?.alt} />
                            </SwiperSlide>
                        ))}
                        
                </Swiper>
            </div>
        </div>
    )
}

export default BannerImage;
