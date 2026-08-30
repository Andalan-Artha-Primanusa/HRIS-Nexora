import { useEffect, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getRoleBasedDashboardPath } from "@/features/auth/utils/roleRedirect";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../AuthLayout";

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
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const ssoError = searchParams.get("error");
    if (ssoError) {
      setFormError(decodeURIComponent(ssoError));
      window.history.replaceState({}, document.title, "/login");
    }
  }, []);

  const validate = () => {
    const nextErrors: LoginFieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email address.";
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

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const result = await handleLogin({ email: email.trim(), password });

      if (result && "success" in result && result.success === false) {
        if (result.errors) {
          const firstError = Object.values(result.errors)[0];
          setFormError(String(firstError));
        }
        return;
      }

      if (result && "user" in result && result.user) {
        if ((result.user as { must_change_password?: boolean }).must_change_password) {
          navigate("/force-reset-password", { replace: true });
          return;
        }

        navigate(getRoleBasedDashboardPath(result.user));
      }
    } catch (err: unknown) {
      const errorObj = err && typeof err === "object" ? (err as Record<string, unknown>) : {};
      setFormError(typeof errorObj.message === "string" ? errorObj.message : "An error occurred during login.");
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
      setFormError(typeof err === "string" ? err : "Google login failed.");
      setIsSsoSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account"
      footer={
        <p className="auth-footer">
          <button
            type="button"
            className="auth-footer-link"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
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
            placeholder="you@company.com"
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
              <AlertCircle size={14} />
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
              placeholder="Enter your password"
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
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="auth-field-error">
              <AlertCircle size={14} />
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div className="auth-field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }}
            />
            Remember me
          </label>
        </div>

        {formError && <p className="auth-form-error">{formError}</p>}

        <button
          type="submit"
          className="auth-primary-button"
          disabled={isSubmitting || isSsoSubmitting}
        >
          {isSubmitting ? <Loader2 size={18} className="auth-button-spinner" /> : null}
          Sign In
        </button>

        <button
          type="button"
          className="auth-social-button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || isSsoSubmitting}
        >
          {isSsoSubmitting ? <Loader2 size={18} className="auth-button-spinner" /> : null}
          {isSsoSubmitting ? "Redirecting..." : "Continue with Google"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
