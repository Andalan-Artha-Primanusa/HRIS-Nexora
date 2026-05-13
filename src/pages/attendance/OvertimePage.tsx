import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/shared/ui/Card';
import { Modal } from '@/shared/ui/Modal';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { api } from '@/shared/api/httpClient';
import { useAuthStore } from '@/app/store/auth.store';
import { attendanceService } from '@/features/attendance/api/attendance.service';
import overtimeService from '@/features/attendance/api/overtime.service';
import { showToast } from '@/shared/ui/toast';
import { Clock, RefreshCw, Calendar, Timer, AlertCircle, CheckCircle, XCircle, Search, MessageSquare, Eye, Send, Sparkles } from 'lucide-react';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import './AttendanceShared.css';

interface OvertimeRecord {
  id: number;
  attendance_id?: number;
  date: string;
  scheduled_checkout?: string;
  scheduled_check_out?: string;
  actual_checkout: string;
  overtime_minutes: number;
  status: string;
  request_id?: number;
  request_status?: string | null;
  reason: string | null;
  reject_reason: string | null;
  approved_by: number | null;
  approved_at: string | null;
  approver?: { id: number; name: string } | null;
  [key: string]: any;
}

const normalizeOvertimeStatus = (status?: string | null) => {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'approve' || normalized === 'approved' || normalized === 'accepted') return 'approved';
  if (normalized === 'reject' || normalized === 'rejected' || normalized === 'declined') return 'rejected';
  if (normalized === 'submitted' || normalized === 'waiting') return 'pending';
  return normalized;
};

