import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import "./AuthLayout.css";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => {
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!pageRef.current) return;

    const rect = pageRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));
    const tiltX = `${((0.5 - clampedY) * 6).toFixed(2)}deg`;
    const tiltY = `${((clampedX - 0.5) * 8).toFixed(2)}deg`;
    const tiltXSoft = `${((0.5 - clampedY) * 3).toFixed(2)}deg`;
    const tiltYSoft = `${((clampedX - 0.5) * 4).toFixed(2)}deg`;

    pageRef.current.style.setProperty("--pointer-x", clampedX.toFixed(3));
    pageRef.current.style.setProperty("--pointer-y", clampedY.toFixed(3));
    pageRef.current.style.setProperty("--cursor-x", `${(clampedX * 100).toFixed(2)}%`);
    pageRef.current.style.setProperty("--cursor-y", `${(clampedY * 100).toFixed(2)}%`);
    pageRef.current.style.setProperty("--tilt-x", tiltX);
    pageRef.current.style.setProperty("--tilt-y", tiltY);
    pageRef.current.style.setProperty("--tilt-x-soft", tiltXSoft);
    pageRef.current.style.setProperty("--tilt-y-soft", tiltYSoft);
  };

  const handleMouseLeave = () => {
    if (!pageRef.current) return;

    pageRef.current.style.setProperty("--pointer-x", "0.5");
    pageRef.current.style.setProperty("--pointer-y", "0.5");
    pageRef.current.style.setProperty("--cursor-x", "50%");
    pageRef.current.style.setProperty("--cursor-y", "50%");
    pageRef.current.style.setProperty("--tilt-x", "0deg");
    pageRef.current.style.setProperty("--tilt-y", "0deg");
    pageRef.current.style.setProperty("--tilt-x-soft", "0deg");
    pageRef.current.style.setProperty("--tilt-y-soft", "0deg");
  };

  return (
    <div
      ref={pageRef}
      className="auth-page"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <section className="auth-visual-panel" aria-hidden="true">
        <div className="auth-ambient auth-ambient-one" />
        <div className="auth-ambient auth-ambient-two" />
        <div className="auth-ambient auth-ambient-three" />
        <div className="auth-orbit auth-orbit-one" />
        <div className="auth-orbit auth-orbit-two" />

        <div className="auth-brand-strip">
          <img src="/logo-mahya.png" alt="Mahya HRIS" className="auth-brand-strip-logo" />
        </div>

        <div className="auth-hris-widget auth-hris-widget-top">
          <p className="auth-widget-label">Attendance Today</p>
          <p className="auth-widget-value">97.8%</p>
        </div>
        <div className="auth-hris-widget auth-hris-widget-bottom">
          <p className="auth-widget-label">Payroll Processed</p>
          <p className="auth-widget-value">1,248</p>
        </div>
        <div className="auth-hris-tags">
          <span className="auth-hris-tag">Attendance</span>
          <span className="auth-hris-tag">Payroll</span>
          <span className="auth-hris-tag">Recruitment</span>
          <span className="auth-hris-tag">People Analytics</span>
        </div>

        <span className="auth-blob auth-blob-top-left" />
        <span className="auth-blob auth-blob-top-center" />
        <span className="auth-blob auth-blob-middle-right" />
        <span className="auth-blob auth-blob-bottom-left" />
        <div className="auth-hero-wrapper">
          <img
            src="/hris.jpg"
            alt="HRIS recruitment illustration"
            className="auth-hero-image"
          />
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <header className="auth-card-header">
            <h1 className="auth-title">{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
          </header>
          {children}
          {footer}
        </div>
      </section>
    </div>
  );
};

export default AuthLayout;
