const express = require("express");
const router = express.Router();

const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');

// hàm giúp lấy khoảng thời gian theo từng loại
const getPeriodDateRange = (period, date = new Date()) => {
    let startDate, endDate = new Date(date);

    if (period === 'daily') {
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    } else if (period === 'weekly') {
        startDate = new Date(date); // getDay() trả về số thứ trong tuần (0 = CN, 1 = T2, ..., 6 = T7)
        startDate.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)); // Monday
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
    } else if (period === 'monthly') {
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0); // ngày cuối của tháng
        endDate.setHours(23, 59, 59, 999);
    } else if (period === 'yearly') {
        startDate = new Date(date.getFullYear(), 0, 1); // ngày đầu của năm
        endDate = new Date(date.getFullYear(), 11, 31); // ngày cuối của năm
        endDate.setHours(23, 59, 59, 999);
    }
    return { startDate, endDate };
};

// 1. Thống kê doanh thu
router.get('/revenue', async (req, res) => {
    // console.log(req.query)
    const { period, by , targetDate: rawTargetDate} = req.query; // 'daily', 'weekly', 'monthly', 'yearly'
    // console.log(period ,by)
    targetDate = rawTargetDate  ? new Date(rawTargetDate ) : new Date();  // xử lý nêú có truyền ngày lên

    if (isNaN(targetDate.getTime())) {
        return res.status(400).json({ message: "targetDate không hợp lệ." });
    }

    let groupByFormat;
    let startDate, endDate;
    const pipeline = [];
    // console.log(by)
    const condition = (by === 'expected') ? 'createdAt' : 'completeAt';

    // Điều kiện lọc cơ bản: lọc theo thời gian
    const matchStage = {
        $match: {   // giống where Sql 
            [condition]: { 
                // Sẽ được cập nhật bên dưới
            }
        }
    };
    if (condition === 'createdAt') {
         matchStage.$match.orderStatus = { $nin: ['cancelled', 'returned'] };
    }
    // console.log(matchStage)

    if (period === 'daily') {
        const range = getPeriodDateRange('daily', targetDate);
        startDate = range.startDate;
        endDate = range.endDate;
        console.log(startDate ,endDate )
        matchStage.$match[condition] = { $gte: startDate, $lte: endDate };
        groupByFormat = { $hour: `$${condition}` }; // Nhóm theo giờ trong ngày
        pipeline.push(matchStage, {
            $group: {  // nhóm và tính
                _id: groupByFormat,  // Mỗi giờ là 1 nhóm
                totalRevenue: { $sum: "$totalAmount" },  // Tính tổng doanh thu trong giờ đó
                orderCount: { $sum: 1 } // Đếm số đơn hàng trong giờ đó
            }
        }, {
            $sort: { "_id": 1 }  // Sắp xếp giờ tăng dần
        }, {
            $project: {  //output
                _id: 0, // ẩn, bỏ trường _id
                label: { $concat: [ { $toString: "$_id" }, ":00" ] }, // Format: "0:00", "1:00", ... "23:00"
                value: "$totalRevenue",
                orderCount: "$orderCount"
            }
        });
    } else if (period === 'weekly') {
        const range = getPeriodDateRange('weekly', targetDate);
        startDate = range.startDate;
        endDate = range.endDate;
        matchStage.$match[condition] = { $gte: startDate, $lte: endDate };
        groupByFormat = { $isoDayOfWeek: `$${condition}` }; // 1 (Mon) đến 7 (Sun)
        pipeline.push(matchStage, {
            $group: {
                _id: groupByFormat,
                totalRevenue: { $sum: "$totalAmount" },
                orderCount: { $sum: 1 }
            }
        }, {
            $sort: { "_id": 1 }
        }, {
            $project: {
                _id: 0,
                label: { // chuyển số thứ tự ngày sang (T2, T3, ... CN)
                    $switch: {
                        branches: [
                            { case: { $eq: ["$_id", 1] }, then: "Thứ 2" },
                            { case: { $eq: ["$_id", 2] }, then: "Thứ 3" },
                            { case: { $eq: ["$_id", 3] }, then: "Thứ 4" },
                            { case: { $eq: ["$_id", 4] }, then: "Thứ 5" },
                            { case: { $eq: ["$_id", 5] }, then: "Thứ 6" },
                            { case: { $eq: ["$_id", 6] }, then: "Thứ 7" },
                            { case: { $eq: ["$_id", 7] }, then: "Chủ Nhật" },
                        ],
                        default: "Không xác định"
                    }
                },
                value: "$totalRevenue",
                orderCount: "$orderCount"
            }
        });

    } else if (period === 'monthly') {
        const range = getPeriodDateRange('monthly', targetDate);
        startDate = range.startDate;
        endDate = range.endDate;
        matchStage.$match[condition] = { $gte: startDate, $lte: endDate };
        groupByFormat = { $dayOfMonth: `$${condition}` }; // Group by ngày của tháng
        pipeline.push(matchStage, {
            $group: {
                _id: groupByFormat,
                totalRevenue: { $sum: "$totalAmount" },
                orderCount: { $sum: 1 }
            }
        }, {
            $sort: { "_id": 1 }
        }, {
            $project: {
                _id: 0,
                label: { $concat: ["Ngày ", { $toString: "$_id" }] }, // "Ngày 1", "Ngày 2", ...
                value: "$totalRevenue",
                orderCount: "$orderCount"
            }
        });
    } else if (period === 'yearly') {
        const range = getPeriodDateRange('yearly', targetDate);
        startDate = range.startDate;
        endDate = range.endDate;
        matchStage.$match[condition] = { $gte: startDate, $lte: endDate };
        groupByFormat = { $month: `$${condition}` }; // Group by tháng của năm
        pipeline.push(matchStage, {
            $group: {
                _id: groupByFormat,
                totalRevenue: { $sum: "$totalAmount" },
                orderCount: { $sum: 1 }
            }
        }, {
            $sort: { "_id": 1 }
        }, {
            $project: {
                _id: 0,
                label: { $concat: ["Tháng ", { $toString: "$_id" }] }, // "Tháng 1", "Tháng 2", ...
                value: "$totalRevenue",
                orderCount: "$orderCount"
            }
        });
    } else {
        return res.status(400).json({ message: "Khoảng thời gian (period) không hợp lệ." });
    }

    try {
        const results = await Order.aggregate(pipeline); // trả về mảng obbject
        res.json({
            message: `Dữ liệu doanh thu theo ${period} (Từ ${startDate.toLocaleDateString()} đến ${endDate.toLocaleDateString()})`,
            data: results
        });
    } catch (error) {
        console.error("Error fetching revenue statistics:", error);
        res.status(500).json({ message: "Lỗi khi lấy thống kê doanh thu", error: error.message });
    }
});

