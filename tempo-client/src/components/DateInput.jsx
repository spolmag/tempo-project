import {
  MONTHS,
  parseIsoDate,
  toIsoDate,
  getDaysInMonth,
} from "../lib/date.js";

const TEXT = {
  th: {
    day: "วันที่",
    month: "เดือน",
    year: "ปี (พ.ศ.)",
    clear: "เคลียร์",
  },
  en: {
    day: "Day",
    month: "Month",
    year: "Year",
    clear: "Clear",
  },
};

export default function DateInput({
  value = "",
  onChange,
  lang = "th",
  minYear = 1940,
  maxYear = new Date().getFullYear(),
  disabled = false,
  className = "",
}) {
  const t = TEXT[lang] || TEXT.th;
  const months = MONTHS[lang] || MONTHS.th;

  // Split "YYYY-MM-DD" into parts (or empty if not fully selected)
  const parsed = parseIsoDate(value);
  const [rawY = "", rawM = "", rawD = ""] = value ? value.split("-") : [];

  const year = parsed ? parsed.year : rawY ? Number(rawY) : "";
  const month = parsed ? parsed.month : rawM ? Number(rawM) : "";
  const day = parsed ? parsed.day : rawD ? Number(rawD) : "";

  const maxDays = getDaysInMonth(year || 2024, month || 1);

  // Build list of years from maxYear down to minYear
  const years = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  function handlePartChange(nextY, nextM, nextD) {
    if (!nextY && !nextM && !nextD) {
      onChange("");
      return;
    }
    // Clamp day if month has fewer days (e.g. switch from Jan 31 to Feb)
    const validMaxDay = getDaysInMonth(nextY || 2024, nextM || 1);
    const safeDay = nextD && nextD > validMaxDay ? validMaxDay : nextD;

    const yStr = nextY ? String(nextY).padStart(4, "0") : "";
    const mStr = nextM ? String(nextM).padStart(2, "0") : "";
    const dStr = nextD ? String(safeDay).padStart(2, "0") : "";

    if (yStr && mStr && dStr) {
      onChange(toIsoDate(nextY, nextM, safeDay));
    } else {
      onChange(`${yStr}-${mStr}-${dStr}`);
    }
  }

  const selectBase =
    "bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 disabled:opacity-50";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Day */}
      <select
        value={day}
        disabled={disabled}
        onChange={(e) =>
          handlePartChange(
            year,
            month,
            e.target.value ? Number(e.target.value) : "",
          )
        }
        className={`${selectBase} w-24`}
      >
        <option value="">{t.day}</option>
        {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      {/* Month */}
      <select
        value={month}
        disabled={disabled}
        onChange={(e) =>
          handlePartChange(
            year,
            e.target.value ? Number(e.target.value) : "",
            day,
          )
        }
        className={`${selectBase} flex-1`}
      >
        <option value="">{t.month}</option>
        {months.map((name, idx) => (
          <option key={idx + 1} value={idx + 1}>
            {name}
          </option>
        ))}
      </select>

      {/* Year (2569 in TH, 2026 in EN, but stores western Year) */}
      <select
        value={year}
        disabled={disabled}
        onChange={(e) =>
          handlePartChange(
            e.target.value ? Number(e.target.value) : "",
            month,
            day,
          )
        }
        className={`${selectBase} w-32`}
      >
        <option value="">{t.year}</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {lang === "th" ? y + 543 : y}
          </option>
        ))}
      </select>

      {/* Clear date input value */}
      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange("")}
          title={t.clear}
          className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition shrink-0"
        >
          {t.clear}
        </button>
      )}
    </div>
  );
}
