import { RBACUtils } from "@/shared/hooks/rbac";
import type { AuthUser } from "@/shared/types/rbac.types";

const getAuthUser = (user: unknown): AuthUser | null => {
  if (!user || typeof user !== "object") return null;
  const u = user as Record<string, unknown>;
  if (!Array.isArray(u.roles) || !Array.isArray(u.permissions)) return null;
  return u as AuthUser;
};

export const getRoleBasedDashboardPath = (user: unknown): string => {
  const authUser = getAuthUser(user);
  if (!authUser) return "/dashboard";

  if (RBACUtils.isSuperAdmin(authUser)) return "/dashboard";

  if (
    RBACUtils.canManageUsers(authUser) ||
    RBACUtils.canViewRoles(authUser) ||
    RBACUtils.hasPermission(authUser, "admin.audit.view")
  ) {
    return "/dashboard";
  }

  if (RBACUtils.hasPermission(authUser, "payroll.view")) return "/payroll";

  if (
    RBACUtils.hasPermission(authUser, "employee.create") ||
    RBACUtils.hasPermission(authUser, "recruitment.candidate.view")
  ) {
    return "/employees";
  }

  return "/employee-dashboard";
};

export const getRoleBasedDashboardPathFromStorage = (): string => {
  const rawUser = sessionStorage.getItem("user");
  if (!rawUser) return "/dashboard";
  try {
    return getRoleBasedDashboardPath(JSON.parse(rawUser));
  } catch {
    return "/dashboard";
  }
};
