import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  Shield,
  RefreshCw,
  FileBadge
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { documentService } from '@/features/employee/api/document.service';
import type { EmployeeDocument } from '@/features/employee/types/document.types';
import '@/pages/ess/EssPages.css';

const MyDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentService.getMyDocuments();
      // Extract array from Laravel pagination
      const data = response.data?.data || response.data || [];
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || doc.category === activeTab || doc.document_type === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className="status-pill status-approved"><CheckCircle size={14} /> Approved</span>;
      case 'pending':
        return <span className="status-pill status-pending"><Clock size={14} /> Pending Review</span>;
      case 'rejected':
        return <span className="status-pill status-rejected"><XCircle size={14} /> Rejected</span>;
      case 'expired':
        return <span className="status-pill status-expired"><AlertCircle size={14} /> Expired</span>;
      default:
        return <span className="status-pill">{status}</span>;
    }
  };

  const getDocIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('contract')) return <Shield size={24} />;
    if (t.includes('letter')) return <FileBadge size={24} />;
    return <FileText size={24} />;
  };

  const stats = {
    total: documents.length,
    approved: documents.filter(d => d.status === 'approved').length,
    pending: documents.filter(d => d.status === 'pending').length,
    expiring: documents.filter(d => d.expires_at && new Date(d.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length
  };

  return (
    <div className="ess-page">
      <div className="ess-header">
        <div className="ess-header-copy">
          <span className="ess-badge">Document Management</span>
          <h1>My Documents</h1>
          <p>Access your official documents, certificates, and employment records.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="outline" onClick={fetchDocuments} style={{ gap: '8px' }}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Button variant="primary" style={{ gap: '8px' }}>
            <Upload size={18} /> Upload Document
          </Button>
        </div>
      </div>

      <div className="ess-summary-grid" style={{ marginTop: '1rem' }}>
        <div className="ess-summary-card">
          <div className="ess-summary-header">
            <span className="ess-summary-label">Total Files</span>
            <div className="ess-summary-icon ess-summary-icon--blue"><FileText size={20} /></div>
          </div>
          <div className="ess-summary-value">{stats.total}</div>
          <div className="ess-summary-subtitle">All managed documents</div>
        </div>
        <div className="ess-summary-card">
          <div className="ess-summary-header">
            <span className="ess-summary-label">Verified</span>
            <div className="ess-summary-icon ess-summary-icon--green"><CheckCircle size={20} /></div>
          </div>
          <div className="ess-summary-value">{stats.approved}</div>
          <div className="ess-summary-subtitle">Approved by HR</div>
        </div>
        <div className="ess-summary-card">
          <div className="ess-summary-header">
            <span className="ess-summary-label">Pending</span>
            <div className="ess-summary-icon ess-summary-icon--orange"><Clock size={20} /></div>
          </div>
          <div className="ess-summary-value">{stats.pending}</div>
          <div className="ess-summary-subtitle">Awaiting review</div>
        </div>
        <div className="ess-summary-card">
          <div className="ess-summary-header">
            <span className="ess-summary-label">Expiring Soon</span>
            <div className="ess-summary-icon ess-summary-icon--red"><AlertCircle size={20} /></div>
          </div>
          <div className="ess-summary-value">{stats.expiring}</div>
          <div className="ess-summary-subtitle">Next 30 days</div>
        </div>
      </div>

      <Card glass style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'contract', 'letter', 'identity'].map(tab => (
              <Button 
                key={tab}
                variant={activeTab === tab ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                style={{ textTransform: 'capitalize', borderRadius: '10px' }}
              >
                {tab}
              </Button>
            ))}
          </div>
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search documents..." 
              className="ess-input"
              style={{ width: '100%', paddingLeft: '40px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <RefreshCw size={32} className="animate-spin" style={{ color: '#2563eb', marginBottom: '1rem' }} />
            <p style={{ color: '#64748b' }}>Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(248, 250, 252, 0.5)', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
            <FileText size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>No documents found</h3>
            <p style={{ color: '#94a3b8' }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {filteredDocuments.map(doc => (
              <div key={doc.id} className="doc-card">
                <div className="doc-card-header">
                  <div className={`doc-icon-wrap ${doc.document_type.includes('contract') ? 'icon-shield' : 'icon-file'}`}>
                    {getDocIcon(doc.document_type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 className="doc-title">{doc.title}</h4>
                    <span className="doc-type-label">{doc.document_type.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div className="doc-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>Updated: {new Date(doc.updated_at).toLocaleDateString()}</span>
                  </div>
                  {doc.expires_at && (
                    <div className={`meta-item ${new Date(doc.expires_at) < new Date() ? 'text-red' : ''}`}>
                      <AlertCircle size={14} />
                      <span>Expires: {new Date(doc.expires_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="doc-footer">
                  {getStatusBadge(doc.status)}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    style={{ color: '#2563eb', gap: '6px' }}
                    onClick={() => window.location.href = doc.file_url}
                  >
                    <Download size={16} /> Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <style>{`
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          background: #f1f5f9;
          color: #64748b;
        }
        .status-approved { background: #dcfce7; color: #15803d; }
        .status-pending { background: #fef3c7; color: #b45309; }
        .status-rejected { background: #fee2e2; color: #b91c1c; }
        .status-expired { background: #f1f5f9; color: #b91c1c; border: 1px solid #fee2e2; }

        .doc-card {
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 16px;
          padding: 1.25rem;
          transition: all 0.2s ease;
        }
        .doc-card:hover {
          border-color: #2563eb;
          box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.1);
          transform: translateY(-2px);
        }
        .doc-card-header {
          display: flex;
          gap: 12px;
          margin-bottom: 1rem;
        }
        .doc-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-file { background: #eff6ff; color: #2563eb; }
        .icon-shield { background: #f0fdf4; color: #16a34a; }
        
        .doc-title {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #1e293b;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .doc-type-label {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        .doc-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 1.25rem;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #64748b;
        }
        .text-red { color: #dc2626; }

        .doc-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default MyDocumentsPage;
