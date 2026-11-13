export const MONTHS = {
  th: [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

// Parse "YYYY-MM-DD" (or ISO string) into {year, month, day} numbers
export function parseIsoDate(value) {
  if (!value) return null;
  const clean = String(value).slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

// Build "YYYY-MM-DD" from western year, month (1-12), day (1-31)
export function toIsoDate(year, month, day) {
  if (!year || !month || !day) return "";
  const y = String(year).padStart(4, "0");
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Get how many days are in specify month (handles leap years like Feb 29)
export function getDaysInMonth(year, month) {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

// Format "YYYY-MM-DD" for display in tables/details (e.g. "13 พฤศจิกายน 2569" or "13 November 2026")
export function formatDate(value, lang = "th") {
  const parts = parseIsoDate(value);
  if (!parts) return "-";
  const monthList = MONTHS[lang] || MONTHS.th;
  const monthName = monthList[parts.month - 1];
  const displayYear = lang === "th" ? parts.year + 543 : parts.year;
  return `${parts.day} ${monthName} ${displayYear}`;
}
