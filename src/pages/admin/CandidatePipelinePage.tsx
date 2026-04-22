import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Filter } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { recruitmentService } from '@/features/recruitment/api/recruitment.service';
import '@/shared/styles/CrudPage.css';
import type { Candidate } from '@/features/recruitment/types/recruitment.types';
import { CandidateKanban } from '@/features/recruitment/components/CandidateKanban';
import { CandidateDetailModal } from '@/features/recruitment/components/CandidateDetailModal';
import '@/features/recruitment/Recruitment.css';

const CandidatePipelinePage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await recruitmentService.getCandidates();
      setCandidates(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMoveStage = async (id: string | number, newStage: string) => {
    try {
      await recruitmentService.moveCandidateStage(id, newStage);
      fetchData();
    } catch (error) {
      console.error('Error moving stage:', error);
    }
  };

  const handleViewCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedCandidate) return;
    try {
      await recruitmentService.updateCandidate(selectedCandidate.id, { status: status as any });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="recruitment-container">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Recruitment</span>
          <h1>Candidate Pipeline</h1>
          <p>Track and manage candidates through the recruitment stages.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search candidates..." 
              style={{ paddingLeft: '40px', width: '250px' }}
            />
          </div>
          <Button variant="outline">
            <Filter size={18} style={{ marginRight: '8px' }} />
            Filter
          </Button>
        </div>
      </div>

      <CandidateKanban 
        candidates={candidates}
        onMoveStage={handleMoveStage}
        onViewCandidate={handleViewCandidate}
      />

      <CandidateDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidate={selectedCandidate}
        onUpdateStatus={handleUpdateStatus}
        onScheduleInterview={() => {}}
        onMakeOffer={() => {}}
      />
    </div>
  );
};


export default CandidatePipelinePage;
