const VARIANT_STYLES = {
  success: {
    border: "border-emerald-500/40",
    iconBg: "bg-emerald-500/20 text-emerald-400",
    icon: "✓",
    badge: "text-emerald-400",
    confirmBtn:
      "bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950",
  },
  warning: {
    border: "border-amber-500/40",
    iconBg: "bg-amber-500/20 text-amber-400",
    icon: "!",
    badge: "text-slate-400",
    confirmBtn:
      "bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950",
  },
  danger: {
    border: "border-red-500/40",
    iconBg: "bg-red-500/20 text-red-400",
    icon: "!",
    badge: "text-red-400",
    confirmBtn: "bg-red-500 hover:bg-red-400 text-slate-950",
  },
};

export default function ActionModal({
  open,
  variant = "success",
  title,
  badge,
  heading,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  busy = false,
  busyLabel = "...",
  children,
}) {
  if (!open) return null;

  const v = VARIANT_STYLES[variant] || VARIANT_STYLES.success;
  const isTwoButton = typeof onCancel === "function";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-4">
      <div
        className={`w-full max-w-md rounded-2xl bg-slate-900 border p-6 shadow-2xl ${v.border}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${v.iconBg}`}
          >
            {v.icon}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">{title}</h2>
            {badge && (
              <p className={`text-xs font-medium ${v.badge}`}>{badge}</p>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 mb-5 text-xs text-slate-200 leading-relaxed">
          {heading && (
            <p className="font-semibold text-amber-400 mb-1">{heading}</p>
          )}
          {message && <p>{message}</p>}
          {children}
        </div>

        {isTwoButton ? (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-300 border border-slate-700 hover:border-slate-500 disabled:opacity-50 transition"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition disabled:opacity-50 ${v.confirmBtn}`}
            >
              {busy ? busyLabel : confirmLabel}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full py-2.5 rounded-full text-sm font-bold transition ${v.confirmBtn}`}
          >
            {confirmLabel}
          </button>
        )}
      </div>
    </div>
  );
}
