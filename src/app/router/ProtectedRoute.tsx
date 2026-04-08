import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const token = useAuthStore((state) => state.token);

  // ❌ Jika tidak ada token → redirect login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Jika ada token → lanjut
  return children;
};

export default ProtectedRoute;