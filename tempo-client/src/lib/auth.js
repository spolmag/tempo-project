import { apiFetch } from "./api.js";
import { saveSession, clearSession, getStoredUser } from "./session.js";

export async function login(email, password) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveSession(data.token, data.user);
  return data.user;
}

// Returns null when there is no session or the token has expired
export function getUser() {
  return getStoredUser();
}

export function logout() {
  clearSession();
}

export async function changePassword(currentPassword, newPassword) {
  return apiFetch("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
