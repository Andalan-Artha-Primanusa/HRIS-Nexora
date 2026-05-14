import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, UserX, FileText, Plus, AlertCircle, Trash2, Edit, ChevronLeft, RefreshCw } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { api } from '@/shared/api/httpClient';
import { useNavigate } from 'react-router-dom';
import { showToast } from '@/shared/ui/toast';
import './AdminWorkforcePages.css';
import '../dashboard/overview/OverviewPage.css';

interface RetentionPolicy {
  id: number;
  module: string;
  retain_days: number;
  anonymize_after_expiry: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface PrivacyRequest {
  id: number;
  request_type: string;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  requester_name: string | null;
  employee_code: string | null;
  department: string | null;
}

const ComplianceSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'retention' | 'privacy'>('retention');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);


  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([]);
  const [privacyRequests, setPrivacyRequests] = useState<PrivacyRequest[]>([]);

  const [showRetentionPolicyForm, setShowRetentionPolicyForm] = useState(false);
  const [policyForm, setPolicyForm] = useState({ module: '', retain_days: 365, anonymize_after_expiry: false });

  const [showPrivacyForm, setShowPrivacyForm] = useState(false);
  const [privacyForm, setPrivacyForm] = useState({ request_type: 'delete', description: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [policiesRes, requestsRes] = await Promise.all([
        api.get('/enterprise/compliance/retention-policies'),
        api.get('/enterprise/compliance/privacy-requests'),
      ]);
      setRetentionPolicies(Array.isArray(policiesRes.data?.data) ? policiesRes.data.data : []);
      setPrivacyRequests(Array.isArray(requestsRes.data?.data) ? requestsRes.data.data : []);
    } catch (err) {
      console.error('Failed to fetch compliance data:', err);
      showToast('Gagal memuat data kepatuhan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleCreatePolicy = async () => {
    if (!policyForm.module.trim() || !policyForm.retain_days) {
      showToast('Nama modul dan durasi retensi wajib diisi', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/enterprise/compliance/retention-policies', policyForm);
      showToast('Kebijakan retensi berhasil dibuat', 'success');
      // Reset form but keep it open for multiple creates
      setPolicyForm({ module: '', retain_days: 365, anonymize_after_expiry: false });
      await fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal membuat kebijakan retensi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePrivacyRequest = async () => {
    if (!privacyForm.request_type) {
      showToast('Tipe permintaan wajib dipilih', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/enterprise/compliance/privacy-requests', privacyForm);
      showToast('Permintaan privasi berhasil diajukan', 'success');
      // Reset form but keep it open for multiple creates
      setPrivacyForm({ request_type: 'delete', description: '' });
      await fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal mengajukan permintaan privasi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePolicy = async (module: string) => {
    try {
      await api.delete(`/enterprise/compliance/retention-policies/${module}`);
      showToast('Kebijakan retensi dinonaktifkan', 'success');
      await fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menonaktifkan kebijakan', 'error');
    }
  };

  const formatDays = (days: number) => {
    if (days >= 365) return `${Math.floor(days / 365)} Tahun`;
    if (days >= 30) return `${Math.floor(days / 30)} Bulan`;
    return `${days} Hari`;
  };

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      access: 'Akses Data',
      update: 'Pembaruan Data',
      delete: 'Penghapusan Data',
      anonymize: 'Anonimisasi',
      export: 'Ekspor Data',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted': return { label: 'Submitted', class: 'badge-soft--orange' };
      case 'in_progress': return { label: 'In Progress', class: 'badge-soft--blue' };
      case 'completed': return { label: 'Completed', class: 'badge-soft--green' };
      case 'rejected': return { label: 'Rejected', class: 'badge-soft--red' };
      default: return { label: status, class: 'badge-soft--gray' };
    }
  };

  return (
    <div className="admin-workforce-page">
      <Card className="hero-card" style={{ marginBottom: '2rem' }}>
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <ShieldCheck size={16} />
              <span>Governance Controls</span>
            </div>
            <h1 className="hero-title">Konfigurasi Kepatuhan</h1>
            <p className="hero-subtitle">Kelola kebijakan retensi data dan permintaan privasi karyawan sesuai dengan regulasi perlindungan data.</p>
          </div>
          <div className="hero-actions">
            <button type="button" className="btn-outline" onClick={() => void fetchData()} disabled={loading}>
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate('/compliance/overview')}>
              <ChevronLeft size={18} />
              Kembali
            </button>
          </div>
        </div>
      </Card>



      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
         <Button 
           variant={activeTab === 'retention' ? 'primary' : 'outline'} 
           onClick={() => setActiveTab('retention')}
           style={{ borderRadius: '16px', padding: '0 2rem', height: '54px', fontWeight: 700 }}
         >
           <Database size={20} style={{ marginRight: '10px' }} />
           Kebijakan Retensi
         </Button>
         <Button 
           variant={activeTab === 'privacy' ? 'primary' : 'outline'} 
           onClick={() => setActiveTab('privacy')}
           style={{ borderRadius: '16px', padding: '0 2rem', height: '54px', fontWeight: 700 }}
         >
           <UserX size={20} style={{ marginRight: '10px' }} />
           Permintaan Privasi
         </Button>
      </div>

      {loading && retentionPolicies.length === 0 && privacyRequests.length === 0 ? (
        <LoadingState message="Memuat data kepatuhan..." />
      ) : activeTab === 'retention' ? (
        <div className="workforce-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           {retentionPolicies.length > 0 ? (
             retentionPolicies.map((policy) => (
               <Card key={policy.id} glass style={{ padding: '2rem', borderRadius: '28px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                     <div style={{ width: '54px', height: '54px', background: '#2563eb15', color: '#2563eb', borderRadius: '16px', display: 'grid', placeItems: 'center' }}>
                        <Database size={24} />
                     </div>
                     <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="action-btn action-btn-delete" onClick={() => void handleDeletePolicy(policy.module)}>
                          <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
                  
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>{policy.module}</h3>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                    RETENSI: {formatDays(policy.retain_days)}
                  </div>

                  <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', marginBottom: '1.5rem' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Anonimisasi Setelah Kadaluarsa</span>
                        <span style={{ fontWeight: 800, color: policy.anonymize_after_expiry ? '#10b981' : '#94a3b8' }}>
                          {policy.anonymize_after_expiry ? 'Ya' : 'Tidak'}
                        </span>
                     </div>
                  </div>
                  
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                     Diperbarui: {new Date(policy.updated_at).toLocaleDateString('id-ID')}
                  </p>
               </Card>
             ))
           ) : (
             <EmptyState
               title="Belum Ada Kebijakan Retensi"
               message="Tambahkan aturan pertama untuk mengelola retensi data."
               actionLabel="Tambah Kebijakan"
               onAction={() => setShowRetentionPolicyForm(true)}
             />
           )}
           <Card glass style={{ padding: '2rem', borderRadius: '28px', border: '2px dashed #e2e8f0', background: 'transparent', display: 'grid', placeItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                 <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 1rem', color: '#94a3b8' }}>
                    <Plus size={32} />
                 </div>
                 <h4 style={{ margin: 0, color: '#64748b', fontWeight: 700 }}>Tambah Aturan Baru</h4>
                 <Button variant="ghost" size="sm" style={{ marginTop: '0.5rem' }} onClick={() => setShowRetentionPolicyForm(true)}>Klik untuk mengonfigurasi</Button>
              </div>
           </Card>

           {showRetentionPolicyForm && (
             <Card glass style={{ padding: '2rem', borderRadius: '28px', border: '1px solid #e2e8f0' }}>
               <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a' }}>Kebijakan Retensi Baru</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div>
                   <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Nama Modul</label>
                   <input
                     type="text"
                     value={policyForm.module}
                     onChange={(e) => setPolicyForm({ ...policyForm, module: e.target.value })}
                     placeholder="Contoh: Payroll Records, Attendance Logs"
                     style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '0.95rem' }}
                   />
                 </div>
                 <div>
                   <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Durasi Retensi (hari)</label>
                   <input
                     type="number"
                     value={policyForm.retain_days}
                     onChange={(e) => setPolicyForm({ ...policyForm, retain_days: Number(e.target.value) })}
                     min={1}
                     style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '0.95rem' }}
                   />
                 </div>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
                   <input
                     type="checkbox"
                     checked={policyForm.anonymize_after_expiry}
                     onChange={(e) => setPolicyForm({ ...policyForm, anonymize_after_expiry: e.target.checked })}
                   />
                   Anonimisasi data setelah masa retensi berakhir
                 </label>
                 <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                   <Button variant="primary" size="sm" onClick={() => void handleCreatePolicy()} disabled={saving}>
                     {saving ? 'Menyimpan...' : 'Simpan Kebijakan'}
                   </Button>
                   <Button variant="outline" size="sm" onClick={() => setShowRetentionPolicyForm(false)}>Batal</Button>
                 </div>
               </div>
             </Card>
           )}
        </div>
      ) : (
        <div className="workforce-table-card">
           <div className="workforce-table-header">
              <h3 className="workforce-table-title">Permintaan Privasi Aktif (Right to be Forgotten)</h3>
              <Button variant="primary" size="sm" style={{ borderRadius: '12px' }} onClick={() => setShowPrivacyForm(true)}>
                <Plus size={16} style={{ marginRight: '8px' }} /> Request Manual
              </Button>
           </div>

           {showPrivacyForm && (
             <Card glass style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
               <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#1e3a8a' }}>Permintaan Privasi Baru</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div>
                   <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Tipe Permintaan</label>
                   <select
                     value={privacyForm.request_type}
                     onChange={(e) => setPrivacyForm({ ...privacyForm, request_type: e.target.value })}
                     style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '0.95rem' }}
                   >
                     <option value="delete">Penghapusan Data</option>
                     <option value="access">Akses Data</option>
                     <option value="update">Pembaruan Data</option>
                     <option value="anonymize">Anonimisasi</option>
                     <option value="export">Ekspor Data</option>
                   </select>
                 </div>
                 <div>
                   <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Deskripsi (opsional)</label>
                   <textarea
                     value={privacyForm.description}
                     onChange={(e) => setPrivacyForm({ ...privacyForm, description: e.target.value })}
                     placeholder="Jelaskan alasan permintaan..."
                     rows={3}
                     style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '0.95rem', resize: 'vertical' }}
                   />
                 </div>
                 <div style={{ display: 'flex', gap: '0.75rem' }}>
                   <Button variant="primary" size="sm" onClick={() => void handleCreatePrivacyRequest()} disabled={saving}>
                     {saving ? 'Mengajukan...' : 'Ajukan Permintaan'}
                   </Button>
                   <Button variant="outline" size="sm" onClick={() => setShowPrivacyForm(false)}>Batal</Button>
                 </div>
               </div>
             </Card>
           )}

           {privacyRequests.length > 0 ? (
             <table className="workforce-table">
                <thead>
                   <tr>
                      <th>Subjek / Karyawan</th>
                      <th>Tipe Permintaan</th>
                      <th>Tanggal Masuk</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                   </tr>
                </thead>
                <tbody>
                   {privacyRequests.map((req) => {
                     const statusBadge = getStatusBadge(req.status);
                     return (
                       <tr key={req.id}>
                          <td>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', display: 'grid', placeItems: 'center', fontWeight: 800 }}>
                                  {req.requester_name ? req.requester_name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                   <div style={{ fontWeight: 800 }}>{req.requester_name || 'Unknown'}</div>
                                   <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                     {req.department || 'N/A'} {req.employee_code ? `(${req.employee_code})` : ''}
                                   </div>
                                </div>
                             </div>
                          </td>
                          <td><span style={{ fontWeight: 700 }}>{getRequestTypeLabel(req.request_type)}</span></td>
                          <td>{new Date(req.created_at).toLocaleDateString('id-ID')}</td>
                          <td>
                             <span className={`badge-soft ${statusBadge.class}`}>
                               {statusBadge.label}
                             </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                             <Button variant="primary" size="sm" style={{ borderRadius: '10px', fontWeight: 700 }}>Proses</Button>
                          </td>
                       </tr>
                     );
                   })}
                </tbody>
             </table>
           ) : (
             <EmptyState
               title="Belum Ada Permintaan Privasi"
               message="Tidak ada permintaan penghapusan atau akses data yang aktif."
               actionLabel="Buat Permintaan"
               onAction={() => setShowPrivacyForm(true)}
             />
           )}
           <div style={{ padding: '2rem', background: '#fff7ed', borderTop: '1px solid #ffedd5', display: 'flex', gap: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', background: '#ea580c', borderRadius: '12px', display: 'grid', placeItems: 'center', color: 'white', flexShrink: 0 }}>
                 <AlertCircle size={24} />
              </div>
              <div>
                 <h4 style={{ margin: '0 0 4px', color: '#9a3412', fontSize: '1rem', fontWeight: 800 }}>Peringatan Keamanan</h4>
                 <p style={{ margin: 0, color: '#9a3412', fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.5 }}>
                    Memproses permintaan penghapusan data akan menghapus seluruh catatan karyawan secara permanen dari seluruh modul sistem (Payroll, Attendance, Asset). Tindakan ini tidak dapat dibatalkan.
                 </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceSettingsPage;
