import { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS

function Address() {
    const getToken = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return null;
        try {
            const decoded = jwtDecode(token);
            return {
                userId: decoded.userId,
                userRole: decoded.userRole,
                avatar: decoded.userAvatar || null,
            };
        } catch (error) {
            console.error('Token decode error:', error);
            return null;
        }
    };

    const { userId } = getToken() || {};
    const [addresses, setAddresses] = useState([]);
    const [form, setForm] = useState({ province: '', district: '', street: '', houseNumber: '' });
    const [editingIndex, setEditingIndex] = useState(null);
    const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
    const [addingMode, setAddingMode] = useState(false);

    useEffect(() => {
        if (userId) {
            axios
                .get(`http://localhost:5000/api/users/${userId}/addresses`)
                .then((res) => setAddresses(res.data))
                .catch((err) => toast.error('Lỗi khi tải địa chỉ'));
        }
    }, [userId]);

    const validateForm = () => {
        const { province, district, street, houseNumber } = form;
        if (!province || !district || !street || !houseNumber) {
            toast.warning('Vui lòng điền đầy đủ thông tin địa chỉ');
            return false;
        }
        return true;
    };

    const addAddress = async () => {
        if (!userId || !validateForm()) return;
        try {
            const res = await axios.post(`http://localhost:5000/api/users/${userId}/address`, form);
            setAddresses(res.data);
            toast.success('Thêm địa chỉ thành công');
            setForm({ province: '', district: '', street: '', houseNumber: '' });
            setAddingMode(false);
        } catch (error) {
            toast.error('Thêm địa chỉ thất bại');
        }
    };

    const saveEdit = async () => {
        if (editingIndex === null || !userId || !validateForm()) return;
        try {
            const res = await axios.put(`http://localhost:5000/api/users/${userId}/address/${editingIndex}`, form);
            setAddresses(res.data);
            toast.success('Cập nhật địa chỉ thành công');
            setEditingIndex(null);
            setForm({ province: '', district: '', street: '', houseNumber: '' });
        } catch (error) {
            toast.error('Cập nhật thất bại');
        }
    };

    const handleDelete = async () => {
        if (confirmDeleteIndex === null || !userId) return;
        try {
            const res = await axios.delete(`http://localhost:5000/api/users/${userId}/address/${confirmDeleteIndex}`);
            setAddresses(res.data);
            toast.success('Đã xóa địa chỉ');
            setConfirmDeleteIndex(null);
        } catch (error) {
            toast.error('Xóa địa chỉ thất bại');
        }
    };

    const cancelAdd = () => {
        setForm({ province: '', district: '', street: '', houseNumber: '' });
        setAddingMode(false);
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setForm({ province: '', district: '', street: '', houseNumber: '' });
    };

    const cancelDelete = () => {
        setConfirmDeleteIndex(null);
    };

    const startEdit = (index) => {
        setEditingIndex(index);
        setForm(addresses[index]);
    };

    return (
        <div>
            <ToastContainer position="top-center" autoClose={2000} />
            <h2>Quản lý địa chỉ</h2>
            <ul>
                {addresses.map((addr, i) => (
                    <li key={i}>
                        {editingIndex === i ? (
                            <div>
                                <input
                                    placeholder="Tỉnh"
                                    value={form.province}
                                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                                />
                                <input
                                    placeholder="Quận/Huyện"
                                    value={form.district}
                                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                                />
                                <input
                                    placeholder="Đường"
                                    value={form.street}
                                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                                />
                                <input
                                    placeholder="Số nhà"
                                    value={form.houseNumber}
                                    onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
                                />
                                <button onClick={saveEdit}>Lưu</button>
                                <button onClick={cancelEdit}>Hủy</button>
                            </div>
                        ) : (
                            <div>
                                {addr.houseNumber}, {addr.street}, {addr.district}, {addr.province}
                                <button onClick={() => startEdit(i)}>Sửa</button>
                                <button onClick={() => setConfirmDeleteIndex(i)}>Xóa</button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {confirmDeleteIndex !== null && (
                <div style={{ border: '1px solid red', padding: '10px', marginTop: '10px' }}>
                    <p>Bạn có chắc chắn muốn xóa địa chỉ này không?</p>
                    <button onClick={handleDelete}>OK</button>
                    <button onClick={cancelDelete}>Hủy</button>
                </div>
            )}

            {!addingMode ? (
                <button onClick={() => setAddingMode(true)}>Thêm địa chỉ mới</button>
            ) : (
                <div>
                    <h3>Thêm địa chỉ</h3>
                    <input
                        placeholder="Tỉnh"
                        value={form.province}
                        onChange={(e) => setForm({ ...form, province: e.target.value })}
                    />
                    <input
                        placeholder="Quận/Huyện"
                        value={form.district}
                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                    />
                    <input
                        placeholder="Đường"
                        value={form.street}
                        onChange={(e) => setForm({ ...form, street: e.target.value })}
                    />
                    <input
                        placeholder="Số nhà"
                        value={form.houseNumber}
                        onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
                    />
                    <button onClick={addAddress}>Thêm</button>
                    <button onClick={cancelAdd}>Hủy</button>
                </div>
            )}
        </div>
    );
}

export default Address;
