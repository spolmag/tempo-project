import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserForm from "../../../components/UserForm.jsx";
import { getFormError } from "../../../lib/userErrors.js";
import { userName } from "../../../lib/userLabels.js";
import {
  getUserFormOptions,
  createUser,
} from "../../../services/adminUsers.js";

const TEXT = {
  th: {
    back: "⬅️ กลับไปหน้ารายชื่อผู้ใช้งาน",
    title: "เพิ่มผู้ใช้งานใหม่",
    note: "ผู้ใช้งานใหม่ได้รหัสผ่านแรกเริ่มและจะต้องเปลี่ยนรหัสผ่านเมื่อเข้าใช้งานครั้งแรก",
    save: "สร้างผู้ใช้งานใหม่",
    loading: "กำลังโหลด...",
    successTitle: "สร้างผู้ใช้งานใหม่สำเร็จ",
    successMessage:
      "ผู้ใช้งานใหม่ใช้รหัสผ่านเริ่มต้นในการเข้าใช้งานครั้งแรก และต้องเปลี่ยนรหัสผ่านทันที",
    closeButton: "รับทราบ - กลับไปหน้ารายชื่อผู้ใช้งาน",
  },
  en: {
    back: "⬅️ Back to user",
    title: "Add new user",
    note: "New users get the default password and must change it at first login.",
    save: "Create user",
    loading: "Loading...",
    successTitle: "User created successfully",
    successMessage:
      "New user use default password and must change it at first login",
    closeButton: "Got it, back to user list page",
  },
};

export default function UserCreatePage({ lang }) {
  const t = TEXT[lang];
  const navigate = useNavigate();

  const [options, setOptions] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdUser, setCreatedUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getUserFormOptions()
      .then((data) => !cancelled && setOptions(data))
      .catch((err) => !cancelled && setLoadError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(values) {
    setSubmitting(true);
    setSubmitError("");
    try {
      const data = await createUser(values);
      setCreatedUser(data.user || values);
    } catch (err) {
      setSubmitError(getFormError(err, lang));
    } finally {
      setSubmitting(false);
    }
  }

  function handleCloseSuccess() {
    navigate("/admin/users");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/admin/users"
        className="text-xs text-slate-400 hover:text-amber-400 transition"
      >
        {t.back}
      </Link>
      <h1 className="text-2xl font-bold text-slate-100 mt-3">{t.title}</h1>
      <p className="text-sm text-slate-400 mt-1 mb-6">{t.note}</p>

      {loadError ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3">
          {loadError}
        </div>
      ) : !options ? (
        <p className="text-slate-500">{t.loading}</p>
      ) : (
        <UserForm
          lang={lang}
          roles={options.roles}
          branches={options.branches}
          submitting={submitting}
          error={submitError}
          submitLabel={t.save}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/users")}
        />
      )}

      {/* Confirmation Modal Box */}
      {createdUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/40 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-lg font-bold">
                ✓
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  {t.successTitle}
                </h2>
                <p className="text-xs text-emerald-400 font-medium">
                  {createdUser.email}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 mb-5 text-xs text-slate-200 leading-relaxed">
              <p className="font-semibold text-amber-400 mb-1">
                {userName(createdUser, lang)}
              </p>
              <p>{t.successMessage}</p>
            </div>

            <button
              type="button"
              onClick={handleCloseSuccess}
              className="w-full py-2.5 rounded-full text-sm font-bold text-slate-950 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 transition"
            >
              {t.closeButton}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
