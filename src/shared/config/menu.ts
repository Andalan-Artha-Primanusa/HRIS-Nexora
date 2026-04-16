import { 
  Users, CalendarDays, CreditCard, Receipt, Target, UserCircle, 
  FileBarChart, Settings, LayoutDashboard, Network, Briefcase, 
  FileText, Clock, Banknote, Database, ShieldCheck
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';
import type { AuthUser } from '@/shared/types/rbac.types';
import { RBACUtils } from '@/shared/hooks/rbac';

// 🔥 TYPE FINAL (NO any, NO active)
export type MenuItem = {
  label: string;
  icon?: LucideIcon;
  path?: string;
  subItems?: MenuItem[];
  requiredChecker?: (user: AuthUser | null) => boolean;
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
    requiredChecker: (user) => RBACUtils.isHR(user) || RBACUtils.isAdmin(user),
    subItems: [
      { label: 'Profiles', path: '/profiles' },
      { label: 'Employee List', path: '/employees' },
      { 
        label: 'Organization', 
        icon: Network,
        subItems: [
          { label: 'Directory', path: '/organization/directory' },
          { label: 'Summary', path: '/organization/summary' },
          { label: 'Org Chart', path: '/organization/chart' },
          { label: 'Team Members', path: '/organization/team' },
          { label: 'Master Data', path: '/organization/master-data' },
        ]
      },
      {
        label: 'Documents',
        icon: FileText,
        subItems: [
          { label: 'My Documents', path: '/my/documents' },
          { label: 'Review Queue', path: '/documents/review' },
          { label: 'Expiring Documents', path: '/documents/expiring' },
        ]
      }
    ]
  },
  {
    label: 'Attendance & Time Tracking',
    icon: Clock,
    subItems: [
      { label: 'Check In', path: '/attendance/check-in' },
      { label: 'Check Out', path: '/attendance/check-out' },
      { label: 'Today', path: '/attendance/today' },
      { label: 'History', path: '/attendance/history' },
      { label: 'Timesheet', path: '/attendance/timesheet' },
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
    requiredChecker: (user) => RBACUtils.isHR(user) || RBACUtils.isAdmin(user),
    subItems: [
      { label: 'Dashboard', path: '/payroll' },
      { label: 'Daftar Payroll', path: '/payroll/list' },
      { label: 'Kelola Payroll', path: '/payroll/crud' },
      { label: 'Generate Payroll', path: '/payroll/generate' },
      { label: 'Approve Payroll', path: '/payroll/approve' },
      { label: 'Pembayaran Payroll', path: '/payroll/payment' },
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
    label: 'Assets & Inventory',
    icon: Briefcase,
    requiredChecker: (user) => RBACUtils.isHR(user) || RBACUtils.isAdmin(user),
    subItems: [
      { label: 'Assets Registry', path: '/assets' },
      { label: 'Assignments', path: '/assets/assignments' },
      { label: 'My Assets', path: '/my/assets' },
    ]
  },
  {
    label: 'Reimbursement & Expense',
    icon: Receipt,
    requiredChecker: (user) => RBACUtils.isHR(user) || RBACUtils.isAdmin(user),
    subItems: [
      { label: 'Submit Expense', path: '/expense/submit' },
      { label: 'Expense List', path: '/expense/list' },
      { label: 'Approval', path: '/expense/approval' },
      { label: 'Categories', path: '/expense/categories' },
      { label: 'Reports', path: '/expense/reports' },
    ]
  },
  {
    label: 'Pelatihan & Kompetensi',
    icon: Target,
    requiredChecker: (user) =>
      RBACUtils.isManager(user) ||
      RBACUtils.isHR(user) ||
      RBACUtils.isAdmin(user) ||
      RBACUtils.isSuperAdmin(user),
    subItems: [
      { label: 'Program Pelatihan', path: '/training/programs' },
      { label: 'Pendaftaran Pelatihan', path: '/training/enrollments' },
      { label: 'Kompetensi', path: '/competencies' },
      { label: 'Pelatihan Saya', path: '/my/trainings' },
      { label: 'Kompetensi Saya', path: '/my/competencies' },
    ]
  },
  {
    label: 'HR Service Requests',
    icon: FileText,
    subItems: [
      { label: 'My Requests', path: '/my/requests' },
      { label: 'Requests Queue', path: '/requests' },
      { label: 'Request Assignment', path: '/requests/assign' },
      { label: 'Request Status Update', path: '/requests/status' },
    ]
  },
  {
    label: 'KPI & Performance',
    icon: Target,
    requiredChecker: (user) => RBACUtils.isManager(user) || RBACUtils.isHR(user) || RBACUtils.isAdmin(user) || RBACUtils.isSuperAdmin(user),
    subItems: [
      { label: 'KPI List', path: '/kpis' },
      { label: 'Create KPI', path: '/kpis/add' },
      { label: 'Performance Summary', path: '/performance/summary' },
      { label: 'Performance Cycles', path: '/performance/cycles' },
      { label: 'Performance Reviews', path: '/performance/reviews' },
      { label: 'OKRs', path: '/performance/okrs' },
      { label: '360 Reviews', path: '/performance/360-reviews' },
      { label: 'Calibration', path: '/performance/calibration' },
      { label: 'Career IDP', path: '/career/idps' },
      { label: 'Succession Matrix', path: '/career/succession' },
      { label: 'Engagement Surveys', path: '/engagement/surveys' },
      { label: 'Recruitment Openings', path: '/recruitment/openings' },
      { label: 'Workforce Holidays', path: '/workforce/holidays' },
      { label: 'Workforce Shift Swaps', path: '/workforce/shift-swaps' },
      { label: 'Workforce Overtime Rules', path: '/workforce/overtime-rules' },
      { label: 'Approval Flows', path: '/approval-flows' },
    ]
  },
  {
    label: 'Employee Self Service (ESS)',
    icon: UserCircle,
    subItems: [
      { label: 'My KPI', path: '/my/kpi' },
      { label: 'My Reimbursements', path: '/my/reimbursements' },
      { label: 'My Payroll', path: '/my/payroll' },
      { label: 'My Leaves', path: '/leave/my-leave' },
      { label: 'My Documents', path: '/my/documents' },
      { label: 'My Trainings', path: '/my/trainings' },
      { label: 'My Competencies', path: '/my/competencies' },
      { label: 'My Assets', path: '/my/assets' },
      { label: 'My Requests', path: '/my/requests' },
    ]
  },
  {
    label: 'Reports & Analytics',
    icon: FileBarChart,
    requiredChecker: (user) => RBACUtils.isManager(user) || RBACUtils.isHR(user) || RBACUtils.isAdmin(user),
    subItems: [
      { label: 'People Insights', path: '/insights/people/detailed' },
      { label: 'Dashboard Summary', path: '/reports/dashboard-summary' },
      { label: 'Attendance Report', path: '/reports/attendance' },
      { label: 'Leave Report', path: '/reports/leave' },
      { label: 'Payroll Report', path: '/reports/payroll' },
      { label: 'Competency Report', path: '/reports/competency' },
      { label: 'Employee Lifecycle', path: '/reports/employee-lifecycle' },
      { label: 'Asset Report', path: '/reports/assets' },
      { label: 'Custom Report', path: '/reports/custom' },
      { label: 'Compliance Overview', path: '/compliance/overview' },
      { label: 'Compliance Audit', path: '/compliance/audit-summary' },
      { label: 'Expiring Compliance Docs', path: '/compliance/expiring-documents' },
    ]
  },
  {
    label: 'Notifications',
    icon: Settings,
    subItems: [{ label: 'Notification Center', path: '/notifications' }],
  },
  {
    label: 'Admin Tools',
    icon: ShieldCheck,
    requiredChecker: (user) => RBACUtils.isAdmin(user) || RBACUtils.canViewUsers(user) || RBACUtils.canViewRoles(user) || RBACUtils.canViewPermissions(user),
    subItems: [
      { 
        label: 'Locations', 
        path: '/locations',
        requiredChecker: (user) => RBACUtils.hasPermission(user, 'location.view' as any)
      },
      { 
        label: 'Users', 
        path: '/admin/users',
        requiredChecker: (user) => RBACUtils.canViewUsers(user)
      },
      { 
        label: 'Roles', 
        path: '/admin/roles',
        requiredChecker: (user) => RBACUtils.canViewRoles(user)
      },
      { 
        label: 'Permissions', 
        path: '/admin/permissions',
        requiredChecker: (user) => RBACUtils.canViewPermissions(user)
      },
      {
        label: 'Admin Notifications',
        path: '/admin/notifications',
        requiredChecker: (user) => RBACUtils.isAdmin(user) || RBACUtils.isSuperAdmin(user),
      },
      {
        label: 'Email Notifications',
        path: '/admin/email-notifications',
        requiredChecker: (user) => RBACUtils.isAdmin(user) || RBACUtils.isSuperAdmin(user),
      },
      {
        label: 'Audit Logs',
        path: '/admin/audit-logs',
        requiredChecker: (user) => RBACUtils.isAdmin(user) || RBACUtils.isSuperAdmin(user),
      },
      {
        label: 'Import Center',
        path: '/admin/import',
        requiredChecker: (user) => RBACUtils.isAdmin(user) || RBACUtils.isSuperAdmin(user),
      },
      {
        label: 'Biometric Devices',
        path: '/admin/biometric-devices',
        requiredChecker: (user) => RBACUtils.isAdmin(user) || RBACUtils.isSuperAdmin(user),
      },
    ]
  },
  {
    label: 'Settings',
    icon: Settings,
    requiredChecker: (user) => RBACUtils.isAdmin(user),
    subItems: [
      { label: 'Company Settings', path: '/settings/company' },
      { label: 'User & Role Management', path: '/settings/user-role' },
      { label: 'Permissions', path: '/settings/permissions' },
      {
        label: 'Master Data',
        icon: Database,
        subItems: [
          { label: 'Leave Type', path: '/settings/master-data/leave-type' },
          { label: 'Expense Category', path: '/settings/master-data/expense-category' },
        ]
      },
      { label: 'Notification Settings', path: '/settings/notification' }
    ]
  }
];
