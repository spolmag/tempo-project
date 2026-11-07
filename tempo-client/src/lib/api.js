import {
  getToken,
  clearSession,
  updateStoredUser,
  getCurrentBranch,
  removeBranch,
} from "./session.js";

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  // Returns null if there is no token or it has expired
  const token = getToken();
  // Current branch (null when logged out or no branch assigned)
  const branch = token ? getCurrentBranch() : null;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(branch && { "X-Branch-Id": branch.id }),
        ...options.headers, // a caller can still overide any header
      },
    });
  } catch {
    const error = new Error("Cannot connect to the server");
    error.status = 0;
    error.code = "NETWORK_ERROR";
    throw error;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Token expired or invalid (a wrong password at login is also 401, so skip login)
    if (res.status === 401 && path !== "/api/auth/login") {
      clearSession();
      window.dispatchEvent(new Event("auth:expired"));
    }

    // Admin reset this user's password while they were logged in
    if (res.status === 403 && data.code === "PASSWORD_CHANGE_REQUIRED") {
      updateStoredUser({ mustChangePassword: true });
      window.dispatchEvent(new Event("auth:must-change-password"));
    }

    // Branch access was remove or the branch was close while logged in:
    // Drop it from the list so the next request uses another branch
    if (res.status === 403 && data.code === "BRANCH_FORBIDDEN" && branch) {
      removeBranch(branch.id);
      window.dispatchEvent(new Event("auth:branch-invalid"));
    }

    const error = new Error(data.message || "Request failed");
    error.status = res.status;
    error.code = data.code;
    throw error;
  }

  return data;
}
