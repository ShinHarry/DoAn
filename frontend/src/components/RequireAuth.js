import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import * as authService from '~/services/authService';

function RequireAuth({ children, allowedRoles }) {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await authService.fetchUser();
                setUser(response);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading) return <div>Đang kiểm tra quyền truy cập...</div>;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(user.user.userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

export default RequireAuth;
