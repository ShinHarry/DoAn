import config from '~/config';

// Layouts
// Pages
import Home from '~/pages/Home/Home';
import AboutMe from '~/pages/AboutMe';
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
import AddDiscount from '~/pages/AddDiscount';
import UpdateSale from '~/pages/UpdateSale';
import UpdateDiscount from '~/pages/UpdateDiscount';

import ForgotPassword from '~/pages/ForgotPassword';
import Checkout from '~/pages/Checkout';
import CartDetail from '~/pages/CartDetail/CartDetail';
import OrderSuccess from '~/pages/OrderSuccess/OrderSuccess';
import PaymentReturn from '~/pages/PaymentReturn/PaymentReturn';
import OrderDetail from '~/pages/OrderDetail';
import AdminDashboard from '~/pages/AdminDashboard';
import UserList from '~/pages/components/UserList';
import ModDashboard from '~/pages/ModDashboard';
import ProductList from '~/pages/components/ProductList';
import Banner from '~/pages/components/Banner';
import Manufacturer from '~/pages/components/Manufacturer';
import Sale from '~/pages/components/Sale';
import Origin from '~/pages/components/Origin';
import Statistics from '~/pages/components/Statistics';
import Unit from '~/pages/components/Unit';

import Wishlist from '~/pages/Wishlist';
import OrderManage from '~/pages/OrderManage';
import CategoryManager from '~/pages/CategoryManager';
import OrderDetailM from '~/pages/OrderDetailM';

import ProfileDashboard from '~/pages/ProfileDashboard';
import ChangePassWord from '~/pages/ProfileDashboard/ChangePassWord';
import Profile from '~/pages/ProfileDashboard/Profile';
import Address from '~/pages/ProfileDashboard/Address';

import UnAuthorized from '~/pages/UnAuthorized';

import { LayoutNoFooter } from '~/layouts';
// Public routes
const publicRoutes = [
    { path: config.routes.login, component: Login, layout: null },
    { path: config.routes.register, component: Register, layout: null },
    { path: config.routes.forgotpassword, component: ForgotPassword, layout: null },
    { path: config.routes.home, component: Home },
    { path: '/aboutMe', component: AboutMe },
    { path: config.routes.search, component: Search },
    { path: config.routes.productDetail, component: ProductDetail },
    { path: config.routes.category, component: Category },
    { path: config.routes.unauthorized, component: UnAuthorized, layout: null },
];

