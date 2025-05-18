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
    login: '/login',
    register: '/register',
    forgotpassword: '/forgot-password',

    product: '/product',
    productDetail: '/product/:productId',
    updateProduct: '/updateProduct/:productId',
    addProduct: '/addProduct',

    cart: '/cart',
    cartsId: '/carts/:id',
    checkout: '/checkout',

    order: '/orders',
    category: '/category/:categoryId',

    news: '/news',
    addNew: '/addNew',
    updateNew: '/updateNew/:bannerId',

    sales: '/sales',
    updateSale: '/updateSale/:saleId',
    addSale: '/addSale',
    notfound: '/notfound',
    wishlist: '/wishlist',
    orderDetailM: '/orderDetailM/:id',
    orderManage: '/orderManage',
    orderDetail: '/orders/:id',
    orderSuccess: '/order-success/:orderId?',
    paymentReturn: '/payment-return',
    categoryManager: '/categoryManager',
};

export default routes;
