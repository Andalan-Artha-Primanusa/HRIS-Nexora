import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserMinus, UserPlus, AlertCircle, PieChart, BarChart3, ArrowUpRight, ArrowDownRight, ArrowLeft, Shield } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { reportingService } from '@/features/reporting/api/reporting.service';
import { useAuthStore } from '@/app/store/auth.store';
import { RBACUtils } from '@/shared/hooks/rbac';

const DetailedPeopleAnalyticsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const canAccess = RBACUtils.hasPermission(user, 'reporting.dashboard');
  if (!canAccess) {
    return (
      <div className="crud-page"><Card className="hero-card"><div className="hero-card-inner"><div className="hero-content"><div className="hero-badge"><Shield size={16} /><span>Admin Center</span></div><h1 className="hero-title">Akses Ditolak</h1><p className="hero-subtitle">Anda tidak memiliki izin untuk mengakses halaman ini.</p></div></div></Card></div>
    );
  }
  const navigate = useNavigate();
  const [, setData] = useState<any>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await reportingService.getDashboardSummary();
        setData(res.data || res);
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
          <span className="reimb-badge reimb-badge-admin">Analytics</span>
          <h1>Detailed People Insights</h1>
          <p>Deep-dive into workforce demographics, turnover trends, and talent distribution.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} style={{ marginRight: '8px' }} />
            Back to Dashboard
          </Button>
          <Button variant="outline">Download Report</Button>
          <Button variant="primary">Filter Data</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Headcount', value: '1,284', trend: '+12%', up: true, icon: <Users /> },
          { label: 'Turnover Rate', value: '4.2%', trend: '-2%', up: false, icon: <UserMinus /> },
          { label: 'New Hires', value: '45', trend: '+8%', up: true, icon: <UserPlus /> },
          { label: 'Retention Risk', value: '18', trend: 'High', up: false, icon: <AlertCircle /> },
        ].map((stat, i) => (
          <Card key={i} glass style={{ padding: '1.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '12px', color: '#2563eb' }}>{stat.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: stat.up ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                   {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                   {stat.trend}
                </div>
             </div>
             <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>{stat.label}</div>
             <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e3a8a' }}>{stat.value}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
         <Card glass style={{ padding: '2rem', minHeight: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Employee Growth Trend</h3>
               <BarChart3 size={20} color="#94a3b8" />
            </div>
            <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
               {[40, 55, 45, 70, 85, 95, 80, 100, 110, 120, 115, 130].map((h, i) => (
                 <div key={i} style={{ flex: 1, background: '#3b82f6', height: `${h}%`, borderRadius: '4px 4px 0 0', opacity: 0.2 + (i * 0.07) }}></div>
               ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.7rem', color: '#94a3b8' }}>
               <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
            </div>
         </Card>

         <Card glass style={{ padding: '2rem', minHeight: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Department Distribution</h3>
               <PieChart size={20} color="#94a3b8" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
               {[
                 { name: 'Engineering', count: 450, color: '#3b82f6', percent: 35 },
                 { name: 'Marketing', count: 280, color: '#ec4899', percent: 22 },
                 { name: 'Operations', count: 320, color: '#10b981', percent: 25 },
                 { name: 'HR & Admin', count: 234, color: '#8b5cf6', percent: 18 },
               ].map((dept, i) => (
                 <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                       <span style={{ fontWeight: 600 }}>{dept.name}</span>
                       <span style={{ color: '#64748b' }}>{dept.count} ({dept.percent}%)</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                       <div style={{ width: `${dept.percent}%`, height: '100%', background: dept.color }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </Card>
      </div>

      <Card glass style={{ padding: '1.5rem' }}>
         <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>Employee Flight Risk (AI Insight)</h3>
         <div className="crud-table-wrap">
            <table className="crud-table">
               <thead>
                  <tr>
                     <th>Employee</th>
                     <th>Department</th>
                     <th>Risk Level</th>
                     <th>Primary Reason</th>
                     <th style={{ textAlign: 'right' }}>Recommendation</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td style={{ fontWeight: 600 }}>Sarah Jenkins</td>
                     <td>Engineering</td>
                     <td><span className="status-pill status-pending" style={{ background: '#fef2f2', color: '#ef4444' }}>High</span></td>
                     <td>Below market salary (15%)</td>
                     <td style={{ textAlign: 'right' }}><Button variant="outline" size="sm">Salary Review</Button></td>
                  </tr>
                  <tr>
                     <td style={{ fontWeight: 600 }}>Michael Chen</td>
                     <td>Operations</td>
                     <td><span className="status-pill status-pending" style={{ background: '#fff7ed', color: '#f59e0b' }}>Medium</span></td>
                     <td>Low engagement score (Last 3m)</td>
                     <td style={{ textAlign: 'right' }}><Button variant="outline" size="sm">1-on-1 Meeting</Button></td>
                  </tr>
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
};

export default DetailedPeopleAnalyticsPage;
