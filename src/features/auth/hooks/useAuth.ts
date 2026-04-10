import {
  getGoogleAuthRedirect,
  handleGoogleAuthCallback,
  login,
  logout,
  register,
} from "../api/auth.service";
import type { RegisterPayload } from "../api/auth.service";
import { useAuthStore } from "@/app/store/auth.store";

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

  const user =
    getFirstExistingValue(responseData, USER_KEYS) ??
    getFirstExistingValue(nestedData, USER_KEYS) ??
    null;

  const rawToken =
    getFirstExistingValue(responseData, TOKEN_KEYS) ??
    getFirstExistingValue(root, TOKEN_KEYS);

  const token = typeof rawToken === "string" ? rawToken : null;

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

      setAuth(user, token);

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

      setAuth(user, token);

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
        const directUserRaw = getFirstExistingParamValue(allParams, USER_KEYS);
        const directUser = parsePotentialUserPayload(directUserRaw);

        setAuth(directUser, directToken);
        return { user: directUser, token: directToken };
      }

      const code = searchParams.get("code");
      if (!code) {
        throw new Error("Parameter code OAuth tidak ditemukan");
      }

      const response = await handleGoogleAuthCallback({
        code,
        state: searchParams.get("state") ?? undefined,
        scope: searchParams.get("scope") ?? undefined,
        authuser: searchParams.get("authuser") ?? undefined,
        prompt: searchParams.get("prompt") ?? undefined,
      });

      const { user, token } = extractAuthFromResponse(response);
      if (!token) {
        throw new Error("Token login SSO tidak ditemukan dari response API");
      }

      setAuth(user, token);
      return { user, token, response };
    } catch (error) {
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