// 2. Thống kê doanh thu theo range
router.get('/revenueByRange', async (req, res) => {
    // console.log(req.query)
    const { fromDate, toDate, by = 'expected' } = req.query; 

    if (!fromDate || !toDate) {
        return res.status(400).json({ message: 'fromDate và toDate là bắt buộc.' });
    }

    const startDate = new Date(fromDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);

    console.log(startDate, endDate)

    const pipeline = [];
    // console.log(by)
    const condition = (by === 'expected') ? 'createdAt' : 'completeAt';

    const diffMs = endDate.getTime() - startDate.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    let period;
    if (diffMs <= oneDayMs) {
        period = 'daily';
    } else if (diffMs > oneDayMs && diffMs <= 7 * oneDayMs) {
        period = 'weekly';
    } else if (diffMs > 7 * oneDayMs && diffMs <= 31 * oneDayMs) {
        period = 'monthly';
    } else {
        period = 'yearly';
    }
    // console.log(period)

    // Điều kiện lọc cơ bản: lọc theo thời gian
    const matchStage = {
        $match: { [condition]: { $gte: startDate, $lte: endDate }}
    };
    if (condition === 'createdAt') {
         matchStage.$match.orderStatus = { $nin: ['cancelled', 'returned'] };
    }
    // console.log(matchStage)
    if (period === 'daily') {
        pipeline.push(matchStage, {
            $group: {  // nhóm và tính
                _id: { $hour: `$${condition}` },  // Mỗi giờ là 1 nhóm
                totalRevenue: { $sum: "$totalAmount" },  // Tính tổng doanh thu trong giờ đó
                orderCount: { $sum: 1 } // Đếm số đơn hàng trong giờ đó
            }
        }, {
            $sort: { "_id": 1 }  // Sắp xếp giờ tăng dần
        }, {
            $project: {  //output
                _id: 0, // ẩn, bỏ trường _id
                label: { $concat: [ { $toString: "$_id" }, ":00" ] }, // Format: "0:00", "1:00", ... "23:00"
                value: "$totalRevenue",
                orderCount: "$orderCount"
            }
        });
    } else if (period === 'weekly' || period === 'monthly') {
        pipeline.push(matchStage, {
            $group: {
                _id: {$dateToString: { format: "%m-%d", date: `$${condition}` }},
                totalRevenue: { $sum: "$totalAmount" },
                orderCount: { $sum: 1 }
            }
        }, {
            $sort: { "_id": 1 }
        }, {
            $project: {
                _id: 0,
                label: "$_id",
                value: "$totalRevenue",
                orderCount: "$orderCount"
            }
        });

    } else if (period === 'yearly') {
        pipeline.push(matchStage, {
            $group: {
                _id: {$dateToString: { format: "%m-%Y", date: `$${condition}` }},
                totalRevenue: { $sum: "$totalAmount" },
                orderCount: { $sum: 1 }
            }
        }, {
            $sort: { "_id": 1 }
        }, {
            $project: {
                _id: 0,
                label: "$_id",
                value: "$totalRevenue",
                orderCount: "$orderCount"
            }
        });
    } else {
        return res.status(400).json({ message: "Khoảng thời gian (period) không hợp lệ." });
    }

    try {
        const results = await Order.aggregate(pipeline); // trả về mảng obbject
        // console.log(results)
        res.json({
            message: `Dữ liệu doanh thu theo ${period} (Từ ${startDate.toLocaleDateString()} đến ${endDate.toLocaleDateString()})`,
            data: results
        });
    } catch (error) {
        console.error("Error fetching revenue statistics:", error);
        res.status(500).json({ message: "Lỗi khi lấy thống kê doanh thu", error: error.message });
    }
});

