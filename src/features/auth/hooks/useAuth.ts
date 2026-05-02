import {
  getGoogleAuthRedirect,
  handleGoogleAuthCallback,
  login,
  logout,
  register,
} from "../api/auth.service";
import type { RegisterPayload } from "../api/auth.service";
import { useAuthStore } from "@/app/store/auth.store";
import type { AuthUser } from "@/shared/types/rbac.types";

const TOKEN_KEYS = ["token", "access_token", "jwt", "bearer_token"];
const USER_KEYS = ["user", "user_info", "userData", "profile"];

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const getFirstExistingValue = (source: UnknownRecord, keys: string[]) => {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }
  return null;
};

/**
 * Normalisasi data user dan token dari response API
 */
const extractAuthFromResponse = (data: unknown) => {
  const root = toRecord(data);
  const responseData = toRecord(root.data ?? root);
  const nestedData = toRecord(responseData.data);

  let user =
    getFirstExistingValue(responseData, USER_KEYS) ??
    getFirstExistingValue(nestedData, USER_KEYS) ??
    null;

  // Normalisasi roles dan permissions
  if (user && typeof user === "object") {
    const userObj = user as any;
    const normalizedRoles: any[] = [];
    
    if (Array.isArray(userObj.roles)) {
      for (const role of userObj.roles) {
        if (typeof role === "string") {
          normalizedRoles.push({ id: 0, name: role });
        } else if (typeof role === "object" && role) {
          const cleanedRole = {
            id: role.id || 0,
            name: role.name || "",
            display_name: role.display_name || "",
            description: role.description,
            permissions: Array.isArray(role.permissions)
              ? role.permissions.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  display_name: p.display_name || p.name,
                  description: p.description,
                }))
              : [],
            created_at: role.created_at,
            updated_at: role.updated_at,
          };
          normalizedRoles.push(cleanedRole);
        }
      }
    }
    userObj.roles = normalizedRoles;

    const allPermissions = new Map<string, any>();
    for (const role of normalizedRoles) {
      if (Array.isArray(role.permissions)) {
        for (const permission of role.permissions) {
          if (permission.name && !allPermissions.has(permission.name)) {
            allPermissions.set(permission.name, permission);
          }
        }
      }
    }

    if (Array.isArray(userObj.permissions)) {
      for (const permission of userObj.permissions) {
        if (permission.name && !allPermissions.has(permission.name)) {
          allPermissions.set(permission.name, permission);
        }
      }
    }

    userObj.permissions = Array.from(allPermissions.values());
  }

  const rawToken =
    getFirstExistingValue(responseData, TOKEN_KEYS) ??
    getFirstExistingValue(nestedData, TOKEN_KEYS) ??
    getFirstExistingValue(root, TOKEN_KEYS);

  const token = typeof rawToken === "string" ? rawToken : null;

  return { user, token };
};





export const useAuth = () => {
  const setAuth = useAuthStore.getState().setAuth;
  // const clearAuth = useAuthStore.getState().logout;

  const handleLogin = async (payload: { email: string; password: string }) => {
    try {
      const resData = await login(payload);
      const { user, token } = extractAuthFromResponse(resData);

      if (!token || !user) {
        throw { type: "general", message: "Data user atau token tidak valid" };
      }

      setAuth(user as AuthUser, token);
      return { user, token };
    } catch (error: any) {
      // Re-throw validation errors to be handled by the component
      if (error.type === "validation") {
        return { success: false, errors: error.errors };
      }
      throw error;
    }
  };

  const handleRegister = async (payload: RegisterPayload) => {
    try {
      const resData = await register(payload);
      const { user, token } = extractAuthFromResponse(resData);

      if (!token || !user) {
        throw { type: "general", message: "Data user atau token tidak valid" };
      }

      setAuth(user as AuthUser, token);
      return { user, token };
    } catch (error: any) {
      if (error.type === "validation") {
        return { success: false, errors: error.errors };
      }
      throw error;
    }
  };

  const handleGoogleLogin = async () => {
    const responseData = await getGoogleAuthRedirect();
    const data = responseData?.data ?? responseData;
    const redirectUrl = data?.url ?? data?.redirect_url ?? data?.redirectUrl ?? null;

    if (!redirectUrl) {
      throw new Error("URL redirect Google tidak ditemukan");
    }

    return redirectUrl as string;
  };

  const handleGoogleCallback = async (searchParams: URLSearchParams) => {
    // Cek apakah backend mengirim token dan user secara langsung (alur baru)
    const directToken = searchParams.get("token");
    const directUserStr = searchParams.get("user");

    if (directToken && directUserStr) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(directUserStr));
        const userWithRoles = extractAuthFromResponse({ data: { user: parsedUser } }).user || parsedUser;
        setAuth(userWithRoles as AuthUser, directToken);
        return { user: userWithRoles, token: directToken };
      } catch (e) {
        console.error("Failed to parse user from URL params", e);
      }
    }

    // Alur lama: memanggil API frontend dengan 'code'
    const code = searchParams.get("code");
    if (!code) throw new Error("Parameter code OAuth tidak ditemukan");

    const resData = await handleGoogleAuthCallback({
      code,
      state: searchParams.get("state") ?? undefined,
      scope: searchParams.get("scope") ?? undefined,
      authuser: searchParams.get("authuser") ?? undefined,
      prompt: searchParams.get("prompt") ?? undefined,
    });

    const { user, token } = extractAuthFromResponse(resData);
    if (!token || !user) {
      throw new Error("Token atau User SSO tidak ditemukan");
    }

    setAuth(user as AuthUser, token);
    return { user, token };
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // 🔒 Jika API logout gagal (misal token kadaluarsa), 
      // tetap panggil logout lokal untuk membersihkan sisa data.
    }
  };

  return {
    handleLogin,
    handleRegister,
    handleGoogleLogin,
    handleGoogleCallback,
    handleLogout,
  };
};
