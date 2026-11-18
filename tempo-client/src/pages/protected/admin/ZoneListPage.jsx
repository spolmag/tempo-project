import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import ActionModal from "../../../components/ActionModal.jsx";
import {
  listBranchZones,
  setZoneActive,
} from "../../../services/adminZones.js";
import {
  branchName,
  zoneName,
  zoneTypeLabel,
  ZONE_TYPE_LABELS,
} from "../../../lib/userLabels.js";
import { getZoneError } from "../../../lib/zoneErrors.js";
import { buildTreeList } from "../../../lib/tree.js";

const TEXT = {
  th: {
    back: "⬅️ กลับไปหน้ารายชื่อสาขา",
    title: "จัดการโซนและห้องเรียน",
    add: "➕ เพิ่มโซน / ห้อง",
    addSub: "➕ โซนย่อย",
    search: "ค้นหาจากรหัส - ชื่อโซน",
    allTypes: "ทุกประเภทโซน",
    allStatus: "ทุกสถานะ",
    active: "เปิดใช้งาน",
    inactive: "ปิดใช้งาน",
    code: "รหัสโซน",
    name: "ชื่อโซน / ห้อง",
    type: "ประเภท",
    capacity: "จำนวนนักเรียนสูงสุด / คลาส",
    status: "สถานะ",
    actions: "จัดการ",
    mainZoneBadge: "โซนหลัก",
    subZoneOf: "อยู่ภายใต้",
    people: "คน",
    edit: "แก้ไข",
    activate: "เปิดใช้งาน",
    deactivate: "ปิดใช้งาน",
    loading: "กำลังโหลด...",
    empty: "ไม่มีข้อมูลโซนในสาขานี้",
    loadError: "โหลดข้อมูลโซนไม่สำเร็จ",
    cancel: "ยกเลิก",
    processing: "กำลังดำเนินการ...",
    closeButton: "รับทราบ",
    modal: {
      deactivate: {
        confirmTitle: "ยืนยันการปิดใช้งานโซน",
        confirmDesc: "คุณต้องการเปลี่ยนสถานะโซนเป็นปิดใช้งาน?",
        confirmBtn: "ยืนยันปิดใช้งาน",
        successTitle: "ปิดใช้งานโซน",
        successDesc: "เปลี่ยนสถานะโซนเป็นปิดใช้งานแล้ว",
      },
      activate: {
        confirmTitle: "ยืนยันการเปิดใช้งานโซน",
        confirmDesc: "คุณต้องการเปลี่ยนสถานะโซนเป็นเปิดใช้งาน?",
        confirmBtn: "ยืนยันเปิดใช้งาน",
        successTitle: "เปิดใช้งานโซน",
        successDesc: "เปลี่ยนสถานะโซนเป็นเปิดใช้งานแล้ว",
      },
    },
  },
  en: {
    back: "⬅️ Back to branches",
    title: "Zone & Classrooms",
    add: "➕ Add zone / room",
    addSub: "➕ Subzone",
    search: "Search zone code or name",
    allTypes: "All zone types",
    allStatus: "All status",
    active: "Active",
    inactive: "Inactive",
    code: "Code",
    name: "Zone / Room name",
    type: "Type",
    capacity: "Capacity",
    status: "Status",
    actions: "Actions",
    mainZoneBadge: "Main Zone",
    subZoneOf: "Under",
    people: "students",
    edit: "Edit",
    activate: "Activate",
    deactivate: "Deactivate",
    loading: "Loading...",
    empty: "No zones found in this branch",
    loadError: "Could not load zones",
    cancel: "Cancel",
    processing: "Processing...",
    closeButton: "Got it",
    modal: {
      deactivate: {
        confirmTitle: "Confirm zone deactivation",
        confirmDesc: "Are you sure you want to deactivate this zone?",
        confirmBtn: "Deactivate zone",
        successTitle: "Zone deactivated",
        successDesc: "The zone status has been set to inactive",
      },
      activate: {
        confirmTitle: "Confirm zone activation",
        confirmDesc: "Are you sure you want to activate this zone?",
        confirmBtn: "Activate zone",
        successTitle: "Zone activated",
        successDesc: "The zone status has been set to active",
      },
    },
  },
};

const selectClass =
  "bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60";

