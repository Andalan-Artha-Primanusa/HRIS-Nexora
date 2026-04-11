import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getRoleBasedDashboardPath } from "@/features/auth/utils/roleRedirect";
import AuthLayout from "../AuthLayout";

const GoogleCallbackPage = () => {
  const { handleGoogleCallback } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const processCallback = async () => {
      const searchParams = new URLSearchParams(window.location.search);

      // 🚨 Cek apakah backend mengirimkan ?error= (saat Google Auth gagal di sisi backend)
      const backendError = searchParams.get("error");
      if (backendError) {
        if (!isCancelled) {
          setErrorMessage(decodeURIComponent(backendError));
        }
        return;
      }

      try {
        // handleGoogleCallback di useAuth.ts sudah menangani:
        // - ?token=xxx  → langsung disimpan ke store (dari backend redirect)
        // - ?user=xxx   → di-parse sebagai user object
        // - ?code=xxx   → dipakai untuk call API callback (alur lama, tidak dipakai lagi)
        const authResult = await handleGoogleCallback(searchParams);
        if (!isCancelled) {
          navigate(getRoleBasedDashboardPath(authResult.user), { replace: true });
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setErrorMessage(typeof err === "string" ? err : "Google SSO callback gagal.");
        }
      }
    };

    void processCallback();

    return () => {
      isCancelled = true;
    };
  }, [handleGoogleCallback, navigate]);

  return (
    <AuthLayout
      title={errorMessage ? "Login Gagal" : "Signing you in..."}
      subtitle="Google SSO"
      footer={
        <p className="auth-footer">
          Having trouble?{" "}
          <button
            type="button"
            className="auth-footer-link"
            onClick={() => navigate("/login", { replace: true })}
          >
            Back to Login
          </button>
        </p>
      }
    >
      <div className="auth-form">
        {errorMessage ? (
          <>
            <p className="auth-form-error">{errorMessage}</p>
            <button
              type="button"
              className="auth-primary-button"
              onClick={() => navigate("/login", { replace: true })}
            >
              Return to Login
            </button>
          </>
        ) : (
          <p className="auth-field-error" style={{ color: "#1f6db8" }}>
            <Loader2 size={16} className="auth-button-spinner" />
            Memproses autentikasi Google...
          </p>
        )}
      </div>
    </AuthLayout>
  );
};

export default GoogleCallbackPage;
