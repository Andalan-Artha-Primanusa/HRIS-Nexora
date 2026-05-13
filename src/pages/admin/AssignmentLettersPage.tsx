import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, FileText, Calendar, MapPin, User, CheckCircle, XCircle, Clock, BookTemplate, History } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { legalService } from '@/features/legal/api/legal.service';
import { AssignmentLetterModal } from '@/features/legal/components/AssignmentLetterModal';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
import './AssignmentLettersPage.css';
import { showToast } from '@/shared/ui/toast';
import { ApprovalHistoryModal } from "@/shared/components/ApprovalHistoryModal";

const AssignmentLettersPage: React.FC = () => {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyModal, setHistoryModal] = useState<{ module: string; id: number } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await legalService.getAssignmentLetters();
      // Safe extraction
      let data = [];
      if (Array.isArray(response)) data = response;
      else if (response && typeof response === 'object') {
        // Laravel Pagination check: response.data.data
        if (response.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else {
          data = response.payload?.items || response.payload || response.data || response.items || response.results || [];
        }
      }
      setLetters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLetters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (formData: any) => {
    try {
      await legalService.createAssignmentLetter(formData);
      fetchData();
      showToast('Surat tugas berhasil dibuat', 'success');
    } catch (err: any) {
      console.error('Failed to create assignment letter', err);
      showToast(err?.response?.data?.message || err?.message || 'Gagal membuat surat tugas', 'error');
      throw err;
    }
  };

  const handleApprove = async (id: string | number) => {
    try {
      await legalService.approveAssignmentLetter(id);
      fetchData();
      showToast('Surat tugas berhasil disetujui', 'success');
    } catch (err: any) {
      console.error('Failed to approve', err);
      showToast(err?.response?.data?.message || err?.message || 'Gagal menyetujui surat tugas', 'error');
    }
  };

  const handleReject = async (id: string | number) => {
    try {
      await legalService.rejectAssignmentLetter(id);
      fetchData();
      showToast('Surat tugas berhasil ditolak', 'success');
    } catch (err: any) {
      console.error('Failed to reject', err);
      showToast(err?.response?.data?.message || err?.message || 'Gagal menolak surat tugas', 'error');
    }
  };

  const handleDownloadPdf = async (id: string | number) => {
    try {
      const response = await legalService.generateAssignmentLetterPdf(id);
      if (response.success && response.data.file_url) {
        window.open(response.data.file_url, '_blank');
      }
    } catch (err) {
      console.error('Failed to download PDF', err);
      alert('Failed to generate PDF. Please ensure the request is approved.');
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'approved') return <span className="status-pill status-approved"><CheckCircle size={14} /> Approved</span>;
    if (s === 'rejected') return <span className="status-pill status-rejected"><XCircle size={14} /> Rejected</span>;
    return <span className="status-pill status-pending"><Clock size={14} /> Pending</span>;
  };

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <BookTemplate size={16} />
              <span>Legal & Kepatuhan</span>
            </div>
            <h1 className="hero-title">Surat Tugas</h1>
            <p className="hero-subtitle">
              Kelola dan setujui surat penugasan karyawan (Tugas Resmi).
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              Permintaan Surat Tugas
            </button>
          </div>
        </div>
      </Card>

      <div className="crud-content" style={{ marginTop: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: 'rgba(255,255,255,0.4)', borderRadius: '24px' }}>
            <RefreshCw size={32} className="animate-spin" color="#2563eb" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#64748b', fontWeight: 500 }}>Loading assignment letters...</p>
          </div>
        ) : letters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: 'rgba(255,255,255,0.4)', borderRadius: '24px' }}>
            <FileText size={48} color="#cbd5e1" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>No assignment letters found</h3>
            <p style={{ color: '#94a3b8' }}>All official duty requests will appear here once submitted.</p>
          </div>
        ) : (
          <div className="assignment-grid">
            {letters.map((letter) => (
              <Card key={letter.id} glass className="assignment-card">
                <div className="assignment-card-header">
                  <div className="assignment-card-title-row">
                    <div className="assignment-icon-box">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="assignment-title">{letter.title}</h3>
                      <div className="assignment-meta">
                        <span className="assignment-id">#{letter.id}</span>
                        <span className="assignment-dot">•</span>
                        <span>Official Duty Letter</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(letter.status)}
                </div>

                <div className="assignment-card-body">
                  <div className="assignment-info-grid">
                    <div className="assignment-info-item">
                      <div className="assignment-info-label"><User size={12} /> Requester</div>
                      <div className="assignment-info-value">
                        {letter.user?.name || letter.employee?.user?.name || letter.employee?.full_name || 'N/A'}
                      </div>
                    </div>
                    <div className="assignment-info-item">
                      <div className="assignment-info-label"><MapPin size={12} /> Destination</div>
                      <div className="assignment-info-value">{letter.location || 'Not Specified'}</div>
                    </div>
                  </div>

                  <div className="assignment-date-box">
                    <Calendar size={16} />
                    <span>
                      <strong>{new Date(letter.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                      <span className="assignment-date-arrow">→</span>
                      <strong>{new Date(letter.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                    </span>
                  </div>

                  {letter.description && (
                    <div className="assignment-notes">
                      <div className="assignment-info-label">Purpose / Notes</div>
                      <p className="assignment-notes-text">{letter.description}</p>
                    </div>
                  )}
                </div>

                <div className="assignment-card-footer">
                  {letter.status === 'pending' && (
                    <div className="assignment-actions-row">
                      <Button variant="primary" className="assignment-btn-approve" onClick={() => handleApprove(letter.id)}>
                        <CheckCircle size={16} /> Approve
                      </Button>
                      <Button variant="outline" className="assignment-btn-reject" onClick={() => handleReject(letter.id)}>
                        <XCircle size={16} /> Reject
                      </Button>
                    </div>
                  )}
                  {letter.status?.toLowerCase() === 'approved' && (
                    <Button variant="outline" className="assignment-btn-pdf" onClick={() => handleDownloadPdf(letter.id)}>
                      <FileText size={16} /> Download PDF
                    </Button>
                  )}
                  <button className="assignment-history-btn" onClick={() => setHistoryModal({ module: 'assignment_letter', id: letter.id })}>
                    <History size={16} /> Riwayat Approval
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AssignmentLetterModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      {historyModal && (
        <ApprovalHistoryModal
          isOpen={!!historyModal}
          onClose={() => setHistoryModal(null)}
          module={historyModal.module}
          moduleId={historyModal.id}
        />
      )}
    </div>
  );
};

export default AssignmentLettersPage;
