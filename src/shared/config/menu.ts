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
    label: 'Beranda',
    icon: LayoutDashboard,
    subItems: [
      { label: 'Ringkasan', path: '/dashboard' },
      { label: 'Ringkasan HR', path: '/hr-summary' },
      { label: 'Analitik', path: '/analytics' },
    ]
  },
  {
    label: 'Manajemen Karyawan',
    icon: Users,
    requiredChecker: (user) => RBACUtils.isHR(user) || RBACUtils.isAdmin(user),
    subItems: [
      { label: 'Profil', path: '/profiles' },
      { label: 'Daftar Karyawan', path: '/employees' },
      { 
        label: 'Organisasi', 
        icon: Network,
        subItems: [
          { label: 'Direktori', path: '/organization/directory' },
          { label: 'Ringkasan', path: '/organization/summary' },
          { label: 'Struktur Organisasi', path: '/organization/chart' },
          { label: 'Tim', path: '/organization/team' },
          { label: 'Master Data', path: '/organization/master-data' },
        ]
      },
      {
        label: 'Dokumen',
        icon: FileText,
        subItems: [
          { label: 'Dokumen Saya', path: '/my/documents' },
          { label: 'Antrian Review', path: '/documents/review' },
          { label: 'Dokumen Kedaluwarsa', path: '/documents/expiring' },
        ]
      }
    ]
  },
  {
    label: 'Absensi & Waktu',
    icon: Clock,
    subItems: [
      { label: 'Absen Masuk', path: '/attendance/check-in' },
      { label: 'Absen Pulang', path: '/attendance/check-out' },
      { label: 'Hari Ini', path: '/attendance/today' },
      { label: 'Riwayat', path: '/attendance/history' },
      { label: 'Timesheet', path: '/attendance/timesheet' },
      { label: 'Lembur', path: '/attendance/overtime' },
      { label: 'Laporan', path: '/attendance/reports' },
    ]
  },
  {
    label: 'Manajemen Cuti',
    icon: CalendarDays,
    subItems: [
      { label: 'Permohonan Cuti', path: '/leave/requests' },
      { label: 'Cuti Saya', path: '/leave/my-leave' },
      { label: 'Persetujuan', path: '/leave/approval' },
      { label: 'Kalender Cuti', path: '/leave/calendar' },
      { label: 'Saldo Cuti', path: '/leave/balance' },
      { label: 'Jenis Cuti', path: '/leave/type' },
      { label: 'Kebijakan Cuti', path: '/leave/policy' },
    ]
  },
  {
    label: 'Penggajian & Slip Gaji',
    icon: Banknote,
    requiredChecker: (user) => RBACUtils.isHR(user) || RBACUtils.isAdmin(user),
    subItems: [
      { label: 'Ringkasan', path: '/payroll' },
      { label: 'Daftar Payroll', path: '/payroll/list' },
      { label: 'Kelola Payroll', path: '/payroll/crud' },
      { label: 'Generate Payroll', path: '/payroll/generate' },
      { label: 'Approve Payroll', path: '/payroll/approve' },
      { label: 'Pembayaran Payroll', path: '/payroll/payment' },
      {
        label: 'Komponen Gaji',
        icon: CreditCard,
        subItems: [
          { label: 'Tunjangan', path: '/payroll/component/allowance' },
          { label: 'Potongan', path: '/payroll/component/deduction' },
        ]
      },
      { label: 'Pajak & BPJS', path: '/payroll/tax' },
      { label: 'Laporan', path: '/payroll/reports' },
    ]
  },
  {
    label: 'Aset & Inventaris',
    icon: Briefcase,
    requiredChecker: (user) => RBACUtils.isHR(user) || RBACUtils.isAdmin(user),
    subItems: [
      { label: 'Daftar Aset', path: '/assets' },
      { label: 'Penugasan', path: '/assets/assignments' },
      { label: 'Aset Saya', path: '/my/assets' },
    ]
  },
  {
    label: 'Reimburse & Pengeluaran',
    icon: Receipt,
    requiredChecker: (user) => RBACUtils.isHR(user) || RBACUtils.isAdmin(user),
    subItems: [
      { label: 'Ajukan Pengeluaran', path: '/expense/submit' },
      { label: 'Daftar Pengeluaran', path: '/expense/list' },
      { label: 'Persetujuan', path: '/expense/approval' },
      { label: 'Kategori', path: '/expense/categories' },
      { label: 'Laporan', path: '/expense/reports' },
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
    label: 'Permintaan Layanan HR',
    icon: FileText,
    subItems: [
      { label: 'My Requests', path: '/my/requests' },
      { label: 'Requests Queue', path: '/requests' },
      { label: 'Request Assignment', path: '/requests/assign' },
      { label: 'Request Status Update', path: '/requests/status' },
    ]
  },
  {
    label: 'KPI & Kinerja',
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
    label: 'Layanan Mandiri Karyawan (ESS)',
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
    label: 'Laporan & Analitik',
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
    label: 'Notifikasi',
    icon: Settings,
    subItems: [{ label: 'Notification Center', path: '/notifications' }],
  },
  {
    label: 'Alat Admin',
    icon: ShieldCheck,
    requiredChecker: (user) => RBACUtils.isAdmin(user) || RBACUtils.canViewUsers(user) || RBACUtils.canViewRoles(user) || RBACUtils.canViewPermissions(user),
    subItems: [
      { 
        label: 'Lokasi', 
        path: '/locations',
        requiredChecker: (user) => RBACUtils.hasPermission(user, 'location.view' as any)
      },
      { 
        label: 'Pengguna', 
        path: '/admin/users',
        requiredChecker: (user) => RBACUtils.canViewUsers(user)
      },
      { 
        label: 'Peran', 
        path: '/admin/roles',
        requiredChecker: (user) => RBACUtils.canViewRoles(user)
      },
      { 
        label: 'Izin', 
        path: '/admin/permissions',
        requiredChecker: (user) => RBACUtils.canViewPermissions(user)
      },
      {
        label: 'Notifikasi Admin',
        path: '/admin/notifications',
        requiredChecker: (user) => RBACUtils.isAdmin(user) || RBACUtils.isSuperAdmin(user),
      },
      {
        label: 'Notifikasi Email',
        path: '/admin/email-notifications',
        requiredChecker: (user) => RBACUtils.isAdmin(user) || RBACUtils.isSuperAdmin(user),
      },
      {
        label: 'Log Audit',
        path: '/admin/audit-logs',
        requiredChecker: (user) => RBACUtils.isAdmin(user) || RBACUtils.isSuperAdmin(user),
      },
      {
        label: 'Pusat Impor',
        path: '/admin/import',
        requiredChecker: (user) => RBACUtils.isAdmin(user) || RBACUtils.isSuperAdmin(user),
      },
      {
        label: 'Perangkat Biometrik',
        path: '/admin/biometric-devices',
        requiredChecker: (user) => RBACUtils.isAdmin(user) || RBACUtils.isSuperAdmin(user),
      },
    ]
  },
  {
    label: 'Pengaturan',
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
      { label: 'Pengaturan Notifikasi', path: '/settings/notification' }
    ]
  }
];
