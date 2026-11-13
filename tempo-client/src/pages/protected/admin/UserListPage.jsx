import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  listUsers,
  setUserActive,
  resetUserPassword,
} from "../../../services/adminUsers.js";
import { roleLabel, userName } from "../../../lib/userLabels.js";
import { getFormError } from "../../../lib/userErrors.js";

const ROLES = ["ADMIN", "MANAGER", "STAFF", "TEACHER"];

const TEXT = {
  th: {
    title: "จัดการผู้ใช้งาน",
    add: "➕ เพิ่มผู้ใช้",
    search: "ค้นหาจากชื่อหรืออีเมล",
    allRoles: "ทุกตำแหน่ง",
    allStatus: "ทุกสถานะ",
    active: "สถานะบัญชี-เปิด",
    inactive: "สถานะบัญชี-ปิด",
    name: "ชื่อ",
    role: "ตำแหน่ง",
    status: "สถานะ",
    actions: "จัดการ",
    mustChange: "ต้องเปลี่ยนรหัสผ่าน",
    edit: "แก้ไข",
    activate: "เปิดใช้งาน",
    deactivate: "ปิดใช้งาน",
    reset: "รีเซ็ตรหัสผ่าน",
    you: "คุณ",
    loading: "กำลังโหลด...",
    empty: "ไม่พบผู้ใช้งาน",
    loadError: "โหลดรายชื่อไม่สำเร็จ",
    cancel: "ยกเลิก",
    processing: "กำลังดำเนินการ",
    closeButton: "รับทราบ",
    modal: {
      reset: {
        confirmTitle: "ยืนยันการรีเซ็ตรหัสผ่าน",
        confirmDesc:
          "ต้องการรีเซ็ตรหัสผ่านของผู้ใช้งานนี้เป็นรหัสผ่านเริ่มต้นหรือไม่ ผู้ใช้งานจะต้องเปลี่ยนรหัสผ่านในการเข้าระบบครั้งถัดไป",
        confirmBtn: "ยืนยันรีเซ็ตรหัสผ่าน",
        successTitle: "รีเซ็ตรหัสผ่านสำเร็จ",
        successDesc:
          "รหัสผ่านถูกรีเซ็ตเป็นรหัสเริ่มต้นแล้ว ผู้ใช้งานจะต้องเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งถัดไป",
      },
      deactivate: {
        confirmTitle: "ยืนยันปิดใช้งานบัญชี",
        confirmDesc:
          "ต้องการเปลี่ยนสถานะบัญชีผู้ใช้งานนี้เป็นปิดใช้งานหรือไม่ ผู้ใช้งานจะไม่สามารถเข้าระบบได้จนกว่าจะเปิดใช้งานอีกครั้ง",
        confirmBtn: "ยืนยันปิดใช้งาน",
        successTitle: "ปิดใช้งานบัญชีสำเร็จ",
        successDesc: "เปลี่ยนสถานะบัญชีเป็นปิดใช้งานเรียบร้อยแล้ว",
      },
      activate: {
        confirmTitle: "ยืนยันเปิดใช้งานบัญชี",
        confirmDesc:
          "ต้องการเปลี่ยนสถานะบัญชีผู้ใช้งานนี้เป็นเปิดใช้งานหรือไม่ ผู้ใช้งานจะสามารถเข้าระบบได้ตามปกติ",
        confirmBtn: "ยืนยันเปิดใช้งาน",
        successTitle: "เปิดใช้งานบัญชีสำเร็จ",
        successDesc: "เปลี่ยนสถานะบัญชีเป็นเปิดใช้งานเรียบร้อยแล้ว",
      },
    },
  },
  en: {
    title: "User management",
    add: "➕ Add user",
    search: "Search name or email",
    allRoles: "All roles",
    allStatus: "All status",
    active: "Active",
    inactive: "Inactive",
    name: "Name",
    role: "Role",
    status: "Status",
    actions: "Actions",
    mustChange: "Password change pending",
    edit: "Edit",
    activate: "Activate",
    deactivate: "Deactivate",
    reset: "Reset password",
    you: "You",
    loading: "Loading...",
    empty: "No users found",
    loadError: "Could not load users",
    cancel: "Cancel",
    processing: "Processing...",
    closeButton: "Got it",
    modal: {
      reset: {
        confirmTitle: "Confirm password reset",
        confirmDesc:
          "Are you sure you want to reset this user's password to the default password? They will be required to change it on their next login",
        confirmBtn: "Reset password",
        successTitle: "Password reset successfully",
        successDesc:
          "The password has been reset to the default password. User must change it on their next login.",
      },
      deactivate: {
        confirmTitle: "Confirm account deactivation",
        confirmDesc:
          "Are you sure you want to deactivate this user account? They will not be able to sign in until reactivated.",
        confirmBtn: "Deactivate account",
        successTitle: "Account deactivated",
        successDesc: "The user account has been deactivated",
      },
      activate: {
        confirmTitle: "Confirm account activation",
        confirmDesc:
          "Are you sure you want to activate this user account so they can sign in again.",
        confirmBtn: "Activate account",
        successTitle: "Account activated",
        successDesc: "The user account has been activated",
      },
    },
  },
};

