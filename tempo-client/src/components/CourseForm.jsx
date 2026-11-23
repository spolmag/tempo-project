import { useState, useMemo } from "react";
import {
  CLASS_TYPES,
  classTypeLabel,
  TUITION_FEE_UNITS,
  tuitionFeeUnitLabel,
  TEACHING_FEE_UNITS,
  teachingFeeUnitLabel,
  courseName,
} from "../lib/userLabels.js";
import { buildTreeList, getDescendantId } from "../lib/tree.js";

const EMPTY = {
  code: "",
  parentId: "",
  nameTh: "",
  nameEn: "",
  descriptionTh: [""],
  descriptionEn: [""],
  classType: "PRIVATE",
  totalLessons: "",
  lessonDurationMin: "",
  tuitionFee: "",
  tuitionFeeUnit: "PER_MONTH",
  fullTimeTeachingFee: "",
  partTimeTeachingFee: "",
  teachingFeeUnit: "PER_CLASS",
  isHighlighted: false,
  sortOrder: "",
};

const TEXT = {
  th: {
    basicInfo: "ข้อมูลพื้นฐานของคอร์ส",
    code: "รหัสคอร์ส",
    codeHint: "ต.ย. PIANO-PRI, PIANO-PRI-1, GUITAR-SHORT",
    parentId: "คอร์สหลัก (เว้นว่างหากคอร์สนี้เป็นคอร์สหลัก)",
    noParent: "-คอร์สหลัก-",
    nameTh: "ชื่อคอร์ส (ไทย)",
    nameEn: "ชื่อคอร์ส (อังกฤษ)",
    classAndSchedule: "รูปแบบการเรียน, จำนวนชั่วโมงเรียน",
    classType: "รูปแบบคลาสเรียน",
    totalLessons: "จำนวนชั่วโมงเรียนทั้งหมด",
    totalLessonHint: "ไม่ต้องระบุได้กรณีเป็นคอร์สหลัก",
    lessonDurationMin: "เวลาเรียนต่อครั้ง (นาที)",
    lessonDurationHint: "ต.ย. 30 หรือ 60 นาที",
    feesSection: "ค่าเรียน & ค่าสอนครู",
    tuitionFee: "ค่าเรียน (บาท)",
    tuitionFeeUnit: "รูปแบบการเก็บค่าเรียน",
    fullTimeTeachingFee: "ค่าสอนครูประจำ (บาท)",
    partTimeTeachingFee: "ค่าสอนครูพาร์ทไทม์ (บาท)",
    teachingFeeUnit: "รูปแบบการจ่ายค่าตอบแทนครู",
    feeHint: "เว้นว่างได้กรณีเป็นคอร์สหลัก",
    displaySection: "การแสดงบนหน้าเวป (/courses)",
    isHighlighted: "ไฮไลท์ (แสดงบนส่วนบนสุดของหน้า)",
    sortOrder: "ลำดับการแสดงผล",
    sortOrderHint: "เรียงตามลำดับตัวเลขน้อย-มาก (หากไม่ระบุจะบันทึกเป็น 999)",
    descriptionSection: "รายละเอียดคอร์ส (แสดงเป็นหัวข้อบนหน้าเวป)",
    descriptionTh: "รายละเอียดคอร์ส (ไทย)",
    descriptionEn: "รายละเอียดคอร์ส (อังกฤษ)",
    bulletPlaceholderTh: "ต.ย. เปียโนขั้นพื้นฐานสำหรับเด็ก",
    bulletPlaceholderEn: "e.g. Primary piano course for children",
    addBullet: "เพิ่มรายละเอียดคอร์ส",
    removeBullet: "ลบ",
    cancel: "ยกเลิก",
    saving: "กำลังบันทึก...",
  },
  en: {
    basicInfo: "Basic course information",
    code: "Course code",
    codeHint: "e.g. PIANO-PRI, PIANO-PRI-1, GUITAR-SHORT",
    parentId: "Parent course (leave blank for main course)",
    noParent: "-Main Course (no parent)-",
    nameTh: "Course name (Thai)",
    nameEn: "Course name (English)",
    classAndSchedule: "Class format & lesson structure",
    classType: "Class type",
    totalLessons: "Total lesson per course",
    totalLessonHint: "Optional for main curriculum header courses",
    lessonDurationMin: "Lesson duration (minutes)",
    lessonDurationHint: "e.g. 30 or 60 mins",
    feesSection: "Tuition & teacher teaching fees",
    tuitionFee: "Course tution fee (THB)",
    tuitionFeeUnit: "Tuition billing cycle",
    fullTimeTeachingFee: "Full-time teacher fee (THB)",
    partTimeTeachingFee: "Part-time teacher fee (THB)",
    teachingFeeUnit: "Teaching fee unit",
    feeHint: "Whole baht amount (optional for main header course)",
    displaySection: "Public page display (/courses)",
    isHighlighted: "Highlight this course (pin to top of /courses)",
    sortOrder: "Display sort order",
    sortOrderHint: "Lower number appear first (default to 999 if leave blank)",
    descriptionSection: "Course description bullet (show on /course)",
    descriptionTh: "Descripyion bullets (Thai)",
    descriptionEn: "Descripyion bullets (English)",
    bulletPlaceholderTh: "ต.ย. เปียโนขั้นพื้นฐานสำหรับเด็ก",
    bulletPlaceholderEn: "e.g. Primary piano course for children",
    addBullet: "Add bullet point",
    removeBullet: "Remove",
    cancel: "Cancel",
    saving: "Saving...",
  },
};

