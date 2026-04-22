import React from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Mail, Phone, Calendar, MapPin, FileText, Download, UserCheck, UserX, MessageSquare, User } from 'lucide-react';
import type { Candidate } from '../types/recruitment.types';

interface CandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onUpdateStatus: (status: string) => void;
  onScheduleInterview: () => void;
  onMakeOffer: () => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({ 
  isOpen, onClose, candidate, onUpdateStatus, onScheduleInterview, onMakeOffer 
}) => {
  if (!candidate) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Candidate Profile" size="lg">
      <div className="candidate-detail">
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '16px', 
            background: '#eff6ff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#2563eb'
          }}>
            <User size={48} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e3a8a' }}>{candidate.full_name}</h2>
                <p style={{ margin: '0.25rem 0', color: '#64748b', fontWeight: 600 }}>
                  Applied for: <span style={{ color: '#2563eb' }}>{candidate.job_opening?.title}</span>
                </p>
              </div>
              <span className={`status-pill status-${candidate.status}`}>{candidate.status}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
                <Mail size={14} /> {candidate.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
                <Phone size={14} /> {candidate.phone}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
                <MapPin size={14} /> {candidate.source}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '1rem' }}>Experience Summary</h3>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: '#334155' }}>
                  Candidate has 5 years of experience in React and Node.js. Previously worked at TechCorp as a Senior Developer.
                  Fluent in English and Bahasa Indonesia.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '1rem' }}>Documents</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} color="#2563eb" />
                    <span style={{ fontSize: '0.85rem' }}>Resume_CV.pdf</span>
                  </div>
                  <Download size={16} color="#64748b" style={{ cursor: 'pointer' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '0.5rem' }}>Actions</h3>
             <Button variant="primary" style={{ width: '100%' }} onClick={onScheduleInterview}>
               <Calendar size={18} style={{ marginRight: '8px' }} />
               Schedule Interview
             </Button>
             <Button variant="outline" style={{ width: '100%' }} onClick={onMakeOffer}>
               <FileText size={18} style={{ marginRight: '8px' }} />
               Create Offer
             </Button>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                <Button variant="outline" style={{ color: '#16a34a', borderColor: '#bbf7d0' }} onClick={() => onUpdateStatus('hired')}>
                  <UserCheck size={16} style={{ marginRight: '4px' }} /> Hired
                </Button>
                <Button variant="outline" style={{ color: '#ef4444', borderColor: '#fecaca' }} onClick={() => onUpdateStatus('rejected')}>
                  <UserX size={16} style={{ marginRight: '4px' }} /> Reject
                </Button>
             </div>
             <Button variant="ghost" style={{ width: '100%', marginTop: '1rem' }}>
               <MessageSquare size={18} style={{ marginRight: '8px' }} />
               Send Message
             </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
