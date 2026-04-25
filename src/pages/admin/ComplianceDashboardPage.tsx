import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, FileCheck, Clock, Plus, RefreshCw, Edit, Filter, Download, Search, Shield } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { workforceService } from '@/features/workforce/api/workforce.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const ComplianceDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsData = await workforceService.getComplianceStats();
      const docsData = await workforceService.getComplianceDocuments();
      const statsArray = Array.isArray(statsData) ? statsData : Array.isArray(statsData?.data) ? statsData.data : [];
      const docsArray = Array.isArray(docsData) ? docsData : Array.isArray(docsData?.data) ? docsData.data : [];
      setStats(statsArray);
      setDocuments(docsArray);
    } catch (err) {
      console.error(err);
      setStats([]);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const criticalCount = documents.filter(d => d.risk === 'CRITICAL').length;
  const mediumCount = documents.filter(d => d.risk === 'MEDIUM').length;
  const compliantCount = documents.filter(d => d.risk === 'LOW' || !d.risk).length;

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Shield size={16} />
              <span>Kepatuhan</span>
            </div>
            <h1 className="hero-title">Dashboard Kepatuhan</h1>
            <p className="hero-subtitle">
              Pantau status kepatuhan regulasi dan kesiapan audit.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => navigate('/compliance/settings')}>
              <Plus size={16} />
              Buat Kebijakan
            </button>
          </div>
        </div>
      </Card>

      <div className="leave-requests-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Total Dokumen</p>
              <p className="leave-summary-subtitle">Employee documents</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <FileCheck size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-blue">{documents.length}</div>
          <p className="leave-summary-trend">Total Dokumen</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Critical Risk</p>
              <p className="leave-summary-subtitle">Perlu perhatian</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-red">
              <AlertTriangle size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-red">{criticalCount}</div>
          <p className="leave-summary-trend">Risiko Kritis</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Medium Risk</p>
              <p className="leave-summary-subtitle">Perlu dipantau</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-orange">
              <Clock size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-orange">{mediumCount}</div>
          <p className="leave-summary-trend">Risiko Sedang</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Compliant</p>
              <p className="leave-summary-subtitle">Sudah sesuai</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-green">
              <ShieldCheck size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-green">{compliantCount}</div>
          <p className="leave-summary-trend">Kepatuhan</p>
        </div>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Status Kepatuhan Dokumen</h3>
              <span className="wuw-count-badge">{documents.length} Total</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="search-box">
                <Search size={18} />
                <input type="text" placeholder="Search..." />
              </div>
              <Button variant="ghost" size="sm"><Filter size={16} /></Button>
              <Button variant="ghost" size="sm"><Download size={16} /></Button>
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Karyawan</th>
                  <th>Jenis Dokumen</th>
                  <th>Tgl Kedaluwarsa</th>
                  <th>Status Risk</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>Loading...</td></tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <ShieldCheck size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                      <p>Belum ada data dokumen.</p>
                    </td>
                  </tr>
                ) : documents.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="cell-stacked">
                        <span className="cell-name-text">{row.name}</span>
                        <span className="cell-email">ID: {row.emp_id || `EMP-00${row.id}`}</span>
                      </div>
                    </td>
                    <td>{row.doc || '-'}</td>
                    <td style={{ fontWeight: row.date === 'Expired' ? 700 : 400, color: row.date === 'Expired' ? '#ef4444' : 'inherit' }}>
                      {row.date || '-'}
                    </td>
                    <td>
                      <span className={`status-badge ${row.risk === 'CRITICAL' ? 'status-danger' : row.risk === 'MEDIUM' ? 'status-pending' : 'status-active'}`}>
                        {row.risk || 'LOW'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btn-group">
                        <Button variant="ghost" size="sm"><Edit size={16} /></Button>
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

export default ComplianceDashboardPage;