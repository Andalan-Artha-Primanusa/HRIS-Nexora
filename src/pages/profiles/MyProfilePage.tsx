import { Mail, ShieldCheck, UserCircle } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui";
import "@/shared/styles/CrudPage.css";
import "./ProfilesPage.css";

const MyProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const roles = user?.roles ?? [];
  const profile = user?.profile as Record<string, unknown> | undefined;
  const employee = user?.employee as Record<string, unknown> | undefined;

  const display = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
  };

  return (
    <div className="crud-page profiles-page">
      <Card className="page-header">
        <div className="page-header-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <UserCircle size={16} />
              <span>Akun Saya</span>
            </div>
            <h1 className="hero-title">Profile Saya</h1>
            <p className="hero-subtitle">
              Informasi akun login pribadi. Data karyawan lengkap tetap ada di menu Workforce.
            </p>
          </div>
        </div>
      </Card>

      <div className="profile-new-cards profile-card-sections--stack">
        <Card className="profile-details-card">
          <div className="profile-card-section-header">
            <div className="profile-card-section-icon">
              <UserCircle size={20} />
            </div>
            <h2>Identitas Akun</h2>
          </div>
          <div className="profile-details-grid">
            <div className="profile-card-item">
              <span className="profile-card-label">Nama</span>
              <span className="profile-card-value">{display(user?.name)}</span>
            </div>
            <div className="profile-card-item">
              <span className="profile-card-label">Email</span>
              <span className="profile-card-value">{display(user?.email)}</span>
            </div>
            <div className="profile-card-item">
              <span className="profile-card-label">Phone</span>
              <span className="profile-card-value">{display(profile?.phone)}</span>
            </div>
            <div className="profile-card-item">
              <span className="profile-card-label">Status Password</span>
              <span className="profile-card-value">
                {user?.must_change_password ? "Wajib reset password" : "Aktif"}
              </span>
            </div>
          </div>
        </Card>

        <Card className="profile-details-card">
          <div className="profile-card-section-header">
            <div className="profile-card-section-icon">
              <ShieldCheck size={20} />
            </div>
            <h2>Akses & Karyawan</h2>
          </div>
          <div className="profile-details-grid">
            <div className="profile-card-item">
              <span className="profile-card-label">Role</span>
              <span className="profile-card-value">
                {roles.length > 0 ? roles.map((role) => role.display_name || role.name).join(", ") : "-"}
              </span>
            </div>
            <div className="profile-card-item">
              <span className="profile-card-label">Employee Code</span>
              <span className="profile-card-value">{display(employee?.employee_code)}</span>
            </div>
            <div className="profile-card-item">
              <span className="profile-card-label">Department</span>
              <span className="profile-card-value">{display((employee?.department as Record<string, unknown> | undefined)?.name)}</span>
            </div>
            <div className="profile-card-item">
              <span className="profile-card-label">Position</span>
              <span className="profile-card-value">{display((employee?.position as Record<string, unknown> | undefined)?.name)}</span>
            </div>
          </div>
        </Card>

        <Card className="profile-details-card">
          <div className="profile-card-section-header">
            <div className="profile-card-section-icon">
              <Mail size={20} />
            </div>
            <h2>Catatan</h2>
          </div>
          <p className="profile-card-value" style={{ margin: 0, lineHeight: 1.7 }}>
            Menu ini hanya untuk akun yang sedang login. Untuk CRUD data profil karyawan gunakan menu Workforce atau Profile karyawan sesuai akses RBAC.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default MyProfilePage;
