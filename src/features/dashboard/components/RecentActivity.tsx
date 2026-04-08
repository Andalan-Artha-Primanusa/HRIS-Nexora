import React from 'react';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { MoreHorizontal } from 'lucide-react';
import './RecentActivity.css';

const activities = [
  { id: 1, user: 'Sarah Jenkins', action: 'Applied for Annual Leave', time: '10 mins ago', status: 'Pending', avatar: 'SJ' },
  { id: 2, user: 'Michael Chen', action: 'Uploaded Medical Certificate', time: '1 hour ago', status: 'Approved', avatar: 'MC' },
  { id: 3, user: 'Emily Davis', action: 'Updated Profile Information', time: '2 hours ago', status: 'Completed', avatar: 'ED' },
  { id: 4, user: 'James Wilson', action: 'Submitted Expense Claim', time: '3 hours ago', status: 'Pending', avatar: 'JW' },
  { id: 5, user: 'System', action: 'Generated Monthly Payroll Draft', time: '5 hours ago', status: 'System', avatar: 'SYS' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Approved':
    case 'Completed': return <Badge variant="success">{status}</Badge>;
    case 'Pending': return <Badge variant="warning">{status}</Badge>;
    case 'System': return <Badge variant="info">{status}</Badge>;
    default: return <Badge>{status}</Badge>;
  }
};

export const RecentActivity: React.FC = () => {
  return (
    <Card className="activity-card" glass>
      <div className="activity-header">
        <h3 className="activity-title">Recent Activity</h3>
        <Button variant="ghost" size="sm">View All</Button>
      </div>
      
      <div className="activity-list">
        {activities.map((item) => (
          <div key={item.id} className="activity-item">
            <div className="activity-avatar">{item.avatar}</div>
            <div className="activity-content">
              <div className="activity-main">
                <span className="activity-user">{item.user}</span>
                <span className="activity-action">{item.action}</span>
              </div>
              <div className="activity-meta">
                <span className="activity-time">{item.time}</span>
                {getStatusBadge(item.status)}
              </div>
            </div>
            <button className="icon-button-small">
              <MoreHorizontal size={16} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};

