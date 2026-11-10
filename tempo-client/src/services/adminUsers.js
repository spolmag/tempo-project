import { apiFetch } from "../lib/api.js";

const BASE = "/api/admin/users";

// filter: {q, role, active}. Empty values are left out of the URL.
export function listUsers(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "" && value != null) params.set(key, value);
  }
  const qs = params.toString();
  return apiFetch(qs ? `${BASE}?${qs}` : BASE);
}

export function getUserFormOptions() {
  return apiFetch(`${BASE}/options`);
}

export function getUser(id) {
  return apiFetch(`${BASE}/${id}`);
}

export function createUser(data) {
  return apiFetch(BASE, { method: "POST", body: JSON.stringify(data) });
}

export function updateUser(id, data) {
  return apiFetch(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function setUserActive(id, isActive) {
  return apiFetch(`${BASE}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export function resetUserPassword(id) {
  return apiFetch(`${BASE}/${id}/reset-password`, { method: "POST" });
}
