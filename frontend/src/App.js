// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { publicRoutes, privateRoutes } from '~/routes';
// import DefaultLayout from '~/layouts';
// import { Fragment } from 'react';
// import RequireAuth from '~/components/RequireAuth';

// function App() {
//     return (
//         <Router>
//             <div className="App">
//                 <Routes>
//                     {/* Public routes */}
//                     {publicRoutes.map((route, index) => {
//                         const Page = route.component;
//                         let Layout = DefaultLayout;

//                         if (route.layout) {
//                             Layout = route.layout;
//                         } else if (route.layout === null) {
//                             Layout = Fragment;
//                         }

//                         return (
//                             <Route
//                                 key={index}
//                                 path={route.path}
//                                 element={
//                                     <Layout>
//                                         <Page />
//                                     </Layout>
//                                 }
//                             />
//                         );
//                     })}

//                     {/* Private routes */}
//                     {privateRoutes.map((route, index) => {
//                         const Page = route.component;
//                         let Layout = DefaultLayout;

//                         if (route.layout) {
//                             Layout = route.layout;
//                         } else if (route.layout === null) {
//                             Layout = Fragment;
//                         }

//                         return (
//                             <Route
//                                 key={index}
//                                 path={route.path}
//                                 element={
//                                     <RequireAuth allowedRoles={route.roles}>
//                                         <Layout>
//                                             <Page />
//                                         </Layout>
//                                     </RequireAuth>
//                                 }
//                             />
//                         );
//                     })}
//                 </Routes>
//             </div>
//         </Router>
//     );
// }

// export default App;
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes, privateRoutes } from '~/routes';
import DefaultLayout from '~/layouts';
import { Fragment } from 'react';
import RequireAuth from '~/components/RequireAuth';

function App() {
    // Hàm render route đệ quy, hỗ trợ nested routes
    const renderRoute = (route, index) => {
        const Page = route.component;
        let Layout = DefaultLayout;

        if (route.layout) {
            Layout = route.layout;
        } else if (route.layout === null) {
            Layout = Fragment;
        }

        const element = route.roles ? (
            <RequireAuth allowedRoles={route.roles}>
                <Layout>
                    <Page />
                </Layout>
            </RequireAuth>
        ) : (
            <Layout>
                <Page />
            </Layout>
        );

        return (
            <Route key={index} path={route.path} element={element}>
                {route.children?.map(renderRoute)}
            </Route>
        );
    };

    return (
        <Router>
            <div className="App">
                <Routes>
                    {publicRoutes.map(renderRoute)}
                    {privateRoutes.map(renderRoute)}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
