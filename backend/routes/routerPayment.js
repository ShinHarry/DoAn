const express = require("express");
const router = express.Router();
const crypto = require('crypto');
const moment = require('moment-timezone');

// POST /api/payments/vnpay/create_payment_url
router.post('/vnpay/create_payment_url', async (req, res) => {
    // lấy các biến môi trường
    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET; // giữ bí mật
    let vnpUrl = process.env.VNP_URL;
    const frontendReturnUrl = process.env.VNP_RETURN_URL;

    if (!tmnCode || !secretKey || !vnpUrl || !frontendReturnUrl) {
        console.error("VNPay environment variables missing!");
        return res.status(500).json({ success: false, message: 'Lỗi cấu hình VNPay.' });
    }

    // lấy data từ frontend req body
    const { amount, orderInfo } = req.body; 
    const receivedReturnUrl = req.body.returnUrl; 

    if (!amount || !receivedReturnUrl) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin số tiền hoặc URL trả về.' });
    }

    // lấy địa chỉ ip từ request
    const ipAddr = req.headers['x-forwarded-for'] || // 1. IP gốc nếu request đi qua proxy
                   req.connection?.remoteAddress ||  // 2. IP từ kết nối TCP
                   req.socket?.remoteAddress ||      // 3. IP từ socket trực tiếp    
                   req.connection?.socket?.remoteAddress || // 4. IP từ socket bên trong connection
                   '127.0.0.1'; // Fallback IP

    const createDate = moment().tz("Asia/Ho_Chi_Minh").format('YYYYMMDDHHmmss');
    const orderId = moment().tz("Asia/Ho_Chi_Minh").format('DDHHmmss'); 
    
    const locale = 'vn';
    const currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';      // Phiên bản API VNPay
    vnp_Params['vnp_Command'] = 'pay';        // Lệnh giao dịch (pay = thanh toán)
    vnp_Params['vnp_TmnCode'] = tmnCode;      // Mã website tích hợp (do VNPay cấp)
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId; 
    vnp_Params['vnp_OrderInfo'] = orderInfo || 'Thanh toan don hang ' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';      // Loại hàng hóa (optional)
    vnp_Params['vnp_Amount'] = amount * 100;    // Số tiền (nhân 100 theo quy định của VNPay)
    vnp_Params['vnp_ReturnUrl'] = receivedReturnUrl; // URL VNPay sẽ redirect về sau khi thanh toán
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    // vnp_Params['vnp_BankCode'] = 'NCB'; // chỉ định NCB bank

    // sắp xếp parameters theo bảng chữ cái
    const sortedParams = Object.keys(vnp_Params)
        .sort()
        .reduce((acc, key) => {
            acc[key] = vnp_Params[key];
            return acc;
        }, {});

    // dùng hàm băm để tạo chữ ký bảo mật
    const signData = new URLSearchParams(sortedParams).toString();    //chuyển thành chuỗi
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 

    vnp_Params['vnp_SecureHash'] = signed;

    // tạo URL cuối
    //chuyển object thành chuỗi query string tạo url
    const paymentUrl = vnpUrl + '?' + new URLSearchParams(vnp_Params).toString();

    console.log("Generated VNPay URL:", paymentUrl);

    // trả url về frontend
    res.status(200).json({ success: true, paymentUrl: paymentUrl });
});

// GET /api/payments/vnpay/vnpay_return
router.get('/vnpay/vnpay_return', async (req, res) => {
    const vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    // xoá các trường băm trc khi sắp xếp/băm
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const secretKey = process.env.VNP_HASHSECRET;
    if (!secretKey) {
        console.error("Missing VNP_HASHSECRET for verification");
        return res.status(500).json({ success: false, message: 'Lỗi cấu hình.' });
    }

    // sắp xêp parameters
    const sortedParams = Object.keys(vnp_Params)
        .sort()
        .reduce((acc, key) => {
            acc[key] = vnp_Params[key];
            return acc;
        }, {});
    
    // tạo chữ ký
    const signData = new URLSearchParams(sortedParams).toString();
    
    // tính toán băm lại
    const hmac = crypto.createHmac("sha512", secretKey);
    const calculatedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    const responseCode = vnp_Params['vnp_ResponseCode'];
    const transactionRef = vnp_Params['vnp_TxnRef']; // orderId

    if (secureHash === calculatedHash) {
        if (responseCode === '00') {            
            // console.log("VNPay Return SUCCESS - TxnRef:", transactionRef, "Code:", responseCode);
            res.status(200).json({ 
                success: true, 
                message: 'Xác thực thanh toán thành công.', 
                code: '00', 
                orderId: transactionRef 
            });
        } else {
            // console.log("VNPay Return FAILED - TxnRef:", transactionRef, "Code:", responseCode);
            res.status(200).json({ 
                success: false, 
                message: 'Thanh toán không thành công theo VNPay.', 
                code: responseCode 
            });
        }
    } else {
        console.error("VNPay Return INVALID HASH - TxnRef:", transactionRef);
        res.status(200).json({ 
            success: false, 
            message: 'Chữ ký không hợp lệ.', 
            code: '97' 
        });
    }
});


module.exports = router; 