import { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import ZoneForm from "../../../components/ZoneForm.jsx";
import ActionModal from "../../../components/ActionModal.jsx";
import { getZoneError } from "../../../lib/zoneErrors.js";
import { branchName, zoneName } from "../../../lib/userLabels.js";
import { listBranchZones, createZone } from "../../../services/adminZones.js";

const TEXT = {
  th: {
    back: "⬅️ กลับไปหน้าโซนของสาขา",
    title: "เพิ่มโซน / ห้องเรียน",
    note: "สร้างโซนหลัก หรือโซนย่อยภายใต้โซนหลัก",
    save: "สร้างโซนใหม่",
    loading: "กำลังโหลด...",
    successTitle: "สร้างโซนใหม่เรียบร้อยแล้ว",
    successMessage: "บันทึกข้อมูลโซนลงในสาขาแล้ว",
    closeButton: "รับทราบ - กลับไปหน้าโซน",
  },
  en: {
    back: "⬅️ Back to branch zones",
    title: "Add new zone / room",
    note: "Create a top level main zone or nest multi-level subzones.",
    save: "Create zone",
    loading: "Loading...",
    successTitle: "Zone created successfully",
    successMessage: "The new zone has been save to the branch.",
    closeButton: "Got it, back to zones",
  },
};

export default function ZoneCreatePage({ lang }) {
  const t = TEXT[lang];
  const { branchId } = useParams();
  const [searchParams] = useSearchParams();
  const initialParentId = searchParams.get("parentId") || "";
  const navigate = useNavigate();

  const [branch, setBranch] = useState(null);
  const [zones, setZones] = useState([]);
  const [zoneTypes, setZoneTypes] = useState(undefined);
  const [loadError, setLoadError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdZone, setCreatedZone] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listBranchZones(branchId)
      .then((data) => {
        if (!cancelled) {
          setBranch(data.branch);
          setZones(data.zones ?? []);
          if (data.zoneTypes) setZoneTypes(data.zoneTypes);
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getZoneError(err, lang));
      });
    return () => {
      cancelled = true;
    };
  }, [branchId, lang]);

  async function handleSubmit(values) {
    setSubmitting(true);
    setSubmitError("");
    try {
      const data = await createZone(branchId, values);
      setCreatedZone(data.zone || values);
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
      {branch && (
        <p className="text-sm text-amber-400 font-medium mt-1">
          {branch.code} — {branchName(branch, lang)}
        </p>
      )}
      <p className="text-sm text-slate-400 mt-1 mb-6">{t.note}</p>

      {loadError ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3">
          {loadError}
        </div>
      ) : !branch ? (
        <p className="text-slate-500">{t.loading}</p>
      ) : (
        <ZoneForm
          lang={lang}
          initialValues={{ parentId: initialParentId }}
          availableZones={zones}
          zoneTypes={zoneTypes}
          submitting={submitting}
          error={submitError}
          submitLabel={t.save}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/admin/branches/${branchId}/zones`)}
        />
      )}

      <ActionModal
        open={Boolean(createdZone)}
        variant="success"
        title={t.successTitle}
        badge={createdZone?.code}
        heading={zoneName(createdZone, lang)}
        message={t.successMessage}
        confirmLabel={t.closeButton}
        onConfirm={handleCloseSuccess}
      />
    </div>
  );
}
