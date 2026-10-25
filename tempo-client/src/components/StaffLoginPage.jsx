import React, { useState } from "react";
import { login } from "../lib/auth.js";

export default function StaffLoginPage({ lang = "th", onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const t = {
    th: {
      badge: "ระบบจัดการงานสาขา",
      title: "เข้าสู่ระบบสำหรับพนักงาน",
      subTitle: "กรุณาระบุอีเมลและรหัสผ่าน",
      emailLabel: "อีเมล",
      passwordLabel: "รหัสผ่าน",
      placeholderEmail: "staff@tempo.com",
      placeholderPassword: "••••••••",
      submitBtn: "เข้าสู่ระบบ",
      submittingBtn: "กำลังเข้าสู่ระบบ...",
      successMsg: "เข้าสู่ระบบสำเร็จ กำลังเข้าหน้าการจัดการสาขา...",
      errorMsg: "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
      helpText: "ลืมรหัสผ่านหรือต้องการความช่วยเหลือ ติดต่อแอดมินระบบ",
      requiredError: "กรุณากรอกข้อมูลให้ครบถ้วน",
      disabledMsg: "บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อแอดมินระบบ",
      serverErrorMsg: "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง",
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
      submittingBtn: "Signing in...",
      successMsg: "Login seccessful! Redirecting to main staff dashboard....",
      errorMsg: "Invalid email or password. Please try again.",
      helpText: "Forgot password or need assistance? Contact system admin.",
      requiredError: "Please fill out all field.",
      disabledMsg:
        "This account has been disabled. Please contact the system admin.",
      serverErrorMsg: "Something went wrong. Please try again.",
    },
  }[lang];

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError(t.requiredError);
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      setSuccess(t.successMsg);

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.href = "/";
        }
      }, 1800);
    } catch (err) {
      if (err.status === 401) {
        setError(t.errorMsg);
      } else if (err.status === 403) {
        setError(t.disabledMsg);
      } else {
        setError(t.serverErrorMsg); // 500, or the server can't be reached
      }

      setLoading(false);
    }
  }

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

        <form onSubmit={handleLogin} noValidate className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
              {t.emailLabel} <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.placeholderEmail}
              disabled={success}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
              {t.passwordLabel}
              <span className="text-red-500 font-bold"> *</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.placeholderPassword}
              disabled={success}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {error && (
            <div className="mb-5 bg-red-950/50 border border-red-800/60 text-red-300 text-sm p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-sm p-3 rounded-xl text-center">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-amber-500/10"
          >
            {loading && !success ? t.submittingBtn : t.submitBtn}
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
