import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import CourseForm from "../../../components/CourseForm.jsx";
import ActionModal from "../../../components/ActionModal.jsx";
import {
  fetchCourse,
  fetchCourseFormOptions,
  updateCourse,
} from "../../../services/adminCourses.js";
import { courseName } from "../../../lib/userLabels.js";
import { courseErrorMessage } from "../../../lib/courseErrors.js";

const TEXT = {
  th: {
    back: "⬅️ กลับไปหน้ารายการคอร์สเรียน",
    title: "แก้ไขข้อมูลคอร์ส",
    save: "บันทึกการแก้ไข",
    loading: "กำลังโหลดข้อมูล...",
    successTitle: "บันทึกการแก้ไขข้อมูลคอร์สสำเร็จ",
    successMessage: "ข้อมูลคอร์สเรียนอัพเดทในระบบแล้ว",
    closeButton: "รับทราบ - กลับไปหน้าคอร์สเรียน",
  },
  en: {
    back: "⬅️ Back to courses",
    title: "Edit course",
    save: "Save changes",
    loading: "Loading...",
    successTitle: "Changes saved successfully",
    successMessage: "The course information has been updated.",
    closeButton: "Got it, back to course",
  },
};

function toFormValues(c) {
  return {
    code: c.code ?? "",
    parentId: c.parentId ?? "",
    nameTh: c.nameTh ?? "",
    nameEn: c.nameEn ?? "",
    descriptionTh:
      Array.isArray(c.descriptionTh) && c.descriptionTh.length > 0
        ? c.descriptionTh
        : [""],
    descriptionEn:
      Array.isArray(c.descriptionEn) && c.descriptionEn.length > 0
        ? c.descriptionEn
        : [""],
    classType: c.classType ?? "PRIVATE",
    totalLessons: c.totalLessons ?? "",
    lessonDurationMin: c.lessonDurationMin ?? "",
    tuitionFee: c.tuitionFee ?? "",
    tuitionFeeUnit: c.tuitionFeeUnit ?? "PER_MONTH",
    fullTimeTeachingFee: c.fullTimeTeachingFee ?? "",
    partTimeTeachingFee: c.partTimeTeachingFee ?? "",
    teachingFeeUnit: c.teachingFeeUnit ?? "PER_CLASS",
    isHighlighted: Boolean(c.isHighlighted),
    sortOrder: c.sortOrder ?? 999,
  };
}

export default function CourseEditPage({ lang }) {
  const t = TEXT[lang] ?? TEXT.th;
  const { id } = useParams();
  const navigate = useNavigate();

  const [target, setTarget] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [updatedCourse, setUpdatedCourse] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchCourse(id), fetchCourseFormOptions()])
      .then(([courseData, optionsData]) => {
        if (cancelled) return;
        setTarget(courseData.course);
        setAvailableCourses(optionsData.courses ?? []);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(courseErrorMessage(err, lang));
      });

    return () => {
      cancelled = true;
    };
  }, [id, lang]);

  async function handleSubmit(values) {
    setSubmitting(true);
    setSubmitError("");
    try {
      const data = await updateCourse(id, values);
      setUpdatedCourse(data.course || { ...target, ...values });
    } catch (err) {
      setSubmitError(courseErrorMessage(err, lang));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/admin/courses"
        className="text-xs text-slate-400 hover:text-amber-400 transition"
      >
        {t.back}
      </Link>
      <h1 className="text-2xl font-bold text-slate-100 mt-3">{t.title}</h1>
      {target && (
        <p className="text-sm text-amber-400 font-medium mt-1">
          {target.code} — {courseName(target, lang)}
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
        <CourseForm
          key={target.id}
          lang={lang}
          currentCourseId={target.id}
          initialValues={toFormValues(target)}
          availableCourses={availableCourses}
          submitting={submitting}
          error={submitError}
          submitLabel={t.save}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/courses")}
        />
      )}

      <ActionModal
        open={Boolean(updatedCourse)}
        variant="success"
        title={t.successTitle}
        badge={updatedCourse?.code}
        heading={courseName(updatedCourse, lang)}
        message={t.successMessage}
        confirmLabel={t.closeButton}
        onConfirm={() => navigate("/admin/courses")}
      />
    </div>
  );
}
