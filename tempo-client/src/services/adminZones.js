import { apiFetch } from "../lib/api.js";

const BRANCH_BASE = "/api/admin/branches";
const ZONE_BASE = "/api/admin/zones";

export function listBranchZones(branchId, params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  }
  const qs = search.toString();
  return apiFetch(
    qs
      ? `${BRANCH_BASE}/${branchId}/zones?${qs}`
      : `${BRANCH_BASE}/${branchId}/zones`,
  );
}

export function getZone(id) {
  return apiFetch(`${ZONE_BASE}/${id}`);
}

export function createZone(branchId, payload) {
  return apiFetch(`${BRANCH_BASE}/${branchId}/zones`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateZone(id, payload) {
  return apiFetch(`${ZONE_BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function setZoneActive(id, isActive) {
  return apiFetch(`${ZONE_BASE}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}
