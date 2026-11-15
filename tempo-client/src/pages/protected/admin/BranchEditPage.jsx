import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BranchForm from "../../../components/BranchForm.jsx";
import { getBranchError } from "../../../lib/branchErrors.js";
import { branchName } from "../../../lib/userLabels.js";
import { getBranch, updateBranch } from "../../../services/adminBranches.js";
import ActionModal from "../../../components/ActionModal.jsx";

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
      <ActionModal
        open={Boolean(updatedBranch)}
        variant="success"
        title={t.successTitle}
        badge={updatedBranch?.code}
        heading={branchName(updatedBranch, lang)}
        message={t.successMessage}
        confirmLabel={t.closeButton}
        onConfirm={handleCloseSuccess}
      />
    </div>
  );
}
