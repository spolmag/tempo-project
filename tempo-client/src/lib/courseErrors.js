const MESSAGES = {
  th: {
    MISSING_FIELDS:
      "กรุณากรอกข้อมูลที่จำเป็นให้ครบ (รหัสคอร์ส ชื่อคอร์ส(ไทย) ชื่อคอร์ส(อังกฤษ))",
    INVALID_COURSE_CODE: "รหัสคอร์สไม่ถูกต้อง",
    COURSE_CODE_TAKEN: "รหัสคอร์สนี้มีอยู่ในระบบแล้ว",
    INVALID_CLASS_TYPE: "ประเภทคลาสเรียนไม่ถูกต้อง",
    INVALID_TOTAL_LESSONS:
      "จำนวนครั้งที่เรียน ต้องระบุเป็นตัวเลขตั้งแต่ 1 ขึ้นไป",
    INVALID_LESSON_DURATION:
      "เวลาเรียนต่อคลาส (นาที) ต้องระบุเป็นตัวเลขตั้งแต่ 1 ขึ้นไป",
    INVALID_TUITION_FEE: "ค่าเรียน ต้องระบุเป็นตัวเลขตั้งแต่ 0 ขึ้นไป",
    INVALID_TUITION_FEE_UNIT: "หน่วยเก็บค่าเรียนไม่ถูกต้อง",
    INVALID_TEACHING_FEE: "ค่าสอน ต้องระบุเป็นตัวเลขตั้งแต่ 0 ขึ้นไป",
    INVALID_TEACHING_FEE_UNIT: "หน่วยจ่ายค่าตอบแทนครูไม่ถูกต้อง",
    INVALID_SORT_ORDER: "ลำดับการแสดงผล ต้องระบุเป็นตัวเลขตั้งแต่ 0 ขึ้นไป",
    PARENT_COURSE_NOT_FOUND: "ไม่พบคอร์สหลักที่เลือก",
    CANNOT_PARENT_SELF: "ไม่สามารถเลือกคอร์สตัวเองเป็นคอร์สหลักได้",
    CIRCULAR_COURSE_HIERARCHY:
      "ไม่สามารถเลือกคอร์สย่อยของตัวเองมาเป็นคอร์สหลักได้",
    HAS_ACTIVE_SUBCOURSES:
      "ไม่สามารถปิดสถานะคอร์สหลักที่มีคอร์สย่อยสถานะเปิดอยู่ได้",
    COURSE_NOT_FOUND: "ไม่พบข้อมูลคอร์ส",
    FORBIDDEN: "คุณไม่มีสิทธิ์ทำรายการนี้",
    NETWORK_ERROR: "เกิดปัญหาในการเชื่อมต่อกับเซิร์ฟเวอร์",
    SERVER_ERROR: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง",
  },
  en: {
    MISSING_FIELDS:
      "Please fill in all required fields (Course code, Thai name, and English name)",
    INVALID_COURSE_CODE: "Invalid course code",
    COURSE_CODE_TAKEN: "This course code is already in use",
    INVALID_CLASS_TYPE: "Invalid class type",
    INVALID_TOTAL_LESSONS: "Total lessons must be a whole number of at least 1",
    INVALID_LESSON_DURATION:
      "Lesson duration (minutes) must be a whole number of at least 1",
    INVALID_TUITION_FEE: "Tuition fee must be a whole number of 0 or more",
    INVALID_TUITION_FEE_UNIT: "Invalid tuition billing cycle",
    INVALID_TEACHING_FEE: "Teaching fee must be a whole number of 0 or more",
    INVALID_TEACHING_FEE_UNIT: "Invalid teaching fee unit",
    INVALID_SORT_ORDER: "Sort order must be a number of 0 or more",
    PARENT_COURSE_NOT_FOUND: "Selected parent couse was not found",
    CANNOT_PARENT_SELF: "A couse cannot be the parent of itself",
    CIRCULAR_COURSE_HIERARCHY:
      "Cannot select a sub-course of this course as its parent",
    HAS_ACTIVE_SUBCOURSES:
      "Cannot deactivate a course that still have active sub-courses",
    COURSE_NOT_FOUND: "Course not found",
    FORBIDDEN: "You do not have permission to perform this action",
    NETWORK_ERROR: "Cannot reach the server",
    SERVER_ERROR: "Something went wrong, please try again",
  },
};

export function courseErrorMessage(err, lang = "th") {
  const dict = MESSAGES[lang] ?? MESSAGES.th;
  const code = err?.code || "SERVER_ERROR";
  return dict[code] ?? dict.SERVER_ERROR;
}
