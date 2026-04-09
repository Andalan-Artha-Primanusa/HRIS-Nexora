import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { FileText, PieChart, Users, ShieldCheck } from 'lucide-react';

const pathTitleMap: Record<string, { title: string; description: string }> = {
  '/employees': {
    title: 'Employee Management',
    description: 'Manage employee records, update details, and review team structure.',
  },
  '/employees/add': {
    title: 'Add Employee',
    description: 'Create a new employee record with personal details and position data.',
  },
  '/hr-summary': {
    title: 'HR Summary',
    description: 'High-level HR metrics, headcount, turnover, and workforce overview.',
  },
  '/analytics': {
    title: 'Analytics',
    description: 'Deep insights into HR performance, absence trends, and payroll activity.',
  },
  '/attendance': {
    title: 'Attendance Overview',
    description: 'Track daily attendance, shifts, and time logs for your employees.',
  },
  '/payroll': {
    title: 'Payroll Overview',
    description: 'Process payroll, review pay history, and verify salary calculations.',
  },
  '/settings/company': {
    title: 'Company Settings',
    description: 'Update company profile, policies, and HR system configuration.',
  },
  '/settings/user-role': {
    title: 'User & Role Management',
    description: 'Assign roles, manage permissions, and configure access for users.',
  },
};

const PlaceholderPage = () => {
  const location = useLocation();
  const path = location.pathname;
  const cleanPath = path.replace(/^\/dashboard/, '') || '/dashboard';

  const pageInfo = useMemo(() => {
    return pathTitleMap[cleanPath] || {
      title: cleanPath
        .replace(/\//g, ' ')
        .trim()
        .replace(/\b\w/g, (l) => l.toUpperCase()) || 'Dashboard Page',
      description: 'This page is under construction but the dashboard layout is ready for your content.',
    };
  }, [cleanPath]);

  return (
    <div className="overview-page">
      <div className="page-header">
        <div>
          <h1 className="h2 page-title">{pageInfo.title}</h1>
          <p className="page-subtitle text-gray">{pageInfo.description}</p>
        </div>
        <div className="page-actions">
          <button className="ui-button ui-button--outline ui-button--md">Request Access</button>
          <button className="ui-button ui-button--primary ui-button--md">View Reports</button>
        </div>
      </div>

      <div className="placeholder-grid">
        <Card className="placeholder-card" glass>
          <div className="placeholder-card-header">
            <ShieldCheck size={20} />
            <div>
              <h3>Security & access control</h3>
              <p>Protected routes and automatic token expiry handling keep your users safe.</p>
            </div>
          </div>
        </Card>

        <Card className="placeholder-card" glass>
          <div className="placeholder-card-header">
            <Users size={20} />
            <div>
              <h3>Fast HR workflows</h3>
              <p>Build employee onboarding, performance, and leave processes with ease.</p>
            </div>
          </div>
        </Card>

        <Card className="placeholder-card" glass>
          <div className="placeholder-card-header">
            <PieChart size={20} />
            <div>
              <h3>Rich analytics</h3>
              <p>Support dashboards, reports, and key HR metrics for better decisions.</p>
            </div>
          </div>
        </Card>

        <Card className="placeholder-card" glass>
          <div className="placeholder-card-header">
            <FileText size={20} />
            <div>
              <h3>Ready for content</h3>
              <p>Use this placeholder to connect actual HR modules and API endpoints.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PlaceholderPage;
