import React from 'react';
import { Card } from '@/components/ui/Card';
import { Users, UserCheck, CalendarOff, Clock, CreditCard, TrendingDown } from 'lucide-react';
import './KpiCards.css';

const kpiData = [
  { title: 'Total Employees', value: '254', trend: '+2 new this month', icon: Users, color: 'blue' },
  { title: 'Present Today', value: '240', trend: '94% attendance rate', icon: UserCheck, color: 'green' },
  { title: 'On Leave', value: '12', trend: '3 pending requests', icon: CalendarOff, color: 'orange' },
  { title: 'Pending Approvals', value: '8', trend: 'Requires action', icon: Clock, color: 'red' },
  { title: 'Payroll Status', value: 'Processed', trend: 'Next: 25th Apr', icon: CreditCard, color: 'purple' },
  { title: 'Turnover Rate', value: '2.4%', trend: '-0.5% vs last year', icon: TrendingDown, color: 'teal' },
];

export const KpiCards: React.FC = () => {
  return (
    <div className="kpi-grid">
      {kpiData.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card key={idx} className="kpi-card" glass>
            <div className="kpi-content">
              <div className="kpi-info">
                <p className="kpi-title">{kpi.title}</p>
                <h3 className="kpi-value">{kpi.value}</h3>
              </div>
              <div className={`kpi-icon-wrapper color-${kpi.color}`}>
                <Icon size={24} />
              </div>
            </div>
            <p className="kpi-trend">{kpi.trend}</p>
          </Card>
        );
      })}
    </div>
  );
};
