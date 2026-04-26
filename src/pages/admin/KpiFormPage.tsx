import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { 
  Save, 
  User, 
  Calendar, 
  Target, 
  FileText,
  RefreshCw,
  ChevronLeft
} from "lucide-react";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { 
  createKpi, 
  updateKpi, 
  getKpiDetail 
} from "@/features/admin/api/kpi.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";
import "@/shared/styles/CrudPage.css";
import "../dashboard/overview/OverviewPage.css";

const KpiFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("error");

  const [formData, setFormData] = useState({
    employee_id: "",
    title: "",
    target: "",
    period: new Date().toISOString().slice(0, 7),
    description: "",
    achievement: "0"
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const empRes = await getAllEmployees();
        setEmployees(empRes);

        if (isEdit) {
          const kpiRes = await getKpiDetail(id);
          const data = kpiRes.data as any;
          setFormData({
            employee_id: String(data.employee_id),
            title: data.title,
            target: String(data.target),
            period: data.period || "",
            description: data.description || "",
            achievement: String(data.achievement)
          });
        }
      } catch (error) {
        setStatusMessage(getErrorMessage(error as never));
        setAlertType("error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateKpi(id, {
          title: formData.title,
          description: formData.description,
          target: Number(formData.target),
          achievement: Number(formData.achievement)
        });
      } else {
        await createKpi({
          employee_id: Number(formData.employee_id),
          title: formData.title,
          target: Number(formData.target),
          period: formData.period,
          description: formData.description
        });
      }
      navigate("/kpis", { state: { message: isEdit ? "KPI berhasil diperbarui" : "KPI berhasil dibuat" } });
    } catch (error) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="crud-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <RefreshCw size={32} className="animate-spin opacity-20" />
      </div>
    );
  }

  return (
    <div className="crud-page">
      <Card className="hero-card" style={{ marginBottom: '2rem' }}>
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Target size={16} />
              <span>Manajemen KPI</span>
            </div>
            <h1 className="hero-title">{isEdit ? "Ubah KPI Karyawan" : "Buat KPI Baru"}</h1>
            <p className="hero-subtitle">{isEdit ? "Perbarui target dan pencapaian kinerja karyawan." : "Tentukan indikator kinerja utama untuk karyawan baru."}</p>
          </div>
          <div className="hero-actions">
            <button type="button" className="btn-outline" onClick={() => navigate("/kpis")} disabled={loading}>
              <ChevronLeft size={18} />
              Kembali
            </button>
          </div>
        </div>
      </Card>

      {statusMessage && <Alert type={alertType} message={statusMessage} onClose={() => setStatusMessage("")} dismissible />}

      <Card glass style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 60px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', borderRadius: 20 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-sections" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            {/* Bagian Informasi Dasar */}
            <div className="form-section">
              <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-secondary)', marginBottom: 20, borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: 8 }}>Informasi Karyawan & Periode</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="form-group" style={{ gridColumn: isEdit ? 'span 2' : 'span 1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    <User size={14} className="opacity-50" /> Nama Karyawan
                  </label>
                  {isEdit ? (
                    <div style={{ padding: '14px 18px', background: 'rgba(0,0,0,0.03)', borderRadius: 10, fontSize: 15, fontWeight: 600, border: '1px solid rgba(0,0,0,0.05)', color: 'var(--primary-color)' }}>
                      {formData.employee_id} (Karyawan terpilih)
                    </div>
                  ) : (
                    <select 
                      className="form-input" 
                      value={formData.employee_id} 
                      onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                      required
                      style={{ width: '100%', padding: '14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: 15, transition: 'all 0.2s' }}
                    >
                      <option value="">Pilih Karyawan</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.user?.name || `Employee #${emp.id}`}</option>
                      ))}
                    </select>
                  )}
                </div>

                {!isEdit && (
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      <Calendar size={14} className="opacity-50" /> Periode Target
                    </label>
                    <input 
                      type="month" 
                      className="form-input" 
                      value={formData.period} 
                      onChange={(e) => setFormData({...formData, period: e.target.value})}
                      required
                      style={{ width: '100%', padding: '14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: 15 }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bagian Objektif & Target */}
            <div className="form-section">
              <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-secondary)', marginBottom: 20, borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: 8 }}>Detail Objektif & Target</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    <Target size={14} className="opacity-50" /> Judul/Objektif KPI
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Masukkan tujuan utama kinerja..."
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    style={{ width: '100%', padding: '14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: 15 }}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: isEdit ? 'span 1' : 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    <Target size={14} className="opacity-50" /> Nilai Target
                  </label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="0"
                    value={formData.target} 
                    onChange={(e) => setFormData({...formData, target: e.target.value})}
                    required
                    style={{ width: '100%', padding: '14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: 15, fontWeight: 600 }}
                  />
                </div>

                {isEdit && (
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      <Save size={14} className="opacity-50" /> Realisasi Pencapaian
                    </label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.achievement} 
                      onChange={(e) => setFormData({...formData, achievement: e.target.value})}
                      style={{ width: '100%', padding: '14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: 15, fontWeight: 600, color: '#8b5cf6' }}
                    />
                    {Number(formData.target) > 0 && (
                      <p style={{ fontSize: 12, marginTop: 8, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        Status Skor: <span style={{ padding: '2px 8px', background: '#f3f0ff', color: '#8b5cf6', borderRadius: 12, fontWeight: 700 }}>{((Number(formData.achievement) / Number(formData.target)) * 100).toFixed(1)}%</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    <FileText size={14} className="opacity-50" /> Deskripsi Tambahan
                  </label>
                  <textarea 
                    className="form-input" 
                    rows={4}
                    placeholder="Berikan rincian atau catatan tambahan mengenai KPI ini..."
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    style={{ width: '100%', padding: '14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: 15, resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 48, display: 'flex', gap: 16, justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 32 }}>
            <Button type="button" variant="outline" onClick={() => navigate("/kpis")} style={{ padding: '0 32px' }}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={submitting} style={{ padding: '0 40px', boxShadow: '0 10px 20px rgba(139, 92, 246, 0.2)' }}>
              <Save size={18} /> {isEdit ? "Simpan Perubahan" : "Simpan KPI"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default KpiFormPage;
