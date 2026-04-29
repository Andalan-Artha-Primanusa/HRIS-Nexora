import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { LoadingState, ErrorState, EmptyState } from "@/shared/ui/DataStateDisplay";
import { BarChart3, CheckCircle2, Receipt, Wallet, Download, Printer, RefreshCw, Search, Eye } from "lucide-react";
import { getMyPayroll, getMyPayrollSlip, exportMyPayrollPdf } from "@/features/ess/api/ess.service";
import type { GenericApiItem } from "@/features/ess/types/ess.types";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";

const MyPayrollPage = () => {
  const [items, setItems] = useState<GenericApiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Search & Filter
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"Semua" | "Paid" | "Pending" | "Draft">("Semua");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadPayroll = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await getMyPayroll();
      setItems(result.items);
    } catch (error) {
      console.error("Failed to load payroll:", error);
      setErrorMessage('Gagal memuat slip gaji');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayroll();
  }, []);

  const summaryStats = useMemo(() => {
    const paidCount = items.filter((item) => String(item.status ?? "").toLowerCase() === "paid").length;
    const totalNetSalary = items.reduce((sum, item) => sum + (Number(item.take_home_pay || item.net_salary) || 0), 0);
    const _uniquePeriods = new Set(items.map((item) => String(item.period ?? "")).filter(Boolean));
    const pendingCount = items.filter((item) => String(item.status ?? "").toLowerCase() === "pending" || String(item.status ?? "").toLowerCase() === "draft").length;

    return [
      { label: "Total Slip", subtitle: "Seluruh riwayat payroll", value: String(items.length), tone: "blue" as const },
      { label: "Sudah Dibayar", subtitle: "Slip yang telah cair", value: String(paidCount), tone: "green" as const },
      { label: "Pending", subtitle: "Menunggu pembayaran", value: String(pendingCount), tone: "orange" as const },
      { label: "Total Gaji Bersih", subtitle: "Akumulasi pendapatan", value: `Rp ${totalNetSalary.toLocaleString("id-ID")}`, tone: "red" as const },
    ];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const period = String(item.period || '').toLowerCase();
      const query = searchText.toLowerCase();
      const matchSearch = period.includes(query) || 
        (item.employee?.user && typeof item.employee.user === 'object' && 'name' in item.employee.user && item.employee.user.name.toLowerCase().includes(query));

      let statusMatch = true;
      if (activeTab === "Paid") statusMatch = String(item.status ?? "").toLowerCase() === "paid";
      else if (activeTab === "Pending") statusMatch = ["pending", "draft"].includes(String(item.status ?? "").toLowerCase());
      else if (activeTab === "Draft") statusMatch = String(item.status ?? "").toLowerCase() === "draft";

      return matchSearch && statusMatch;
    });
  }, [items, searchText, activeTab]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredItems.length / pageSize);

  const clearFilters = () => {
    setSearchText("");
    setActiveTab("Semua");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  const handleViewSlip = async (id: string) => {
    setDetailLoading(true);
    setIsModalOpen(true);
    try {
      // Use getMyPayrollSlip to match API docs: GET /api/my/payroll/{id}/slip
      const result = await getMyPayrollSlip(id);
      setSelectedSlip(result.payload);
    } catch (error) {
      console.error("Failed to load slip details:", error);
      setIsModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      const blob = await exportMyPayrollPdf(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Slip_Gaji_${selectedSlip?.period || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  };

  const formatCurrency = (val: any) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`;

  return (
    <div className="crud-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Wallet size={16} />
              <span>Layanan Mandiri</span>
            </div>
            <h1 className="hero-title">Riwayat Gaji Saya</h1>
            <p className="hero-subtitle">
              Lihat dan unduh slip gaji bulanan Anda dengan aman.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadPayroll()} disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryStats.map((card) => {
          const Icon = card.tone === "blue" ? BarChart3 : card.tone === "green" ? CheckCircle2 : card.tone === "orange" ? Receipt : Wallet;

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
            <Receipt size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Slip Gaji</h2>
            <p className="analytics-subtitle">Riwayat gaji dan pendapatan Anda</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          {/* Tabs */}
          <div className="elyra-tabs">
            {(["Semua", "Paid", "Pending", "Draft"] as const).map((tab) => (
              <button key={tab} className={`elyra-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari periode..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
            {(searchText || activeTab !== "Semua") && (
              <button className="btn-clear-filter" onClick={clearFilters}>
                Hapus Filter
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat data slip gaji..." />}
          {!loading && errorMessage && <ErrorState message="Koneksi Terputus" error={errorMessage} onRetry={loadPayroll} />}

          {!loading && !errorMessage && paginatedItems.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Pencarian Kosong"
                message="Kami tidak menemukan slip gaji yang sesuai dengan kriteria Anda."
                actionLabel="Bersihkan Filter"
                onAction={clearFilters}
              />
            </div>
          )}

          {!loading && !errorMessage && paginatedItems.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Periode</th>
                      <th>Gaji Pokok</th>
                      <th>Gaji Bersih</th>
                      <th>Status</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item) => (
                      <tr key={String(item.id)}>
                        <td>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{String(item.period || '-')}</span>
                        </td>
                        <td><span style={{ color: '#475569' }}>{formatCurrency(item.basic_salary)}</span></td>
                        <td>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>
                            {formatCurrency(item.take_home_pay || item.net_salary)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-soft badge-soft--${String(item.status).toLowerCase()}`}>
                            {String(item.status).toUpperCase()}
                          </span>
                        </td>
                        <td className="td-center">
                          {String(item.status).toLowerCase() === 'paid' ? (
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => handleViewSlip(String(item.id))}
                              title="Lihat Slip"
                            >
                              <Eye size={16} style={{ marginRight: '6px' }} />
                              Lihat Slip
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Menunggu Pembayaran</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{paginatedItems.length}</strong> dari <strong>{filteredItems.length}</strong> slip gaji
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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

      {/* Modal for Slip Details */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Digital Salary Slip"
        size="lg"
      >
        {detailLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="animate-spin" style={{ margin: '0 auto 1rem' }}><Receipt size={32} color="#2563eb" /></div>
            <p>Memuat rincian slip gaji...</p>
          </div>
        ) : selectedSlip && selectedSlip.summary && (
          <div className="digital-slip">
            <div className="digital-slip-header">
              <div className="digital-slip-brand">
                <div className="slip-logo">HR</div>
                <div>
                  <h3>Slip Gaji Digital</h3>
                  <p>Periode: {selectedSlip.period}</p>
                </div>
              </div>
              <div className="digital-slip-status">
                <span className={`status-badge-${String(selectedSlip.status || 'draft').toLowerCase()}`}>
                  {String(selectedSlip.status || 'DRAFT').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Employee Info */}
            {selectedSlip.employee && (
              <div className="slip-employee-info" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ margin: 0 }}><strong>{selectedSlip.employee.name}</strong></p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                  {selectedSlip.employee.employee_code} - {selectedSlip.employee.position} - {selectedSlip.employee.department}
                </p>
              </div>
            )}

            <div className="digital-slip-grid">
              <div className="slip-section">
                <h4>PENERIMAAN</h4>
                <div className="slip-row">
                  <span>Gaji Pokok</span>
                  <span>{formatCurrency(selectedSlip.summary.basic_salary)}</span>
                </div>
                {selectedSlip.summary.allowance > 0 && (
                  <div className="slip-row">
                    <span>Tunjangan</span>
                    <span>{formatCurrency(selectedSlip.summary.allowance)}</span>
                  </div>
                )}
                {selectedSlip.summary.bonus > 0 && (
                  <div className="slip-row">
                    <span>Bonus</span>
                    <span>{formatCurrency(selectedSlip.summary.bonus)}</span>
                  </div>
                )}
                <div className="slip-row slip-row--total">
                  <span>Total Pendapatan Kotor (Gross)</span>
                  <span>{formatCurrency(selectedSlip.summary.gross_pay)}</span>
                </div>
              </div>

              <div className="slip-section">
                <h4>POTONGAN</h4>
                <div className="slip-row">
                  <span>BPJS Kesehatan</span>
                  <span style={{ color: '#ef4444' }}>- {formatCurrency(selectedSlip.summary.bpjs_kesehatan)}</span>
                </div>
                <div className="slip-row">
                  <span>BPJS Ketenagakerjaan</span>
                  <span style={{ color: '#ef4444' }}>- {formatCurrency(selectedSlip.summary.bpjs_ketenagakerjaan)}</span>
                </div>
                <div className="slip-row">
                  <span>PPh21 (Pajak)</span>
                  <span style={{ color: '#ef4444' }}>- {formatCurrency(selectedSlip.summary.pph21)}</span>
                </div>
                <div className="slip-row slip-row--total">
                  <span>Total Potongan</span>
                  <span style={{ color: '#ef4444' }}>- {formatCurrency(selectedSlip.summary.total_deduction)}</span>
                </div>
              </div>
            </div>

            <div className="digital-slip-footer">
              <div className="thp-box">
                <span className="thp-label">TAKE HOME PAY (GAJI BERSIH)</span>
                <span className="thp-value">{formatCurrency(selectedSlip.summary.take_home_pay)}</span>
              </div>

              <div className="slip-actions">
                <Button variant="outline" size="md" onClick={() => window.print()}>
                  <Printer size={16} style={{ marginRight: '8px' }} /> Cetak
                </Button>
                <Button variant="primary" size="md" onClick={() => handleDownloadPdf(String(selectedSlip.id))}>
                  <Download size={16} style={{ marginRight: '8px' }} /> Download PDF
                </Button>
              </div>
            </div>

            <p className="slip-disclaimer">
              * Slip gaji ini dihasilkan secara otomatis oleh sistem HRIS dan merupakan dokumen sah perusahaan.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyPayrollPage;
