import React from 'react';
import clsx from 'clsx';
import { 
  Building2, 
  Users, 
  CalendarClock, 
  CalendarDays, 
  CreditCard,
  Receipt,
  Target,
  UserCircle,
  FileBarChart,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
}

const menuGroups = [
  {
    title: 'Dashboard',
    items: [
      { label: 'Overview', icon: LayoutDashboard, path: '/', active: true },
    ]
  },
  {
    title: 'Management',
    items: [
      { label: 'Employee', icon: Users, path: '/employees' },
      { label: 'Attendance', icon: CalendarClock, path: '/attendance' },
      { label: 'Leave', icon: CalendarDays, path: '/leave' },
    ]
  },
  {
    title: 'Finance',
    items: [
      { label: 'Payroll', icon: CreditCard, path: '/payroll' },
      { label: 'Reimbursement', icon: Receipt, path: '/reimbursement' },
    ]
  },
  {
    title: 'Performance',
    items: [
      { label: 'KPI & Goals', icon: Target, path: '/kpi' },
    ]
  },
  {
    title: 'ESS & Reports',
    items: [
      { label: 'Self Service', icon: UserCircle, path: '/ess' },
      { label: 'Reports', icon: FileBarChart, path: '/reports' },
    ]
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', icon: Settings, path: '/settings' },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  return (
    <aside className={clsx('dashboard-sidebar', collapsed && 'collapsed')}>
      <div className="sidebar-logo">
        <Building2 className="logo-icon text-primary" size={28} />
        {!collapsed && <span className="logo-text">HRIS Pro</span>}
      </div>
      
      <div className="sidebar-menu-container">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="sidebar-menu-group">
            {!collapsed && <div className="menu-group-title">{group.title}</div>}
            
            <ul className="menu-list">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <li key={itemIdx} className="menu-item-wrapper">
                    <a 
                      href={item.path} 
                      className={clsx('menu-item', item.active && 'active', collapsed && 'collapsed')}
                      title={collapsed ? item.label : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.path === '/') window.location.href = '/';
                      }}
                    >
                      <Icon size={20} className="menu-icon" />
                      {!collapsed && <span className="menu-label">{item.label}</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
};