const OvertimePage = () => {
  const [records, setRecords] = useState<OvertimeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'Semua' | 'Pending' | 'Approved' | 'Rejected'>('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonDraft, setReasonDraft] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<OvertimeRecord | null>(null);
  const [reasonSaving, setReasonSaving] = useState(false);
  const user = useAuthStore((state) => state.user);

  const canViewAllOvertime = useMemo(() => {
    return Boolean(
      user?.permissions?.some((permission: any) => permission?.name === 'attendance.view_all') ||
      user?.roles?.some((role: any) => role?.name && ['super_admin', 'admin', 'hr', 'manager'].includes(role.name))
    );
  }, [user]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      if (canViewAllOvertime) {
        // Admin/HR/Manager: Get all overtime requests
        const allOvertimeRes = await api.get('/overtime/requests');
        const allOvertime = Array.isArray(allOvertimeRes.data?.data) ? allOvertimeRes.data.data : [];
        const transformed = allOvertime.map((record: any) => ({
          id: record.id,
          attendance_id: record.attendance_id,
          date: record.date,
          scheduled_checkout: record.scheduled_checkout || record.scheduled_check_out,
          scheduled_check_out: record.scheduled_checkout || record.scheduled_check_out,
          actual_checkout: record.actual_checkout,
          overtime_minutes: record.overtime_minutes || 0,
          status: normalizeOvertimeStatus(record.status),
          request_id: record.id,
          request_status: normalizeOvertimeStatus(record.status),
          reason: record.reason,
          reject_reason: record.reject_reason,
          approved_by: record.approved_by,
          approved_at: record.approved_at,
          approver: record.approver,
          evidences: record.evidences || [],
        }));
        setRecords(transformed);
      } else {
        // Employee: Get own overtime summary + requests
        const [summaryResult, requestResult] = await Promise.all([
          attendanceService.getOvertimeSummary(30),
          api.get('/my/overtime'),
        ]);

        const summaryPayload = summaryResult.payload as any;
        const overtimeRows = Array.isArray(summaryPayload?.records) ? summaryPayload.records : [];

        const requestPayload = requestResult.data?.data ?? requestResult.data;
        const requests = Array.isArray(requestPayload) ? requestPayload : [];
        const requestByAttendanceId = new Map<string, any>();
        const requestByDate = new Map<string, any>();

        requests.forEach((request: any) => {
          const attendanceId = request?.attendance_id ?? request?.attendance?.id;
          if (attendanceId !== undefined && attendanceId !== null) {
            requestByAttendanceId.set(String(attendanceId), request);
          }

          if (request?.date) {
            requestByDate.set(String(request.date).slice(0, 10), request);
          }
        });

        const resolveRequestForRecord = (record: any) => {
          const attendanceKeys = [record?.attendance_id, record?.id]
            .filter((value) => value !== undefined && value !== null)
            .map(String);

          for (const key of attendanceKeys) {
            const request = requestByAttendanceId.get(key);
            if (request) return request;
          }

          const dateKey = record?.date ? String(record.date).slice(0, 10) : null;
          if (dateKey && requestByDate.has(dateKey)) {
            return requestByDate.get(dateKey);
          }

          return null;
        };

        const mergedRecords = overtimeRows
          .filter((record: any) => Number(record.overtime_minutes || 0) > 0)
          .map((record: any) => {
            const request = resolveRequestForRecord(record);
            return {
              ...record,
              attendance_id: request?.attendance_id ?? record.attendance_id ?? record.id,
              request_id: request?.id ?? request?.attendance_id ?? null,
              request_status: normalizeOvertimeStatus(request?.status),
              reason: request?.reason ?? record.reason ?? null,
              reject_reason: request?.reject_reason ?? null,
              approved_by: request?.approved_by ?? null,
              approved_at: request?.approved_at ?? null,
              approver: request?.approver ?? null,
              evidences: request?.evidences ?? [],
              status: normalizeOvertimeStatus(request?.status ?? (Number(record.overtime_minutes || 0) > 0 ? 'pending' : 'draft')),
            };
          });

        setRecords(mergedRecords);
      }
    } catch (error: any) {
      console.error('Failed to load overtime:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords();
  }, [canViewAllOvertime]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  const handleAddReason = async (record: OvertimeRecord) => {
    if (!record.request_id) {
      showToast('Data lembur belum punya request untuk diisi alasan.', 'info');
      return;
    }

    setSelectedRecord(record);
    setReasonDraft(record.reason || '');
    setReasonModalOpen(true);
  };

  const closeReasonModal = () => {
    if (reasonSaving) return;
    setReasonModalOpen(false);
    setReasonDraft('');
    setSelectedRecord(null);
  };

  const submitReason = async () => {
    const requestId = selectedRecord?.request_id;
    if (!requestId) {
      showToast('Data lembur belum punya request untuk diisi alasan.', 'info');
      return;
    }

    const reason = reasonDraft.trim();
    if (!reason) {
      showToast('Alasan lembur tidak boleh kosong.', 'info');
      return;
    }

    try {
      setReasonSaving(true);
      await api.put(`/my/overtime/${requestId}/reason`, { reason });
      setReasonModalOpen(false);
      setReasonDraft('');
      setSelectedRecord(null);
      await loadRecords();
      showToast('Alasan lembur berhasil disimpan', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Gagal menambahkan alasan', 'error');
    } finally {
      setReasonSaving(false);
    }
  };

  const handleApproveRequest = async (record: OvertimeRecord) => {
    const requestId = record.request_id;
    if (!requestId) {
      showToast('Request lembur tidak ditemukan.', 'error');
      return;
    }

    if (!window.confirm('Setujui pengajuan lembur ini?')) return;

    try {
      setLoading(true);
      await api.put(`/overtime/requests/${requestId}/approve`);
      await loadRecords();
      showToast('Lembur berhasil disetujui', 'success');
    } catch (error: any) {
      console.error(error);
      showToast(error?.response?.data?.message || 'Gagal menyetujui lembur', 'error');
      setLoading(false);
    }
  };

  const handleRejectRequest = async (record: OvertimeRecord) => {
    const requestId = record.request_id;
    if (!requestId) {
      showToast('Request lembur tidak ditemukan.', 'error');
      return;
    }

    const reason = window.prompt('Alasan penolakan (opsional):');
    if (reason === null) return;

    try {
      setLoading(true);
      await api.put(`/overtime/requests/${requestId}/reject`, { reject_reason: reason || undefined });
      await loadRecords();
      showToast('Lembur berhasil ditolak', 'success');
    } catch (error: any) {
      console.error(error);
      showToast(error?.response?.data?.message || 'Gagal menolak lembur', 'error');
      setLoading(false);
    }
  };

  const handleUploadEvidence = async (record: OvertimeRecord) => {
    let requestId = record.request_id;
    
    if (!requestId && record.attendance_id) {
      try {
        const createRes = await overtimeService.createOvertimeRequest(record.attendance_id);
        const payload = createRes?.data ?? createRes;
        requestId = payload?.id ?? payload?.request_id;
        
        if (!requestId) {
          showToast('Gagal membuat request lembur. Silakan hubungi admin.', 'error');
          return;
        }
      } catch (err: any) {
        console.error('Failed to create overtime request:', err);
        showToast(err?.response?.data?.message || 'Gagal membuat request lembur', 'error');
        return;
      }
    }
    
    if (!requestId) {
      showToast('Data lembur tidak valid untuk upload bukti.', 'error');
      return;
    }

    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
          showToast('Ukuran file maksimal 10MB', 'info');
          return;
        }
        try {
          await overtimeService.uploadEvidence(requestId, file);
          showToast('Bukti berhasil diunggah', 'success');
          void loadRecords();
        } catch (err: any) {
          console.error(err);
          showToast(err?.response?.data?.message || 'Gagal mengunggah bukti', 'error');
        }
      };
      input.click();
    } catch (err) {
      console.error(err);
      showToast('Gagal membuka dialog file', 'error');
    }
  };

  const handleViewMyEvidences = async (record: OvertimeRecord) => {
    const requestId = record.request_id ?? record.id;
    if (!requestId) {
      showToast('Request lembur belum tersedia, jadi bukti belum bisa dibuka.', 'info');
      return;
    }

    try {
      const res = canViewAllOvertime
        ? await overtimeService.getEvidencesForRequest(requestId)
        : await overtimeService.getMyEvidences(requestId);
      const payload = res?.data?.data ?? res?.data ?? res;
      const list = Array.isArray(payload) ? payload : [];
      if (list.length === 0) {
        showToast('Belum ada bukti untuk lembur ini', 'info');
        return;
      }
      const names = list.map((e: any, i: number) => `${i + 1}. ${e.filename || e.name || e.file_name || 'file'}`);
      const pick = window.prompt('Bukti:\n' + names.join('\n') + '\n\nMasukkan nomor untuk membuka (kosong = batalkan)');
      if (!pick) return;
      const idx = parseInt(pick, 10) - 1;
      if (Number.isNaN(idx) || idx < 0 || idx >= list.length) { showToast('Pilihan tidak valid', 'error'); return; }
      const selectedEvidence = list[idx];
      const url = selectedEvidence?.file_url || selectedEvidence?.url || selectedEvidence?.path;
      if (!url) { showToast('Tidak ada URL untuk file ini', 'error'); return; }
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      console.error('Failed to load evidences:', err);
      showToast(err?.response?.data?.message || err?.message || 'Gagal mengambil bukti', 'error');
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const dateMatch = (r.date || '').toLowerCase().includes(searchText.toLowerCase());
      const reasonMatch = (r.reason || '').toLowerCase().includes(searchText.toLowerCase());
      const textMatch = dateMatch || reasonMatch;
      const currentStatus = normalizeOvertimeStatus(r.request_status ?? r.status);

      let statusMatch = true;
      if (activeTab === 'Pending') statusMatch = currentStatus === 'pending';
      else if (activeTab === 'Approved') statusMatch = currentStatus === 'approved';
      else if (activeTab === 'Rejected') statusMatch = currentStatus === 'rejected';

      return textMatch && statusMatch;
    });
  }, [records, searchText, activeTab]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  const pendingCount = records.filter(r => normalizeOvertimeStatus(r.request_status ?? r.status) === 'pending').length;
  const approvedCount = records.filter(r => normalizeOvertimeStatus(r.request_status ?? r.status) === 'approved').length;
  const rejectedCount = records.filter(r => normalizeOvertimeStatus(r.request_status ?? r.status) === 'rejected').length;
  const totalMinutes = records.reduce((sum, r) => sum + (r.overtime_minutes || 0), 0);
  const totalOvertimeDays = records.length;

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}j ${m}m`;
  };

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return '-';
    try {
      const date = new Date(timeStr);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      const [hours, minutes] = timeStr.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeStr;
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = normalizeOvertimeStatus(status);
    const map: Record<string, { label: string; tone: string }> = {
      'pending': { label: 'Menunggu', tone: 'orange' },
      'approved': { label: 'Disetujui', tone: 'green' },
      'rejected': { label: 'Ditolak', tone: 'red' },
    };
    const config = map[normalizedStatus] || { label: 'Tercatat', tone: 'blue' };
    return <span className={`badge-soft badge-soft--${config.tone}`}>{config.label}</span>;
  };

  const summaryCards = [
    { label: 'Hari Lembur', subtitle: 'Checkout melebihi jadwal', value: String(totalOvertimeDays), tone: 'blue' as const, icon: Clock },
    { label: 'Menunggu Persetujuan', subtitle: 'Pending approval', value: String(pendingCount), tone: 'orange' as const, icon: AlertCircle },
    { label: 'Disetujui', subtitle: 'Sudah approved', value: String(approvedCount), tone: 'green' as const, icon: CheckCircle },
    { label: 'Total Jam Lembur', subtitle: 'Akumulasi overtime', value: formatDuration(totalMinutes), tone: 'purple' as const, icon: Timer },
  ];

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Timer size={16} />
              <span>Layanan Mandiri</span>
            </div>
            <h1 className="hero-title">Lembur Saya</h1>
            <p className="hero-subtitle">
              Riwayat lembur diambil dari checkout yang melewati jadwal pulang, lalu dicocokkan dengan request bukti lembur.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadRecords()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="employee-summary-card">
              <div className="employee-summary-header">
                <div>

                <Modal
                  isOpen={reasonModalOpen}
                  onClose={closeReasonModal}
                  title="Tambah Alasan Lembur"
                  size="md"
                  footer={(
                    <>
                      <button className="btn-outline" onClick={closeReasonModal} disabled={reasonSaving}>
                        Batal
                      </button>
                      <button className="btn-primary" onClick={() => void submitReason()} disabled={reasonSaving}>
                        {reasonSaving ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                        {reasonSaving ? 'Menyimpan...' : 'Simpan Alasan'}
                      </button>
                    </>
                  )}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #eff6ff, #f8fafc)', border: '1px solid #dbeafe' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '999px', background: '#dbeafe', display: 'grid', placeItems: 'center', color: '#2563eb' }}>
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {selectedRecord ? formatDate(selectedRecord.date) : 'Pilih data lembur'}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                          Jelaskan alasan lembur secara singkat dan jelas.
                        </div>
                      </div>
                    </div>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 700, color: '#1e293b' }}>
                      Alasan Lembur
                      <textarea
                        value={reasonDraft}
                        onChange={(e) => setReasonDraft(e.target.value)}
                        rows={5}
                        placeholder="Contoh: Menyelesaikan proses payroll dan rekap absensi yang mendesak."
                        style={{
                          width: '100%',
                          resize: 'vertical',
                          borderRadius: '16px',
                          border: '1px solid #cbd5e1',
                          padding: '1rem 1.1rem',
                          fontSize: '0.95rem',
                          lineHeight: 1.5,
                          outline: 'none',
                          background: '#fff',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#60a5fa'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.12)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }}
                      />
                    </label>
                  </div>
                </Modal>
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

      <Modal
        isOpen={reasonModalOpen}
        onClose={closeReasonModal}
        title="Tambah Alasan Lembur"
        size="md"
        footer={(
          <>
            <button className="btn-outline overtime-reason-modal__footer-btn" onClick={closeReasonModal} disabled={reasonSaving}>
              Batal
            </button>
            <button className="btn-primary overtime-reason-modal__footer-btn" onClick={() => void submitReason()} disabled={reasonSaving}>
              {reasonSaving ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              {reasonSaving ? 'Menyimpan...' : 'Simpan Alasan'}
            </button>
          </>
        )}
      >
        <div className="overtime-reason-modal">
          <div className="overtime-reason-modal__hero">
            <div className="overtime-reason-modal__icon">
              <Sparkles size={20} />
            </div>
            <div className="overtime-reason-modal__hero-text">
              <div className="overtime-reason-modal__title-row">
                <div className="overtime-reason-modal__title">{selectedRecord ? formatDate(selectedRecord.date) : 'Pilih data lembur'}</div>
                {selectedRecord && (
                  <div className="overtime-reason-modal__badge">
                    {getStatusBadge(selectedRecord.request_status || selectedRecord.status)}
                  </div>
                )}
              </div>
              <div className="overtime-reason-modal__subtitle">
                Jelaskan alasan lembur secara singkat, jelas, dan profesional.
              </div>
            </div>
          </div>

          <label className="overtime-reason-modal__field">
            <span>Alasan Lembur</span>
            <textarea
              className="overtime-reason-modal__textarea"
              value={reasonDraft}
              onChange={(e) => setReasonDraft(e.target.value)}
              rows={5}
              placeholder="Contoh: Menyelesaikan proses payroll dan rekap absensi yang mendesak."
            />
          </label>
        </div>
      </Modal>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Timer size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Lembur</h2>
            <p className="analytics-subtitle">Checkout terlambat dan status request bukti lembur</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="elyra-tabs">
            {(['Semua', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => (
              <button
                key={tab}
                className={`elyra-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab !== 'Semua' && (
                  <span className="tab-count">
                    {tab === 'Pending' ? pendingCount : tab === 'Approved' ? approvedCount : rejectedCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari lembur..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat lembur..." />}

          {!loading && paginatedRecords.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Belum Ada Lembur"
                message="Belum ada data lembur. Lembur akan otomatis tercatat saat Anda checkout melebihi jadwal."
              />
            </div>
          )}

          {!loading && paginatedRecords.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Jadwal Checkout</th>
                      <th>Aktual Checkout</th>
                      <th>Durasi Lembur</th>
                      <th>Alasan</th>
                      <th className="th-center">Status</th>
                      <th className="th-center" style={{ width: '100px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map((record) => (
                      <tr key={record.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={16} color="#64748b" />
                            {formatDate(record.date)}
                          </div>
                        </td>
                        <td style={{ fontWeight: 500, color: '#475569' }}>{formatTime(record.scheduled_check_out || record.scheduled_checkout)}</td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{formatTime(record.actual_checkout)}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#7c3aed' }}>
                            {formatDuration(record.overtime_minutes)}
                          </span>
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {record.reason || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Belum diisi</span>}
                        </td>
                        <td className="td-center">
                          {getStatusBadge(record.request_status || record.status)}
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            {canViewAllOvertime && normalizeOvertimeStatus(record.request_status || record.status) === 'pending' && (
                              <>
                                <button
                                  className="action-btn"
                                  style={{ color: '#10b981', background: '#ecfdf5' }}
                                  onClick={() => void handleApproveRequest(record)}
                                  title="Setujui"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  className="action-btn"
                                  style={{ color: '#ef4444', background: '#fef2f2' }}
                                  onClick={() => void handleRejectRequest(record)}
                                  title="Tolak"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            {record.request_id && (normalizeOvertimeStatus(record.request_status) === 'pending' || !record.reason) && (
                              <button
                                className="action-btn"
                                style={{ color: '#6366f1', background: '#eef2ff' }}
                                onClick={() => void handleAddReason(record)}
                                title="Tambah Alasan"
                              >
                                <MessageSquare size={16} />
                              </button>
                            )}
                            {(record.request_id || record.attendance_id) && normalizeOvertimeStatus(record.request_status) !== 'approved' && (
                              <button
                                className="action-btn"
                                style={{ color: '#06b6d4', background: '#ecfeff' }}
                                onClick={() => void handleUploadEvidence(record)}
                                title="Unggah Bukti"
                              >
                                <MessageSquare size={16} />
                              </button>
                            )}
                            <button
                              className="action-btn"
                              style={{ color: '#0f172a', background: '#f1f5f9' }}
                              onClick={() => void handleViewMyEvidences(record)}
                              title="Lihat Bukti"
                              disabled={!record.request_id}
                            >
                              <Eye size={16} />
                            </button>
                            {normalizeOvertimeStatus(record.request_status) === 'rejected' && record.reject_reason && (
                              <button
                                className="action-btn"
                                style={{ color: '#ef4444', background: '#fef2f2' }}
                                onClick={() => showToast('Alasan ditolak: ' + record.reject_reason, 'info')}
                                title="Lihat Alasan Penolakan"
                              >
                                <XCircle size={16} />
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
                  Menampilkan <strong>{paginatedRecords.length}</strong> dari <strong>{filteredRecords.length}</strong> hari lembur
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

export default OvertimePage;
