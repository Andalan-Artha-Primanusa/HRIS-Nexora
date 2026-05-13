import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Calendar, MapPin, Info, CheckCircle2, RefreshCw, ChevronLeft } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { workforceService } from '@/features/workforce/api/workforce.service';
import './AdminWorkforcePages.css';
import '../dashboard/overview/OverviewPage.css';

const toHolidayFormState = (value: any) => ({
  name: String(value?.name || ''),
  date: String(value?.date || value?.holiday_date || ''),
  type: String(value?.type || (value?.is_national === false ? 'Company Holiday' : 'National Holiday')),
  description: String(value?.description || value?.name || ''),
  is_recurring: Boolean(value?.is_recurring),
  applicable_locations: Array.isArray(value?.applicable_locations) ? value.applicable_locations : ['All'],
});

const HolidayFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'National Holiday',
    description: '',
    is_recurring: false,
    applicable_locations: ['All']
  });

  useEffect(() => {
    if (isEdit) {
      const fetchHoliday = async () => {
        setFetching(true);
        try {
          const res = await workforceService.getHoliday(id);
          setFormData(toHolidayFormState(res?.payload || res));
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchHoliday();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        type: formData.type === 'Company Holiday' ? 'company' : 'national',
      };

      if (isEdit) {
        await workforceService.updateHoliday(id, payload);
      } else {
        await workforceService.createHoliday(payload);
      }
      navigate('/workforce/holidays');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  if (fetching) return <div style={{ padding: '5rem', textAlign: 'center' }}><RefreshCw className="animate-spin" /></div>;

  return (
    <div className="admin-workforce-page">
      <Card className="hero-card" style={{ marginBottom: '2rem' }}>
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Calendar size={16} />
              <span>{isEdit ? 'Update Policy' : 'New Configuration'}</span>
            </div>
            <h1 className="hero-title">{isEdit ? 'Edit Hari Libur' : 'Tambah Hari Libur'}</h1>
            <p className="hero-subtitle">Konfigurasi hari libur nasional atau khusus perusahaan untuk otomatisasi jadwal kerja.</p>
          </div>
          <div className="hero-actions">
            <button type="button" className="btn-outline" onClick={() => navigate('/workforce/holidays')} disabled={loading}>
              <ChevronLeft size={18} />
              Kembali
            </button>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <Card glass style={{ padding: '2.5rem', borderRadius: '32px' }}>
                 <h3 style={{ margin: '0 0 2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
                    <Calendar size={24} color="#2563eb" /> Informasi Libur
                 </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                       <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Nama Hari Libur</label>
                       <input name="name" value={formData.name} onChange={handleChange} required placeholder="Contoh: Idul Fitri 1447H" style={{ width: '100%', padding: '0 16px', height: '50px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Tanggal</label>
                       <input name="date" type="date" value={formData.date} onChange={handleChange} required style={{ width: '100%', padding: '0 16px', height: '50px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Tipe Libur</label>
                       <select name="type" value={formData.type} onChange={handleChange} style={{ width: '100%', padding: '0 16px', height: '50px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box' }}>
                          <option value="National Holiday">Libur Nasional</option>
                          <option value="Company Holiday">Libur Perusahaan</option>
                       </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                       <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Deskripsi (Opsional)</label>
                       <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Detail singkat mengenai hari libur ini..." style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', resize: 'vertical', boxSizing: 'border-box' }} />
                    </div>
                 </div>
              </Card>

              <Card glass style={{ padding: '2.5rem', borderRadius: '32px' }}>
                 <h3 style={{ margin: '0 0 2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
                    <MapPin size={24} color="#2563eb" /> Lokasi Yang Berlaku
                 </h3>
                 <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ position: 'relative', width: '24px', height: '24px' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.applicable_locations.includes('All')} 
                        onChange={() => {}} 
                        style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Berlaku Untuk Semua Lokasi</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Kebijakan ini akan diterapkan di seluruh cabang dan kantor operasional.</div>
                    </div>
                 </div>
                 <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', background: '#eff6ff', borderRadius: '14px', color: '#1e40af' }}>
                    <Info size={18} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Jika tidak dicentang, Anda dapat memilih cabang atau kantor spesifik setelah menyimpan.</span>
                 </div>
              </Card>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <Card glass style={{ padding: '2rem', borderRadius: '28px' }}>
                 <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a' }}>Pengaturan Kebijakan</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                       <input name="is_recurring" type="checkbox" checked={formData.is_recurring} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                       <label style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Berulang Setiap Tahun</label>
                    </div>
                    <div className="workforce-input-group">
                       <label>Status Kebijakan</label>
                       <div style={{ padding: '1rem', background: '#ecfdf5', color: '#059669', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <CheckCircle2 size={20} />
                          Kebijakan Aktif
                       </div>
                    </div>
                 </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%', height: '60px', borderRadius: '20px', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}>
                    {loading ? <RefreshCw className="animate-spin" /> : <Save size={20} style={{ marginRight: '10px' }} />}
                    {loading ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Terbitkan Libur')}
                 </Button>
                 <Button type="button" onClick={() => navigate('/workforce/holidays')} style={{ width: '100%', height: '54px', borderRadius: '20px', fontWeight: 700, background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
                    Batalkan
                 </Button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default HolidayFormPage;
