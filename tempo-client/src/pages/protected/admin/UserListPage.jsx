import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  listUsers,
  setUserActive,
  resetUserPassword,
} from "../../../services/adminUsers.js";
import { roleLabel, userName } from "../../../lib/userLabels.js";

const ROLES = ["ADMIN", "MANAGER", "STAFF", "TEACHER"];

const TEXT = {
  th: {
    title: "จัดการผู้ใช้งาน",
    add: "+ เพิ่มผู้ใช้",
    search: "ค้นหาชื่อหรืออีเมล",
    searchBtn: "ค้นหา",
    allRoles: "ทุกตำแหน่ง",
    allStatus: "ทุกสถานะ",
    active: "สถานะบัญชั-เปิด",
    inactive: "สถานะบัญชั-ปิด",
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
    confirmActivate: "เปลี่ยนสถานะ->เปิด บัญชีผู้ใช้งาน",
    confirmDeactivate: "เปลี่ยนสถานะ->ปิด บัญชีผู้ใช้งาน",
    confirmReset: "รีเซ็ตรหัสผ่าน บัญชีผู้ใช้งาน",
    notice: {
      created:
        "สร้างผู้ใช้งานใหม่สำเร็จ ผู้ใช้งานจะต้องเปลี่ยนรหัสผ่านเมื่อเข้าระบบในครั้งแรก",
      updated: "บันทึกการแก้ไขข้อมูลผู้ใช้งานแล้ว",
      activated: "เปลี่ยนสถานะ -> เปิดบัญชีผู้ใช้งานแล้ว",
      deactivated: "เปลี่ยนสถานะ -> ปิดบัญชีผู้ใช้งานแล้ว",
      reset:
        "รหัสผ่านรีเซ็ตเป็นรหัสแรกเริ่ม ผู้ใช้ต้องเปลี่ยนรหัสผ่านเมื่อเข้าระบบครั้งถัดไป",
    },
  },
  en: {
    title: "User management",
    add: "+ Add user",
    search: "Search name or email",
    searchBtn: "Search",
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
    confirmActivate: "Activate the account of",
    confirmDeactivate: "Deactivate the account of",
    confirmReset: "Reset the password of",
    notice: {
      created:
        "User created. They must change the default password at first login",
      updated: "User details saved",
      activated: "Account activated",
      deactivated: "Account deactivated",
      reset: "Password reset to default. The user must change it at next login",
    },
  },
};
//

const selectClass =
  "bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60";

export default function UserListPage({ lang, user: me }) {
  const t = TEXT[lang];
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Notice key (created/updated/...), so the text follows the language
  const [notice, setNotice] = useState(location.state?.notice ?? "");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ q: "", role: "", active: "" });
  const [busyId, setBusyId] = useState(null);

  // Load users whenver the filters change.
  // State is set after the request finishes, not directly in the effect
  useEffect(() => {
    let cancelled = false;
    listUsers(filters)
      .then((data) => {
        if (cancelled) return;
        setUsers(data.users ?? []);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || TEXT.en.loadError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  // Change filters and show "Loading..." (the effect above does the fetch)
  function updateFilters(patch) {
    setLoading(true);
    setFilters((f) => ({ ...f, ...patch }));
  }

  function handleSearch(e) {
    e.preventDefault();
    updateFilters({ q: search.trim() });
  }

  function replaceUser(updated) {
    setUsers((list) =>
      list.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
    );
  }

  async function handleToggleActive(u) {
    const next = !u.isActive;
    const question = next ? t.confirmActivate : t.confirmDeactivate;
    if (!window.confirm(`${question} ${userName(u, lang)}?`)) return;

    setBusyId(u.id);
    setError("");
    setNotice("");
    try {
      const data = await setUserActive(u.id, next);
      replaceUser(data.user);
      setNotice(next ? "activated" : "deactivated");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReset(u) {
    if (!window.confirm(`${t.confirmReset} ${userName(u, lang)}?`)) return;

    setBusyId(u.id);
    setError("");
    setNotice("");
    try {
      const data = await resetUserPassword(u.id);
      replaceUser(data.user);
      setNotice("reset");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-64">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            className={`${selectClass} flex-1`}
          />
          <button
            type="submit"
            className="px-4 rounded-xl text-sm text-slate-200 border border-slate-700 hover:border-amber-500/60 transition"
          >
            {t.searchBtn}
          </button>
        </form>
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

      {notice && t.notice[notice] && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-xl px-4 py-3 mb-4">
          {t.notice[notice]}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-b-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
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
                          onClick={() => handleReset(u)}
                          disabled={busy}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-200 border border-slate-700 hover:border-amber-500/60 disabled:opacity-50 transition"
                        >
                          {t.reset}
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => handleToggleActive(u)}
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
    </div>
  );
}
