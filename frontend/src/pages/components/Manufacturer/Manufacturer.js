// import { useState, useEffect } from 'react';
// import * as manufacturerService from '~/services/manufacturerService';
// import styles from './Manufacturer.module.scss';
// import Button from '~/components/Button';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import classNames from 'classnames/bind';
// import Swal from 'sweetalert2'; // thư viện hiện alert
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPlus } from '@fortawesome/free-solid-svg-icons';
// import { Link, useNavigate } from 'react-router-dom';
// const cx = classNames.bind(styles);

// const initialFormData = {
//     nameManufacturer: '',
//     description: '',
// };

// function Manufacturer() {
//     const [showForm, setShowForm] = useState(false);
//     const [isLoading, setIsLoading] = useState(true);

//     const [formData, setFormData] = useState(initialFormData);
//     const [manufacturers, setManufacturers] = useState([]);
//     const [isEditing, setIsEditing] = useState(false);
//     const [editingId, setEditingId] = useState(null);

//     //LẤY Manufacturer

//     const fetchManufacturers = async () => {
//         try {
//             const response = await manufacturerService.getManufacturer(); // API lấy danh sách Manufacturer
//             // console.log("response :", response);
//             setManufacturers(response);
//         } catch (error) {
//             console.error('Lỗi lấy danh sách hãng sản xuất', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchManufacturers();
//     }, []);

//     //xử lý thay đổi input
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     //xử lý submit form
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         try {
//             if (isEditing && editingId) {
//                 console.log(formData);
//                 await manufacturerService.updateManufacturerById({ ...formData, manufacturerId: editingId });
//                 toast.success('Cập nhật xuất xứ thành công!');
//             } else {
//                 await manufacturerService.addManufacturer(formData);
//                 toast.success('Thêm nơi xuất xứ thành công!');
//             }
//             setFormData(initialFormData); // Reset form
//             setEditingId(null);
//             setIsEditing(false);
//             setShowForm(false); // Ẩn form
//             await fetchManufacturers();
//         } catch (err) {
//             console.error('Error handle Manufacturer:', err);
//             toast.error(err.response?.data?.message || 'Thất bại.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleDelete = async (id) => {
//         const result = await Swal.fire({
//             title: 'Bạn có chắc chắn xóa?',
//             text: 'Hãng sản xuất sẽ bị xóa !',
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6', // màu nút OK
//             cancelButtonColor: '#d33', // màu nút Cancel
//             confirmButtonText: 'Xóa',
//             cancelButtonText: 'Hủy',
//         });
//         if (result.isConfirmed) {
//             try {
//                 await manufacturerService.deleteManufacturerById(id);
//                 Swal.fire('Đã xóa!', 'Hãng sản xuất đã được xóa thành công.', 'success');
//                 // gọi lại danh sách nếu cần
//                 setManufacturers(manufacturers.filter((item) => item._id !== id));
//             } catch (error) {
//                 Swal.fire('Lỗi!', 'Xóa hãng sản xuất thất bại.', 'error');
//             }
//         }
//     };

//     if (isLoading && manufacturers.length === 0) {
//         return <div className={cx('loading')}>Đang tải hãng sản xuất...</div>;
//     }
//     return (
//         <div className={cx('wrapper')}>
//             <ToastContainer
//                 position="bottom-right" //  Đặt ở góc dưới bên trái
//                 autoClose={3000} // Tự động tắt sau 3 giây (có thể chỉnh)
//                 hideProgressBar={true} //  thanh tiến trình
//                 newestOnTop={false} //Toast mới sẽ hiện dưới các toast cũ.
//                 closeOnClick //Cho phép đóng toast
//                 draggable // cho phép kéo
//             />
//             <div className={cx('header')}>
//                 <h2>Danh sách hãng sản xuất</h2>
//                 <Button
//                     className={cx('add-btn')}
//                     onClick={() => {
//                         setFormData(initialFormData);
//                         setShowForm(!showForm);
//                         setIsEditing(false);
//                         setEditingId(null);
//                     }}
//                 >
//                     {showForm ? 'Đóng Form' : '➕ Thêm hãng sản xuất'}
//                 </Button>
//             </div>

//             {showForm && (
//                 <form onSubmit={handleSubmit} className={cx('form')}>
//                     <div className={cx('form-group')}>
//                         <label>Tên hãng sản xuất:</label>
//                         <input
//                             type="text"
//                             name="nameManufacturer"
//                             value={formData.nameManufacturer}
//                             onChange={handleChange}
//                             placeholder="Nhập tên hãng sản xuất"
//                             required
//                         />
//                     </div>

//                     <div className={cx('form-group')}>
//                         <label>Mô tả:</label>
//                         <input
//                             type="text"
//                             name="description"
//                             value={formData.description}
//                             onChange={handleChange}
//                             placeholder="Nhập mô tả"
//                             required
//                         />
//                     </div>

//                     <div className={cx('formActions')}>
//                         <button
//                             type="button"
//                             className={cx('submit-btn')}
//                             onClick={() => {
//                                 setShowForm(false);
//                                 setFormData(initialFormData);
//                                 setIsEditing(false);
//                                 setEditingId(null);
//                             }}
//                         >
//                             Hủy
//                         </button>

//                         <button type="submit" className={cx('submit-btn')} disabled={isLoading}>
//                             {isLoading ? 'Đang lưu...' : isEditing ? 'Cập nhật hãng sản xuất' : 'Thêm hãng sản xuất'}
//                         </button>
//                     </div>
//                 </form>
//             )}

//             {manufacturers.length === 0 && !isLoading && (
//                 <p style={{ textAlign: 'center', marginTop: '30px' }}>Bạn chưa có hãng sản xuất.</p>
//             )}

//             {manufacturers.length > 0 && (
//                 <table className={cx('manufacturer-table')}>
//                     <thead>
//                         <tr>
//                             <th>STT</th>
//                             <th>Tên hãng sản xuất</th>
//                             <th>Mô tả </th>
//                             <th>Hành động</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {manufacturers.map((manufacturer, index) => (
//                             <tr key={manufacturer._id}>
//                                 <td>{index + 1}</td>
//                                 <td>{manufacturer.nameManufacturer}</td>
//                                 <td>{manufacturer.description}</td>
//                                 <td>
//                                     <div className={cx('box-btn')}>
//                                         <Button
//                                             className={cx('delete-btn')}
//                                             onClick={() => handleDelete(manufacturer._id)}
//                                             disabled={isLoading}
//                                         >
//                                             Xóa
//                                         </Button>
//                                         <Button
//                                             className={cx('edit-btn')}
//                                             onClick={() => {
//                                                 setFormData({
//                                                     nameManufacturer: manufacturer.nameManufacturer,
//                                                     description: manufacturer.description,
//                                                 });
//                                                 setShowForm(true);
//                                                 setIsEditing(true);
//                                                 setEditingId(manufacturer._id);
//                                             }}
//                                         >
//                                             Sửa
//                                         </Button>
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );
// }
// export default Manufacturer;
import { useState, useEffect } from 'react';
import * as manufacturerService from '~/services/manufacturerService';
import styles from './Manufacturer.module.scss';
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

