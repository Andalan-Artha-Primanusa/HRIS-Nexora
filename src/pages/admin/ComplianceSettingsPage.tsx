import React, { useState } from 'react';
import { ShieldCheck, Database, UserX, FileText, Plus, AlertCircle, Trash2, Edit, ChevronLeft } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { useNavigate } from 'react-router-dom';
import './AdminWorkforcePages.css';
import '../dashboard/overview/OverviewPage.css';

const ComplianceSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'retention' | 'privacy'>('retention');

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
            <button type="button" className="btn-outline" onClick={() => navigate('/compliance/overview')}>
              <ChevronLeft size={18} />
              Kembali
            </button>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '1rem' }}>
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

      {activeTab === 'retention' ? (
        <div className="workforce-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           {[
             { name: 'Payroll Records', period: '10 Tahun', category: 'Finance', icon: <FileText size={24} />, color: '#2563eb' },
             { name: 'Employee Contracts', period: 'Permanen', category: 'Legal', icon: <ShieldCheck size={24} />, color: '#10b981' },
             { name: 'Attendance Logs', period: '2 Tahun', category: 'Operational', icon: <Database size={24} />, color: '#f59e0b' },
           ].map((policy, i) => (
             <Card key={i} glass style={{ padding: '2rem', borderRadius: '28px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                   <div style={{ width: '54px', height: '54px', background: `${policy.color}15`, color: policy.color, borderRadius: '16px', display: 'grid', placeItems: 'center' }}>
                      {policy.icon}
                   </div>
<div style={{ display: 'flex', gap: '8px' }}>
                       <button className="action-btn action-btn-edit"><Edit size={16} /></button>
                       <button className="action-btn action-btn-delete"><Trash2 size={16} /></button>
                    </div>
                </div>
                
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>{policy.name}</h3>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '1.5rem', textTransform: 'uppercase' }}>KATEGORI: {policy.category}</div>

                <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', marginBottom: '1.5rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Periode Retensi</span>
                      <span style={{ fontWeight: 800, color: '#1e293b' }}>{policy.period}</span>
                   </div>
                </div>
                
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                   Kebijakan ini mematuhi standar hukum ketenagakerjaan dan undang-undang perlindungan data pribadi yang berlaku.
                </p>
             </Card>
           ))}
           <Card glass style={{ padding: '2rem', borderRadius: '28px', border: '2px dashed #e2e8f0', background: 'transparent', display: 'grid', placeItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                 <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 1rem', color: '#94a3b8' }}>
                    <Plus size={32} />
                 </div>
                 <h4 style={{ margin: 0, color: '#64748b', fontWeight: 700 }}>Tambah Aturan Baru</h4>
                 <Button variant="ghost" size="sm" style={{ marginTop: '0.5rem' }}>Klik untuk mengonfigurasi</Button>
              </div>
           </Card>
        </div>
      ) : (
        <div className="workforce-table-card">
           <div className="workforce-table-header">
              <h3 className="workforce-table-title">Permintaan Privasi Aktif (Right to be Forgotten)</h3>
              <Button variant="primary" size="sm" style={{ borderRadius: '12px' }}>
                <Plus size={16} style={{ marginRight: '8px' }} /> Request Manual
              </Button>
           </div>
           <table className="workforce-table">
              <thead>
                 <tr>
                    <th>Subjek / Karyawan</th>
                    <th>Tipe Permintaan</th>
                    <th>Tanggal Masuk</th>
                    <th>Status SLA</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                 </tr>
              </thead>
              <tbody>
                 <tr>
                    <td>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', display: 'grid', placeItems: 'center', fontWeight: 800 }}>JD</div>
                          <div>
                             <div style={{ fontWeight: 800 }}>John Doe</div>
                             <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ex-Employee (Marketing)</div>
                          </div>
                       </div>
                    </td>
                    <td><span style={{ fontWeight: 700 }}>Penghapusan Data</span></td>
                    <td>{new Date().toLocaleDateString()}</td>
                    <td>
                       <span style={{ padding: '6px 12px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', fontSize: '0.75rem', fontWeight: 800 }}>
                          SISA 5 HARI
                       </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                       <Button variant="primary" size="sm" style={{ borderRadius: '10px', fontWeight: 700 }}>Proses Sekarang</Button>
                    </td>
                 </tr>
              </tbody>
           </table>
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
