import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ZoneForm from "../../../components/ZoneForm.jsx";
import ActionModal from "../../../components/ActionModal.jsx";
import { getZoneError } from "../../../lib/zoneErrors.js";
import { branchName, zoneName } from "../../../lib/userLabels.js";
import { getZone, updateZone } from "../../../services/adminZones.js";

const TEXT = {
  th: {
    back: "⬅️ กลับไปหน้าโซนของสาขา",
    title: "แก้ไขข้อมูลโซน / ห้องเรียน",
    save: "บันทึก",
    loading: "กำลังโหลด...",
    successTitle: "บันทึกการแก้ไขโซนสำเร็จ",
    successMessage: "ข้อมูลโซนอัพเดทในระบบแล้ว",
    closeButton: "รับทราบ - กลับไปหน้าโซน",
  },
  en: {
    back: "⬅️ Back to branch zones",
    title: "Edit zone / room",
    save: "Save changes",
    loading: "Loading...",
    successTitle: "Changes saved successfully",
    successMessage: "The zone information has been updated.",
    closeButton: "Got it, back to zones",
  },
};

function toFormValues(z) {
  return {
    code: z.code ?? "",
    nameTh: z.nameTh ?? "",
    nameEn: z.nameEn ?? "",
    type: z.type ?? "CLASSROOM",
    parentId: z.parentId ?? "",
    maxCapacity: z.maxCapacity ?? "",
    description: z.description ?? "",
  };
}

export default function ZoneEditPage({ lang }) {
  const t = TEXT[lang];
  const { branchId, zoneId } = useParams();
  const navigate = useNavigate();

  const [target, setTarget] = useState(null);
  const [availableZones, setAvailableZones] = useState([]);
  const [zoneTypes, setZoneTypes] = useState(undefined);
  const [loadError, setLoadError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [updatedZone, setUpdatedZone] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getZone(zoneId)
      .then((data) => {
        if (!cancelled) {
          setTarget(data.zone);
          setAvailableZones(data.mainZones ?? []);
          if (data.zoneTypes) setZoneTypes(data.zoneTypes);
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getZoneError(err, lang));
      });
    return () => {
      cancelled = true;
    };
  }, [zoneId, lang]);

  async function handleSubmit(values) {
    setSubmitting(true);
    setSubmitError("");
    try {
      const data = await updateZone(zoneId, values);
      setUpdatedZone(data.zone || { ...target, ...values });
    } catch (err) {
      setSubmitError(getZoneError(err, lang));
    } finally {
      setSubmitting(false);
    }
  }

  function handleCloseSuccess() {
    navigate(`/admin/branches/${branchId}/zones`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to={`/admin/branches/${branchId}/zones`}
        className="text-xs text-slate-400 hover:text-amber-400 transition"
      >
        {t.back}
      </Link>
      <h1 className="text-2xl font-bold text-slate-100 mt-3">{t.title}</h1>
      {target && (
        <p className="text-sm text-slate-400 mt-1">
          {target.branch && (
            <span className="text-amber-400 font-medium">
              {target.branch.code} ({branchName(target.branch, lang)}) •{" "}
            </span>
          )}
          {target.code} — {zoneName(target, lang)}
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
        <ZoneForm
          key={target.id}
          lang={lang}
          currentZoneId={target.id}
          initialValues={toFormValues(target)}
          availableZones={availableZones}
          zoneTypes={zoneTypes}
          submitting={submitting}
          error={submitError}
          submitLabel={t.save}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/admin/branches/${branchId}/zones`)}
        />
      )}

      <ActionModal
        open={Boolean(updatedZone)}
        variant="success"
        title={t.successTitle}
        badge={updatedZone?.code}
        heading={zoneName(updatedZone, lang)}
        message={t.successMessage}
        confirmLabel={t.closeButton}
        onConfirm={handleCloseSuccess}
      />
    </div>
  );
}
