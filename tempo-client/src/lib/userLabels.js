// Keys match the values of the Prisma Role enum
export const ROLE_LABELS = {
  th: {
    ADMIN: "ผู้ดูแลระบบ",
    MANAGER: "ผู้จัดการ",
    STAFF: "พนักงาน",
    TEACHER: "ครู",
    STUDENT: "นักเรียน",
    PARENT: "ผู้ปกครอง",
    CUSTOMER: "ลูกค้า",
  },
  en: {
    ADMIN: "Admin",
    MANAGER: "Manager",
    STAFF: "Staff",
    TEACHER: "Teacher",
    STUDENT: "Student",
    PARENT: "Parent",
    CUSTOMER: "Customer",
  },
};

export const TEACHER_TYPE_LABELS = {
  th: {
    FULL_TIME: "ครูประจำ (Full-time)",
    PART_TIME: "ครูพาร์ทไทม์ (Part-time)",
  },
  en: {
    FULL_TIME: "Full-time teacher",
    PART_TIME: "Part-time teacher",
  },
};

export const ZONE_TYPE_LABELS = {
  RECEPTION: { th: "ประชาสัมพันธ์", en: "Reception" },
  SHOWROOM: { th: "โชว์รูม", en: "Showroom" },
  STOCK_ROOM: { th: "ห้องสต็อกสินค้า", en: "Stock room" },
  CLASSROOM: { th: "ห้องเรียน", en: "Classroom" },
  OFFICE: { th: "ออฟฟิส", en: "Office" },
  OTHER: { th: "อื่นๆ", en: "Other" },
};

export function roleLabel(role, lang) {
  return ROLE_LABELS[lang]?.[role] ?? role;
}

// Name in the selected language, falling back to the other language, then email
export function userName(user, lang) {
  if (!user) return "";
  return (
    (lang === "th" ? user.fullNameTh : user.fullNameEn) ||
    user.fullNameEn ||
    user.fullNameTh ||
    user.email
  );
}

export function teacherTypeLabel(type, lang = "th") {
  return TEACHER_TYPE_LABELS[lang]?.[type] ?? type;
}

// Branch name in the selected language, falling back to the other language, then code
export function branchName(branch, lang = "th") {
  if (!branch) return "";
  return (
    (lang === "th" ? branch.nameTh : branch.nameEn) ||
    branch.nameTh ||
    branch.nameEn ||
    ""
  );
}

export function zoneTypeLabel(type, lang = "th") {
  return ZONE_TYPE_LABELS[type]?.[lang] ?? type;
}

export function zoneName(zone, lang = "th") {
  if (!zone) return "-";
  return lang === "th" ? zone.nameTh : zone.nameEn;
}

export const CLASS_TYPES = ["PRIVATE", "GROUP"];

export const CLASS_TYPE_LABELS = {
  th: {
    PRIVATE: "เรียนเดี่ยว",
    GROUP: "เรียนกลุ่ม",
  },
  en: {
    PRIVATE: "Private Class",
    GROUP: "Group Class",
  },
};

export function classTypeLabel(type, lang = "th") {
  return CLASS_TYPE_LABELS[lang]?.[type] ?? type;
}

export function courseName(course, lang = "th") {
  if (!course) return "-";
  return lang === "th" ? course.nameTh : course.nameEn;
}

export const TUITION_FEE_UNITS = ["PER_MONTH", "PER_COURSE"];

export const TUITION_FEE_UNIT_LABELS = {
  th: {
    PER_MONTH: "ต่อเดือน",
    PER_COURSE: "ต่อคอร์ส",
  },
  en: {
    PER_MONTH: "Monthly",
    PER_COURSE: "One-time",
  },
};

export function tuitionFeeUnitLabel(unit, lang = "th") {
  return TUITION_FEE_UNIT_LABELS[lang]?.[unit] ?? unit;
}

export const TEACHING_FEE_UNITS = [
  "PER_CLASS",
  "PER_STUDENT_CLASS",
  "PER_STUDENT_MONTH",
];

export const TEACHING_FEE_UNIT_LABELS = {
  th: {
    PER_CLASS: "ต่อคลาส",
    PER_STUDENT_CLASS: "ต่อหัวนักเรียน / คลาส",
    PER_STUDENT_MONTH: "ต่อหัวนักเรียน / เดือน",
  },
  en: {
    PER_CLASS: "Per class",
    PER_STUDENT_CLASS: "Per student / class",
    PER_STUDENT_MONTH: "Per student / month",
  },
};

export function teachingFeeUnitLabel(unit, lang = "th") {
  return TEACHING_FEE_UNIT_LABELS[lang]?.[unit] ?? unit;
}

export function formatBaht(amount) {
  if (amount === null || amount === undefined || amount === "") return null;
  const num = Number(amount);
  if (Number.isNaN(num)) return null;
  return `${num.toLocaleString("en-US")} ฿`;
}
