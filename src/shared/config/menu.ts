import { 
  Users, CalendarDays, CreditCard, Receipt, Target, UserCircle, 
  FileBarChart, LayoutDashboard, Network, Briefcase, 
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
        label: 'Legal & Surat',
        icon: FileText,
        subItems: [
          { label: 'Generator Surat', path: '/legal/letters' },
          { label: 'Kalkulator Pesangon', path: '/legal/severance' },
          { label: 'PPh21 Progresif', path: '/legal/tax' },
        ]
      },
      {
        label: 'Dokumen',
        icon: FileText,
        subItems: [
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
      { label: 'Monitoring Hari Ini', path: '/attendance/daily' },
      { label: 'Riwayat Semua Karyawan', path: '/attendance/daily' },
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
    label: 'Rekrutmen (ATS)',
    icon: Briefcase,
    requiredChecker: (user) => RBACUtils.isHR(user) || RBACUtils.isAdmin(user),
    subItems: [
      { label: 'Lowongan Pekerjaan', path: '/recruitment/openings' },
      { label: 'Pipeline Kandidat', path: '/recruitment/candidates' },
      { label: 'Talent Pool', path: '/recruitment/talent-pool' },
    ]
  },
  {
    label: 'Aset & Inventaris',
    icon: Briefcase,
    requiredChecker: (user) => RBACUtils.isHR(user) || RBACUtils.isAdmin(user),
    subItems: [
      { label: 'Daftar Aset', path: '/assets' },
      { label: 'Penugasan', path: '/assets/assignments' },
    ]
  },
  {
    label: 'Reimburse & Pengeluaran',
    icon: Receipt,
    requiredChecker: (user) => RBACUtils.isHR(user) || RBACUtils.isAdmin(user) || RBACUtils.isManager(user),
    subItems: [
      { label: 'Manajemen Reimburse', path: '/reimbursements' },
      { label: 'Persetujuan Biaya', path: '/expense/approval' },
      { label: 'Daftar Pengeluaran', path: '/expense/list' },
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
    ]
  },
  {
    label: 'Permintaan Layanan HR',
    icon: FileText,
    subItems: [
      { label: 'Antrian Permintaan', path: '/hr-requests' },
      { label: 'Laporan SLA', path: '/hr-requests/sla' },
    ]
  },
  {
    label: 'KPI & Kinerja',
    icon: Target,
    requiredChecker: (user) => RBACUtils.isManager(user) || RBACUtils.isHR(user) || RBACUtils.isAdmin(user) || RBACUtils.isSuperAdmin(user),
    subItems: [
      { label: 'Manajemen KPI', path: '/kpis' },
      { label: 'Manajemen OKR', path: '/performance/okrs' },
      { label: 'Review 360', path: '/performance/reviews' },
      { label: 'Sesi Kalibrasi', path: '/performance/calibration' },
      { label: 'Ringkasan Kinerja', path: '/performance/summary' },
    ]
  },
  {
    label: 'Engagement & Survei',
    icon: Users,
    requiredChecker: (user) => RBACUtils.isHR(user) || RBACUtils.isAdmin(user),
    subItems: [
      { label: 'Survei Kepuasan', path: '/engagement/surveys' },
      { label: 'Analitik Engagement', path: '/engagement/analytics' },
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
      { label: 'Absen Masuk', path: '/attendance/check-in' },
      { label: 'Absen Pulang', path: '/attendance/check-out' },
      { label: 'Riwayat Absensi Saya', path: '/attendance/history' },
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
      { label: 'Ringkasan Laporan', path: '/reports/dashboard-summary' },
      { label: 'Laporan Absensi', path: '/reports/attendance' },
      { label: 'Laporan Cuti', path: '/reports/leave' },
      { label: 'Laporan Payroll', path: '/reports/payroll' },
      { label: 'Laporan Aset', path: '/reports/assets' },
      { label: 'Laporan SDM', path: '/reports/employee' },
    ]
  },
  {
    label: 'Kepatuhan & Kebijakan',
    icon: ShieldCheck,
    requiredChecker: (user) => RBACUtils.isHR(user) || RBACUtils.isAdmin(user),
    subItems: [
      { label: 'Dashboard Kepatuhan', path: '/compliance/overview' },
      { label: 'Kalender Libur', path: '/workforce/holidays' },
      { label: 'Tukar Shift', path: '/workforce/shift-swaps' },
      { label: 'Aturan Lembur', path: '/workforce/overtime-rules' },
    ]
  },
  {
    label: 'Alat Admin',
    icon: ShieldCheck,
    requiredChecker: (user) => RBACUtils.isAdmin(user) || RBACUtils.canViewUsers(user) || RBACUtils.canViewRoles(user) || RBACUtils.canViewPermissions(user),
    subItems: [
      { 
        label: 'Lokasi', 
        path: '/locations',
        requiredChecker: (user) => RBACUtils.isSuperAdmin(user) || RBACUtils.hasPermission(user, 'location.view' as any)
      },
      { 
        label: 'Jadwal Kerja', 
        path: '/work-schedules',
        requiredChecker: (user) => RBACUtils.isSuperAdmin(user) || RBACUtils.isHR(user)
      },
      { 
        label: 'Pengguna', 
        path: '/admin/users',
        requiredChecker: (user) => RBACUtils.isSuperAdmin(user) || RBACUtils.canViewUsers(user)
      },
      { 
        label: 'Peran', 
        path: '/admin/roles',
        requiredChecker: (user) => RBACUtils.isSuperAdmin(user) || RBACUtils.canViewRoles(user)
      },
      { 
        label: 'Izin', 
        path: '/admin/permissions',
        requiredChecker: (user) => RBACUtils.isSuperAdmin(user) || RBACUtils.canViewPermissions(user)
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
      {
        label: 'Alur Persetujuan',
        path: '/approval-flows',
        requiredChecker: (user) => RBACUtils.isAdmin(user) || RBACUtils.isSuperAdmin(user),
      },
      {
        label: 'Pengaturan Perusahaan',
        path: '/settings/company',
        requiredChecker: (user) => RBACUtils.isAdmin(user),
      },
      {
        label: 'Master Data',
        icon: Database,
        subItems: [
          { label: 'Jenis Cuti', path: '/settings/master-data/leave-type' },
          { label: 'Kategori Pengeluaran', path: '/settings/master-data/expense-category' },
        ],
        requiredChecker: (user) => RBACUtils.isAdmin(user),
      },
      {
        label: 'Pengaturan Notifikasi',
        path: '/settings/notification',
        requiredChecker: (user) => RBACUtils.isAdmin(user),
      },
    ]
  }
];
