import React, { useState, useEffect } from 'react';
import { Users, Plus, Send } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { performanceService } from '@/features/performance/api/performance.service';
import '@/shared/styles/CrudPage.css';

const Review360Page: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await performanceService.get360Reviews();
        setReviews(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Performance</span>
          <h1>360-Degree Feedback</h1>
          <p>Multi-rater feedback from peers, subordinates, and managers for a holistic view.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="primary">
            <Plus size={18} style={{ marginRight: '8px' }} />
            Start New Cycle
          </Button>
        </div>
      </div>

      <Card glass style={{ padding: '1.5rem' }}>
        <div className="crud-table-wrap">
          <table className="crud-table">
            <thead>
              <tr>
                <th>Subject Employee</th>
                <th>Cycle Period</th>
                <th>Status</th>
                <th>Feeders (Completed)</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>Loading reviews...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>No active 360 review cycles.</td></tr>
              ) : reviews.map((review) => (
                <tr key={review.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{review.employee?.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{review.employee?.designation}</div>
                  </td>
                  <td>{review.period}</td>
                  <td>
                    <span className={`status-pill status-${review.status}`}>{review.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', width: '80px' }}>
                          <div style={{ width: '60%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                       </div>
                       <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>3 / 5</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button variant="ghost" size="sm">
                        <Users size={16} style={{ marginRight: '4px' }} /> Feeders
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Send size={16} style={{ marginRight: '4px' }} /> Remind
                      </Button>
                      <Button variant="primary" size="sm">Report</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Review360Page;
