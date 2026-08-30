import { useEffect, useMemo, useState } from "react";
import { Building2, Plus, RefreshCw, Save, ShieldCheck } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { showToast } from "@/shared/ui/toast";
import { companyService, type Company } from "@/features/company/api/company.service";
import { useAuthStore } from "@/app/store/auth.store";
import { RBACUtils } from "@/shared/hooks/rbac";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
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

const CompanyManagementPage = () => {
  const user = useAuthStore((state) => state.user);
  const canManage = RBACUtils.hasPermission(user, ["company.create", "admin.company.update"]);
  const canView = RBACUtils.hasPermission(user, ["company.view", "company.view_all", "admin.company.view"]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>(emptyCompany);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedCompany = useMemo(() => companies.find((company) => company.id === selectedId), [companies, selectedId]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await companyService.list();
      setCompanies(data);
    } catch (error: any) {
      showToast(error.response?.data?.message || "Gagal memuat company", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCompanies();
  }, []);

  useEffect(() => {
    if (!selectedCompany) {
      setForm(emptyCompany);
      return;
    }
    setForm({
      code: selectedCompany.code ?? "",
      name: selectedCompany.name ?? "",
      legal_name: selectedCompany.legal_name ?? "",
      tax_number: selectedCompany.tax_number ?? "",
      email: selectedCompany.email ?? "",
      phone: selectedCompany.phone ?? "",
      address: selectedCompany.address ?? "",
      city: selectedCompany.city ?? "",
      country: selectedCompany.country ?? "Indonesia",
      status: selectedCompany.status ?? "active",
      timezone: selectedCompany.timezone ?? "Asia/Jakarta",
      currency: selectedCompany.currency ?? "IDR",
    });
  }, [selectedCompany]);

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
      if (selectedId) {
        await companyService.update(selectedId, payload);
        showToast("Company berhasil diperbarui", "success");
      } else {
        await companyService.create(payload);
        showToast("Company berhasil dibuat", "success");
      }
      setSelectedId(null);
      await loadCompanies();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Gagal menyimpan company", "error");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (company: Company) => {
    try {
      await companyService.deactivate(company.id);
      showToast("Company dinonaktifkan", "success");
      await loadCompanies();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Gagal menonaktifkan company", "error");
    }
  };

  if (!canView) {
    return (
      <div className="crud-page">
        <Card className="hero-card">
          <div className="hero-card-inner">
            <div className="hero-content">
              <div className="hero-badge"><ShieldCheck size={16} /><span>Company</span></div>
              <h1 className="hero-title">Akses Ditolak</h1>
              <p className="hero-subtitle">Anda tidak memiliki izin untuk melihat company.</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="crud-page company-management-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge"><Building2 size={16} /><span>Multi Company</span></div>
            <h1 className="hero-title">Company Management</h1>
            <p className="hero-subtitle">Kelola company, legal entity, dan status operasional untuk scope HRIS.</p>
          </div>
          <div className="hero-actions">
            <Button variant="outline" size="md" onClick={loadCompanies} disabled={loading}>
              <RefreshCw size={16} />
              Refresh
            </Button>
            {canManage && (
              <Button variant="primary" size="md" onClick={() => setSelectedId(null)}>
                <Plus size={16} />
                Company Baru
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="company-grid">
        <Card className="company-list-card">
          <div className="company-list-header">
            <h2>Daftar Company</h2>
            <span>{companies.length} company</span>
          </div>
          <div className="company-list">
            {companies.map((company) => (
              <button
                className={`company-row ${selectedId === company.id ? "active" : ""}`}
                key={company.id}
                onClick={() => setSelectedId(company.id)}
              >
                <span>
                  <strong>{company.name}</strong>
                  <small>{company.code || "Tanpa kode"} · {company.city || "Kota belum diisi"}</small>
                </span>
                <em>{company.status || "active"}</em>
              </button>
            ))}
            {!loading && companies.length === 0 && <div className="company-empty">Belum ada company.</div>}
          </div>
        </Card>

        <Card className="company-form-card">
          <div className="company-list-header">
            <h2>{selectedId ? "Edit Company" : "Create Company"}</h2>
            {selectedCompany && <span>ID {selectedCompany.id}</span>}
          </div>
          <div className="company-form-grid">
            <label>Kode<input value={form.code} onChange={(event) => updateField("code", event.target.value)} /></label>
            <label>Nama Company<input value={form.name} onChange={(event) => updateField("name", event.target.value)} /></label>
            <label>Legal Name<input value={form.legal_name} onChange={(event) => updateField("legal_name", event.target.value)} /></label>
            <label>NPWP<input value={form.tax_number} onChange={(event) => updateField("tax_number", event.target.value)} /></label>
            <label>Email<input value={form.email} onChange={(event) => updateField("email", event.target.value)} /></label>
            <label>Telepon<input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} /></label>
            <label>Kota<input value={form.city} onChange={(event) => updateField("city", event.target.value)} /></label>
            <label>Negara<input value={form.country} onChange={(event) => updateField("country", event.target.value)} /></label>
            <label>Timezone<input value={form.timezone} onChange={(event) => updateField("timezone", event.target.value)} /></label>
            <label>Currency<input value={form.currency} onChange={(event) => updateField("currency", event.target.value)} /></label>
            <label>Status
              <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="company-address">Alamat<textarea value={form.address} onChange={(event) => updateField("address", event.target.value)} /></label>
          </div>
          <div className="company-actions">
            {selectedCompany?.status !== "inactive" && selectedCompany && canManage && (
              <Button variant="outline" size="md" onClick={() => deactivate(selectedCompany)}>Deactivate</Button>
            )}
            {canManage && (
              <Button variant="primary" size="md" onClick={saveCompany} disabled={saving}>
                <Save size={16} />
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CompanyManagementPage;
