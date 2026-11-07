import { apiFetch } from "./api.js";
import {
  saveSession,
  clearSession,
  getStoredUser,
  getCurrentBranch,
  setCurrentBranch,
} from "./session.js";

// Branch helpers for components
export { getBranches, getCurrentBranch } from "./session.js";
export { setCurrentBranch as selectBranch } from "./session.js";

export async function login(email, password) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveSession(data.token, data.user);

  // Pick the starting branch (last used, or the first one)
  const branch = getCurrentBranch();
  if (branch) setCurrentBranch(branch.id);

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
