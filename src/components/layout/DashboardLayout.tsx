import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar collapsed={collapsed} />
      <div className="dashboard-main">
        <Header toggleSidebar={toggleSidebar} />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};
