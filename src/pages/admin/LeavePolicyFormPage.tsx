import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { api } from '@/shared/api/httpClient';
import { 
  Save, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle, 
  XCircle,
  Settings,
  Info,
  Layers
} from 'lucide-react';
import './AdminLeavePages.css';

const LeavePolicyFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    policy_code: '',
    year: new Date().getFullYear().toString(),
    annual_allowance: '12',
    carry_over_allowance: '0',
    max_carryover_days: '5',
    entitlement_type: 'fixed',
    entitlement_value: '12',
    is_paid: 'true',
    active: 'true'
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchDetail = async () => {
        try {
          const res = await api.get(`/leave-policies/${id}`);
          const data = res.data?.data || res.data;
          setFormData({
            name: data.name || '',
            policy_code: data.policy_code || '',
            year: String(data.year || new Date().getFullYear()),
            annual_allowance: String(data.annual_allowance || '0'),
            carry_over_allowance: String(data.carry_over_allowance || '0'),
            max_carryover_days: String(data.max_carryover_days || '0'),
            entitlement_type: data.entitlement_type || 'fixed',
            entitlement_value: String(data.entitlement_value || '0'),
            is_paid: String(data.is_paid),
            active: String(data.active)
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
      year: parseInt(formData.year),
      annual_allowance: parseInt(formData.annual_allowance),
      carry_over_allowance: parseInt(formData.carry_over_allowance),
      max_carryover_days: parseInt(formData.max_carryover_days),
      entitlement_value: parseInt(formData.entitlement_value),
      is_paid: formData.is_paid === 'true',
      active: formData.active === 'true'
    };

    try {
      if (isEdit) {
        await api.put(`/leave-policies/${id}`, payload);
        setMessage('Kebijakan cuti berhasil diperbarui!');
      } else {
        await api.post('/leave-policies', payload);
        setMessage('Kebijakan baru berhasil ditambahkan!');
        setTimeout(() => navigate('/leave/policy'), 2000);
      }
    } catch (err: any) {
      console.error('Error saving leave policy:', err);
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
      <div className="admin-leave-page" style={{ textAlign: 'center', padding: '5rem' }}>
        <Settings className="animate-spin" size={48} color="#7c3aed" />
        <p>Memuat konfigurasi kebijakan...</p>
      </div>
    );
  }

  return (
    <div className="admin-leave-page">
      <div className="admin-leave-header">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/leave/policy')} style={{ marginBottom: '1rem', padding: 0 }}>
            <ArrowLeft size={16} /> Kembali ke Daftar
          </Button>
          <h1>{isEdit ? 'Edit Kebijakan Cuti' : 'Buat Kebijakan Cuti Baru'}</h1>
          <p>Tentukan aturan jatah, akumulasi, dan batasan carry-forward.</p>
        </div>
        <Badge variant={isEdit ? 'info' : 'success'} style={{ background: '#7c3aed', color: 'white' }}>
          {isEdit ? 'Policy Update' : 'New Configuration'}
        </Badge>
      </div>

      <div style={{ maxWidth: '900px' }}>
        <form onSubmit={handleSubmit}>
          <Card glass style={{ padding: '2.5rem', borderRadius: '32px' }}>
            <div className="form-section-header" style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed' }}>
                  <ShieldCheck size={24} />
                </div>
                <h3 style={{ margin: 0 }}>Parameter Kebijakan</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1.5rem' }}>
              <div className="action-form-group" style={{ gridColumn: 'span 4' }}>
                <label>Nama Kebijakan</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="Contoh: Kebijakan Cuti Tahunan 2026"
                  className="action-input"
                />
              </div>

              <div className="action-form-group" style={{ gridColumn: 'span 2' }}>
                <label>Tahun Berlaku</label>
                <input 
                  type="number" 
                  name="year" 
                  value={formData.year} 
                  onChange={handleChange} 
                  required 
                  className="action-input"
                />
              </div>

              <div className="action-form-group" style={{ gridColumn: 'span 3' }}>
                <label>Kode Kebijakan</label>
                <input 
                  type="text" 
                  name="policy_code" 
                  value={formData.policy_code} 
                  onChange={handleChange} 
                  required 
                  placeholder="Contoh: POL-2026-AL"
                  className="action-input"
                />
              </div>

              <div className="action-form-group" style={{ gridColumn: 'span 3' }}>
                <label>Tipe Jatah (Entitlement)</label>
                <select 
                  name="entitlement_type" 
                  value={formData.entitlement_type} 
                  onChange={handleChange} 
                  className="action-input"
                >
                  <option value="fixed">Fixed (Langsung Diberikan)</option>
                  <option value="accrual">Accrual (Akumulasi per Bulan)</option>
                </select>
              </div>

              <div className="action-form-group" style={{ gridColumn: 'span 2' }}>
                <label>Jatah Hari Dasar</label>
                <input 
                  type="number" 
                  name="entitlement_value" 
                  value={formData.entitlement_value} 
                  onChange={handleChange} 
                  className="action-input"
                />
              </div>

              <div className="action-form-group" style={{ gridColumn: 'span 2' }}>
                <label>Max Carry-Forward</label>
                <input 
                  type="number" 
                  name="max_carryover_days" 
                  value={formData.max_carryover_days} 
                  onChange={handleChange} 
                  className="action-input"
                />
              </div>

              <div className="action-form-group" style={{ gridColumn: 'span 2' }}>
                <label>Status Kebijakan</label>
                <select 
                  name="active" 
                  value={formData.active} 
                  onChange={handleChange} 
                  className="action-input"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Draft / Non-Aktif</option>
                </select>
              </div>
            </div>

            <div className="form-section-header" style={{ margin: '2.5rem 0 1.5rem 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed' }}>
                  <Layers size={24} />
                </div>
                <h3 style={{ margin: 0 }}>Aturan Finansial</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="action-form-group">
                <label>Cuti Dibayar?</label>
                <select 
                  name="is_paid" 
                  value={formData.is_paid} 
                  onChange={handleChange} 
                  className="action-input"
                >
                  <option value="true">Ya, Dibayar Penuh</option>
                  <option value="false">Tidak (Potong Gaji/Unpaid)</option>
                </select>
              </div>
            </div>

            {message && (
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                borderRadius: '12px', 
                background: message.includes('berhasil') ? '#f5f3ff' : '#fef2f2',
                color: message.includes('berhasil') ? '#7c3aed' : '#dc2626',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: message.includes('berhasil') ? '1px solid #ddd6fe' : '1px solid #fecaca'
              }}>
                {message.includes('berhasil') ? <CheckCircle size={18} /> : <XCircle size={18} />}
                {message}
              </div>
            )}

            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button variant="ghost" type="button" onClick={() => navigate('/leave/policy')}>
                Batal
              </Button>
              <Button variant="primary" type="submit" disabled={loading} style={{ background: '#7c3aed' }}>
                {loading ? 'Processing...' : (
                  <>
                    <Save size={18} />
                    {isEdit ? 'Save Policy Changes' : 'Publish New Policy'}
                  </>
                )}
              </Button>
            </div>
          </Card>
        </form>

        <div style={{ marginTop: '2rem' }}>
          <Card glass style={{ padding: '1.5rem', borderLeft: '4px solid #7c3aed' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Info size={20} color="#7c3aed" />
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Policy Compliance</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                  Setiap perubahan kebijakan akan direkam dalam log audit. Pastikan "Jatah Hari Dasar" sudah sesuai dengan regulasi ketenagakerjaan yang berlaku.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeavePolicyFormPage;
