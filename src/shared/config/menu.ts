import {
  Award,
  Banknote,
  Bell,
  Briefcase,
  CalendarDays,
  ClipboardCheck,
  Clock,
  CreditCard,
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Gift,
  GraduationCap,
  Home,
  LayoutDashboard,
  ListChecks,
  MapPin,
  MinusCircle,
  QrCode,
  Receipt,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type MenuItem = {
  label: string;
  icon?: LucideIcon;
  path?: string;
  menuKey?: string;
  subItems?: MenuItem[];
};

export const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    menuKey: "dashboard",
    subItems: [
      { label: "Overview", icon: Home, path: "/dashboard", menuKey: "dashboard.overview" },
      { label: "Custom Dashboard", icon: SlidersHorizontal, path: "/dashboard/custom", menuKey: "dashboard.custom" },
    ],
  },
  {
    label: "Workforce",
    icon: Users,
    menuKey: "workforce",
    subItems: [
      { label: "Employees", icon: Users, path: "/employees", menuKey: "workforce.employees" },
      { label: "Attendance", icon: Clock, path: "/attendance", menuKey: "workforce.attendance" },
      { label: "QR Generator", icon: QrCode, path: "/attendance/qr-generator", menuKey: "workforce.attendance.qr-generator" },
      { label: "Patrol Scan", icon: ShieldCheck, path: "/patrol/scan", menuKey: "workforce.patrol.scan" },
      { label: "Patrol Monitor", icon: ListChecks, path: "/patrol/monitor", menuKey: "workforce.patrol.monitor" },
      { label: "Leave", icon: CalendarDays, path: "/leave/requests", menuKey: "workforce.leave" },
      { label: "Overtime", icon: Clock, path: "/attendance/overtime", menuKey: "workforce.overtime" },
    ],
  },
  {
    label: "Compensation",
    icon: Banknote,
    menuKey: "compensation",
    subItems: [
      {
        label: "Payroll",
        icon: Wallet,
        menuKey: "compensation.payroll",
        subItems: [
          { label: "Ringkasan", icon: LayoutDashboard, path: "/payroll", menuKey: "compensation.payroll" },
          {
            label: "Proses Payroll",
            icon: ListChecks,
            menuKey: "compensation.payroll",
            subItems: [
              { label: "Generate Payroll", icon: Zap, path: "/payroll/process/generate", menuKey: "compensation.payroll" },
              { label: "Persetujuan", icon: ShieldCheck, path: "/payroll/process/approval", menuKey: "compensation.payroll" },
              { label: "Pembayaran", icon: CreditCard, path: "/payroll/process/payment", menuKey: "compensation.payroll" },
            ],
          },
          { label: "Daftar Payroll", icon: FileSpreadsheet, path: "/payroll/list", menuKey: "compensation.payroll" },
          {
            label: "Komponen Gaji",
            icon: SlidersHorizontal,
            menuKey: "compensation.payroll",
            subItems: [
              { label: "Tunjangan", icon: Gift, path: "/payroll/component/allowance", menuKey: "compensation.payroll" },
              { label: "Potongan", icon: MinusCircle, path: "/payroll/component/deduction", menuKey: "compensation.payroll" },
            ],
          },
          { label: "Laporan", icon: FileBarChart, path: "/payroll/reports", menuKey: "compensation.payroll" },
        ],
      },
      { label: "Reimbursement", icon: Receipt, path: "/reimbursements", menuKey: "compensation.reimbursement" },
    ],
  },
  {
    label: "Performance & Development",
    icon: Target,
    menuKey: "performance-dev",
    subItems: [
      { label: "KPI", icon: Target, path: "/kpis", menuKey: "performance-dev.kpi" },
      { label: "Calibration", icon: ShieldCheck, path: "/performance/calibration", menuKey: "performance-dev.calibration" },
      { label: "Training", icon: GraduationCap, path: "/training/programs", menuKey: "performance-dev.training" },
      { label: "Competency", icon: Award, path: "/competencies", menuKey: "performance-dev.competency" },
    ],
  },
  {
    label: "Assets",
    icon: Briefcase,
    path: "/assets",
    menuKey: "assets",
  },
  {
    label: "Approval Center",
    icon: ClipboardCheck,
    path: "/approval-flows",
    menuKey: "approval-center",
  },
  {
    label: "Reports",
    icon: FileBarChart,
    path: "/reports/dashboard-summary",
    menuKey: "reports",
  },
  {
    label: "Administration",
    icon: Settings,
    menuKey: "admin",
    subItems: [
      {
        label: "Organization",
        subItems: [
          { label: "Companies", icon: Briefcase, path: "/companies", menuKey: "admin.companies" },
          { label: "Company Setting", icon: Settings, path: "/settings/company", menuKey: "admin.company" },
          { label: "Departments", icon: Users, path: "/organization/master-data/departments", menuKey: "admin.departments" },
          { label: "Positions", icon: Award, path: "/organization/master-data/positions", menuKey: "admin.positions" },
          { label: "Locations", icon: MapPin, path: "/locations", menuKey: "admin.locations" },
        ],
      },
      {
        label: "Access Management",
        subItems: [
          { label: "Users", icon: Users, path: "/admin/users", menuKey: "admin.users" },
          { label: "Roles & Permissions", icon: ShieldCheck, path: "/admin/roles", menuKey: "admin.roles" },
          { label: "Permissions", icon: ClipboardCheck, path: "/admin/permissions", menuKey: "admin.permissions" },
          { label: "Menu Access", icon: ListChecks, path: "/admin/menu-permissions", menuKey: "admin.menu-permissions" },
        ],
      },
      {
        label: "System",
        subItems: [
          { label: "Approval Workflow", icon: ClipboardCheck, path: "/approval-flows", menuKey: "admin.approval-workflow" },
          { label: "Audit Logs", icon: FileText, path: "/admin/audit-logs", menuKey: "admin.audit-logs" },
          { label: "Import Center", icon: FileSpreadsheet, path: "/admin/import", menuKey: "admin.import" },
          { label: "Admin Notifications", icon: Bell, path: "/admin/notifications", menuKey: "admin.notifications" },
          { label: "Send Email", icon: Bell, path: "/admin/notifications/email-send", menuKey: "admin.email-send" },
          { label: "Email Logs", icon: FileText, path: "/admin/notifications/email-logs", menuKey: "admin.email-logs" },
          { label: "Notification Settings", icon: Settings, path: "/settings/notifications", menuKey: "admin.notification-settings" },
          { label: "Work Schedules", icon: Clock, path: "/work-schedules", menuKey: "admin.work-schedules" },
        ],
      },
    ],
  },
];

