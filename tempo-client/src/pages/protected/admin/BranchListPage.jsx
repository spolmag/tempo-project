import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  listBranches,
  setBranchActive,
} from "../../../services/adminBranches.js";
import { branchName } from "../../../lib/userLabels.js";
import { getBranchError } from "../../../lib/branchErrors.js";

const TEXT = {
  th: {
    title: "จัดการสาขา",
    add: "➕ เพิ่มสาขา",
    search: "ค้นหาจากรหัสสาขา-ชื่อสาขา",
    allStatus: "ทุกสถานะ",
    active: "เปิดทำการ",
    inactive: "ปิดทำการ",
    code: "รหัส",
    name: "ชื่อสาขา",
    zones: "ห้องเรียน/โซน",
    status: "สถานะ",
    actions: "จัดการ",
    vat: "VAT",
    noVat: "ไม่จด VAT",
    manageZones: "ห้องเรียน/โซน",
    edit: "แก้ไข",
    activate: "เปิดทำการ",
    deactivate: "ปิดทำการ",
    loading: "กำลังโหลด...",
    empty: "ไม่พบข้อมูลสาขา",
    loadError: "โหลดข้อมูลสาขาไม่สำเร็จ",
    cancel: "ยกเลิก",
    processing: "กำลังดำเนินการ...",
    closeButton: "รับทราบ",
    modal: {
      deactivate: {
        confirmTitle: "ยืนยันการปิดทำการ",
        confirmDesc: "คุณต้องการเปลี่ยนสถานะสาขาเป็น ปิดทำการ?",
        confirmBtn: "ยืนยันปิดทำการ",
        successTitle: "สาขาเปลี่ยนสถานะเป็น ปิดทำการ",
        successDesc: "เปลี่ยนสถานะสาขาเป็นปิดทำการแล้ว",
      },
      activate: {
        confirmTitle: "ยืนยันเปิดทำการ",
        confirmDesc: "คุณต้องการเปลี่ยนสถานะสาขาเป็น เปิดทำการ?",
        confirmBtn: "ยืนยันเปิดทำการ",
        successTitle: "สาขาเปลี่ยนสถานะเป็น เปิดทำการ",
        successDesc: "เปลี่ยนสถานะสาขาเป็นเปิดทำการแล้ว",
      },
    },
  },
  en: {
    title: "Branch management",
    add: "➕ Add branch",
    search: "Search branch code or name",
    allStatus: "All status",
    active: "Active",
    inactive: "Inactive",
    code: "Code",
    name: "Branch name",
    zones: "Classroom/Zones",
    status: "Status",
    actions: "Actions",
    vat: "VAT",
    noVat: "Non-VAT",
    manageZones: "Classroom/Zones",
    edit: "Edit",
    activate: "Activate",
    deactivate: "Deactivate",
    loading: "Loading...",
    empty: "No branches found",
    loadError: "Could not load branches",
    cancel: "Cancel",
    processing: "Processing...",
    closeButton: "Got it",
    modal: {
      deactivate: {
        confirmTitle: "Confirm branch deactivation",
        confirmDesc: "Are you sure you want to deactivate this branch?",
        confirmBtn: "Deactivate branch",
        successTitle: "Branch deactivated",
        successDesc: "The branch status has been set to inactive",
      },
      activate: {
        confirmTitle: "Confirm branch activation",
        confirmDesc: "Are you sure you want to activate this branch?",
        confirmBtn: "Activate branch",
        successTitle: "Branch activated",
        successDesc: "The branch status has been set to active.",
      },
    },
  },
};

const selectClass =
  "bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60";

