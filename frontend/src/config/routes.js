const routes = {
    home: '/',
    homeadmin: '/homeadmin',
    search: '/search',
    //product
    product: '/product',
    productDetail: '/product/:productId',
    updateProduct: '/updateProduct/:productId',
    addProduct: '/addProduct',
    cart: '/cart',
    cartsId: '/carts/:id',
    checkout: '/checkout',
    admin: '/admin',
    //login
    login: '/login',
    register: '/register',
<<<<<<< HEAD
    news : '/news',
    addNew : '/addNew',
    updateNew : '/updateNew/:bannerId',
    sales : '/sales',
    updateSale: '/updateSale/:saleId',
    addSale: '/addSale',
    // forgotpassword: '/forgot-password',
    checkout: '/checkout',
=======
    forgotpassword: '/forgot-password',
    order: '/order',
    category: '/category/:categoryId',
    new: '/new',
    addNew: '/addNew',
    //profile
    profile: '/profile/:userId',
    address: '/profile/:userId/address',
    changepassword: '/profile/:userId/changepassword',
>>>>>>> e1e5f9d (user page)
};

export default routes;
