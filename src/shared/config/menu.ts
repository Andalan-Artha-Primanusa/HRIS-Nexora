import { 
  Users, CalendarDays, Receipt, Target, UserCircle, 
  FileBarChart, LayoutDashboard, Briefcase, 
  FileText, Clock, Banknote, ShieldCheck, Database, CheckCircle, ArrowUpRight
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
  label: 'Dashboard Saya',
  icon: UserCircle,
  path: '/employee-dashboard',
  menuKey: 'employee-dashboard',
},
  {
  label: 'Manajemen Karyawan',
  icon: Users,
  path: '/employees',
  menuKey: 'employees',
  },
  {
    label: 'Absensi & Waktu',
    icon: Clock,
    menuKey: 'absensi-waktu',
    subItems: [
      { label: 'Lembur', path: '/attendance/overtime', menuKey: 'absensi-waktu.overtime' },
      { label: 'Laporan', path: '/attendance/reports', menuKey: 'absensi-waktu.reports' },
    ]
  },
  {
    label: 'Manajemen Cuti',
    icon: CalendarDays,
    menuKey: 'manajemen-cuti',
    subItems: [
      { label: 'Permohonan Cuti', path: '/leave/requests', menuKey: 'manajemen-cuti.permohonan' },
      { label: 'Persetujuan Cuti', path: '/leave/approval', menuKey: 'manajemen-cuti.persetujuan' },
      { label: 'Kalender Cuti', path: '/leave/calendar', menuKey: 'manajemen-cuti.kalender' },
      { label: 'Saldo Cuti', path: '/leave/balance', menuKey: 'manajemen-cuti.saldo' },
    ]
  },
  {
    label: 'Penggajian & Slip Gaji',
    icon: Banknote,
    menuKey: 'penggajian',
    subItems: [
      { label: 'Ringkasan', path: '/payroll', menuKey: 'penggajian.ringkasan' },
      { label: 'Daftar Penggajian', path: '/payroll/list', menuKey: 'penggajian.daftar' },
      { label: 'Proses Penggajian', path: '/payroll/process', menuKey: 'penggajian.proses' },
      { label: 'Komponen Gaji', path: '/payroll/component', menuKey: 'penggajian.komponen' },
      { label: 'Laporan & Pajak', path: '/payroll/reports', menuKey: 'penggajian.laporan' },
    ]
  },
  {
    label: 'Aset & Inventaris',
    icon: Briefcase,
    path: '/assets',
    menuKey: 'assets',
  },
  {
    label: 'Manajemen Tugas',
    icon: CheckCircle,
    path: '/tasks',
    menuKey: 'tasks',
  },
  {
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
    icon: FileBarChart,
    path: '/reports/dashboard-summary',
    menuKey: 'laporan-analitik',
  },
  {
    label: 'Kepatuhan & Kebijakan',
    icon: ShieldCheck,
    menuKey: 'kepatuhan-kebijakan',
    subItems: [
      { label: 'Dashboard Kepatuhan', path: '/compliance/overview', menuKey: 'kepatuhan-kebijakan.dashboard' },
      { label: 'Kalender Libur', path: '/workforce/holidays', menuKey: 'kepatuhan-kebijakan.kalender' },
      { label: 'Tukar Giliran Kerja', path: '/workforce/shift-swaps', menuKey: 'kepatuhan-kebijakan.tukar-shift' },
      { label: 'Aturan Lembur', path: '/workforce/overtime-rules', menuKey: 'kepatuhan-kebijakan.aturan-lembur' },
    ]
  },
  {
    label: 'Data Induk',
    icon: Database,
    menuKey: 'master-data',
    subItems: [
      { label: 'Departemen & Posisi', path: '/organization/master-data', menuKey: 'master-data.departemen' },
      { label: 'Jenis Cuti', path: '/leave/type', menuKey: 'master-data.jenis-cuti' },
      { label: 'Kebijakan Cuti', path: '/leave/policy', menuKey: 'master-data.kebijakan-cuti' },
      {
        label: 'Pusat Impor Data Induk',
        path: '/admin/import',
        menuKey: 'master-data.pusat-impor',
      },
    ]
  },
  {
  label: 'Alat Administrator',
  icon: ShieldCheck,
  menuKey: 'alat-admin',
  subItems: [
    {
      label: 'Data Utama',
      subItems: [
        {
          label: 'Lokasi',
          path: '/locations',
          menuKey: 'alat-admin.master.lokasi',
        },
        {
          label: 'Jadwal Kerja',
          path: '/work-schedules',
          menuKey: 'alat-admin.master.jadwal-kerja',
        },
      ],
    },
    {
      label: 'Manajemen Akses',
      subItems: [
        {
          label: 'Pengguna',
          path: '/admin/users',
          menuKey: 'alat-admin.manajemen-akses.pengguna',
        },
        {
          label: 'Peran',
          path: '/admin/roles',
          menuKey: 'alat-admin.manajemen-akses.peran',
        },
        {
          label: 'Izin',
          path: '/admin/permissions',
          menuKey: 'alat-admin.manajemen-akses.izin',
        },
        {
          label: 'Akses Menu',
          path: '/admin/menu-permissions',
          menuKey: 'alat-admin.manajemen-akses.menu',
        },
      ],
    },
    {
      label: 'Notifikasi',
      subItems: [
        {
          label: 'Notifikasi Administrator',
          path: '/admin/notifications',
          menuKey: 'alat-admin.notifikasi.admin',
        },
        {
          label: 'Kirim Notifikasi Surel',
          path: '/admin/notifications/email-send',
          menuKey: 'alat-admin.notifikasi.kirim-email',
        },
        {
          label: 'Catatan & Templat Surel',
          path: '/admin/notifications/email-logs',
          menuKey: 'alat-admin.notifikasi.log-email',
        },
      ],
    },
    {
      label: 'Sistem',
      subItems: [
        {
          label: 'Catatan Audit',
          path: '/admin/audit-logs',
          menuKey: 'alat-admin.sistem.log-audit',
        },
        {
          label: 'Perangkat Biometrik',
          path: '/admin/biometric-devices',
          menuKey: 'alat-admin.sistem.biometrik',
        },
        {
          label: 'Alur Persetujuan',
          path: '/approval-flows',
          menuKey: 'alat-admin.sistem.alur-persetujuan',
        },
      ],
    },
    {
      label: 'Pengaturan',
      subItems: [
        {
          label: 'Pengaturan Perusahaan',
          path: '/settings/company',
          menuKey: 'alat-admin.pengaturan.perusahaan',
        },
        {
          label: 'Pengaturan Notifikasi',
          path: '/settings/notifications',
          menuKey: 'alat-admin.pengaturan.notifikasi',
        },
      ],
    },
  ],
},
];
