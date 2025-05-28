import classNames from 'classnames/bind';
import styles from './AdminDashboard.module.scss';
import { useState, useEffect } from 'react';
import * as adminService from '~/services/adminService';
import Image from '~/components/Image';
import Swal from 'sweetalert2';

const cx = classNames.bind(styles);

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        userName: '',
        // userEmail: '',
        // userPhone: '',
        userStatus: '',
        userRole: '',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await adminService.getUser();
                if (response.length === 0) {
                    setError('Không có người dùng nào trong hệ thống');
                }
                setUsers(response);
            } catch (err) {
                setError('Lỗi khi lấy danh sách người dùng');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setIsEditing(false);
        setFormData({
            userName: user.userName || '',
            userEmail: user.userEmail || '',
            userPhone: user.userPhone || '',
            userStatus: user.userStatus || '',
            userRole: user.userRole || '',
        });
        setError('');
    };

    const handleEditClick = () => setIsEditing(true);
    const handleCancelEdit = () => {
        setIsEditing(false);
        setError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'userPhone') {
            const onlyNumbers = value.replace(/\D/g, '');
            setFormData((prev) => ({ ...prev, [name]: onlyNumbers }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = await adminService.updateUserById(selectedUser._id, formData);
            setSelectedUser(updatedUser);
            setUsers((prevUsers) => prevUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user)));
            setIsEditing(false);
            setError('');
        } catch (err) {
            setError('Cập nhật thất bại. Vui lòng thử lại!');
        }
    };
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc chắn muốn xóa user này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });
        if (!result.isConfirmed) return;
        try {
            await adminService.deleteUserById(selectedUser._id);
            setUsers((prev) => prev.filter((user) => user._id !== selectedUser._id));
            setSelectedUser(null);
            setError('');
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            Swal.fire('Lỗi', 'Đã xảy ra lỗi khi xóa sản phẩm.', 'error');
        }
    };
    const handleCloseModal = () => {
        setSelectedUser(null);
        setIsEditing(false);
        setError('');
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleRoleFilterChange = (e) => {
        setRoleFilter(e.target.value);
    };

    const displayField = (label, value) => (
        <p>
            <strong>{label}:</strong> {value}
        </p>
    );

    const filteredUsers = users.filter((user) => {
        const isRoleMatch = roleFilter ? user.userRole === roleFilter : true;
        const isSearchMatch =
            user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user._id.toLowerCase().includes(searchQuery.toLowerCase());
        return isRoleMatch && isSearchMatch;
    });

    return (
        <div className={cx('wrapper')}>
            <div className={cx('title')}>
                <h2>Danh sách người dùng</h2>
            </div>

            {error && !isEditing && <p className={cx('error')}>{error}</p>}

            <div className={cx('filters')}>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc ID"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                />
                <select value={roleFilter} onChange={handleRoleFilterChange} className={cx('role-filter')}>
                    <option value="">Chọn vai trò</option>
                    <option value="admin">Admin</option>
                    <option value="cus">Customer</option>
                    <option value="mod">Quản lý kinh doanh</option>
                    <option value="accountant">Kế toán</option>
                </select>
            </div>

            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <div className={cx('user-list')}>
                    {filteredUsers.map((user) => (
                        <div key={user._id} className={cx('user-item')} onClick={() => handleUserClick(user)}>
                            <Image
                                className={cx('user-avatar')}
                                src={user.userAvatar?.[0]?.link}
                                alt={user.userAvatar?.[0]?.alt || 'avatar'}
                            />
                            <div className={cx('user-info')}>
                                {displayField('ID', user._id)}
                                {displayField('Tên', user.userName)}
                                {displayField('Vai trò', user.userRole)}
                                {displayField('Trạng thái', user.userStatus)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedUser && (
                <div className={cx('modal-overlay')} onClick={handleCloseModal}>
                    <div className={cx('modal-content')} onClick={(e) => e.stopPropagation()}>
                        <h3>Thông tin người dùng</h3>
                        {!isEditing ? (
                            <>
                                <Image src={selectedUser.userAvatar?.[0]?.link} className={cx('modal-avatar')} />
                                {displayField('Tên', selectedUser.userName)}
                                {displayField('Tên đăng nhập', selectedUser.userNameAccount)}

                                {displayField('Email', selectedUser.userEmail)}
                                {displayField(
                                    'Số điện thoại',
                                    selectedUser.userPhone ? `0${selectedUser.userPhone}` : 'Không có',
                                )}
                                {displayField('Giới tính', selectedUser?.userGender || 'undefined')}
                                {displayField('Vai trò', selectedUser.userRole)}
                                {displayField('Trạng thái', selectedUser.userStatus)}

                                <div className={cx('modal-actions')}>
                                    <button className={cx('modal-actions-edit-btn')} onClick={handleEditClick}>
                                        Chỉnh sửa
                                    </button>
                                    <button className={cx('modal-actions-deletl-btn')} onClick={handleDelete}>
                                        Xóa
                                    </button>
                                    <button className={cx('modal-actions-close-btn')} onClick={handleCloseModal}>
                                        Đóng
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleSubmit} className={cx('edit-form')}>
                                {error && <p className={cx('form-error')}>{error}</p>}

                                {/* <div className={cx('form-group')}>
                                    <label className={cx('label')}>Tên: </label>
                                    <input
                                        type="text"
                                        name="userName"
                                        value={formData.userName}
                                        onChange={handleInputChange}
                                        className={cx('input')}
                                        required
                                    />
                                </div>

                                <div className={cx('form-group')}>
                                    <label className={cx('label')}>Email: </label>
                                    <input
                                        type="email"
                                        name="userEmail"
                                        value={formData.userEmail}
                                        onChange={handleInputChange}
                                        className={cx('input')}
                                        required
                                    />
                                </div>

                                <div className={cx('form-group')}>
                                    <label className={cx('label')}>Phone: </label>
                                    <input
                                        type="text"
                                        name="userPhone"
                                        value={formData.userPhone}
                                        onChange={handleInputChange}
                                        maxLength={10}
                                        className={cx('input')}
                                    />
                                </div> */}

                                <div className={cx('form-group')}>
                                    <label className={cx('label')}>Trạng thái: </label>
                                    <select
                                        name="userStatus"
                                        value={formData.userStatus}
                                        onChange={handleInputChange}
                                        className={cx('input')}
                                    >
                                        <option value="active">Active</option>
                                        <option value="banned">Banned</option>
                                    </select>
                                </div>

                                <div className={cx('form-group')}>
                                    <label className={cx('label')}>Vai trò: </label>
                                    <select
                                        name="userRole"
                                        value={formData.userRole}
                                        onChange={handleInputChange}
                                        className={cx('input')}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="cus">Cus</option>
                                        <option value="mod">Quản lý kinh doanh</option>
                                        <option value="accountant">Kế toán</option>
                                    </select>
                                </div>

                                <div className={cx('form-actions')}>
                                    <button className={cx('submit-button')} type="submit">
                                        Lưu
                                    </button>
                                    <button className={cx('cancel-button')} type="button" onClick={handleCancelEdit}>
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
