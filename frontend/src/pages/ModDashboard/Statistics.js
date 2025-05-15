import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as statisticsService from '~/services/statisticsService';
import { FaDownload, FaChartLine, FaBox, FaUsers, FaShoppingCart, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import classNames from 'classnames/bind';
import styles from './Statistics.module.scss';

//npm add react-chartjs-2 chart.js chartjs-plugin-datalabels

const cx = classNames.bind(styles);

//   đăng ký các thành phần  and plugins ChartJS
ChartJS.register(
  CategoryScale,  //Thang đo dùng cho trục X 
  LinearScale,    //Thang đo dùng cho trục Y
  PointElement,  //Thành phần vẽ các điểm trên biểu đồ (dùng cho Line chart)
  LineElement,   //Thành phần vẽ đường nối giữa các điểm (Line chart)
  ArcElement,    //Dùng để vẽ các phần hình tròn trong Pie 
  Title,        //Plugin hiển thị tiêu đề của biểu đồ
  Tooltip,      //Hiển thị tooltip khi hover chuột lên điểm dữ liệu
  Legend,       //Hiển thị chú thích màu của các datasets
  ChartDataLabels //Plugin hiển thị dữ liệu trực tiếp lên biểu đồ (phần trăm)
);

function Statistics() {
    // doanh thu
    const [revenueData, setRevenueData] = useState(null);
    const [revenuePeriod, setRevenuePeriod] = useState('monthly'); // ngày, tuần , tháng , năm
    //sản phẩm
    const [productStats, setProductStats] = useState(null);
    const [productParams, setProductParams] = useState({ 
        groupBy: 'product', 
        sortBy: 'soldQuantity', 
        sortOrder: 'desc',
        categoryId: ''
    });
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch lấy thống kê doanh thu
    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                // setLoading(true);
                const response = await statisticsService.getRevenueStatistics(revenuePeriod);
                setRevenueData(response);
                setError('');
            } catch (err) {
                console.error("Lỗi lấy dữ liệu doanh thu:", err);
                setError("Không thể tải dữ liệu doanh thu.");
                setRevenueData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchRevenue();
    }, [revenuePeriod]);

    // Fetch lấy danh mục sp
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await statisticsService.getCategoryList();
                if (response?.data) {
                    setCategories(response.data);
                }
            } catch (err) {
                console.error("Lỗi lấy danh sách danh mục:", err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch lấy thống kê sản phẩm
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // setLoading(true);
                const paramsToSend = { ...productParams };
                if (paramsToSend.groupBy !== 'product' || !paramsToSend.categoryId) {
                    //Nếu không nhóm theo sản phẩm hoặc không chọn categoryId, xóa nó
                    delete paramsToSend.categoryId;
                }

                const response = await statisticsService.getProductStatistics(paramsToSend);
                setProductStats(response.data); // []
                setError('');
            } catch (err) {
                console.error("Lỗi lấy thống kê sản phẩm:", err);
                setError("Không thể tải thống kê sản phẩm.");
                setProductStats(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [productParams]);

    //function format tiền 
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Format chart data
    const revenueChartData = {
        labels: revenueData?.data?.map(d => d.label) || [],
        datasets: [
            {
                label: `Doanh thu theo ${revenuePeriod === 'daily' ? 'ngày' : revenuePeriod === 'weekly' ? 'tuần' : revenuePeriod === 'monthly' ? 'tháng' : 'năm'}`,
                data: revenueData?.data?.map(d => d.value) || [],
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                tension: 0.4, // Bo cong đường
            },
            {
                label: 'Số đơn hàng',
                data: revenueData?.data?.map(d => d.orderCount) || [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.4,
                yAxisID: 'orderCount',
            }
        ],
    };


    if (loading) return (
        <div className={cx('loadingContainer')}>
            <div className={cx('loadingSpinner')}></div>
            <p>Đang tải dữ liệu ...</p>
        </div>
    );

    return (
        <div className={cx('container')}>
            <h1 className={cx('mainTitle')}>
                <FaChartLine className={cx('titleIcon')} /> Dashboard Quản Trị
            </h1>
            {error && <div className={cx('errorMessage')}>{error}</div>}

            <div className={cx('gridContainer')}>
                {/* Revenue Statistics */}
                <div className={cx('card')}>
                    <div className={cx('cardHeader')}>
                        <h2 className={cx('cardTitle')}>Thống kê Doanh thu</h2>
                        <select 
                            value={revenuePeriod} 
                            onChange={(e) => setRevenuePeriod(e.target.value)}
                            className={cx('select')}
                        >
                            <option value="daily">Theo ngày</option>
                            <option value="weekly">Theo tuần</option>
                            <option value="monthly">Theo tháng</option>
                            <option value="yearly">Theo năm</option>
                        </select>
                    </div>
                    <div className={cx('chartContainer')}>
                        {revenueData?.data ? (
                            <Line 
                                data={revenueChartData}
                                options={{
                                    responsive: true, //tự co giãn theo kích thước container.
                                    interaction: {  //hover
                                        mode: 'index',      //Hiển thị tất cả các điểm có cùng chỉ số (trục x)
                                        intersect: false,  // ko cần chính xác trỏ vào điểm
                                    },
                                     plugins: {
                                        datalabels: {
                                            display: false, // đã tắt số trên điểm
                                        },
                                    },
                                    scales: {
                                        y: {
                                            type: 'linear',  // thang đo theo cách chia đều
                                            display: true,
                                            position: 'left',
                                            title: {
                                                display: true,
                                                text: 'Doanh thu (VNĐ)'
                                            }
                                        },
                                        orderCount: {
                                            type: 'linear',
                                            display: true,
                                            position: 'right',
                                            title: {
                                                display: true,
                                                text: 'Số đơn hàng'
                                            },
                                            grid: {
                                                drawOnChartArea: false,
                                            },
                                        },
                                    }
                                }}
                            />
                        ) : (
                            <p className={cx('noData')}>Không có dữ liệu doanh thu</p>
                        )}
                    </div>
                </div>
                {/* Product Statistics */}
                <div className={cx('card')}>
                    <div className={cx('cardHeader')}>
                        <h2 className={cx('cardTitle')}>
                            <FaBox className={cx('titleIcon')} /> Thống kê Sản phẩm
                        </h2>
                        {/* <button onClick={handleExportProducts} className={cx('exportButton')}>
                            <FaDownload className={cx('buttonIcon')} /> Xuất Excel
                        </button> */}
                    </div>
                    <div className={cx('filtersContainer')}>
                        <div className={cx('filterGroup')}>
                            <label htmlFor="groupBy" className={cx('filterLabel')}>Nhóm theo:</label>
                            <select 
                                id="groupBy" 
                                value={productParams.groupBy} 
                                onChange={(e) => setProductParams({...productParams, groupBy: e.target.value, categoryId: ''})} // Đặt lại categoryId khi groupBy thay đổi
                                className={cx('select')}
                            >
                                <option value="product">Sản phẩm</option>
                                <option value="category">Danh mục</option>
                                <option value="manufacturer">Nhà sản xuất</option>
                            </select>
                        </div>
                        {productParams.groupBy === 'product' && (
                            <div className={cx('filterGroup')}>
                                <label htmlFor="categoryFilter" className={cx('filterLabel')}>Danh mục:</label>
                                <select 
                                    id="categoryFilter" 
                                    value={productParams.categoryId} 
                                    onChange={(e) => setProductParams({...productParams, categoryId: e.target.value})}
                                    className={cx('select')}
                                    disabled={categories.length === 0}
                                >
                                    <option value="">Tất cả danh mục</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.nameCategory}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className={cx('filterGroup')}>
                            <label htmlFor="sortBy" className={cx('filterLabel')}>Sắp xếp theo:</label>
                            <select 
                                id="sortBy" 
                                value={productParams.sortBy} 
                                onChange={(e) => setProductParams({...productParams, sortBy: e.target.value})}
                                className={cx('select')}
                            >
                                <option value="name">Tên</option>
                                <option value="soldQuantity">Bán chạy nhất</option>
                                <option value="totalRevenue">Doanh thu cao nhất</option>
                                <option value="quantityInStock">Tồn kho</option>
                            </select>
                        </div>
                        <div className={cx('filterGroup')}>
                            <label htmlFor="sortOrder" className={cx('filterLabel')}>Thứ tự:</label>
                            <select 
                                id="sortOrder" 
                                value={productParams.sortOrder} 
                                onChange={(e) => setProductParams({...productParams, sortOrder: e.target.value})}
                                className={cx('select')}
                            >
                                <option value="desc">Giảm dần</option>
                                <option value="asc">Tăng dần</option>
                            </select>
                        </div>
                    </div>
                    <div className={cx('tableContainer')}>
                        {productStats && productStats.length > 0 ? (
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th>Tên {productParams.groupBy === 'product' ? 'sản phẩm' : productParams.groupBy === 'category' ? 'danh mục' : 'nhà sản xuất'}</th>
                                        {productParams.groupBy !== 'product' && <th>Số lượng SP</th>}
                                        <th>Tồn kho</th>
                                        <th>Đã bán</th>
                                        <th>Doanh thu</th>
                                        {productParams.groupBy === 'product' && <th>Danh mục</th>}
                                        {productParams.groupBy === 'product' && <th>Nhà sản xuất</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {productStats.map((item, index) => (
                                        <tr key={item.id || index}>
                                            <td>{item.name}</td>
                                            {productParams.groupBy !== 'product' && <td>{item.productCount}</td>}
                                            <td>{item.quantityInStock}</td>
                                            <td>{item.soldQuantity}</td>
                                            <td>{formatCurrency(item.totalRevenue)}</td>
                                            {productParams.groupBy === 'product' && <td>{item.category || 'N/A'}</td>}
                                            {productParams.groupBy === 'product' && <td>{item.manufacturer || 'N/A'}</td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className={cx('noData')}>Không có dữ liệu sản phẩm</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Statistics;
