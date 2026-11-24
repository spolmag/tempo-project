import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  fetchCourses,
  setCourseActive,
} from "../../../services/adminCourses.js";
import {
  CLASS_TYPES,
  classTypeLabel,
  tuitionFeeUnitLabel,
  teachingFeeUnitLabel,
  courseName,
  formatBaht,
} from "../../../lib/userLabels.js";
import { courseErrorMessage } from "../../../lib/courseErrors.js";
import { buildTreeList } from "../../../lib/tree.js";
import ActionModal from "../../../components/ActionModal.jsx";

const TEXT = {
  th: {
    back: "⬅️ กลับไปหน้าจัดการงานสาขา",
    title: "จัดการหลักสูตร-คอร์สเรียน",
    subtitle: "จัดการคอร์สหลัก คอร์สย่อย ค่าเรียน ค่าตอบแทนครู",
    addCourse: "➕ เพิ่มคอร์ส",
    searchPlaceholder: "ค้นหาจากรหัสคอร์ส ชื่อคอร์ส...",
    allTypes: "ทุกรูปแบบคลาส (เดี่ยว, กลุ่ม, ... )",
    allStatus: "ทุกสถานะ",
    active: "เปิดสอน",
    inactive: "ปิดสอน",
    colCode: "รหัสคอร์ส",
    colName: "ชื่อคอร์ส",
    colType: "รูปแบบ / จำนวนคลาส",
    colTuition: "ค่าเรียน",
    colTeachingFee: "ค่าตอบแทนครู (ประจำ / พาร์ทไทม์)",
    colOrder: "ลำดับ",
    colStatus: "สถานะ",
    colActions: "จัดการ",
    mainCourseBadge: "คอร์สหลัก",
    subCourseOf: "คอร์สหลัก",
    highlightedBadge: "ไฮไลท์",
    lessonsUnit: "ครั้ง",
    minuteUnit: "นาที / คลาส",
    fullTimeShort: "ประจำ",
    partTimeShort: "พาร์ทไทม์",
    addSubCourse: "➕ คอร์สย่อย",
    edit: "แก้ไข",
    deactivate: "ปิดการเรียนการสอน",
    activate: "เปิดสอน",
    cancel: "ยกเลิก",
    processing: "กำลังดำเนินการ...",
    closeButton: "รับทราบ",
    loading: "กำลังโหลดรายการคอร์ส...",
    empty: "ไม่พบข้อมูลคอร์สในระบบ",
    modal: {
      deactivate: {
        confirmTitle: "ยืนยันปิดการเรียนการสอน",
        confirmDesc: "คุณต้องการเปลี่ยนสถานะคอร์สเป็นปิดการเรียนการสอน?",
        confirmBtn: "ปิดการเรียนการสอน",
        successTitle: "คอร์สปิดการเรียนการสอนแล้ว",
        successDesc: "เปลี่ยนสถานะคอร์สเป็นปิดการเรียนการสอนแล้ว",
      },
      activate: {
        confirmTitle: "ยืนยันเปิดสอน",
        confirmDesc: "คุณต้องการเปลี่ยนสถานะคอร์สเป็นเปิดสอน?",
        confirmBtn: "เปิดสอน",
        successTitle: "เปิดสอนสำหรับคอร์สแล้ว",
        successDesc: "เปลี่ยนสถานะคอร์สเป็นเปิดสอนแล้ว",
      },
    },
  },
  en: {
    back: "⬅️ Back to dashboard",
    title: "Course & Curriculum Management",
    subtitle:
      "Manage main courses, sub-courses, tuition fees, and teacher pay rates",
    addCourse: "➕ Add course",
    searchPlaceholder: "Search course code or name...",
    allTypes: "All class types",
    allStatus: "All status",
    active: "Active",
    inactive: "Inactive",
    colCode: "Code",
    colName: "Course name",
    colType: "Format / Lessons",
    colTuition: "Tuition fee",
    colTeachingFee: "Teaching fee (FT / PT)",
    colOrder: "Order",
    colStatus: "Status",
    colActions: "Actions",
    mainCourseBadge: "Main course",
    subCourseOf: "Under",
    highlightedBadge: "Featured",
    lessonsUnit: "lessons",
    minuteUnit: "min/class",
    fullTimeShort: "FT",
    partTimeShort: "PT",
    addSubCourse: "➕ Sub-course",
    edit: "Edit",
    deactivate: "Deactivate",
    activate: "Activate",
    cancel: "Cancel",
    processing: "Processing...",
    closeButton: "Got it",
    loading: "Loading course...",
    empty: "No courses found",
    modal: {
      deactivate: {
        confirmTitle: "Confirm course deactivation",
        confirmDesc: "Are you sure you want to deactivate this course?",
        confirmBtn: "Deactivate course",
        successTitle: "Course deactivated",
        successDesc: "The course status has been set to inactive",
      },
      activate: {
        confirmTitle: "Confirm course activation",
        confirmDesc: "Are you sure you want to activate this course?",
        confirmBtn: "Activate course",
        successTitle: "Course activated",
        successDesc: "The course status has been set to active",
      },
    },
  },
};
//
//
//
const selectClass =
  "bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60";

