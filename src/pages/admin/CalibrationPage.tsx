import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Plus, RefreshCw, Calendar, Users, FileBarChart, Shield } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { performanceService } from '@/features/performance/api/performance.service';
import { useAuthStore } from '@/app/store/auth.store';
import { RBACUtils } from '@/shared/hooks/rbac';

const CalibrationPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const canAccess = RBACUtils.hasPermission(user, 'kpi.view');
  if (!canAccess) {
    return (
      <div className="crud-page"><Card className="hero-card"><div className="hero-card-inner"><div className="hero-content"><div className="hero-badge"><Shield size={16} /><span>Admin Center</span></div><h1 className="hero-title">Akses Ditolak</h1><p className="hero-subtitle">Anda tidak memiliki izin untuk mengakses halaman ini.</p></div></div></Card></div>
    );
  }
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await performanceService.getCalibrationSessions();
      setSessions(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Performance</span>
          <h1>Performance Calibration</h1>
          <p>Collaborative sessions to ensure fair and consistent performance ratings across teams.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary" onClick={() => navigate('/performance/calibration/create')}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            New Calibration Session
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
             <Scale size={48} color="#94a3b8" style={{ marginBottom: '1rem', opacity: 0.3 }} />
             <p>No calibration sessions scheduled.</p>
          </div>
        ) : sessions.map((session) => (
          <Card key={session.id} glass style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a' }}>{session.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  <Calendar size={14} />
                  {new Date(session.date).toLocaleDateString()}
                </div>
              </div>
              <span className={`status-pill status-${session.status}`}>{session.status}</span>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
               <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Participants</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                     <Users size={16} />
                     {session.participants?.length || 0} Managers
                  </div>
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Reviews</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                     <FileBarChart size={16} />
                     {session.reviews?.length || 0} Employees
                  </div>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
               <Button variant="primary" style={{ flex: 1 }} onClick={() => navigate(`/performance/calibration/edit/${session.id}`)}>
                  Edit Session
               </Button>
               <Button variant="outline">
                  View Report
               </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CalibrationPage;

