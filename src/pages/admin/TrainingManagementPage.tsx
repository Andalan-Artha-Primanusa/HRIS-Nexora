import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, GraduationCap, Calendar, Users, BookOpen, Search, Filter, Clock, Award, Edit, Trash2, BookTemplate, CheckCircle, TrendingUp, UserPlus, X, Loader2, XCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Modal } from '@/shared/ui/Modal';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { trainingService } from '@/features/training/api/training.service';
import { employeeService } from '@/features/employee/api/employee.service';
import type { TrainingProgram } from '@/features/training/types/training.types';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/leave/LeaveShared.css';
import './TrainingProgramsPage.css';

const TABS = ['Program Pelatihan', 'Pendaftaran Pelatihan'] as const;
type Tab = (typeof TABS)[number];

const formatDate = (input: string) => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
};

const ProgramsTab: React.FC = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Semua' | 'Active' | 'Draft' | 'Completed' | 'Cancelled'>('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [selectedProgramName, setSelectedProgramName] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await trainingService.getPrograms();
      let arr: any[] = [];
      if (Array.isArray(data)) arr = data;
      else if (Array.isArray(data?.data)) arr = data.data;
      else if (Array.isArray(data?.data?.data)) arr = data.data.data;
      setPrograms(arr);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => programs.filter(p => {
    const q = searchQuery.toLowerCase();
    const textMatch = ((p as any).title || p.nama || '')?.toLowerCase().includes(q) || (p.category || '')?.toLowerCase().includes(q);
    let statusMatch = true;
    if (activeTab === 'Active') statusMatch = p.status === 'active';
    else if (activeTab === 'Draft') statusMatch = p.status === 'draft';
    else if (activeTab === 'Completed') statusMatch = p.status === 'completed';
    else if (activeTab === 'Cancelled') statusMatch = p.status === 'cancelled';
    return textMatch && statusMatch;
  }), [programs, searchQuery, activeTab]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => ((a as any).title || '').localeCompare((b as any).title || '')), [filtered]);
  const paginated = useMemo(() => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize), [sorted, currentPage, pageSize]);
  const totalPages = Math.ceil(sorted.length / pageSize);

  const summaryCards = useMemo(() => [
    { label: 'Total Program', subtitle: 'Seluruh program pelatihan', value: String(programs.length), change: 'Program Pelatihan', tone: 'blue' as const, icon: GraduationCap },
    { label: 'Hasil Filter', subtitle: 'Program sesuai pencarian', value: String(sorted.length), change: `${paginated.length} data per halaman`, tone: 'green' as const, icon: Search },
    { label: 'Aktif', subtitle: 'Program yang sedang aktif', value: String(programs.filter(p => p.status === 'active').length), change: 'Program Aktif', tone: 'orange' as const, icon: CheckCircle },
    { label: 'Kategori', subtitle: 'Kategori pelatihan', value: String(new Set(programs.map(p => p.category).filter(Boolean)).size), change: 'Jenis pelatihan', tone: 'purple' as const, icon: BookTemplate },
  ], [programs, sorted.length, paginated.length]);

  const clearFilters = () => { setSearchQuery(''); setActiveTab('Semua'); setCurrentPage(1); };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus program ini?')) return;
    try { await trainingService.deleteProgram(id); fetchData(); } catch (err) { console.error(err); }
  };

  const openEnrollModal = (programId: number, programName: string) => {
    setSelectedProgramId(programId); setSelectedProgramName(programName);
    setEnrollModalOpen(true); setSelectedEmployeeId(null); setEmployeeSearch('');
  };
  const closeEnrollModal = () => { setEnrollModalOpen(false); setSelectedProgramId(null); setSelectedProgramName(''); setSelectedEmployeeId(null); setEmployeeSearch(''); };
  const loadEmployees = async () => { try { setEmployees(await employeeService.getEmployees()); } catch (err) { console.error(err); } };

  const handleEnroll = async () => {
    if (!selectedProgramId || !selectedEmployeeId) return;
    setEnrolling(true);
    try {
      await trainingService.enrollEmployees(selectedProgramId, [selectedEmployeeId]);
      closeEnrollModal(); fetchData();
    } catch (err: any) {
      console.error(err); alert(err.response?.data?.message || 'Gagal mendaftarkan karyawan');
    } finally { setEnrolling(false); }
  };

  const filteredEmployees = useMemo(() => {
    if (!employeeSearch) return employees;
    const q = employeeSearch.toLowerCase();
    return employees.filter((emp: any) => (emp.user?.name || emp.name || '').toLowerCase().includes(q) || (emp.employee_code || '').toLowerCase().includes(q));
  }, [employees, employeeSearch]);

  return (
    <>
      <div className="training-summary-wrapper">
        {summaryCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="training-summary-card">
              <div className="training-summary-header">
                <div><p className="training-summary-label">{card.label}</p><p className="training-summary-subtitle">{card.subtitle}</p></div>
                <div className={`training-summary-icon-wrapper training-icon-${card.tone}`}><Icon size={28} /></div>
              </div>
              <div className={`training-summary-value training-value-${card.tone}`}>{card.value}</div>
              <p className="training-summary-trend">{card.change}</p>
            </div>
          );
        })}
      </div>

      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon"><BookOpen size={24} /></div>
          <div><h2 className="analytics-title">Daftar Program</h2><p className="analytics-subtitle">Kelola dan lihat semua program pelatihan</p></div>
        </div>
      </Card>

      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="elyra-tabs">
            {(['Semua', 'Active', 'Draft', 'Completed', 'Cancelled'] as const).map(tab => (
              <button key={tab} className={`elyra-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}>{tab}</button>
            ))}
          </div>
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input type="text" placeholder="Cari program..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="search-input-pill" />
            </div>
            <button className={`filter-btn-rounded ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}><Filter size={18} /><span>Filter</span></button>
            <button className="btn-primary" onClick={() => navigate('/training/programs/create')}><Plus size={16} /> Tambah Program</button>
          </div>
        </div>
        {showFilters && <div className="filter-dropdown"><div className="filter-row">{(searchQuery || activeTab !== 'Semua') && <button className="btn-clear-filter" onClick={clearFilters}>Hapus Filter</button>}</div></div>}
      </Card>

      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat program..." />}
          {!loading && paginated.length === 0 && (
            <div style={{ padding: '5rem 0' }}><EmptyState title="Pencarian Kosong" message="Tidak ada program yang sesuai." actionLabel="Bersihkan Filter" onAction={clearFilters} /></div>
          )}
          {!loading && paginated.length > 0 && (
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
                    {paginated.map(program => (
                      <tr key={program.id}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">{((program as any).title || 'P').charAt(0).toUpperCase()}</div>
                            <div className="cell-stacked">
                              <span className="cell-name-text">{program.title || program.nama}</span>
                              <span className="cell-stacked__sub">{program.description || 'No description'}</span>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ color: '#475569', fontWeight: 600 }}>{program.category || '-'}</span></td>
                        <td><span className="badge-soft badge-soft--blue">{program.mode || '-'}</span></td>
                        <td><span style={{ color: '#64748b', fontWeight: 500 }}>{program.provider || '-'}</span></td>
                        <td><span style={{ fontSize: '0.85rem' }}>{program.start_date ? formatDate(program.start_date) : '-'}</span></td>
                        <td className="td-center">
                          <span className={`badge-soft badge-soft--${program.status === 'active' ? 'green' : program.status === 'draft' ? 'yellow' : program.status === 'completed' ? 'blue' : 'red'}`}>
                            {program.status || 'draft'}
                          </span>
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            <button className="action-btn" style={{ color: '#6366f1', background: '#eef2ff' }} onClick={() => openEnrollModal(typeof program.id === 'string' ? parseInt(program.id, 10) : program.id, program.title || program.nama || '')} title="Daftarkan Karyawan">
                              <UserPlus size={16} />
                            </button>
                            <button className="action-btn action-btn-edit" onClick={() => navigate(`/training/programs/edit/${program.id}`)} title="Edit"><Edit size={16} /></button>
                            <button className="action-btn action-btn-delete" onClick={() => handleDelete(typeof program.id === 'string' ? parseInt(program.id, 10) : program.id)} title="Hapus"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-pagination">
                <div className="pagination-info">Menampilkan <strong>{paginated.length}</strong> dari <strong>{sorted.length}</strong> program</div>
                <div className="pagination-controls">
                  <button className="pagination-btn" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} className={`pagination-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                  ))}
                  <button className="pagination-btn" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>›</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal isOpen={enrollModalOpen} onClose={closeEnrollModal} title={`Daftarkan Karyawan — ${selectedProgramName}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Cari karyawan..." value={employeeSearch} onChange={e => setEmployeeSearch(e.target.value)} onFocus={async () => { if (employees.length === 0) await loadEmployees(); }} className="form-control" style={{ paddingLeft: '36px' }} />
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredEmployees.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>Tidak ada karyawan ditemukan</p>
            ) : (
              filteredEmployees.map((emp: any) => (
                <button key={emp.id} type="button" onClick={() => setSelectedEmployeeId(emp.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', border: selectedEmployeeId === emp.id ? '2px solid #6366f1' : '1px solid #e2e8f0', background: selectedEmployeeId === emp.id ? '#eef2ff' : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: selectedEmployeeId === emp.id ? '#6366f1' : '#f1f5f9', color: selectedEmployeeId === emp.id ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                    {(emp.user?.name || emp.name || 'E').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{emp.user?.name || emp.name || 'Employee'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{emp.employee_code || '-'}</div>
                  </div>
                  {selectedEmployeeId === emp.id && <CheckCircle size={18} color="#6366f1" />}
                </button>
              ))
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-primary" style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', fontWeight: 600 }} onClick={handleEnroll} disabled={!selectedEmployeeId || enrolling}>
              {enrolling ? <><Loader2 size={16} className="animate-spin" /> Mendaftar...</> : <><UserPlus size={16} /> Daftarkan</>}
            </button>
            <button type="button" className="btn-outline" style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', fontWeight: 600 }} onClick={closeEnrollModal} disabled={enrolling}>
              <X size={16} /> Batal
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const EnrollmentsTab: React.FC = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'Semua' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'>('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completingEnrollmentId, setCompletingEnrollmentId] = useState<number | null>(null);
  const [completingEnrollmentName, setCompletingEnrollmentName] = useState('');
  const [completing, setCompleting] = useState(false);
  const [completeData, setCompleteData] = useState({ score: '', notes: '', certificate_path: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await trainingService.getEnrollments();
      setEnrollments(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id: number) => {
    if (!window.confirm('Approve this training enrollment?')) return;
    try { setLoading(true); await trainingService.approveEnrollment(id); fetchData(); } catch (error) { console.error(error); alert('Failed to approve enrollment'); setLoading(false); }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('Reject this training enrollment?')) return;
    try { setLoading(true); await trainingService.rejectEnrollment(id); fetchData(); } catch (error) { console.error(error); alert('Failed to reject enrollment'); setLoading(false); }
  };

  const openCompleteModal = (enrollment: any) => {
    setCompletingEnrollmentId(enrollment.id); setCompletingEnrollmentName(enrollment.program?.title || 'Training');
    setCompleteData({ score: '', notes: '', certificate_path: '' }); setCompleteModalOpen(true);
  };
  const closeCompleteModal = () => { setCompleteModalOpen(false); setCompletingEnrollmentId(null); setCompletingEnrollmentName(''); setCompleteData({ score: '', notes: '', certificate_path: '' }); };

  const handleComplete = async () => {
    if (!completingEnrollmentId) return;
    setCompleting(true);
    try {
      const payload: any = {};
      if (completeData.score) payload.score = Number(completeData.score);
      if (completeData.notes) payload.notes = completeData.notes;
      if (completeData.certificate_path) payload.certificate_path = completeData.certificate_path;
      await trainingService.completeTraining(completingEnrollmentId, payload);
      closeCompleteModal(); fetchData();
    } catch (err: any) {
      console.error(err); alert(err.response?.data?.message || 'Gagal menandai pelatihan selesai');
    } finally { setCompleting(false); }
  };

  const filtered = useMemo(() => enrollments.filter((e: any) => {
    const q = searchText.toLowerCase();
    const matchSearch = !q || (e.program?.title || e.training_title || '').toLowerCase().includes(q) || (e.employee?.user?.name || e.employee_name || '').toLowerCase().includes(q);
    let statusMatch = true;
    if (activeTab === 'Pending') statusMatch = e.status === 'pending';
    else if (activeTab === 'In Progress') statusMatch = e.status === 'in_progress' || e.status === 'ongoing';
    else if (activeTab === 'Completed') statusMatch = e.status === 'completed';
    else if (activeTab === 'Cancelled') statusMatch = e.status === 'cancelled' || e.status === 'dropped';
    return matchSearch && statusMatch;
  }), [enrollments, searchText, activeTab]);

  const paginated = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filtered, currentPage, pageSize]);
  const totalPages = Math.ceil(filtered.length / pageSize);

  useEffect(() => { setCurrentPage(1); }, [searchText, activeTab]);

  const summaryStats = useMemo(() => {
    const completed = enrollments.filter(e => e.status === 'completed').length;
    const inProgress = enrollments.filter(e => e.status === 'in_progress' || e.status === 'ongoing').length;
    return [
      { label: 'Total Pendaftaran', subtitle: 'Seluruh pendaftaran', value: String(enrollments.length), change: 'Data pendaftaran aktif', tone: 'blue' as const, icon: Users },
      { label: 'Hasil Filter', subtitle: 'Pendaftaran sesuai pencarian', value: String(filtered.length), change: `${paginated.length} data per halaman`, tone: 'green' as const, icon: Search },
      { label: 'Sedang Berlangsung', subtitle: 'Pelatihan aktif', value: String(inProgress), change: 'Dalam proses', tone: 'orange' as const, icon: Clock },
      { label: 'Selesai', subtitle: 'Pelatihan selesai', value: String(completed), change: 'Status final selesai', tone: 'green' as const, icon: CheckCircle },
    ];
  }, [enrollments, filtered.length, paginated.length]);

  const clearFilters = () => { setSearchText(''); setActiveTab('Semua'); setCurrentPage(1); };

  const getStatusBadge = (status: string) => {
    const m: Record<string, { label: string; tone: string }> = { 'completed': { label: 'Completed', tone: 'green' }, 'in_progress': { label: 'In Progress', tone: 'orange' }, 'ongoing': { label: 'In Progress', tone: 'orange' }, 'pending': { label: 'Pending', tone: 'orange' }, 'cancelled': { label: 'Cancelled', tone: 'red' }, 'dropped': { label: 'Cancelled', tone: 'red' } };
    const c = m[status?.toLowerCase()] || { label: status?.toUpperCase() || 'UNKNOWN', tone: 'orange' };
    return <span className={`badge-soft badge-soft--${c.tone}`}>{c.label}</span>;
  };

  return (
    <>
      <div className="employee-summary-wrapper">
        {summaryStats.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="employee-summary-card">
              <div className="employee-summary-header">
                <div><p className="employee-summary-label">{card.label}</p><p className="employee-summary-subtitle">{card.subtitle}</p></div>
                <div className={`employee-summary-icon-wrapper employee-icon-${card.tone}`}><Icon size={28} /></div>
              </div>
              <div className={`employee-summary-value employee-value-${card.tone}`}>{card.value}</div>
              <p className="employee-summary-trend">{card.change}</p>
            </div>
          );
        })}
      </div>

      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon"><BookOpen size={24} /></div>
          <div><h2 className="analytics-title">Daftar Pendaftaran</h2><p className="analytics-subtitle">Kelola pendaftaran pelatihan karyawan</p></div>
        </div>
      </Card>

      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="elyra-tabs">
            {(['Semua', 'Pending', 'In Progress', 'Completed', 'Cancelled'] as const).map(tab => (
              <button key={tab} className={`elyra-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
                {tab !== 'Semua' && (
                  <span className="tab-count">
                    {tab === 'Pending' ? enrollments.filter(e => e.status === 'pending').length
                      : tab === 'In Progress' ? enrollments.filter(e => e.status === 'in_progress' || e.status === 'ongoing').length
                      : tab === 'Completed' ? enrollments.filter(e => e.status === 'completed').length
                      : enrollments.filter(e => e.status === 'cancelled' || e.status === 'dropped').length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input type="text" placeholder="Cari program atau nama karyawan..." value={searchText} onChange={e => setSearchText(e.target.value)} className="search-input-pill" />
            </div>
            <button className={`filter-btn-rounded ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}><Filter size={18} /><span>Filter</span></button>
          </div>
        </div>
        {showFilters && <div className="filter-dropdown"><div className="filter-row">{(searchText || activeTab !== 'Semua') && <button className="btn-clear-filter" onClick={clearFilters}>Hapus Filter</button>}</div></div>}
      </Card>

      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat data pendaftaran..." />}
          {!loading && paginated.length === 0 && (
            <div style={{ padding: '5rem 0' }}><EmptyState title="Pendaftaran Kosong" message={searchText || activeTab !== 'Semua' ? 'Tidak ada pendaftaran yang sesuai.' : 'Belum ada data pendaftaran.'} actionLabel="Segarkan" onAction={fetchData} /></div>
          )}
          {!loading && paginated.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '400px' }}>Program Pelatihan</th>
                      <th>Karyawan</th>
                      <th>Tanggal Mulai</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(enrollment => (
                      <tr key={enrollment.id}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">{(enrollment.program?.title || enrollment.training_title || 'T').charAt(0).toUpperCase()}</div>
                            <div className="cell-stacked">
                              <span className="cell-name-text">{enrollment.program?.title || enrollment.program?.nama || enrollment.training_title || 'Training Program'}</span>
                              <span className="cell-stacked__sub">{String(enrollment.program_id || enrollment.id)}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-name-text">{enrollment.employee?.user?.name || enrollment.employee_name || 'Employee'}</span>
                            <span className="cell-stacked__sub">{enrollment.employee?.employee_code || '-'}</span>
                          </div>
                        </td>
                        <td style={{ color: '#475569', fontWeight: 500 }}>{enrollment.start_date || 'N/A'}</td>
                        <td className="td-center">{getStatusBadge(enrollment.status)}</td>
                        <td>
                          {enrollment.progress !== undefined ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${enrollment.progress}%`, height: '100%', background: '#10b981', borderRadius: '3px' }} />
                              </div>
                              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{enrollment.progress}%</span>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            {enrollment.status === 'pending' && (
                              <>
                                <button className="action-btn" style={{ color: '#10b981', background: '#ecfdf5' }} onClick={() => handleApprove(enrollment.id)} title="Approve"><CheckCircle size={16} /></button>
                                <button className="action-btn" style={{ color: '#ef4444', background: '#fef2f2' }} onClick={() => handleReject(enrollment.id)} title="Reject"><XCircle size={16} /></button>
                              </>
                            )}
                            {(enrollment.status === 'enrolled' || enrollment.status === 'in_progress') && (
                              <button className="action-btn" style={{ color: '#8b5cf6', background: '#f5f3ff' }} onClick={() => openCompleteModal(enrollment)} title="Tandai Selesai"><Award size={16} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-pagination">
                <div className="pagination-info">Menampilkan <strong>{paginated.length}</strong> dari <strong>{filtered.length}</strong> pendaftaran</div>
                <div className="pagination-controls">
                  <button className="pagination-btn" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} className={`pagination-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                  ))}
                  <button className="pagination-btn" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>›</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal isOpen={completeModalOpen} onClose={closeCompleteModal} title={`Tandai Selesai — ${completingEnrollmentName}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Nilai (0-100)</label>
            <input type="number" min="0" max="100" placeholder="Masukkan nilai" value={completeData.score} onChange={e => setCompleteData({ ...completeData, score: e.target.value })} className="form-control" />
          </div>
          <div className="form-group">
            <label>Path Sertifikat (opsional)</label>
            <input type="text" placeholder="/path/to/certificate.pdf" value={completeData.certificate_path} onChange={e => setCompleteData({ ...completeData, certificate_path: e.target.value })} className="form-control" />
          </div>
          <div className="form-group">
            <label>Catatan (opsional)</label>
            <textarea placeholder="Catatan tambahan..." value={completeData.notes} onChange={e => setCompleteData({ ...completeData, notes: e.target.value })} className="form-control" rows={3} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-primary" style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', fontWeight: 600 }} onClick={handleComplete} disabled={completing}>
              {completing ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Award size={16} /> Tandai Selesai</>}
            </button>
            <button type="button" className="btn-outline" style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', fontWeight: 600 }} onClick={closeCompleteModal} disabled={completing}>
              <X size={16} /> Batal
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const TrainingManagementPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('Program Pelatihan');

  return (
    <div className="crud-page training-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <GraduationCap size={16} />
              <span>L & D</span>
            </div>
            <h1 className="hero-title">Pelatihan & Pengembangan</h1>
            <p className="hero-subtitle">
              Kelola program pelatihan, pendaftaran, dan pengembangan keterampilan karyawan.
            </p>
          </div>
          <div className="hero-actions">
            <RefreshCw size={16} />
          </div>
        </div>
      </Card>

      <div className="elyra-tabs" style={{ marginBottom: '1.5rem' }}>
        {TABS.map(t => (
          <button key={t} className={`elyra-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'Program Pelatihan' ? <><GraduationCap size={16} /> {t}</> : <><Users size={16} /> {t}</>}
          </button>
        ))}
      </div>

      {tab === 'Program Pelatihan' && <ProgramsTab />}
      {tab === 'Pendaftaran Pelatihan' && <EnrollmentsTab />}
    </div>
  );
};

export default TrainingManagementPage;
