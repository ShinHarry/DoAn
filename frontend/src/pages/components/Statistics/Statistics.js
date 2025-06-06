import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as statisticsService from '~/services/statisticsService';
import { FaDownload, FaChartLine, FaBox, FaUsers, FaShoppingCart } from 'react-icons/fa';
import classNames from 'classnames/bind';
import styles from './Statistics.module.scss';
//date
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
//npm install @emotion/react @emotion/styled
//npm add react-chartjs-2 chart.js chartjs-plugin-datalabels

const cx = classNames.bind(styles);

//   đăng ký các thành phần  and plugins ChartJS
ChartJS.register(
    CategoryScale, //Thang đo dùng cho trục X
    LinearScale, //Thang đo dùng cho trục Y
    PointElement, //Thành phần vẽ các điểm trên biểu đồ (dùng cho Line chart)
    LineElement, //Thành phần vẽ đường nối giữa các điểm (Line chart)
    ArcElement, //Dùng để vẽ các phần hình tròn trong Pie
    Title, //Plugin hiển thị tiêu đề của biểu đồ
    Tooltip, //Hiển thị tooltip khi hover chuột lên điểm dữ liệu
    Legend, //Hiển thị chú thích màu của các datasets
    ChartDataLabels, //Plugin hiển thị dữ liệu trực tiếp lên biểu đồ (phần trăm)
);

