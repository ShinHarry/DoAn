/* eslint-disable jsx-a11y/iframe-has-title */
import classNames from 'classnames/bind';
import styles from './AboutMe.module.scss';
import { Link } from 'react-router-dom';
const cx = classNames.bind(styles);

function AboutMe() {
    return (
        <div className={cx('about-container')}>
            <section className={cx('section', 'back-home')}>
                <Link to="/" className={cx('back-button')}>
                    ←Trang Chủ
                </Link>
            </section>
            <h1 className={cx('heading')}>Về Chúng Tôi</h1>
            <section className={cx('section')}>
                <h2>Giới thiệu cửa hàng</h2>
                <p>
                    Cửa hàng chúng tôi được thành lập với mục tiêu mang đến những sản phẩm chất lượng cao, có nguồn gốc
                    rõ ràng, cùng dịch vụ chăm sóc khách hàng tận tâm. Trải qua nhiều năm hoạt động, chúng tôi đã và
                    đang xây dựng được niềm tin vững chắc từ hàng ngàn khách hàng trên khắp cả nước.
                </p>
                <p>
                    Chúng tôi không chỉ là nơi cung cấp sản phẩm, mà còn là người bạn đồng hành cùng khách hàng trong
                    hành trình lựa chọn những gì tốt nhất cho bản thân và gia đình.
                </p>
            </section>

            <section className={cx('section')}>
                <h2>Sứ mệnh & Tầm nhìn</h2>
                <p>
                    Sứ mệnh của chúng tôi là mang đến cho người tiêu dùng Việt Nam những sản phẩm chính hãng, giá cả hợp
                    lý, dịch vụ minh bạch và trải nghiệm mua sắm thuận tiện.
                </p>
                <p>
                    Tầm nhìn của chúng tôi là trở thành một trong những thương hiệu bán lẻ đáng tin cậy hàng đầu tại
                    Việt Nam, với hệ sinh thái sản phẩm và dịch vụ phong phú, hiện đại và thân thiện với người dùng.
                </p>
            </section>

            <section className={cx('section')}>
                <h2>Giá trị cốt lõi</h2>
                <ul>
                    <li>
                        <strong>Chất lượng:</strong> Ưu tiên hàng đầu là chất lượng sản phẩm và dịch vụ.
                    </li>
                    <li>
                        <strong>Trung thực:</strong> Cam kết minh bạch về giá cả và xuất xứ sản phẩm.
                    </li>
                    <li>
                        <strong>Khách hàng là trọng tâm:</strong> Luôn lắng nghe và phục vụ khách hàng tận tâm.
                    </li>
                    <li>
                        <strong>Đổi mới:</strong> Không ngừng học hỏi, cải tiến và sáng tạo.
                    </li>
                </ul>
            </section>

            <section className={cx('section')}>
                <h2>Cam kết với khách hàng</h2>
                <ul>
                    <li>Sản phẩm chính hãng 100%, có hóa đơn chứng từ đầy đủ.</li>
                    <li>Chính sách đổi trả minh bạch, dễ dàng trong vòng 7 ngày.</li>
                    <li>Hỗ trợ giao hàng nhanh trên toàn quốc.</li>
                    <li>Đội ngũ tư vấn viên nhiệt tình, hỗ trợ 24/7.</li>
                </ul>
            </section>

            <section className={cx('section')}>
                <h2>Đội ngũ của chúng tôi</h2>
                <p>
                    Đằng sau thành công của cửa hàng là một tập thể trẻ trung, năng động và đầy nhiệt huyết. Mỗi thành
                    viên đều mang trong mình khát vọng phục vụ khách hàng một cách tốt nhất. Từ bộ phận bán hàng, chăm
                    sóc khách hàng – tất cả đều nỗ lực mỗi ngày để đảm bảo sự hài lòng cho quý khách.
                </p>
            </section>

            <section className={cx('section')}>
                <h2>Thông tin liên hệ</h2>
                <p>
                    <strong>Địa chỉ:</strong> 484 Lạch Tray, Đằng Giang, Ngô Quyền, Hải Phòng
                </p>
                <p>
                    <strong>Số điện thoại:</strong>
                </p>
                <ul className={cx('contact-list')}>
                    <li>📞 0362 025 195 (Hotline - Phạm Đức Anh)</li>
                    <li>📞 0979 341 723 (CSKH - Phạm Thành Quân)</li>
                </ul>
                <p>
                    <strong>Email:</strong>
                </p>
                <ul className={cx('contact-list')}>
                    <li>📧 anh92474@st.vimaru.edu.vn</li>
                    <li>📧 quan90923@st.vimaru.edu.vn</li>
                </ul>

                <p>
                    <strong>Thời gian làm việc:</strong> 8:00 - 20:00 (Tất cả các ngày trong tuần)
                </p>
            </section>

            <section className={cx('section')}>
                <h2>Địa chỉ cửa hàng</h2>
                <div className={cx('map')}>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1864.47
                    49565021446!2d106.69682381599749!3d20.83372894992793!2m3!1f0!2f0!3f0!3m2!1i1024!
                    2i768!4f13.1!3m3!1m2!1s0x314a7a9e4da1b8e9%3A0xf710467a45c131b4!2zNDg0IEzhuqFjaC
                    UcmF5LCDEkOG6sW5nIEdpYW5nLCBOZ8O0IFF1eeG7gW4sIEjhuqNpIFBow7JuZywgVmnhu4d0IE5hb
                    Q!5e0!3m2!1svi!2s!4v1748957928574!5m2!1svi!2s"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </section>
        </div>
    );
}

export default AboutMe;
