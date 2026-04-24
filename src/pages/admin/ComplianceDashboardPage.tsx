import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, FileCheck, Clock, ArrowRight, Plus, Download, Filter, RefreshCw, BarChart3, Lock, Edit } from 'lucide-react';
import { workforceService } from '@/features/workforce/api/workforce.service';
import './AdminWorkforcePages.css';

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
      setStats(Array.isArray(statsData) ? statsData : statsData.data || []);
      setDocuments(Array.isArray(docsData) ? docsData : docsData.data || []);
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
          <h1>Dashboard Kepatuhan</h1>
          <p>Monitor status kepatuhan regulasi, retensi data, dan kesiapan audit perusahaan secara real-time.</p>
        </div>
        <button className="wf-create-btn" onClick={() => navigate('/compliance/settings')}>
          <Plus size={28} />
          Buat Kebijakan Baru
        </button>
      </div>

      <div className="workforce-stats-grid">
        {loading ? (
           <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}><RefreshCw className="animate-spin" size={32} color="#2563eb" /></div>
        ) : stats.map((stat, i) => (
          <div key={i} className="stat-card-premium">
             <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
             <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="workforce-table-card">
        <div className="workforce-table-header">
           <h3 className="workforce-table-title">Status Kepatuhan Dokumen Karyawan</h3>
<div className="action-btn-group">
               <button className="action-btn" onClick={fetchData} style={{ background: '#f1f5f9', color: '#64748b' }}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
               <button className="action-btn" style={{ background: '#f1f5f9', color: '#64748b' }}><Filter size={16} /></button>
               <button className="action-btn" style={{ background: '#f1f5f9', color: '#64748b' }}><Download size={16} /></button>
            </div>
        </div>

        <table className="workforce-table">
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
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '10rem' }}><RefreshCw className="animate-spin" size={48} color="#2563eb" /></td></tr>
            ) : !Array.isArray(documents) || documents.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '10rem' }}>
                   <div style={{ opacity: 0.1, marginBottom: '2rem' }}><ShieldCheck size={100} /></div>
                   <h2 style={{ color: '#94a3b8', margin: 0 }}>Belum ada data dokumen.</h2>
                </td>
              </tr>
            ) : documents.map((row) => (
              <tr key={row.id}>
                <td>
                   <div style={{ fontWeight: 900, color: '#0f172a' }}>{row.name}</div>
                   <div style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: {row.emp_id || `EMP-00${row.id}`}</div>
                </td>
                <td>{row.doc}</td>
                <td>
                   <div style={{ fontWeight: 800, color: row.date === 'Expired' ? '#ef4444' : '#0f172a' }}>{row.date}</div>
                </td>
                <td>
                  <span className={`status-pill status-${row.risk === 'CRITICAL' ? 'critical' : row.risk === 'MEDIUM' ? 'pending' : 'active'}`}>
                    {row.risk}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
<div className="action-btn-group">
                       <button className="action-btn action-btn-edit"><Edit size={16} /></button>
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

export default ComplianceDashboardPage;
