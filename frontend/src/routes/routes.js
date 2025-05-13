import config from '~/config';

// Layouts
import { HeaderOnly } from '~/layouts';

// Pages
import Home from '~/pages/Home/Home';
import Order from '~/pages/Order';
import Profile from '~/pages/Profile';
import Address from '~/pages/Address';
import Search from '~/pages/Search';
import ProductDetail from '~/pages/ProductDetail';
import AddProduct from '~/pages/AddProduct';
import UpdateProduct from '~/pages/UpdateProduct';
import Category from '~/pages/Category';
import Login from '~/pages/Login';
import Register from '~/pages/Register';

import AddBanner from '~/pages/AddBanner';
import ForgotPassword from '~/pages/ForgotPassword';
import UpdateBanner from '~/pages/UpdateBanner';
import AddSale from '~/pages/AddSale';
import UpdateSale from '~/pages/UpdateSale';
import Checkout from '~/pages/Checkout';
import CartDetail from '~/pages/CartDetail/CartDetail';
import OrderSuccess from '~/pages/OrderSuccess/OrderSuccess';
import PaymentReturn from '~/pages/PaymentReturn/PaymentReturn';
import OrderDetail from '~/pages/OrderDetail';

import AdminDashboard from '~/pages/AdminDashboard';
import ModDashboard from '~/pages/ModDashboard';
import ProductList from '~/pages/ModDashboard/ProductList';
import Banner from '~/pages/ModDashboard/Banner';
import Sale from '~/pages/ModDashboard/Sale';
import Origin from '~/pages/ModDashboard/Origin';
import Manufacturer from '~/pages/ModDashboard/Manufacturer';
// Public routes
const publicRoutes = [
    { path: config.routes.login, component: Login, layout: null },
    { path: config.routes.register, component: Register, layout: null },
    { path: config.routes.forgotpassword, component: ForgotPassword, layout: null },
    { path: config.routes.home, component: Home },
    { path: config.routes.search, component: Search },
    { path: config.routes.productDetail, component: ProductDetail },
    { path: config.routes.category, component: Category },
];

const privateRoutes = [
    { path: config.routes.admindashboard, component: AdminDashboard, roles: ['admin'], layout: null },

    {
        path: config.routes.moddashboard,
        component: ModDashboard,
        roles: ['mod'],
        children: [
            {
                path: 'productlist',
                component: ProductList,
                roles: ['mod'],
                layout: null,
            },
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
        ],
    },

    { path: config.routes.addProduct, component: AddProduct, roles: ['mod'] },
    { path: config.routes.updateProduct, component: UpdateProduct, roles: ['mod'] },
    // { path: config.routes.news, component: Banner, roles: ['mod'] },
    { path: config.routes.addNew, component: AddBanner, roles: ['mod'] },
    { path: config.routes.updateNew, component: UpdateBanner, roles: ['mod'] },
    // { path: config.routes.sales, component: Sale, roles: ['mod'] },
    { path: config.routes.addSale, component: AddSale, roles: ['mod'] },
    { path: config.routes.updateSale, component: UpdateSale, roles: ['mod'] },
    // { path: '/origins', component: Origin , roles: ['mod']},
    // { path: '/manufacturers', component: Manufacturer, roles: ['mod'] },

    { path: config.routes.order, component: Order, roles: ['cus', 'mod'] },
    { path: config.routes.profile, component: Profile, roles: ['admin', 'cus', 'mod'] },
    { path: config.routes.address, component: Address, layout: HeaderOnly, roles: ['cus', 'mod'] },
    { path: config.routes.checkout, component: Checkout, roles: ['cus', 'mod'] },
    { path: '/cart-detail', component: CartDetail, roles: ['cus', 'mod'] },
    { path: '/order-success/:orderId?', component: OrderSuccess, roles: ['cus', 'mod'] },
    { path: '/payment-return', component: PaymentReturn, roles: ['cus', 'mod'] },
    { path: '/orders/:orderId', component: OrderDetail, roles: ['cus', 'mod'] },

];

export { publicRoutes, privateRoutes };
