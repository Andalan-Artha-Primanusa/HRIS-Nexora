import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KpiCards } from '../components/KpiCards';
import { ChartsSection } from '../components/ChartsSection';
import { RecentActivity } from '../components/RecentActivity';
import './OverviewPage.css';

const OverviewPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="overview-page">
        <div className="page-header">
          <div>
            <h1 className="h2 page-title">Dashboard Overview</h1>
            <p className="page-subtitle text-gray">Welcome back, here's what's happening today.</p>
          </div>
          <div className="page-actions">
            <button className="ui-button ui-button--outline ui-button--md">Export Report</button>
            <button className="ui-button ui-button--primary ui-button--md">Run Payroll</button>
          </div>
        </div>

        <KpiCards />
        
        <ChartsSection />
        
        <div className="bottom-section">
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OverviewPage;
