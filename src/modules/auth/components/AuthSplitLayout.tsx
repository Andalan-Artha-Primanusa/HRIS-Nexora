interface Props {
  left: React.ReactNode;
  right: React.ReactNode;
}

const AuthSplitLayout = ({ left, right }: Props) => {
  return (
    <div className="auth-layout">
      {/* LEFT */}
      <div className="auth-left">
        {left}
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <div className="auth-right-content">
          {right}
        </div>
      </div>
    </div>
  );
};

export default AuthSplitLayout;