function Manufacturer() {
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState(initialFormData);
    const [manufacturers, setManufacturers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchManufacturers = async () => {
        try {
            const response = await manufacturerService.getManufacturer();
            setManufacturers(response);
        } catch (error) {
            console.error('Lỗi lấy danh sách hãng sản xuất', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchManufacturers();
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
                await manufacturerService.updateManufacturerById({ ...formData, manufacturerId: editingId });
                toast.success('Cập nhật xuất xứ thành công!');
            } else {
                await manufacturerService.addManufacturer(formData);
                toast.success('Thêm nơi xuất xứ thành công!');
            }
            setFormData(initialFormData);
            setEditingId(null);
            setIsEditing(false);
            setShowModal(false);
            await fetchManufacturers();
        } catch (err) {
            console.error('Lỗi xử lý hãng sản xuất:', err);
            toast.error(err.response?.data?.message || 'Thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn xóa?',
            text: 'Hãng sản xuất sẽ bị xóa!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await manufacturerService.deleteManufacturerById(id);
                Swal.fire('Đã xóa!', 'Hãng sản xuất đã được xóa thành công.', 'success');
                setManufacturers((prev) => prev.filter((item) => item._id !== id));
            } catch (error) {
                Swal.fire('Lỗi!', 'Xóa hãng sản xuất thất bại.', 'error');
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
                    <FontAwesomeIcon icon={faPlus} /> Thêm hãng sản xuất
                </Button>
            </div>

            {manufacturers.length === 0 && !isLoading && (
                <p style={{ textAlign: 'center', marginTop: '30px' }}>Bạn chưa có hãng sản xuất.</p>
            )}

            {manufacturers.length > 0 && (
                <table className={cx('manufacturer-table')}>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên hãng sản xuất</th>
                            <th>Mô tả</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {manufacturers.map((manufacturer, index) => (
                            <tr key={manufacturer._id}>
                                <td>{index + 1}</td>
                                <td>{manufacturer.nameManufacturer}</td>
                                <td>{manufacturer.description}</td>
                                <td>
                                    <div className={cx('box-btn')}>
                                        <Button
                                            className={cx('delete-btn')}
                                            onClick={() => handleDelete(manufacturer._id)}
                                            disabled={isLoading}
                                        >
                                            Xóa
                                        </Button>
                                        <Button
                                            className={cx('edit-btn')}
                                            onClick={() => {
                                                setFormData({
                                                    nameManufacturer: manufacturer.nameManufacturer,
                                                    description: manufacturer.description,
                                                });
                                                setIsEditing(true);
                                                setEditingId(manufacturer._id);
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
                        <h3 className={cx('modal-content-title')}>
                            {isEditing ? 'Cập nhật hãng sản xuất' : 'Thêm hãng sản xuất'}
                        </h3>
                        <form onSubmit={handleSubmit} className={cx('form')}>
                            <div className={cx('form-group')}>
                                <label>Tên hãng sản xuất:</label>
                                <input
                                    type="text"
                                    name="nameManufacturer"
                                    value={formData.nameManufacturer}
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

export default Manufacturer;
