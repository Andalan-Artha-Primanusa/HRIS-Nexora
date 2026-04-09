type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const toNonEmptyString = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const normalizeRoleName = (role: string) => role.trim().toLowerCase();

const getRoleName = (user: unknown) => {
  const userRecord = toRecord(user);
  const roleRecord = toRecord(userRecord.role);

  const roleCandidates: unknown[] = [
    roleRecord.name,
    roleRecord.slug,
    userRecord.role_name,
    userRecord.role,
    toRecord(userRecord.position).name,
    userRecord.position,
  ];

  const rolesArray = Array.isArray(userRecord.roles) ? userRecord.roles : [];
  if (rolesArray.length > 0) {
    const firstRole = toRecord(rolesArray[0]);
    roleCandidates.push(firstRole.name, firstRole.slug);
  }

  for (const candidate of roleCandidates) {
    const role = toNonEmptyString(candidate);
    if (role) {
      return normalizeRoleName(role);
    }
  }

  return null;
};

const getRoleSpecificPath = (roleName: string) => {
  if (
    roleName.includes("superadmin") ||
    roleName.includes("super admin") ||
    roleName.includes("admin")
  ) {
    return "/dashboard";
  }

  if (roleName.includes("hr") || roleName.includes("human resource")) {
    return "/hr-summary";
  }

  if (
    roleName.includes("manager") ||
    roleName.includes("lead") ||
    roleName.includes("head") ||
    roleName.includes("director")
  ) {
    return "/analytics";
  }

  if (
    roleName.includes("finance") ||
    roleName.includes("accounting") ||
    roleName.includes("payroll")
  ) {
    return "/payroll";
  }

  if (
    roleName.includes("recruit") ||
    roleName.includes("talent") ||
    roleName.includes("people ops")
  ) {
    return "/employees";
  }

  if (
    roleName.includes("employee") ||
    roleName.includes("staff") ||
    roleName.includes("user")
  ) {
    return "/attendance";
  }

  return null;
};

export const getRoleBasedDashboardPath = (user: unknown) => {
  const userRecord = toRecord(user);

  const explicitPathCandidates = [
    userRecord.redirect_to,
    userRecord.redirect_path,
    userRecord.dashboard_path,
    userRecord.home_path,
    userRecord.landing_page,
  ];

  for (const candidate of explicitPathCandidates) {
    const path = toNonEmptyString(candidate);
    if (path && path.startsWith("/")) {
      return path;
    }
  }

  const roleName = getRoleName(user);
  if (!roleName) {
    return "/dashboard";
  }

  return getRoleSpecificPath(roleName) ?? "/dashboard";
};

export const getRoleBasedDashboardPathFromStorage = () => {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) {
    return "/dashboard";
  }

  try {
    const parsedUser = JSON.parse(rawUser);
    return getRoleBasedDashboardPath(parsedUser);
  } catch {
    return "/dashboard";
  }
};
