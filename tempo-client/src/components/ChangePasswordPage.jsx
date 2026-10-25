import React, { useState } from "react";
import { changePassword } from "../lib/auth.js";

const MIN_LENGTH = 8; //Keep in sync with the backend rule

export default function ChangePasswordPage({
  lang = "th",
  onDone,
  onSessionExpired,
  onLogout,
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const t = {
    th: {
      badge: "บัญชีของฉัน",
      title: "เปลี่ยนรหัสผ่าน",
      subTitle: "กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่",
      currentLabel: "รหัสผ่านปัจจุบัน",
      newLabel: "รหัสผ่านใหม่",
      confirmLabel: "ยืนยันรหัสผ่านใหม่",
      hint: `อย่างน้อย ${MIN_LENGTH} ตัวอักษร`,
      placeholder: "••••••••",
      submitBtn: "เปลี่ยนรหัสผ่าน",
      submittingBtn: "กำลังบันทึก...",
      cancelBtn: "ยกเลิก",
      successMsg: "เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่",
      requiredError: "กรุณากรอกข้อมูลให้ครบถ้วน",
      weakError: `รหัสผ่านใหม่ต้องมีอย่างน้อย ${MIN_LENGTH} ตัวอักษร`,
      mismatchError: "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน",
      sameError: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสปัจจุบัน",
      wrongCurrentError: "รหัสผ่านปัจจุบันไม่ถูกต้อง",
      sessionExpireError: "เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง",
      serverErrorMsg: "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง",
    },
    en: {
      badge: "MY ACCOUNT",
      title: "Change Password",
      subTitle: "Enter your current password and new password.",
      currentLabel: "Current Password",
      newLabel: "New Password",
      confirmLabel: "Confirm New Password",
      hint: `At least ${MIN_LENGTH} characters`,
      placeholder: "••••••••",
      submitBtn: "Change Password",
      submittingBtn: "Saving...",
      cancelBtn: "Cancel",
      successMsg:
        "Password changed successfully, Please re-login with new password.s",
      requiredError: "Please fill out all fields.",
      weakError: `New password must be at least ${MIN_LENGTH} characters.`,
      mismatchError: "New password and confirmation do not match.",
      sameError: "New password must be different from the current password.",
      wrongCurrentError: "Current password is incorrect.",
      sessionExpireError: "Your session has expired. Please sign in again.",
      serverErrorMsg: "Something went wrong. Please try again.",
    },
  }[lang];

  const fields = [
    {
      id: "current",
      label: t.currentLabel,
      value: currentPassword,
      onChange: setCurrentPassword,
      autoComplete: "current-password",
    },
    {
      id: "new",
      label: t.newLabel,
      value: newPassword,
      onChange: setNewPassword,
      autoComplete: "new-password",
      hint: t.hint,
    },
    {
      id: "confirm",
      label: t.confirmLabel,
      value: confirmPassword,
      onChange: setConfirmPassword,
      autoComplete: "new-password",
    },
  ];

  function getErrorMessage(err) {
    if (err.status === 401) return t.sessionExpireError;
    switch (err.code) {
      case "WRONG_CURRENT_PASSWORD":
        return t.wrongCurrentError;
      case "WEAK_PASSWORK":
        return t.weakError;
      case "SAME_PASSWORD":
        return t.sameError;
      case "MISSING_FIELDS":
        return t.requiredError;
      default:
        return t.serverErrorMsg; // 500 or server can't br reached
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Quick check in browser. The backend checks again.
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t.requiredError);
      return;
    }
    if (newPassword.length < MIN_LENGTH) {
      setError(t.weakError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t.mismatchError);
      return;
    }
    if (newPassword === currentPassword) {
      setError(t.sameError);
      return;
    }

    setLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(t.successMsg);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        if (onLogout) onLogout();
        if (onDone) onDone();
      }, 1800);
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);

      // Token expired or invalid: log the user out so the navbar is correct
      if (err.status === 401) {
        setTimeout(() => {
          if (onSessionExpired) onSessionExpired();
        }, 1800);
      }
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

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {fields.map((f) => (
            <div key={f.id}>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                {f.label} <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="password"
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                placeholder={t.placeholder}
                autoComplete={f.autoComplete}
                disabled={!!success}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition"
              />
              {f.hint && (
                <p className="text-[11px] text-slate-500 mt-1.5">{f.hint}</p>
              )}
            </div>
          ))}

          {error && (
            <div className="bg-red-950/50 border border-red-800/60 text-red-300 text-sm p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-sm p-3 rounded-xl text-center">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-amber-500/10 disabled:opacity-60"
          >
            {loading && !success ? t.submittingBtn : t.submitBtn}
          </button>

          <button
            type="button"
            onClick={() => onDone && onDone()}
            disabled={loading && !!success}
            className="w-full text-sm text-slate-400 hover:text-slate-200 transition"
          >
            {t.cancelBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
