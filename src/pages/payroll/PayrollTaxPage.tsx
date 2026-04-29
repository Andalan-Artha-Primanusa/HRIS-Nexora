import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Search, RefreshCw, DollarSign, Users, Eye } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { payrollService, toSafeArray } from '@/features/payroll/api/payroll.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num || 0);
};

const PayrollTaxPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"Semua" | "Pending" | "Approved">("Semua");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await payrollService.getPayrollList();
      setData(toSafeArray(response));
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data pajak & BPJS');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const empName = (item.employee?.user?.name || '').toLowerCase();
      const empCode = (item.employee?.employee_code || '').toLowerCase();
      const query = searchText.toLowerCase();
      const matchSearch = empName.includes(query) || empCode.includes(query);

      let statusMatch = true;
      if (activeTab === "Pending") statusMatch = item.status === 'pending';
      else if (activeTab === "Approved") statusMatch = item.status === 'approved';

      return matchSearch && statusMatch;
    });
  }, [data, searchText, activeTab]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const summaryStats = useMemo(() => {
    const totals = data.reduce((acc, curr) => ({
      pph21: acc.pph21 + (parseFloat(curr.pph21) || 0),
      bpjs: acc.bpjs + (parseFloat(curr.bpjs_kesehatan) || 0) + (parseFloat(curr.bpjs_ketenagakerjaan) || 0),
      records: acc.records + 1
    }), { pph21: 0, bpjs: 0, records: 0 });

    return [
      { label: "Total PPh21", subtitle: "Akumulasi", value: formatCurrency(totals.pph21), tone: "blue" as const },
      { label: "Total BPJS", subtitle: "Kesehatan & TK", value: formatCurrency(totals.bpjs), tone: "orange" as const },
      { label: "Total Records", subtitle: "Jumlah entri", value: totals.records, tone: "green" as const },
    ];
  }, [data]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _clearFilters = () => {
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
              <ShieldCheck size={16} />
              <span>Pusat Payroll</span>
            </div>
            <h1 className="hero-title">Laporan Pajak & BPJS</h1>
            <p className="hero-subtitle">
              Ringkasan potongan PPh21 dan iuran BPJS karyawan per periode penggajian.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadData()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryStats.map((card) => {
          const Icon = card.tone === "blue" ? DollarSign : card.tone === "green" ? Users : ShieldCheck;

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
            <h2 className="analytics-title">Data Kontribusi Pajak & BPJS</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua data pajak dan BPJS</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          {/* Tabs */}
          <div className="elyra-tabs">
            {["Semua", "Pending", "Approved"].map((tab) => (
              <button
                key={tab}
                className={`elyra-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab as "Semua" | "Pending" | "Approved")}
              >
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
                placeholder="Cari karyawan atau kode..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
      )}

      {/* Table Section */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat data pajak..." />}

          {!loading && paginatedData.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Belum Ada Data"
                message={searchText || activeTab !== "Semua"
                  ? "Tidak ada data yang sesuai dengan kriteria Anda."
                  : "Belum ada data pajak & BPJS yang dibuat."}
                actionLabel="Segarkan"
                onAction={() => void loadData()}
              />
            </div>
          )}

          {!loading && paginatedData.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '250px' }}>Karyawan</th>
                      <th>Periode</th>
                      <th>Gaji Pokok</th>
                      <th>PPh21</th>
                      <th>BPJS Kesehatan</th>
                      <th>BPJS TK</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {(item.employee?.user?.name || 'U')[0].toUpperCase()}
                            </div>
                            <div className="cell-stacked">
                              <span className="cell-name-text">{item.employee?.user?.name || 'Unknown'}</span>
                              <span className="cell-stacked__sub">{item.employee?.employee_code || item.employee_id}</span>
                            </div>
                          </div>
                        </td>
                        <td><Badge variant="default">{item.period}</Badge></td>
                        <td style={{ fontWeight: 500 }}>{formatCurrency(item.basic_salary)}</td>
                        <td style={{ color: '#e11d48', fontWeight: 600 }}>{formatCurrency(item.pph21)}</td>
                        <td>{formatCurrency(item.bpjs_kesehatan)}</td>
                        <td>{formatCurrency(item.bpjs_ketenagakerjaan)}</td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            <button
                              className="action-btn action-btn-edit"
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
                  Menampilkan <strong>{paginatedData.length}</strong> dari <strong>{filteredData.length}</strong> data
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

export default PayrollTaxPage;
