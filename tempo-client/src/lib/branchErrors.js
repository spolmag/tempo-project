const ERROR_TEXT = {
  th: {
    CODE_EXISTS: "รหัสสาขานี้ถูกใช้ในระบบแล้ว",
    MISSING_FIELDS: "กรุณาระบุรหัสสาขา, ชื่อสาขา(ไทย) และชื่อสาขา(อังกฤษ)",
    INVALID_TAX_ID: "เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก",
    INVALID_TAX_BRANCH_NO:
      "รหัสสาขาทางภาษีต้องเป็นตัวเลข 5 หลัก (ต.ย. 00000 สำนักงานใหญ่)",
    BRANCH_NOT_FOUND: "ไม่พบข้อมูลสาขา",
    NO_CHANGES: "ไม่มีการเปลี่ยนแปลงข้อมูล",
    INVALID_STATUS: "สถานะไม่ถูกต้อง",
    NETWORK_ERROR: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์",
    DEFAULT: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
  },
  en: {
    CODE_EXISTS: "This branch code is already in use",
    MISSING_FIELDS: "Branch code, Thai name, and English name are required",
    INVALID_TAX_ID: "Tax ID must be 13 digits",
    INVALID_TAX_BRANCH_NO:
      "Tax branch number must be 5 digits (e.g. 00000 for Head Office)",
    BRANCH_NOT_FOUND: "Branch not found",
    NO_CHANGES: "No changes",
    INVALID_STATUS: "Status is invalid",
    NETWORK_ERROR: "Cannot connect to the server",
    DEFAULT: "An error occured. Please try again",
  },
};

export function getBranchError(err, lang = "th") {
  const dict = ERROR_TEXT[lang] || ERROR_TEXT.th;
  const code = err?.code || err?.message;
  return dict[code] || err?.message || dict.DEFAULT;
}
