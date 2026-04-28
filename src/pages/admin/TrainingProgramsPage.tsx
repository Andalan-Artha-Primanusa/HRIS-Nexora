import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, GraduationCap, Calendar, Users, BookOpen, Search, Filter, Clock, Award, Edit, Trash2, BookTemplate, CheckCircle, TrendingUp } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { trainingService } from '@/features/training/api/training.service';
import type { TrainingProgram } from '@/features/training/types/training.types';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import './TrainingProgramsPage.css';

const formatDateTime = (input: string) => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
};

const TrainingProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter & Pagination State
  const [activeTab, setActiveTab] = useState<"Semua" | "Active" | "Draft" | "Completed" | "Cancelled">("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await trainingService.getPrograms();
      let programsArray: any[] = [];
      if (Array.isArray(data)) programsArray = data;
      else if (Array.isArray(data?.data)) programsArray = data.data;
      else if (Array.isArray(data?.data?.data)) programsArray = data.data.data;
      setPrograms(programsArray);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filter Logic
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const searchStr = searchQuery.toLowerCase();
      const textMatch = (p.title || p.nama || '')?.toLowerCase().includes(searchStr) ||
                        (p.category || '')?.toLowerCase().includes(searchStr);
      
      let statusMatch = true;
      if (activeTab === "Active") statusMatch = p.status === 'active';
      else if (activeTab === "Draft") statusMatch = p.status === 'draft';
      else if (activeTab === "Completed") statusMatch = p.status === 'completed';
      else if (activeTab === "Cancelled") statusMatch = p.status === 'cancelled';
      
      return textMatch && statusMatch;
    });
  }, [programs, searchQuery, activeTab]);

  // Sort by title
  const sortedPrograms = useMemo(() => {
    return [...filteredPrograms].sort((a, b) => {
      const valA = (a.title || '').toLowerCase();
      const valB = (b.title || '').toLowerCase();
      return valA < valB ? -1 : valA > valB ? 1 : 0;
    });
  }, [filteredPrograms]);

  // Paginate
  const paginatedPrograms = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedPrograms.slice(startIndex, startIndex + pageSize);
  }, [sortedPrograms, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedPrograms.length / pageSize);

  // Summary Cards
  const summaryCards = useMemo(() => [
    {
      label: "Total Program",
      subtitle: "Seluruh program pelatihan",
      value: String(programs.length),
      change: "Program Pelatihan",
      tone: "blue" as const,
      icon: GraduationCap,
    },
    {
      label: "Hasil Filter",
      subtitle: "Program sesuai pencarian",
      value: String(sortedPrograms.length),
      change: `${paginatedPrograms.length} data per halaman`,
      tone: "green" as const,
      icon: Search,
    },
    {
      label: "Aktif",
      subtitle: "Program yang sedang aktif",
      value: String(programs.filter(p => p.status === 'active').length),
      change: "Program Aktif",
      tone: "orange" as const,
      icon: CheckCircle,
    },
    {
      label: "Kategori",
      subtitle: "Kategori pelatihan",
      value: String(new Set(programs.map(p => p.category).filter(Boolean)).size),
      change: "Jenis pelatihan",
      tone: "purple" as const,
      icon: BookTemplate,
    },
  ], [programs, sortedPrograms.length, paginatedPrograms.length]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveTab("Semua");
    setCurrentPage(1);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await trainingService.updateTraining(id, { status: 'deleted' } as any);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="crud-page training-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <GraduationCap size={16} />
              <span>L & D</span>
            </div>
            <h1 className="hero-title">Program Pelatihan</h1>
            <p className="hero-subtitle">
              Kelola program pelatihan karyawan, sertifikasi, dan pengembangan keterampilan.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => navigate('/training/programs/create')}>
              <Plus size={16} />
              Tambah Program
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="training-summary-wrapper">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="training-summary-card">
              <div className="training-summary-header">
                <div>
                  <p className="training-summary-label">{card.label}</p>
                  <p className="training-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`training-summary-icon-wrapper training-icon-${card.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`training-summary-value training-value-${card.tone}`}>{card.value}</div>
              <p className="training-summary-trend">{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Program</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua program pelatihan</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          {/* Tabs */}
          <div className="elyra-tabs">
            {(["Semua", "Active", "Draft", "Completed", "Cancelled"] as const).map((tab) => (
              <button
                key={tab}
                className={`elyra-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari program..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="search-input-pill"
              />
            </div>
            <button
              className={`filter-btn-rounded ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-dropdown">
            <div className="filter-row">
              {(searchQuery || activeTab !== "Semua") && (
                <button className="btn-clear-filter" onClick={clearFilters}>
                  Hapus Filter
                </button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat program..." />}

          {!loading && paginatedPrograms.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Pencarian Kosong"
                message="Kami tidak menemukan program yang sesuai dengan kriteria Anda."
                actionLabel="Bersihkan Filter"
                onAction={clearFilters}
              />
            </div>
          )}

          {!loading && paginatedPrograms.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '400px' }}>Nama Program</th>
                      <th>Kategori</th>
                      <th>Mode</th>
                      <th>Provider</th>
                      <th>Tanggal Mulai</th>
                      <th className="th-center">Status</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPrograms.map((program) => (
                      <tr key={program.id}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {(program.title || 'P').charAt(0).toUpperCase()}
                            </div>
                            <div className="cell-stacked">
                              <span className="cell-name-text">{program.title || program.nama}</span>
                              <span className="cell-stacked__sub">{program.description || 'No description'}</span>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ color: '#475569', fontWeight: 600 }}>{program.category || "-"}</span></td>
                        <td><span className="badge-soft badge-soft--blue">{program.mode || "-"}</span></td>
                        <td><span style={{ color: '#64748b', fontWeight: 500 }}>{program.provider || "-"}</span></td>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>{program.start_date ? formatDateTime(program.start_date) : "-"}</span>
                            <span className="cell-stacked__sub">Mulai</span>
                          </div>
                        </td>
                        <td className="td-center">
                          <span className={`badge-soft badge-soft--${
                            program.status === "active" ? "green" : 
                            program.status === "draft" ? "yellow" : 
                            program.status === "completed" ? "blue" : "red"
                          }`}>
                            {program.status || "draft"}
                          </span>
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => navigate(`/training/programs/edit/${program.id}`)}
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="action-btn action-btn-delete"
                              onClick={(e) => handleDelete(program.id, e)}
                              title="Hapus"
                            >
                              <Trash2 size={16} />
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
                  Menampilkan <strong>{paginatedPrograms.length}</strong> dari <strong>{sortedPrograms.length}</strong> program
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

export default TrainingProgramsPage;
