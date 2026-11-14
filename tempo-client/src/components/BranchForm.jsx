import { useState } from "react";

const TEXT = {
  th: {
    basicInfo: "ข้อมูลพื้นฐาน",
    code: "รหัสสาขา",
    codePlaceholder: "ต.ย. HQ or BKK-01",
    phone: "หมายเลขโทรศัพท์",
    nameTh: "ชื่อสาขา (ไทย)",
    nameEn: "ชื่อสาขา (อังกฤษ)",
    addressTh: "ที่อยู่ (ไทย)",
    addressEn: "ที่อยู่ (อังกฤษ)",
    taxSection: "ข้อมูลภาษีและใบกำกับภาษี",
    taxId: "เลขประจำตัวผู้เสียภาษี (13 หลัก)",
    taxBranchNo: "รหัสสาขาทางภาษี (5 หลัก เช่น 00000)",
    isVatRegistered: "จดทะเบียนภาษีมูลค่าเพิ่ม (VAT)",
    vatHint: "เลือก หากสาขาต้องออกใบเสร็จ-ใบกำกับภาษี",
    cancel: "ยกเลิก",
    saving: "กำลังบันทึก...",
    required: "กรุณาระบุรหัสสาขา, ชื่อสาขา (ไทย) และชื่อสาขา (อังกฤษ)",
    taxIdInvalid: "เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก",
    taxBranchInvalid: "รหัสสาขาทางภาษีต้องเป็นตัวเลข 5 หลัก (ต.ย. 00000)",
  },
  en: {
    basicInfo: "Branch Information",
    code: "Branch Code",
    codePlaceholder: "e.g. HQ or BKK-01",
    phone: "Branch Phone",
    nameTh: "Branch Name (Thai)",
    nameEn: "Branch Name (English)",
    addressTh: "Address (Thai)",
    addressEn: "Address (English)",
    taxSection: "Tax & VAT Information",
    taxId: "Tax ID (13 digits)",
    taxBranchNo: "Tax Branch No. (5 digits, e.g. 00000)",
    isVatRegistered: "VAT Registered",
    vatHint: "Check if this branch issues VAT 7% tax invoices",
    cancel: "Cancel",
    saving: "Saving...",
    required: "Branch code, Thai name, and English name are required",
    taxIdInvalid: "Tax ID must be 13 digits",
    taxBranchInvalid: "Tax branch number must be 5 digits (e.g. 00000)",
  },
};

const EMPTY = {
  code: "",
  nameTh: "",
  nameEn: "",
  phone: "",
  addressTh: "",
  addressEn: "",
  taxId: "",
  taxBranchNo: "",
  isVatRegistered: false,
};

const inputClass =
  "w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60";

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

export default function BranchForm({
  lang,
  initialValues,
  submitting,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const t = TEXT[lang];
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [formError, setFormError] = useState("");

  function setField(e) {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({
      ...v,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const code = values.code.trim().toUpperCase();
    const nameTh = values.nameTh.trim();
    const nameEn = values.nameEn.trim();
    const taxId = values.taxId.trim();
    const taxBranchNo = values.taxBranchNo.trim();

    if (!code || !nameTh || !nameEn) {
      setFormError(t.required);
      return;
    }
    if (taxId && !/^\d{13}$/.test(taxId)) {
      setFormError(t.taxIdInvalid);
      return;
    }
    if (taxBranchNo && !/^\d{5}$/.test(taxBranchNo)) {
      setFormError(t.taxBranchInvalid);
      return;
    }

    onSubmit({
      ...values,
      code,
    });
  }

  const showError = formError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Basic Branch Info */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
          {t.basicInfo}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t.code} required>
            <input
              name="code"
              value={values.code}
              onChange={setField}
              placeholder={t.codePlaceholder}
              className={`${inputClass} uppercase`}
            />
          </Field>
          <Field label={t.phone}>
            <input
              name="phone"
              value={values.phone}
              onChange={setField}
              className={inputClass}
            />
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t.addressTh}>
            <textarea
              name="addressTh"
              rows={2}
              value={values.addressTh}
              onChange={setField}
              className={inputClass}
            />
          </Field>
          <Field label={t.addressEn}>
            <textarea
              name="addressEn"
              rows={2}
              value={values.addressEn}
              onChange={setField}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* Tax & VAT Info */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
          {t.taxSection}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t.taxId}>
            <input
              name="taxId"
              value={values.taxId}
              onChange={setField}
              maxLength={13}
              inputMode="numeric"
              className={inputClass}
            />
          </Field>
          <Field label={t.taxBranchNo}>
            <input
              name="taxBranchNo"
              value={values.taxBranchNo}
              onChange={setField}
              maxLength={5}
              inputMode="numeric"
              className={inputClass}
            />
          </Field>
        </div>

        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 cursor-pointer hover:border-slate-700 transition">
          <input
            type="checkbox"
            name="isVatRegistered"
            checked={values.isVatRegistered}
            onChange={setField}
            className="mt-0.5 accent-amber-500"
          />
          <div>
            <p className="text-sm font-semibold text-slate-200">
              {t.isVatRegistered}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{t.vatHint}</p>
          </div>
        </label>
      </div>

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