// 4. Xuất file Excel thống kê doanh thu
router.get('/revenue/export', async (req, res) => {
    try {
        const { fromDate, toDate, period = 'monthly', by = 'expected' } = req.query;
        console.log(fromDate, toDate, period, by)
        let startDate, endDate;

        // Xử lý ngày tháng năm được chọn
        if (fromDate && toDate) {
            startDate = new Date(fromDate);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(toDate);
            endDate.setHours(23, 59, 59, 999);
            } else {
            // Nếu không truyền from/to thì tính theo period
            const range = getPeriodDateRange(period, new Date());
            startDate = range.startDate;
            endDate = range.endDate;
        }
        console.log(startDate, endDate)
        const condition = (by === 'expected') ? 'createdAt' : 'completeAt';

        const matchStage = {
            $match: {
                [condition]: { $gte: startDate, $lte: endDate }
            }
        };

        if (condition === 'completeAt') {
            matchStage.$match.orderStatus = 'completed';
        }
        if (condition === 'createdAt') {
         matchStage.$match.orderStatus = { $nin: ['cancelled', 'returned'] };
    }
        console.log(by, matchStage)
        const pipeline=[];
        pipeline.push(matchStage,{
            $sort: { [condition]: 1 }
        },{
            $project:{
                _id :0,
                orderCode: "$_id",
                totalAmount: "$totalAmount",
                paymentMethod: "$paymentMethod",
                paymentStatus: "$paymentStatus",
                createdAt: "$createdAt",
                completeAt: "$completeAt",
            }
        })

        // Lấy dữ liệu doanh thu
        const orders = await Order.aggregate(pipeline);
        console.log(orders)
        // Tạo workbook và worksheet mới
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Thống kê doanh thu');

        // Thiết lập header
        worksheet.columns = [
            { header: (condition === 'createdAt') ? 'Ngày tạo đơn' : 'Ngày hoàn thành', key: condition, width: 20 },
            { header: 'Mã đơn hàng', key: 'orderCode', width: 25 },
            { header: 'Tổng tiền', key: 'totalAmount', width: 15 },
            { header: 'Phương thức thanh toán', key: 'paymentMethod', width: 25 },
            { header: 'Trạng thái thanh toán', key: 'paymentStatus', width: 20 }
        ];

        // Thêm dữ liệu vào worksheet
        worksheet.addRows(orders.map(order => ({
            [condition]: order[condition] ? order[condition].toLocaleString('vi-VN') : '',
            orderCode: order.orderCode,
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus
        })));

        // Tính tổng doanh thu
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        worksheet.addRow({}); // Thêm dòng trống
        worksheet.addRow({ totalAmount: `Tổng doanh thu: ${totalRevenue.toLocaleString('vi-VN')} VNĐ` });

        // Format tiền tệ cho cột totalAmount
        worksheet.getColumn('totalAmount').numFmt = '#,##0';

        // Thiết lập style cho header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Thiết lập header response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Revenue-Statistics.xlsx"');
        await workbook.xlsx.write(res); //ghi nội dung file Excel vào res dạng binary
        res.end(); // phản hồi kết thúc

    } catch (error) {
        console.error("Lỗi khi xuất Excel thống kê doanh thu:", error);
        res.status(500).json({ message: "Lỗi khi xuất Excel thống kê doanh thu", error: error.message });
    }
});

