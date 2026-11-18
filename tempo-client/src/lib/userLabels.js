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
