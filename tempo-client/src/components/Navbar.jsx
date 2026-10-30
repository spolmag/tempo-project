import React, { useState, useEffect, useRef } from "react";

export default function Navbar({ lang, setLang, onNavigate, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const t = {
    th: {
      home: "หน้าแรก",
      courses: "คอร์สเรียน",
      products: "สินค้า",
      about: "เกี่ยวกับเรา",
      login: "สำหรับพนักงาน",
      changePassword: "เปลี่ยนรหัสผ่าน",
      logout: "ออกจากระบบ",
    },
    en: {
      home: "Home",
      courses: "Courses",
      products: "Products",
      about: "About",
      login: "Staff Portal",
      changePassword: "Change Password",
      logout: "Logout",
    },
  }[lang];

  // Key match the values of Prisma Role enum
  const roleLabels = {
    th: {
      ADMIN: "ผู้ดูแลระบบ",
      MANAGER: "ผู้จัดการ",
      STAFF: "เจ้าหน้าที่",
      TEACHER: "ครู",
      STUDENT: "นักเรียน",
      PARENT: "ผู้ปกครอง",
      CUSTOMER: "ลูกค้า",
    },

    en: {
      ADMIN: "Admin",
      MANAGER: "Manager",
      STAFF: "Staff",
      TEACHER: "Teacher",
      STUDENT: "Student",
      PARENT: "Parent",
      CUSTOMER: "Customer",
    },
  }[lang];

  const publicLinks = user?.mustChangePassword
    ? []
    : [
        { id: "home", label: t.home },
        { id: "courses", label: t.courses },
        { id: "products", label: t.products },
        { id: "about", label: t.about },
      ];

  // Name, role by lang
  const displayName = user
    ? (lang === "th" ? user.fullNameTh : user.fullNameEn) ||
      user.fullNameEn ||
      user.fullNameTh ||
      user.email
    : "";
  const rawRole = user ? (user.role ?? user.Role) : "";
  const roleLabel = roleLabels[rawRole] ?? rawRole;

  // Close the desktop user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function go(route) {
    onNavigate(route);
    setMobileMenuOpen(false);
  }

  function handleLogout() {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    onLogout();
  }

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-amber-500/20 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          className="cursor-pointer flex items-center gap-3"
          onClick={() => onNavigate("home")}
        >
          <div className="w-10 h-10 rounded-full bg-linear-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-amber-500/20">
            T
          </div>
          <div>
            <span className="text-lg font-semibold tracking-wider bg-linear-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              TEMPO
            </span>
            <span className="block text-[10px] tracking-widest text-slate-400 uppercase">
              Elite Music
            </span>
          </div>
        </div>

        {/* Desktop navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
          {publicLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => go(link.id)}
              className="hover:text-amber-400 transition"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right Area (Desktop): Language Toggle & Staff login */}
        <div className="hidden md:flex items-center gap-5">
          {/* Language select Button */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-full p-1 text-xs font-semibold">
            <button
              onClick={() => setLang("th")}
              className={`px-3 py-1 rounded-full transition ${lang === "th" ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-white"}`}
            >
              TH
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-full transition ${lang === "en" ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-white"}`}
            >
              EN
            </button>
          </div>

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-full pl-4 pr-3 py-1.5 transition"
              >
                <span className="text-left leading-tight">
                  <span className="block text-xs font-semibold text-slate-100 max-w-40 truncate">
                    {displayName}
                  </span>
                  <span className="block text-[10px] tracking-wider text-amber-400 uppercase">
                    {roleLabel}
                  </span>
                </span>
                <span
                  className={`text-xs text-slate-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                  <button
                    onClick={() => go("change-password")}
                    className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-800 transition"
                  >
                    {t.changePassword}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-800 border-t border-slate-800 transition"
                  >
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => go("login")}
              className="bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase shadow-md hover:from-amber-400 hover:to-amber-500 transition"
            >
              {t.login}
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-full p-0.5 text-[10px] font-semibold">
            <button
              onClick={() => setLang("th")}
              className={`px-2 py-0.5 rounded-full ${lang === "th" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"}`}
            >
              TH
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-0.5 rounded-full ${lang === "en" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"}`}
            >
              EN
            </button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-300 hover:text-white p-2"
            aria-label="Menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu: public links + staff section */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 text-sm">
          {/* Public pages */}
          <div className="px-6 py-3 flex flex-col">
            {publicLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className="text-left py-3"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Staff section */}
          <div className="border-t border-slate-800 bg-slate-950/60 px-6 py-4">
            {user ? (
              <>
                <div className="pb-3 mb-1 border-b border-slate-800">
                  <p className="font-semibold text-slate-100">{displayName}</p>
                  <span className="inline-block mt-1 text-[10px] tracking-wider text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {roleLabel}
                  </span>
                </div>
                <button
                  onClick={() => go("change-password")}
                  className="block w-full text-left py-3 text-slate-200"
                >
                  {t.changePassword}
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-3 text-red-400"
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <button
                onClick={() => go("login")}
                className="w-full bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 py-3 rounded-full text-xs font-bold tracking-wider uppercase"
              >
                {t.login}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
