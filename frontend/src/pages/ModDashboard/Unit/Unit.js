import { useState, useEffect } from 'react';
import * as unitService from '~/services/unitService';
import styles from './Unit.module.scss';
import Button from '~/components/Button';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import classNames from 'classnames/bind';
import Swal from 'sweetalert2';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const cx = classNames.bind(styles);

const initialFormData = {
    nameManufacturer: '',
    description: '',
};

function Unit() {
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState(initialFormData);
    const [units, setUnits] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);

    const fetchUnits = async () => {
        try {
            const response = await unitService.getUnit();
            setUnits(response);
        } catch (error) {
            console.error('Lỗi lấy danh sách hãng sản xuất', error);
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isEditing && editingId) {
                await unitService.updateUnitById({ ...formData, unitId: editingId });
                toast.success('Cập nhật đơn vị thành công!');
            } else {
                await unitService.addUnit(formData);
                toast.success('Thêm nơi đơn vị thành công!');
            }
            setFormData(initialFormData);
            setEditingId(null);
            setIsEditing(false);
            setShowModal(false);
            await fetchUnits();
        } catch (err) {
            console.error('Lỗi xử lý đơn vị:', err);
            toast.error(err.response?.data?.message || 'Thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn xóa?',
            text: 'Đơn vị sẽ bị xóa!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await unitService.deleteUnitById(id);
                Swal.fire('Đã xóa!', 'Đơn vị đã được xóa thành công.', 'success');
                setUnits((prev) => prev.filter((item) => item._id !== id));
            } catch (error) {
                Swal.fire('Lỗi!', 'Xóa đơn vị thất bại.', 'error');
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData(initialFormData);
        setIsEditing(false);
        setEditingId(null);
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar closeOnClick draggable />
            <div className={cx('header')}>
                <h2>Danh sách hãng sản xuất</h2>
                <Button
                    className={cx('add-btn')}
                    onClick={() => {
                        setFormData(initialFormData);
                        setIsEditing(false);
                        setEditingId(null);
                        setShowModal(true);
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} /> Thêm đơn vị
                </Button>
            </div>

            {units.length === 0 && !isLoading && (
                <p style={{ textAlign: 'center', marginTop: '30px' }}>Bạn chưa có đơn ivj.</p>
            )}

            {units.length > 0 && (
                <table className={cx('unit-table')}>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên hãng sản xuất</th>
                            <th>Mô tả</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {units.map((unit, index) => (
                            <tr key={unit._id}>
                                <td>{index + 1}</td>
                                <td>{unit.nameUnit}</td>
                                <td>{unit.description}</td>
                                <td>
                                    <div className={cx('box-btn')}>
                                        <Button
                                            className={cx('delete-btn')}
                                            onClick={() => handleDelete(unit._id)}
                                            disabled={isLoading}
                                        >
                                            Xóa
                                        </Button>
                                        <Button
                                            className={cx('edit-btn')}
                                            onClick={() => {
                                                setFormData({
                                                    nameUnit: unit.nameUnit,
                                                    description: unit.description,
                                                });
                                                setIsEditing(true);
                                                setEditingId(unit._id);
                                                setShowModal(true);
                                            }}
                                        >
                                            Sửa
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal Form */}
            {showModal && (
                <div className={cx('modal-overlay')} onClick={handleCloseModal}>
                    <div className={cx('modal-content')} onClick={(e) => e.stopPropagation()}>
                        <h3 className={cx('modal-content-title')}>{isEditing ? 'Cập nhật đơn vị' : 'Thêm đơn vị'}</h3>
                        <form onSubmit={handleSubmit} className={cx('form')}>
                            <div className={cx('form-group')}>
                                <label>Tên đơn vị:</label>
                                <input
                                    type="text"
                                    name="nameUnit"
                                    value={formData.nameUnit}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Mô tả:</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={cx('modal-actions')}>
                                <button type="submit" className={cx('submit-btn')} disabled={isLoading}>
                                    {isLoading ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                                <button type="button" className={cx('cancel-btn')} onClick={handleCloseModal}>
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Unit;
