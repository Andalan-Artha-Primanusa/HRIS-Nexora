import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, ArrowLeftRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { workforceService } from '@/features/workforce/api/workforce.service';

const ShiftSwapsPage: React.FC = () => {
  const [swaps, setSwaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await workforceService.getShiftSwaps();
      setSwaps(Array.isArray(data) ? data : data.data || []);
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
          <span className="reimb-badge reimb-badge-admin">Workforce</span>
          <h1>Shift Swaps</h1>
          <p>Manage and approve employee requests to exchange shifts.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary">
            <Plus size={18} style={{ marginRight: '8px' }} />
            New Swap Request
          </Button>
        </div>
      </div>

      <Card glass style={{ padding: '1.5rem' }}>
        <div className="crud-table-wrap">
          <table className="crud-table">
            <thead>
              <tr>
                <th>Requester</th>
                <th>Swap With</th>
                <th>Shift Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>Loading...</td></tr>
              ) : swaps.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>No shift swap requests found.</td></tr>
              ) : swaps.map((swap) => (
                <tr key={swap.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{swap.requester?.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{swap.requester_shift_name}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{swap.target?.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{swap.target_shift_name}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} />
                      {new Date(swap.shift_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill status-${swap.status}`}>{swap.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                       <Button variant="ghost" size="sm" style={{ color: '#10b981' }}><CheckCircle size={18} /></Button>
                       <Button variant="ghost" size="sm" style={{ color: '#ef4444' }}><XCircle size={18} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ShiftSwapsPage;
