import { auth } from "@clerk/nextjs/server";

export async function getUserRole() {
  const { sessionClaims } = auth();
  return sessionClaims?.metadata?.role || "user";
}

export async function hasRole(requiredRole) {
  const role = await getUserRole();
  return role === requiredRole;
}

export async function hasAnyRole(requiredRoles) {
  const role = await getUserRole();
  return requiredRoles.includes(role);
}

export function getRolePriority(role) {
  const priorities = { admin: 3, developer: 2, user: 1 };
  return priorities[role] || 0;
}
