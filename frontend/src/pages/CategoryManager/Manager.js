import React, { useEffect, useState, useRef } from 'react';
import styles from './Manager.module.scss';
import * as categoryService from '~/services/categoryService';
import Swal from 'sweetalert2';

function Manager() {
    const [categories, setCategories] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editingImage, setEditingImage] = useState({});
    const [newCategory, setNewCategory] = useState({
        nameCategory: '',
        description: '',
        imageFile: null,
    });
    const [refresh, setRefresh] = useState(false);

    const imageInputRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await categoryService.getAllCategories();
            if (Array.isArray(res)) {
                setCategories(res);
            } else if (res.categories && Array.isArray(res.categories)) {
                setCategories(res.categories);
            } else if (res.data && Array.isArray(res.data)) {
                setCategories(res.data);
            } else {
                setCategories([]);
            }
        };
        fetchData();
    }, [refresh]);

    const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: 'Bạn có chắc muốn xoá?',
        text: 'Hành động này không thể hoàn tác!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xoá',
        cancelButtonText: 'Huỷ',
    });

    if (result.isConfirmed) {
        try {
            await categoryService.deleteCategory(id);
            setCategories(categories.filter((cat) => cat._id !== id));
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Xoá danh mục thành công!',
                showConfirmButton: false,
                timer: 3000,
            });
        } catch (err) {
            Swal.fire('Lỗi!', 'Xoá danh mục thất bại.', 'error');
        }
    }
};


    const handleEdit = (id) => {
        setEditingId(id);
        setEditingImage({});
    };

    const handleSave = async (id) => {
    const cat = categories.find((c) => c._id === id);
    const { nameCategory, description } = cat;

    if (!nameCategory.trim() || !description.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Lỗi!',
            text: 'Tên danh mục và mô tả không được để trống.',
        });
        return;
    }

    let data;
    if (editingImage[id]) {
        data = new FormData();
        data.append('nameCategory', nameCategory);
        data.append('description', description);
        data.append('image', editingImage[id]);
    } else {
        data = { nameCategory, description };
    }

    try {
    const updated = await categoryService.updateCategory(id, data);
    const updatedList = categories.map((c) => (c._id === id ? updated : c));
    setCategories(updatedList);
    setEditingId(null);
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Sửa danh mục sản phẩm thành công!',
        showConfirmButton: false,
        timer: 3000,
    });
} catch (err) {
    Swal.fire('Lỗi!', 'Cập nhật danh mục thất bại.', 'error');
}

};


    const handleInputChange = (e, id, field) => {
        const updated = categories.map((c) =>
            c._id === id
                ? {
                      ...c,
                      [field]: e.target.value,
                  }
                : c,
        );
        setCategories(updated);
    };

    const handleImageChange = (e) => {
        setNewCategory((prev) => ({
            ...prev,
            imageFile: e.target.files[0],
        }));
    };

    const handleEditImageChange = (e, id) => {
        setEditingImage((prev) => ({
            ...prev,
            [id]: e.target.files[0],
        }));
    };

    const handleNewInputChange = (e, field) => {
        setNewCategory((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const handleAddCategory = async () => {
        const formData = new FormData();
        formData.append('nameCategory', newCategory.nameCategory);
        formData.append('description', newCategory.description);
        formData.append('image', newCategory.imageFile);

        try {
            await categoryService.addCategory(formData);
            setNewCategory({ nameCategory: '', description: '', imageFile: null });
            if (imageInputRef.current) imageInputRef.current.value = '';
            setRefresh((prev) => !prev);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Danh mục đã được thêm!',
                showConfirmButton: false,
                timer: 3000,
            });
        } catch (err) {
            console.error('Lỗi thêm danh mục:', err);
            Swal.fire('Lỗi!', 'Thêm danh mục thất bại.', 'error');
        }
    };

    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Hình ảnh</th>
                        <th>Danh mục</th>
                        <th>Mô tả</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((cat) => (
                        <tr key={cat._id}>
                            <td>
                                {editingId === cat._id ? (
                                    <>
                                        <img
                                            src={
                                                editingImage[cat._id]
                                                    ? URL.createObjectURL(editingImage[cat._id])
                                                    : cat.CategoryImg?.link
                                            }
                                            alt={cat.CategoryImg?.alt}
                                            className={styles.image}
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleEditImageChange(e, cat._id)}
                                        />
                                    </>
                                ) : (
                                    <img
                                        src={cat.CategoryImg?.link}
                                        alt={cat.CategoryImg?.alt}
                                        className={styles.image}
                                    />
                                )}
                            </td>
                            <td>
                                {editingId === cat._id ? (
                                    <input
                                        value={cat.nameCategory}
                                        onChange={(e) => handleInputChange(e, cat._id, 'nameCategory')}
                                    />
                                ) : (
                                    cat.nameCategory
                                )}
                            </td>
                            <td>
                                {editingId === cat._id ? (
                                    <input
                                        value={cat.description}
                                        onChange={(e) => handleInputChange(e, cat._id, 'description')}
                                    />
                                ) : (
                                    cat.description
                                )}
                            </td>
                            <td>
    {editingId === cat._id ? (
        <>
            <button onClick={() => handleSave(cat._id)}>Lưu</button>
            <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>
                Huỷ
            </button>
        </>
    ) : (
        <>
            <button onClick={() => handleEdit(cat._id)}>Sửa</button>
            <button className={styles.deleteBtn} onClick={() => handleDelete(cat._id)}>
                Xoá
            </button>
        </>
    )}
</td>

                        </tr>
                    ))}
                    <tr>
                        <td>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                ref={imageInputRef}
                            />
                        </td>
                        <td>
                            <input
                                placeholder="Tên danh mục"
                                value={newCategory.nameCategory}
                                onChange={(e) => handleNewInputChange(e, 'nameCategory')}
                            />
                        </td>
                        <td>
                            <input
                                placeholder="Mô tả"
                                value={newCategory.description}
                                onChange={(e) => handleNewInputChange(e, 'description')}
                            />
                        </td>
                        <td>
                            <button onClick={handleAddCategory}>Thêm</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default Manager;
