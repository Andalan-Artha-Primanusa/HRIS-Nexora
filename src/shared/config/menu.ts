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
<<<<<<< HEAD
    label: 'Reports',
=======
    label: 'Hukum & Dokumen',
    icon: FileText,
    menuKey: 'legal-dokumen',
    subItems: [
      { label: 'Review Dokumen', path: '/documents/review' },
      { label: 'Surat Tugas', path: '/admin/assignment-letters', menuKey: 'legal-dokumen.surat-tugas' },
      { label: 'Pembuat Surat', path: '/legal/letters', menuKey: 'legal-dokumen.generator' },
      { label: 'Kalkulator Pesangon', path: '/legal/severance', menuKey: 'legal-dokumen.kalkulator' },
      { label: 'PPh21 Progresif', path: '/legal/tax', menuKey: 'legal-dokumen.pph21' },
    ]
  },
  {
    label: 'Manajemen Penggantian Biaya',
    icon: Receipt,
    path: '/reimbursements',
    menuKey: 'reimbursements',
  },
  {
    label: 'Pelatihan & Kompetensi',
    icon: Target,
    menuKey: 'pelatihan-kompetensi',
    subItems: [
      { label: 'Pelatihan & Pendaftaran', path: '/training/programs', menuKey: 'pelatihan-kompetensi.pelatihan' },
      { label: 'Kompetensi', path: '/competencies', menuKey: 'pelatihan-kompetensi.kompetensi' },
    ]
  },
  {
    label: 'Karier & Promosi',
    icon: ArrowUpRight,
    path: '/promotions',
    menuKey: 'karir-promosi',
  },
  {
  label: 'KPI & Kinerja',
  icon: Target,
  path: '/kpis',
  menuKey: 'kpi-kinerja',
},
  {
  label: 'Layanan Mandiri Karyawan',
  icon: UserCircle,
  menuKey: 'ess',
    subItems: [
      {
        label: 'Kinerja',
        subItems: [
          { label: 'KPI Saya', path: '/my/kpi', menuKey: 'ess.kinerja.kpi' },
          { label: 'Kompetensi Saya', path: '/my/competencies', menuKey: 'ess.kinerja.kompetensi' },
        ]
      },
      {
        label: 'Keuangan',
        subItems: [
          { label: 'Penggajian Saya', path: '/my/payroll', menuKey: 'ess.keuangan.payroll' },
          { label: 'Penggantian Biaya Saya', path: '/my/reimbursements', menuKey: 'ess.keuangan.reimburse' },
        ]
      },
      {
        label: 'Absensi',
        subItems: [
          { label: 'Absen Masuk', path: '/attendance/check-in', menuKey: 'ess.absensi.check-in' },
          { label: 'Absen Pulang', path: '/attendance/check-out', menuKey: 'ess.absensi.check-out' },
          { label: 'Riwayat Absensi', path: '/attendance/history', menuKey: 'ess.absensi.riwayat' },
        ]
      },
      {
        label: 'Pengembangan',
        subItems: [
          { label: 'Pelatihan Saya', path: '/my/trainings', menuKey: 'ess.pengembangan.pelatihan' },
          { label: 'Lembur Saya', path: '/my/overtime', menuKey: 'ess.pengembangan.lembur' },
          { label: 'Promosi Saya', path: '/my/promotions', menuKey: 'ess.pengembangan.promosi' },
        ]
      },
      {
        label: 'Dokumen & Aset',
        subItems: [
          { label: 'Dokumen Saya', path: '/my/documents', menuKey: 'ess.dokumen-aset.dokumen' },
          { label: 'Aset Saya', path: '/my/assets', menuKey: 'ess.dokumen-aset.aset' },
          { label: 'Surat Tugas', path: '/my/assignment-letters', menuKey: 'ess.dokumen-aset.surat-tugas' },
          { label: 'Tugas Saya', path: '/my/tasks', menuKey: 'ess.dokumen-aset.tugas' },
        ]
      },
    ]
  },
  {
    label: 'Laporan & Analitik',
>>>>>>> de1fc177551de4885a1f8e57cc2c0344d3769ac7
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
