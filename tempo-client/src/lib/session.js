// src/lib/session.js
// sessionStorage: cleared when the tab or browser is closed
const storage = window.sessionStorage;

// One-time cleanup of tokens saved by the old localStorage version
localStorage.removeItem("token");
localStorage.removeItem("user");

// Branch selected in this tab
const BRANCH_KEY = "branchId";
// Last branch this user worked in, kept across logins (keep only an id, not sensitive)
const lastBranchKey = (userId) => `lastBranch:${userId}`;

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
  storage.removeItem(BRANCH_KEY); // new login starts with a fresh branch choice
}

export function clearSession() {
  storage.removeItem("token");
  storage.removeItem("user");
  storage.removeItem(BRANCH_KEY);
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

// ---------- Branch ----------

// Branches the login user can work in ([] when none)
export function getBranches() {
  return getStoredUser()?.branches ?? [];
}

// Current branch object, or null when the user has no branch
export function getCurrentBranch() {
  const user = getStoredUser();
  const branches = user?.branches ?? [];
  if (branches.length === 0) return null;

  const find = (id) => (id ? branches.find((b) => b.id === id) : undefined);
  return (
    find(storage.getItem(BRANCH_KEY)) ||
    find(localStorage.getItem(lastBranchKey(user.id))) ||
    branches[0]
  );
}

// Select a branch. Only ids from the user's own list are accepted
export function setCurrentBranch(branchId) {
  const user = getStoredUser();
  const branch = user?.branches?.find((b) => b.id === branchId);
  if (!branch) return null;

  storage.setItem(BRANCH_KEY, branch.id);
  localStorage.setItem(lastBranchKey(user.id), branch.id);
  return branch;
}

// The server rejected this branch (access removed or branch closed)
export function removeBranch(branchId) {
  const user = getStoredUser();
  if (!user) return;

  updateStoredUser({
    branches: (user.branches ?? []).filter((b) => b.id !== branchId),
  });
  if (storage.getItem(BRANCH_KEY) === branchId) storage.removeItem(BRANCH_KEY);
  if (localStorage.getItem(lastBranchKey(user.id)) === branchId) {
    localStorage.removeItem(lastBranchKey(user.id));
  }
}
