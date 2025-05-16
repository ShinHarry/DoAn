const express = require("express");
const router = express.Router();

const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');

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
    const { period } = req.query; // 'daily', 'weekly', 'monthly', 'yearly'
    let { targetDate } = req.query; // Optional: YYYY-MM-DD
    targetDate = targetDate ? new Date(targetDate) : new Date();  // xử lý nêú có truyền ngày lên

    if (isNaN(targetDate.getTime())) {
        return res.status(400).json({ message: "targetDate không hợp lệ." });
    }

    let groupByFormat;
    let startDate, endDate;
    const pipeline = [];

    // Điều kiện lọc cơ bản: lọc theo thời gian
    const matchStage = {
        $match: {   // giống where Sql 
            createdAt: { 
                // Sẽ được cập nhật bên dưới
            }
        }
    };

    if (period === 'daily') {
        const range = getPeriodDateRange('daily', targetDate);
        startDate = range.startDate;
        endDate = range.endDate;
        matchStage.$match.createdAt = { $gte: startDate, $lte: endDate };
        groupByFormat = { $hour: "$createdAt" }; // Nhóm theo giờ trong ngày
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
        matchStage.$match.createdAt = { $gte: startDate, $lte: endDate };
        groupByFormat = { $isoDayOfWeek: "$createdAt" }; // 1 (Mon) đến 7 (Sun)
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
        matchStage.$match.createdAt = { $gte: startDate, $lte: endDate };
        groupByFormat = { $dayOfMonth: "$createdAt" }; // Group by ngày của tháng
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
        matchStage.$match.createdAt = { $gte: startDate, $lte: endDate };
        groupByFormat = { $month: "$createdAt" }; // Group by tháng của năm
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

// 2. Thống kê sản phẩm (/api/dashboard/products?groupBy=category&sortBy=soldQuantity...)

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

router.get('/products', async (req, res) => {
    const { groupBy, sortBy, sortOrder = 'desc', categoryId } = req.query; // Added categoryId
    const sortOrderValue = sortOrder === 'asc' ? 1 : -1;

    if (!['manufacturer', 'category', 'product'].includes(groupBy)) {
        return res.status(400).json({ message: "Giá trị groupBy không hợp lệ. Chỉ chấp nhận 'manufacturer', 'category', 'product'." });
    }

    if (sortBy && !['soldQuantity', 'totalRevenue', 'quantityInStock', 'name'].includes(sortBy)) {
        return res.status(400).json({ message: "Giá trị sortBy không hợp lệ." });
    }

    const pipeline = [];

    // Match stage cho categoryId
    const productMatchStage = {};

    // 1: Lấy tất cả sản phẩm và thông tin cần thiết (số lượng tồn kho)
    // lọc theo một danh mục khi groupBy là 'product'
    if (groupBy === 'product' && categoryId) {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Định dạng categoryId không hợp lệ." });
        }
        productMatchStage['productInfo.productCategory'] = new mongoose.Types.ObjectId(categoryId);
    }
    
    pipeline.push({
        $lookup: {  //giống sql join
            from: Product.collection.name, //products
            localField: "_id", 
            foreignField: "_id", // _id products
            as: "productInfo"   
        }
    }, {
        $unwind: "$productInfo"  //array -> object
    });

    // áp dụng productMatchStage sau khi unwinding productInfo
    if (Object.keys(productMatchStage).length > 0) {
        pipeline.push({ $match: productMatchStage });
    }
    
    pipeline.push({
        $lookup: {
            from: Order.collection.name,
            let: { productId: "$productInfo._id" },
            pipeline: [
                { $match: { 
                    paymentStatus: 'completed', 
                    $expr: {   // phép so sánh 2 trường trong 2 collection
                        $in: ["$$productId", "$orderDetails.product"] 
                    }
                } },
                { $unwind: "$orderDetails" },  // bóc mảng thành nhiều document con
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
    }, {
        $addFields: {
            soldQuantity: { $ifNull: [ { $arrayElemAt: ["$orderStats.soldQuantity", 0] }, 0 ] }, // nếu null thì gán 0
            totalRevenue: { $ifNull: [ { $arrayElemAt: ["$orderStats.totalRevenueFromProduct", 0] }, 0 ] },
            quantityInStock: "$productInfo.productQuantity"
        }
    });

    // {
//   "_id": ObjectId("P002"),
//   "productInfo": {
//     "productName": "Smartphone Y",
//     "productQuantity": 100,
//     "productCategory": ObjectId("C002")
//      ...
//   },
//   "orderStats": [
//     {
//       "_id": ObjectId("P002"),
//       "soldQuantity": 3,
//       "totalRevenueFromProduct": 2400
//     }
//   ],
//   "soldQuantity": 3,
//   "totalRevenue": 2400,
//   "quantityInStock": 100
// }

    //2: Group by và tính toán
    let groupStageId;
    const projectStage = {  //output $project
        _id: 0,
        name: "$_id.name", //điều chỉnh lại dựa trên groupBy
        groupInfo: "$_id.info", // Thêm cho category/manufacturer name
        quantityInStock: { $sum: "$quantityInStock" },
        soldQuantity: { $sum: "$soldQuantity" },
        totalRevenue: { $sum: "$totalRevenue" },
    };

    if (groupBy === 'product') {
        groupStageId = { name: "$productInfo.productName", id: "$productInfo._id" };
         pipeline.push({
            $group: {
                _id: groupStageId,
                quantityInStock: { $first: "$quantityInStock" }, 
                soldQuantity: { $first: "$soldQuantity" },
                totalRevenue: { $first: "$totalRevenue" },
                category: { $first: "$productInfo.productCategory"}, 
                manufacturer: { $first: "$productInfo.productManufacturer"}, 
            }
        }, {
            $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' }
        }, {
            $lookup: { from: 'manufacturers', localField: 'manufacturer', foreignField: '_id', as: 'manufacturerInfo' }
        }, {
            $project: {
                _id: 0,
                id: "$_id.id",
                name: "$_id.name",
                category: { $ifNull: [ { $arrayElemAt: ["$categoryInfo.nameCategory", 0] }, "N/A"] },
                manufacturer: { $ifNull: [ { $arrayElemAt: ["$manufacturerInfo.nameManufacturer", 0] }, "N/A"] },
                quantityInStock: 1, //Giữ nguyên trường quantityInStock từ document hiện tại === "$quantityInStock"
                soldQuantity: 1,
                totalRevenue: 1
            }
        });
    } else if (groupBy === 'category') {
        pipeline.push({
            $lookup: { from: 'categories', localField: 'productInfo.productCategory', foreignField: '_id', as: 'categoryData' }
        }, {
            $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } //nếu không có danh mục → giữ document, không bỏ
        }); 
        groupStageId = { name: { $ifNull: ["$categoryData.nameCategory", "Không có danh mục"] }, id: "$categoryData._id" };
        projectStage.name = "$_id.name";
        pipeline.push({
            $group: {
                _id: groupStageId,
                quantityInStock: { $sum: "$quantityInStock" },
                soldQuantity: { $sum: "$soldQuantity" },
                totalRevenue: { $sum: "$totalRevenue" },
                productCount: { $addToSet: "$productInfo._id" } // thêm gtri nhưng ko trùng lặp
            }
        }, {
            $project: {
                _id: 0,
                id: "$_id.id",
                name: "$_id.name",
                quantityInStock: 1,
                soldQuantity: 1,
                totalRevenue: 1,
                productCount: { $size: "$productCount"} //lấy độ dài mảng
            }
        });
    } else if (groupBy === 'manufacturer') {
        pipeline.push({
            $lookup: { from: 'manufacturers', localField: 'productInfo.productManufacturer', foreignField: '_id', as: 'manufacturerData' }
        }, {
            $unwind: { path: "$manufacturerData", preserveNullAndEmptyArrays: true }
        });
        groupStageId = { name: { $ifNull: ["$manufacturerData.nameManufacturer", "Không có nhà sản xuất"] }, id: "$manufacturerData._id" };
        projectStage.name = "$_id.name";
        pipeline.push({
            $group: {
                _id: groupStageId,
                quantityInStock: { $sum: "$quantityInStock" },
                soldQuantity: { $sum: "$soldQuantity" },
                totalRevenue: { $sum: "$totalRevenue" },
                productCount: { $addToSet: "$productInfo._id" } 
            }
        }, {
            $project: {
                _id: 0,
                id: "$_id.id",
                name: "$_id.name",
                quantityInStock: 1,
                soldQuantity: 1,
                totalRevenue: 1,
                productCount: { $size: "$productCount"}
            }
        });
    }
    
    // Giai đoạn 3: Sắp xếp
    if (sortBy) {
        const sortStage = {};
        sortStage[sortBy] = sortOrderValue; // = sortStage = {[sortBy]: sortOrderValue}
        pipeline.push({ $sort: sortStage });
    }

    try {
        // Chạy pipeline từ collection Product vì chúng ta muốn liệt kê tất cả sản phẩm
        // ngay cả khi chúng chưa bán được hàng.
        const results = await Product.aggregate(pipeline);
        res.json({
            message: `Thống kê sản phẩm theo ${groupBy}, sắp xếp theo ${sortBy || 'mặc định'}`,
            data: results
        });
    } catch (error) {
        console.error("Error fetching product statistics:", error);
        res.status(500).json({ message: "Lỗi khi lấy thống kê sản phẩm", error: error.message });
    }
    }
);

module.exports = router;