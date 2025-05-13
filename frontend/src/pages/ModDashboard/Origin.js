import { useState, useEffect } from 'react';
import * as originService from '~/services/originService';
import styles from './Origin.module.scss';
import Button from '~/components/Button';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import classNames from 'classnames/bind';
import Swal from 'sweetalert2'; // thư viện hiện alert 

const cx = classNames.bind(styles);

const initialFormData = {
    nameOrigin: '',
    description: '',
    phone: '',
    address: '',
    email: '',
};

function Origin() {

    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const [formData, setFormData] = useState(initialFormData);
    const [origins, setOrigins] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    //LẤY Origin
  
      const fetchOrigins = async () => {
        try {
          const response = await originService.getOrigin(); // API lấy danh sách Origin
          // console.log("response :", response);
          setOrigins(response);
        } catch (error) {
          console.error('Lỗi lấy danh sách nơi xuất xứ', error);
        } finally {
            setIsLoading(false);
        }
        
      };

    useEffect(() => {
      fetchOrigins();
    }, []);

    //xử lý thay đổi input
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    //xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isEditing && editingId) {
                console.log(formData)
                await originService.updateOriginById({ ...formData, originId: editingId });
                toast.success('Cập nhật xuất xứ thành công!');
            } else {
                await originService.addOrigin(formData);
                toast.success('Thêm nơi xuất xứ thành công!');
            }
            setFormData(initialFormData); // Reset form
            setEditingId(null);
            setIsEditing(false);
            setShowForm(false); // Ẩn form
            await fetchOrigins();
        } catch (err) {
            console.error("Error handle Origin:", err);
            toast.error(err.response?.data?.message || 'Thất bại.');
        } finally {
            setIsLoading(false);
        }
      };

    const handleDelete = async (id) => {
       const result = await Swal.fire({
          title: 'Bạn có chắc chắn xóa?',
          text: 'Nơi xuất xứ sẽ bị xóa !',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',   // màu nút OK
          cancelButtonColor: '#d33',        // màu nút Cancel
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
       });
       if (result.isConfirmed) {
          try {
          await originService.deleteOriginById(id);
          Swal.fire(
            'Đã xóa!',
            'Nơi xuất xứ đã được xóa thành công.',
            'success'
          );
          // gọi lại danh sách nếu cần
            setOrigins(origins.filter((item) => item._id !== id));
          } catch (error) {
            Swal.fire(
              'Lỗi!',
              'Xóa nơi sản xuất thất bại.',
              'error'
            );
          }
        }
      };
      
    if (isLoading && origins.length === 0) {
      return <div className={cx('loading')}>Đang tải nơi xuất xứ...</div>;
    }
    return (
      <div className={cx('wrapper')}>
        <ToastContainer
            position="bottom-right"  //  Đặt ở góc dưới bên trái
            autoClose={3000}         // Tự động tắt sau 3 giây (có thể chỉnh)
            hideProgressBar={true}  //  thanh tiến trình
            newestOnTop={false}    //Toast mới sẽ hiện dưới các toast cũ.
            closeOnClick            //Cho phép đóng toast
            draggable               // cho phép kéo
        />
         <div className={cx('header')}>
                <h2>Danh sách nơi xuất xứ</h2>
              <Button 
                  className={cx('add-btn')}
                  onClick={() => {
                  setFormData(initialFormData);
                  setShowForm(!showForm)
                  setIsEditing(false);
                  setEditingId(null);
              }} >
                {showForm ? 'Đóng Form' : '➕ Thêm nơi xuất xứ'}
              </Button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className={cx('form')}>
              <div className={cx('form-group')}>
                <label>Tên nơi xuất xứ:</label>
                <input
                  type="text"
                  name="nameOrigin"
                  value={formData.nameOrigin}
                  onChange={handleChange}
                  placeholder="Nhập nơi xuất xứ"
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
                  placeholder="Nhập mô tả"
                  required
                />
              </div>

              <div className={cx('form-group')}>
                <label htmlFor="phone">Số điện thoại</label>
                <input type="text" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={(e) =>{
                          // Chỉ giữ lại ký tự số
                        const numericValue = e.target.value.replace(/\D/g, '');
                        // Đảm bảo bắt đầu bằng 0 hoặc rỗng (để cho phép người dùng gõ dần)
                        if (numericValue === '' || numericValue.startsWith('0')) {
                            setFormData((prev) => ({ ...prev, phone: numericValue }));
                        }
                    }} 
                    pattern="0\d{9}"
                    maxLength="10"
                    placeholder="SDT bắt đầu bằng số 0 VD : 0348274919"
                    required />
                  </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="address">Địa chỉ cụ thể</label>
                        <input type="text" 
                            id="address"
                            name="address" 
                            value={formData.address}
                            onChange={handleChange} 
                            placeholder="Nhập địa chỉ cụ thể"
                            required />
                    </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="email">Email</label>
                        <input type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            placeholder="Nhập email"
                            required />
                    </div>

              <div className={cx('formActions')}>
                <button type="button" className={cx('submit-btn')} 
                        onClick={() => {
                          setShowForm(false)
                          setFormData(initialFormData); 
                          setIsEditing(false);
                          setEditingId(null);}
                        }>Hủy</button>
                          
                <button type="submit" className={cx('submit-btn')} disabled={isLoading}>
                  {isLoading ? 'Đang lưu...' : isEditing ? 'Cập nhật nơi xuất xứ' : 'Thêm nơi nơi xuất xứ'}
                </button>
              </div>
            </form>
          )}

          {origins.length === 0 && !isLoading && (
                <p style={{ textAlign: 'center', marginTop: '30px' }}>Bạn chưa có nơi xuất xứ.</p>
            )}

          {origins.length >0 && 
            (<table className={cx('origin-table')}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Nơi xuất xứ</th>
                  <th>Mô tả </th>
                  <th>Số điện thoại </th>
                  <th>Địa chỉ </th>
                  <th>Email</th>
                  <th>Hành động</th> 
                </tr>
              </thead>
              <tbody>
              
                  {origins.map((origin,index) => (
                    <tr key={origin._id}>
                    <td>{index +1}</td>
                    <td>{origin.nameOrigin}</td>
                    <td>{origin.description}</td>
                    <td>{origin.phone}</td>
                    <td>{origin.address}</td>
                    <td>{origin.email}</td>
                    <td>
                        <div  className={cx('box-btn')}>
                          <Button 
                            className={cx('delete-btn')}
                            onClick={() => handleDelete(origin._id)} 
                            disabled={isLoading}
                          >Xóa</Button>
                          <Button 
                            className={cx('edit-btn')}
                            onClick={() => {
                            setFormData({
                            nameOrigin: origin.nameOrigin,
                            description: origin.description,
                            phone: origin.phone,
                            address: origin.address,
                            email: origin.email,
                            });
                            setShowForm(true);
                            setIsEditing(true);
                            setEditingId(origin._id);
                          }}>Sửa</Button> 
                        </div>
                        
                    </td>
                  </tr>
                ))}
                
              </tbody>
            </table>)
            }
        </div>
    );
  }
  export default Origin;