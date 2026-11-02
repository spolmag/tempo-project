import React, { useState } from "react";
import { login } from "../lib/auth.js";
import { useNavigate } from "react-router-dom";

export default function StaffLoginPage({ lang = "th", onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");
  const navigate = useNavigate();

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
      successMsg: "เข้าสู่ระบบสำเร็จ กรุณารอหน้าถัดไป...",
      errorMsg: "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
      helpText: "ลืมรหัสผ่านหรือต้องการความช่วยเหลือ ติดต่อแอดมินระบบ",
      requiredError: "กรุณากรอกข้อมูลให้ครบถ้วน",
      disabledMsg: "บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อแอดมินระบบ",
      serverErrorMsg: "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง",
      networkErrorMsg: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง",
      mustChangeMsg:
        "เข้าสู่ระบบสำเร็จ เนื่องจากคุณใช้รหัสผ่านชั่วคราว กรุณาเปลี่ยนรหัสผ่านก่อนใช้งานต่อ...",
    },
    en: {
      badge: "INTERNAL PORTAL",
      title: "Staff Sign In",
      subTitle: "Please sign in with your user email and password.",
      emailLabel: "Email",
      passwordLabel: "Password",
      placeholderEmail: "staff@tempo.com",
      placeholderPassword: "••••••••",
      submitBtn: "Sign In",
      submittingBtn: "Signing in...",
      successMsg: "Signed in successfully, please wait...",
      errorMsg: "Invalid email or password. Please try again.",
      helpText: "Forgot password or need assistance? Contact system admin.",
      requiredError: "Please fill out all fields.",
      disabledMsg:
        "This account has been disabled. Please contact the system admin.",
      serverErrorMsg: "Something went wrong. Please try again.",
      networkErrorMsg: "Cannot connect to server, Please try again",
      mustChangeMsg:
        "Signed in successfully, You must change your temporary password before continuing.",
    },
  }[lang];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setWarning("");

    if (!email || !password) {
      setError(t.requiredError);
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password); // Calls auth.js login

      if (user?.mustChangePassword) {
        setWarning(t.mustChangeMsg);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(user); // Notify App.jsx to update user state & redirect
        }, 2000); // Gives 2 seconds for the user to read the warning
      } else {
        setSuccess(t.successMsg);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(user);
        }, 1500);
      }
    } catch (err) {
      setError(err.message || t.errorMsg);
    } finally {
      setLoading(false);
    }
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

          {warning && (
            <div className="mb-5 bg-amber-950/50 border border-amber-800/60 text-amber-300 text-sm p-3 rounded-xl text-center">
              {warning}
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
