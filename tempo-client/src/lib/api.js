import { getToken, clearSession, updateStoredUser } from "./session.js";

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  // Returns null if there is no token or it has expired
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

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

    const error = new Error(data.message || "Request failed");
    error.status = res.status;
    error.code = data.code;
    throw error;
  }

  return data;
}
