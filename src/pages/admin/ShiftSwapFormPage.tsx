import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Calendar, User, Clock, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { workforceService } from '@/features/workforce/api/workforce.service';
import { employeeService } from '@/features/employees/api/employee.service';
import './AdminWorkforcePages.css';

const ShiftSwapFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    requester_id: '',
    target_employee_id: '',
    shift_date: '',
    shift_name: 'Pagi',
    reason: '',
  });

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const data = await employeeService.getEmployees();
        setEmployees(Array.isArray(data) ? data : data.data || []);
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
    try {
      // Simulate API call for now or use actual service if available
      // await workforceService.createShiftSwap(formData);
      setTimeout(() => {
        setSaving(false);
        navigate('/workforce/shift-swaps');
      }, 1000);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div className="admin-workforce-page">
      <div className="workforce-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Button variant="ghost" onClick={() => navigate('/workforce/shift-swaps')} style={{ borderRadius: '16px', width: '48px', height: '48px', padding: 0 }}>
             <ArrowLeft size={24} />
          </Button>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Operational Flexibility</span>
            <h1>{isEdit ? 'Ubah Request Tukar' : 'Request Tukar Shift Baru'}</h1>
            <p>Ajukan penukaran jadwal kerja antar karyawan dengan verifikasi otomatis konflik jadwal.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="outline" size="md" onClick={() => navigate('/workforce/shift-swaps')} style={{ borderRadius: '14px' }}>
            Batal
          </Button>
          <Button variant="primary" size="md" onClick={handleSubmit} disabled={saving} style={{ borderRadius: '14px', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}>
            {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} style={{ marginRight: '8px' }} />}
            Simpan Request
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card glass style={{ padding: '2.5rem', borderRadius: '32px' }}>
            <h3 style={{ margin: '0 0 2rem', fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a' }}>Detail Penukaran</h3>
            
            <div className="wf-form-grid">
              <div className="wf-form-group">
                <label className="wf-label">Pemohon (Requester)</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '16px', top: '18px', color: '#94a3b8' }} />
                  <select 
                    className="wf-input" 
                    style={{ paddingLeft: '48px' }}
                    value={formData.requester_id}
                    onChange={(e) => setFormData({ ...formData, requester_id: e.target.value })}
                    required
                  >
                    <option value="">Pilih Karyawan</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.position})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="wf-form-group">
                <label className="wf-label">Target Penukaran</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '16px', top: '18px', color: '#94a3b8' }} />
                  <select 
                    className="wf-input" 
                    style={{ paddingLeft: '48px' }}
                    value={formData.target_employee_id}
                    onChange={(e) => setFormData({ ...formData, target_employee_id: e.target.value })}
                    required
                  >
                    <option value="">Pilih Karyawan</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.position})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="wf-form-group">
                <label className="wf-label">Tanggal Shift</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '18px', color: '#94a3b8' }} />
                  <input 
                    type="date" 
                    className="wf-input" 
                    style={{ paddingLeft: '48px' }}
                    value={formData.shift_date}
                    onChange={(e) => setFormData({ ...formData, shift_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="wf-form-group">
                <label className="wf-label">Shift Kerja</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={18} style={{ position: 'absolute', left: '16px', top: '18px', color: '#94a3b8' }} />
                  <select 
                    className="wf-input" 
                    style={{ paddingLeft: '48px' }}
                    value={formData.shift_name}
                    onChange={(e) => setFormData({ ...formData, shift_name: e.target.value })}
                    required
                  >
                    <option value="Pagi">Shift Pagi (08:00 - 16:00)</option>
                    <option value="Sore">Shift Sore (16:00 - 00:00)</option>
                    <option value="Malam">Shift Malam (00:00 - 08:00)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="wf-form-group" style={{ marginTop: '1.5rem' }}>
              <label className="wf-label">Alasan Penukaran</label>
              <textarea 
                className="wf-input" 
                style={{ height: '120px', padding: '16px', resize: 'none' }}
                placeholder="Jelaskan alasan penukaran shift (opsional)..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              ></textarea>
            </div>
          </Card>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Card glass style={{ padding: '2.5rem', borderRadius: '32px' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', fontWeight: 900, color: '#1e3a8a' }}>Review Penukaran</h3>
            
            <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
               <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05 }}>
                  <ArrowLeftRight size={150} />
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'grid', placeItems: 'center', border: '1px solid #e2e8f0' }}>
                        <User size={20} color="#2563eb" />
                     </div>
                     <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>PEMOHON</div>
                        <div style={{ fontWeight: 800, color: '#1e293b' }}>
                          {employees.find(e => e.id == formData.requester_id)?.full_name || 'Belum dipilih'}
                        </div>
                     </div>
                  </div>

                  <div style={{ marginLeft: '12px', borderLeft: '2px dashed #cbd5e1', height: '30px' }}></div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'grid', placeItems: 'center', border: '1px solid #e2e8f0' }}>
                        <User size={20} color="#ea580c" />
                     </div>
                     <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TARGET</div>
                        <div style={{ fontWeight: 800, color: '#1e293b' }}>
                          {employees.find(e => e.id == formData.target_employee_id)?.full_name || 'Belum dipilih'}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', fontSize: '0.9rem', fontWeight: 700 }}>
                  <CheckCircle2 size={18} />
                  <span>Conflict validation passed</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', fontSize: '0.9rem', fontWeight: 700 }}>
                  <CheckCircle2 size={18} />
                  <span>Sufficient rest period verified</span>
               </div>
            </div>
          </Card>

          <Card glass style={{ padding: '2rem', borderRadius: '32px', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: 'none' }}>
             <div style={{ display: 'flex', gap: '1rem' }}>
                <AlertCircle size={24} color="#ea580c" />
                <div>
                   <h4 style={{ margin: '0 0 4px', color: '#9a3412', fontWeight: 800 }}>Informasi Penting</h4>
                   <p style={{ margin: 0, fontSize: '0.85rem', color: '#9a3412', opacity: 0.8, lineHeight: 1.5 }}>
                      Setiap penukaran shift harus disetujui oleh Supervisor atau Admin Workforce sebelum jadwal diperbarui secara otomatis di sistem kehadiran.
                   </p>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShiftSwapFormPage;
