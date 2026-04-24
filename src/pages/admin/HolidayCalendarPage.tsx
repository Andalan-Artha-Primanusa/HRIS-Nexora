import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, RefreshCw, Edit, Trash2, ShieldCheck } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { workforceService } from '@/features/workforce/api/workforce.service';
import '@/shared/styles/CrudPage.css';

const HolidayCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await workforceService.getHolidays();
      const holidaysArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setHolidays(holidaysArray);
    } catch (err) {
      console.error(err);
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Workforce</span>
          <h1>Kalender Libur</h1>
          <p>Kelola hari libur nasional dan kebijakan libur perusahaan.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate('/workforce/holidays/create')}>
            <Plus size={16} />
            Tambah Libur
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Total Libur</span>
              <p className="summary-card__subtitle">Tahun ini</p>
            </div>
            <span className="summary-card__icon summary-card__icon--red">
              <Calendar size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--red">{holidays.length}</div>
          <div className="summary-card__change">Hari libur</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Libur Terdekat</span>
              <p className="summary-card__subtitle">Akan datang</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <Calendar size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">-</div>
          <div className="summary-card__change">Next holiday</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Audit Ready</span>
              <p className="summary-card__subtitle">Status kepatuhan</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <ShieldCheck size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">100%</div>
          <div className="summary-card__change">Compliant</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar Hari Libur</h3>
              <span className="wuw-count-badge">{holidays.length} Total</span>
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          <div className="table-wrap">
            <table className="data-table">
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
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Loading...</td></tr>
                ) : holidays.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                      <p>Belum ada kalender libur.</p>
                    </td>
                  </tr>
                ) : holidays.map((h) => (
                  <tr key={h.id}>
                    <td>
                      <div className="cell-stacked">
                        <span className="cell-name-text">{h.name}</span>
                        <span className="cell-email">{h.description || '-'}</span>
                      </div>
                    </td>
                    <td>{h.date ? new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</td>
                    <td><span style={{ fontWeight: 600, color: '#1e40af' }}>{h.type || '-'}</span></td>
                    <td>{h.is_recurring ? 'YA' : 'TIDAK'}</td>
                    <td><span className="status-badge status-active">ACTIVE</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btn-group">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/workforce/holidays/edit/${h.id}`)}><Edit size={16} /></Button>
                        <Button variant="ghost" size="sm" danger><Trash2 size={16} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidayCalendarPage;