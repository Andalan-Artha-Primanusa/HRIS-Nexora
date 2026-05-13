import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import { 
  Save, 
  ArrowLeft, 
  CalendarDays, 
  RefreshCw,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
import './AdminLeavePages.css';

const LeaveTypeFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    is_paid: 'true',
    is_active: 'true'
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchDetail = async () => {
        try {
          const res = await api.get(`/leave-types/${id}`);
          const data = res.data?.data || res.data;
          setFormData({
            name: data.name || '',
            code: data.code || '',
            description: data.description || '',
            is_paid: String(data.is_paid),
            is_active: String(data.is_active)
          });
        } catch (err) {
          console.error('Error fetching detail:', err);
          setMessage('Gagal memuat data detail.');
        } finally {
          setFetching(false);
        }
      };
      void fetchDetail();
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const payload = {
      ...formData,
      is_paid: formData.is_paid === 'true',
      is_active: formData.is_active === 'true'
    };

    try {
      if (isEdit) {
        await api.put(`/leave-types/${id}`, payload);
        setMessage('Jenis cuti berhasil diperbarui!');
      } else {
        await api.post('/leave-types', payload);
        setMessage('Jenis cuti baru berhasil ditambahkan!');
        setTimeout(() => navigate('/leave/type'), 2000);
      }
    } catch (err: any) {
      console.error('Error saving leave type:', err);
      const errorData = err.response?.data;
      if (errorData?.errors) {
        const firstError = Object.values(errorData.errors)[0];
        setMessage(`Validation Error: ${Array.isArray(firstError) ? firstError[0] : firstError}`);
      } else {
        setMessage(errorData?.message || 'Terjadi kesalahan saat menyimpan data.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="crud-page" style={{ textAlign: 'center', padding: '5rem' }}>
        <RefreshCw className="animate-spin" size={48} color="#2563eb" />
        <p>Memuat konfigurasi...</p>
      </div>
    );
  }

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <CalendarDays size={16} />
              <span>{isEdit ? 'Edit' : 'Master Data'}</span>
            </div>
            <h1 className="hero-title">{isEdit ? 'Edit Jenis Cuti' : 'Tambah Jenis Cuti Baru'}</h1>
            <p className="hero-subtitle">
              Konfigurasi kategori cuti dan aturan dasarnya.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => navigate('/leave/type')}>
              <ArrowLeft size={16} />
              Kembali
            </button>
            <button className="btn-primary" type="submit" form="leave-type-form" disabled={loading}>
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Jenis Cuti')}
            </button>
          </div>
        </div>
      </Card>

      <form id="leave-type-form" onSubmit={handleSubmit} className="" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card glass style={{ padding: '2rem', borderRadius: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb' }}>
                  <CalendarDays size={24} />
                </div>
                <h3 style={{ margin: 0 }}>Informasi Dasar</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Nama Jenis Cuti</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="Contoh: Cuti Tahunan, Cuti Sakit"
                    style={{ width: '100%', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', color: '#0f172a', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label>Kode Unik</label>
                  <input 
                    type="text" 
                    name="code" 
                    value={formData.code} 
                    onChange={handleChange} 
                    required 
                    placeholder="Contoh: AL, SL, ML"
                    style={{ width: '100%', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', color: '#0f172a', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label>Status Berbayar</label>
                  <select 
                    name="is_paid" 
                    value={formData.is_paid} 
                    onChange={handleChange} 
                    style={{ width: '100%', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', color: '#0f172a', boxSizing: 'border-box' }}
                  >
                    <option value="true">Berbayar (Paid)</option>
                    <option value="false">Tidak Berbayar</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label>Deskripsi</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="Berikan keterangan singkat mengenai jenis cuti ini..."
                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', color: '#0f172a', resize: 'vertical', boxSizing: 'border-box' }}
                    rows={4}
                  />
                </div>

                <div>
                  <label>Status Aktif</label>
                  <select 
                    name="is_active" 
                    value={formData.is_active} 
                    onChange={handleChange} 
                    style={{ width: '100%', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', color: '#0f172a', boxSizing: 'border-box' }}
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Non-Aktif</option>
                  </select>
                </div>
              </div>

              {message && (
                <div style={{ 
                  marginTop: '1.5rem', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  background: message.includes('berhasil') ? '#f0fdf4' : '#fef2f2',
                  color: message.includes('berhasil') ? '#16a34a' : '#dc2626',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {message.includes('berhasil') ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  {message}
                </div>
              )}

              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" type="button" onClick={() => navigate('/leave/type')} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '12px', height: '48px', padding: '0 24px', fontWeight: 600 }}>
                  Batal
                </Button>
                <Button variant="primary" type="submit" disabled={loading} style={{ height: '48px', padding: '0 24px', borderRadius: '12px', fontWeight: 700, gap: '8px' }}>
                  {loading ? 'Menyimpan...' : (
                    <>
                      <Save size={18} />
                      {isEdit ? 'Perbarui Jenis Cuti' : 'Simpan Jenis Cuti'}
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <div style={{ marginTop: '2rem' }}>
              <Card glass style={{ padding: '1.5rem', borderLeft: '4px solid #2563eb' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Info size={20} color="#2563eb" />
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>Panduan Pengisian</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                      Pastikan kode unik tidak duplikat dengan jenis cuti lain. Kode ini akan digunakan untuk tracking dan pelaporan sistem.
                    </p>
                  </div>
                </div>
              </Card>
        </div>
      </form>
    </div>
  );
};

export default LeaveTypeFormPage;
