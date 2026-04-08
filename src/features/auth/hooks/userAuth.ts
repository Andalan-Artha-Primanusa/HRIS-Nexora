import { login } from "../services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { register } from "../services/auth.service";

export const useAuth = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (payload: {
    email: string;
    password: string;
  }) => {
    try {
      const res = await login(payload);

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

        const { user, token } = res.data;

        setAuth(user, token);

        return res;
    } catch (error: any) {
        throw error.response?.data || error;
    }
    };

  return { handleLogin, handleRegister };
};