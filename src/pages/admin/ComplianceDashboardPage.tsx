import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, FileCheck, Clock, Plus, RefreshCw, Edit, Filter, Download, Search } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { workforceService } from '@/features/workforce/api/workforce.service';
import '@/shared/styles/CrudPage.css';

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
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Compliance</span>
          <h1>Dashboard Kepatuhan</h1>
          <p>Monitor status kepatuhan regulasi dan kesiapan audit.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate('/compliance/settings')}>
            <Plus size={16} />
            Buat Kebijakan
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Total Dokumen</span>
              <p className="summary-card__subtitle">Employee documents</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <FileCheck size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{documents.length}</div>
          <div className="summary-card__change">Documents</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Critical Risk</span>
              <p className="summary-card__subtitle">Perlu perhatian</p>
            </div>
            <span className="summary-card__icon summary-card__icon--red">
              <AlertTriangle size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--red">{criticalCount}</div>
          <div className="summary-card__change">Critical</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Compliant</span>
              <p className="summary-card__subtitle">Status aman</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <ShieldCheck size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{compliantCount}</div>
          <div className="summary-card__change">Compliant</div>
        </Card>
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