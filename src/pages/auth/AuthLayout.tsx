import { useEffect, type ReactNode } from "react";
import "./AuthLayout.css";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  visualContent?: ReactNode;
}

const AuthLayout = ({ title, subtitle, children, footer, visualContent }: AuthLayoutProps) => {
  useEffect(() => {
    const isMobile = window.innerWidth <= 560;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    if (!isMobile) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <div className="auth-page">
      <section className="auth-visual-panel" aria-hidden="true">
        {visualContent ?? (
          <div className="auth-visual-content">
            <img src="/logo-mahya.png" alt="Mahya HRIS" className="auth-logo-image" />
            <p className="auth-visual-tagline">KELOLA SDM ,MAKSIMALKAN POTENSI</p>
          </div>
        )}
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <header className="auth-card-header">
            <h1 className="auth-title">{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
          </header>
          {children}
          {footer}

          <div className="auth-powered-by">
            <img src="/foto-berkemah.png" alt="BERKEMAH TEAM" className="auth-powered-by-image" />
            <div className="auth-powered-by-text">
              <span>Powered by</span>
              <strong>BERKEMAH TEAM</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuthLayout;
