import React from 'react';
import { MoreVertical, Mail, Phone, Calendar, Star, MapPin } from 'lucide-react';
import type { Candidate } from '../types/recruitment.types';

interface CandidateKanbanProps {
  candidates: Candidate[];
  onMoveStage: (id: string | number, newStage: string) => void;
  onViewCandidate: (candidate: Candidate) => void;
}

const STAGES = [
  { id: 'applied', label: 'Applied', color: '#64748b' },
  { id: 'screening', label: 'Screening', color: '#3b82f6' },
  { id: 'interview', label: 'Interview', color: '#8b5cf6' },
  { id: 'offer', label: 'Offer', color: '#10b981' },
  { id: 'hired', label: 'Hired', color: '#14b8a6' },
];

export const CandidateKanban: React.FC<CandidateKanbanProps> = ({ candidates, onViewCandidate }) => {
  const getCandidatesByStage = (stageId: string) => {
    return candidates.filter(c => (c.stage || 'applied').toLowerCase() === stageId.toLowerCase());
  };

  const renderRating = (rating: number = 0) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={12} className={`star ${s <= rating ? 'filled' : ''}`} fill={s <= rating ? 'currentColor' : 'none'} />
        ))}
      </div>
    );
  };

  return (
    <div className="kanban-board">
      {STAGES.map((stage) => {
        const stageCandidates = getCandidatesByStage(stage.id);
        return (
          <div key={stage.id} className="kanban-column">
            <div className="kanban-column-header">
              <div className="kanban-column-title" style={{ color: stage.color }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color }}></span>
                {stage.label}
              </div>
              <span className="kanban-column-count">{stageCandidates.length}</span>
            </div>

            <div className="kanban-list">
              {stageCandidates.map((candidate) => (
                <div key={candidate.id} className="kanban-card" onClick={() => onViewCandidate(candidate)}>
                  <div className="kanban-card-header">
                    <h4 className="kanban-card-name">{candidate.full_name}</h4>
                    <button className="btn-icon">
                      <MoreVertical size={14} color="#94a3b8" />
                    </button>
                  </div>
                  
                  <p className="kanban-card-job">
                    <span className="job-tag">{candidate.job_opening?.title || 'Unknown Position'}</span>
                  </p>

                  <div className="kanban-card-meta">
                    <div className="kanban-meta-item">
                      <MapPin size={12} />
                      <span>{candidate.source || 'Direct'}</span>
                    </div>
                    <div className="kanban-meta-item">
                      <Calendar size={12} />
                      <span>{new Date(candidate.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="kanban-card-footer">
                    {renderRating(candidate.rating)}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn-icon-sm"><Mail size={12} /></button>
                      <button className="btn-icon-sm"><Phone size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