// 3. Thống kê sản phẩm (/api/statistics/products?groupBy=category&sortBy=soldQuantity...)
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({}, '_id nameCategory').sort({ nameCategory: 1 }); // chỉ lấy id, name
        res.json({
            message: "Danh sách danh mục sản phẩm",
            data: categories
        });
    } catch (error) {
        console.error("Error fetching category list:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách danh mục", error: error.message });
    }
    } 
);

function buildProductStatisticsPipeline({ groupBy, sortBy, sortOrder = 'desc', categoryId }) {
    const pipeline = [];
    const sortOrderValue = sortOrder === 'asc' ? 1 : -1;
    const productMatchStage = {};

    if (groupBy === 'product' && categoryId) {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            throw new Error("categoryId không hợp lệ.");
        }
        productMatchStage['productInfo.productCategory'] = new mongoose.Types.ObjectId(categoryId);
    }

    pipeline.push(
        {
            $lookup: {
                from: Product.collection.name,
                localField: "_id",
                foreignField: "_id",
                as: "productInfo"
            }
        },
        { $unwind: "$productInfo" }
    );

    if (Object.keys(productMatchStage).length > 0) {
        pipeline.push({ $match: productMatchStage });
    }

    pipeline.push(
        {
            $lookup: {
                from: Order.collection.name,
                let: { productId: "$productInfo._id" },
                pipeline: [
                    { $match: { paymentStatus: 'completed', $expr: { $in: ["$$productId", "$orderDetails.product"] } } },
                    { $unwind: "$orderDetails" },
                    { $match: { $expr: { $eq: ["$$productId", "$orderDetails.product"] } } },
                    {
                        $group: {
                            _id: "$orderDetails.product",
                            soldQuantity: { $sum: "$orderDetails.quantity" },
                            totalRevenueFromProduct: { $sum: { $multiply: ["$orderDetails.quantity", "$orderDetails.unitPrice"] } }
                        }
                    }
                ],
                as: "orderStats"
            }
        },
        {
            $addFields: {
                soldQuantity: { $ifNull: [{ $arrayElemAt: ["$orderStats.soldQuantity", 0] }, 0] },
                totalRevenue: { $ifNull: [{ $arrayElemAt: ["$orderStats.totalRevenueFromProduct", 0] }, 0] },
                quantityInStock: "$productInfo.productQuantity"
            }
        }
    );

    let groupStageId;
    if (groupBy === 'product') {
        groupStageId = { name: "$productInfo.productName", id: "$productInfo._id" };
        pipeline.push(
            {
                $group: {
                    _id: groupStageId,
                    quantityInStock: { $first: "$quantityInStock" },
                    soldQuantity: { $first: "$soldQuantity" },
                    totalRevenue: { $first: "$totalRevenue" },
                    category: { $first: "$productInfo.productCategory" },
                    manufacturer: { $first: "$productInfo.productManufacturer" },
                }
            },
            {
                $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' }
            },
            {
                $lookup: { from: 'manufacturers', localField: 'manufacturer', foreignField: '_id', as: 'manufacturerInfo' }
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id.id",
                    name: "$_id.name",
                    category: { $ifNull: [{ $arrayElemAt: ["$categoryInfo.nameCategory", 0] }, "N/A"] },
                    manufacturer: { $ifNull: [{ $arrayElemAt: ["$manufacturerInfo.nameManufacturer", 0] }, "N/A"] },
                    quantityInStock: 1,
                    soldQuantity: 1,
                    totalRevenue: 1
                }
            }
        );
    } else if (groupBy === 'category') {
        pipeline.push(
            { $lookup: { from: 'categories', localField: 'productInfo.productCategory', foreignField: '_id', as: 'categoryData' } },
            { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } }
        );
        groupStageId = { name: { $ifNull: ["$categoryData.nameCategory", "Không có danh mục"] }, id: "$categoryData._id" };
        pipeline.push(
            {
                $group: {
                    _id: groupStageId,
                    quantityInStock: { $sum: "$quantityInStock" },
                    soldQuantity: { $sum: "$soldQuantity" },
                    totalRevenue: { $sum: "$totalRevenue" },
                    productCount: { $addToSet: "$productInfo._id" }
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id.id",
                    name: "$_id.name",
                    quantityInStock: 1,
                    soldQuantity: 1,
                    totalRevenue: 1,
                    productCount: { $size: "$productCount" }
                }
            }
        );
    } else if (groupBy === 'manufacturer') {
        pipeline.push(
            { $lookup: { from: 'manufacturers', localField: 'productInfo.productManufacturer', foreignField: '_id', as: 'manufacturerData' } },
            { $unwind: { path: "$manufacturerData", preserveNullAndEmptyArrays: true } }
        );
        groupStageId = { name: { $ifNull: ["$manufacturerData.nameManufacturer", "Không có nhà sản xuất"] }, id: "$manufacturerData._id" };
        pipeline.push(
            {
                $group: {
                    _id: groupStageId,
                    quantityInStock: { $sum: "$quantityInStock" },
                    soldQuantity: { $sum: "$soldQuantity" },
                    totalRevenue: { $sum: "$totalRevenue" },
                    productCount: { $addToSet: "$productInfo._id" }
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id.id",
                    name: "$_id.name",
                    quantityInStock: 1,
                    soldQuantity: 1,
                    totalRevenue: 1,
                    productCount: { $size: "$productCount" }
                }
            }
        );
    }

    if (sortBy) {
        const sortStage = {};
        sortStage[sortBy] = sortOrderValue;
        pipeline.push({ $sort: sortStage });
    }

    return pipeline;
}