export default function ZoneListPage({ lang }) {
  const t = TEXT[lang];
  const { branchId } = useParams();

  const [branch, setBranch] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ q: "", type: "", active: "" });
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
    let canceled = false;
    listBranchZones(branchId, filters)
      .then((data) => {
        if (!canceled) {
          setBranch(data.branch);
          setZones(data.zones ?? []);
          setError("");
        }
      })
      .catch((err) => {
        if (!canceled) setError(getZoneError(err, lang) || t.loadError);
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });
    return () => {
      canceled = true;
    };
  }, [branchId, filters, lang, t.loadError]);

  const orderedZones = useMemo(() => buildTreeList(zones), [zones]);

  function updateFilters(patch) {
    setLoading(true);
    setFilters((f) => ({ ...f, ...patch }));
  }

  function replaceZone(updated) {
    setZones((list) =>
      list.map((z) => (z.id === updated.id ? { ...z, ...updated } : z)),
    );
  }

  async function executeConfirmedAction() {
    if (!confirmAction) return;
    const { type, zone: targetZone } = confirmAction;

    setBusyId(targetZone.id);
    setError("");
    try {
      const nextActive = type === "activate";
      const data = await setZoneActive(targetZone.id, nextActive);
      replaceZone(data.zone);
      setConfirmAction(null);
      setResultModal({ type, zone: data.zone });
    } catch (err) {
      setConfirmAction(null);
      setError(getZoneError(err, lang));
    } finally {
      setBusyId(null);
    }
  }

  const confirmText = confirmAction ? t.modal[confirmAction.type] : null;
  const resultText = resultModal ? t.modal[resultModal.type] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/admin/branches"
        className="text-xs text-slate-400 hover:text-amber-400 transition"
      >
        {t.back}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{t.title}</h1>
          {branch && (
            <p className="text-sm text-amber-400 font-medium mt-1">
              {branch.code} — {branchName(branch, lang)}
            </p>
          )}
        </div>
        <Link
          to={`/admin/branches/${branchId}/zones/new`}
          className="px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-slate-950 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition"
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
          value={filters.type}
          onChange={(e) => updateFilters({ type: e.target.value })}
          className={selectClass}
        >
          <option value="">{t.allTypes}</option>
          {Object.keys(ZONE_TYPE_LABELS).map((zt) => (
            <option key={zt} value={zt}>
              {zoneTypeLabel(zt, lang)}
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
              <th className="px-5 py-3 font-semibold">{t.code}</th>
              <th className="px-5 py-3 font-semibold">{t.name}</th>
              <th className="px-5 py-3 font-semibold">{t.type}</th>
              <th className="px-5 py-3 font-semibold">{t.capacity}</th>
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
                  colSpan={6}
                  className="px-5 py-10 text-center text-slate-500"
                >
                  {t.loading}
                </td>
              </tr>
            ) : orderedZones.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-slate-500"
                >
                  {t.empty}
                </td>
              </tr>
            ) : (
              orderedZones.map((z) => {
                const busy = busyId === z.id;
                const isSubZone = z.depth > 0;
                return (
                  <tr
                    key={z.id}
                    className={`border-b border-slate-800/60 last:border-0 ${
                      isSubZone ? "bg-slate-950/35" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-mono text-xs font-bold text-amber-400">
                      <span
                        style={{ paddingLeft: `${z.depth * 20}px` }}
                        className={isSubZone ? "text-amber-300/85" : ""}
                      >
                        {isSubZone ? `↳ ${z.code}` : z.code}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-100">
                        {zoneName(z, lang)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {z.parent
                          ? `${t.subZoneOf}: ${z.parent.code} (${zoneName(z.parent, lang)})`
                          : t.mainZoneBadge}
                      </p>
                      {z.description && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {z.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {zoneTypeLabel(z.type, lang)}
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {z.type === "CLASSROOM" && z.maxCapacity
                        ? `${z.maxCapacity} ${t.people}`
                        : "-"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          z.isActive
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-slate-700/40 text-slate-400"
                        }`}
                      >
                        {z.isActive ? t.active : t.inactive}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2 whitespace-nowrap">
                        <Link
                          to={`/admin/branches/${branchId}/zones/new?parentId=${z.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs text-amber-300 border border-amber-500/40 hover:bg-amber-500/10 transition"
                        >
                          {t.addSub}
                        </Link>
                        <Link
                          to={`/admin/branches/${branchId}/zones/${z.id}/edit`}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-200 border border-slate-700 hover:border-amber-500/60 transition"
                        >
                          {t.edit}
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({
                              type: z.isActive ? "deactivate" : "activate",
                              zone: z,
                            })
                          }
                          disabled={busy}
                          className={`px-3 py-1.5 rounded-lg text-xs border disabled:opacity-50 transition ${
                            z.isActive
                              ? "text-red-300 border-red-500/30 hover:bg-red-500/10"
                              : "text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
                          }`}
                        >
                          {z.isActive ? t.deactivate : t.activate}
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
      <ActionModal
        open={Boolean(confirmAction && confirmText)}
        variant={confirmAction?.type === "deactivate" ? "danger" : "warning"}
        title={confirmText?.confirmTitle}
        badge={confirmAction?.zone.code}
        heading={zoneName(confirmAction?.zone, lang)}
        message={confirmText?.confirmDesc}
        cancelLabel={t.cancel}
        confirmLabel={confirmText?.confirmBtn}
        busy={busyId === confirmAction?.zone.id}
        busyLabel={t.processing}
        onCancel={() => setConfirmAction(null)}
        onConfirm={executeConfirmedAction}
      />

      {/* Step 2: Success Result Model */}
      <ActionModal
        open={Boolean(resultModal && resultText)}
        variant="success"
        title={resultText?.successTitle}
        badge={resultModal?.zone.code}
        heading={zoneName(resultModal?.zone, lang)}
        message={resultText?.successDesc}
        confirmLabel={t.closeButton}
        onConfirm={() => setResultModal(null)}
      />
    </div>
  );
}
