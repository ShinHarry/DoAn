const routes = {
    admindashboard: '/admindashboard',

    moddashboard: '/moddashboard',

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

    // admin: '/admin',
    order: '/orders',
    category: '/category/:categoryId',

    news: '/news',
    addNew: '/addNew',
    updateNew: '/updateNew/:bannerId',

    sales: '/sales',
    updateSale: '/updateSale/:saleId',
    addSale: '/addSale',
    notfound: '/notfound',
};

export default routes;
