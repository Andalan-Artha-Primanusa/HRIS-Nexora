const AuthLeftPanel = () => {
  return (
    <div className="left-wrapper">
      {/* BACKGROUND */}
      <div className="left-bg"></div>

      {/* GLOW EFFECT */}
      <div className="left-glow top"></div>
      <div className="left-glow bottom"></div>

      {/* CONTENT */}
      <div className="left-content">
        
        {/* BRAND */}
        <div className="left-brand">
          <div className="brand-icon">🔐</div>
          <div>
            <h1>Bastion</h1>
            <p>Enterprise Tier</p>
          </div>
        </div>

        {/* HERO */}
        <div className="left-hero-container">
        
        <div className="glass-panel inner-glow hero-card">
            <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoJH-7MhitC-wD3dg9_NL3i3sFEMnQGGkIoO6SWruZ3lEpSoJalvrjCrCc8n8vPXEeIEiMm2AEPKnxblatZqwsmH0gde0tbiNh0KMq7Tv0nxE0yYWj3KOMaIfg9mntVNYlenx_OEUsVTrz8uHnWGdpHluPKQ1j_w_n8RE00LtLIpAeT8HK3apXghxSWVWSgXSkeGy_MGNtuHdqwvgn7iosFjnO-GVWjZfKjJdbqT8jkE35rgBR6p1TNBm8vC9Q_TbmXd8o0O3ILnzQ"
            className="hero-img"
            />
        </div>

        {/* FLOATING BADGE */}
        <div className="encryption-badge">
            🔐 256-bit AES Active
        </div>

        </div>

        {/* TAGLINE */}
        <h2 className="font-headline big-title">
        Dari Absensi Sampai Gajian, Semua Beres
        </h2>

        <p>
          Automate your human resources ecosystem with secure and intuitive system.
        </p>

      </div>
    </div>
  );
};

export default AuthLeftPanel;