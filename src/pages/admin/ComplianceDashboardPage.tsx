import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, FileCheck, Clock, CheckCircle2, Search, Download } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { organizationService } from '@/features/organization/api/organization.service';

const ComplianceDashboardPage: React.FC = () => {
  const [, setStats] = useState<any>(null);
  const [expiringDocs, setExpiringDocs] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overview, docs] = await Promise.all([
          organizationService.getComplianceOverview(),
          organizationService.getExpiringDocuments()
        ]);
        setStats(overview.data || overview);
        setExpiringDocs(docs.data || docs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Compliance</span>
          <h1>Compliance & Audit Dashboard</h1>
          <p>Monitor document validity, regulatory compliance, and audit readiness.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline">
            <Download size={18} style={{ marginRight: '8px' }} />
            Compliance Report
          </Button>
          <Button variant="primary">
            Run Audit Check
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Card glass style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Compliance Score</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>94%</div>
            </div>
            <ShieldCheck size={32} color="#10b981" style={{ opacity: 0.6 }} />
          </div>
        </Card>
        <Card glass style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Expiring Soon</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>12</div>
            </div>
            <Clock size={32} color="#f59e0b" style={{ opacity: 0.6 }} />
          </div>
        </Card>
        <Card glass style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Critical Missing</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>3</div>
            </div>
            <AlertTriangle size={32} color="#ef4444" style={{ opacity: 0.6 }} />
          </div>
        </Card>
        <Card glass style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Last Audit</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>2d ago</div>
            </div>
            <FileCheck size={32} color="#2563eb" style={{ opacity: 0.6 }} />
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
        <Card glass style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a' }}>Expiring Documents</h3>
            <div style={{ position: 'relative', width: '250px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" className="form-control" placeholder="Search documents..." style={{ paddingLeft: '32px', fontSize: '0.85rem' }} />
            </div>
          </div>
          
          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Document Type</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {expiringDocs.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center' }}>No expiring documents found.</td></tr>
                ) : expiringDocs.map((doc: any) => (
                  <tr key={doc.id}>
                    <td>{doc.employee?.full_name}</td>
                    <td>{doc.document_type}</td>
                    <td>{doc.expiry_date}</td>
                    <td>
                      <span className={`status-pill status-rejected`}>Expiring</span>
                    </td>
                    <td>
                      <Button variant="ghost" size="sm">Notify</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card glass style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#1e3a8a' }}>Audit Checklist</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Employee Contracts (PKWT/PKWTT)', status: 'complete' },
              { label: 'Tax Identification (NPWP)', status: 'complete' },
              { label: 'Work Permits (IMTA/KITAS)', status: 'warning' },
              { label: 'Insurance Proof (BPJS)', status: 'complete' },
              { label: 'Background Checks', status: 'pending' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px' }}>
                {item.status === 'complete' ? <CheckCircle2 size={18} color="#10b981" /> : <Clock size={18} color="#f59e0b" />}
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155', flex: 1 }}>{item.label}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: item.status === 'complete' ? '#10b981' : '#f59e0b', textTransform: 'uppercase' }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
          <Button variant="primary" style={{ width: '100%', marginTop: '2rem' }}>
            Submit Compliance Audit
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ComplianceDashboardPage;
