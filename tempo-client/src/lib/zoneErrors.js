const ERROR_TEXT = {
  th: {
    MISSING_FIELDS: "กรุณากรอกรหัสโซน ชื่อโซน (ไทย) และชื่อโซน (อังกฤษ)",
    CODE_EXISTS: "รหัสโซนนี้ถูกใช้ในสาขานี้แล้ว",
    INVALID_ZONE_TYPE: "ประเภทโซนไม่ถูกต้อง",
    INVALID_CAPACITY:
      "จำนวนนักเรียนสูงสุดต้องระบุเป็นตัวเลขจำนวนเต็ม ตั้งแต่ 1 ขึ้นไป",
    INVALID_PARENT: "ไม่สามารถเลือกโซนเดียวกันเป็นโซนหลักได้",
    PARENT_NOT_FOUND: "ไม่พบโซนหลักในสาขานี้",
    CIRCULAR_PARENT: "ไม่สามารถเลือกโซนย่อยของตัวเองมาเป็นโซนหลักได้",
    BRANCH_NOT_FOUND: "ไม่พบข้อมูลสาขา",
    ZONE_NOT_FOUND: "ไม่พบข้อมูลโซน",
    INVALID_STATUS: "สถานะไม่ถูกต้อง",
    NO_CHANGES: "ไม่มีข้อมูลเปลี่ยนแปลง",
    FALLBACK: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
  },
  en: {
    MISSING_FIELDS: "Please fill in zone code, Thai name, and English name",
    CODE_EXISTS: "This zone code is already in use in this branch",
    INVALID_ZONE_TYPE: "Invalid zone type",
    INVALID_CAPACITY: "Max capacity must be a whole number of at least 1",
    INVALID_PARENT: "A zone cannot be its own parent",
    PARENT_NOT_FOUND: "Parent zone not found in this branch",
    CIRCULAR_PARENT: "Cannot set a descendant subzone as the parent zone",
    BRANCH_NOT_FOUND: "Branch not found",
    ZONE_NOT_FOUND: "Zone not found",
    INVALID_STATUS: "Invalid status value",
    NO_CHANGES: "No changes to save",
    FALLBACK: "Something went wrong, please try again",
  },
};

export function getZoneError(err, lang = "th") {
  const dict = ERROR_TEXT[lang] ?? ERROR_TEXT.th;
  return dict[err?.code] ?? dict.FALLBACK;
}
