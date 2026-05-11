import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, FileText, Calendar, MapPin, User, CheckCircle, XCircle, Clock, BookTemplate, History } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { legalService } from '@/features/legal/api/legal.service';
import { AssignmentLetterModal } from '@/features/legal/components/AssignmentLetterModal';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
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
    } catch (err) {
      console.error('Failed to create assignment letter', err);
      throw err;
    }
  };

  const handleApprove = async (id: string | number) => {
    try {
      await legalService.approveAssignmentLetter(id);
      fetchData();
    } catch (err) {
      console.error('Failed to approve', err);
    }
  };

  const handleReject = async (id: string | number) => {
    try {
      await legalService.rejectAssignmentLetter(id);
      fetchData();
    } catch (err) {
      console.error('Failed to reject', err);
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {letters.map((letter) => (
              <Card key={letter.id} glass style={{ 
                padding: '0', 
                borderRadius: '20px', 
                overflow: 'hidden',
                border: '1px solid var(--cr-border)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Header Section */}
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(37,99,235,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ 
                      width: '46px', 
                      height: '46px', 
                      background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', 
                      borderRadius: '14px', 
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 0 0 1px rgba(37,99,235,0.1)'
                    }}>
                      <FileText size={22} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{letter.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                          #{letter.id}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>•</span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Official Duty Letter</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(letter.status)}
                </div>

                {/* Body Content */}
                <div style={{ padding: '1.5rem', flex: 1 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                        <User size={12} /> Requester
                      </div>
                      <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>
                        {letter.user?.name || letter.employee?.user?.name || letter.employee?.full_name || 'N/A'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                        <MapPin size={12} /> Destination
                      </div>
                      <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>
                        {letter.location || 'Not Specified'}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Calendar size={16} color="#2563eb" />
                      <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{new Date(letter.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span style={{ margin: '0 8px', color: '#cbd5e1' }}>→</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{new Date(letter.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {letter.description && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, marginBottom: '6px' }}>Purpose / Notes</div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, background: '#fff', padding: '10px', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
                        {letter.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                {letter.status === 'pending' && (
                  <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem' }}>
                    <Button 
                      variant="primary" 
                      style={{ flex: 1, height: '40px', borderRadius: '10px', fontWeight: 600 }}
                      onClick={() => handleApprove(letter.id)}
                    >
                      <CheckCircle size={16} style={{ marginRight: '8px' }} />
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      style={{ flex: 1, height: '40px', borderRadius: '10px', color: '#dc2626', borderColor: '#fee2e2', fontWeight: 600 }}
                      onClick={() => handleReject(letter.id)}
                    >
                      <XCircle size={16} style={{ marginRight: '8px' }} />
                      Reject
                    </Button>
                  </div>
                )}

                  {letter.status?.toLowerCase() === 'approved' && (
                  <Button 
                    variant="outline" 
                    style={{ width: '100%', borderColor: '#2563eb', color: '#2563eb', fontWeight: 600, gap: '8px' }}
                    onClick={() => handleDownloadPdf(letter.id)}
                  >
                    <FileText size={16} /> Download PDF
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  style={{ width: '100%', borderColor: '#8b5cf6', color: '#8b5cf6', fontWeight: 600, gap: '8px' }}
                  onClick={() => setHistoryModal({ module: 'assignment_letter', id: letter.id })}
                >
                  <History size={16} /> Riwayat Approval
                </Button>
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
