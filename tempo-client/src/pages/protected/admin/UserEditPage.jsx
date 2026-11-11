import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import UserForm from "../../../components/UserForm.jsx";
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
  },
  en: {
    back: "⬅️ Back to user",
    title: "Edit user",
    save: "Save changes",
    loading: "Loading...",
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

  useEffect(() => {
    let cancelled = false;
    Promise.all([getUserFormOptions(), getUser(id)])
      .then(([opts, data]) => {
        if (cancelled) return;
        setOptions(opts);
        setTarget(data.user);
      })
      .catch((err) => !cancelled && setLoadError(err.message));
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(values) {
    setSubmitting(true);
    setSubmitError("");
    try {
      await updateUser(id, values);
      navigate("/admin/users", { state: { notice: "updated" } });
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
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
      <h1 className="text-2xl font-bold text-slate-100mt-3">{t.title}</h1>
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
    </div>
  );
}
