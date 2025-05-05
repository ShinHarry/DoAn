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
    const [editedUser, setEditedUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

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

    const handleEdit = () => {
        setEditedUser(user);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'userAvatar') {
            if (files && files.length > 0) {
                setEditedUser((prevUser) => ({
                    ...prevUser,
                    userAvatar: files[0],
                }));
            }
        } else {
            setEditedUser((prevUser) => ({
                ...prevUser,
                [name]: value,
            }));
        }
    };

    const handleSave = async () => {
        // Kiểm tra độ dài và định dạng số điện thoại
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(editedUser.userPhone)) {
            setError('Số điện thoại phải gồm đúng 10 chữ số.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('userName', editedUser.userName);
            formData.append('userEmail', editedUser.userEmail);
            formData.append('userPhone', editedUser.userPhone.toString());
            formData.append('userBirthday', editedUser.userBirthday);
            formData.append('userGender', editedUser.userGender);

            if (editedUser.userAvatar) {
                formData.append('userAvatar', editedUser.userAvatar);
            }

            const updatedUser = await userService.updateUserById(userId, formData);
            setUser(updatedUser);
            setIsEditing(false);
            setError(null);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Không thể cập nhật thông tin.');
            }
        }
    };

    if (loading) return <div className={cx('wrapper')}>Đang tải...</div>;

    if (!isEditing && error)
        return (
            <div className={cx('wrapper')}>
                <p className={cx('error-message')}>Lỗi: {error}</p>
            </div>
        );

    const displayField = (label, value) => (
        <p>
            {label}: {value}
        </p>
    );

    return (
        <div className={cx('wrapper')}>
            <h2 className={cx('title')}>Thông tin người dùng</h2>

            <div className={cx('user-info')}>
                <div className={cx('user-avatar')}>
                    <Image src={user.userAvatar?.[0]?.link || ''} alt={user.userAvatar?.[0]?.alt || 'Avatar'} />
                </div>

                <div className={cx('user-details')}>
                    {isEditing ? (
                        <>
                            <div className={cx('form-group')}>
                                <label className={cx('label')}>Avatar: </label>
                                <input type="file" name="userAvatar" onChange={handleChange} className={cx('input')} />
                            </div>

                            <div className={cx('form-group')}>
                                <label className={cx('label')}>Tên: </label>
                                <input
                                    type="text"
                                    name="userName"
                                    value={editedUser.userName || ''}
                                    onChange={handleChange}
                                    className={cx('input')}
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label className={cx('label')}>Email: </label>
                                <input
                                    type="email"
                                    name="userEmail"
                                    value={editedUser.userEmail || ''}
                                    onChange={handleChange}
                                    className={cx('input')}
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label className={cx('label')}>Số điện thoại: </label>
                                <input
                                    type="text"
                                    name="userPhone"
                                    value={editedUser.userPhone || ''}
                                    onChange={handleChange}
                                    className={cx('input')}
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label className={cx('label')}>Ngày sinh: </label>
                                <input
                                    type="date"
                                    name="userBirthday"
                                    value={
                                        editedUser.userBirthday
                                            ? new Date(editedUser.userBirthday).toISOString().split('T')[0]
                                            : ''
                                    }
                                    onChange={handleChange}
                                    className={cx('input')}
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label className={cx('label')}>Giới tính: </label>
                                <select
                                    name="userGender"
                                    value={editedUser.userGender || ''}
                                    onChange={handleChange}
                                    className={cx('input')}
                                >
                                    <option value="">-- Chọn giới tính --</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            {displayField('Tên', user.userName)}
                            {displayField('Email', user.userEmail)}
                            {displayField('Tên tài khoản', user.userNameAccount)}
                            {displayField('Số điện thoại', user.userPhone)}
                            {displayField(
                                'Ngày sinh',
                                user.userBirthday ? new Date(user.userBirthday).toLocaleDateString() : '',
                            )}
                            {displayField('Giới tính', user.userGender)}
                            {displayField('Điểm', user.userPoint)}
                        </>
                    )}

                    <div className={cx('button-group')}>
                        {isEditing ? (
                            <>
                                <button onClick={handleSave}>Lưu</button>
                                <button onClick={handleCancel}>Hủy</button>
                            </>
                        ) : (
                            <button onClick={handleEdit}>Sửa</button>
                        )}
                    </div>

                    {isEditing && error && <p className={cx('error-message')}>{error}</p>}
                </div>
            </div>
        </div>
    );
}

export default Profile;
