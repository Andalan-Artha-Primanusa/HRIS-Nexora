import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, RefreshCw, Edit, Trash2, CalendarDays, Search, ShieldCheck } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { workforceService } from '@/features/workforce/api/workforce.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';

const HolidayCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"Semua" | "National" | "Company">("Semua");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

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

  const summaryStats = useMemo(() => {
    const total = holidays.length;
    const national = holidays.filter((h: any) => h.type === 'national').length;
    const company = holidays.filter((h: any) => h.type === 'company').length;
    const upcoming = holidays.filter((h: any) => new Date(h.date) > new Date()).length;

    return [
      { label: "Total Libur", subtitle: "Seluruh hari libur", value: total, tone: "blue" as const },
      { label: "Nasional", subtitle: "Hari libur nasional", value: national, tone: "red" as const },
      { label: "Perusahaan", subtitle: "Hari libur perusahaan", value: company, tone: "orange" as const },
      { label: "Akan Datang", subtitle: "Hari libur mendatang", value: upcoming, tone: "green" as const },
    ];
  }, [holidays]);

  const filteredHolidays = useMemo(() => {
    return holidays.filter((holiday: any) => {
      const name = String(holiday?.name || '').toLowerCase();
      const description = String(holiday?.description || '').toLowerCase();
      const query = searchText.toLowerCase();
      const matchSearch = name.includes(query) || description.includes(query);

      let typeMatch = true;
      if (activeTab === "National") typeMatch = holiday.type === 'national';
      else if (activeTab === "Company") typeMatch = holiday.type === 'company';

      return matchSearch && typeMatch;
    });
  }, [holidays, searchText, activeTab]);

  const paginatedHolidays = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredHolidays.slice(startIndex, startIndex + pageSize);
  }, [filteredHolidays, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredHolidays.length / pageSize);

  const clearFilters = () => {
    setSearchText("");
    setActiveTab("Semua");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus hari libur ini?')) {
      try {
        await workforceService.deleteHoliday(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete holiday:', error);
      }
    }
  };

  return (
    <div className="crud-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <CalendarDays size={16} />
              <span>Workforce</span>
            </div>
            <h1 className="hero-title">Kalender Libur</h1>
            <p className="hero-subtitle">
              Kelola hari libur nasional dan kebijakan libur perusahaan.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => navigate('/workforce/holidays/create')}>
              <Plus size={16} />
              Tambah Libur
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryStats.map((card) => {
          const Icon = card.tone === "blue" ? Calendar : card.tone === "red" ? CalendarDays : card.tone === "orange" ? Calendar : Calendar;

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
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Hari Libur</h2>
            <p className="analytics-subtitle">Kelola hari libur nasional dan perusahaan</p>
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
                placeholder="Cari nama atau deskripsi libur..."
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
            {(["Semua", "National", "Company"] as const).map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab !== "Semua" && (
                  <span className="tab-count">
                    {tab === "National"
                      ? holidays.filter((h: any) => h.type === 'national').length
                      : holidays.filter((h: any) => h.type === 'company').length}
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
            Daftar Hari Libur
            <span className="data-table-count">{filteredHolidays.length} ditemukan</span>
          </h3>
        </div>

        {loading ? (
          <LoadingState message="Memuat data hari libur..." />
        ) : filteredHolidays.length === 0 ? (
          <EmptyState
            icon={<Calendar size={48} />}
            title="Tidak ada hari libur ditemukan"
            message={searchText || activeTab !== "Semua" ? "Coba ubah kata kunci atau filter" : "Belum ada data hari libur"}
          />
        ) : (
          <>
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
                  {paginatedHolidays.map((h) => (
                    <tr key={h.id}>
                      <td>
                        <div className="cell-stacked">
                          <span className="cell-name-text">{h.name}</span>
                          <span className="cell-email">{h.description || '-'}</span>
                        </div>
                      </td>
                      <td>{h.date ? new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</td>
                      <td>
                        <span className={`status-badge ${h.type === 'national' ? 'status-active' : 'status-pending'}`}>
                          {h.type === 'national' ? 'Nasional' : 'Perusahaan'}
                        </span>
                      </td>
                      <td>{h.is_recurring ? 'YA' : 'TIDAK'}</td>
                      <td><span className="status-badge status-active">ACTIVE</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/workforce/holidays/edit/${h.id}`)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" danger onClick={() => handleDelete(h.id)}>
                            <Trash2 size={16} />
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
                  Menampilkan {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredHolidays.length)} dari {filteredHolidays.length}
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

export default HolidayCalendarPage;