router.get('/products', async (req, res) => {
    try {
        // Chạy pipeline từ collection Product vì muốn liệt kê tất cả sản phẩm
        const { groupBy, sortBy, sortOrder, categoryId } = req.query;
        const pipeline =  buildProductStatisticsPipeline({ groupBy, sortBy, sortOrder, categoryId });
        const results = await Product.aggregate(pipeline);        
        res.json({
            message: `Thống kê sản phẩm theo ${groupBy}, sắp xếp theo ${sortBy || 'mặc định'}`,
            data: results
        });
        // console.log("Product statistics data:", results);
    } catch (error) {
        console.error("Error fetching product statistics:", error);
        res.status(500).json({ message: "Lỗi khi lấy thống kê sản phẩm", error: error.message });
    }
    }
);

// 4. Xuất file Excel ( cho sản phẩm: /api/statistics/products/export)
router.get('/products/export', async (req, res) => {
    try {
        const { groupBy, sortBy, sortOrder, categoryId } = req.query;
        const pipeline = buildProductStatisticsPipeline({ groupBy, sortBy, sortOrder, categoryId });
        const productData = await Product.aggregate(pipeline);
        const cleanedData = productData.map(({ id, ...rest }) => rest);
        // console.log("Excel export data:", cleanedData);
        // Tạo file Excel
        const workbook = new ExcelJS.Workbook();  // tạo file exel
        const worksheet = workbook.addWorksheet('ThongKeSanPham');  // tạo worksheet trong file excel

        // Thêm header cho worksheet
        let columns = [];
        if (groupBy === 'product' || !groupBy) {
            columns = [
                { header: 'Tên Sản Phẩm', key: 'name', width: 30 },
                { header: 'Danh Mục', key: 'category', width: 20 },
                { header: 'Nhà Sản Xuất', key: 'manufacturer', width: 20 },
                { header: 'SL Tồn', key: 'quantityInStock', width: 10 },
                { header: 'Đã Bán', key: 'soldQuantity', width: 10 },
                { header: 'Doanh Thu', key: 'totalRevenue', width: 15, style: { numFmt: '#,##0 [$₫-vi-VN]'} },
            ];
        } else if (groupBy === 'category' || groupBy === 'manufacturer') {
            columns = [
                { header: groupBy === 'category' ? 'Tên Danh Mục' : 'Tên Nhà Sản Xuất', key: 'name', width: 30 },
                { header: 'SL Sản Phẩm', key: 'productCount', width: 15 },
                { header: 'Tổng SL Tồn', key: 'quantityInStock', width: 15 },
                { header: 'Tổng Đã Bán', key: 'soldQuantity', width: 15 },
                { header: 'Tổng Doanh Thu', key: 'totalRevenue', width: 20 },
            ];
        }
        worksheet.columns = columns;  //gán danh sách cột vào worksheet

        // Thêm dữ liệu
        worksheet.addRows(cleanedData.map(item => {
            let row = { name: item.name, quantityInStock: item.quantityInStock, soldQuantity: item.soldQuantity, totalRevenue: item.totalRevenue }; 
            if (groupBy === 'product' || !groupBy) {
                 row.category = item.category;
                 row.manufacturer = item.manufacturer;
            } else if (groupBy === 'category' || groupBy === 'manufacturer'){
                row.productCount = item.productCount;
            }
            return row;
        }));
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); 
        //Giúp trình duyệt hiểu là file Excel, không phải HTML, JSON hay file văn bản.
        res.setHeader('Content-Disposition', 'attachment; filename="ThongKeSanPham.xlsx"');  //báo trình duyệt tải file
        await workbook.xlsx.write(res); //ghi nội dung file Excel vào res dạng binary
        res.end(); // phản hồi kết thúc

    } catch (error) {
        console.error("Error exporting product statistics to Excel:", error);
        res.status(500).json({ message: "Lỗi khi xuất file Excel thống kê sản phẩm", error: error.message });
    }
});