const privateRoutes = [
    {
        path: config.routes.admindashboard,
        component: AdminDashboard,
        roles: ['admin'],
        layout: LayoutNoFooter,
        children: [
            {
                path: 'userlist',
                component: UserList,
                roles: ['admin'],
                layout: null,
            },
            {
                path: 'productlist',
                component: ProductList,
                roles: ['admin', 'mod'],
                layout: null,
            },
            { path: 'orderManage', component: OrderManage, roles: ['admin', 'mod'] },
            { path: 'categoryManager', component: CategoryManager, roles: ['admin', 'mod'] },
            {
                path: 'news',
                component: Banner,
                roles: ['admin', 'mod'],
                layout: null,
            },
            {
                path: 'sales',
                component: Sale,
                roles: ['admin', 'mod'],
                layout: null,
            },
            {
                path: 'manufacturers',
                component: Manufacturer,
                roles: ['admin', 'mod'],
                layout: null,
            },
            {
                path: 'origins',
                component: Origin,
                roles: ['admin', 'mod'],
                layout: null,
            },
            {
                path: 'unit',
                component: Unit,
                roles: ['admin', 'mod'],
                layout: null,
            },
            {
                path: 'statistics',
                component: Statistics,
                roles: ['admin', 'accountant'],
                layout: null,
            },
        ],
    },

    {
        path: config.routes.moddashboard,
        component: ModDashboard,
        roles: ['admin', 'mod', 'accountant'],
        layout: LayoutNoFooter,
        children: [
            {
                path: 'productlist',
                component: ProductList,
                roles: ['admin', 'mod'],
                layout: null,
            },
            { path: 'orderManage', component: OrderManage, roles: ['admin', 'mod'] },
            { path: 'categoryManager', component: CategoryManager, roles: ['admin', 'mod'] },
            {
                path: 'news',
                component: Banner,
                roles: ['admin', 'mod'],
                layout: null,
            },
            {
                path: 'sales',
                component: Sale,
                roles: ['admin', 'mod'],
                layout: null,
            },
            {
                path: 'manufacturers',
                component: Manufacturer,
                roles: ['admin', 'mod'],
                layout: null,
            },
            {
                path: 'origins',
                component: Origin,
                roles: ['admin', 'mod'],
                layout: null,
            },
            {
                path: 'unit',
                component: Unit,
                roles: ['admin', 'mod'],
                layout: null,
            },
            {
                path: 'statistics',
                component: Statistics,
                roles: ['admin', 'accountant'],
                layout: null,
            },
        ],
    },

    { path: config.routes.addProduct, component: AddProduct, roles: ['admin', 'mod'], layout: LayoutNoFooter },
    { path: config.routes.updateProduct, component: UpdateProduct, roles: ['admin', 'mod'], layout: LayoutNoFooter },

    { path: config.routes.news, component: Banner, roles: ['admin', 'mod'], layout: LayoutNoFooter },
    { path: config.routes.addNew, component: AddBanner, roles: ['admin', 'mod'], layout: LayoutNoFooter },
    { path: config.routes.updateNew, component: UpdateBanner, roles: ['admin', 'mod'], layout: LayoutNoFooter },

    { path: config.routes.sales, component: Sale, roles: ['admin', 'mod'], layout: LayoutNoFooter },
    { path: config.routes.addSale, component: AddSale, roles: ['admin', 'mod'], layout: LayoutNoFooter }, 
    { path: '/addDiscount', component: AddDiscount, roles: ['admin', 'mod'], layout: LayoutNoFooter }, 
    { path: config.routes.updateSale, component: UpdateSale, roles: ['admin', 'mod'], layout: LayoutNoFooter },
    { path: '/updateDiscount/:DiscountId', component: UpdateDiscount, roles: ['admin', 'mod'], layout: LayoutNoFooter }, 

    { path: '/origins', component: Origin, roles: ['admin', 'mod'], layout: LayoutNoFooter },
    { path: '/manufacturers', component: Manufacturer, roles: ['admin', 'mod'], layout: LayoutNoFooter },

    {
        path: config.routes.profiledashboard,
        component: ProfileDashboard,
        roles: ['admin', 'cus', 'mod', 'accountant'],
        children: [
            {
                path: config.routes.profile,
                component: Profile,
                roles: ['admin', 'cus', 'mod', 'accountant'],
                layout: null,
            },
            {
                path: config.routes.address,
                component: Address,
                roles: ['admin', 'cus', 'mod', 'accountant'],
                layout: null,
            },
            {
                path: config.routes.changepassWord,
                component: ChangePassWord,
                roles: ['admin', 'cus', 'mod', 'accountant'],
                layout: null,
            },
        ],
    },
    { path: config.routes.order, component: Order, roles: ['admin', 'cus', 'mod'], layout: LayoutNoFooter },
    { path: config.routes.address, component: Address, roles: ['admin', 'cus', 'mod'] },
    { path: config.routes.checkout, component: Checkout, roles: ['admin', 'cus', 'mod'] },
    { path: '/cart-detail', component: CartDetail, roles: ['admin', 'cus', 'mod'] },
    { path: '/order-success/:orderId?', component: OrderSuccess, roles: ['admin', 'cus', 'mod'] },
    { path: '/payment-return', component: PaymentReturn, roles: ['admin', 'cus', 'mod'] },
    { path: '/orders/:orderId', component: OrderDetail, roles: ['admin', 'cus', 'mod'] },
    { path: config.routes.wishlist, component: Wishlist, roles: ['admin', 'cus', 'mod'] },

    { path: '/orderDetailM/:orderId', component: OrderDetailM, roles: ['admin', 'mod'] },
];

export { publicRoutes, privateRoutes };
