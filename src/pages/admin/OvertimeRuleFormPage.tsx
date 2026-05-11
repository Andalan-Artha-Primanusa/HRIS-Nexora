import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Clock, DollarSign, Timer, Settings, Info, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { workforceService } from '@/features/workforce/api/workforce.service';
import './AdminWorkforcePages.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const toOvertimeRuleFormState = (value: any) => ({
  name: String(value?.name || ''),
  multiplier: Number(value?.multiplier ?? 1.5),
  max_hours_per_day: Number(value?.max_hours_per_day ?? 4),
  max_hours_per_week: Number(value?.max_hours_per_week ?? 14),
  eligibility: String(value?.eligibility || value?.department || 'All Staff'),
  description: String(value?.description || ''),
  status: String(value?.status || (value?.active === false ? 'Inactive' : 'Active')),
});

const OvertimeRuleFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    multiplier: 1.5,
    max_hours_per_day: 4,
    max_hours_per_week: 14,
    eligibility: 'All Staff',
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    if (isEdit) {
      const fetchRule = async () => {
        setFetching(true);
        try {
          const res = await workforceService.getOvertimeRule(id);
          setFormData(toOvertimeRuleFormState(res?.payload || res));
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchRule();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        active: formData.status !== 'Inactive',
      };

      if (isEdit) {
        await workforceService.updateOvertimeRule(id, payload);
      } else {
        await workforceService.createOvertimeRule(payload);
      }
      navigate('/workforce/overtime-rules');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

if (fetching) return <div style={{ padding: '5rem', textAlign: 'center' }}><RefreshCw className="animate-spin" /></div>;

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Timer size={16} />
              <span>Workforce</span>
            </div>
            <h1 className="hero-title">{isEdit ? 'Edit Aturan Lembur' : 'Aturan Lembur Baru'}</h1>
            <p className="hero-subtitle">
              Tentukan pengganda kalkulasi dan batas kepatuhan hukum ketenagakerjaan untuk lembur karyawan.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => navigate('/workforce/overtime-rules')}>
              <ArrowLeft size={16} />
              Kembali
            </button>
            <button className="btn-primary" type="submit" form="overtime-form" disabled={loading}>
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Aktifkan Aturan')}
            </button>
          </div>
        </div>
      </Card>

<form id="overtime-form" onSubmit={handleSubmit} className="">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <Card glass style={{ padding: '2.5rem', borderRadius: '32px' }}>
                 <h3 style={{ margin: '0 0 2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
                    <Settings size={24} color="#2563eb" /> Konfigurasi Dasar
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="workforce-input-group" style={{ gridColumn: '1 / -1' }}>
                       <label>Nama Aturan</label>
                       <input name="name" value={formData.name} onChange={handleChange} className="workforce-input" required placeholder="Contoh: Lembur Hari Kerja Standar" />
                    </div>
                    <div className="workforce-input-group">
                       <label>Pengganda (x Gaji Per Jam)</label>
                       <div style={{ position: 'relative' }}>
                          <DollarSign size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="multiplier" type="number" step="0.1" value={formData.multiplier} onChange={handleChange} className="workforce-input" style={{ paddingLeft: '48px' }} required />
                       </div>
                    </div>
                    <div className="workforce-input-group">
                       <label>Grup Kelayakan</label>
                       <select name="eligibility" value={formData.eligibility} onChange={handleChange} className="workforce-input">
                          <option>All Staff</option>
                          <option>Permanent Only</option>
                          <option>Contract Only</option>
                          <option>Specific Department</option>
                       </select>
                    </div>
                 </div>
              </Card>

              <Card glass style={{ padding: '2.5rem', borderRadius: '32px' }}>
                 <h3 style={{ margin: '0 0 2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
                    <Clock size={24} color="#2563eb" /> Batasan & Limitasi
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="workforce-input-group">
                       <label>Maksimal Jam (Per Hari)</label>
                       <input name="max_hours_per_day" type="number" value={formData.max_hours_per_day} onChange={handleChange} className="workforce-input" placeholder="Contoh: 4" />
                    </div>
                    <div className="workforce-input-group">
                       <label>Maksimal Jam (Per Minggu)</label>
                       <input name="max_hours_per_week" type="number" value={formData.max_hours_per_week} onChange={handleChange} className="workforce-input" placeholder="Contoh: 14" />
                    </div>
                 </div>
                 <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', background: '#eff6ff', borderRadius: '14px', color: '#1e40af' }}>
                    <Info size={18} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sistem akan memberikan peringatan atau menolak otomatis jika jam lembur melebihi batas ini.</span>
                 </div>
              </Card>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <Card glass style={{ padding: '2rem', borderRadius: '28px' }}>
                 <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a' }}>Status Aturan</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="workforce-input-group">
                       <label>Status Operasional</label>
                       <select name="status" value={formData.status} onChange={handleChange} className="workforce-input">
                          <option value="Active">Aktif</option>
                          <option value="Inactive">Non-Aktif</option>
                       </select>
                    </div>
                    <div style={{ padding: '1rem', background: formData.status === 'Active' ? '#ecfdf5' : '#f1f5f9', color: formData.status === 'Active' ? '#059669' : '#64748b', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                       {formData.status === 'Active' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                       {formData.status === 'Active' ? 'Berlaku dalam Payroll' : 'Tidak Berlaku'}
                    </div>
                 </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', height: '60px', borderRadius: '20px', fontWeight: 800, fontSize: '1.1rem' }}>
                    {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} style={{ marginRight: '10px' }} />}
                    {loading ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Aktifkan Aturan')}
                 </button>
                 <button className="btn-outline" type="button" onClick={() => navigate('/workforce/overtime-rules')} style={{ width: '100%', height: '54px', borderRadius: '20px', fontWeight: 700 }}>
                    Batalkan
                 </button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default OvertimeRuleFormPage;
