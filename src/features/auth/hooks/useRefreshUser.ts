/**
 * 🔄 Hook untuk refresh user data dari server
 * Helps sync local user state dengan server (roles, permissions, profile updates)
 */
import { useAuthStore } from "@/app/store/auth.store";
import { api } from "@/shared/api/httpClient";

export const useRefreshUser = () => {
  const updateUser = useAuthStore((state) => state.updateUser);
  const user = useAuthStore((state) => state.user);

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
        // Ensure roles structure
        const updatedUser = {
          ...userData,
          roles: (userData.roles || []).map((r: any) => 
            typeof r === "string" ? { name: r } : r
          ),
          permissions: userData.permissions || [],
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
