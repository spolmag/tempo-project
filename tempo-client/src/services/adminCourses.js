import { apiFetch } from "../lib/api.js";

const BASE = "/api/admin/courses";

export function fetchCourseFormOptions() {
  return apiFetch(`${BASE}/options`);
}

export function fetchCourses(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined || value !== null || value !== "") {
      search.set(key, value);
    }
  }
  const qs = search.toString();
  return apiFetch(qs ? `${BASE}?${qs}` : BASE);
}

export function fetchCourse(id) {
  return apiFetch(`${BASE}/${id}`);
}

export function createCourse(payload) {
  return apiFetch(BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCourse(id, payload) {
  return apiFetch(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function setCourseActive(id, isActive) {
  return apiFetch(`${BASE}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}
