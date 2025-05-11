import { Navigate, useLocation } from 'react-router-dom';

function RequireAuth({ children, allowedRoles }) {
    const location = useLocation();
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default RequireAuth;
