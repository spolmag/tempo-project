import { useState } from "react";
import { roleLabel, branchName } from "../lib/userLabels.js";
import DateInput from "./DateInput.jsx";
import { parseIsoDate } from "../lib/date.js";

const EMPTY = {
  email: "",
  fullNameTh: "",
  fullNameEn: "",
  role: "STAFF",
  phone: "",
  lineId: "",
  taxId: "",
  dateOfBirth: "",
  addressTh: "",
  addressEn: "",
  branchIds: [],
};

const TEXT = {
  th: {
    account: "บัญชีผู้ใช้",
    personal: "ข้อมูลส่วนตัว",
    contact: "ข้อมูลติดต่อ",
    branches: "สาขาที่มีสิทธิ์เข้าถึง",
    email: "อีเมล",
    role: "ตำแหน่ง",
    fullNameTh: "ชื่อ-นามสกุล (ไทย)",
    fullNameEn: "ชื่อ-นามสกุล (อังกฤษ)",
    dateOfBirth: "วันเกิด",
    invalidDate: "กรุณาวัน เดือน และปีให้ถูกต้อง",
    taxId: "เลขประจำตัวผู้เสียภาษี",
    phone: "เบอร์โทรศัพท์",
    lineId: "LINE ID",
    addressTh: "ที่อยู่ (ไทย)",
    addressEn: "ที่อยู่ (อังกฤษ)",
    ownRole: "ไม่สามารถเปลี่ยนตำแหน่งของตัวเองได้",
    adminAllBranches: "ผู้ดูแลระบบมีสิทธิ์เข้าถึงทุกสาขา",
    noBranches: "ยังไม่มีสาขาในระบบ",
    inActive: "ปิดใช้งาน",
    required: "กรุณากรอกข้อมูลอีเมล ชื่อภาษาไทย และชื่อภาษาอังกฤษ",
    taxIdInvalid: "เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก",
    cancel: "ยกเลิก",
    saving: "กำลังบันทึก...",
  },
  en: {
    account: "Account",
    personal: "Personal details",
    contact: "Contact",
    branches: "Branch access",
    email: "Email",
    role: "Role",
    fullNameTh: "Full name (Thai)",
    fullNameEn: "Full name (English)",
    dateOfBirth: "Date of birth",
    invalidDate: "Please select a complete day, month, and year",
    taxId: "Tax ID",
    phone: "Phone",
    lineId: "LINE ID",
    addressTh: "Address (Thai)",
    addressEn: "Address (English)",
    ownRole: "You cannot change your own role",
    adminAllBranches: "Admin can access all branches automatically",
    noBranches: "No branches available",
    inActive: "Inactive",
    required: "Email, Thai name and English name are required",
    taxIdInvalid: "Tax ID must be 13 digits",
    cancel: "Cancel",
    saving: "Saving...",
  },
};

const inputClass =
  "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 disabled:opacity-50 disabled:cursor-not-allowed";

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

function Section({ title, children }) {
  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-sm font-semibold tracking-wider text-amber-400 uppercase mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

// Share by the create and edit pages
// Onsubmit recieves the form values. branchIds is left out for ADMIN.
export default function UserForm({
  lang,
  initialValues,
  roles = [],
  branches = [],
  isSelf = false,
  submitting = false,
  error = "",
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const t = TEXT[lang];
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [formError, setFormError] = useState("");

  function setField(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  function toggleBranch(id) {
    setValues((v) => ({
      ...v,
      branchIds: v.branchIds.includes(id)
        ? v.branchIds.filter((b) => b !== id)
        : [...v.branchIds, id],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (
      !values.email.trim() ||
      !values.fullNameTh.trim() ||
      !values.fullNameEn.trim()
    ) {
      setFormError(t.required);
      return;
    }
    if (values.taxId.trim() && !/^\d{13}$/.test(values.taxId.trim())) {
      setFormError(t.taxIdInvalid);
      return;
    }
    if (values.dateOfBirth && !parseIsoDate(values.dateOfBirth)) {
      setFormError(t.invalidDate);
      return;
    }

    const { branchIds, ...fields } = values;
    // Admin get every branch, so their branch links are not changed
    onSubmit(values.role === "ADMIN" ? fields : { ...fields, branchIds });
  }

  const showError = formError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Section title={t.account}>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label={t.email} required>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={setField}
              className={inputClass}
              autoComplete="off"
            />
          </Field>
          <Field label={t.role} required hint={isSelf ? t.ownRole : ""}>
            <select
              name="role"
              value={values.role}
              onChange={setField}
              disabled={isSelf}
              className={inputClass}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r, lang)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title={t.personal}>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label={t.fullNameTh} required>
            <input
              name="fullNameTh"
              value={values.fullNameTh}
              onChange={setField}
              className={inputClass}
            />
          </Field>
          <Field label={t.fullNameEn} required>
            <input
              name="fullNameEn"
              value={values.fullNameEn}
              onChange={setField}
              className={inputClass}
            />
          </Field>
          <Field label={t.dateOfBirth}>
            <DateInput
              lang={lang}
              value={values.dateOfBirth}
              onChange={(val) => setValues((v) => ({ ...v, dateOfBirth: val }))}
            />
          </Field>
          <Field label={t.taxId}>
            <input
              name="taxId"
              value={values.taxId}
              onChange={setField}
              inputMode="numeric"
              maxLength={13}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title={t.contact}>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label={t.phone}>
            <input
              name="phone"
              value={values.phone}
              onChange={setField}
              inputMode="tel"
              className={inputClass}
            />
          </Field>
          <Field label={t.lineId}>
            <input
              name="lineId"
              value={values.lineId}
              onChange={setField}
              className={inputClass}
            />
          </Field>
          <Field label={t.addressTh}>
            <textarea
              name="addressTh"
              value={values.addressTh}
              onChange={setField}
              rows={3}
              className={inputClass}
            />
          </Field>
          <Field label={t.addressEn}>
            <textarea
              name="addressEn"
              value={values.addressEn}
              onChange={setField}
              rows={3}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title={t.branches}>
        {values.role === "ADMIN" ? (
          <p className="text-sm text-slate-400">{t.adminAllBranches}</p>
        ) : branches.length === 0 ? (
          <p className="text-sm text-slate-400">{t.noBranches}</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {branches.map((b) => {
              const checked = values.branchIds.includes(b.id);
              return (
                <label
                  key={b.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${
                    checked
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBranch(b.id)}
                    className="accent-amber-500 w-4 h-4"
                  />
                  <span className="flex-1 text-sm text-slate-100 truncate">
                    {branchName(b, lang)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {b.isActive === false ? `${t.inActive} · ` : ""}
                    {b.code}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </Section>

      {showError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3">
          {showError}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full text-sm text-slate-300 border border-slate-700 hover:border-slate-500 transition"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-full text-sm font-bold text-slate-950 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition"
        >
          {submitting ? t.saving : submitLabel}
        </button>
      </div>
    </form>
  );
}
