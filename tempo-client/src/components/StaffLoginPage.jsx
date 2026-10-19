import React, { useState, useTransition } from "react";

export default function StaffLoginPage({ lang = "th" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const t = {
    th: {
      badge: "ระบบจัดการภายใน",
      title: "เข้าสู่ระบบสำหรับพนักงาน",
      subTitle: "กรุณาระบุอีเมลและรหัสผ่าน",
      emailLabel: "อีเมล",
      passwordLabel: "รหัสผ่าน",
      placeholderEmail: "staff@tempo.com",
      placeholderPassword: "••••••••",
      submitBtn: "เข้าสู่ระบบ",
      helpText: "ลืมรหัสผ่านหรือต้องการความช่วยเหลือ ติดต่อแอดมินระบบ",
    },
    en: {
      badge: "INTERNAL PORTAL",
      title: "Staff Sign In",
      subTitle: "Please sign with with your user email and password.",
      emailLabel: "Email",
      passwordLabel: "Password",
      placeholderEmail: "staff@tempo.com",
      placeholderPassword: "••••••••",
      submitBtn: "Sign In",
      helpText: "Forgot password or need assistance? Contact system admin.",
    },
  }[lang];

  const handleLogin = (e) => {
    e.preventDefault();
    alert(lang === "th" ? "เข้าสู่ระบบสำเร็จ" : "Login successful");
  };

  return (
    <div className="min-h-[85vh] bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 p-8 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="text-center mb-6">
          <span className="text-amber-400 text-[11px] font-medium tracking-[0.2em] uppercase mb-1.5 block">
            {t.badge}
          </span>
          <h2 className="text-2xl font-bold tracking-wider mb-2">{t.title}</h2>
          <p className="text-slate-400 text-sm">{t.subTitle}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
              {t.emailLabel}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.placeholderEmail}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
              {t.passwordLabel}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.placeholderPassword}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-amber-500/10"
          >
            {t.submitBtn}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-xs text-slate-500 hover:text-slate-400 cursor-pointer transition">
            {t.helpText}
          </span>
        </div>
      </div>
    </div>
  );
}
