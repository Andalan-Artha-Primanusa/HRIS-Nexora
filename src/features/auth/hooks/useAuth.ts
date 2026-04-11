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

const extractAuthFromResponse = (response: { data?: unknown }) => {
  const root = toRecord(response.data);
  const responseData = toRecord(root.data ?? root);
  const nestedData = toRecord(responseData.data);

  // 🔒 SECURITY: Debug logging for response structure
  console.log("[Auth] Response structure:", {
    hasRootData: !!root.data,
    rootKeys: Object.keys(root),
    responseDataKeys: Object.keys(responseData),
    nestedDataKeys: Object.keys(nestedData),
  });

  let user =
    getFirstExistingValue(responseData, USER_KEYS) ??
    getFirstExistingValue(nestedData, USER_KEYS) ??
    null;

  // 🔒 SECURITY: Normalize user roles and permissions to ensure consistent structure
  if (user && typeof user === "object") {
    const userObj = user as any;
    
    // Normalize roles - ensure it's always an array of Role objects
    const normalizedRoles: any[] = [];
    if (Array.isArray(userObj.roles)) {
      for (const role of userObj.roles) {
        if (typeof role === "string") {
          // If role is a string, wrap it in a Role object
          normalizedRoles.push({ id: 0, name: role });
        } else if (typeof role === "object" && role) {
          // If role is an object, clean up Laravel's pivot data and normalize
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
                  // Remove Laravel pivot data
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
    
    // Extract all permissions from roles and use them as top-level permissions
    // This ensures hasPermission() works correctly
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
    
    // Merge with any existing top-level permissions
    if (Array.isArray(userObj.permissions)) {
      for (const permission of userObj.permissions) {
        if (permission.name && !allPermissions.has(permission.name)) {
          allPermissions.set(permission.name, permission);
        }
      }
    }
    
    userObj.permissions = Array.from(allPermissions.values());
    
    // Log untuk debugging roles
    console.log("[Auth] User extracted:", {
      name: userObj.name,
      email: userObj.email,
      roles: userObj.roles.map((r: any) => ({ id: r.id, name: r.name })),
      permissionCount: userObj.permissions.length,
    });
  }

  const rawToken =
    getFirstExistingValue(responseData, TOKEN_KEYS) ??
    getFirstExistingValue(nestedData, TOKEN_KEYS) ??
    getFirstExistingValue(root, TOKEN_KEYS);

  const token = typeof rawToken === "string" ? rawToken : null;

  // 🔒 SECURITY: Debug logging for extracted values
  console.log("[Auth] Extracted auth data:", {
    foundToken: !!token,
    foundUser: !!user,
    userEmail: (user as any)?.email ?? "N/A",
    tokenLength: token?.length ?? 0,
  });

  return { user, token };
};

const getFirstExistingParamValue = (params: URLSearchParams[], keys: string[]) => {
  for (const key of keys) {
    for (const paramSet of params) {
      const value = paramSet.get(key);
      if (value) {
        return value;
      }
    }
  }

  return null;
};

const parsePotentialUserPayload = (value: string | null) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch {
      return { name: value };
    }
  }
};

const normalizeAuthError = (error: unknown, fallbackMessage: string) => {
  const parsedError = toRecord(error);
  const response = toRecord(parsedError.response);
  const responseData = toRecord(response.data);

  const responseMessage = responseData.message;
  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }

  const errorMessage = parsedError.message;
  if (typeof errorMessage === "string" && errorMessage.trim()) {
    return errorMessage;
  }

  return fallbackMessage;
};

export const useAuth = () => {
  const setAuth = useAuthStore.getState().setAuth;
  const clearAuth = useAuthStore.getState().logout;

  const handleLogin = async (payload: { email: string; password: string }) => {
    try {
      const res = await login(payload);
      const { user, token } = extractAuthFromResponse(res);

      if (!token) {
        throw new Error("Token login tidak ditemukan dari response API");
      }

      if (!user) {
        throw new Error("User data tidak ditemukan dari response API");
      }

      setAuth(user as AuthUser, token);

      return { user, token, response: res };
    } catch (error) {
      throw normalizeAuthError(error, "Login gagal");
    }
  };

  const handleRegister = async (payload: RegisterPayload) => {
    try {
      const res = await register(payload);
      const { user, token } = extractAuthFromResponse(res);

      if (!token) {
        throw new Error("Token register tidak ditemukan dari response API");
      }

      if (!user) {
        throw new Error("User data tidak ditemukan dari response API");
      }

      setAuth(user as AuthUser, token);

      return { user, token, response: res };
    } catch (error) {
      throw normalizeAuthError(error, "Register gagal");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await getGoogleAuthRedirect();
      const responseData = response.data?.data ?? response.data;
      const redirectUrl =
        responseData?.url ??
        responseData?.redirect_url ??
        responseData?.redirectUrl ??
        response.data?.url ??
        null;

      if (!redirectUrl) {
        throw new Error("URL redirect Google tidak ditemukan dari response API");
      }

      return redirectUrl as string;
    } catch (error) {
      throw normalizeAuthError(error, "Login with Google gagal");
    }
  };

  const handleGoogleCallback = async (searchParams: URLSearchParams) => {
    try {
      console.log("[GoogleCallback] Starting Google callback process");
      const hashText = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(hashText);
      const allParams = [searchParams, hashParams];

      const oauthError =
        getFirstExistingParamValue(allParams, ["error_description"]) ??
        getFirstExistingParamValue(allParams, ["error"]);

      if (oauthError) {
        throw new Error(oauthError);
      }

      const directToken = getFirstExistingParamValue(allParams, TOKEN_KEYS);
      if (directToken) {
        console.log("[GoogleCallback] Found direct token in params");
        const directUserRaw = getFirstExistingParamValue(allParams, USER_KEYS);
        const directUser = parsePotentialUserPayload(directUserRaw);

        setAuth(directUser, directToken);
        return { user: directUser, token: directToken };
      }

      const code = searchParams.get("code");
      if (!code) {
        throw new Error("Parameter code OAuth tidak ditemukan");
      }

      console.log("[GoogleCallback] Calling backend with OAuth code");
      const response = await handleGoogleAuthCallback({
        code,
        state: searchParams.get("state") ?? undefined,
        scope: searchParams.get("scope") ?? undefined,
        authuser: searchParams.get("authuser") ?? undefined,
        prompt: searchParams.get("prompt") ?? undefined,
      });

      console.log("[GoogleCallback] Backend response received");
      const { user, token } = extractAuthFromResponse(response);
      if (!token) {
        console.error("[GoogleCallback] Token not found in response", { response });
        throw new Error("Token login SSO tidak ditemukan dari response API");
      }

      if (!user) {
        console.error("[GoogleCallback] User not found in response", { response });
        throw new Error("User data tidak ditemukan dari response API");
      }

      console.log("[GoogleCallback] Setting auth with user and token");
      setAuth(user as AuthUser, token);
      return { user, token, response };
    } catch (error) {
      console.error("[GoogleCallback] Error in handleGoogleCallback:", error);
      throw normalizeAuthError(error, "Login Google SSO gagal");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore logout API error and continue clearing local auth state
    } finally {
      clearAuth();
    }
  };

  return { handleLogin, handleRegister, handleGoogleLogin, handleGoogleCallback, handleLogout };
};
