import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { getUser, logout } from "./lib/auth.js";
import {
  getBranches,
  getCurrentBranch,
  setCurrentBranch,
} from "./lib/session.js";
import Navbar from "./components/Navbar";
import HomePage from "./pages/public/HomePage.jsx";
import DashboardPage from "./pages/protected/DashboardPage.jsx";
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
  // Branch state (read from the session saved at login)
  const [branches, setBranches] = useState(() => getBranches());
  const [currentBranch, setCurrentBranchState] = useState(() =>
    getCurrentBranch(),
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function onExpired() {
      setUser(null);
      setBranches([]);
      setCurrentBranchState(null);
      navigate("/login", { replace: true });
    }

    // ProtectedRoute sees the flag and redirects to /change-password
    function onMustChange() {
      setUser(getUser());
    }

    // api.js removed a branch the server rejected: reload the list
    // (getCurrentBranch falls back to another branch, or null)
    function onBranchInvalid() {
      setBranches(getBranches());
      setCurrentBranchState(getCurrentBranch());
    }

    window.addEventListener("auth:expired", onExpired);
    window.addEventListener("auth:must-change-password", onMustChange);
    window.addEventListener("auth:branch-invalid", onBranchInvalid);

    return () => {
      window.removeEventListener("auth:expired", onExpired);
      window.removeEventListener("auth:must-change-password", onMustChange);
      window.removeEventListener("auth:branch-invalid", onBranchInvalid);
    };
  }, [navigate]);

  function handleLoginSuccess() {
    // The /login route sees the new user and redirects
    setUser(getUser());
    setBranches(getBranches());
    setCurrentBranchState(getCurrentBranch());
  }

  function handleLogout() {
    logout();
    setUser(null);
    setBranches([]);
    setCurrentBranchState(null);
    navigate("/login", { replace: true });
  }

  function handleBranchChange(branchId) {
    if (branchId === currentBranch?.id) return;
    setCurrentBranch(branchId); // saved, so the next requested sends the new X-Branch_Id
    setCurrentBranchState(getCurrentBranch());
  }

  // Page to open after login. Never return to /change-password:
  // forced users are sent there anyway, and after a successful change
  // the user should land on the home page.
  const from = location.state?.from;
  const afterLogin =
    from && from !== "/change-password" && from !== "/login"
      ? from
      : "/dashboard";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar
        lang={lang}
        setLang={setLang}
        user={user}
        onLogout={handleLogout}
        branches={branches}
        currentBranch={currentBranch}
        onBranchChange={handleBranchChange}
      />

      {/* key: switching branch remounts the pages so they reload data for the new branch */}
      <main key={currentBranch?.id ?? "no-branch"}>
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
              path="/dashboard"
              element={
                <DashboardPage
                  lang={lang}
                  user={user}
                  currentBranch={currentBranch}
                />
              }
            />
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
