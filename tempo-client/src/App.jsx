import React, { useState, useEffect } from "react";
import { getUser, logout } from "./lib/auth.js";
import Navbar from "./components/Navbar";
import HomePage from "../src/pages/public/HomePage.jsx";
import StaffLoginPage from "./components/StaffLoginPage";
import ChangePasswordPage from "./components/ChangePasswordPage";

export default function App() {
  const [lang, setLang] = useState("th");
  const [user, setUser] = useState(getUser());
  const [currentRoute, setCurrentRoute] = useState(() =>
    getUser()?.mustChangePassword ? "change-password" : "home",
  );

  useEffect(() => {
    function onExpired() {
      setUser(null);
      setCurrentRoute("login");
    }

    function onMustChange() {
      setUser(getUser());
      setCurrentRoute("change-password");
    }

    window.addEventListener("auth:expired", onExpired);
    window.addEventListener("auth:must-change-password", onMustChange);

    return () => {
      window.removeEventListener("auth:expired", onExpired);
      window.removeEventListener("auth:must-change-password", onMustChange);
    };
  }, []);

  function handleLoginSuccess() {
    const u = getUser();
    setUser(u);
    setCurrentRoute(u?.mustChangePassword ? "change-password" : "home");
  }

  // Users who must change their password can't open other pages
  function navigate(route) {
    if (user?.mustChangePassword && route !== "change-password") return;
    setCurrentRoute(route);
  }

  function handleLogout() {
    logout();
    setUser(null);
    setCurrentRoute("login");
  }

  function renderPage() {
    switch (currentRoute) {
      case "login":
        return (
          <StaffLoginPage lang={lang} onLoginSuccess={handleLoginSuccess} />
        );

      case "change-password":
        if (!user) {
          return (
            <StaffLoginPage lang={lang} onLoginSuccess={handleLoginSuccess} />
          );
        }
        return (
          <ChangePasswordPage
            lang={lang}
            forced={!!user.mustChangePassword}
            onDone={() => setCurrentRoute("login")}
            onCancel={() => setCurrentRoute("home")}
            onLogout={handleLogout}
          />
        );

      case "courses":
        return (
          <div className="p-12 text-center text-slate-100">
            <h1 className="text-3xl font-bold mb-4">
              {lang === "th" ? "คอร์สเรียน" : "Courses"}
            </h1>
            <p className="text-slate-400">Courses content goes here.</p>
          </div>
        );

      case "products":
        return (
          <div className="p-12 text-center text-slate-100">
            <h1 className="text-3xl font-bold mb-4">
              {lang === "th" ? "สินค้า" : "Products"}
            </h1>
            <p className="text-slate-400">Products content goes here.</p>
          </div>
        );

      case "about":
        return (
          <div className="p-12 text-center text-slate-100">
            <h1 className="text-3xl font-bold mb-4">
              {lang === "th" ? "เกี่ยวกับเรา" : "About Us"}
            </h1>
            <p className="text-slate-400">About content goes here.</p>
          </div>
        );

      case "home":
      default:
        return <HomePage lang={lang} onNavigate={navigate} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar
        lang={lang}
        setLang={setLang}
        onNavigate={navigate}
        user={user}
        onLogout={handleLogout}
      />

      <main>{renderPage()}</main>
    </div>
  );
}
