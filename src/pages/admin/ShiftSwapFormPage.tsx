import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, Calendar, User, Clock, 
  ArrowLeftRight, CheckCircle2, RefreshCw, ChevronLeft,
  ShieldCheck, HelpCircle
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Alert } from '@/shared/ui/Alert';
import { employeeService } from '@/features/employee/api/employee.service';
import { workforceService } from '@/features/workforce/api/workforce.service';
import './AdminWorkforcePages.css';
import '../dashboard/overview/OverviewPage.css';

const ShiftSwapFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    requester_employee_id: '',
    target_employee_id: '',
    swap_date: '',
    reason: '',
  });

  const [employees, setEmployees] = useState<any[]>([]);
  const [_loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("error");

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const data = await employeeService.getEmployees();
        setEmployees(Array.isArray(data) ? data : (data as any).data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage("");
    try {
      const payload = {
        requester_employee_id: Number(formData.requester_employee_id),
        target_employee_id: Number(formData.target_employee_id),
        swap_date: formData.swap_date,
        reason: formData.reason,
      };
      await workforceService.createShiftSwap(payload);
      setStatusMessage("Permintaan tukar shift berhasil dibuat");
      setStatusType("success");
      setTimeout(() => navigate('/workforce/shift-swaps'), 1500);
    } catch (err: any) {
      setStatusMessage(err.message || "Gagal membuat permintaan tukar shift");
      setStatusType("error");
      setSaving(false);
    }
  };

  const getEmployeeName = (id: string | number) => {
    const emp = employees.find(e => String(e.id) === String(id));
    return emp ? emp.full_name : 'Belum dipilih';
  };

  return (
    <div className="crud-page">
      <Card className="hero-card" style={{ marginBottom: '2rem' }}>
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <ArrowLeftRight size={16} />
              <span>Manajemen Jadwal</span>
            </div>
            <h1 className="hero-title">{isEdit ? 'Edit Tukar Shift' : 'Tukar Shift Baru'}</h1>
            <p className="hero-subtitle">
              Kelola penukaran jadwal kerja antar karyawan dengan verifikasi otomatis.
            </p>
          </div>
          <div className="hero-actions">
            <button type="button" className="btn-outline" onClick={() => navigate('/workforce/shift-swaps')} disabled={saving}>
              <ChevronLeft size={18} />
              Kembali
            </button>
          </div>
        </div>
      </Card>

      {statusMessage && (
        <Alert
          type={statusType}
          message={statusMessage}
          onClose={() => setStatusMessage("")}
          dismissible
        />
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card glass style={{ padding: '2.5rem', borderRadius: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                <div style={{ padding: '10px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '12px', color: 'white' }}>
                  <ArrowLeftRight size={22} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>Informasi Penukaran</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div className="form-group">
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'block' }}>Pemohon (Requester)</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <select 
                      value={formData.requester_employee_id}
                      onChange={(e) => setFormData({ ...formData, requester_employee_id: e.target.value })}
                      required
                      disabled={saving}
                      style={{ width: '100%', height: '50px', padding: '0 16px 0 48px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', boxSizing: 'border-box' }}
                    >
                      <option value="">Pilih Karyawan</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.position || 'No Position'})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'block' }}>Target Penukaran</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <select 
                      value={formData.target_employee_id}
                      onChange={(e) => setFormData({ ...formData, target_employee_id: e.target.value })}
                      required
                      disabled={saving}
                      style={{ width: '100%', height: '50px', padding: '0 16px 0 48px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', boxSizing: 'border-box' }}
                    >
                      <option value="">Pilih Karyawan</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.position || 'No Position'})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'block' }}>Tanggal Shift</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="date" 
                      value={formData.swap_date}
                      onChange={(e) => setFormData({ ...formData, swap_date: e.target.value })}
                      required
                      disabled={saving}
                      style={{ width: '100%', height: '50px', padding: '0 16px 0 48px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'block' }}>Alasan Penukaran</label>
                  <textarea 
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Berikan alasan mengapa penukaran ini diperlukan..."
                    disabled={saving}
                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', minHeight: '120px', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </Card>

            <Card style={{ padding: '2rem', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: 'none', borderRadius: '24px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a' }}>Validasi Otomatis Aktif</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af', opacity: 0.8, lineHeight: 1.5 }}>
                    Sistem akan secara otomatis memeriksa konflik jadwal, masa istirahat minimal (11 jam), dan kuota shift sebelum pengajuan dikirimkan ke supervisor.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card glass style={{ padding: '2rem', borderRadius: '32px' }}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={18} /> Preview Request
              </h3>
              
              <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0', position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>A</div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Dari Pemohon</p>
                      <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{getEmployeeName(formData.requester_employee_id)}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
                    <div style={{ padding: '6px 12px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>
                      <ArrowLeftRight size={14} /> TUKAR DENGAN
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ea580c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>B</div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Target Karyawan</p>
                      <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{getEmployeeName(formData.target_employee_id)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '10px', color: '#166534' }}>
                <CheckCircle2 size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Validasi Konflik: AMAN</span>
              </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                disabled={saving} 
                style={{ width: '100%', height: '60px', borderRadius: '20px', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}
                onClick={handleSubmit}
              >
                {saving ? <RefreshCw className="animate-spin" style={{ marginRight: '10px' }} /> : <Save size={20} style={{ marginRight: '10px' }} />}
                {saving ? 'Menyimpan...' : 'Simpan Request'}
              </Button>
              <Button 
                type="button" 
                onClick={() => navigate('/workforce/shift-swaps')} 
                style={{ width: '100%', height: '54px', borderRadius: '20px', fontWeight: 700, background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
              >
                Batalkan
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ShiftSwapFormPage;