export default function CourseListPage({ lang }) {
  const t = TEXT[lang] ?? TEXT.th;

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    classType: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);
  const [resultModal, setResultModal] = useState(null);

  useEffect(() => {
    const q = search.trim();
    if (q === filters.search) return;
    const timer = setTimeout(() => {
      setLoading(true);
      setFilters((f) => ({ ...f, search: q }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filters.search]);

  useEffect(() => {
    let cancelled = false;
    fetchCourses(filters)
      .then((data) => {
        if (!cancelled) {
          setCourses(data.courses ?? []);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(courseErrorMessage(err, lang));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, lang]);

  const orderedCourses = useMemo(() => buildTreeList(courses), [courses]);

  function updateFilters(patch) {
    setLoading(true);
    setFilters((f) => ({ ...f, ...patch }));
  }

  function replaceCourse(updated) {
    setCourses((list) =>
      list.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
    );
  }

  async function executeConfirmedAction() {
    if (!confirmAction) return;
    const { type, course: targetCourse } = confirmAction;

    setBusyId(targetCourse.id);
    setError("");
    try {
      const nextActive = type === "activate";
      const data = await setCourseActive(targetCourse.id, nextActive);
      replaceCourse(data.course);
      setConfirmAction(null);
      setResultModal({ type, course: data.course });
    } catch (err) {
      setConfirmAction(null);
      setError(courseErrorMessage(err, lang));
    } finally {
      setBusyId(null);
    }
  }

  const confirmText = confirmAction ? t.modal[confirmAction.type] : null;
  const resultText = resultModal ? t.modal[resultModal.type] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/dashboard"
        className="text-xs text-slate-400 hover:text-amber-400 transition"
      >
        {t.back}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{t.title}</h1>
          <p className="text-sm text-slate-400 mt-1">{t.subtitle}</p>
        </div>
        <Link
          to="/admin/courses/new"
          className="px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-slate-950 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 transition"
        >
          {t.addCourse}
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-64">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`${selectClass} w-full pr-10`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 flex items-center justify-center text-xs font-bold transition"
              title="Clear search"
            >
              X
            </button>
          )}
        </div>
        <select
          value={filters.classType}
          onChange={(e) => updateFilters({ classType: e.target.value })}
          className={selectClass}
        >
          <option value="">{t.allTypes}</option>
          {CLASS_TYPES.map((type) => (
            <option key={type} value={type}>
              {classTypeLabel(type, lang)}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => updateFilters({ status: e.target.value })}
          className={selectClass}
        >
          <option value="">{t.allStatus}</option>
          <option value="active">{t.active}</option>
          <option value="inactive">{t.inactive}</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] tracking-wider text-slate-500 uppercase border-b border-slate-800">
              <th className="px-5 py-3 font-semibold">{t.colCode}</th>
              <th className="px-5 py-3 font-semibold">{t.colName}</th>
              <th className="px-5 py-3 font-semibold">{t.colType}</th>
              <th className="px-5 py-3 font-semibold">{t.colTuition}</th>
              <th className="px-5 py-3 font-semibold">{t.colTeachingFee}</th>
              <th className="px-5 py-3 font-semibold">{t.colOrder}</th>
              <th className="px-5 py-3 font-semibold">{t.colStatus}</th>
              <th className="px-5 py-3 font-semibold text-right">
                {t.colActions}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-10 text-center text-slate-500"
                >
                  {t.loading}
                </td>
              </tr>
            ) : orderedCourses.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-10 text-center text-slate-500"
                >
                  {t.empty}
                </td>
              </tr>
            ) : (
              orderedCourses.map((c) => {
                const busy = busyId === c.id;
                const isSub = c.depth > 0;
                const tuitionStr = formatBaht(c.tuitionFee);
                const ftStr = formatBaht(c.fullTimeTeachingFee);
                const ptStr = formatBaht(c.partTimeTeachingFee);

                return (
                  <tr
                    key={c.id}
                    className={`border-b border-slate-800/60 last:border-0 ${
                      isSub ? "bg-slate-950/35" : ""
                    }`}
                  >
                    {/* 1. Code */}
                    <td className="px-5 py-4 font-mono text-xs font-bold text-amber-400 whitespace-nowrap">
                      <span
                        style={{ paddingLeft: `${c.depth * 20}px` }}
                        className={isSub ? "text-amber-300/85" : ""}
                      >
                        {isSub ? `↳ ${c.code}` : c.code}
                      </span>
                    </td>

                    {/* 2. Name & Parent */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-100">
                          {courseName(c, lang)}
                        </p>
                        {c.isHighlighted && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[11px] font-medium">
                            ⭐ {t.highlightedBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {c.parent
                          ? `${t.subCourseOf}: ${courseName(c.parent, lang)}`
                          : t.mainCourseBadge}
                      </p>
                    </td>

                    {/* 3. Format & Lessons */}
                    <td className="px-5 py-4 text-slate-300">
                      <p>{classTypeLabel(c.classType, lang)}</p>
                      {/* {(c.totalLessons || c.lessonDurationMin) && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {c.totalLessons
                            ? `${c.totalLessons} ${t.lessonsUnit}`
                            : ""}
                          {c.totalLessons && c.lessonDurationMin ? " • " : ""}
                          {c.lessonDurationMin
                            ? `${c.lessonDurationMin} ${t.minuteUnit}`
                            : ""}
                        </p>
                      )} */}
                    </td>

                    {/* 4. Tuition fee & Billing Cycle */}
                    <td className="px-5 py-4 text-slate-300">
                      {tuitionStr ? (
                        <div>
                          <p className="font-semibold text-emerald-300">
                            {tuitionStr}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {tuitionFeeUnitLabel(c.tuitionFeeUnit, lang)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* 5. Teaching + Unit */}
                    <td className="px-5 py-4 text-slate-300">
                      {ftStr || ptStr ? (
                        <div>
                          <p className="text-xs text-slate-200">
                            {t.fullTimeShort}:{" "}
                            <span className="font-semibold">
                              {ftStr ?? "-"}
                            </span>
                            {" / "}
                            {t.partTimeShort}:{" "}
                            <span className="font-semibold text-amber-300">
                              {ptStr ?? "-"}
                            </span>
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {teachingFeeUnitLabel(c.teachingFeeUnit, lang)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* 6. Sort Order */}
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">
                      {c.sortOrder ?? 999}
                    </td>

                    {/* 7. Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          c.isActive
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-slate-700/40 text-slate-400"
                        }`}
                      >
                        {c.isActive ? t.active : t.inactive}
                      </span>
                    </td>

                    {/* 8. Action */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2 whitespace-nowrap">
                        <Link
                          to={`/admin/courses/new?parentId=${c.id}&parentCode=${encodeURIComponent(c.code)}`}
                          className="px-3 py-1.5 rounded-lg text-xs text-amber-300 border border-amber-500/40 hover:border-amber-500/40 hover:bg-amber-500/10 transition"
                        >
                          {t.addSubCourse}
                        </Link>
                        <Link
                          to={`/admin/courses/${c.id}/edit`}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-200 border border-slate-700 hover:border-amber-500/60 transition"
                        >
                          {t.edit}
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({
                              type: c.isActive ? "deactivate" : "activate",
                              course: c,
                            })
                          }
                          disabled={busy}
                          className={`px-3 py-1.5 rounded-lg text-xs border disabled:opacity-50 transition ${
                            c.isActive
                              ? "text-red-300 border-red-500/30 hover:bg-red-500/10"
                              : "text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
                          }`}
                        >
                          {c.isActive ? t.deactivate : t.activate}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Step 1. Confirm Action Modal */}
      <ActionModal
        open={Boolean(confirmAction && confirmText)}
        variant={confirmAction?.type === "deactivate" ? "danger" : "warning"}
        title={confirmText?.confirmTitle}
        badge={confirmAction?.course.code}
        heading={courseName(confirmAction?.course, lang)}
        message={confirmText?.confirmDesc}
        cancelLabel={t.cancel}
        confirmLabel={confirmText?.confirmBtn}
        busy={busyId === confirmAction?.course.id}
        busyLabel={t.processing}
        onCancel={() => setConfirmAction(null)}
        onConfirm={executeConfirmedAction}
      />

      {/* Step 2. Success result Modal */}
      <ActionModal
        open={Boolean(resultModal && resultText)}
        variant="success"
        title={resultText?.successTitle}
        badge={resultModal?.course.code}
        heading={courseName(resultModal?.course, lang)}
        message={resultText?.successDesc}
        confirmLabel={t.closeButton}
        onConfirm={() => setResultModal(null)}
      />
    </div>
  );
}
