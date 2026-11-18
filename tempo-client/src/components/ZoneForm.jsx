import { useState, useMemo } from "react";
import { zoneName, zoneTypeLabel } from "../lib/userLabels.js";
import { buildTreeList, getDescendantId } from "../lib/tree.js";

const TEXT = {
  th: {
    infoSection: "ข้อมูลโซน / ห้องเรียน",
    code: "รหัสโซน",
    codePlaceHolder: "ต.ย. PIANO1, SHOWROOM, RECEPTION",
    type: "ประเภทโซน",
    nameTh: "ชื่อโซน (ไทย)",
    nameEn: "ชื่อโซน (อังกฤษ)",
    parentId: "โซนหลัก (กรณีโซนนี้เป็นโซนย่อย)",
    noParent: "เป็นโซนหลักระดับบนสุด (ไม่เป็นโซนย่อยของโซนอื่น)",
    maxCapacity: "จำนวนนักเรียนสูงสุด / คลาส",
    maxCapacityHint: "เว้นว่างได้ กรณีที่เป็นโซนหลัก",
    description: "รายละเอียดเพิ่มเติม",
    descriptionPlaceHolder: "ต.ย. ห้องเรียนเปียโนเดี่ยว Yamaha U1...",
    cancel: "ยกเลิก",
    saving: "กำลังบันทึก...",
    requiredError: "กรุณาระบุรหัสโซน ชื่อโซน (ไทย) ชื่อโซน (อังกฤษ)",
  },
  en: {
    infoSection: "Zone / Room information",
    code: "Zone code",
    codePlaceHolder: "e.g. PIANO1, SHOWROOM, RECEPTION",
    type: "Zone type",
    nameTh: "Zone name (Thai)",
    nameEn: "Zone name (English)",
    parentId: "Parent zone (if this is a sub zone)",
    noParent: "-Top-Level Main zone (No parent)",
    maxCapacity: "Max student capacity",
    maxCapacityHint:
      "Leave blank if this is a parent zone divided into sub-rooms",
    description: "Description / Details",
    descriptionPlaceHolder: "e.g. Individual piano classroom with Yamaha U1...",
    cancel: "Cancel",
    saving: "Saving...",
    requiredError: "Please fill in zone code, Thai name, and English name",
  },
};

const EMPTY = {
  code: "",
  nameTh: "",
  nameEn: "",
  type: "CLASSROOM",
  parentId: "",
  maxCapacity: "",
  description: "",
};

const inputClass =
  "w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 disabled:opacity-50";

function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-400 mb-1.5">
        {label}
        {required && <span className="text-amber-400"> *</span>}
      </span>
      {children}
      {hint && (
        <span className="block text-[11px] text-slate-500 mt-1">{hint}</span>
      )}
    </label>
  );
}

export default function ZoneForm({
  lang,
  currentZoneId = null,
  initialValues,
  availableZones = [],
  zoneTypes = [
    "CLASSROOM",
    "RECEPTION",
    "SHOWROOM",
    "STOCK_ROOM",
    "OFFICE",
    "OTHER",
  ],
  submitting,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const t = TEXT[lang];
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [localError, setLocalError] = useState("");

  // Build hierarchical parent options, excluding currentZoneId and its descenfants
  const parentOptions = useMemo(() => {
    const excluded = getDescendantId(availableZones, currentZoneId);
    const allowed = availableZones.filter((z) => !excluded.has(z.id));
    return buildTreeList(allowed);
  }, [availableZones, currentZoneId]);

  function setField(e) {
    const { name, value } = e.target;
    setValues((v) => ({
      ...v,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");

    if (!values.code.trim() || !values.nameTh.trim() || !values.nameEn.trim()) {
      setLocalError(t.requiredError);
      return;
    }

    onSubmit({
      ...values,
      parentId: values.parentId || null,
      maxCapacity:
        values.type === "CLASSROOM" && values.maxCapacity !== ""
          ? Number(values.maxCapacity)
          : null,
    });
  }

  const showError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-xs font-bold tracking-wider uppercase text-amber-400">
          {t.infoSection}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t.code} required>
            <input
              name="code"
              value={values.code}
              onChange={setField}
              placeholder={t.codePlaceHolder}
              className={`${inputClass} uppercase`}
            />
          </Field>
          <Field label={t.type} required>
            <select
              name="type"
              value={values.type}
              onChange={setField}
              className={inputClass}
            >
              {zoneTypes.map((zt) => (
                <option key={zt} value={zt}>
                  {zoneTypeLabel(zt, lang)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.nameTh} required>
            <input
              name="nameTh"
              value={values.nameTh}
              onChange={setField}
              className={inputClass}
            />
          </Field>
          <Field label={t.nameEn} required>
            <input
              name="nameEn"
              value={values.nameEn}
              onChange={setField}
              className={inputClass}
            />
          </Field>
          <Field label={t.parentId}>
            <select
              name="parentId"
              value={values.parentId}
              onChange={setField}
              className={inputClass}
            >
              <option value="">{t.noParent}</option>
              {parentOptions.map((pz) => (
                <option key={pz.id} value={pz.id}>
                  {"\u00A0\u00A0".repeat(pz.depth)}
                  {pz.depth > 0 ? "↳ " : ""}
                  {pz.code} - {zoneName(pz, lang)}
                </option>
              ))}
            </select>
          </Field>
          {values.type === "CLASSROOM" && (
            <Field label={t.maxCapacity} hint={t.maxCapacityHint}>
              <input
                type="number"
                min="1"
                step="1"
                name="maxCapacity"
                value={values.maxCapacity}
                onChange={setField}
                className={inputClass}
              />
            </Field>
          )}
        </div>

        <Field label={t.description}>
          <textarea
            rows={2}
            name="description"
            value={values.description}
            onChange={setField}
            placeholder={t.descriptionPlaceHolder}
            className={inputClass}
          />
        </Field>
      </section>

      {showError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3">
          {showError}
        </div>
      )}

      {/* Action */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-300 border border-slate-700 hover:border-slate-500 transition"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-slate-950 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition"
        >
          {submitting ? t.saving : submitLabel}
        </button>
      </div>
    </form>
  );
}
