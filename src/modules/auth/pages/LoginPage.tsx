import { useState, useEffect } from "react";
import { useAuth } from "../hooks/userAuth";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

import AuthSplitLayout from "../components/AuthSplitLayout";
import AuthLeftPanel from "../components/AuthLeftPanel";
import LoginForm from "../components/LoginForm";
import Divider from "../components/Divider";
import SocialLogin from "../components/SocialLogin";
import AuthFooter from "../components/AuthFooter";

import "./LoginPage.css";

const LoginPage = () => {
  // =========================
  // HOOKS
  // =========================
  const navigate = useNavigate();
  const { handleLogin } = useAuth();
  const token = useAuthStore((state) => state.token);

  // =========================
  // SIDE EFFECT
  // =========================
  useEffect(() => {
    document.title = "Login - HRIS";
  }, []);

  // =========================
  // STATE
  // =========================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // HANDLER
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await handleLogin({ email, password });

      alert("Login berhasil");
      navigate("/");

    } catch (err: any) {
      alert(err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <AuthSplitLayout
      left={ <AuthLeftPanel /> }
      right={
        <div className="auth-right-content">
          <h2 className="title">Sign in to your account</h2>
          <p className="subtitle">
            Welcome back. Please enter your credentials.
          </p>

          <LoginForm
            email={email}
            password={password}
            loading={loading}
            onChange={(field, value) => {
              if (field === "email") setEmail(value);
              if (field === "password") setPassword(value);
            }}
            onSubmit={() => handleSubmit(new Event("submit") as any)}
          />

          <Divider />
          <SocialLogin />
          <AuthFooter />
        </div>
      }
    />
  );
};

export default LoginPage;