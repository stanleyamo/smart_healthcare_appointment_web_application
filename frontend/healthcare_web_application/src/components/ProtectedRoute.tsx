import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const token = localStorage.getItem("access_token");
    const userRole = localStorage.getItem("user_role");
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole || "")) {
        console.error(`Access Denied: Role '${userRole}' not in ${allowedRoles}`);
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;