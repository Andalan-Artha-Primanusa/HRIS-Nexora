import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Shield,
  RefreshCw,
  FileBadge,
  Eye
} from 'lucide-react';
import { Card, CardHeader } from '@/shared/ui';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { documentService } from '@/features/employee/api/document.service';
import type { EmployeeDocument } from '@/features/employee/types/document.types';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';

type TabType = "Semua" | "contract" | "letter" | "identity" | "pending" | "approved";

const MyDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("Semua");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentService.getMyDocuments();
      const data = response.data?.data || response.data || [];
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const title = String(doc?.title || '').toLowerCase();
      const type = String(doc?.document_type || '').toLowerCase();
      const query = searchText.toLowerCase();
      const matchSearch = title.includes(query) || type.includes(query);

      let statusMatch = true;
      if (activeTab === "contract" || activeTab === "letter" || activeTab === "identity") {
        statusMatch = doc.document_type?.toLowerCase() === activeTab;
      } else if (activeTab === "pending") {
        statusMatch = doc.status === 'pending';
      } else if (activeTab === "approved") {
        statusMatch = doc.status === 'approved';
      }

      return matchSearch && statusMatch;
    });
  }, [documents, searchText, activeTab]);

  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDocuments.slice(startIndex, startIndex + pageSize);
  }, [filteredDocuments, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredDocuments.length / pageSize);

  const summaryStats = useMemo(() => {
    const total = documents.length;
    const approved = documents.filter(d => d.status === 'approved').length;
    const pending = documents.filter(d => d.status === 'pending').length;
    const expiring = documents.filter(d => 
      d.expires_at && new Date(d.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length;

    return [
      { label: "Total File", subtitle: "Seluruh dokumen", value: total, tone: "blue" as const },
      { label: "Terverifikasi", subtitle: "Disetujui HR", value: approved, tone: "green" as const },
      { label: "Menunggu", subtitle: "Menunggu tinjauan", value: pending, tone: "orange" as const },
      { label: "Kadaluarsa Soon", subtitle: "Segera kadaluarsa", value: expiring, tone: "red" as const },
    ];
  }, [documents]);

  const getStatusClass = (status?: string) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "approved") return "status-badge status-badge--approved";
    if (normalized === "pending" || normalized === "submitted") return "status-badge status-badge--pending";
    if (normalized === "rejected") return "status-badge status-badge--draft";
    return "status-badge status-badge--draft";
  };

  const getDocIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('contract')) return <Shield size={24} />;
    if (t.includes('letter')) return <FileBadge size={24} />;
    return <FileText size={24} />;
  };

  const handleDownload = async (doc: EmployeeDocument) => {
    try {
      const token = localStorage.getItem('token');
      const filename = doc.file_url.split('/').pop();
      const res = await fetch(
        `https://moccasin-crab-693879.hostingersite.com/api/documents/${filename}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Download gagal");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "file.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Gagal download file");
    }
  };

  const isExpired = (dateStr: string) => new Date(dateStr) < new Date();

  return (
    <div className="crud-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <FileText size={16} />
              <span>Layanan Mandiri</span>
            </div>
            <h1 className="hero-title">Dokumen Saya</h1>
            <p className="hero-subtitle">
              Akses dokumen resmi, sertifikat, dan catatan pekerjaan Anda.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchDocuments} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => {}}>
              <Upload size={16} />
              Unggah Dokumen
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryStats.map((card) => {
          const Icon = card.tone === "blue" ? FileText
            : card.tone === "green" ? CheckCircle2
            : card.tone === "orange" ? Clock
            : AlertCircle;

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
            <FileText size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Dokumen</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua dokumen Anda</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="elyra-tabs">
            {(["Semua", "contract", "letter", "identity", "pending", "approved"] as TabType[]).map((tab) => (
              <button
                key={tab}
                className={`elyra-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari dokumen..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat dokumen..." />}

          {!loading && paginatedDocuments.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Belum Ada Dokumen"
                message={
                  searchText || activeTab !== "Semua"
                    ? "Tidak ada dokumen yang sesuai dengan kriteria Anda."
                    : "Anda belum memiliki dokumen. Unggah dokumen pertama untuk memulai."
                }
                actionLabel="Unggah Dokumen"
                onAction={() => {}}
              />
            </div>
          )}

          {!loading && paginatedDocuments.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '300px' }}>Dokumen</th>
                      <th>Tipe</th>
                      <th>Tanggal Update</th>
                      <th>Kadaluarsa</th>
                      <th className="th-center">Status</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {getDocIcon(doc.document_type)}
                            </div>
                            <div className="cell-stacked">
                              <span className="cell-name-text">{doc.title}</span>
                              <span className="cell-stacked__sub">
                                {doc.document_type.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge-soft badge-soft--blue">
                            {doc.document_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>
                              {new Date(doc.updated_at).toLocaleDateString("id-ID", {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </span>
                            <span className="cell-stacked__sub">Terakhir diubah</span>
                          </div>
                        </td>
                        <td>
                          {doc.expires_at ? (
                            <div className="cell-stacked">
                              {/* BUG FIX: className dan style sekarang terpisah dengan benar */}
                              <span
                                className="cell-stacked__main"
                                style={{
                                  fontSize: '0.85rem',
                                  color: isExpired(doc.expires_at) ? '#dc2626' : '#475569'
                                }}
                              >
                                {new Date(doc.expires_at).toLocaleDateString("id-ID", {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </span>
                              <span className="cell-stacked__sub">
                                {isExpired(doc.expires_at) ? 'Kadaluarsa' : 'Berlaku'}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>-</span>
                          )}
                        </td>
                        <td className="td-center">
                          <span className={getStatusClass(doc.status)}>
                            {doc.status === "approved" ? "Approved"
                              : doc.status === "pending" ? "Pending"
                              : doc.status === "rejected" ? "Rejected"
                              : doc.status}
                          </span>
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => handleDownload(doc)}
                              title="Download"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => {}}
                              title="Lihat Detail"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{paginatedDocuments.length}</strong> dari{' '}
                  <strong>{filteredDocuments.length}</strong> dokumen
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDocumentsPage;