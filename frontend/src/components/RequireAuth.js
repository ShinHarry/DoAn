import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '~/redux/actions/authActions';

function RequireAuth({ children, allowedRoles }) {
    const location = useLocation();
    const dispatch = useDispatch();

    const currentUser = useSelector((state) => state.auth.login.currentUser);
    useEffect(() => {
        if (!currentUser) {
            dispatch(fetchUser());
        }
    }, [currentUser, dispatch]);

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(currentUser.user.userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

export default RequireAuth;
