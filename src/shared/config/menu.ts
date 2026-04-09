import { 
  Users, CalendarDays, CreditCard, Receipt, Target, UserCircle, 
  FileBarChart, Settings, LayoutDashboard, Network, Briefcase, 
  FileText, Clock, Banknote, Database
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

// 🔥 TYPE FINAL (NO any, NO active)
export type MenuItem = {
  label: string;
  icon?: LucideIcon;
  path?: string;
  subItems?: MenuItem[];
};

// 🔥 MENU FINAL (rapi + scalable)
export const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    subItems: [
      { label: 'Overview', path: '/dashboard' },
      { label: 'HR Summary', path: '/hr-summary' },
      { label: 'Analytics', path: '/analytics' },
    ]
  },
  {
    label: 'Employee Management',
    icon: Users,
    subItems: [
      { label: 'Employee List', path: '/employees' },
      { label: 'Add Employee', path: '/employees/add' },
      { 
        label: 'Organization', 
        icon: Network,
        subItems: [
          { label: 'Department', path: '/organization/department' },
          { label: 'Position', path: '/organization/position' },
        ]
      },
      {
        label: 'Employment',
        icon: Briefcase,
        subItems: [
          { label: 'Status', path: '/employment/status' },
          { label: 'Salary History', path: '/employment/salary-history' },
        ]
      },
      {
        label: 'Documents',
        icon: FileText,
        subItems: [
          { label: 'KTP', path: '/documents/ktp' },
          { label: 'Contract', path: '/documents/contract' },
          { label: 'Other Files', path: '/documents/others' },
        ]
      }
    ]
  },
  {
    label: 'Attendance & Time Tracking',
    icon: Clock,
    subItems: [
      { label: 'Overview', path: '/attendance' },
      { label: 'Check In', path: '/attendance/check-in' },
      { label: 'Check Out', path: '/attendance/check-out' },
      { label: 'Today', path: '/attendance/today' },
      { label: 'History', path: '/attendance/history' },
      { label: 'Daily Attendance', path: '/attendance/daily' },
      { label: 'Timesheet', path: '/attendance/timesheet' },
      { label: 'Shift Management', path: '/attendance/shifts' },
      { label: 'Overtime', path: '/attendance/overtime' },
      { label: 'Reports', path: '/attendance/reports' },
    ]
  },
  {
    label: 'Leave Management',
    icon: CalendarDays,
    subItems: [
      { label: 'Leave Requests', path: '/leave/requests' },
      { label: 'My Leave', path: '/leave/my-leave' },
      { label: 'Approval', path: '/leave/approval' },
      { label: 'Leave Calendar', path: '/leave/calendar' },
      { label: 'Leave Balance', path: '/leave/balance' },
      { label: 'Leave Type', path: '/leave/type' },
      { label: 'Leave Policy', path: '/leave/policy' },
    ]
  },
  {
    label: 'Payroll & Payslip',
    icon: Banknote,
    subItems: [
      { label: 'Overview', path: '/payroll' },
      { label: 'Run Payroll', path: '/payroll/run' },
      { label: 'Payslip', path: '/payroll/payslip' },
      {
        label: 'Salary Component',
        icon: CreditCard,
        subItems: [
          { label: 'Allowance', path: '/payroll/component/allowance' },
          { label: 'Deduction', path: '/payroll/component/deduction' },
        ]
      },
      { label: 'Tax & BPJS', path: '/payroll/tax' },
      { label: 'Reports', path: '/payroll/reports' },
    ]
  },
  {
    label: 'Reimbursement & Expense',
    icon: Receipt,
    subItems: [
      { label: 'Submit Expense', path: '/expense/submit' },
      { label: 'Expense List', path: '/expense/list' },
      { label: 'Approval', path: '/expense/approval' },
      { label: 'Categories', path: '/expense/categories' },
      { label: 'Reports', path: '/expense/reports' },
    ]
  },
  {
    label: 'KPI & Performance',
    icon: Target,
    subItems: [
      { label: 'Overview', path: '/performance' },
      { label: 'Goals / Target', path: '/performance/goals' },
      { label: 'Performance Review', path: '/performance/review' },
      { label: 'Appraisal', path: '/performance/appraisal' },
      { label: 'Feedback', path: '/performance/feedback' },
    ]
  },
  {
    label: 'Employee Self Service (ESS)',
    icon: UserCircle,
    subItems: [
      { label: 'My Profile', path: '/ess/profile' },
      { label: 'My Attendance', path: '/ess/attendance' },
      { label: 'My Leave', path: '/ess/leave' },
      { label: 'My Payslip', path: '/ess/payslip' },
      { label: 'My Requests', path: '/ess/requests' },
    ]
  },
  {
    label: 'Reports & Analytics',
    icon: FileBarChart,
    subItems: [
      { label: 'Employee Report', path: '/reports/employee' },
      { label: 'Attendance Report', path: '/reports/attendance' },
      { label: 'Leave Report', path: '/reports/leave' },
      { label: 'Payroll Report', path: '/reports/payroll' },
      { label: 'Custom Report', path: '/reports/custom' },
    ]
  },
  {
    label: 'Settings',
    icon: Settings,
    subItems: [
      { label: 'Company Settings', path: '/settings/company' },
      { label: 'User & Role Management', path: '/settings/user-role' },
      { label: 'Permissions', path: '/settings/permissions' },
      {
        label: 'Master Data',
        icon: Database,
        subItems: [
          { label: 'Department', path: '/settings/master-data/department' },
          { label: 'Position', path: '/settings/master-data/position' },
          { label: 'Leave Type', path: '/settings/master-data/leave-type' },
          { label: 'Expense Category', path: '/settings/master-data/expense-category' },
        ]
      },
      { label: 'Notification Settings', path: '/settings/notification' },
      { label: 'System Logs', path: '/settings/logs' }
    ]
  }
];