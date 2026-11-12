import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import UserForm from "../../../components/UserForm.jsx";
import { getFormError } from "../../../lib/userErrors.js";
import {
  getUserFormOptions,
  getUser,
  updateUser,
} from "../../../services/adminUsers.js";
import { userName } from "../../../lib/userLabels.js";

const TEXT = {
  th: {
    back: "⬅️ กลับไปหน้าผู้ใช้งาน",
    title: "แก้ไขข้อมูลผู้ใช้",
    save: "บันทึก",
    loading: "กำลังโหลด...",
    successTitle: "บันทึกการแก้ไขข้อมูลสำเร็จ",
    successMessage: "อัพเดทข้อมูลและสิทธิ์ของผู้ใช้งานเรียบร้อยแล้ว",
    closeButton: "รับทราบ-กลับไปหน้าผู้ใช้งาน",
  },
  en: {
    back: "⬅️ Back to user",
    title: "Edit user",
    save: "Save changes",
    loading: "Loading...",
    successTitle: "Changes saved successfully",
    successMessage:
      "The user's profile and branch access permissions have been updated",
    closeButton: "Got it, back to the user list",
  },
};

// Convert a user from the API into from values ("" instead of null)
function toFormValues(u) {
  return {
    email: u.email ?? "",
    fullNameTh: u.fullNameTh ?? "",
    fullNameEn: u.fullNameEn ?? "",
    role: u.role,
    phone: u.phone ?? "",
    lineId: u.lineId ?? "",
    taxId: u.taxId ?? "",
    dateOfBirth: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : "",
    addressTh: u.addressTh ?? "",
    addressEn: u.addressEn ?? "",
    branchIds: (u.branches ?? []).map((b) => b.id),
  };
}

export default function UserEditPage({ lang, user: me }) {
  const t = TEXT[lang];
  const { id } = useParams();
  const navigate = useNavigate();

  const [options, setOptions] = useState(null);
  const [target, setTarget] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [updatedUser, setUpdatedUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getUserFormOptions(), getUser(id)])
      .then(([opts, data]) => {
        if (cancelled) return;
        setOptions(opts);
        setTarget(data.user);
      })
      .catch((err) => !cancelled && setLoadError(getFormError(err, lang)));
    return () => {
      cancelled = true;
    };
  }, [id, lang]);

  async function handleSubmit(values) {
    setSubmitting(true);
    setSubmitError("");
    try {
      const data = await updateUser(id, values);
      setUpdatedUser(data.user || { ...target, ...values });
    } catch (err) {
      setSubmitError(getFormError(err, lang));
    } finally {
      setSubmitting(false);
    }
  }

  function handleCloseSuccess() {
    navigate("/admin/users");
  }

  // Active branches + any inactive branches this user is still linked to,
  // so saving the form doesn't remove those links silently
  const branches =
    options && target
      ? [
          ...options.branches,
          ...target.branches.filter(
            (b) => !options.branches.some((o) => o.id === b.id),
          ),
        ]
      : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/admin/users"
        className="text-xs text-slate-400 hover:text-amber-400 transition"
      >
        {t.back}
      </Link>
      <h1 className="text-2xl font-bold text-slate-100 mt-3">{t.title}</h1>
      {target && (
        <p className="text-sm text-slate-400 mt-1">{userName(target, lang)}</p>
      )}
      <div className="mb-6" />

      {loadError ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3">
          {loadError}
        </div>
      ) : !options || !target ? (
        <p className="text-slate-500">{t.loading}</p>
      ) : (
        <UserForm
          key={target.id}
          lang={lang}
          initialValues={toFormValues(target)}
          roles={options.roles}
          branches={branches}
          isSelf={target.id === me?.id}
          submitting={submitting}
          error={submitError}
          submitLabel={t.save}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/users")}
        />
      )}

      {/* Confirmation modal */}
      {updatedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/40 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-0 w-0 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-lg font-bold">
                ✓
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  {t.successTitle}
                </h2>
                <p className="text-xs text-emerald-400 font-medium">
                  {updatedUser.email}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 mb-5 text-xs text-slate-200 leading-relaxed">
              <p className="font-semibold text-amber-400 mb-1">
                {userName(updatedUser, lang)}
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
