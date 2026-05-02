import React, { useState, useEffect, useMemo } from 'react';
import { Plus, RefreshCw, Wallet, Search, Eye, Pencil, Trash2, Send, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import {
  getMyReimbursements,
  createMyReimbursement,
  updateReimbursement,
  deleteReimbursement,
  submitMyReimbursement
} from '../../features/reimbursement/api/reimbursement.service';
import type { ReimbursementItem } from '../../features/reimbursement/types/reimbursement.types';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';

const getStatusClass = (status?: string) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "approved" || normalized === "paid") return "status-badge status-badge--approved";
  if (normalized === "submitted") return "status-badge status-badge--pending";
  if (normalized === "rejected") return "status-badge status-badge--draft";
  return "status-badge status-badge--draft";
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
};

const MyReimbursementsPage: React.FC = () => {
  const [items, setItems] = useState<ReimbursementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [_isModalOpen, ____setIsModalOpen] = useState(false);
  const [_isDetailOpen, ____setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReimbursementItem | null>(null);

  // Search & Filter
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"Semua" | "Draft" | "Submitted" | "Approved" | "Rejected" | "Paid">("Semua");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    try {
      const reimbData = await getMyReimbursements();
      setItems(reimbData.items);
    } catch (error) {
      console.error('Failed to fetch reimbursements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const title = String(item?.title || '').toLowerCase();
      const desc = String(item?.description || '').toLowerCase();
      const query = searchText.toLowerCase();
      const matchSearch = title.includes(query) || desc.includes(query);

      let statusMatch = true;
      if (activeTab === "Draft") statusMatch = item.status === "draft";
      else if (activeTab === "Submitted") statusMatch = item.status === "submitted";
      else if (activeTab === "Approved") statusMatch = item.status === "approved";
      else if (activeTab === "Rejected") statusMatch = item.status === "rejected";
      else if (activeTab === "Paid") statusMatch = item.status === "paid";

      return matchSearch && statusMatch;
    });
  }, [items, searchText, activeTab]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredItems.length / pageSize);

  const summaryStats = useMemo(() => {
    const total = items.length;
    const approved = items.filter(i => i.status === 'approved' || i.status === 'paid').length;
    const pending = items.filter(i => i.status === 'submitted').length;
    const totalAmount = items.reduce((acc, i) => acc + (i.amount || 0), 0);

    return [
      { label: "Total Klaim", subtitle: "Seluruh klaim", value: total, tone: "blue" as const },
      { label: "Disetujui", subtitle: "Klaim disetujui", value: approved, tone: "green" as const },
      { label: "Menunggu", subtitle: "Klaim diajukan", value: pending, tone: "orange" as const },
      { label: "Total Nilai", subtitle: "Nilai seluruh klaim", value: formatCurrency(totalAmount), tone: "purple" as const },
    ];
  }, [items]);

  const handleOpenCreate = () => {
    setSelectedItem(null);
    ____setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ReimbursementItem) => {
    setSelectedItem(item);
    ____setIsModalOpen(true);
  };

  const handleOpenDetail = (item: ReimbursementItem) => {
    setSelectedItem(item);
    ____setIsDetailOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleSave = async (data: any) => {
    try {
      if (selectedItem) {
        await updateReimbursement(String(selectedItem.id), data);
      } else {
        await createMyReimbursement(data);
      }
      ____setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save reimbursement:', error);
    }
  };

  const handleDelete = async (item: ReimbursementItem) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus klaim ini?')) {
      try {
        await deleteReimbursement(String(item.id));
        fetchData();
      } catch (error) {
        console.error('Failed to delete reimbursement:', error);
      }
    }
  };

  const handleSubmit = async (item: ReimbursementItem) => {
    if (window.confirm('Ajukan klaim ini untuk persetujuan?')) {
      try {
        await submitMyReimbursement(String(item.id));
        fetchData();
      } catch (error) {
        console.error('Failed to submit reimbursement:', error);
      }
    }
  };

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
              <Wallet size={16} />
              <span>Layanan Mandiri</span>
            </div>
            <h1 className="hero-title">Imbalan Saya</h1>
            <p className="hero-subtitle">
              Lacak dan kelola klaim pengeluaran Anda.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={handleOpenCreate}>
              <Plus size={16} />
              Klaim Baru
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryStats.map((card) => {
          const Icon = card.tone === "blue" ? Wallet : card.tone === "green" ? CheckCircle2 : card.tone === "orange" ? Clock : TrendingUp;

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
            <Wallet size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Klaim</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua klaim pengeluaran Anda</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          {/* Tabs */}
          <div className="elyra-tabs">
            {(["Semua", "Draft", "Submitted", "Approved", "Rejected", "Paid"] as const).map((tab) => (
              <button
                key={tab}
                className={`elyra-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
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
                placeholder="Cari klaim..."
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
          {loading && <LoadingState message="Memuat klaim..." />}

          {!loading && paginatedItems.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Belum Ada Klaim"
                message={searchText || activeTab !== "Semua"
                  ? "Tidak ada klaim yang sesuai dengan kriteria Anda."
                  : "Anda belum memiliki klaim pengeluaran. Buat klaim pertama untuk memulai."}
                actionLabel="Buat Klaim Baru"
                onAction={handleOpenCreate}
              />
            </div>
          )}

          {!loading && paginatedItems.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '300px' }}>Judul Klaim</th>
                      <th>Tanggal</th>
                      <th>Nilai</th>
                      <th className="th-center">Status</th>
                      <th className="th-center" style={{ width: '140px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {item.title ? item.title.charAt(0).toUpperCase() : "K"}
                            </div>
                            <div className="cell-stacked">
                              <span className="cell-name-text">{item.title}</span>
                              <span className="cell-stacked__sub">{item.description ? item.description.substring(0, 30) + "..." : "Tidak ada deskripsi"}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>{formatDate(item.expense_date)}</span>
                            <span className="cell-stacked__sub">Tanggal Pengeluaran</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: '#475569', fontWeight: 600 }}>{formatCurrency(item.amount)}</span>
                        </td>
                        <td className="td-center">
                          <span className={getStatusClass(item.status)}>
                            {item.status === "approved" ? "Approved" :
                              item.status === "submitted" ? "Submitted" :
                                item.status === "rejected" ? "Rejected" :
                                  item.status === "paid" ? "Paid" : "Draft"}
                          </span>
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => handleOpenDetail(item)}
                              title="Lihat Detail"
                            >
                              <Eye size={16} />
                            </button>
                            {item.status === 'draft' && (
                              <>
                                <button
                                  className="action-btn action-btn-edit"
                                  onClick={() => handleOpenEdit(item)}
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  className="action-btn"
                                  style={{ color: '#8b5cf6' }}
                                  onClick={() => handleSubmit(item)}
                                  title="Ajukan"
                                >
                                  <Send size={16} />
                                </button>
                              </>
                            )}
                            {item.status === 'draft' && (
                              <button
                                className="action-btn action-btn-delete"
                                onClick={() => handleDelete(item)}
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
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
                  Menampilkan <strong>{paginatedItems.length}</strong> dari <strong>{filteredItems.length}</strong> klaim
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

export default MyReimbursementsPage;