// 5. Thống kê khách hàng (/api/statistics/customers?sortBy=totalSpent)
async function buildCustomersStatisticsPipeline({ sortBy, sortOrder = 'desc' }) {
    
 const sortOrderValue = sortOrder === 'asc' ? 1 : -1;

    if (!['totalSpent', 'orderCount', 'userName'].includes(sortBy)) {
        return res.status(400).json({ message: "Giá trị sortBy không hợp lệ." });
    }

    // ktra xem có đơn hàng nào k
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
        return res.json({
            message: "Chưa có đơn hàng nào trong hệ thống",
            data: []
        });
    }

    const pipeline = [
        {
            $match: { orderStatus : 'completed'}
        },
        {
            $group: {
                _id: "$user",
                totalSpent: { $sum: "$totalAmount" },
                orderCount: { $sum: 1 }
            }
        },
        {
            $lookup: { from: 'users', localField: "_id", foreignField: "_id", as: "userInfo" }
        },
        {
            $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true }
        },
        {
            $project: {
                _id: 0,
                userId: "$_id",
                userName: { $ifNull: ["$userInfo.userName", "Người dùng không xác định"] },
                userEmail: { $ifNull: ["$userInfo.userEmail", "Chưa có"] },
                totalSpent: 1,
                orderCount: 1
            }
        },
        {
            $sort: { [sortBy]: sortOrderValue }
        }
    ];

    return pipeline;
}

