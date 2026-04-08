interface Props {
  email: string;
  password: string;
  loading: boolean;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

const LoginForm = ({
  email,
  password,
  loading,
  onChange,
  onSubmit,
}: Props) => {
  return (
    <form
      className="stitch-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {/* EMAIL */}
        <div className="form-group">
        <label>Email Address</label>

        <div className="input-wrapper">
            <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => onChange("email", e.target.value)}
            />
            <div className="input-border"></div>
        </div>
        </div>

      {/* PASSWORD */}
        <div className="form-group">
        <div className="form-label-row">
            <label>Password</label>
            <span className="forgot">Forgot password?</span>
        </div>

        <div className="input-wrapper">
            <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => onChange("password", e.target.value)}
            />

            <span className="eye">👁</span>

            <div className="input-border"></div>
        </div>
        </div>

      {/* REMEMBER */}
      <div className="remember">
        <input type="checkbox" />
        <span>Stay signed in for 30 days</span>
      </div>

      {/* BUTTON */}
      <button className="btn-stitch" disabled={loading}>
        {loading ? "Loading..." : "Sign In →"}
      </button>
    </form>
  );
};

export default LoginForm;