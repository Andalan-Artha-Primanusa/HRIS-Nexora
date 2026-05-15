import React, { useState } from 'react';
import { RefreshCw, AlertCircle, TrendingUp, Landmark, Shield } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { enterpriseService } from '@/features/enterprise/api/enterprise.service';
import { useAuthStore } from '@/app/store/auth.store';
import { RBACUtils } from '@/shared/hooks/rbac';

const CompensationPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const canAccess = RBACUtils.hasPermission(user, 'payroll.view');
  if (!canAccess) {
    return (
      <div className="crud-page"><Card className="hero-card"><div className="hero-card-inner"><div className="hero-content"><div className="hero-badge"><Shield size={16} /><span>Admin Center</span></div><h1 className="hero-title">Akses Ditolak</h1><p className="hero-subtitle">Anda tidak memiliki izin untuk mengakses halaman ini.</p></div></div></Card></div>
    );
  }
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleBankExportPreview = async () => {
    setLoading(true);
    try {
      const data = await enterpriseService.getBankExportPreview({ month: '2026-04' });
      setPreviewData(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Enterprise Ops</span>
          <h1>Compensation & Bank Export</h1>
          <p>Manage salary profiles, retro-adjustments, and generate bank-ready transfer files.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" onClick={handleBankExportPreview} disabled={loading}>
             <RefreshCw size={18} style={{ marginRight: '8px' }} className={loading ? 'animate-spin' : ''} />
             Generate Preview
          </Button>
          <Button variant="primary">
             <Landmark size={18} style={{ marginRight: '8px' }} />
             Export Bank File (.txt/.csv)
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
        <Card glass style={{ padding: '1.5rem' }}>
           <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#1e3a8a' }}>Bank Transfer Preview</h3>
           <div className="crud-table-wrap">
              <table className="crud-table">
                 <thead>
                    <tr>
                       <th>Beneficiary Name</th>
                       <th>Bank Account</th>
                       <th>Amount</th>
                       <th>Status</th>
                    </tr>
                 </thead>
                 <tbody>
                    {previewData.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem' }}>No data available. Click Generate Preview.</td></tr>
                    ) : previewData.map((item, idx) => (
                      <tr key={idx}>
                         <td style={{ fontWeight: 600 }}>{item.full_name}</td>
                         <td>
                            <div style={{ fontSize: '0.85rem' }}>{item.bank_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.account_number}</div>
                         </td>
                         <td style={{ fontWeight: 700 }}>Rp {item.amount?.toLocaleString()}</td>
                         <td><span className="status-pill status-approved">Verified</span></td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <Card glass style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                 <TrendingUp size={24} color="#2563eb" />
                 <h3 style={{ margin: 0, fontSize: '1rem' }}>Retro-Adjustments</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                 Apply salary corrections for previous months due to late promotions or errors.
              </p>
              <Button variant="outline" style={{ width: '100%' }}>Add Adjustment</Button>
           </Card>

           <Card glass style={{ padding: '1.5rem', background: '#fff7ed', border: '1px solid #ffedd5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                 <AlertCircle size={24} color="#ea580c" />
                 <h3 style={{ margin: 0, fontSize: '1rem', color: '#9a3412' }}>Validation Alerts</h3>
              </div>
              <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.8rem', color: '#9a3412', lineHeight: 1.6 }}>
                 <li>3 employees have missing bank account numbers.</li>
                 <li>Bank transfer limit exceeded for 1 transaction.</li>
              </ul>
              <Button variant="ghost" style={{ width: '100%', marginTop: '1rem', color: '#9a3412', fontWeight: 700 }}>
                 Fix Issues
              </Button>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default CompensationPage;