const selectClass =
  "bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60";

export default function UserListPage({ lang, user: me }) {
  const t = TEXT[lang];

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ q: "", role: "", active: "" });
  const [busyId, setBusyId] = useState(null);

  // {type: "reset" | "deactivate" | "activate", user}
  const [confirmAction, setConfirmAction] = useState(null);
  // {type: "reset" | "deactivate" | "activate", user}
  const [resultModal, setResultModal] = useState(null);

  // Real-time search handler with typing delay effect
  useEffect(() => {
    const q = search.trim();
    if (q === filters.q) return;
    const timer = setTimeout(() => {
      setLoading(true);
      setFilters((f) => ({ ...f, q }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filters.q]);

  // Load users whenever filters change
  useEffect(() => {
    let cancelled = false;
    listUsers(filters)
      .then((data) => {
        if (!cancelled) {
          setUsers(data.users ?? []);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getFormError(err, lang) || t.loadError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters, lang, t.loadError]);

  function updateFilters(patch) {
    setLoading(true);
    setFilters((f) => ({ ...f, ...patch }));
  }

  function replaceUser(updated) {
    setUsers((list) =>
      list.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
    );
  }

  async function executeConfirmedAction() {
    if (!confirmAction) return;
    const { type, user: targetUser } = confirmAction;

    setBusyId(targetUser.id);
    setError("");
    try {
      if (type === "reset") {
        const data = await resetUserPassword(targetUser.id);
        replaceUser(data.user);
        setConfirmAction(null);
        setResultModal({ type: "reset", user: data.user });
      } else {
        const nextActive = type === "activate";
        const data = await setUserActive(targetUser.id, nextActive);
        replaceUser(data.user);
        setConfirmAction(null);
        setResultModal({ type, user: data.user });
      }
    } catch (err) {
      setConfirmAction(null);
      setError(getFormError(err, lang));
    } finally {
      setBusyId(null);
    }
  }

  const confirmText = confirmAction ? t.modal[confirmAction.type] : null;
  const resultText = resultModal ? t.modal[resultModal.type] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-100">{t.title}</h1>
        <Link
          to="/admin/users/new"
          className="px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-slate-950 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 transition"
        >
          {t.add}
        </Link>
      </div>

      {/* Filters & Search with Clear Button */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-64">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            className={`${selectClass} w-full pr-10`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 flex items-center justify-center text-xs font-bold transition"
              title="Clear search"
            >
              X
            </button>
          )}
        </div>
        <select
          value={filters.role}
          onChange={(e) => updateFilters({ role: e.target.value })}
          className={selectClass}
        >
          <option value="">{t.allRoles}</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {roleLabel(r, lang)}
            </option>
          ))}
        </select>
        <select
          value={filters.active}
          onChange={(e) => updateFilters({ active: e.target.value })}
          className={selectClass}
        >
          <option value="">{t.allStatus}</option>
          <option value="true">{t.active}</option>
          <option value="false">{t.inactive}</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] tracking-wider text-slate-500 uppercase border-b border-slate-800">
              <th className="px-5 py-3 font-semibold">{t.name}</th>
              <th className="px-5 py-3 font-semibold">{t.role}</th>
              <th className="px-5 py-3 font-semibold">{t.status}</th>
              <th className="px-5 py-3 font-semibold text-right">
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-slate-500"
                >
                  {t.loading}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-slate-500"
                >
                  {t.empty}
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = u.id === me?.id;
                const busy = busyId === u.id;
                return (
                  <tr
                    key={u.id}
                    className="border-b border-slate-800/60 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-100">
                        {userName(u, lang)}
                        {isSelf && (
                          <span className="ml-2 text-[10px] text-amber-400 uppercase">
                            ({t.you})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {roleLabel(u.role, lang)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          u.isActive
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-slate-700/40 text-slate-400"
                        }`}
                      >
                        {u.isActive ? t.active : t.inactive}
                      </span>
                      {u.mustChangePassword && (
                        <span className="block mt-1 text-[10px] text-amber-400">
                          {t.mustChange}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2 whitespace-nowrap">
                        <Link
                          to={`/admin/users/${u.id}/edit`}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-200 border border-slate-700 hover:border-amber-500/60 transition"
                        >
                          {t.edit}
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({ type: "reset", user: u })
                          }
                          disabled={busy}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-200 border border-slate-700 hover:border-amber-500/60 disabled:opacity-50 transition"
                        >
                          {t.reset}
                        </button>
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                type: u.isActive ? "deactivate" : "activate",
                                user: u,
                              })
                            }
                            disabled={busy}
                            className={`px-3 py-1.5 rounded-lg text-xs border disabled:opacity-50 transition ${
                              u.isActive
                                ? "text-red-300 border-red-500/30 hover:bg-red-500/10"
                                : "text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
                            }`}
                          >
                            {u.isActive ? t.deactivate : t.activate}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Step 1: Confirm Action Modal (Reset Password / Deactivate / Activate) */}
      {confirmAction && confirmText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-4">
          <div
            className={`w-full max-w-md rounded-2xl bg-slate-900 border p-6 shadow-2xl ${
              confirmAction.type === "deactivate"
                ? "border-red-500/40"
                : "border-amber-500/40"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                  confirmAction.type === "deactivate"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                !
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  {confirmText.confirmTitle}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {confirmAction.user.email}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 mb-5 text-xs text-slate-200 leading-relaxed">
              <p className="font-semibold text-amber-400 mb-1">
                {userName(confirmAction.user, lang)}
              </p>
              <p>{confirmText.confirmDesc}</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={busyId === confirmAction.user.id}
                onClick={() => setConfirmAction(null)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-300 border border-slate-700 hover:border-slate-500 disabled:opacity-50 transition"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={busyId === confirmAction.user.id}
                onClick={executeConfirmedAction}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition disabled:opacity-50 ${
                  confirmAction.type === "deactivate"
                    ? "bg-red-500 hover:bg-red-400 text-slate-950"
                    : "bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950"
                }`}
              >
                {busyId === confirmAction.user.id
                  ? t.processing
                  : confirmText.confirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Success Result Modal */}
      {resultModal && resultText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/40 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-lg font-bold">
                ✓
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  {resultText.successTitle}
                </h2>
                <p className="text-xs text-emerald-400 font-medium">
                  {resultModal.user.email}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 mb-5 text-xs text-slate-200 leading-relaxed">
              <p className="font-semibold text-amber-400 mb-1">
                {userName(resultModal.user, lang)}
              </p>
              <p>{resultText.successDesc}</p>
            </div>

            <button
              type="button"
              onClick={() => setResultModal(null)}
              className="w-full py-2.5 rounded-full text-sm font-bold text-slate-950 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 transition"
            >
              {t.closeButton}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
