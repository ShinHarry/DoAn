const routes = {
    admindashboard: '/admindashboard',

    moddashboard: '/moddashboard',

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
};

export default routes;
