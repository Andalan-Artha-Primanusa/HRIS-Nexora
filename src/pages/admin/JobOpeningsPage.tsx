import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { recruitmentService } from '@/features/recruitment/api/recruitment.service';
import type { JobOpening } from '@/features/recruitment/types/recruitment.types';
import { JobOpeningTable } from '@/features/recruitment/components/JobOpeningTable';
import '@/features/recruitment/Recruitment.css';

const JobOpeningsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<JobOpening | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const filteredItems = items.filter(item => {
    const title = String(item?.title || '').toLowerCase();
    const department = String(item?.department || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || department.includes(query);
  });

  const handleEdit = (job: JobOpening) => {
    navigate(`/recruitment/openings/edit/${job.id}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await recruitmentService.deleteJobOpening(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting job:', error);
    } finally {
      setDeleting(false);
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
          onDelete={(id) => setDeleteTarget(items.find((item) => String(item.id) === String(id)) || null)}
        />
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Lowongan"
        message={`Lowongan "${deleteTarget?.title || 'ini'}" akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};



export default JobOpeningsPage;
