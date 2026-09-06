import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {

    const { user, loading } = useAuth();

    if (loading) {

        return (

            <div className="page flex items-center justify-center">

                Loading...

            </div>

        );

    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (
        requiredRole &&
        String(user.role || "").toUpperCase() !== requiredRole.toUpperCase()
    ) {
        return <Navigate to="/" replace />;
    }

    return children;

};

export default ProtectedRoute;