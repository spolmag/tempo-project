import React, { useState } from "react";

export default function Navbar({ lang, setLang, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = {
    th: {
      home: "หน้าแรก",
      courses: "คอร์สเรียน",
      products: "สินค้า",
      about: "เกี่ยวกับเรา",
      login: "สำหรับพนักงาน",
    },
    en: {
      home: "Home",
      courses: "Courses",
      products: "Products",
      about: "About",
      login: "Staff Protal",
    },
  }[lang];

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
          <button
            onClick={() => onNavigate("home")}
            className="hover: text-amber-400 transition"
          >
            {t.home}
          </button>
          <button
            onClick={() => onNavigate("courses")}
            className="hover: text-amber-400 transition"
          >
            {t.courses}
          </button>
          <button
            onClick={() => onNavigate("products")}
            className="hover: text-amber-400 transition"
          >
            {t.products}
          </button>
          <button
            onClick={() => onNavigate("about")}
            className="hover: text-amber-400 transition"
          >
            {t.about}
          </button>
        </div>

        {/* Right Area: Language Toggle & Staff login */}
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

          <button
            onClick={() => onNavigate("login")}
            className="bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase shadow-md hover:from-amber-400 hover:to-amber-500 transition"
          >
            {t.login}
          </button>
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
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col gap-4 text-sm">
          <button
            onClick={() => {
              onNavigate("home");
              setMobileMenuOpen(false);
            }}
            className="text-left py-2"
          >
            {t.home}
          </button>
          <button
            onClick={() => {
              onNavigate("courses");
              setMobileMenuOpen(false);
            }}
            className="text-left py-2"
          >
            {t.courses}
          </button>
          <button
            onClick={() => {
              onNavigate("products");
              setMobileMenuOpen(false);
            }}
            className="text-left py-2"
          >
            {t.products}
          </button>
          <button
            onClick={() => {
              onNavigate("about");
              setMobileMenuOpen(false);
            }}
            className="text-left py-2"
          >
            {t.about}
          </button>
          <button
            onClick={() => {
              onNavigate("login");
              setMobileMenuOpen(false);
            }}
            className="text-left py-2"
          >
            {t.login}
          </button>
        </div>
      )}
    </nav>
  );
}
