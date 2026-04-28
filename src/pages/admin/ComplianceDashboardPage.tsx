import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, FileCheck, Clock, Plus, RefreshCw, Edit, Search, Shield, Filter } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { workforceService } from '@/features/workforce/api/workforce.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';

const ComplianceDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"Semua" | "Critical" | "Medium" | "Compliant">("Semua");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

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

  const summaryStats = useMemo(() => {
    const total = documents.length;
    const critical = documents.filter(d => d.risk === 'CRITICAL').length;
    const medium = documents.filter(d => d.risk === 'MEDIUM').length;
    const compliant = documents.filter(d => d.risk === 'LOW' || !d.risk).length;

    return [
      { label: "Total Dokumen", subtitle: "Employee documents", value: total, tone: "blue" as const },
      { label: "Critical Risk", subtitle: "Perlu perhatian", value: critical, tone: "red" as const },
      { label: "Medium Risk", subtitle: "Perlu dipantau", value: medium, tone: "orange" as const },
      { label: "Compliant", subtitle: "Sudah sesuai", value: compliant, tone: "green" as const },
    ];
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc: any) => {
      const name = String(doc?.name || '').toLowerCase();
      const docType = String(doc?.doc || '').toLowerCase();
      const query = searchText.toLowerCase();
      const matchSearch = name.includes(query) || docType.includes(query);

      let riskMatch = true;
      if (activeTab === "Critical") riskMatch = doc.risk === 'CRITICAL';
      else if (activeTab === "Medium") riskMatch = doc.risk === 'MEDIUM';
      else if (activeTab === "Compliant") riskMatch = doc.risk === 'LOW' || !doc.risk;

      return matchSearch && riskMatch;
    });
  }, [documents, searchText, activeTab]);

  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDocuments.slice(startIndex, startIndex + pageSize);
  }, [filteredDocuments, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredDocuments.length / pageSize);

  const clearFilters = () => {
    setSearchText("");
    setActiveTab("Semua");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  return (
    <div className="crud-page">
      {/* Header */}
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

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryStats.map((card) => {
          const Icon = card.tone === "blue" ? FileCheck : card.tone === "red" ? AlertTriangle : card.tone === "orange" ? Clock : ShieldCheck;

          return (
            <div key={card.label} className="employee-summary-card">
              <div className="employee-summary-header">
                <div>
                  <p className="employee-summary-label">{card.label}</p>
                  <p className="employee-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`employee-summary-icon-wrapper employee-icon-${card.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`employee-summary-value employee-value-${card.tone}`}>{card.value}</div>
              <p className="employee-summary-trend">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Status Kepatuhan Dokumen</h2>
            <p className="analytics-subtitle">Pantau dokumen berisiko dan kepatuhan</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="search-filter-group">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Cari nama karyawan atau jenis dokumen..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <button className="clear-search-btn" onClick={() => setSearchText("")}>×</button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters} disabled={!searchText && activeTab === "Semua"}>
              <RefreshCw size={14} />
              Reset
            </Button>
          </div>

          <div className="tabs-container">
            {(["Semua", "Critical", "Medium", "Compliant"] as const).map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab !== "Semua" && (
                  <span className="tab-count">
                    {tab === "Critical"
                      ? documents.filter(d => d.risk === 'CRITICAL').length
                      : tab === "Medium"
                      ? documents.filter(d => d.risk === 'MEDIUM').length
                      : documents.filter(d => d.risk === 'LOW' || !d.risk).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="data-table-card">
        <div className="data-table-header">
          <h3 className="data-table-title">
            Status Kepatuhan Dokumen
            <span className="data-table-count">{filteredDocuments.length} ditemukan</span>
          </h3>
        </div>

        {loading ? (
          <LoadingState message="Memuat data kepatuhan..." />
        ) : filteredDocuments.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck size={48} />}
            title="Tidak ada dokumen ditemukan"
            message={searchText || activeTab !== "Semua" ? "Coba ubah kata kunci atau filter" : "Belum ada data dokumen"}
          />
        ) : (
          <>
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
                  {paginatedDocuments.map((row) => (
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
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/compliance/settings`)}>
                            <Edit size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredDocuments.length)} dari {filteredDocuments.length}
                </div>
                <div className="pagination-controls">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Sebelumnya
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`pagination-page-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ComplianceDashboardPage;
