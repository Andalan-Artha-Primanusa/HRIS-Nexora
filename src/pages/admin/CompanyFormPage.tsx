import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { showToast } from "@/shared/ui/toast";
import { companyService } from "@/features/company/api/company.service";
import { useAuthStore } from "@/app/store/auth.store";
import { RBACUtils } from "@/shared/hooks/rbac";
import { PERMISSIONS } from "@/shared/types/rbac.types";
import "@/shared/styles/CrudPage.css";
import "./CompanyManagementPage.css";

const emptyCompany = {
  code: "",
  name: "",
  legal_name: "",
  tax_number: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "Indonesia",
  status: "active",
  timezone: "Asia/Jakarta",
  currency: "IDR",
};

const CompanyFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  
  const canManage = RBACUtils.hasPermission(user, [
    PERMISSIONS.COMPANY_CREATE,
    PERMISSIONS.ADMIN_COMPANY_UPDATE,
  ]);

  const [form, setForm] = useState<Record<string, string>>(emptyCompany);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadCompany(id);
    }
  }, [id]);

  const loadCompany = async (companyId: string) => {
    setLoading(true);
    try {
      const data = await companyService.list();
      const company = data.find(c => c.id === Number(companyId));
      if (company) {
        setForm({
          code: company.code ?? "",
          name: company.name ?? "",
          legal_name: company.legal_name ?? "",
          tax_number: company.tax_number ?? "",
          email: company.email ?? "",
          phone: company.phone ?? "",
          address: company.address ?? "",
          city: company.city ?? "",
          country: company.country ?? "Indonesia",
          status: company.status ?? "active",
          timezone: company.timezone ?? "Asia/Jakarta",
          currency: company.currency ?? "IDR",
        });
      } else {
        showToast("Company tidak ditemukan", "error");
        navigate("/companies");
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Gagal memuat company", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveCompany = async () => {
    if (!form.name.trim()) {
      showToast("Nama company wajib diisi", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ""));
      if (id) {
        await companyService.update(Number(id), payload);
        showToast("Company berhasil diperbarui", "success");
      } else {
        await companyService.create(payload);
        showToast("Company berhasil dibuat", "success");
      }
      navigate("/companies");
    } catch (error: any) {
      showToast(error.response?.data?.message || "Gagal menyimpan company", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!canManage) {
    return (
      <div className="crud-page">
        <Card className="page-header">
          <div className="page-header-inner">
            <h1 className="hero-title">Akses Ditolak</h1>
            <p className="hero-subtitle">Anda tidak memiliki izin untuk mengelola company.</p>
            <Button variant="outline" onClick={() => navigate("/companies")}>Kembali</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="crud-page company-form-page">
      <div style={{ marginBottom: 16 }}>
        <Button variant="ghost" onClick={() => navigate("/companies")}>
          <ArrowLeft size={16} style={{ marginRight: 6 }} />
          Kembali ke Daftar Company
        </Button>
      </div>
      
      <Card className="company-form-card" style={{ maxWidth: 800, margin: '0 auto', display: 'block', gridColumn: 'unset' }}>
        <div className="company-list-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="hero-badge" style={{ margin: 0, padding: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}><Building2 size={20} /></div>
            <div>
              <h2 style={{ fontSize: 20, margin: 0, color: 'var(--color-text)' }}>{id ? "Edit Company" : "Create Company"}</h2>
              {id && <span style={{ color: 'var(--color-text-light)', fontSize: 13 }}>ID {id}</span>}
            </div>
          </div>
        </div>
        
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-light)' }}>Memuat data...</div>
        ) : (
          <>
            <div className="company-form-grid" style={{ gridTemplateColumns: '1fr 1fr', padding: '24px 0' }}>
              <label>Kode<input value={form.code} onChange={(event) => updateField("code", event.target.value)} placeholder="Contoh: AAP" /></label>
              <label>Nama Company<input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Contoh: PT Andalan Artha" /></label>
              <label>Legal Name<input value={form.legal_name} onChange={(event) => updateField("legal_name", event.target.value)} placeholder="Contoh: PT Andalan Artha Primanusa" /></label>
              <label>NPWP<input value={form.tax_number} onChange={(event) => updateField("tax_number", event.target.value)} placeholder="00.000.000.0-000.000" /></label>
              <label>Email<input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="contact@company.com" /></label>
              <label>Telepon<input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="021-xxxxxx" /></label>
              <label>Kota<input value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="Jakarta" /></label>
              <label>Negara<input value={form.country} onChange={(event) => updateField("country", event.target.value)} /></label>
              <label>Timezone<input value={form.timezone} onChange={(event) => updateField("timezone", event.target.value)} /></label>
              <label>Currency<input value={form.currency} onChange={(event) => updateField("currency", event.target.value)} /></label>
              <label style={{ gridColumn: '1 / -1' }}>Status
                <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className="company-address" style={{ gridColumn: '1 / -1' }}>Alamat<textarea value={form.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Alamat lengkap kantor" style={{ minHeight: 80 }} /></label>
            </div>
            
            <div className="company-actions" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button variant="outline" size="md" onClick={() => navigate("/companies")}>Batal</Button>
              <Button variant="primary" size="md" onClick={saveCompany} disabled={saving}>
                <Save size={16} />
                {saving ? "Menyimpan..." : "Simpan Company"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default CompanyFormPage;
