const routes = {
    // Quản trị viên
    admindashboard: '/admindashboard',

    moddashboard: '/moddashboard',

    // Hồ sơ người dùng
    profiledashboard: '/profiledashboard',
    profile: 'profile/:userId',
    address: 'profile/me/address',
    changepassWord: 'profile/:userId/changepassword',

    home: '/',
    search: '/search',
    product: '/product',
    productDetail: '/product/:productId',
    updateProduct: '/updateProduct/:productId',
    addProduct: '/addProduct',
    cart: '/cart',
    cartsId: '/carts/:id',
    checkout: '/checkout',
    admin: '/admin',
    login: '/login',
    order: '/orders',
    category: '/category/:categoryId',
    register: '/register',
    news: '/news',
    addNew: '/addNew',
    updateNew: '/updateNew/:bannerId',
    sales: '/sales',
    updateSale: '/updateSale/:saleId',
    addSale: '/addSale',
    forgotpassword: '/forgot-password',
    wishlist: '/wishlist',
    orderDetailM: '/orderDetailM/:id',
    orderManage: '/orderManage',
    orderDetail: '/orders/:id',
    orderSuccess: '/order-success/:orderId?',
    paymentReturn: '/payment-return',
    categoryManager: '/categoryManager',
};

export default routes;
