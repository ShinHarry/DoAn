import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Profile.module.scss';

import * as userService from '~/services/userService';
import Image from '~/components/Image';

const cx = classNames.bind(styles);
function Profile() {
    const { userId } = useParams();
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await userService.getUserById(userId);
                setUser(response);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);
    return (
        <div className={cx('wrapper')}>
            <h2 className={cx('title')}>Thông tin người dùng</h2>
            {loading && <p>Đang tải...</p>}
            {error && <p>Lỗi: {error}</p>}
            <div className={cx('user-info')}>
                <div className={cx('user-avatar')}>
                    {user.userAvatar?.length > 0 ? (
                        <Image src={user.userAvatar[0].link} alt={user.userAvatar[0].alt} />
                    ) : (
                        <Image src={undefined} alt="No avatar" />
                    )}
                </div>
                <div className={cx('user-details')}>
                    <p>Tên: {user.userName}</p>
                    <p>Email: {user.userEmail}</p>
                    <p>Tên tài khoản: {user.userNameAccount}</p>
                    <p>Số điện thoại: {user.userPhone}</p>
                    <p>Ngày sinh: {new Date(user.userBirthday).toLocaleDateString()}</p>
                    <p>Giới tính: {user.userGender}</p>
                    <p>Vai trò: {user.userRole}</p>
                    <p>Trạng thái: {user.userStatus}</p>
                    <p>Điểm: {user.userPoint}</p>
                </div>
            </div>
        </div>
    );
}

export default Profile;