export const essMenuItems: MenuItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/employee-dashboard",
    menuKey: "employee-dashboard",
  },
  {
    label: "My Profile",
    icon: Users,
    path: "/my/profile",
    menuKey: "ess.profile",
  },
  {
    label: "Attendance",
    icon: Clock,
    menuKey: "ess.attendance",
    subItems: [
      { label: "QR Check In", icon: QrCode, path: "/attendance/check-in", menuKey: "ess.attendance.check-in" },
      { label: "QR Check Out", icon: QrCode, path: "/attendance/check-out", menuKey: "ess.attendance.check-out" },
      { label: "Patrol Scan", icon: ShieldCheck, path: "/patrol/scan", menuKey: "ess.attendance.patrol" },
      { label: "History", icon: ListChecks, path: "/attendance/history", menuKey: "ess.attendance.history" },
    ],
  },
  {
    label: "Leave",
    icon: CalendarDays,
    path: "/leave/my-leave",
    menuKey: "ess.leave",
  },
  {
    label: "Overtime",
    icon: Clock,
    path: "/my/overtime",
    menuKey: "ess.overtime",
  },
  {
    label: "Reimbursement",
    icon: Receipt,
    path: "/my/reimbursements",
    menuKey: "ess.reimbursement",
  },
  {
    label: "Payslip",
    icon: Banknote,
    path: "/my/payroll",
    menuKey: "ess.payslip",
  },
  {
    label: "My KPI",
    icon: Target,
    path: "/my/kpi",
    menuKey: "ess.kpi",
  },
  {
    label: "Training",
    icon: GraduationCap,
    path: "/my/trainings",
    menuKey: "ess.training",
  },
  {
    label: "Competency",
    icon: Award,
    path: "/my/competencies",
    menuKey: "ess.competency",
  },
  {
    label: "My Assets",
    icon: Briefcase,
    path: "/my/assets",
    menuKey: "ess.assets",
  },
  {
    label: "My Documents",
    icon: FileText,
    path: "/my/documents",
    menuKey: "ess.documents",
  },
  {
    label: "Custom Dashboard",
    icon: ShieldCheck,
    path: "/dashboard/custom",
    menuKey: "ess.dashboard.custom",
  },
  {
    label: "Notifications",
    icon: Bell,
    path: "/notifications",
    menuKey: "ess.notifications",
  },
];
