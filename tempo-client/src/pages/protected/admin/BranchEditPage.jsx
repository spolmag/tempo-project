import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BranchForm from "../../../components/BranchForm.jsx";
import { getBranchError } from "../../../lib/branchErrors.js";
import { branchName } from "../../../lib/userLabels.js";
import { getBranch, updateBranch } from "../../../services/adminBranches.js";

const TEXT = {
  th: {
    back: "⬅️ กลับไปหน้ารายชื่อสาขา",
    title: "แก้ไขข้อมูลสาขา",
    save: "บันทึก",
    loading: "กำลังโหลด...",
    successTitle: "บันทึกการแก้ไขข้อมูลสำเร็จ",
    successMessage: "อัพเดทข้อมูลสาขาเรียบร้อยแล้ว",
    closeButton: "รับทราบ - กลับไปหน้ารายชื่อสาขา",
  },
  en: {
    back: "⬅️ Back to branches",
    title: "Edit branch",
    save: "Save changes",
    loading: "Loading...",
    successTitle: "Changes saved successfully",
    successMessage: "The branch information has been updated.",
    closeButton: "Got it, back to branch list",
  },
};

function toFormValues(b) {
  return {
    code: b.code ?? "",
    nameTh: b.nameTh ?? "",
    nameEn: b.nameEn ?? "",
    phone: b.phone ?? "",
    addressTh: b.addressTh ?? "",
    addressEn: b.addressEn ?? "",
    taxId: b.taxId ?? "",
    taxBranchNo: b.taxBranchNo ?? "",
    isVatRegistered: Boolean(b.isVatRegistered),
  };
}

export default function BranchEditPage({ lang }) {
  const t = TEXT[lang];
  const { id } = useParams();
  const navigate = useNavigate();

  const [target, setTarget] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [updatedBranch, setUpdatedBranch] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getBranch(id)
      .then((data) => {
        if (!cancelled) setTarget(data.branch);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getBranchError(err, lang));
      });
    return () => {
      cancelled = true;
    };
  }, [id, lang]);

  async function handleSubmit(values) {
    setSubmitting(true);
    setSubmitError("");
    try {
      const data = await updateBranch(id, values);
      setUpdatedBranch(data.branch || { ...target, ...values });
    } catch (err) {
      setSubmitError(getBranchError(err, lang));
    } finally {
      setSubmitting(false);
    }
  }

  function handleCloseSuccess() {
    navigate("/admin/branches");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/admin/branches"
        className="text-xs text-slate-400 hover:text-amber-400 transition"
      >
        {t.back}
      </Link>
      <h1 className="text-2xl font-bold text-slate-100 mt-3">{t.title}</h1>
      {target && (
        <p className="text-sm text-slate-400 mt-1">
          {target.code} — {branchName(target, lang)}
        </p>
      )}
      <div className="mb-6" />

      {loadError ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3">
          {loadError}
        </div>
      ) : !target ? (
        <p className="text-slate-500">{t.loading}</p>
      ) : (
        <BranchForm
          key={target.id}
          lang={lang}
          initialValues={toFormValues(target)}
          submitting={submitting}
          error={submitError}
          submitLabel={t.save}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/branches")}
        />
      )}

      {/* Confirmation Modal */}
      {updatedBranch && (
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
                  {updatedBranch.code}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 mb-5 text-xs text-slate-200 leading-relaxed">
              <p className="font-semibold text-amber-400 mb-1">
                {branchName(updatedBranch, lang)}
              </p>
              <p>{t.successMessage}</p>
            </div>

            <button
              type="button"
              onClick={handleCloseSuccess}
              className="w-full py-2.5 rounded-full text-sm font-bold text-slate-950 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-400 transition"
            >
              {t.closeButton}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
