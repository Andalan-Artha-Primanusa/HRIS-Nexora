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
            <section className="auth-visual-panel" aria-hidden="true" style={{ position: 'relative' }}>
        <img 
          src="/auth-bg.jpg" 
          alt="Office Meeting" 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(15, 159, 143, 0.65) 100%)', zIndex: 1 }}></div>
        
        {visualContent ?? (
          <div className="auth-visual-content" style={{ position: 'relative', zIndex: 10 }}>
            <div className="auth-visual-brand" style={{ background: '#0F9F8F', color: 'white', boxShadow: '0 8px 32px rgba(15, 159, 143, 0.3)' }}>
              <img src="/app-logo.png" alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
            </div>
            <h1 className="auth-visual-headline" style={{ color: '#111827' }}>Simplify People.<br />Empower Performance.</h1>
          </div>
        )}
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <header className="auth-card-header">
            <div className="auth-card-logo">
              <img src="/app-logo.png" alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
              <span className="auth-card-logo-text">HRIS</span>
            </div>
            <h1 className="auth-title">{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
          </header>
          {children}
          {footer}
          <div className="auth-copyright">
            &copy; {new Date().getFullYear()} HRIS Enterprise. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuthLayout;
