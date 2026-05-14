import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Search, RefreshCw, Calendar, BookTemplate, Users, CheckCircle2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { getAllEmployees } from '@/features/employee/api/employee.service';
import { legalService } from '@/features/legal/api/legal.service';
import { showToast } from '@/shared/ui/toast';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import './EmploymentLettersPage.css';

const EmploymentLettersPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"Semua" | "Has Letter" | "No Letter">("Semua");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const data = await getAllEmployees();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const summaryStats = useMemo(() => {
    const total = employees.length;
    const withLetters = employees.filter(emp => emp.has_letter || emp.letter_count > 0).length;
    const withoutLetters = total - withLetters;

    return [
      { label: "Total Karyawan", subtitle: "Seluruh karyawan", value: total, tone: "blue" as const },
      { label: "Memiliki Surat", subtitle: "Sudah ada surat", value: withLetters, tone: "green" as const },
      { label: "Belum Ada Surat", subtitle: "Perlu dibuatkan", value: withoutLetters, tone: "orange" as const },
    ];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fullName = String(emp?.full_name || '').toLowerCase();
      const employeeId = String(emp?.employee_id || emp?.employee_code || '').toLowerCase();
      const department = String(emp?.department || '').toLowerCase();
      const query = searchText.toLowerCase();
      const matchSearch = fullName.includes(query) || employeeId.includes(query) || department.includes(query);

      let letterMatch = true;
      if (activeTab === "Has Letter") letterMatch = emp.has_letter || emp.letter_count > 0;
      else if (activeTab === "No Letter") letterMatch = !emp.has_letter && !emp.letter_count;

      return matchSearch && letterMatch;
    });
  }, [employees, searchText, activeTab]);

  const paginatedEmployees = filteredEmployees;

  const [totalPages, setTotalPages] = useState(1);

  const clearFilters = () => {
    setSearchText("");
    setActiveTab("Semua");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  const handleGenerate = async (id: string | number, type: 'experience' | 'employment') => {
    try {
      if (type === 'experience') {
        await legalService.generateExperienceLetter(id);
      } else {
        await legalService.generateEmploymentLetter(id);
      }
      showToast('Surat berhasil dibuat!', 'success');
    } catch (err) {
      showToast('Gagal membuat surat', 'error');
    }
  };

  return (
    <div className="crud-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <BookTemplate size={16} />
              <span>Legal & Korespondensi</span>
            </div>
            <h1 className="hero-title">Surat Pekerjaan</h1>
            <p className="hero-subtitle">
              Hasilkan surat formal untuk karyawan (Pengalaman, Kerja, dan Penugasan).
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => window.location.reload()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryStats.map((card) => {
          const Icon = card.tone === "blue" ? Users : card.tone === "green" ? CheckCircle2 : FileText;

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
            <h2 className="analytics-title">Daftar Karyawan</h2>
            <p className="analytics-subtitle">Kelola surat pekerjaan karyawan</p>
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
                placeholder="Cari karyawan berdasarkan nama, ID, atau departemen..."
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
            {(["Semua", "Has Letter", "No Letter"] as const).map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "Has Letter" ? "Memiliki Surat" : tab === "No Letter" ? "Belum Ada Surat" : tab}
                {tab !== "Semua" && (
                  <span className="tab-count">
                    {tab === "Has Letter"
                      ? employees.filter(emp => emp.has_letter || emp.letter_count > 0).length
                      : employees.filter(emp => !emp.has_letter && !emp.letter_count).length}
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
            Daftar Karyawan
            <span className="data-table-count">{filteredEmployees.length} ditemukan</span>
          </h3>
        </div>

        {loading ? (
          <LoadingState message="Memuat data karyawan..." />
        ) : filteredEmployees.length === 0 ? (
          <EmptyState
            icon={<Users size={48} />}
            title="Tidak ada karyawan ditemukan"
            message={searchText || activeTab !== "Semua" ? "Coba ubah kata kunci atau filter" : "Belum ada data karyawan"}
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Karyawan</th>
                    <th>Departemen</th>
                    <th>Posisi</th>
                    <th>Tanggal Bergabung</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                          }}>
                            {(emp.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                              {emp.full_name || emp.user?.name || emp.name || 'Karyawan Tidak Diketahui'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{emp.employee_id || emp.employee_code || '#' + emp.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          background: '#f1f5f9',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: '#475569',
                          fontWeight: 500
                        }}>
                          {emp.department || '-'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem', color: '#334155' }}>{emp.designation || emp.position || '-'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#64748b' }}>
                          <Calendar size={14} />
                          {emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }) : '-'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn-action-generate"
                            onClick={() => handleGenerate(emp.id, 'employment')}
                            title="Buat Surat Keterangan Kerja"
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              background: 'white',
                              color: '#2563eb',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <FileText size={14} />
                            Suket Kerja
                          </button>
                          <button
                            className="btn-action-generate"
                            onClick={() => handleGenerate(emp.id, 'experience')}
                            title="Buat Surat Pengalaman Kerja (Paklaring)"
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              background: 'white',
                              color: '#059669',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <FileText size={14} />
                            Paklaring
                          </button>
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
                  Menampilkan <strong>{paginatedEmployees.length}</strong> dari <strong>{filteredEmployees.length}</strong> data
                </div>
                <div className="pagination-controls">
                  <button className="pagination-btn" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} className={`pagination-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                  ))}
                  <button className="pagination-btn" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default EmploymentLettersPage;
