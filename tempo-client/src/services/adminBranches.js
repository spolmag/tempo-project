import { apiFetch } from "../lib/api.js";

const BASE = "/api/admin/branches";

// Filters: {q, active}. Empty values are left out of the URL.
export function listBranches(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "" && value != null) params.set(key, value);
  }
  const qs = params.toString();
  return apiFetch(qs ? `${BASE}?${qs}` : BASE);
}

export function getBranch(id) {
  return apiFetch(`${BASE}/${id}`);
}

export function createBranch(data) {
  return apiFetch(BASE, { method: "POST", body: JSON.stringify(data) });
}

export function updateBranch(id, data) {
  return apiFetch(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function setBranchActive(id, isActive) {
  return apiFetch(`${BASE}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}
