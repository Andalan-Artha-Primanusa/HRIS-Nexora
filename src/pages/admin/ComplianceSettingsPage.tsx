import React, { useState } from 'react';
import { ShieldCheck, Database, UserX, FileText, Plus, AlertCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';

const ComplianceSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'retention' | 'privacy'>('retention');

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Security & Privacy</span>
          <h1>Compliance Settings</h1>
          <p>Configure data retention policies and manage employee privacy requests.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
         <Button 
           variant={activeTab === 'retention' ? 'primary' : 'outline'} 
           onClick={() => setActiveTab('retention')}
         >
           <Database size={18} style={{ marginRight: '8px' }} />
           Retention Policies
         </Button>
         <Button 
           variant={activeTab === 'privacy' ? 'primary' : 'outline'} 
           onClick={() => setActiveTab('privacy')}
         >
           <UserX size={18} style={{ marginRight: '8px' }} />
           Privacy Requests
         </Button>
      </div>

      {activeTab === 'retention' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
           {[
             { name: 'Payroll Records', period: '10 Years', category: 'Finance', icon: <FileText /> },
             { name: 'Employee Contracts', period: 'Permanent', category: 'Legal', icon: <ShieldCheck /> },
             { name: 'Attendance Logs', period: '2 Years', category: 'Operational', icon: <Database /> },
           ].map((policy, i) => (
             <Card key={i} glass style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem' }}>
                   <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
                      {policy.icon}
                   </div>
                   <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{policy.name}</h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                   <span style={{ color: '#64748b' }}>Retention Period</span>
                   <span style={{ fontWeight: 700 }}>{policy.period}</span>
                </div>
                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.75rem', color: '#64748b', marginBottom: '1.5rem' }}>
                   Policy compliant with local labor regulations and data protection acts.
                </div>
                <Button variant="outline" style={{ width: '100%' }}>Modify Policy</Button>
             </Card>
           ))}
           <Card glass style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1' }}>
              <Button variant="ghost">
                 <Plus size={24} style={{ marginBottom: '8px' }} />
                 <br />
                 New Retention Rule
              </Button>
           </Card>
        </div>
      ) : (
        <Card glass style={{ padding: '1.5rem' }}>
           <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>Active Privacy Requests (GDPR/Right to be Forgotten)</h3>
           <div className="crud-table-wrap">
              <table className="crud-table">
                 <thead>
                    <tr>
                       <th>Subject</th>
                       <th>Request Type</th>
                       <th>Request Date</th>
                       <th>SLA Status</th>
                       <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr>
                       <td style={{ fontWeight: 600 }}>John Doe</td>
                       <td>Data Deletion</td>
                       <td>{new Date().toLocaleDateString()}</td>
                       <td><span className="status-pill status-approved" style={{ background: '#fef2f2', color: '#ef4444' }}>Due in 5 days</span></td>
                       <td style={{ textAlign: 'right' }}>
                          <Button variant="primary" size="sm">Process Request</Button>
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>
           <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff7ed', borderRadius: '12px', display: 'flex', gap: '12px' }}>
              <AlertCircle size={24} color="#ea580c" />
              <div>
                 <h4 style={{ margin: '0 0 4px', color: '#9a3412', fontSize: '0.9rem' }}>Privacy Notice</h4>
                 <p style={{ margin: 0, color: '#9a3412', fontSize: '0.8rem', opacity: 0.8 }}>
                    Processing deletion requests will permanently remove employee data across all modules. This action cannot be undone.
                 </p>
              </div>
           </div>
        </Card>
      )}
    </div>
  );
};

export default ComplianceSettingsPage;
