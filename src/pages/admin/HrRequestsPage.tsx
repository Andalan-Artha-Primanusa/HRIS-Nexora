import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, RefreshCw, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { requestService } from '@/features/requests/api/requests.service';
import '@/shared/styles/CrudPage.css';

const HrRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await requestService.getRequests();
      // Handle Laravel pagination: response.data.data or direct data.data
      let rawData = response?.data?.data || response?.data || response;
      if (typeof rawData === 'object' && rawData !== null && 'data' in rawData && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }
      setRequests(Array.isArray(rawData) ? rawData : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    switch (s) {
      case 'pending': return { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5', icon: <Clock size={12} /> };
      case 'in_progress': return { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe', icon: <RefreshCw size={12} className="animate-spin" /> };
      case 'resolved': return { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7', icon: <CheckCircle size={12} /> };
      case 'closed': return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', icon: <XCircle size={12} /> };
      default: return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', icon: <AlertCircle size={12} /> };
    }
  };

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin" style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: 'white', border: 'none' }}>Service Desk</span>
          <h1 style={{ marginTop: '0.75rem' }}>HR Service Requests</h1>
          <p style={{ color: '#64748b' }}>Manage and track employee requests and inquiries with real-time status updates.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={fetchData} 
            className="btn-refresh"
            style={{ 
              padding: '10px', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} color="#64748b" />
          </button>
          <Button variant="primary" onClick={() => navigate('/hr-requests/sla')} style={{ borderRadius: '12px', height: '44px', fontWeight: 600 }}>
            <FileText size={18} style={{ marginRight: '8px' }} />
            SLA Reports
          </Button>
        </div>
      </div>

      <Card glass style={{ padding: '0', borderRadius: '24px', border: '1px solid var(--cr-border)', overflow: 'hidden' }}>
        <div className="crud-table-wrap" style={{ margin: 0 }}>
          <table className="crud-table">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ paddingLeft: '1.5rem' }}>Ticket ID</th>
                <th>Employee</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem' }}>
                    <RefreshCw size={32} className="animate-spin" color="#2563eb" />
                    <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 500 }}>Fetching support tickets...</p>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                    No service requests found.
                  </td>
                </tr>
              ) : requests.map((req) => {
                const color = getStatusColor(req.status);
                return (
                  <tr key={req.id} style={{ transition: 'all 0.2s' }}>
                    <td style={{ paddingLeft: '1.5rem' }}>
                      <span style={{ fontWeight: 800, color: '#1e293b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        #{req.ticket_no || req.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                          {(req.employee?.full_name || 'S')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>{req.employee?.full_name || 'System'}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{req.category?.replace('_', ' ').toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.subject}>
                        {req.subject}
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 800, 
                        color: req.priority?.toLowerCase() === 'high' ? '#ef4444' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: req.priority?.toLowerCase() === 'high' ? '#ef4444' : '#94a3b8' }} />
                        {req.priority?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '10px', 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        backgroundColor: color.bg,
                        color: color.text,
                        border: `1px solid ${color.border}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {color.icon}
                        {req.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={14} color="#94a3b8" />
                        </div>
                        <span style={{ fontWeight: 500 }}>{req.assigned_to?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                       <button 
                        onClick={() => navigate(`/hr-requests/respond/${req.id}`)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          background: 'white',
                          color: '#2563eb',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                       >
                         Manage
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default HrRequestsPage;
