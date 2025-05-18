import config from '~/config';

// Layouts
// Pages
import Home from '~/pages/Home/Home';
import Order from '~/pages/Order';

import Search from '~/pages/Search';
import ProductDetail from '~/pages/ProductDetail';
import AddProduct from '~/pages/AddProduct';
import UpdateProduct from '~/pages/UpdateProduct';

import Category from '~/pages/Category';
import Login from '~/pages/Login';
import Register from '~/pages/Register';

import AddBanner from '~/pages/AddBanner';
import UpdateBanner from '~/pages/UpdateBanner';
import AddSale from '~/pages/AddSale';
import UpdateSale from '~/pages/UpdateSale';

import ForgotPassword from '~/pages/ForgotPassword';
import Checkout from '~/pages/Checkout';
import CartDetail from '~/pages/CartDetail/CartDetail';
import OrderSuccess from '~/pages/OrderSuccess/OrderSuccess';
import PaymentReturn from '~/pages/PaymentReturn/PaymentReturn';
import OrderDetail from '~/pages/OrderDetail';
import AdminDashboard from '~/pages/AdminDashboard';

import ModDashboard from '~/pages/ModDashboard';
import ProductList from '~/pages/ModDashboard/ProductList/ProductList';
import Banner from '~/pages/ModDashboard/Banner';
import Manufacturer from '~/pages/ModDashboard/Manufacturer';
import Sale from '~/pages/ModDashboard/Sale';
import Origin from '~/pages/ModDashboard/Origin';
import Statistics from '~/pages/ModDashboard/Statistics';
import Wishlist from '~/pages/Wishlist';
import OrderManage from '~/pages/OrderManage';
import CategoryManager from '~/pages/CategoryManager';
import OrderDetailM from '~/pages/OrderDetailM';


import ProfileDashboard from '~/pages/ProfileDashboard';
import ChangePassWord from '~/pages/ProfileDashboard/ChangePassWord';
import Profile from '~/pages/ProfileDashboard/Profile';
import Address from '~/pages/ProfileDashboard/Address';

import NotFound from '~/pages/NotFound/NotFound';

import { LayoutNoFooter } from '~/layouts';
// Public routes
const publicRoutes = [
    { path: config.routes.login, component: Login, layout: null },
    { path: config.routes.register, component: Register, layout: null },
    { path: config.routes.forgotpassword, component: ForgotPassword, layout: null },
    { path: config.routes.home, component: Home },
    { path: config.routes.search, component: Search },
    { path: config.routes.productDetail, component: ProductDetail },
    { path: config.routes.category, component: Category },
    { path: config.routes.notfound, component: NotFound, layout: null },
];

const privateRoutes = [
    { path: config.routes.admindashboard, component: AdminDashboard, roles: ['admin'], layout: LayoutNoFooter },

    {
        path: config.routes.moddashboard,
        component: ModDashboard,
        roles: ['mod'],
        layout: LayoutNoFooter,
        children: [
            {
                path: 'productlist',
                component: ProductList,
                roles: ['mod'],
                layout: null,
            },
            { path: 'orderManage', component: OrderManage, roles: ['mod'] },
            { path: 'categoryManager', component: CategoryManager, roles: ['mod'] },
            {
                path: 'news',
                component: Banner,
                roles: ['mod'],
                layout: null,
            },
            {
                path: 'sales',
                component: Sale,
                roles: ['mod'],
                layout: null,
            },
            {
                path: 'manufacturers',
                component: Manufacturer,
                roles: ['mod'],
                layout: null,
            },
            {
                path: 'origins',
                component: Origin,
                roles: ['mod'],
                layout: null,
            },
            {
                path: 'statistics',
                component: Statistics,
                roles: ['mod'],
                layout: null,
            },
        ],
    },

    { path: config.routes.addProduct, component: AddProduct, roles: ['mod'], layout: LayoutNoFooter },
    { path: config.routes.updateProduct, component: UpdateProduct, roles: ['mod'], layout: LayoutNoFooter },

    { path: config.routes.news, component: Banner, roles: ['mod'], layout: LayoutNoFooter },
    { path: config.routes.addNew, component: AddBanner, roles: ['mod'], layout: LayoutNoFooter },
    { path: config.routes.updateNew, component: UpdateBanner, roles: ['mod'], layout: LayoutNoFooter },

    { path: config.routes.sales, component: Sale, roles: ['mod'], layout: LayoutNoFooter },
    { path: config.routes.addSale, component: AddSale, roles: ['mod'], layout: LayoutNoFooter },
    { path: config.routes.updateSale, component: UpdateSale, roles: ['mod'], layout: LayoutNoFooter },

    { path: '/origins', component: Origin, roles: ['mod'], layout: LayoutNoFooter },
    { path: '/manufacturers', component: Manufacturer, roles: ['mod'], layout: LayoutNoFooter },

    {
        path: config.routes.profiledashboard,
        component: ProfileDashboard,
        roles: ['admin', 'cus', 'mod'],
        children: [
            {
                path: config.routes.profile,
                component: Profile,
                roles: ['admin', 'cus', 'mod'],
                layout: null,
            },
            {
                path: config.routes.address,
                component: Address,
                roles: ['admin', 'cus', 'mod'],
                layout: null,
            },
            {
                path: config.routes.changepassWord,
                component: ChangePassWord,
                roles: ['admin', 'cus', 'mod'],
                layout: null,
            },
        ],
    },
    { path: config.routes.order, component: Order, roles: ['cus', 'mod'] ,layout: LayoutNoFooter },
    { path: config.routes.address, component: Address, roles: ['cus', 'mod'] },
    { path: config.routes.checkout, component: Checkout, roles: ['cus', 'mod'] },
    { path: '/cart-detail', component: CartDetail, roles: ['cus', 'mod'] },
    { path: '/order-success/:orderId?', component: OrderSuccess, roles: ['cus', 'mod'] },
    { path: '/payment-return', component: PaymentReturn, roles: ['cus', 'mod'] },
    { path: '/orders/:orderId', component: OrderDetail, roles: ['cus', 'mod'] },
    { path: config.routes.wishlist, component: Wishlist, roles: ['cus', 'mod'] },
    
    
    { path: '/orderDetailM/:orderId', component: OrderDetailM, roles: ['mod'] },
];

export { publicRoutes, privateRoutes };
