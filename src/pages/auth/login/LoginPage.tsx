import { useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../AuthLayout";
import GoogleIcon from "../GoogleIcon";

interface LoginFieldErrors {
  email?: string;
  password?: string;
}

const LoginPage = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

    try {
      await handleLogin({ email: email.trim(), password });
      navigate("/dashboard");
    } catch (err: unknown) {
      setFormError(typeof err === "string" ? err : "Login gagal.");
    } finally {
      setIsSubmitting(false);
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

        <button type="submit" className="auth-primary-button" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 size={18} className="auth-button-spinner" /> : null}
          Login
        </button>

        <button
          type="button"
          className="auth-social-button"
          onClick={() => setFormError("Fitur Login with Google (SSO) belum tersedia.")}
        >
          <GoogleIcon />
          Login with Google (SSO)
        </button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;

