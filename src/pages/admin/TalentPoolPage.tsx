import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, UserMinus } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { recruitmentService } from '@/features/recruitment/api/recruitment.service';
import '@/shared/styles/CrudPage.css';
import type { Candidate } from '@/features/recruitment/types/recruitment.types';
import '@/features/recruitment/Recruitment.css';

const TalentPoolPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await recruitmentService.getTalentPool();
      setCandidates(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching talent pool:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCandidates = candidates.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Recruitment</span>
          <h1>Talent Pool</h1>
          <p>Database of archived candidates for future opportunities.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      <Card className="crud-card" glass style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search talent pool..." 
              style={{ paddingLeft: '40px', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="crud-table-wrap">
          <table className="crud-table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Last Position Applied</th>
                <th>Source</th>
                <th>Archived Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No candidates in talent pool.</td>
                </tr>
              ) : (
                filteredCandidates.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.email}</div>
                    </td>
                    <td>{c.job_opening?.title || 'N/A'}</td>
                    <td>{c.source}</td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                       <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TalentPoolPage;