function Statistics() {
    // doanh thu
    const [revenueData, setRevenueData] = useState(null);
    const [revenuePeriod, setRevenuePeriod] = useState({
        period: 'monthly',
        by : 'expected',
    }); // ngày, tuần , tháng , năm
    const [statisticRange, setStatisticRange] = useState({
        fromDate: null,
        toDate: null,
        by: 'expected',
    }); // range time
    const [mergedParams, setMergedParams] = useState({
        fromDate: null,
        toDate: null,
        period: 'monthly',
        by: 'expected'
    }); // export revennue

    //sản phẩm
    const [productStats, setProductStats] = useState([]);
    const [productParams, setProductParams] = useState({
        groupBy: 'product',
        sortBy: 'soldQuantity',
        sortOrder: 'desc',
        categoryId: '',
    });
    const [categories, setCategories] = useState([]);
    const [searchProduct, setSearchProduct] = useState('');
    const [filteredProduct, setFilteredProduct] = useState([]);
    // kh
    const [customerStats, setCustomerStats] = useState([]);
    const [customerParams, setCustomerParams] = useState({ sortBy: 'totalSpent', sortOrder: 'desc' });
    const [searchCus, setSearchCus] = useState('');
    const [filteredCus, setFilteredCus] = useState([]);
    //order
    const [orderStatusStats, setOrderStatusStats] = useState(null);
    const [orderStatus, setOrderStatus] = useState('completed');
    const [orderValue, setOrderValue] = useState(null)
    //orther
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch lấy thống kê doanh thu
    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                // setLoading(true);
                const response = await statisticsService.getRevenueStatistics(revenuePeriod);
                // console.log(response)
                setRevenueData(response);
                setError('');
            } catch (err) {
                console.error('Lỗi lấy dữ liệu doanh thu:', err);
                setError('Không thể tải dữ liệu doanh thu.');
                setRevenueData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchRevenue();
    }, [revenuePeriod]);

    //thống kê doanh thu theo range
    const handleRangeStatisticsRevenue = async () => {
        if (!statisticRange.fromDate || !statisticRange.toDate || statisticRange.toDate < statisticRange.fromDate ) {
            alert("Vui lòng chọn đầy đủ ngày và ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!");
            return;
        }
        
        try {
            const response = await statisticsService.getRevenueByDateRange(statisticRange);
            setRevenueData(response);
            console.log("Kết quả thống kê riêng:", response);
            // setState(response.data); nếu muốn hiển thị
        } catch (err) {
            console.error("Lỗi khi thống kê riêng:", err);
            alert("Không thể lấy thống kê theo thời gian đã chọn.");
        }
    };

    //Cập nhật lại giá trị để export revenue
    useEffect(() => {
        setMergedParams({
            fromDate: statisticRange.fromDate,
            toDate: statisticRange.toDate,
            period: revenuePeriod.period,
            by: statisticRange.by,
        });
    }, [statisticRange, revenuePeriod]);

    // Fetch lấy danh mục sp
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await statisticsService.getCategoryList();
                if (response?.data) {
                    setCategories(response.data);
                }
            } catch (err) {
                console.error('Lỗi lấy danh sách danh mục:', err);
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
                console.log(response.data)
                setProductStats(response.data); // []
                setError('');
            } catch (err) {
                console.error('Lỗi lấy thống kê sản phẩm:', err);
                setError('Không thể tải thống kê sản phẩm.');
                setProductStats(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [productParams]);

    //UseEffect theo tìm tên sản phẩm
    useEffect(() => {
            let filteredProduct = [...productStats];
            if (searchProduct.trim() !== '') {
                let lowerSearch = searchProduct.toLowerCase();
                filteredProduct = filteredProduct.filter(
                    (product) =>
                        product.name?.toLowerCase().includes(lowerSearch),
                );
            }
            setFilteredProduct(filteredProduct);
    }, [productStats, searchProduct]);

    // Fetch lấy thôngs kê khách hàng
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await statisticsService.getCustomerStatistics(customerParams);
                console.log(response.data)
                setCustomerStats(response.data);
                setError('');
            } catch (err) {
                console.error('Lỗi lấy thống kê khách hàng:', err);
                setError('Không thể tải thống kê khách hàng.');
                setCustomerStats(null);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, [customerParams]);

    //UseEffect theo tìm tên khách hàng
       useEffect(() => {
            let filteredCus = [...customerStats];
            if (searchCus.trim() !== '') {
                let lowerSearch = searchCus.toLowerCase();
                filteredCus = filteredCus.filter(
                    (cus) =>
                        cus.userName?.toLowerCase().includes(lowerSearch) ||  cus.userEmail?.toLowerCase().includes(lowerSearch),
                );
            }
            setFilteredCus(filteredCus);
        }, [customerStats, searchCus]);

    // Fetch lấy thống kê Order Status
    useEffect(() => {
        const fetchOrderStatus = async () => {
            try {
                const response = await statisticsService.getOrderStatusStatistics();
                setOrderStatusStats(response.data);
                setError('');
            } catch (err) {
                console.error('Lỗi lấy thống kê trạng thái đơn hàng:', err);
                setError('Không thể tải thống kê trạng thái đơn hàng.');
                setOrderStatusStats(null);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderStatus();
    }, []);

    // Fetch lấy tiền + đơn theo orderStatus
    useEffect(() => {
        const fetchValueOrder = async () => {
            try {
                const response = await statisticsService.getValueOrderStatus(orderStatus);
                setOrderValue(response);
                setError('');
            } catch (err) {
                console.error('Lỗi lấy thống kê orderStatus:', err);
                setError('Không thể tải thống kê OrderStatus.');
                setOrderValue(null);
            } finally {
                setLoading(false);
            }
        };
        fetchValueOrder();
    }, [orderStatus]);

    //function xuất excel
    const handleExport = async ({ type, params }) => {
        try {
            let response;
            let filename;

            if (type === 'product') {
                response = await statisticsService.exportProductsToExcel(params);
                filename = 'product_statistics.xlsx';
            } else if (type === 'customer') {
                response = await statisticsService.exportCustomersToExcel(params);
                filename = 'customer_statistics.xlsx';
            }else if (type === 'revenue') {
                response = await statisticsService.exportRevenueToExcel(params);
                filename = 'revenue_statistics.xlsx';
            }else if (type === 'order') {
                response = await statisticsService.exportOrderToExcel(params);
                filename = 'order_statistics.xlsx';
            }
            // Xử lý file download
            // const disposition = response.headers['content-disposition'];
            // const match = disposition && disposition.match(/filename="(.+)"/);
            // const fileName = match?.[1] || 'default.xlsx';
            // link.setAttribute('download', fileName);  //nếu muốn dùng filename từ backend
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); // tải về file
            document.body.appendChild(link); // thêm vào DOM
            link.click(); // tự động click , trình duyệt sẽ tự tải file xuống ngay lập tức.
            link.parentNode.removeChild(link); // xóa khỏi DOM
            window.URL.revokeObjectURL(url); //Giải phóng URL Blob vừa tạo, để trình duyệt giải phóng tài nguyên.
        } catch (err) {
            console.error('Lỗi xuất excel:', err);
            alert('Không thể xuất file Excel.');
        }
    };

    //function format tiền
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

 const handleDateChange = (type, date) => {
    // const iso = date ? date.toISOString().split('T')[0] : null;
    const localDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
    setStatisticRange((prev) => ({ ...prev, [type]: localDate }));
  };

    // Format chart data
    const revenueChartData = {
        labels: revenueData?.data?.map((d) => d.label) || [],
        datasets: [
            {
                label: 'DOANH THU',
                data: revenueData?.data?.map((d) => d.value) || [],
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                tension: 0.4, // Bo cong đường
            },
            {
                label: 'SỐ ĐƠN HÀNG',
                data: revenueData?.data?.map((d) => d.orderCount) || [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.4,
                yAxisID: 'orderCount',
            },
        ],
    };

    //format pie data
    const orderStatusColor = {
        processing: 'rgba(255, 159, 64, 0.8)',
        confirmed: 'rgba(54, 162, 235, 0.8)',
        shipped: 'rgba(255, 206, 86, 0.8)',
        completed: 'rgba(75, 192, 192, 0.8)',
        cancelled: 'rgba(204, 11, 11, 0.8)',
        returned: 'rgba(201, 203, 207, 0.8)',
    };
    const statusLabels = ['processing', 'confirmed', 'shipped', 'completed', 'cancelled', 'returned'];

    const orderStatusChartData = {
        labels: statusLabels.map((status) =>
            status === 'processing' ? 'Đang xử lý'
            : status === 'confirmed' ? 'Đã xác nhận'
            : status === 'shipped' ? 'Đang giao'
            : status === 'completed' ? 'Hoàn thành'
            : status === 'cancelled' ? 'Đã hủy'
            : status === 'returned' ? 'Hoàn trả'
            : status
        ),
        datasets: [
            {
                data: statusLabels.map((status) => orderStatusStats?.[status] || 0),
                backgroundColor: statusLabels.map((status) => orderStatusColor[status]),
                borderColor: 'white',
                borderWidth: 2,
            },
        ],
    };

    //option pie chart
    const orderStatusChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Phân bổ Trạng Thái Đơn Hàng',
            },
            datalabels: {
                formatter: (value, ctx) => {
                    //value: gtri hiện tại, ctx:context
                    let sum = 0;
                    let dataArr = ctx.chart.data.datasets[0].data;
                    sum = dataArr.reduce((acc, val) => acc + val, 0); //tổng đơn
                    let percentage = ((value * 100) / sum).toFixed(1) + '%'; // tính % lấy 1 thập phân
                    return `${percentage} (${value})`; // hiển thị % và sl
                },
                color: '#fff',
                font: {
                    weight: 'bold',
                    size: 12,
                },
                textShadow: {
                    color: 'black',
                    dx: 1,
                    dy: 1,
                    blur: 2,
                },
            },
        },
    };

    if (loading)
        return (
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
                        <button
                            onClick={() => {
                                handleExport({ type: 'revenue', params: mergedParams });
                            }}
                            className={cx('exportButton')}
                        >
                            <FaDownload className={cx('buttonIcon')} /> Xuất Excel
                        </button>
                    </div>

                    <div className={cx('selectTime')}>
                        <div className={cx('leftControls')}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                            <span>Từ:</span>
                            <DatePicker
                                value={statisticRange.fromDate ? dayjs(statisticRange.fromDate) : null}
                                onChange={(date) => handleDateChange('fromDate', date)}
                                format="DD/MM/YYYY"
                                slotProps={{
                                    textField: {
                                    size: 'medium',
                                    className: cx('dateInput'),
                                    },
                                }}
                            />

                            <span>Đến:</span>
                            <DatePicker
                                value={statisticRange.toDate ? dayjs(statisticRange.toDate) : null}
                                onChange={(date) => handleDateChange('toDate', date)}
                                format="DD/MM/YYYY"
                                slotProps={{
                                    textField: {
                                    size: 'medium',
                                    className: cx('dateInput'),
                                    },
                                }}
                            />
                            <button className={cx('exportButton')} onClick={handleRangeStatisticsRevenue}>
                                Thống kê
                            </button>
                        </LocalizationProvider>
                        </div>
             
                        <div className={cx('rightControls')}>
                            <select
                            value={revenuePeriod.by}
                            onChange={(e) => {
                                setRevenuePeriod({ ...revenuePeriod, by: e.target.value })
                                setStatisticRange({ ...statisticRange, by: e.target.value })
                            }}
                            className={cx('select')}
                        >
                            <option value="expected">Dự kiến</option>
                            <option value="reality">Thực tế</option>
                        </select>
                        <select
                            value={revenuePeriod.period}
                            onChange={(e) => {
                                setRevenuePeriod({ ...revenuePeriod, period: e.target.value });
                                setStatisticRange({...statisticRange, fromDate: null, toDate: null});
                            }}
                            className={cx('select')}
                        >
                            <option value="daily">Theo ngày</option>
                            <option value="weekly">Theo tuần</option>
                            <option value="monthly">Theo tháng</option>
                            <option value="yearly">Theo năm</option>
                        </select>
                        </div>
                    </div>
                     
                     <div className={cx('summaryContainer')}>
                        <div className={cx('summaryBox', 'revenueBox')}>
                            <h3 className={cx('summaryTitle')}>🔹 Doanh thu 💰</h3>
                            <p className={cx('summaryValue', 'revenueValue')}>
                                {formatCurrency(revenueData?.data?.reduce((acc, item) => acc + item.value, 0) || 0)}
                            </p>
                        </div>
                        <div className={cx('summaryBox', 'orderBox')}>
                            <h3 className={cx('summaryTitle')}>🔸 Số đơn hàng 📦</h3>
                            <p className={cx('summaryValue', 'orderValue')}>
                                {(revenueData?.data?.reduce((acc, item) => acc + item.orderCount, 0) || 0) + ' đơn'}
                            </p>
                        </div>
                    </div>
                     
                    <div className={cx('chartContainer')}>
                        {revenueData?.data ? (
                            <Line
                                data={revenueChartData}
                                options={{
                                    responsive: true, //tự co giãn theo kích thước container.
                                    interaction: {
                                        //hover
                                        mode: 'index', //Hiển thị tất cả các điểm có cùng chỉ số (trục x)
                                        intersect: false, // ko cần chính xác trỏ vào điểm
                                    },
                                    plugins: {
                                        datalabels: {
                                            display: false, // đã tắt số trên điểm
                                        },
                                    },
                                    scales: {
                                        y: {
                                            type: 'linear', // thang đo theo cách chia đều
                                            display: true,
                                            position: 'left',
                                            title: {
                                                display: true,
                                                text: 'Doanh thu (VNĐ)',
                                            },
                                        },
                                        orderCount: {
                                            type: 'linear',
                                            display: true,
                                            position: 'right',
                                            title: {
                                                display: true,
                                                text: 'Số đơn hàng',
                                            },
                                            grid: {
                                                drawOnChartArea: false,
                                            },
                                        },
                                    },
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
                        <button
                            onClick={() => {
                                handleExport({ type: 'product', params: productParams });
                            }}
                            className={cx('exportButton')}
                        >
                            <FaDownload className={cx('buttonIcon')} /> Xuất Excel
                        </button>
                    </div>
                    <div className={cx('filtersContainer')}>
                        <div className={cx('filterGroup')}>
                            <label className={cx('filterLabel')}>
                                Nhóm theo:
                            </label>
                            <select
                                value={productParams.groupBy}
                                onChange={(e) =>
                                    setProductParams({ ...productParams, groupBy: e.target.value, categoryId: '' })
                                } // Đặt lại categoryId khi groupBy thay đổi
                                className={cx('select')}
                            >
                                <option value="product">Sản phẩm</option>
                                <option value="category">Danh mục</option>
                                <option value="manufacturer">Nhà sản xuất</option>
                            </select>
                        </div>
                        {productParams.groupBy === 'product' && (
                            <div className={cx('filterGroup')}>
                                <label className={cx('filterLabel')}>
                                    Danh mục:
                                </label>
                                <select
                                    value={productParams.categoryId}
                                    onChange={(e) => setProductParams({ ...productParams, categoryId: e.target.value })}
                                    className={cx('select')}
                                    disabled={categories.length === 0}
                                >
                                    <option value="">Tất cả danh mục</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.nameCategory}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className={cx('filterGroup')}>
                            <label className={cx('filterLabel')}>
                                Sắp xếp theo:
                            </label>
                            <select
                                value={productParams.sortBy}
                                onChange={(e) => setProductParams({ ...productParams, sortBy: e.target.value })}
                                className={cx('select')}
                            >
                                <option value="name">Tên</option>
                                <option value="soldQuantity">Bán chạy nhất</option>
                                <option value="totalRevenue">Doanh thu cao nhất</option>
                                <option value="quantityInStock">Tồn kho</option>
                            </select>
                        </div>
                        <div className={cx('filterGroup')}>
                            <label className={cx('filterLabel')}>
                                Thứ tự:
                            </label>
                            <select
                                value={productParams.sortOrder}
                                onChange={(e) => setProductParams({ ...productParams, sortOrder: e.target.value })}
                                className={cx('select')}
                            >
                                <option value="desc">Giảm dần</option>
                                <option value="asc">Tăng dần</option>
                            </select>
                        </div>
                        <div className={cx('filterGroup')}>
                            <label htmlFor="sortOrder" className={cx('filterLabel')}>
                                Tìm kiếm theo tên:
                            </label>
                            <input
                                type="text"
                                value={searchProduct}
                                onChange={(e) =>setSearchProduct(e.target.value)}
                                placeholder="Nhập tên sản phẩm..."
                                className={cx('searchInput')}
                                />
                        </div>
                    </div>
                    <div className={cx('tableContainer')}>
                        {productStats && productStats.length > 0 ? (
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th>
                                            Tên{' '}
                                            {productParams.groupBy === 'product'
                                                ? 'sản phẩm'
                                                : productParams.groupBy === 'category'
                                                ? 'danh mục'
                                                : 'nhà sản xuất'}
                                        </th>
                                        {productParams.groupBy !== 'product' && <th>Số lượng SP</th>}
                                        <th>Tồn kho</th>
                                        <th>Đã bán</th>
                                        <th>Doanh thu</th>
                                        {productParams.groupBy === 'product' && <th>Danh mục</th>}
                                        {productParams.groupBy === 'product' && <th>Nhà sản xuất</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProduct.map((item, index) => (
                                        <tr key={item.id || index}>
                                            <td>{item.name}</td>
                                            {productParams.groupBy !== 'product' && <td>{item.productCount}</td>}
                                            <td>{item.quantityInStock}</td>
                                            <td>{item.soldQuantity}</td>
                                            <td>{formatCurrency(item.totalRevenue)}</td>
                                            {productParams.groupBy === 'product' && <td>{item.category || 'N/A'}</td>}
                                            {productParams.groupBy === 'product' && (
                                                <td>{item.manufacturer || 'N/A'}</td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className={cx('noData')}>Không có dữ liệu sản phẩm</p>
                        )}
                    </div>
                </div>

                {/* Customer Statistics */}
                <div className={cx('card')}>
                    <div className={cx('cardHeader')}>
                        <h2 className={cx('cardTitle')}>
                            <FaUsers className={cx('titleIcon')} /> Thống kê Khách hàng
                        </h2>
                        <button
                            onClick={() => {
                                handleExport({ type: 'customer', params: customerParams });
                            }}
                            className={cx('exportButton')}
                        >
                            <FaDownload className={cx('buttonIcon')} /> Xuất Excel
                        </button>
                    </div>
                    <div className={cx('filtersContainer')}>
                        <div className={cx('filterGroup')}>
                            <label className={cx('filterLabel')}>
                                Sắp xếp theo:
                            </label>
                            <select
                                value={customerParams.sortBy}
                                onChange={(e) => setCustomerParams({ ...customerParams, sortBy: e.target.value })}
                                className={cx('select')}
                            >
                                <option value="userName">Tên</option>
                                <option value="orderCount">Số đơn hàng</option>
                                <option value="totalSpent">Tổng chi tiêu</option>
                            </select>
                        </div>
                        <div className={cx('filterGroup')}>
                            <label className={cx('filterLabel')}>
                                Thứ tự:
                            </label>
                            <select
                                value={customerParams.sortOrder}
                                onChange={(e) => setCustomerParams({ ...customerParams, sortOrder: e.target.value })}
                                className={cx('select')}
                            >
                                <option value="desc">Giảm dần</option>
                                <option value="asc">Tăng dần</option>
                            </select>
                        </div>
                        <div className={cx('filterGroup')}>
                            <label className={cx('filterLabel')}>
                                Tìm kiếm theo tên hoặc email:
                            </label>
                            <input
                                type="text"
                                value={searchCus}
                                onChange={(e) =>setSearchCus(e.target.value)}
                                placeholder="Nhập thông tin..."
                                className={cx('searchInput')}
                                />
                        </div>
                    </div>
                    <div className={cx('tableContainer')}>
                        {customerStats ? (
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th>Tên khách hàng</th>
                                        <th>Email</th>
                                        <th>Số đơn hàng</th>
                                        <th>Tổng chi tiêu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCus.map((customer, index) => (
                                        <tr key={customer.userId || index}>
                                            <td>{customer.userName}</td>
                                            <td>{customer.userEmail}</td>
                                            <td>{customer.orderCount}</td>
                                            <td>{formatCurrency(customer.totalSpent)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className={cx('noData')}>Không có dữ liệu khách hàng</p>
                        )}
                    </div>
                </div>

                {/* Order Status Statistics */}
                <div className={cx('card')}>
                    <div className={cx('cardHeader')}>
                        <h2 className={cx('cardTitle')}>
                            <FaShoppingCart className={cx('titleIcon')} /> Trạng thái Đơn hàng
                        </h2>
                        <div>
                            <button
                                onClick={() => {
                                    handleExport({ type: 'order', params: orderStatus });
                                }}
                                className={cx('exportButton')}
                            >
                                <FaDownload className={cx('buttonIcon')} /> Xuất Excel
                            </button>
                            <select
                                value={orderStatus}
                                onChange={(e) => {setOrderStatus(e.target.value)}}
                                className={cx('select')}
                            >
                                <option value="completed">Hoàn thành</option>
                                <option value="processing">Đang xử lý</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="shipped">Đang giao</option>
                                <option value="cancelled">Đã hủy</option>
                                <option value="returned">Hoàn trả</option>
                            </select>
                        </div>
                    </div>
                    <div className={cx('chartContainer')}>
                            {orderStatusStats && Object.keys(orderStatusStats).length > 0 ? (
                                <Pie data={orderStatusChartData} options={orderStatusChartOptions} />
                            ) : (
                                <p className={cx('noData')}>Không có dữ liệu trạng thái đơn hàng</p>
                            )}

                        <div className={cx('verticalSummary')}>
                            <div className={cx('StatusOrderBox', 'revenueBox')}>
                                <h3 className={cx('summaryTitle')}>💰 Tổng số tiền</h3>
                                <p className={cx('summaryValue')}>
                                    {formatCurrency(orderValue?.data[0]?.totalRevenue || 0)}
                                </p>
                            </div>
                            <div className={cx('StatusOrderBox', 'orderBox')}>
                                <h3 className={cx('summaryTitle')}>📦 Tổng đơn hàng</h3>
                                <p className={cx('summaryValue')}>
                                    {(orderValue?.data[0]?.orderCount || 0) + ' đơn'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Statistics;
