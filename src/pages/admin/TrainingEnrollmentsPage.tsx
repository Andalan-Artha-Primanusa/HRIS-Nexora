import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, GraduationCap, Calendar, Users, Search, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { trainingService } from '@/features/training/api/training.service';
import '@/shared/styles/CrudPage.css';

const TrainingEnrollmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await trainingService.getEnrollments();
      const enrollmentsArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setEnrollments(enrollmentsArray);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { icon: CheckCircle, color: '#10b981' };
      case 'in_progress': case 'ongoing': return { icon: Clock, color: '#f59e0b' };
      case 'cancelled': case 'dropped': return { icon: XCircle, color: '#ef4444' };
      default: return { icon: Clock, color: '#64748b' };
    }
  };

  const activeEnrollments = enrollments.filter(e => e.status === 'in_progress' || e.status === 'ongoing');
  const completedEnrollments = enrollments.filter(e => e.status === 'completed');

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">L&D</span>
          <h1>Training Enrollments</h1>
          <p>Track employee enrollment and completion status.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Total Enrollments</span>
              <p className="summary-card__subtitle">All enrollments</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <Users size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{enrollments.length}</div>
          <div className="summary-card__change">Total enrolled</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">In Progress</span>
              <p className="summary-card__subtitle">Active trainings</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <Clock size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">{activeEnrollments.length}</div>
          <div className="summary-card__change">Ongoing</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Completed</span>
              <p className="summary-card__subtitle">Finished trainings</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <CheckCircle size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{completedEnrollments.length}</div>
          <div className="summary-card__change">Completed</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar Enrollments</h3>
              <span className="wuw-count-badge">{enrollments.length} Total</span>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Search enrollments..." />
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading enrollments...</div>
          ) : enrollments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>No enrollments found.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {enrollments.map((enrollment) => {
                const statusStyle = getStatusStyle(enrollment.status);
                const StatusIcon = statusStyle.icon;
                return (
                  <Card key={enrollment.id} glass style={{ padding: '1.5rem', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
                          {enrollment.program?.title || enrollment.training_title || 'Training'}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                          {enrollment.employee?.user?.name || enrollment.employee_name || 'Employee'}
                        </p>
                      </div>
                      <div style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, background: statusStyle.color + '20', color: statusStyle.color }}>
                        <StatusIcon size={12} style={{ marginRight: '4px' }} />
                        {enrollment.status || 'Pending'}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      <div>Start: {enrollment.start_date || 'N/A'}</div>
                      {enrollment.completion_date && <div>Completed: {enrollment.completion_date}</div>}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingEnrollmentsPage;