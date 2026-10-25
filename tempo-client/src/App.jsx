import React, { useState } from "react";
import { getUser, logout } from "./lib/auth.js";
import Navbar from "./components/Navbar";
import HomePage from "../src/pages/public/HomePage.jsx";
import StaffLoginPage from "./components/StaffLoginPage";
import ChangePasswordPage from "./components/ChangePasswordPage";

export default function App() {
  const [lang, setLang] = useState("th");
  const [user, setUser] = useState(getUser());
  const [currentRoute, setCurrentRoute] = useState("home");

  function handleLoginSuccess() {
    setUser(getUser());
    setCurrentRoute("home");
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
            onDone={() => setCurrentRoute("login")}
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
        return <HomePage lang={lang} onNavigate={setCurrentRoute} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar
        lang={lang}
        setLang={setLang}
        onNavigate={setCurrentRoute}
        user={user}
        onLogout={handleLogout}
      />

      <main>{renderPage()}</main>
    </div>
  );
}
