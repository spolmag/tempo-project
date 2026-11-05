// Roles allowed to sign in through the staff portal
export const STAFF_ROLES = ["ADMIN", "MANAGER", "STAFF", "TEACHER"];

// Which roles each role is allow to manage
export const MANAGEABLE_ROLES = {
  ADMIN: [
    "ADMIN",
    "MANAGER",
    "STAFF",
    "TEACHER",
    "STUDENT",
    "PARENT",
    "CUSTOMER",
  ],
  MANAGER: ["STAFF", "TEACHER", "STUDENT", "PARENT", "CUSTOMER"],
  STAFF: ["TEACHER", "STUDENT", "PARENT", "CUSTOMER"],
};

export function isStaffRole(role) {
  return STAFF_ROLES.includes(role);
}

export function getManageableRoles(role) {
  return MANAGEABLE_ROLES[role] ?? [];
}

export function canManageRole(actorRole, targetRole) {
  return getManageableRoles(actorRole).includes(targetRole);
}
