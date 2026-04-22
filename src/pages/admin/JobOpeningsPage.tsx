import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Search, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { recruitmentService } from '@/features/recruitment/api/recruitment.service';
import type { JobOpening } from '@/features/recruitment/types/recruitment.types';
import { JobOpeningTable } from '@/features/recruitment/components/JobOpeningTable';
import '@/features/recruitment/Recruitment.css';

const JobOpeningsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await recruitmentService.getJobOpenings();
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching job openings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (job: JobOpening) => {
    navigate(`/recruitment/openings/edit/${job.id}`);
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await recruitmentService.deleteJobOpening(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Recruitment</span>
          <h1>Job Openings</h1>
          <p>Manage career opportunities and job postings.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary" onClick={() => navigate('/recruitment/openings/create')}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            Post New Job
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
              placeholder="Search jobs..." 
              style={{ paddingLeft: '40px', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <JobOpeningTable 
          items={filteredItems}
          onView={() => {}}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>
    </div>
  );
};



export default JobOpeningsPage;
