import {
  LayoutDashboard, Users, Clock, CalendarDays, Banknote, Receipt,
  Target, Award, GraduationCap, Briefcase, ArrowUpRight,
  ShieldCheck, FileBarChart, Database, Settings, Bell, ClipboardCheck,
  MapPin, Building2, Workflow, FileText
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export type MenuItem = {
  label: string;
  icon?: LucideIcon;
  path?: string;
  menuKey?: string;
  subItems?: MenuItem[];
};

export const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    menuKey: 'dashboard',
  },
  {
    label: 'Workforce',
    icon: Users,
    menuKey: 'workforce',
    subItems: [
      { label: 'Employees', path: '/employees', menuKey: 'workforce.employees' },
      { label: 'Attendance', path: '/attendance', menuKey: 'workforce.attendance' },
      { label: 'Leave', path: '/leave/requests', menuKey: 'workforce.leave' },
      { label: 'Overtime', path: '/attendance/overtime', menuKey: 'workforce.overtime' },
    ],
  },
  {
    label: 'Compensation',
    icon: Banknote,
    menuKey: 'compensation',
    subItems: [
      { label: 'Payroll', path: '/payroll', menuKey: 'compensation.payroll' },
      { label: 'Reimbursement', path: '/reimbursements', menuKey: 'compensation.reimbursement' },
    ],
  },
  {
    label: 'Performance & Development',
    icon: Target,
    menuKey: 'performance-dev',
    subItems: [
      { label: 'KPI', path: '/kpis', menuKey: 'performance-dev.kpi' },
      { label: 'Calibration', path: '/performance/calibration', menuKey: 'performance-dev.calibration' },
      { label: 'Training', path: '/training/programs', menuKey: 'performance-dev.training' },
      { label: 'Competency', path: '/competencies', menuKey: 'performance-dev.competency' },
    ],
  },
  {
    label: 'Assets',
    icon: Briefcase,
    path: '/assets',
    menuKey: 'assets',
  },
  {
    label: 'Approval Center',
    icon: ClipboardCheck,
    path: '/approval-flows',
    menuKey: 'approval-center',
  },
  {
    label: 'Reports',
    icon: FileBarChart,
    path: '/reports/dashboard-summary',
    menuKey: 'reports',
  },
  {
    label: 'Administration',
    icon: Settings,
    menuKey: 'admin',
    subItems: [
      {
        label: 'Organization',
        subItems: [
          { label: 'Company', path: '/settings/company', menuKey: 'admin.company' },
          { label: 'Departments', path: '/organization/master-data', menuKey: 'admin.departments' },
          { label: 'Positions', path: '/organization/master-data', menuKey: 'admin.positions' },
          { label: 'Locations', path: '/locations', menuKey: 'admin.locations' },
        ],
      },
      {
        label: 'Access Management',
        subItems: [
          { label: 'Users', path: '/admin/users', menuKey: 'admin.users' },
          { label: 'Roles & Permissions', path: '/admin/roles', menuKey: 'admin.roles' },
          { label: 'Permissions', path: '/admin/permissions', menuKey: 'admin.permissions' },
        ],
      },
      {
        label: 'System',
        subItems: [
          { label: 'Approval Workflow', path: '/approval-flows', menuKey: 'admin.approval-workflow' },
          { label: 'Audit Logs', path: '/admin/audit-logs', menuKey: 'admin.audit-logs' },
          { label: 'Notification Settings', path: '/settings/notifications', menuKey: 'admin.notification-settings' },
          { label: 'Work Schedules', path: '/work-schedules', menuKey: 'admin.work-schedules' },
        ],
      },
    ],
  },
];

export const essMenuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/employee-dashboard',
    menuKey: 'employee-dashboard',
  },
  {
    label: 'My Profile',
    icon: Users,
    path: '/profiles',
    menuKey: 'ess.profile',
  },
  {
    label: 'Attendance',
    icon: Clock,
    menuKey: 'ess.attendance',
    subItems: [
      { label: 'Check In', path: '/attendance/check-in', menuKey: 'ess.attendance.check-in' },
      { label: 'Check Out', path: '/attendance/check-out', menuKey: 'ess.attendance.check-out' },
      { label: 'History', path: '/attendance/history', menuKey: 'ess.attendance.history' },
    ],
  },
  {
    label: 'Leave',
    icon: CalendarDays,
    path: '/leave/my-leave',
    menuKey: 'ess.leave',
  },
  {
    label: 'Overtime',
    icon: Clock,
    path: '/my/overtime',
    menuKey: 'ess.overtime',
  },
  {
    label: 'Reimbursement',
    icon: Receipt,
    path: '/my/reimbursements',
    menuKey: 'ess.reimbursement',
  },
  {
    label: 'Payslip',
    icon: Banknote,
    path: '/my/payroll',
    menuKey: 'ess.payslip',
  },
  {
    label: 'My KPI',
    icon: Target,
    path: '/my/kpi',
    menuKey: 'ess.kpi',
  },
  {
    label: 'Training',
    icon: GraduationCap,
    path: '/my/trainings',
    menuKey: 'ess.training',
  },
  {
    label: 'Competency',
    icon: Award,
    path: '/my/competencies',
    menuKey: 'ess.competency',
  },
  {
    label: 'My Assets',
    icon: Briefcase,
    path: '/my/assets',
    menuKey: 'ess.assets',
  },
  {
    label: 'Notifications',
    icon: Bell,
    path: '/notifications',
    menuKey: 'ess.notifications',
  },
];
