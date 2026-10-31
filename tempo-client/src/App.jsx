import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { getUser, logout } from "./lib/auth.js";
import Navbar from "./components/Navbar";
import HomePage from "./pages/public/HomePage.jsx";
import StaffLoginPage from "./components/StaffLoginPage";
import ChangePasswordPage from "./components/ChangePasswordPage";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Temporary pages until the real ones are built
function PlaceholderPage({ title, text }) {
  return (
    <div className="p-12 text-center text-slate-100">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-slate-400">{text}</p>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("th");
  const [user, setUser] = useState(getUser());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function onExpired() {
      setUser(null);
      navigate("/login", { replace: true });
    }

    // ProtectedRoute sees the flag and redirects to /change-password
    function onMustChange() {
      setUser(getUser());
    }

    window.addEventListener("auth:expired", onExpired);
    window.addEventListener("auth:must-change-password", onMustChange);

    return () => {
      window.removeEventListener("auth:expired", onExpired);
      window.removeEventListener("auth:must-change-password", onMustChange);
    };
  }, [navigate]);

  function handleLoginSuccess() {
    // The /login route sees the new user and redirects
    setUser(getUser());
  }

  function handleLogout() {
    logout();
    setUser(null);
    navigate("/login", { replace: true });
  }

  // Page to open after login. Never return to /change-password:
  // forced users are sent there anyway, and after a successful change
  // the user should land on the home page.
  const from = location.state?.from;
  const afterLogin = from && from !== "/change-password" ? from : "/";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar
        lang={lang}
        setLang={setLang}
        user={user}
        onLogout={handleLogout}
      />

      <main>
        <Routes>
          {/* Login: logged-in users go back to the page they tried to open */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate
                  to={user.mustChangePassword ? "/change-password" : afterLogin}
                  replace
                />
              ) : (
                <StaffLoginPage
                  lang={lang}
                  onLoginSuccess={handleLoginSuccess}
                />
              )
            }
          />

          {/* Public pages: open to everyone, blocked while a password change is required */}
          <Route element={<ProtectedRoute user={user} requireLogin={false} />}>
            <Route path="/" element={<HomePage lang={lang} />} />
            <Route
              path="/courses"
              element={
                <PlaceholderPage
                  title={lang === "th" ? "คอร์สเรียน" : "Courses"}
                  text={"Courses Page"}
                />
              }
            />
            <Route
              path="/products"
              element={
                <PlaceholderPage
                  title={lang === "th" ? "สินค้า" : "Products"}
                  text={"Products Page"}
                />
              }
            />
            <Route
              path="/about"
              element={
                <PlaceholderPage
                  title={lang === "th" ? "เกี่ยวกับเรา" : "About Us"}
                  text={"About Page"}
                />
              }
            />
          </Route>

          {/* Loged-in user only */}
          <Route element={<ProtectedRoute user={user} />}>
            <Route
              path="/change-password"
              element={
                <ChangePasswordPage
                  lang={lang}
                  forced={!!user?.mustChangePassword}
                  onCancel={() => navigate("/")}
                  onLogout={handleLogout}
                />
              }
            />
          </Route>

          {/* Unknow URL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
