/**
 * 🔄 Hook untuk refresh user data dari server
 * Helps sync local user state dengan server (roles, permissions, profile updates)
 */
import { useAuthStore } from "@/app/store/auth.store";
import { api } from "@/shared/api/httpClient";

export const useRefreshUser = () => {
  const updateUser = useAuthStore((state) => state.updateUser);
  const user = useAuthStore((state) => state.user);

  const normalizeRoles = (roles: any[] | undefined) =>
    (roles || []).map((r: any) => (typeof r === "string" ? { name: r } : r));

  const normalizeSingleRole = (role: any) => {
    if (!role) return null;

    if (typeof role === "string") {
      return { name: role.trim().toLowerCase() };
    }

    if (typeof role === "object") {
      const roleName = role.name || role.slug || role.role_name;
      if (typeof roleName === "string" && roleName.trim().length > 0) {
        return { ...role, name: roleName.trim().toLowerCase() };
      }
    }

    return null;
  };

  const refreshUserData = async () => {
    try {
      // Try multiple endpoints for getting user data
      const endpoints = ["/me", "/user", "/auth/me", "/profile"];
      let response = null;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          response = await api.get(endpoint);
          if (response?.data) break;
        } catch (err) {
          lastError = err;
          continue;
        }
      }

      if (!response?.data) {
        throw lastError || new Error("No endpoint found");
      }

      const userData = response.data?.data ?? response.data;
      
      if (userData && typeof userData === "object") {
        const incomingRoles = Array.isArray((userData as any).roles)
          ? normalizeRoles((userData as any).roles)
          : [];
        const fallbackRole =
          normalizeSingleRole((userData as any).role) ||
          normalizeSingleRole((userData as any).role_name) ||
          normalizeSingleRole((userData as any).position);
        if (incomingRoles.length === 0 && fallbackRole) {
          incomingRoles.push(fallbackRole);
        }
        const incomingPermissions = Array.isArray((userData as any).permissions)
          ? (userData as any).permissions
          : [];

        // Keep previous auth fields when refresh endpoint returns partial profile data.
        const fallbackRoles = Array.isArray(user?.roles) ? user.roles : [];
        const fallbackPermissions = Array.isArray(user?.permissions) ? user.permissions : [];

        const updatedUser = {
          ...(user || {}),
          ...userData,
          roles: incomingRoles.length > 0 ? incomingRoles : fallbackRoles,
          permissions: incomingPermissions.length > 0 ? incomingPermissions : fallbackPermissions,
        };
        
        // Update stored user dengan data terbaru
        updateUser(updatedUser as any);
        console.log("[RefreshUser] User data refreshed:", updatedUser);
        return updatedUser;
      }
    } catch (error) {
      console.warn("[RefreshUser] Failed to refresh user data:", error);
      // Fallback: try re-fetch auth info
      return null;
    }
  };

  return { refreshUserData, currentUser: user };
};