const inputClass =
  "w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400";

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
      <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="block text-xs text-slate-400 mb-1.5">
        {label}
        {required && <span className="text-amber-400 ml-1"> *</span>}
      </span>
      {children}
      {hint && (
        <span className="block text-xs text-slate-500 mt-1">{hint}</span>
      )}
    </label>
  );
}

function BulletListEditor({
  label,
  items,
  placeholder,
  addLabel,
  removeLabel,
  onChange,
}) {
  function updateItem(index, value) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function addItem() {
    onChange([...items, ""]);
  }

  function removeItem(index) {
    if (items.length <= 1) {
      onChange([""]);
      return;
    }
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2.5">
      <span className="block text-xs text-slate-400">{label}</span>
      <div className="space-y-2">
        {items.map((text, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-amber-400 text-sm select-none">•</span>
            <input
              value={text}
              onChange={(e) => updateItem(idx, e.target.value)}
              placeholder={placeholder}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="px-2.5 py-2 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-red-300 hover:border-red-500/40 transition-colors cursor-pointer shrink-0"
            >
              {removeLabel}
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
      >
        {addLabel}
      </button>
    </div>
  );
}

export default function CourseForm({
  lang,
  initialValues,
  availableCourses = [],
  currentCourseId = null,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
}) {
  const t = TEXT[lang] ?? TEXT.th;
  const [values, setValues] = useState(() => {
    const merged = { ...EMPTY, ...initialValues };
    return {
      ...merged,
      descriptionTh:
        Array.isArray(merged.descriptionTh) && merged.descriptionTh.length > 0
          ? merged.descriptionTh
          : [""],
      descriptionEn:
        Array.isArray(merged.descriptionEn) && merged.descriptionEn.length > 0
          ? merged.descriptionEn
          : [""],
    };
  });

  //   Build indented tree of parent options, excluding current course and its decendants
  const parentOptions = useMemo(() => {
    const excluded = getDescendantId(availableCourses, currentCourseId);
    const allowed = availableCourses.filter((c) => !excluded.has(c.id));
    return buildTreeList(allowed);
  }, [availableCourses, currentCourseId]);

  function setField(e) {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({
      ...v,
      [name]:
        type === "checkbox"
          ? checked
          : name === "code"
            ? value.toUpperCase()
            : value,
    }));
  }

  function setBullets(field, nextList) {
    setValues((v) => ({
      ...v,
      [field]: nextList,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const toNullableInt = (val) =>
      val !== "" && val !== null ? Number(val) : null;

    onSubmit({
      code: values.code,
      parentId: values.parentId || null,
      nameTh: values.nameTh,
      nameEn: values.nameEn,
      descriptionTh: values.descriptionTh
        .map((line) => line.trim())
        .filter(Boolean),
      descriptionEn: values.descriptionEn
        .map((line) => line.trim())
        .filter(Boolean),
      classType: values.classType,
      totalLessons: toNullableInt(values.totalLessons),
      lessonDurationMin: toNullableInt(values.lessonDurationMin),
      tuitionFee: toNullableInt(values.tuitionFee),
      tuitionFeeUnit: values.tuitionFeeUnit,
      fullTimeTeachingFee: toNullableInt(values.fullTimeTeachingFee),
      partTimeTeachingFee: toNullableInt(values.partTimeTeachingFee),
      teachingFeeUnit: values.teachingFeeUnit,
      isHighlighted: Boolean(values.isHighlighted),
      sortOrder: values.sortOrder !== "" ? Number(values.sortOrder) : 999,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* 1. Basic info */}
      <Section title={t.basicInfo}>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label={t.code} required hint={t.codeHint}>
            <input
              name="code"
              value={values.code}
              onChange={setField}
              className={inputClass}
              autoComplete="off"
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
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {"\u00A0\u00A0\u00A0".repeat(c.depth)}
                  {c.depth > 0 ? "↳ " : ""}
                  {c.code} — {courseName(c, lang)}
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
        </div>
      </Section>

      {/* 2. Class format & Schedule */}
      <Section title={t.classAndSchedule}>
        <div className="grid sm:grid-cols-3 gap-5">
          <Field label={t.classType} required>
            <select
              name="classType"
              value={values.classType}
              onChange={setField}
              className={inputClass}
            >
              {CLASS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {classTypeLabel(type, lang)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t.totalLessons} hint={t.totalLessonHint}>
            <input
              type="number"
              min="1"
              step="1"
              name="totalLessons"
              value={values.totalLessons}
              onChange={setField}
              className={inputClass}
            />
          </Field>

          <Field label={t.lessonDurationMin} hint={t.lessonDurationHint}>
            <input
              type="number"
              min="1"
              step="1"
              name="lessonDurationMin"
              value={values.lessonDurationMin}
              onChange={setField}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* 3. Tuition & Teacher Fees */}
      <Section title={t.feesSection}>
        <div className="grid sm:grid-cols-3 gap-5">
          <Field label={t.tuitionFee} hint={t.feeHint}>
            <input
              type="number"
              min="0"
              step="1"
              name="tuitionFee"
              value={values.tuitionFee}
              onChange={setField}
              className={inputClass}
            />
          </Field>

          <Field label={t.tuitionFeeUnit} required>
            <select
              name="tuitionFeeUnit"
              value={values.tuitionFeeUnit}
              onChange={setField}
              className={inputClass}
            >
              {TUITION_FEE_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {tuitionFeeUnitLabel(unit, lang)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t.fullTimeTeachingFee} hint={t.feeHint}>
            <input
              type="number"
              min="0"
              step="1"
              name="fullTimeTeachingFee"
              value={values.fullTimeTeachingFee}
              onChange={setField}
              className={inputClass}
            />
          </Field>

          <Field label={t.partTimeTeachingFee} hint={t.feeHint}>
            <input
              type="number"
              min="0"
              step="1"
              name="partTimeTeachingFee"
              value={values.partTimeTeachingFee}
              onChange={setField}
              className={inputClass}
            />
          </Field>

          <Field label={t.teachingFeeUnit} required>
            <select
              name="teachingFeeUnit"
              value={values.teachingFeeUnit}
              onChange={setField}
              className={inputClass}
            >
              {TEACHING_FEE_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {teachingFeeUnitLabel(unit, lang)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* 4. Bullet-Point Description */}
      <Section title={t.descriptionSection}>
        <div className="grid sm:grid-cols-2 gap-6">
          <BulletListEditor
            label={t.descriptionTh}
            items={values.descriptionTh}
            placeholder={t.bulletPlaceholderTh}
            addLabel={t.addBullet}
            removeLabel={t.removeBullet}
            onChange={(next) => setBullets("descriptionTh", next)}
          />
          <BulletListEditor
            label={t.descriptionEn}
            items={values.descriptionEn}
            placeholder={t.bulletPlaceholderEn}
            addLabel={t.addBullet}
            removeLabel={t.removeBullet}
            onChange={(next) => setBullets("descriptionEn", next)}
          />
        </div>
      </Section>

      {/* 5. Display & Sorting */}
      <Section title={t.displaySection}>
        <div className="grid sm:grid-cols-2 gap-5 items-start">
          <Field label={t.sortOrder} hint={t.sortOrderHint}>
            <input
              type="number"
              min="0"
              step="1"
              name="sortOrder"
              placeholder="999"
              value={values.sortOrder}
              onChange={setField}
              className={inputClass}
            />
          </Field>

          <div className="pt-2 sm:pt-7">
            <label className="inline-flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isHighlighted"
                checked={values.isHighlighted}
                onChange={setField}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-400 focus:ring-amber-400"
              />
              <span className="text-sm font-medium text-slate-200">
                ⭐ {t.isHighlighted}
              </span>
            </label>
          </div>
        </div>
      </Section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-semibold text-sm hover:bg-amber-300 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {submitting ? t.saving : submitLabel}
        </button>
      </div>
    </form>
  );
}
