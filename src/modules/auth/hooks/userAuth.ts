import { login, register } from "../services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export const useAuth = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (payload: {
    email: string;
    password: string;
  }) => {
    try {
      const res = await login(payload);

      console.log("LOGIN RESPONSE:", res);

      const { user, token } = res.data;

      setAuth(user, token);

      return res;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  };

  const handleRegister = async (payload: any) => {
    try {
      const res = await register(payload);

      // ❌ JANGAN AUTO LOGIN
      return res;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  };

  return { handleLogin, handleRegister };
};