const ERROR_TEXT = {
  th: {
    EMAIL_EXISTS: "อีเมลนี้ถูกใช้ในระบบแล้ว",
    MISSING_FIELDS: "กรุณาระบุอีเมล, ชื่อ (ไทย), ชื่อ (อังกฤษ) ให้ครบถ้วน",
    INVALID_EMAIL: "รูปแบบอีเมลไม่ถูกต้อง",
    INVALID_ROLE: "ตำแหน่งงานไม่ถูกต้อง",
    INVALID_TAX_ID: "เลขประจำตัวผู้เสียภาษี ต้องมี 13 หลัก",
    INVALID_DATE: "รูปแบบวันที่ไม่ถูกต้อง",
    INVALID_BRANCHES: "ไม่พบสาขาตามที่ระบุ",
    USER_NOT_FOUND: "ไม่พบบัญชีผู้ใช้งาน",
    NO_CHANGES: "ไม่มีการเปลี่ยนแปลงข้อมูล",
    CANNOT_CHANGE_OWN_ROLE: "ท่านไม่สามารถเปลี่ยนตำแหน่งของตัวเองได้",
    INVALID_STATUS: "สถานะไม่ถูกต้อง",
    CANNOT_DEACTIVATE_SELF: "ท่านไม่สามารถเปลี่ยนสถานะบัญชีตัวเองได้",
    NETWORK_ERROR: "ไม่สามารถการเชื่อมต่อกับเซิร์ฟเวอร์",
    DEFAULT: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
  },
  en: {
    EMAIL_EXISTS: "Email already exists in the system",
    MISSING_FIELDS: "Email, Thai name and English name are required",
    INVALID_EMAIL: "Email format is invalid",
    INVALID_ROLE: "Role is not allowed",
    INVALID_TAX_ID: "Tax ID must be 13 digits",
    INVALID_DATE: "Date is invalid",
    INVALID_BRANCHES: "One or more branches do not exists",
    USER_NOT_FOUND: "User not found",
    NO_CHANGES: "No changes",
    CANNOT_CHANGE_OWN_ROLE: "You cannot change your own role",
    INVALID_STATUS: "Status is invalid",
    CANNOT_DEACTIVATE_SELF: "You cannot deactivate yourself",
    NETWORK_ERROR: "Cannot connect to the server",
    DEFAULT: "An error occurred. Please try again.",
  },
};

// Function for handling TH/EN error messages
export function getFormError(err, lang = "th") {
  const dict = ERROR_TEXT[lang] || ERROR_TEXT.th;
  const code = err?.code || err?.message;
  return dict[code] || err?.message || dict.DEFAULT;
}
