import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import CourseForm from "../../../components/CourseForm.jsx";
import ActionModal from "../../../components/ActionModal.jsx";
import {
  fetchCourseFormOptions,
  createCourse,
} from "../../../services/adminCourses.js";
import { courseName } from "../../../lib/userLabels.js";
import { courseErrorMessage } from "../../../lib/courseErrors.js";

const TEXT = {
  th: {
    back: "⬅️ กลับไปหน้ารายการคอร์สเรียน",
    title: "เพิ่มคอร์สใหม่",
    subtitle: "สร้างคอร์สหลัก หรือคอร์สย่อย กำหนดอัตราค่าเรียนและค่าตอบแทนครู",
    submit: "สร้างคอร์สเรียน",
    loading: "กำลังโหลด...",
    successTitle: "สร้างคอร์สเรียนใหม่สำเร็จ",
    successMessage: "บันทึกข้อมูลคอร์สเรียนลงในระบบแล้ว",
    closeButton: "รับทราบ-กลับไปหน้าคอร์สเรียน",
  },
  en: {
    back: "⬅️ Back to courses",
    title: "Add new course",
    subtitle:
      "Create a main course or sub-course with tuition and teacher fee rates",
    submit: "Create course",
    loading: "Loading...",
    successTitle: "Course created successfully",
    successMessage: "The new course has been saved to the system.",
    closeButton: "Got it, back to course",
  },
};

export default function CourseCreatePage({ lang }) {
  const t = TEXT[lang] ?? TEXT.th;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialParentId = searchParams.get("parentId") || "";
  const initialParentCode = searchParams.get("parentCode") || "";

  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdCourse, setCreatedCourse] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchCourseFormOptions()
      .then((data) => {
        if (!cancelled) setAvailableCourses(data.courses ?? []);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(courseErrorMessage(err, lang));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  async function handleSubmit(values) {
    setSubmitting(true);
    setSubmitError("");
    try {
      const data = await createCourse(values);
      setCreatedCourse(data.course || values);
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
      <p className="text-sm text-slate-400 mt-1 mb-6">{t.subtitle}</p>

      {loadError ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3">
          {loadError}
        </div>
      ) : loading ? (
        <p className="text-slate-500">{t.loading}</p>
      ) : (
        <CourseForm
          lang={lang}
          initialValues={{
            parentId: initialParentId,
            code: initialParentCode ? `${initialParentCode}-` : "",
          }}
          availableCourses={availableCourses}
          submitLabel={t.submit}
          submitting={submitting}
          error={submitError}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/courses")}
        />
      )}

      <ActionModal
        open={Boolean(createdCourse)}
        variant="success"
        title={t.successTitle}
        badge={createdCourse?.code}
        heading={courseName(createdCourse, lang)}
        message={t.successMessage}
        confirmLabel={t.closeButton}
        onConfirm={() => navigate("/admin/courses")}
      />
    </div>
  );
}
