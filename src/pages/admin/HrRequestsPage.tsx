import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, RefreshCw } from 'lucide-react';
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
      const data = await requestService.getRequests();
      setRequests(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' };
      case 'in_progress': return { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe' };
      case 'resolved': return { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' };
      case 'closed': return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
      default: return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
    }
  };

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Service Desk</span>
          <h1>HR Service Requests</h1>
          <p>Manage and track employee requests and inquiries.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary" onClick={() => navigate('/hr-requests/sla')}>
            SLA Reports
          </Button>
        </div>
      </div>

      <Card glass style={{ padding: '1.5rem' }}>
        <div className="crud-table-wrap">
          <table className="crud-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Employee</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading tickets...</td></tr>
              ) : requests.map((req) => {
                const color = getStatusColor(req.status);
                return (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 700, color: '#1e293b' }}>#{req.ticket_no || req.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.employee?.full_name || 'System'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.category}</div>
                    </td>
                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.subject}
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        color: req.priority === 'high' ? '#ef4444' : '#64748b' 
                      }}>
                        {req.priority?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '999px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: color.bg,
                        color: color.text,
                        border: `1px solid ${color.border}`
                      }}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        <User size={14} color="#94a3b8" />
                        {req.assigned_to?.name || 'Unassigned'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                       <Button variant="ghost" size="sm" onClick={() => navigate(`/hr-requests/respond/${req.id}`)}>Details</Button>
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
