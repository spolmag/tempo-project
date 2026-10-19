import React, { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/public/HomePage";
import StaffLoginPage from "./components/StaffLoginPage";

export default function App() {
  const [lang, setLang] = useState("th");
  const [currentRoute, setCurrentRoute] = useState("home");

  // Simple view switcher
  const renderPage = () => {
    switch (currentRoute) {
      case "home":
        return <HomePage lang={lang} onNavigate={setCurrentRoute} />;
      case "courses":
        return <div>Courses Page</div>;
      case "products":
        return <div>Products Page</div>;
      case "about":
        return <div>About Page</div>;
      case "login":
        return <StaffLoginPage lang={lang} />;
      default:
        return <HomePage lang={lang} onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Navbar */}
      <Navbar lang={lang} setLang={setLang} onNavigate={setCurrentRoute} />
      {/* Dynamic Page Content */}
      <main>{renderPage()}</main>
    </div>
  );
}