router.get('/customers', async (req, res) => {
    try{
        const { sortBy, sortOrder } = req.query;
        const pipeline = await buildCustomersStatisticsPipeline({sortBy, sortOrder});

        const results = await Order.aggregate(pipeline);
            
        if (results.length === 0) {
            return res.json({
                message: "Không tìm thấy dữ liệu thống kê khách hàng",
                data: []
            });
        }
        res.json({
            message: `Thống kê khách hàng, sắp xếp theo ${sortBy}`,
            data: results
        });
    } catch (error) {
        console.error("Error fetching customer statistics:", error);
        res.status(500).json({
            message: "Lỗi khi lấy thống kê khách hàng", error: error.message
        });
    }
});

// 6. Xuất file Excel ( cho khách hàng: /api/statistics/customers/export)
router.get('/customers/export', async (req, res) => {
    try {
        const { sortBy = 'totalSpent', sortOrder = 'desc' } = req.query;
        const pipeline =  await buildCustomersStatisticsPipeline({sortBy, sortOrder});
        const customersData = await Order.aggregate(pipeline);
        const cleanedData = customersData.map(({ id, ...rest }) => rest);
        // console.log("Excel export data:", cleanedData);
        // Tạo file Excel
        const workbook = new ExcelJS.Workbook();  // tạo file exel
        const worksheet = workbook.addWorksheet('ThongKeKhachHang');  // tạo worksheet trong file excel

        // Thêm header cho worksheet
        let columns = [];

        columns = [
            { header: 'Tên Khách hàng', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Số đơn hàng', key: 'orderCount', width: 15 },
            { header: 'Tổng chi tiêu', key: 'totalSpent', width: 20 , style: { numFmt: '#,##0 [$₫-vi-VN]' }},
        ];
        worksheet.columns = columns;  //gán danh sách cột vào worksheet

        // Thêm dữ liệu
        worksheet.addRows(cleanedData.map(item => {
            let row = { name: item.userName, email: item.userEmail, orderCount: item.orderCount, totalSpent: item.totalSpent }; 
            return row;
        }));
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); 
        //Giúp trình duyệt hiểu là file Excel, không phải HTML, JSON hay file văn bản.
        res.setHeader('Content-Disposition', 'attachment; filename="ThongKeKhachHang.xlsx"');  //báo trình duyệt tải file
        await workbook.xlsx.write(res); //ghi nội dung file Excel vào res dạng binary
        res.end(); // phản hồi kết thúc

    } catch (error) {
        console.error("Error exporting product statistics to Excel:", error);
        res.status(500).json({ message: "Lỗi khi xuất file Excel thống kê sản phẩm", error: error.message });
    }
});

// 7. Thống kê trạng thái đơn hàng (/api/statistics/orders/status)
router.get('/orders/status', async (req, res) => {
    try {
        const statusCounts = await Order.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id",
                    count: 1
                }
            }
        ]);
        // Chuyển mảng thành object cho frontend
        const formattedCounts = statusCounts.reduce((acc, item) => {
            acc[item.status] = item.count;
            return acc;
        }, {});

        //Lấy tất cả trạng thái có trong enum, kể cả khi count = 0
        const allOrderStatuses = Order.schema.path('orderStatus').enumValues; // lấy tất cả enuum
        allOrderStatuses.forEach(status => {
            if (!formattedCounts[status]) {
                formattedCounts[status] = 0;
            }
        });

        res.json({
            message: "Thống kê trạng thái đơn hàng",
            data: formattedCounts
        });
    } catch (error) {
        console.error("Error fetching order status statistics:", error);
        res.status(500).json({ message: "Lỗi khi lấy thống kê trạng thái đơn hàng", error: error.message });
    }
});

