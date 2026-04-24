import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, RefreshCw, Edit, Trash2, ShieldCheck, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { workforceService } from '@/features/workforce/api/workforce.service';
import './AdminWorkforcePages.css';

const HolidayCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await workforceService.getHolidays();
      setHolidays(Array.isArray(data) ? data : data.data || []);
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
          <h1>Kalender Libur</h1>
          <p>Kelola hari libur nasional dan kebijakan libur perusahaan untuk sinkronisasi jadwal kerja global.</p>
        </div>
        <button className="wf-create-btn" onClick={() => navigate('/workforce/holidays/create')}>
          <Plus size={28} />
          Tambah Libur
        </button>
      </div>

      <div className="workforce-stats-grid">
        {[
          { label: 'Total Libur (YTD)', value: '16', color: '#ef4444' },
          { label: 'Libur Terdekat', value: '12d', color: '#f59e0b' },
          { label: 'Cuti Bersama', value: '04', color: '#10b981' },
          { label: 'Audit Ready', value: '100%', color: '#3b82f6' },
        ].map((stat, i) => (
          <div key={i} className="stat-card-premium">
             <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
             <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="workforce-table-card">
        <div className="workforce-table-header">
           <h3 className="workforce-table-title">Daftar Hari Libur Nasional & Perusahaan</h3>
           <button className="wf-action-btn" onClick={fetchData}><RefreshCw size={20} className={loading ? 'animate-spin' : ''} /></button>
        </div>

        <table className="workforce-table">
          <thead>
            <tr>
              <th>Hari Libur</th>
              <th>Tanggal</th>
              <th>Tipe</th>
              <th>Berulang</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '10rem' }}><RefreshCw className="animate-spin" size={48} color="#2563eb" /></td></tr>
            ) : !Array.isArray(holidays) || holidays.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '10rem' }}>
                   <div style={{ opacity: 0.1, marginBottom: '2rem' }}><Calendar size={100} /></div>
                   <h2 style={{ color: '#94a3b8', margin: 0 }}>Belum ada kalender libur.</h2>
                </td>
              </tr>
            ) : holidays.map((h) => (
              <tr key={h.id}>
                <td>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>{h.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{h.description || 'No description provided.'}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 800 }}>{new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </td>
                <td>
                   <span style={{ fontWeight: 800, color: '#1e40af' }}>{h.type}</span>
                </td>
                <td>
                   <span style={{ fontWeight: 700 }}>{h.is_recurring ? 'YA' : 'TIDAK'}</span>
                </td>
                <td>
                  <span className="status-pill status-active">ACTIVE</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                   <div className="wf-btn-group" style={{ justifyContent: 'flex-end' }}>
                      <button className="wf-action-btn" onClick={() => navigate(`/workforce/holidays/edit/${h.id}`)}><Edit size={22} /></button>
                      <button className="wf-action-btn wf-action-btn-danger"><Trash2 size={22} /></button>
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

export default HolidayCalendarPage;
