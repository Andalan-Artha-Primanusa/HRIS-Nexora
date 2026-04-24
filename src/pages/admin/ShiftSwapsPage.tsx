import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Plus, CheckCircle2, XCircle, Search, RefreshCw, Calendar, ArrowRight } from 'lucide-react';
import { workforceService } from '@/features/workforce/api/workforce.service';
import './AdminWorkforcePages.css';

const ShiftSwapsPage: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="admin-workforce-page">
      <div className="workforce-header">
        <div className="workforce-header-content">
          <h1>Tukar Shift</h1>
          <p>Kelola permintaan penukaran jadwal kerja antar karyawan. Pastikan stabilitas operasional tetap terjaga.</p>
        </div>
        <button className="wf-create-btn" onClick={() => navigate('/workforce/shift-swaps/create')}>
          <Plus size={28} />
          Request Baru
        </button>
      </div>

      <div className="workforce-stats-grid">
        {[
          { label: 'Pending Request', value: '12', color: '#f59e0b' },
          { label: 'Approved Today', value: '08', color: '#10b981' },
          { label: 'Total Swaps', value: '450', color: '#3b82f6' },
          { label: 'Conflict Alert', value: '01', color: '#ef4444' },
        ].map((stat, i) => (
          <div key={i} className="stat-card-premium">
             <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
             <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="workforce-table-card">
        <div className="workforce-table-header">
           <h3 className="workforce-table-title">Riwayat Penukaran Shift</h3>
           <div className="wf-btn-group">
              <button className="wf-action-btn" onClick={fetchData}><RefreshCw size={20} className={loading ? 'animate-spin' : ''} /></button>
           </div>
        </div>

        <table className="workforce-table">
          <thead>
            <tr>
              <th>Requester</th>
              <th style={{ textAlign: 'center' }}></th>
              <th>Target</th>
              <th>Tanggal & Shift</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '10rem' }}><RefreshCw className="animate-spin" size={48} color="#2563eb" /></td></tr>
            ) : !Array.isArray(swaps) || swaps.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '10rem' }}>
                   <div style={{ opacity: 0.1, marginBottom: '2rem' }}><ArrowLeftRight size={100} /></div>
                   <h2 style={{ color: '#94a3b8', margin: 0 }}>Belum ada data penukaran.</h2>
                </td>
              </tr>
            ) : swaps.map((swap) => (
              <tr key={swap.id}>
                <td>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{swap.requester?.full_name || 'N/A'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{swap.requester_shift_name}</div>
                </td>
                <td style={{ textAlign: 'center' }}>
                   <ArrowRight size={24} color="#94a3b8" />
                </td>
                <td>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{swap.target?.full_name || 'N/A'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{swap.target_shift_name}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                    <Calendar size={18} color="#3b82f6" />
                    {new Date(swap.shift_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{swap.shift_name}</div>
                </td>
                <td>
                  <span className={`status-pill status-${(swap.status || 'pending').toLowerCase()}`}>
                    {swap.status || 'PENDING'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                   <div className="wf-btn-group" style={{ justifyContent: 'flex-end' }}>
                      <button className="wf-action-btn" title="Approve"><CheckCircle2 size={24} color="#16a34a" /></button>
                      <button className="wf-action-btn wf-action-btn-danger" title="Reject"><XCircle size={24} color="#ef4444" /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShiftSwapsPage;
