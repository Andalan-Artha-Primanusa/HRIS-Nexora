import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Plus, CheckCircle2, XCircle, RefreshCw, Calendar, ArrowRight, Search } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { workforceService } from '@/features/workforce/api/workforce.service';
import '@/shared/styles/CrudPage.css';

const ShiftSwapsPage: React.FC = () => {
  const navigate = useNavigate();
  const [swaps, setSwaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await workforceService.getShiftSwaps();
      const swapsArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setSwaps(swapsArray);
    } catch (err) {
      console.error(err);
      setSwaps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingSwaps = swaps.filter(s => s.status === 'pending');
  const approvedSwaps = swaps.filter(s => s.status === 'approved');
  const rejectedSwaps = swaps.filter(s => s.status === 'rejected');

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { class: string; label: string }> = {
      pending: { class: 'status-pending', label: 'Pending' },
      approved: { class: 'status-active', label: 'Approved' },
      rejected: { class: 'status-danger', label: 'Rejected' },
    };
    return statusMap[status?.toLowerCase()] || { class: 'status-default', label: status };
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Workforce</span>
          <h1>Tukar Shift</h1>
          <p>Kelola permintaan penukaran jadwal kerja antar karyawan.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate('/workforce/shift-swaps/create')}>
            <Plus size={16} />
            Request Baru
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Pending</span>
              <p className="summary-card__subtitle">Menunggu persetujuan</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <ArrowLeftRight size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">{pendingSwaps.length}</div>
          <div className="summary-card__change">Pending</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Approved</span>
              <p className="summary-card__subtitle">Disetujui hari ini</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <CheckCircle2 size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{approvedSwaps.length}</div>
          <div className="summary-card__change">Approved</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Total Swaps</span>
              <p className="summary-card__subtitle">Semua penukaran</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <ArrowLeftRight size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{swaps.length}</div>
          <div className="summary-card__change">Total</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Riwayat Penukaran Shift</h3>
              <span className="wuw-count-badge">{swaps.length} Total</span>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          <div className="table-wrap">
            <table className="data-table">
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
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Loading...</td></tr>
                ) : swaps.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <ArrowLeftRight size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                      <p>Belum ada data penukaran.</p>
                    </td>
                  </tr>
                ) : swaps.map((swap) => {
                  const statusInfo = getStatusBadge(swap.status);
                  return (
                    <tr key={swap.id}>
                      <td>
                        <div className="cell-stacked">
                          <span className="cell-name-text">{swap.requester?.full_name || 'N/A'}</span>
                          <span className="cell-email">{swap.requester_shift_name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <ArrowRight size={20} color="#94a3b8" />
                      </td>
                      <td>
                        <div className="cell-stacked">
                          <span className="cell-name-text">{swap.target?.full_name || 'N/A'}</span>
                          <span className="cell-email">{swap.target_shift_name}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} color="#3b82f6" />
                          {swap.shift_date ? new Date(swap.shift_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) : '-'}
                        </div>
                        <div className="cell-email">{swap.shift_name}</div>
                      </td>
                      <td>
                        <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group">
                          <Button variant="ghost" size="sm"><CheckCircle2 size={16} /></Button>
                          <Button variant="ghost" size="sm" danger><XCircle size={16} /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftSwapsPage;