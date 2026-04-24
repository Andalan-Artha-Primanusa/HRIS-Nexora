import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, GraduationCap, Calendar, Users, Search, CheckCircle, Clock, XCircle, User, BookOpen, TrendingUp } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { trainingService } from '@/features/training/api/training.service';
import '@/shared/styles/CrudPage.css';
import './TrainingEnrollmentsPage.css';

const TrainingEnrollmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = 
      e.program?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.employee?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.employee_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const completedCount = enrollments.filter(e => e.status === 'completed').length;
  const inProgressCount = enrollments.filter(e => e.status === 'in_progress' || e.status === 'ongoing').length;
  const pendingCount = enrollments.filter(e => e.status === 'pending').length;

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { icon: CheckCircle, color: '#10b981', bg: '#ecfdf5', label: 'Completed' };
      case 'in_progress': case 'ongoing': return { icon: Clock, color: '#f59e0b', bg: '#fffbeb', label: 'In Progress' };
      case 'cancelled': case 'dropped': return { icon: XCircle, color: '#ef4444', bg: '#fef2f2', label: 'Cancelled' };
      case 'pending': return { icon: Clock, color: '#64748b', bg: '#f1f5f9', label: 'Pending' };
      default: return { icon: Clock, color: '#64748b', bg: '#f1f5f9', label: status || 'Unknown' };
    }
  };

  const statusFilters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="crud-page enrollments-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">L&D</span>
          <h1>Training Enrollments</h1>
          <p>Track and manage employee training enrollments and progress.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button variant="primary" size="md">
            <Plus size={16} />
            Enroll Employee
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
          <div className="summary-card__change">Enrollments</div>
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
          <div className="summary-card__value summary-card__value--orange">{inProgressCount}</div>
          <div className="summary-card__change">Ongoing</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Completed</span>
              <p className="summary-card__subtitle">Finished</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <CheckCircle size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{completedCount}</div>
          <div className="summary-card__change">Completed</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Enrollment List</h3>
              <span className="wuw-count-badge">{filteredEnrollments.length} enrollments</span>
            </div>
            <div className="header-actions">
              <div className="search-box">
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Search enrollments..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="status-filters">
            {statusFilters.map(filter => (
              <button
                key={filter.key}
                className={`status-filter ${statusFilter === filter.key ? 'active' : ''}`}
                onClick={() => setStatusFilter(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="wuw-table-area">
          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="animate-spin" />
              <p>Loading enrollments...</p>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <GraduationCap size={48} />
              </div>
              <h4>No enrollments found</h4>
              <p>Enroll employees in training programs to get started.</p>
            </div>
          ) : (
            <div className="enrollment-grid">
              {filteredEnrollments.map((enrollment) => {
                const statusStyle = getStatusStyle(enrollment.status);
                const StatusIcon = statusStyle.icon;
                return (
                  <Card key={enrollment.id} className="enrollment-card" glass>
                    <div className="enrollment-header">
                      <div className="enrollment-icon">
                        <BookOpen size={20} />
                      </div>
                      <div className="enrollment-info">
                        <h4>{enrollment.program?.title || enrollment.training_title || 'Training Program'}</h4>
                        <div className="enrollment-employee">
                          <User size={14} />
                          <span>{enrollment.employee?.user?.name || enrollment.employee_name || 'Employee'}</span>
                        </div>
                      </div>
                      <span 
                        className="enrollment-status"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                      >
                        <StatusIcon size={12} />
                        {statusStyle.label}
                      </span>
                    </div>
                    
                    <div className="enrollment-details">
                      <div className="detail-item">
                        <Calendar size={14} />
                        <span>Start: {enrollment.start_date || 'N/A'}</span>
                      </div>
                      {enrollment.completion_date && (
                        <div className="detail-item">
                          <CheckCircle size={14} />
                          <span>Completed: {enrollment.completion_date}</span>
                        </div>
                      )}
                      {enrollment.progress !== undefined && (
                        <div className="progress-item">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                          <span className="progress-text">{enrollment.progress}%</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="enrollment-actions">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
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