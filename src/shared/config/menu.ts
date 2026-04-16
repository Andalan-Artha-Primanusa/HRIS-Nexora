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
      { label: 'Permintaan Saya', path: '/my/requests' },
      { label: 'Antrian Permintaan', path: '/requests' },
      { label: 'Penugasan Permintaan', path: '/requests/assign' },
      { label: 'Update Status Permintaan', path: '/requests/status' },
    ]
  },
  {
    label: 'KPI & Kinerja',
    icon: Target,
    requiredChecker: (user) => RBACUtils.isManager(user) || RBACUtils.isHR(user) || RBACUtils.isAdmin(user) || RBACUtils.isSuperAdmin(user),
    subItems: [
      { label: 'Daftar KPI', path: '/kpis' },
      { label: 'Tambah KPI', path: '/kpis/add' },
      { label: 'Ringkasan Kinerja', path: '/performance/summary' },
      { label: 'Siklus Kinerja', path: '/performance/cycles' },
      { label: 'Review Kinerja', path: '/performance/reviews' },
      { label: 'OKR', path: '/performance/okrs' },
      { label: '360 Review', path: '/performance/360-reviews' },
      { label: 'Kalibrasi', path: '/performance/calibration' },
      { label: 'IDP Karir', path: '/career/idps' },
      { label: 'Matriks Suksesi', path: '/career/succession' },
      { label: 'Survei Keterlibatan', path: '/engagement/surveys' },
      { label: 'Lowongan Rekrutmen', path: '/recruitment/openings' },
      { label: 'Hari Libur', path: '/workforce/holidays' },
      { label: 'Tukar Shift', path: '/workforce/shift-swaps' },
      { label: 'Aturan Lembur', path: '/workforce/overtime-rules' },
      { label: 'Alur Persetujuan', path: '/approval-flows' },
    ]
  },
  {
    label: 'Layanan Mandiri Karyawan (ESS)',
    icon: UserCircle,
    subItems: [
      { label: 'KPI Saya', path: '/my/kpi' },
      { label: 'Reimburse Saya', path: '/my/reimbursements' },
      { label: 'Payroll Saya', path: '/my/payroll' },
      { label: 'Cuti Saya', path: '/leave/my-leave' },
      { label: 'Dokumen Saya', path: '/my/documents' },
      { label: 'Pelatihan Saya', path: '/my/trainings' },
      { label: 'Kompetensi Saya', path: '/my/competencies' },
      { label: 'Aset Saya', path: '/my/assets' },
      { label: 'Permintaan Saya', path: '/my/requests' },
    ]
  },
  {
    label: 'Laporan & Analitik',
    icon: FileBarChart,
    requiredChecker: (user) => RBACUtils.isManager(user) || RBACUtils.isHR(user) || RBACUtils.isAdmin(user),
    subItems: [
      { label: 'Insight SDM', path: '/insights/people/detailed' },
      { label: 'Ringkasan Laporan', path: '/reports/dashboard-summary' },
      { label: 'Laporan Absensi', path: '/reports/attendance' },
      { label: 'Laporan Cuti', path: '/reports/leave' },
      { label: 'Laporan Payroll', path: '/reports/payroll' },
      { label: 'Laporan Kompetensi', path: '/reports/competency' },
      { label: 'Siklus Karyawan', path: '/reports/employee-lifecycle' },
      { label: 'Laporan Aset', path: '/reports/assets' },
      { label: 'Laporan Kustom', path: '/reports/custom' },
      { label: 'Ringkasan Kepatuhan', path: '/compliance/overview' },
      { label: 'Audit Kepatuhan', path: '/compliance/audit-summary' },
      { label: 'Dokumen Kepatuhan Kedaluwarsa', path: '/compliance/expiring-documents' },
    ]
  },
  {
    label: 'Notifikasi',
    icon: Settings,
    subItems: [{ label: 'Pusat Notifikasi', path: '/notifications' }],
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
      { label: 'Pengaturan Perusahaan', path: '/settings/company' },
      { label: 'Manajemen Pengguna & Peran', path: '/settings/user-role' },
      { label: 'Izin', path: '/settings/permissions' },
      {
        label: 'Master Data',
        icon: Database,
        subItems: [
          { label: 'Jenis Cuti', path: '/settings/master-data/leave-type' },
          { label: 'Kategori Pengeluaran', path: '/settings/master-data/expense-category' },
        ]
      },
      { label: 'Pengaturan Notifikasi', path: '/settings/notification' }
    ]
  }
];