//8. lấy value theo order status
router.get('/order/value/:value', async (req, res) => {
    try{
        const value  = req.params.value;
        // console.log(value)
        if (!value) {
            return res.json({
                message: "Không tìm thấy dữ liệu để thống kê",
                data: []
            });
        }

        const pipeline = [
            { $match: { orderStatus: value } },
            {
                $group: {
                    _id: "$orderStatus",
                    totalRevenue: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id",
                    totalRevenue: 1,
                    orderCount: 1
                }
            }
        ];
        const results = await Order.aggregate(pipeline)
        // console.log(results)
        res.json({
            message: 'Thống kê orderStatus',
            data: results
        });
    } catch (error) {
        console.error("Error fetching customer statistics:", error);
        res.status(500).json({
            message: "Lỗi khi lấy thống kê", error: error.message
        });
    }
});

//9. Xuất exel cho orderStatus
router.get('/order/export', async (req, res) => {
    try {
        const { value } = req.query;
        console.log(value)

        if (!value) {
            return res.json({
                message: "Không tìm thấy dữ liệu để thống kê",
                data: []
            });
        }
    
        const pipeline=[];
        pipeline.push(
            { $match: { orderStatus: value } },
            {
            $project:{
                _id :0,
                orderCode: "$_id",
                totalAmount: "$totalAmount",
                paymentMethod: "$paymentMethod",
                paymentStatus: "$paymentStatus",
                createdAt: "$createdAt",
                completeAt: "$completeAt",
                orderStatus: "$orderStatus"
            }
        })

        // Lấy dữ liệu doanh thu
        const orders = await Order.aggregate(pipeline);
        // console.log(orders)
        // Tạo workbook và worksheet mới
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Thống kê doanh thu');

        // Thiết lập header
        worksheet.columns = [
            { header: 'Ngày tạo đơn' , key: 'create', width: 20 },
            { header: 'Ngày hoàn thành' , key: 'complete', width: 20 },
            { header: 'Mã đơn hàng', key: 'orderCode', width: 25 },
            { header: 'Tổng tiền', key: 'totalAmount', width: 15 },
            { header: 'Phương thức thanh toán', key: 'paymentMethod', width: 25 },
            { header: 'Trạng thái thanh toán', key: 'paymentStatus', width: 20 },
            { header: 'Trạng thái đơn hàng', key: 'orderStatus', width: 20 }
        ];

        // Thêm dữ liệu vào worksheet
        worksheet.addRows(orders.map(order => ({
            create: order.createdAt.toLocaleString('vi-VN'),
            complete: order.completeAt ? order.completeAt.toLocaleString('vi-VN') : 'Không có',
            orderCode: order.orderCode,
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
        })));

        // Tính tổng doanh thu
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const orderCount = orders.reduce((sum, order) => sum + 1, 0);
        worksheet.addRow({}); // Thêm dòng trống
        worksheet.addRow({ totalAmount: `Tổng số tiền: ${totalRevenue.toLocaleString('vi-VN')} VNĐ` });
        worksheet.addRow({ totalAmount: `Tổng đơn hàng: ${orderCount} đơn.` });

        // Format tiền tệ cho cột totalAmount
        worksheet.getColumn('totalAmount').numFmt = '#,##0';

        // Thiết lập style cho header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Thiết lập header response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="OrderStatus-Statistics.xlsx"');
        await workbook.xlsx.write(res); //ghi nội dung file Excel vào res dạng binary
        res.end(); // phản hồi kết thúc

    } catch (error) {
        console.error("Lỗi khi xuất Excel thống kê doanh thu:", error);
        res.status(500).json({ message: "Lỗi khi xuất Excel thống kê doanh thu", error: error.message });
    }
});

module.exports = router;