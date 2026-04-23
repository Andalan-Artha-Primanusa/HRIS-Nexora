import React, { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, MapPin, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { legalService } from '@/features/legal/api/legal.service';
import { AssignmentLetterModal } from '@/features/legal/components/AssignmentLetterModal';
import '@/shared/styles/CrudPage.css';

const MyAssignmentLettersPage: React.FC = () => {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const extractArray = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (res && typeof res === 'object') {
      // Laravel Pagination: res.data.data
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      
      if (Array.isArray(res.payload)) return res.payload;
      if (res.payload && Array.isArray(res.payload.items)) return res.payload.items;
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.items)) return res.items;
    }
    return [];
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await legalService.getAssignmentLetters();
      setLetters(extractArray(response));
    } catch (err) {
      console.error(err);
      setLetters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (formData: any) => {
    await legalService.createAssignmentLetter(formData);
    fetchData();
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { icon: <CheckCircle size={15} />, bg: '#dcfce7', text: '#16a34a', label: 'Approved' };
      case 'rejected':
        return { icon: <XCircle size={15} />, bg: '#fee2e2', text: '#dc2626', label: 'Rejected' };
      default:
        return { icon: <Clock size={15} />, bg: '#fef3c7', text: '#d97706', label: 'Pending' };
    }
  };

  return (
    <div className="crud-page">
      <div className="crud-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="reimb-badge reimb-badge-ess" style={{ margin: 0 }}>Employee Self Service</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>•</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{letters.length} Letters</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#1e293b', marginBottom: '0.5rem' }}>
            My Assignment Letters
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>View your official duty letters and their approval status.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData} style={{ padding: '11px', borderRadius: '12px' }}>
            <RefreshCw size={19} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '0 20px', height: '46px', borderRadius: '12px', fontWeight: 600, boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
          >
            <Plus size={19} style={{ marginRight: '8px' }} /> Request Letter
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
          <RefreshCw size={36} className="animate-spin" style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>Loading your letters...</p>
        </div>
      ) : letters.length === 0 ? (
        <Card glass style={{ textAlign: 'center', padding: '5rem' }}>
          <FileText size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#475569' }}>No assignment letters yet</h3>
          <p style={{ color: '#94a3b8' }}>Click "Request Letter" to submit a new official duty request.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {letters.map((letter) => {
            const statusCfg = getStatusConfig(letter.status);
            return (
              <Card key={letter.id} glass style={{ padding: '1.75rem', borderRadius: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {/* Left */}
                  <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                    <div style={{ padding: '12px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '14px', color: '#2563eb', height: 'fit-content' }}>
                      <FileText size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{letter.title}</h3>
                      {letter.description && (
                        <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                          {letter.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b' }}>
                          <MapPin size={14} />
                          <span>{letter.location || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b' }}>
                          <Calendar size={14} />
                          <span>{letter.start_date} → {letter.end_date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Status badge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', marginLeft: '1.5rem', flexShrink: 0 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '7px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700,
                      background: statusCfg.bg, color: statusCfg.text
                    }}>
                      {statusCfg.icon} {statusCfg.label}
                    </span>
                    
                    {letter.status?.toLowerCase() === 'approved' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', background: 'rgba(37,99,235,0.05)', padding: '6px 12px' }}
                        onClick={() => window.print()}
                      >
                        Download PDF
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AssignmentLetterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default MyAssignmentLettersPage;
