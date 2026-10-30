// src/lib/session.js
// sessionStorage: cleared when the tab or browser is closed
const storage = window.sessionStorage;

// One-time cleanup of tokens saved by the old localStorage version
localStorage.removeItem("token");
localStorage.removeItem("user");

function isTokenExpired(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch {
    return true; // unreadable token = treat as expired
  }
}

export function saveSession(token, user) {
  storage.setItem("token", token);
  storage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  storage.removeItem("token");
  storage.removeItem("user");
}

export function getToken() {
  const token = storage.getItem("token");
  if (!token) return null;
  if (isTokenExpired(token)) {
    clearSession();
    return null;
  }
  return token;
}

export function getStoredUser() {
  if (!getToken()) return null; // also clears an expired session
  try {
    return JSON.parse(storage.getItem("user"));
  } catch {
    return null;
  }
}

export function updateStoredUser(changes) {
  const user = getStoredUser();
  if (user) storage.setItem("user", JSON.stringify({ ...user, ...changes }));
}
