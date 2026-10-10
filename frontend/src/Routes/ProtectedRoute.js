import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, isAdmin }) => {
    const { loading, isAuthenticated, user } = useSelector(state => state.user);
    const location = useLocation();

    if (loading !== false) {
        return null;
    }

    if (isAdmin) {
        return isAuthenticated && user?.role === 'admin'
            ? children
            : <Navigate to="/admin/login" replace state={{ from: location }} />;
    }

    return children;
};

export default ProtectedRoute;