export default function BranchListPage({ lang }) {
  const t = TEXT[lang];

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ q: "", active: "" });
  const [busyId, setBusyId] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);
  const [resultModal, setResultModal] = useState(null);

  useEffect(() => {
    const q = search.trim();
    if (q === filters.q) return;
    const timer = setTimeout(() => {
      setLoading(true);
      setFilters((f) => ({ ...f, q }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filters.q]);

  useEffect(() => {
    let cancelled = false;
    listBranches(filters)
      .then((data) => {
        if (!cancelled) {
          setBranches(data.branches ?? []);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getBranchError(err, lang) || t.loadError);
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

  function replaceBranch(updated) {
    setBranches((list) =>
      list.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)),
    );
  }

  async function executeConfirmedAction() {
    if (!confirmAction) return;
    const { type, branch: targetBranch } = confirmAction;

    setBusyId(targetBranch.id);
    setError("");
    try {
      const nextActive = type === "activate";
      const data = await setBranchActive(targetBranch.id, nextActive);
      replaceBranch(data.branch);
      setConfirmAction(null);
      setResultModal({ type, branch: data.branch });
    } catch (err) {
      setConfirmAction(null);
      setError(getBranchError(err, lang));
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
          to="/admin/branches/new"
          className="px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-slate-950 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 transition"
        >
          {t.add}
        </Link>
      </div>

      {/* Filters & Search */}
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
              <th className="px-5 py-3 font-semibold">{t.code}</th>
              <th className="px-5 py-3 font-semibold">{t.name}</th>
              <th className="px-5 py-3 font-semibold">{t.zones}</th>
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
                  colSpan={5}
                  className="px-5 py-10 text-center text-slate-500"
                >
                  {t.loading}
                </td>
              </tr>
            ) : branches.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-slate-500"
                >
                  {t.empty}
                </td>
              </tr>
            ) : (
              branches.map((b) => {
                const busy = busyId === b.id;
                const zoneCount = b._count?.zones ?? 0;
                return (
                  <tr
                    key={b.id}
                    className="border-b border-slate-800/60 last:border-0"
                  >
                    <td className="px-5 py-4 font-mono text-xs font-bold text-amber-400">
                      {b.code}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-100">
                        {branchName(b, lang)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {b.phone || "-"} • {b.isVatRegistered ? t.vat : t.noVat}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{zoneCount}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          b.isActive
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-slate-700/40 text-slate-400"
                        }`}
                      >
                        {b.isActive ? t.active : t.inactive}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2 whitespace-nowrap">
                        <Link
                          to={`/admin/branches/${b.id}/zones`}
                          className="px-3 py-1.5 rounded-lg text-xs text-amber-300 border border-amber-500/40 hover:bg-amber-500/10 transition"
                        >
                          {t.manageZones} ({zoneCount})
                        </Link>
                        <Link
                          to={`/admin/branches/${b.id}/edit`}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-200 border border-slate-700 hover:border-amber-500/60 transition"
                        >
                          {t.edit}
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({
                              type: b.isActive ? "deactivate" : "activate",
                              branch: b,
                            })
                          }
                          disabled={busy}
                          className={`px-3 py-1.5 rounded-lg text-xs border disabled:opacity-50 transition ${
                            b.isActive
                              ? "text-red-300 border-red-500/30 hover:bg-red-500/10"
                              : "text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
                          }`}
                        >
                          {b.isActive ? t.deactivate : t.activate}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Step 1: Confirm Action Modal */}
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
                  {confirmAction.branch.code}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 mb-5 text-xs text-slate-200 leading-relaxed">
              <p className="font-semibold text-amber-400 mb-1">
                {branchName(confirmAction.branch, lang)}
              </p>
              <p>{confirmText.confirmDesc}</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={busyId === confirmAction.branch.id}
                onClick={() => setConfirmAction(null)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-300 border border-slate-700 hover:border-slate-500 disabled:opacity-50 transition"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={busyId === confirmAction.branch.id}
                onClick={executeConfirmedAction}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition disabled:opacity-50 ${
                  confirmAction.type === "deactivate"
                    ? "bg-red-500 hover:bg-red-400 text-slate-950"
                    : "bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950"
                }`}
              >
                {busyId === confirmAction.branch.id
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
                  {resultModal.branch.code}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 mb-5 text-xs text-slate-200 leading-relaxed">
              <p className="font-semibold text-amber-400 mb-1">
                {branchName(resultModal.branch, lang)}
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
