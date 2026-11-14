import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BranchForm from "../../../components/BranchForm.jsx";
import { getBranchError } from "../../../lib/branchErrors.js";
import { branchName } from "../../../lib/userLabels.js";
import { createBranch } from "../../../services/adminBranches.js";

const TEXT = {
  th: {
    back: "⬅️ กลับไปหน้ารายชื่อสาขา",
    title: "เพิ่มสาขาใหม่",
    note: "เมื่อเพิ่มสาขาแล้วคุณสามารถเพิ่มห้องเรียน/โซนได้จากหน้ารายชื่อสาขา",
    save: "สร้างสาขาใหม่",
    successTitle: "สร้างสาขาใหม่สำเร็จ",
    successMessage:
      "สร้างสาขาใหม่แล้ว คุณสามารถสร้าง-จัดการห้องเรียน/โซนให้กับสาขาได้",
    closeButton: "รับทราบ-กลับไปหน้ารายชื่อสาขา",
  },
  en: {
    back: "⬅️ Back to branches",
    title: "Add new branch",
    note: "After create a branch, you can configure its zones and classroom from the branch list.",
    save: "Create branch",
    successTitle: "Branch created successfully",
    successMessage:
      "The branch has been created, You can now manage its zones and classroom.",
    closeButton: "Got it, back to branch list",
  },
};

export default function BranchCreatePage({ lang }) {
  const t = TEXT[lang];
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdBranch, setCreatedBranch] = useState(null);

  async function handleSubmit(values) {
    setSubmitting(true);
    setSubmitError("");
    try {
      const data = await createBranch(values);
      setCreatedBranch(data.branch || values);
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
      <p className="text-sm text-slate-400 mt-1 mb-6">{t.note}</p>

      <BranchForm
        lang={lang}
        submitting={submitting}
        error={submitError}
        submitLabel={t.save}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/branches")}
      />

      {/* Confirm Modal */}
      {createdBranch && (
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
                  {createdBranch.code}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 mb-5 text-xs text-slate-200 leading-relaxed">
              <p className="font-semibold text-amber-400 mb-1">
                {branchName(createdBranch, lang)}
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
