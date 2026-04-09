import { login } from "../api/auth.service";
import { useAuthStore } from "@/app/store/auth.store";
import { register } from "../api/auth.service";

export const useAuth = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (payload: {
    email: string;
    password: string;
  }) => {
    try {
      const res = await login(payload);
      const responseData = res.data?.data ?? res.data;
      const user = responseData?.user ?? responseData?.user_info ?? responseData?.userData ?? responseData;
      const token = responseData?.token ?? res.data?.token ?? responseData?.access_token;

      if (!token) {
        throw new Error('Token login tidak ditemukan dari response API');
      }

      setAuth(user, token);

      return res;
    } catch (error: any) {
      throw error.response?.data?.message || error.message || "Login gagal";
    }
  };

  const handleRegister = async (payload: any) => {
    try {
      const res = await register(payload);
      const responseData = res.data?.data ?? res.data;
      const user = responseData?.user ?? responseData?.user_info ?? responseData?.userData ?? responseData;
      const token = responseData?.token ?? res.data?.token ?? responseData?.access_token;

      if (!token) {
        throw new Error('Token register tidak ditemukan dari response API');
      }

      setAuth(user, token);

      return res;
    } catch (error: any) {
      throw error.response?.data?.message || error.message || "Register gagal";
    }
  };

  return { handleLogin, handleRegister };
};
