import { useEffect, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getRoleBasedDashboardPath } from "@/features/auth/utils/roleRedirect";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../AuthLayout";
import GoogleIcon from "../GoogleIcon";


interface LoginFieldErrors {
  email?: string;
  password?: string;
}

const LoginPage = () => {
  const { handleLogin, handleGoogleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSsoSubmitting, setIsSsoSubmitting] = useState(false);

  // 🚨 Tangkap ?error= yang dikirim backend saat SSO Google gagal
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const ssoError = searchParams.get("error");
    if (ssoError) {
      setFormError(decodeURIComponent(ssoError));
      // Bersihkan param dari URL tanpa reload halaman
      window.history.replaceState({}, document.title, "/login");
    }
  }, []);

  const validate = () => {
    const nextErrors: LoginFieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Invalid email is and now invalid";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) {
      return;
    }

    try {
      const result = await handleLogin({ email: email.trim(), password });
      
      // Check for validation errors returned by hook
      if (result && "success" in result && result.success === false) {
        if (result.errors) {
          // If the backend returns specific field errors
          const firstError = Object.values(result.errors)[0];
          setFormError(String(firstError));
        }
        return;
      }

      // Success path
      if (result && "user" in result) {
        navigate(getRoleBasedDashboardPath(result.user));
      }
    } catch (err: any) {
      // General errors are already handled by global toast, 
      // but we can show a fallback in the form if needed.
      setFormError(err.message || "Terjadi kesalahan saat login.");
    } finally {
      setIsSubmitting(false);
    }

  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setIsSsoSubmitting(true);

    try {
      const redirectUrl = await handleGoogleLogin();
      window.location.assign(redirectUrl);
    } catch (err: unknown) {
      setFormError(typeof err === "string" ? err : "Login with Google gagal.");
      setIsSsoSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="Secure Login"
      footer={
        <p className="auth-footer">
          Don't have an account?{" "}
          <button
            type="button"
            className="auth-footer-link"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Email email@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
              setFormError(null);
            }}
            className={`auth-input ${fieldErrors.email ? "auth-input-error" : ""}`}
          />
          {fieldErrors.email && (
            <p className="auth-field-error">
              <AlertCircle size={16} />
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="password">
            Password
          </label>
          <div className="auth-password-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
                setFormError(null);
              }}
              className={`auth-input ${fieldErrors.password ? "auth-input-error" : ""}`}
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="auth-field-error">
              <AlertCircle size={16} />
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="button"
          className="auth-link-button"
          onClick={() => setFormError("Fitur Forgot Password belum tersedia.")}
        >
          Forgot Password?
        </button>

        {formError && <p className="auth-form-error">{formError}</p>}

        <button
          type="submit"
          className="auth-primary-button"
          disabled={isSubmitting || isSsoSubmitting}
        >
          {isSubmitting ? <Loader2 size={18} className="auth-button-spinner" /> : null}
          Login
        </button>

        <button
          type="button"
          className="auth-social-button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || isSsoSubmitting}
        >
          {isSsoSubmitting ? <Loader2 size={18} className="auth-button-spinner" /> : <GoogleIcon />}
          {isSsoSubmitting ? "Redirecting to Google..." : "Login with Google (SSO)"}
        </button>

      </form>

    </AuthLayout>
  );
};

export default LoginPage;

