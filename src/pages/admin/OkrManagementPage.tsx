import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { OkrCard } from '@/features/performance/components/OkrCard';
import { performanceService } from '@/features/performance/api/performance.service';
import type { OKR } from '@/features/performance/types/performance.types';

const OkrManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await performanceService.getOkrs();
      setOkrs(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching OKRs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Performance</span>
          <h1>Objectives & Key Results (OKRs)</h1>
          <p>Align company goals and track progress across the organization.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary" onClick={() => navigate('/performance/okrs/create')}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            New OKR
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {okrs.map((okr) => (
          <div key={okr.id} onClick={() => navigate(`/performance/okrs/edit/${okr.id}`)} style={{ cursor: 'pointer' }}>
             <OkrCard okr={okr} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OkrManagementPage;

