import { Navigate, Outlet, useLocation } from "react-router-dom";

// One guard for every page group:
// - requireLogin: send logged-out users to /login
// - mustChangePassword: lock the user on /change-password
// - roles: only allow these roles, for example ["ADMIN"]
export default function ProtectedRoute({ user, roles, requireLogin = true }) {
  const location = useLocation();

  if (requireLogin && !user) {
    // Remember the page so login can return here
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
