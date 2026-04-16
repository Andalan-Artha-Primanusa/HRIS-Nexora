import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { api } from '@/shared/api/httpClient';
import { createSectionActionExecutor } from './sectionActionGroups';
import {
  BarChart3,
  Users,
  CalendarDays,
  Clock,
  CreditCard,
  Receipt,
  Target,
  UserCircle,
  Settings,
  Network,
  Briefcase,
  FileText,
  Search,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import './SectionPage.css';

type SectionStat = {
  label: string;
  value: string;
  description: string;
  variant: 'warning' | 'success' | 'info' | 'default' | 'danger';
};

type CrudMode = 'create' | 'manage';

const splitCrudPaths = new Set(['/profiles', '/leave/requests', '/leave/type', '/leave/policy', '/reimbursements']);

const getCrudRouteBase = (pathname: string) => {
  for (const basePath of splitCrudPaths) {
    if (pathname === `${basePath}/create` || pathname === `${basePath}/manage`) {
      return basePath;
    }
  }

  return pathname;
};

const getCrudModeFromPath = (pathname: string): CrudMode | null => {
  if (pathname.endsWith('/create')) return 'create';
  if (pathname.endsWith('/manage')) return 'manage';
  return null;
};

const sectionDefinitions: Record<string, { title: string; subtitle: string; icon: any; color: string }> = {
  dashboard: {
     title: 'Ringkasan Dashboard',
     subtitle: 'Ringkasan HRIS utama dengan KPI, aktivitas, dan tren terpenting.',
    icon: BarChart3,
    color: '#2563EB',
  },
  'hr-summary': {
     title: 'Ringkasan HR',
     subtitle: 'Intisari data SDM, jumlah karyawan, turnover, dan absensi.',
    icon: Users,
    color: '#2563EB',
  },
  analytics: {
     title: 'Analitik',
     subtitle: 'Analisa performa tim, ketidakhadiran, dan produktivitas secara real-time.',
    icon: BarChart3,
    color: '#2563EB',
  },
  employees: {
     title: 'Manajemen Karyawan',
     subtitle: 'Kelola data karyawan, posisi, dan struktur organisasi.',
    icon: Users,
    color: '#2563EB',
  },
  organization: {
     title: 'Struktur Organisasi',
     subtitle: 'Atur departemen dan posisi di perusahaan.',
    icon: Network,
    color: '#2563EB',
  },
  employment: {
     title: 'Manajemen Kepegawaian',
     subtitle: 'Status kerja, riwayat gaji, dan data karir karyawan.',
    icon: Briefcase,
    color: '#2563EB',
  },
  documents: {
     title: 'Dokumen',
     subtitle: 'Dokumen karyawan seperti KTP, kontrak, dan lainnya.',
    icon: FileText,
    color: '#2563EB',
  },
  attendance: {
     title: 'Absensi',
     subtitle: 'Lihat kehadiran harian, timesheet, shift, dan lembur.',
    icon: Clock,
    color: '#2563EB',
  },
  leave: {
     title: 'Manajemen Cuti',
     subtitle: 'Kelola izin, saldo cuti, dan kalender cuti karyawan.',
    icon: CalendarDays,
    color: '#2563EB',
  },
  payroll: {
     title: 'Penggajian',
     subtitle: 'Proses gaji, slip, komponen upah, dan laporan payroll.',
    icon: CreditCard,
    color: '#2563EB',
  },
  expense: {
     title: 'Reimburse',
     subtitle: 'Klaim biaya operasional dan persetujuan reimburse.',
    icon: Receipt,
    color: '#2563EB',
  },
  performance: {
     title: 'Performa',
     subtitle: 'Tujuan, review, dan feedback karyawan. Kelola KPI di menu terpisah.',
    icon: Target,
    color: '#2563EB',
  },
  ess: {
     title: 'Layanan Mandiri Karyawan',
     subtitle: 'Akses mandiri karyawan untuk profil, absen, dan slip gaji.',
    icon: UserCircle,
    color: '#2563EB',
  },
  reports: {
     title: 'Laporan & Analitik',
     subtitle: 'Laporan SDM, absensi, cuti, payroll, dan analitik.',
    icon: FileText,
    color: '#2563EB',
  },
  assets: {
     title: 'Aset & Inventaris',
     subtitle: 'Kelola aset perusahaan, penugasan, dan pengembalian aset.',
    icon: Briefcase,
    color: '#2563EB',
  },
  training: {
     title: 'Program Pelatihan',
     subtitle: 'Rancang program pelatihan dan pantau kepesertaan.',
    icon: Target,
    color: '#2563EB',
  },
  competencies: {
     title: 'Manajemen Kompetensi',
     subtitle: 'Kelola matriks kompetensi dan penugasan ke karyawan.',
    icon: Target,
    color: '#2563EB',
  },
  requests: {
     title: 'Permintaan Layanan HR',
     subtitle: 'Pantau tiket HR, penugasan PIC, dan update status request.',
    icon: FileText,
    color: '#2563EB',
  },
  notifications: {
     title: 'Pusat Notifikasi',
     subtitle: 'Notifikasi approval, pengingat, dan update status lintas modul.',
    icon: Settings,
    color: '#2563EB',
  },
  insights: {
     title: 'Insight SDM',
     subtitle: 'Dashboard insight lintas absensi, cuti, payroll, reimburse, dan pelatihan.',
    icon: BarChart3,
    color: '#2563EB',
  },
  settings: {
     title: 'Pengaturan Sistem',
     subtitle: 'Pengaturan perusahaan, pengguna, peran, dan master data.',
    icon: Settings,
    color: '#2563EB',
  },
  '/my/kpi': {
     title: 'KPI Saya',
     subtitle: 'Cek KPI pribadi dan submit target yang sudah selesai.',
    icon: Target,
    color: '#2563EB',
  },
  '/my/reimbursements': {
     title: 'Reimburse Saya',
     subtitle: 'Lihat klaim Anda dan ajukan reimburse baru.',
    icon: Receipt,
    color: '#2563EB',
  },
  '/attendance/check-in': {
     title: 'Absen Masuk',
     subtitle: 'Pencatatan kehadiran (check-in) lokasi.',
    icon: MapPin,
    color: '#2563EB',
  },
  '/attendance/check-out': {
     title: 'Absen Pulang',
     subtitle: 'Pencatatan pulang kerja (check-out).',
    icon: MapPin,
    color: '#2563EB',
  },
  '/attendance/history': {
     title: 'Riwayat Absensi',
     subtitle: 'Lihat riwayat absensi harian dan jam kerja Anda.',
    icon: CalendarDays,
    color: '#2563EB',
  },
  '/attendance/today': {
     title: 'Absensi Hari Ini',
     subtitle: 'Lihat status kehadiran hari ini dan jam masuk/pulang terbaru.',
    icon: CalendarDays,
    color: '#2563EB',
  },
  '/profiles': {
     title: 'Profil',
     subtitle: 'Kelola profil karyawan dan informasi kontak.',
    icon: UserCircle,
    color: '#2563EB',
  },
  '/my/payroll': {
     title: 'Payroll Saya',
     subtitle: 'Lihat ringkasan payroll pribadi Anda.',
    icon: CreditCard,
    color: '#2563EB',
  },
  '/locations': {
     title: 'Lokasi',
     subtitle: 'Kelola wilayah dan radius lokasi absensi.',
    icon: MapPin,
    color: '#2563EB',
  },
  '/admin/users': {
     title: 'Manajemen Pengguna',
     subtitle: 'Kelola akun administrator dan karyawan.',
    icon: UserCircle,
    color: '#2563EB',
  },
  '/admin/roles': {
     title: 'Manajemen Peran',
     subtitle: 'Tetapkan peran dan level akses pengguna.',
    icon: ShieldCheck,
    color: '#2563EB',
  },
  '/admin/permissions': {
     title: 'Izin Akses',
     subtitle: 'Kelola izin pada setiap fitur sistem.',
    icon: ShieldCheck,
    color: '#2563EB',
  },
};

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? (value as UnknownRecord) : {};

const unwrapPayload = (raw: unknown) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

const getNumericValue = (raw: unknown): number | null => {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw === 'string') {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const getCountFromPayload = (raw: unknown): number => {
  const payload = unwrapPayload(raw);

  if (Array.isArray(payload)) {
    return payload.length;
  }

  const payloadRecord = toRecord(payload);
  const arrayCandidates = [payloadRecord.items, payloadRecord.rows, payloadRecord.data, payloadRecord.results];

  for (const candidate of arrayCandidates) {
    if (Array.isArray(candidate)) {
      return candidate.length;
    }
  }

  const numericCandidates = [
    payloadRecord.count,
    payloadRecord.total,
    payloadRecord.total_count,
    payloadRecord.totalCount,
    payloadRecord.present,
    payloadRecord.present_count,
    payloadRecord.presentCount,
    payloadRecord.total_present,
    payloadRecord.totalPresent,
  ];

  for (const candidate of numericCandidates) {
    const numericValue = getNumericValue(candidate);
    if (numericValue !== null) {
      return numericValue;
    }
  }

  return 0;
};

const getFormattedTitle = (path: string) => {
  if (path === '/dashboard' || path === '/') return 'Dashboard Overview';
  const cleaned = path.replace(/^\//, '').replace(/\//g, ' ');
  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getSectionTableKey = (pathname: string) => {
  if (pathname === '/my/kpi') return 'kpis';
  if (pathname === '/my/reimbursements') return 'reimbursements';
  if (pathname === '/my/payroll') return 'payroll';
  if (pathname === '/my/assets' || pathname.startsWith('/assets/')) return 'assets';
  if (pathname === '/my/trainings' || pathname.startsWith('/training/')) return 'training';
  if (pathname === '/my/competencies' || pathname.startsWith('/competencies')) return 'competencies';
  if (pathname === '/my/requests' || pathname.startsWith('/requests/')) return 'requests';
  if (pathname.startsWith('/notifications')) return 'notifications';
  if (pathname.startsWith('/insights/')) return 'insights';
  if (pathname.startsWith('/admin/')) return 'admin';
  if (pathname.startsWith('/attendance/')) return 'attendance';
  if (pathname.startsWith('/documents/')) return 'documents';
  if (pathname.startsWith('/organization/')) return 'organization';
  if (pathname.startsWith('/employment/')) return 'employment';
  if (pathname.startsWith('/leave/')) return 'leave';
  if (pathname.startsWith('/payroll/')) return 'payroll';
  if (pathname.startsWith('/expense/')) return 'expense';
  if (pathname.startsWith('/performance/')) return 'performance';
  if (pathname.startsWith('/career/')) return 'career';
  if (pathname.startsWith('/engagement/')) return 'engagement';
  if (pathname.startsWith('/workforce/')) return 'workforce';
  if (pathname.startsWith('/recruitment/')) return 'recruitment';
  if (pathname.startsWith('/compliance/')) return 'compliance';
  if (pathname.startsWith('/approval-flows')) return 'approval_flows';
  if (pathname.startsWith('/ess/')) return 'ess';
  if (pathname.startsWith('/reports/')) return 'reports';
  if (pathname.startsWith('/settings/')) return 'settings';
  if (pathname === '/reimbursements') return 'reimbursements';
  if (pathname === '/profiles') return 'profiles';
  if (pathname === '/locations') return 'locations';
  if (pathname === '/kpis') return 'kpis';
  return pathname.replace(/^\//, '').split('/')[0] || 'dashboard';
};

const getSectionData = (pathname: string) => {
  const predefined = sectionDefinitions[pathname] || sectionDefinitions[pathname.split('/')[1]];
  const title = predefined?.title || getFormattedTitle(pathname);
  const subtitle = predefined?.subtitle || 'Halaman ini siap diisi dengan data dan fungsionalitas lengkap.';
  const icon = predefined?.icon || FileText;
  const color = predefined?.color || '#2563EB';

  const root = getSectionTableKey(pathname);

  const tableColumns: Record<string, string[]> = {
    employees: ['Name', 'Department', 'Position', 'Status', 'Actions'],
    organization: ['Name', 'Type', 'Manager', 'Members', 'Status'],
    employment: ['Employee', 'Position', 'Start Date', 'Salary', 'Status'],
    documents: ['Document', 'Employee', 'Type', 'Expired', 'Status'],
    attendance: ['Date', 'Present', 'Absent', 'Overtime', 'Status'],
    leave: ['Employee', 'Leave Type', 'Start', 'End', 'Status'],
    payroll: ['Payroll Period', 'Employees', 'Total', 'Status', 'Actions'],
    expense: ['Title', 'Category', 'Amount', 'Status', 'Date'],
    assets: ['Asset', 'Category', 'Assigned To', 'Status', 'Updated'],
    training: ['Program', 'Category', 'Start Date', 'Capacity', 'Status'],
    competencies: ['Competency', 'Category', 'Level', 'Mandatory', 'Status'],
    requests: ['Request', 'Type', 'Priority', 'Assigned To', 'Status'],
    notifications: ['Type', 'Title', 'Created At', 'Read', 'Status'],
    insights: ['Metric', 'Value', 'Window', 'Status'],
    ess: ['Feature', 'Status', 'Last Updated'],
    reports: ['Report Name', 'Category', 'Updated', 'Status'],
    settings: ['Setting', 'Module', 'Updated', 'Status'],
    career: ['Plan', 'Employee', 'Target Date', 'Status', 'Updated'],
    engagement: ['Survey', 'Type', 'Start', 'End', 'Status'],
    workforce: ['Policy', 'Department', 'Schedule', 'Status', 'Updated'],
    recruitment: ['Opening', 'Department', 'Type', 'Status', 'Updated'],
    compliance: ['Metric', 'Value', 'Window', 'Status', 'Updated'],
    approval_flows: ['Flow', 'Module', 'Steps', 'Status', 'Updated'],
    profiles: ['Name', 'Email', 'Phone', 'City', 'Status'],
    locations: ['Location', 'Latitude', 'Longitude', 'Radius', 'Status'],
    kpis: ['Title', 'Employee', 'Target', 'Progress', 'Status'],
    reimbursements: ['Title', 'Category', 'Amount', 'Status', 'Date'],
    admin: ['Entity', 'Role / Access', 'Updated', 'Status'],
    dashboard: ['Metric', 'Value', 'Trend', 'Status'],
  };

  const safeRoot = tableColumns[root] ? root : 'dashboard';

  return {
    title,
    subtitle,
    icon,
    color,
    stats: [] as SectionStat[],
    tableColumns: tableColumns[safeRoot],
  };
};

const supportsList = (pathname: string) => {
  const basePath = getCrudRouteBase(pathname);

  return (
    [
      '/profiles',
      '/employees',
      '/leave/requests',
      '/leave/my-leave',
      '/leave/approval',
      '/leave/type',
      '/leave/policy',
      '/attendance',
      '/attendance/daily',
      '/attendance/timesheet',
      '/attendance/shifts',
      '/attendance/overtime',
      '/attendance/reports',
      '/attendance/history',
      '/attendance/today',
      '/payroll',
      '/payroll/tax',
      '/payroll/reports',
      '/reimbursements',
      '/expense/submit',
      '/expense/list',
      '/expense/approval',
      '/expense/categories',
      '/expense/reports',
      '/my/reimbursements',
      '/my/kpi',
      '/my/payroll',
      '/my/assets',
      '/assets',
      '/assets/assignments',
      '/my/documents',
      '/documents/review',
      '/documents/expiring',
      '/my/requests',
      '/requests',
      '/requests/assign',
      '/requests/status',
      '/training/programs',
      '/training/enrollments',
      '/my/trainings',
      '/competencies',
      '/my/competencies',
      '/notifications',
      '/insights/people/detailed',
      '/organization/directory',
      '/organization/summary',
      '/organization/chart',
      '/organization/team',
      '/organization/master-data',
      '/approval-flows',
      '/compliance/overview',
      '/compliance/audit-summary',
      '/compliance/expiring-documents',
      '/reports/dashboard-summary',
      '/reports/competency',
      '/reports/employee-lifecycle',
      '/reports/assets',
      '/performance/summary',
      '/performance/cycles',
      '/performance/reviews',
      '/performance/okrs',
      '/performance/360-reviews',
      '/performance/calibration',
      '/career/idps',
      '/career/succession',
      '/engagement/surveys',
      '/recruitment/openings',
      '/workforce/holidays',
      '/workforce/shift-swaps',
      '/workforce/overtime-rules',
      '/reports/attendance',
      '/reports/leave',
      '/reports/payroll',
      '/reports/custom',
      '/settings/company',
      '/settings/user-role',
      '/settings/permissions',
      '/settings/master-data/department',
      '/settings/master-data/position',
      '/settings/master-data/leave-type',
      '/settings/master-data/expense-category',
      '/settings/notification',
      '/settings/logs',
      '/locations',
      '/admin/users',
      '/admin/roles',
      '/admin/permissions',
    ].includes(basePath)
  );
};

const getDefaultFormState = (pathname: string) => {
  switch (pathname) {
    case '/profiles':
      return { id: '', phone: '', address: '', city: '', province: '', postal_code: '' };
    case '/employees':
      return { id: '', lifecycle_notes: '' };
    case '/employees/add':
      return { user_id: '', employee_code: '', position: '', department: '', hire_date: '', salary: '' };
    case '/leave/requests':
      return { id: '', leave_type: '', start_date: '', end_date: '', total_days: '', reason: '' };
    case '/leave/approval':
      return { id: '', approval_notes: '' };
    case '/leave/type':
    case '/leave/policy':
      return {
        id: '',
        name: '',
        policy_code: '',
        entitlement_type: 'fixed',
        entitlement_value: '',
        max_carryover_days: '',
        is_paid: 'true',
      };
    case '/attendance/check-in':
      return { latitude: '', longitude: '' };
    case '/attendance/check-out':
      return {};
    case '/my/reimbursements':
      return { id: '', title: '', description: '', amount: '', category: '', expense_date: '', receipt_path: '' };
    case '/assets':
      return {
        asset_code: '',
        name: '',
        category: '',
        cost: '',
        purchase_date: '',
        location_id: '',
      };
    case '/assets/assignments':
      return { id: '', employee_id: '', assigned_at: '', expected_return_date: '', assignment_id: '' };
    case '/my/documents':
      return { document_type: '', document_number: '', issue_date: '', expiry_date: '', issuing_authority: '', file: '' };
    case '/documents/review':
      return { id: '', status: '', remarks: '' };
    case '/my/requests':
      return { id: '', request_type: '', description: '', priority: '', status: '', per_page: '15', comment_text: '' };
    case '/requests':
      return { id: '', status: 'open', per_page: '15', comment_text: '' };
    case '/requests/assign':
      return { id: '', assigned_to_user_id: '' };
    case '/requests/status':
      return { id: '', status: '', completion_notes: '' };
    case '/training/programs':
      return { title: '', name: '', code: '', category: '', description: '', provider: '', mode: '', duration_hours: '', start_date: '', end_date: '', budget: '', status: '' };
    case '/training/enrollments':
      return { id: '', employee_ids: '', attendance_percentage: '', assessment_score: '' };
    case '/competencies':
      return { name: '', code: '', category: '', level: '' };
    case '/my/competencies':
      return { id: '', employee_ids: '' };
    case '/notifications':
      return { id: '' };
    case '/my/kpi':
      return { id: '' };
    case '/my/payroll':
      return { id: '', employee_id: '', period: '' };
    case '/payroll':
      return { id: '', period: '', remarks: '' };
    case '/locations':
      return { name: '', latitude: '', longitude: '', radius: '' };
    case '/reimbursements':
      return { id: '', title: '', description: '', amount: '', category: '', expense_date: '', receipt_path: '', approval_note: '', rejection_note: '' };
    case '/expense/approval':
      return { id: '', approval_note: '', rejection_note: '' };
    case '/reports/attendance':
      return { window_days: '30', start_date: '', end_date: '' };
    case '/reports/leave':
      return { year: '', status: '', start_date: '', end_date: '' };
    case '/reports/payroll':
      return { period: '', status: '', start_date: '', end_date: '' };
    case '/reports/custom':
      return { window_days: '30', expiring_days: '30' };
    case '/reports/dashboard-summary':
      return {};
    case '/reports/competency':
      return {};
    case '/reports/employee-lifecycle':
      return { year: '' };
    case '/reports/assets':
      return {};
    case '/approval-flows':
      return { name: '', module: '', role_ids: '' };
    case '/performance/cycles':
      return { name: '', period_type: 'quarterly', year: '', quarter: '', start_date: '', end_date: '', status: 'open', description: '' };
    case '/performance/reviews':
      return { review_cycle_id: '', employee_id: '', reviewer_user_id: '', kpi_id: '', score: '', strengths: '', improvements: '', feedback: '', reviewer_comment: '' };
    case '/performance/okrs':
      return { employee_id: '', period_id: '', objective: '', description: '', weight: '', target_value: '', unit: '', start_date: '', end_date: '' };
    case '/performance/360-reviews':
      return { cycle_id: '', employee_id: '', manager_id: '', feeders_required: '', start_date: '', end_date: '' };
    case '/performance/calibration':
      return { cycle_id: '', name: '', description: '', scheduled_at: '' };
    case '/career/idps':
      return { employee_id: '', review_cycle_id: '', goal_title: '', goal_description: '', status: 'draft', target_date: '', mentor_user_id: '' };
    case '/career/succession':
      return { position_key: '', employee_id: '', readiness: 'ready_1_2_years', talent_score: '', notes: '' };
    case '/engagement/surveys':
      return { title: '', survey_type: 'pulse', start_date: '', end_date: '', anonymous: 'true', status: 'draft', questions_json: '[{"question_type":"rating","question_text":"How satisfied are you?","required":true}]' };
    case '/workforce/holidays':
      return { name: '', year: '', active: 'true', dates_json: '[{"holiday_date":"2026-05-01","name":"Labour Day","is_national":true}]' };
    case '/workforce/shift-swaps':
      return { id: '', requester_employee_id: '', target_employee_id: '', swap_date: '', reason: '', status: 'approved' };
    case '/workforce/overtime-rules':
      return { name: '', department: '', location_id: '', min_minutes: '', multiplier: '', requires_approval: 'true', active: 'true' };
    case '/organization/team':
      return { manager_user_id: '' };
    case '/compliance/expiring-documents':
      return { days: '30' };
    case '/admin/users':
      return { id: '', role_ids: '' };
    case '/admin/roles':
      return { id: '', permission_ids: '' };
    case '/admin/permissions':
      return {};
    default:
      return {} as Record<string, string>;
  }
};

const parsePayloadToTable = (payload: unknown) => {
  if (Array.isArray(payload)) {
    if (payload.length === 0) {
      return { columns: ['Result'], rows: [['No data available']] };
    }

    if (typeof payload[0] === 'object' && payload[0] !== null && !Array.isArray(payload[0])) {
      const columns = Array.from(
        payload.reduce<Set<string>>((keys, item) => {
          Object.keys(item as Record<string, unknown>).forEach((key) => keys.add(key));
          return keys;
        }, new Set<string>())
      );

      const rows = payload.map((item) =>
        columns.map((column) => {
          const value = (item as Record<string, unknown>)[column];
          if (value === undefined || value === null) return '-';
          if (typeof value === 'object') {
            if (Array.isArray(value)) {
              if (value.length === 0) return '[empty array]';
              if (typeof value[0] === 'object') {
                // Show preview: count and first item keys
                const preview = JSON.stringify(value[0]);
                return `[${value.length} items] Preview: ${preview}`;
              }
              return value.join(', ');
            }
            try {
              return JSON.stringify(value);
            } catch {
              return '[object]';
            }
          }
          return String(value);
        })
      );

      return { columns: columns.length ? columns : ['Result'], rows };
    }

    return {
      columns: ['Value'],
      rows: payload.map((item) => [String(item)]),
    };
  }

  if (typeof payload === 'object' && payload !== null) {
    const obj = payload as Record<string, unknown>;
    const columns = Object.keys(obj);
    return {
      columns: columns.length ? columns : ['Result'],
      rows: [columns.map((key) => String(obj[key] ?? '-'))],
    };
  }

  return { columns: ['Result'], rows: [[String(payload)]] };
};

const selectOptionsByField: Record<string, string[]> = {
  status: ['open', 'assigned', 'in_progress', 'completed', 'closed', 'pending', 'approved', 'rejected', 'submitted', 'paid'],
  priority: ['low', 'medium', 'high', 'urgent'],
  entitlement_type: ['fixed', 'accrual', 'unlimited'],
  period_type: ['monthly', 'quarterly', 'yearly'],
  survey_type: ['pulse', 'annual', 'ad_hoc'],
  readiness: ['ready_now', 'ready_1_2_years', 'ready_3_5_years'],
  mode: ['online', 'offline', 'hybrid'],
  category: ['travel', 'meals', 'office_supplies', 'client_entertainment', 'other'],
  anonymous: ['true', 'false'],
  active: ['true', 'false'],
  requires_approval: ['true', 'false'],
  is_paid: ['true', 'false'],
};

const dateFields = new Set(['start_date', 'end_date', 'hire_date', 'expense_date', 'issue_date', 'expiry_date', 'assigned_at', 'expected_return_date', 'period', 'target_date', 'swap_date']);
const numberFields = new Set(['amount', 'salary', 'duration_hours', 'level', 'radius', 'latitude', 'longitude', 'entitlement_value', 'max_carryover_days', 'per_page', 'window_days', 'expiring_days', 'year', 'quarter', 'score', 'weight', 'target_value', 'feeders_required', 'talent_score', 'budget', 'min_minutes', 'multiplier', 'days']);
const textareaFields = new Set(['description', 'reason', 'remarks', 'approval_notes', 'approval_note', 'rejection_note', 'completion_notes', 'comment_text', 'lifecycle_notes', 'strengths', 'improvements', 'feedback', 'reviewer_comment', 'goal_description', 'notes', 'questions_json', 'dates_json']);

const routeActionMatrix: Record<string, string[]> = {
  '/profiles': ['createProfile', 'getProfileDetail', 'updateProfile', 'deleteProfile'],
  '/employees/add': ['createEmployee'],
  '/employees': ['startOnboarding', 'completeOnboarding', 'startOffboarding', 'completeOffboarding'],
  '/leave/requests': ['createLeave', 'updateLeaveRequest', 'cancelLeaveRequest'],
  '/leave/type': ['createLeavePolicy', 'updateLeavePolicy', 'deleteLeavePolicy'],
  '/leave/policy': ['createLeavePolicy', 'updateLeavePolicy', 'deleteLeavePolicy'],
  '/leave/approval': ['approveLeave', 'rejectLeave'],
  '/attendance/check-in': ['checkIn'],
  '/attendance/check-out': ['checkOut'],
  '/my/reimbursements': ['createReimbursement', 'submitMyReimbursement'],
  '/assets': ['createAsset'],
  '/assets/assignments': ['assignAsset', 'returnAsset'],
  '/my/documents': ['uploadMyDocument'],
  '/documents/review': ['reviewDocument'],
  '/my/requests': ['createMyRequest', 'viewRequestDetail', 'addRequestComment'],
  '/requests': ['viewRequestDetail'],
  '/requests/assign': ['assignRequest'],
  '/requests/status': ['updateRequestStatus'],
  '/training/programs': ['createTrainingProgram'],
  '/training/enrollments': ['enrollTrainingProgram', 'completeTrainingEnrollment'],
  '/competencies': ['createCompetency', 'assignCompetency'],
  '/my/competencies': ['createCompetency', 'assignCompetency'],
  '/approval-flows': ['createApprovalFlow'],
  '/performance/cycles': ['createPerformanceCycle'],
  '/performance/reviews': ['createPerformanceReview'],
  '/performance/okrs': ['createPerformanceOkr'],
  '/performance/360-reviews': ['createPerformance360Review'],
  '/performance/calibration': ['createPerformanceCalibration'],
  '/career/idps': ['createCareerIdp'],
  '/career/succession': ['createCareerSuccession'],
  '/engagement/surveys': ['createEngagementSurvey'],
  '/workforce/holidays': ['createWorkforceHolidayCalendar'],
  '/workforce/shift-swaps': ['createWorkforceShiftSwap', 'updateWorkforceShiftSwap'],
  '/workforce/overtime-rules': ['createWorkforceOvertimeRule'],
  '/notifications': ['markNotificationRead', 'markAllNotificationsRead', 'getNotificationUnreadCount'],
  '/my/kpi': ['submitKpi'],
  '/payroll': ['generatePayroll', 'approvePayroll', 'markPayrollPaid'],
  '/locations': ['createLocation'],
  '/reimbursements': ['createReimbursementAdmin', 'approveReimbursement', 'rejectReimbursement', 'markReimbursementPaid'],
  '/expense/approval': ['approveReimbursement', 'rejectReimbursement', 'markReimbursementPaid'],
  '/my/payroll': ['submitMyPayroll', 'getMyPayrollSlip', 'exportMyPayrollCsv', 'exportMyPayrollPdf'],
  '/admin/users': ['assignRoleToUser'],
  '/admin/roles': ['assignPermissionToRole'],
};

const supportsCrudModeSplit = (pathname: string) => splitCrudPaths.has(getCrudRouteBase(pathname));

const getFormStateByMode = (pathname: string, mode: CrudMode) => {
  const basePath = getCrudRouteBase(pathname);

  if (!supportsCrudModeSplit(basePath)) {
    return getDefaultFormState(basePath);
  }

  if (mode === 'manage') {
    return getDefaultFormState(basePath);
  }

  switch (basePath) {
    case '/profiles':
      return { phone: '', address: '', city: '', province: '', postal_code: '' };
    case '/leave/requests':
      return { leave_type: '', start_date: '', end_date: '', total_days: '', reason: '' };
    case '/leave/type':
    case '/leave/policy':
      return {
        name: '',
        policy_code: '',
        entitlement_type: 'fixed',
        entitlement_value: '',
        max_carryover_days: '',
        is_paid: 'true',
      };
    case '/reimbursements':
      return { title: '', description: '', amount: '', category: '', expense_date: '', receipt_path: '' };
    default:
      return getDefaultFormState(basePath);
  }
};

const actionRequiredFields: Record<string, string[]> = {
  getProfileDetail: ['id'],
  updateProfile: ['id'],
  deleteProfile: ['id'],
  startOnboarding: ['id'],
  completeOnboarding: ['id'],
  startOffboarding: ['id'],
  completeOffboarding: ['id'],
  approveLeave: ['id'],
  rejectLeave: ['id'],
  updateLeavePolicy: ['id'],
  deleteLeavePolicy: ['id'],
  submitMyReimbursement: ['id'],
  approveReimbursement: ['id'],
  rejectReimbursement: ['id'],
  markReimbursementPaid: ['id'],
  assignAsset: ['id', 'employee_id'],
  returnAsset: ['assignment_id'],
  reviewDocument: ['id', 'status'],
  addRequestComment: ['id', 'comment_text'],
  viewRequestDetail: ['id'],
  assignRequest: ['id', 'assigned_to_user_id'],
  updateRequestStatus: ['id', 'status'],
  enrollTrainingProgram: ['id', 'employee_ids'],
  completeTrainingEnrollment: ['id'],
  assignCompetency: ['id', 'employee_ids'],
  createApprovalFlow: ['name', 'module', 'role_ids'],
  createPerformanceCycle: ['name', 'period_type', 'year', 'start_date', 'end_date'],
  createPerformanceReview: ['review_cycle_id', 'employee_id', 'reviewer_user_id'],
  createPerformanceOkr: ['employee_id', 'period_id', 'objective', 'start_date', 'end_date'],
  createPerformance360Review: ['cycle_id', 'employee_id', 'manager_id', 'start_date', 'end_date'],
  createPerformanceCalibration: ['cycle_id', 'name', 'scheduled_at'],
  createCareerIdp: ['employee_id', 'review_cycle_id', 'goal_title', 'target_date'],
  createCareerSuccession: ['position_key', 'employee_id', 'readiness'],
  createEngagementSurvey: ['title', 'survey_type', 'start_date', 'end_date', 'questions_json'],
  createWorkforceHolidayCalendar: ['name', 'year', 'dates_json'],
  createWorkforceShiftSwap: ['requester_employee_id', 'target_employee_id', 'swap_date'],
  updateWorkforceShiftSwap: ['id', 'status'],
  createWorkforceOvertimeRule: ['name', 'department', 'location_id', 'min_minutes', 'multiplier'],
  submitKpi: ['id'],
  approvePayroll: ['id'],
  markPayrollPaid: ['id'],
  getMyPayrollSlip: ['id'],
  assignRoleToUser: ['id', 'role_ids'],
  assignPermissionToRole: ['id', 'permission_ids'],
  markNotificationRead: ['id'],
  updateLeaveRequest: ['id'],
  cancelLeaveRequest: ['id'],
  exportMyPayrollCsv: ['id'],
  exportMyPayrollPdf: ['id'],
};

const SectionPage = () => {
  const location = useLocation();
  const path = location.pathname;
  const basePath = useMemo(() => getCrudRouteBase(path), [path]);
  const routeCrudMode = useMemo(() => getCrudModeFromPath(path), [path]);
  const activeCrudMode: CrudMode = routeCrudMode ?? 'manage';
  const sectionKey = useMemo(() => getSectionTableKey(path), [path]);
  const section = useMemo(() => getSectionData(path), [path]);
  const Icon = section.icon;
  const [summaryStats, setSummaryStats] = useState<SectionStat[]>([]);
  const [tableColumns, setTableColumns] = useState<string[]>(section.tableColumns);
  const [tableRows, setTableRows] = useState<string[][]>([]);
  const [formState, setFormState] = useState<Record<string, string>>(getFormStateByMode(path, activeCrudMode));
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(null);
  const [, setResponseText] = useState('');
  const [statusMessage, setStatusMessage] = useState('Ready to call API');
  const [loading, setLoading] = useState(false);

  const validateActionRequest = (action: string) => {
    const allowedActions = routeActionMatrix[basePath] ?? [];
    if (!allowedActions.includes(action)) {
      throw new Error(`Action ${action} tidak diizinkan untuk path ${basePath}.`);
    }

    const requiredFields = actionRequiredFields[action] ?? [];
    const missingFields = requiredFields.filter((field) => {
      const value = formState[field];
      if (field === 'employee_ids' || field === 'role_ids' || field === 'permission_ids') {
        return !value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean).length;
      }

      return !value?.trim();
    });

    if (missingFields.length > 0) {
      throw new Error(`Field wajib belum diisi: ${missingFields.join(', ')}`);
    }

    if (action === 'uploadMyDocument' && !selectedDocumentFile) {
      throw new Error('Pilih file dokumen terlebih dahulu.');
    }
  };

  const loadHrSummaryStats = useCallback(async () => {
    const [employeesResult, attendanceResult, pendingLeavesResult, payrollResult] = await Promise.allSettled([
      api.get('/employees'),
      api.get('/attendance/today'),
      api.get('/leaves/pending'),
      api.get('/payroll'),
    ]);

    const employeesCount =
      employeesResult.status === 'fulfilled' ? getCountFromPayload(employeesResult.value.data) : 0;
    const presentTodayCount =
      attendanceResult.status === 'fulfilled' ? getCountFromPayload(attendanceResult.value.data) : 0;
    const pendingLeavesCount =
      pendingLeavesResult.status === 'fulfilled' ? getCountFromPayload(pendingLeavesResult.value.data) : 0;
    const payrollCount =
      payrollResult.status === 'fulfilled' ? getCountFromPayload(payrollResult.value.data) : 0;

    const attendanceRate = employeesCount > 0 ? Math.round((presentTodayCount / employeesCount) * 100) : 0;

    setSummaryStats([
      {
        label: 'Total Employees',
        value: String(employeesCount),
        description: 'Data karyawan aktif',
        variant: 'info',
      },
      {
        label: 'Present Today',
        value: String(presentTodayCount),
        description: `${attendanceRate}% attendance`,
        variant: 'success',
      },
      {
        label: 'Pending Leaves',
        value: String(pendingLeavesCount),
        description: 'Menunggu approval',
        variant: 'warning',
      },
      {
        label: 'Payroll Records',
        value: String(payrollCount),
        description: 'Data payroll tersedia',
        variant: 'default',
      },
    ]);
  }, []);

  useEffect(() => {
    setSummaryStats([]);
    setFormState(getFormStateByMode(path, activeCrudMode));
    setSelectedDocumentFile(null);
    setResponseText('');
    setStatusMessage('Ready to call API');
    setTableColumns(section.tableColumns);
    setTableRows([]);
    if (path === '/hr-summary') {
      void loadHrSummaryStats();
    }
    if (supportsList(path)) {
      void loadList();
    }
  }, [path, activeCrudMode, section.tableColumns, loadHrSummaryStats]);

  const canRefresh = path === '/hr-summary' || supportsList(path);

  const handleRefresh = () => {
    if (path === '/hr-summary') {
      void loadHrSummaryStats();
      return;
    }

    if (supportsList(path)) {
      void loadList();
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setSelectedDocumentFile(file);
    setFormState((prev) => ({ ...prev, file: file?.name ?? '' }));
  };

  const getRequiredProfileId = () => {
    const id = formState.id?.trim();
    if (!id) {
      throw new Error('Profile ID wajib diisi untuk operasi detail, update, atau delete.');
    }
    return id;
  };

  const getRequiredId = (label: string, field: string = 'id') => {
    const value = formState[field]?.trim();
    if (!value) {
      throw new Error(`${label} wajib diisi.`);
    }

    return value;
  };

  const buildPayloadByKeys = (keys: string[]) => {
    const payload: Record<string, string> = {};

    keys.forEach((key) => {
      const value = formState[key];
      if (typeof value === 'string' && value !== '') {
        payload[key] = value;
      }
    });

    return payload;
  };

  const buildProfilePayload = () => {
    const { id: _id, ...payload } = formState;
    return payload;
  };

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2));
  };

  const loadList = async () => {
    setLoading(true);
    setStatusMessage('Memuat data...');

    try {
      let result;
      switch (basePath) {
        case '/profiles':
          result = await api.get('/profiles');
          break;
        case '/employees':
          result = await api.get('/employees');
          break;
        case '/leave/requests':
          result = await api.get('/leaves');
          break;
        case '/leave/my-leave':
          result = await api.get('/leaves/my');
          break;
        case '/leave/approval':
          result = await api.get('/leaves/pending');
          break;
        case '/leave/type':
        case '/leave/policy':
          result = await api.get('/leave-policies');
          break;
        case '/attendance':
        case '/attendance/daily':
          result = await api.get('/attendance/all');
          break;
        case '/attendance/timesheet':
          result = await api.get('/attendance/history');
          break;
        case '/attendance/shifts':
          result = await api.get('/work-schedules');
          break;
        case '/attendance/overtime':
          result = await api.get('/attendance/overtime', { params: { days: 30 } });
          break;
        case '/attendance/reports':
          result = await api.get('/attendance/intelligence', { params: { days: 30 } });
          break;
        case '/attendance/history':
          result = await api.get('/attendance/history');
          break;
        case '/attendance/today':
          result = await api.get('/attendance/today');
          break;
        case '/payroll':
        case '/payroll/tax':
        case '/payroll/reports':
          result = await api.get('/payroll');
          break;
        case '/reimbursements':
        case '/expense/submit':
        case '/expense/list':
          result = await api.get('/reimbursements');
          break;
        case '/expense/approval':
          result = await api.get('/reimbursements', { params: { status: 'submitted' } });
          break;
        case '/expense/categories':
        case '/expense/reports':
          result = await api.get('/reimbursements/statistics');
          break;
        case '/my/reimbursements':
          result = await api.get('/my/reimbursements');
          break;
        case '/assets':
          result = await api.get('/assets');
          if (result && result.data && result.data.data) {
            // Cek jika data paginasi (ada .data di dalam .data)
            const paged = result.data.data;
            const assets = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(assets);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(assets.length === 0 ? 'Belum ada aset.' : 'Data aset berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/assets/assignments':
          result = await api.get('/assets');
          break;
        case '/my/assets':
          result = await api.get('/my/assets');
          if (result && result.data && Array.isArray(result.data.data)) {
            const assets = result.data.data;
            formatResponse(assets);
            const parsed = parsePayloadToTable(assets);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(assets.length === 0 ? 'Belum ada aset.' : 'Data aset berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/my/documents':
          result = await api.get('/my/documents');
          if (result && result.data && result.data.data) {
            // Cek jika data paginasi (ada .data di dalam .data)
            const paged = result.data.data;
            const docs = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(docs);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(docs.length === 0 ? 'Belum ada dokumen.' : 'Data dokumen berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/documents/review':
          result = await api.get('/documents', { params: { status: 'pending', per_page: 15 } });
          if (result && result.data && result.data.data) {
            // Cek jika data paginasi (ada .data di dalam .data)
            const paged = result.data.data;
            const docs = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(docs);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(docs.length === 0 ? 'Belum ada dokumen.' : 'Data dokumen berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/documents/expiring':
          result = await api.get('/documents/expiring', { params: { days: 30 } });
          break;
        case '/organization/directory':
          result = await api.get('/organization/directory');
          // Ambil langsung array employee dari response
          if (result && result.data && result.data.data && Array.isArray(result.data.data.data)) {
            const payload = result.data.data.data;
            formatResponse(payload);
            const parsed = parsePayloadToTable(payload);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage('Data berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/organization/summary':
          result = await api.get('/organization/summary');
          if (result && result.data && result.data.data) {
            const payload = result.data.data;
            // Tampilkan summary utama sebagai statistik
            if (payload.summary) {
              setSummaryStats([
                { label: 'Total Employees', value: String(payload.summary.total_employees), description: '', variant: 'info' },
                { label: 'Active', value: String(payload.summary.active_employees), description: '', variant: 'success' },
                { label: 'Inactive', value: String(payload.summary.inactive_employees), description: '', variant: 'default' },
                { label: 'Onboarding', value: String(payload.summary.onboarding_employees), description: '', variant: 'info' },
                { label: 'Probation', value: String(payload.summary.probation_employees), description: '', variant: 'warning' },
                { label: 'Offboarding', value: String(payload.summary.offboarding_employees), description: '', variant: 'warning' },
                { label: 'Terminated', value: String(payload.summary.terminated_employees), description: '', variant: 'danger' },
              ]);
            }
            // Tampilkan by_department sebagai tabel utama
            if (Array.isArray(payload.by_department)) {
              const parsed = parsePayloadToTable(payload.by_department);
              setTableColumns(parsed.columns);
              setTableRows(parsed.rows);
            } else {
              setTableColumns([]);
              setTableRows([]);
            }
            setStatusMessage('Data summary berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/organization/chart':
          result = await api.get('/organization/chart');
          if (result && result.data && result.data.data && Array.isArray(result.data.data.nodes)) {
            const payload = result.data.data.nodes;
            formatResponse(payload);
            const parsed = parsePayloadToTable(payload);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage('Data struktur organisasi berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/organization/team':
          result = await api.get(`/organization/team/${formState.manager_user_id || '1'}`);
          break;
        case '/organization/master-data':
          result = await api.get('/organization/master-data');
          if (result && result.data && result.data.data) {
            const payload = result.data.data;
            // Gabungkan semua kategori ke satu tabel rapi
            const departments = Array.isArray(payload.departments) ? payload.departments : [];
            const positions = Array.isArray(payload.positions) ? payload.positions : [];
            const statuses = Array.isArray(payload.statuses) ? payload.statuses : [];
            const locations = Array.isArray(payload.locations) ? payload.locations : [];
            const workSchedules = Array.isArray(payload.work_schedules) ? payload.work_schedules : [];

            // Cari panjang maksimum
            const maxLength = Math.max(
              departments.length,
              positions.length,
              statuses.length,
              locations.length,
              workSchedules.length
            );

            // Buat baris-baris tabel, setiap baris berisi satu data dari tiap kategori (atau kosong jika tidak ada)
            const rows: string[][] = [];
            for (let i = 0; i < maxLength; i++) {
              rows.push([
                departments[i] || '',
                positions[i] || '',
                statuses[i] || '',
                locations[i] || '',
                workSchedules[i] || '',
              ]);
            }

            setTableColumns([
              'Department',
              'Position',
              'Status',
              'Location',
              'Work Schedule',
            ]);
            setTableRows(rows);
            formatResponse(payload);
            setStatusMessage('Data master berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/approval-flows':
          result = await api.get('/approval-flows');
          break;
        case '/compliance/overview':
          result = await api.get('/compliance/overview');
          break;
        case '/compliance/audit-summary':
          result = await api.get('/compliance/audit-summary');
          break;
        case '/compliance/expiring-documents':
          result = await api.get('/compliance/expiring-documents', {
            params: { days: formState.days || 30 },
          });
          break;
        case '/my/requests':
          result = await api.get('/my/requests', {
            params: {
              status: formState.status || undefined,
              per_page: formState.per_page ? Number(formState.per_page) : undefined,
            },
          });
          break;
        case '/requests':
        case '/requests/assign':
        case '/requests/status':
          result = await api.get('/requests', {
            params: {
              status: formState.status || 'open',
              per_page: formState.per_page ? Number(formState.per_page) : 15,
            },
          });
          break;
        case '/training/programs':
          result = await api.get('/training/programs');
          if (result && result.data && result.data.data) {
            // Cek jika data paginasi (ada .data di dalam .data)
            const paged = result.data.data;
            const programs = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(programs);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(programs.length === 0 ? 'Belum ada program pelatihan.' : 'Data program pelatihan berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/training/enrollments':
          result = await api.get('/training/programs');
          break;
        case '/my/trainings':
          result = await api.get('/my/trainings');
          break;
        case '/competencies':
          result = await api.get('/competencies');
          if (result && result.data && result.data.data) {
            // Cek jika data paginasi (ada .data di dalam .data)
            const paged = result.data.data;
            const competencies = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(competencies);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(competencies.length === 0 ? 'Belum ada kompetensi.' : 'Data kompetensi berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/my/competencies':
          result = await api.get('/my/competencies');
          break;
        case '/notifications':
          result = await api.get('/notifications');
          break;
        case '/insights/people/detailed':
          result = await api.get('/insights/people/detailed', { params: { window_days: 30, expiring_days: 30 } });
          if (result && result.data && result.data.data) {
            const payload = result.data.data;
            formatResponse(payload);
            // Kumpulkan statistik utama
            const stats = [];
            if (payload.headcount) {
              stats.push({ label: 'Total Employees', value: String(payload.headcount.total), description: '', variant: 'info' });
            }
            if (payload.payroll) {
              stats.push({ label: 'Payroll Records', value: String(payload.payroll.records_count), description: '', variant: 'default' });
              stats.push({ label: 'Total Take Home Pay', value: `Rp${Number(payload.payroll.total_take_home_pay).toLocaleString('id-ID')}`, description: '', variant: 'success' });
              stats.push({ label: 'Total Deduction', value: `Rp${Number(payload.payroll.total_deduction).toLocaleString('id-ID')}`, description: '', variant: 'danger' });
            }
            if (payload.reimbursement) {
              stats.push({ label: 'Reimbursements', value: String(payload.reimbursement.records_count), description: '', variant: 'default' });
              stats.push({ label: 'Pending Reimbursements', value: String(payload.reimbursement.pending_count), description: '', variant: 'warning' });
              stats.push({ label: 'Total Reimburse Amount', value: `Rp${Number(payload.reimbursement.total_amount).toLocaleString('id-ID')}`, description: '', variant: 'success' });
              stats.push({ label: 'Pending Amount', value: `Rp${Number(payload.reimbursement.pending_amount).toLocaleString('id-ID')}`, description: '', variant: 'warning' });
            }
            if (payload.leave) {
              stats.push({ label: 'Total Leave Pending', value: String(payload.leave.by_status?.pending ?? 0), description: '', variant: 'warning' });
              stats.push({ label: 'Total Leave Approved', value: String(payload.leave.by_status?.approved ?? 0), description: '', variant: 'success' });
              stats.push({ label: 'Total Leave Rejected', value: String(payload.leave.by_status?.rejected ?? 0), description: '', variant: 'danger' });
            }
            if (payload.attendance) {
              stats.push({ label: 'Total Attendance Records', value: String(payload.attendance.total_records), description: '', variant: 'default' });
              stats.push({ label: 'Late Count', value: String(payload.attendance.late_count), description: '', variant: 'warning' });
              stats.push({ label: 'Absent Count', value: String(payload.attendance.absent_count), description: '', variant: 'danger' });
              stats.push({ label: 'Overtime Minutes', value: String(payload.attendance.overtime_minutes), description: '', variant: 'info' });
            }
            if (payload.training) {
              stats.push({ label: 'Training Enrollments', value: String(payload.training.enrollment_count), description: '', variant: 'default' });
              stats.push({ label: 'Training Completed', value: String(payload.training.completed_count), description: '', variant: 'success' });
              stats.push({ label: 'Completion Rate (%)', value: String(payload.training.completion_rate_percent), description: '', variant: 'info' });
            }
            if (payload.helpdesk) {
              stats.push({ label: 'Helpdesk Tickets', value: String(payload.helpdesk.ticket_count), description: '', variant: 'default' });
              stats.push({ label: 'Open Tickets', value: String(payload.helpdesk.open_ticket_count), description: '', variant: 'warning' });
              stats.push({ label: 'Avg Resolution (hrs)', value: String(payload.helpdesk.avg_resolution_hours), description: '', variant: 'info' });
            }
            if (payload.documents) {
              stats.push({ label: 'Total Documents', value: String(payload.documents.total_documents), description: '', variant: 'default' });
              stats.push({ label: 'Expiring Soon', value: String(payload.documents.expiring_soon_count), description: '', variant: 'warning' });
            }
            setSummaryStats(stats);

            // Tampilkan breakdown by_department, by_status, by_type, dsb, sebagai tabel utama jika ada
            // Prioritas: headcount.by_department, leave.by_type, payroll.by_status, helpdesk.by_status, helpdesk.by_priority
            let mainTable: { columns: string[]; rows: string[][] } | null = null;
            if (payload.headcount && payload.headcount.by_department) {
              const byDept = payload.headcount.by_department;
              mainTable = {
                columns: ['Department', 'Employee Count'],
                rows: Object.entries(byDept).map(([dept, count]) => [dept, String(count)]),
              };
            } else if (payload.leave && payload.leave.by_type) {
              const byType = payload.leave.by_type;
              mainTable = {
                columns: ['Leave Type', 'Count'],
                rows: Object.entries(byType).map(([type, count]) => [type, String(count)]),
              };
            } else if (payload.payroll && payload.payroll.by_status) {
              const byStatus = payload.payroll.by_status;
              mainTable = {
                columns: ['Payroll Status', 'Count'],
                rows: Object.entries(byStatus).map(([status, count]) => [status, String(count)]),
              };
            } else if (payload.helpdesk && Array.isArray(payload.helpdesk.by_status)) {
              mainTable = {
                columns: ['Helpdesk Status', 'Count'],
                rows: payload.helpdesk.by_status.map((item: any) => [item.status, String(item.count)]),
              };
            } else if (payload.helpdesk && Array.isArray(payload.helpdesk.by_priority)) {
              mainTable = {
                columns: ['Helpdesk Priority', 'Count'],
                rows: payload.helpdesk.by_priority.map((item: any) => [item.priority, String(item.count)]),
              };
            }
            if (mainTable) {
              setTableColumns(mainTable.columns);
              setTableRows(mainTable.rows);
            } else {
              setTableColumns([]);
              setTableRows([]);
            }
            setStatusMessage('Data insight berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/performance/summary':
          result = await api.get('/performance/summary');
          if (result && result.data && result.data.data) {
            const paged = result.data.data;
            const rows = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(rows);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(rows.length === 0 ? 'Belum ada ringkasan performa.' : 'Data ringkasan performa berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/performance/cycles':
          result = await api.get('/performance/cycles');
          if (result && result.data && result.data.data) {
            const paged = result.data.data;
            const rows = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(rows);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(rows.length === 0 ? 'Belum ada siklus performa.' : 'Data siklus performa berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/performance/reviews':
          result = await api.get('/performance/reviews');
          if (result && result.data && result.data.data) {
            const paged = result.data.data;
            const rows = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(rows);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(rows.length === 0 ? 'Belum ada review performa.' : 'Data review performa berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/performance/okrs':
          result = await api.get('/performance/okrs');
          if (result && result.data && result.data.data) {
            const paged = result.data.data;
            const rows = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(rows);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(rows.length === 0 ? 'Belum ada OKR.' : 'Data OKR berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/performance/360-reviews':
          result = await api.get('/performance/360-reviews');
          if (result && result.data && result.data.data) {
            const paged = result.data.data;
            const rows = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(rows);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(rows.length === 0 ? 'Belum ada 360 review.' : 'Data 360 review berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/performance/calibration':
          result = await api.get('/performance/calibration');
          if (result && result.data && result.data.data) {
            const paged = result.data.data;
            const rows = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(rows);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(rows.length === 0 ? 'Belum ada kalibrasi performa.' : 'Data kalibrasi performa berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/career/idps':
          result = await api.get('/career/idps');
          if (result && result.data && result.data.data) {
            const paged = result.data.data;
            const rows = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(rows);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(rows.length === 0 ? 'Belum ada IDP.' : 'Data IDP berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/career/succession':
          result = await api.get('/career/succession');
          if (result && result.data && result.data.data) {
            const paged = result.data.data;
            const rows = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(rows);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(rows.length === 0 ? 'Belum ada succession plan.' : 'Data succession plan berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/engagement/surveys':
          result = await api.get('/engagement/surveys');
          if (result && result.data && result.data.data) {
            const paged = result.data.data;
            const rows = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(rows);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(rows.length === 0 ? 'Belum ada survei engagement.' : 'Data survei engagement berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/recruitment/openings':
          result = await api.get('/recruitment/openings');
          if (result && result.data && result.data.data) {
            const paged = result.data.data;
            const rows = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(rows);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(rows.length === 0 ? 'Belum ada lowongan.' : 'Data lowongan berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/workforce/holidays':
          result = await api.get('/workforce/holidays');
          if (result && result.data && result.data.data) {
            const paged = result.data.data;
            const rows = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(rows);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(rows.length === 0 ? 'Belum ada hari libur.' : 'Data hari libur berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/workforce/shift-swaps':
          result = await api.get('/workforce/shift-swaps');
          if (result && result.data && result.data.data) {
            const paged = result.data.data;
            const rows = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(rows);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(rows.length === 0 ? 'Belum ada shift swap.' : 'Data shift swap berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/workforce/overtime-rules':
          result = await api.get('/workforce/overtime-rules');
          if (result && result.data && result.data.data) {
            const paged = result.data.data;
            const rows = Array.isArray(paged.data) ? paged.data : [];
            formatResponse(paged);
            const parsed = parsePayloadToTable(rows);
            setTableColumns(parsed.columns);
            setTableRows(parsed.rows);
            setStatusMessage(rows.length === 0 ? 'Belum ada aturan lembur.' : 'Data aturan lembur berhasil dimuat.');
            setLoading(false);
            return;
          }
          break;
        case '/reports/dashboard-summary':
          result = await api.get('/reports/dashboard-summary');
          break;
        case '/reports/attendance':
          result = await api.get('/reports/attendance', {
            params: {
              start_date: formState.start_date || undefined,
              end_date: formState.end_date || undefined,
            },
          });
          break;
        case '/reports/competency':
          result = await api.get('/reports/competency');
          break;
        case '/reports/employee-lifecycle':
          result = await api.get('/reports/employee-lifecycle', {
            params: {
              year: formState.year || undefined,
            },
          });
          break;
        case '/reports/assets':
          result = await api.get('/reports/assets');
          break;
        case '/reports/leave':
          result = await api.get('/reports/leave', {
            params: {
              year: formState.year || undefined,
            },
          });
          break;
        case '/reports/payroll':
          result = await api.get('/reports/payroll', {
            params: {
              start_date: formState.start_date || undefined,
              end_date: formState.end_date || undefined,
            },
          });
          break;
        case '/reports/custom':
          result = await api.get('/insights/people/detailed', {
            params: {
              window_days: formState.window_days || 30,
              expiring_days: formState.expiring_days || 30,
            },
          });
          break;
        case '/settings/company':
          result = await api.get('/locations');
          break;
        case '/settings/user-role':
          result = await api.get('/admin/users');
          break;
        case '/settings/permissions':
          result = await api.get('/admin/permissions');
          break;
        case '/settings/master-data/department':
        case '/settings/master-data/position':
          result = await api.get('/employees');
          break;
        case '/settings/master-data/leave-type':
          result = await api.get('/leave-policies');
          break;
        case '/settings/master-data/expense-category':
          result = await api.get('/reimbursements/statistics');
          break;
        case '/settings/notification':
        case '/settings/logs':
          result = await api.get('/notifications');
          break;
        case '/locations':
          result = await api.get('/locations');
          break;
        case '/admin/users':
          result = await api.get('/admin/users');
          break;
        case '/admin/roles':
          result = await api.get('/admin/roles');
          break;
        case '/admin/permissions':
          result = await api.get('/admin/permissions');
          break;
        case '/my/kpi':
          result = await api.get('/my/kpi');
          break;
        case '/my/payroll':
          result = await api.get('/my/payroll');
          break;
        default:
          result = null;
      }

      if (result) {
        const payload = result.data?.data ?? result.data;
        formatResponse(payload);
        const parsed = parsePayloadToTable(payload);
        setTableColumns(parsed.columns);
        setTableRows(parsed.rows);
        setStatusMessage('Data berhasil dimuat.');
      } else {
        setStatusMessage('Tidak ada data untuk path ini.');
        setTableColumns(section.tableColumns);
        setTableRows([]);
        formatResponse('No list endpoint configured.');
      }
    } catch (error: any) {
      setStatusMessage('Gagal memuat data.');
      formatResponse(error.response?.data ?? error.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (action: string) => {
    setLoading(true);
    setResponseText('');
    setStatusMessage('Mengirim request...');

    try {
      validateActionRequest(action);
      const actionExecutor = createSectionActionExecutor({
        path: basePath,
        formState,
        selectedDocumentFile,
        buildPayloadByKeys,
        buildProfilePayload,
        getRequiredId,
        getRequiredProfileId,
      })[action];

      if (!actionExecutor) {
        throw new Error(`Unhandled action: ${action}`);
      }

      const result = await actionExecutor();

      formatResponse(result.data);
      setStatusMessage('Request berhasil.');
      if (supportsList(path)) {
        void loadList();
      }
    } catch (error: any) {
      setStatusMessage('Request gagal.');
      formatResponse(error.response?.data ?? error.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    const entries = Object.entries(formState);
    if (entries.length === 0) {
      return <p className="action-note">Tidak ada form untuk operasi ini. Gunakan tombol aksi di bawah.</p>;
    }

    return (
      <div className="action-form-grid">
        {entries.map(([key, value]) => (
          <label key={key} className="action-form-group">
            <span>{key.replace(/_/g, ' ').toUpperCase()}</span>
            {key === 'file' ? (
              <>
                <input
                  type="file"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] ?? null)}
                  className="action-input"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                />
                {selectedDocumentFile ? <small>Selected: {selectedDocumentFile.name}</small> : null}
              </>
            ) : selectOptionsByField[key] ? (
              <select
                value={value}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFieldChange(key, e.target.value)}
                className="action-input"
              >
                <option value="">Select {key}</option>
                {selectOptionsByField[key].map((option) => (
                  <option key={`${key}-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : textareaFields.has(key) ? (
              <textarea
                value={value}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleFieldChange(key, e.target.value)}
                placeholder={key}
                className="action-input"
                rows={3}
              />
            ) : (
              <input
                type={dateFields.has(key) ? 'date' : numberFields.has(key) ? 'number' : 'text'}
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange(key, e.target.value)}
                placeholder={key}
                className="action-input"
                step={numberFields.has(key) ? 'any' : undefined}
              />
            )}
          </label>
        ))}
      </div>
    );
  };

  const renderActionButtons = () => {
    const isCreateMode = activeCrudMode === 'create';

    switch (basePath) {
      case '/profiles':
        return (
          <>
            {isCreateMode ? (
              <Button variant="primary" size="md" onClick={() => void performAction('createProfile')} disabled={loading}>
                Create Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" size="md" onClick={() => void performAction('getProfileDetail')} disabled={loading}>
                  Get Profile Detail
                </Button>
                <Button variant="secondary" size="md" onClick={() => void performAction('updateProfile')} disabled={loading}>
                  Update Profile
                </Button>
                <Button variant="outline" size="md" onClick={() => void performAction('deleteProfile')} disabled={loading}>
                  Delete Profile
                </Button>
              </>
            )}
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Profiles
            </Button>
          </>
        );
      case '/employees/add':
        return (
          <Button variant="primary" size="md" onClick={() => void performAction('createEmployee')} disabled={loading}>
            Create Employee
          </Button>
        );
      case '/employees':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('startOnboarding')} disabled={loading}>
              Start Onboarding
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('completeOnboarding')} disabled={loading}>
              Complete Onboarding
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('startOffboarding')} disabled={loading}>
              Start Offboarding
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('completeOffboarding')} disabled={loading}>
              Complete Offboarding
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Employees
            </Button>
          </>
        );
      case '/leave/requests':
        return (
          <>
            {isCreateMode ? (
              <Button variant="primary" size="md" onClick={() => void performAction('createLeave')} disabled={loading}>
                Submit Leave Request
              </Button>
            ) : (
              <>
                <Button variant="outline" size="md" onClick={() => void performAction('updateLeaveRequest')} disabled={loading}>
                  Update Leave Request
                </Button>
                <Button variant="outline" size="md" onClick={() => void performAction('cancelLeaveRequest')} disabled={loading}>
                  Cancel Leave Request
                </Button>
              </>
            )}
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Leave Data
            </Button>
          </>
        );
      case '/leave/type':
      case '/leave/policy':
        return (
          <>
            {isCreateMode ? (
              <Button variant="primary" size="md" onClick={() => void performAction('createLeavePolicy')} disabled={loading}>
                Create Policy
              </Button>
            ) : (
              <>
                <Button variant="outline" size="md" onClick={() => void performAction('updateLeavePolicy')} disabled={loading}>
                  Update Policy
                </Button>
                <Button variant="outline" size="md" onClick={() => void performAction('deleteLeavePolicy')} disabled={loading}>
                  Delete Policy
                </Button>
              </>
            )}
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Policies
            </Button>
          </>
        );
      case '/leave/approval':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('approveLeave')} disabled={loading}>
              Approve Leave
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('rejectLeave')} disabled={loading}>
              Reject Leave
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Approvals
            </Button>
          </>
        );
      case '/attendance/check-in':
        return (
          <Button variant="primary" size="md" onClick={() => void performAction('checkIn')} disabled={loading}>
            Check In
          </Button>
        );
      case '/attendance/check-out':
        return (
          <Button variant="primary" size="md" onClick={() => void performAction('checkOut')} disabled={loading}>
            Check Out
          </Button>
        );
      case '/my/reimbursements':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createReimbursement')} disabled={loading}>
              Submit Reimbursement
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('submitMyReimbursement')} disabled={loading}>
              Submit Existing Draft
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Reimbursements
            </Button>
          </>
        );
      case '/assets':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createAsset')} disabled={loading}>
              Create Asset
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Assets
            </Button>
          </>
        );
      case '/assets/assignments':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('assignAsset')} disabled={loading}>
              Assign Asset
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('returnAsset')} disabled={loading}>
              Return Asset
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Assignments
            </Button>
          </>
        );
      case '/my/documents':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('uploadMyDocument')} disabled={loading}>
              Upload Document
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Documents
            </Button>
          </>
        );
      case '/documents/review':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('reviewDocument')} disabled={loading}>
              Review Document
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Queue
            </Button>
          </>
        );
      case '/my/requests':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createMyRequest')} disabled={loading}>
              Create Request
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('viewRequestDetail')} disabled={loading}>
              View Request Detail
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('addRequestComment')} disabled={loading}>
              Tambah Komentar
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Permintaan
            </Button>
          </>
        );
      case '/requests/assign':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('assignRequest')} disabled={loading}>
              Tugaskan Permintaan
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Antrian
            </Button>
          </>
        );
      case '/requests':
        return (
          <>
            <Button variant="outline" size="md" onClick={() => void performAction('viewRequestDetail')} disabled={loading}>
              Lihat Detail Permintaan
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Queue
            </Button>
          </>
        );
      case '/requests/status':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('updateRequestStatus')} disabled={loading}>
              Perbarui Status Permintaan
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Queue
            </Button>
          </>
        );
      case '/training/programs':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createTrainingProgram')} disabled={loading}>
              Buat Program
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Program
            </Button>
          </>
        );
      case '/training/enrollments':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('enrollTrainingProgram')} disabled={loading}>
              Daftarkan Karyawan
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('completeTrainingEnrollment')} disabled={loading}>
              Selesaikan Pendaftaran
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Pendaftaran
            </Button>
          </>
        );
      case '/competencies':
      case '/my/competencies':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createCompetency')} disabled={loading}>
              Buat Kompetensi
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('assignCompetency')} disabled={loading}>
              Tugaskan Kompetensi
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Kompetensi
            </Button>
          </>
        );
      case '/approval-flows':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createApprovalFlow')} disabled={loading}>
              Buat Alur Persetujuan
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Alur Persetujuan
            </Button>
          </>
        );
      case '/performance/cycles':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createPerformanceCycle')} disabled={loading}>
              Buat Siklus
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Siklus
            </Button>
          </>
        );
      case '/performance/reviews':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createPerformanceReview')} disabled={loading}>
              Buat Review
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Review
            </Button>
          </>
        );
      case '/performance/okrs':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createPerformanceOkr')} disabled={loading}>
              Buat OKR
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang OKR
            </Button>
          </>
        );
      case '/performance/360-reviews':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createPerformance360Review')} disabled={loading}>
              Buat 360 Review
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang 360 Review
            </Button>
          </>
        );
      case '/performance/calibration':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createPerformanceCalibration')} disabled={loading}>
              Buat Sesi Kalibrasi
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Kalibrasi
            </Button>
          </>
        );
      case '/career/idps':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createCareerIdp')} disabled={loading}>
              Buat IDP
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang IDP
            </Button>
          </>
        );
      case '/career/succession':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createCareerSuccession')} disabled={loading}>
              Buat Kandidat Suksesi
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Matriks Suksesi
            </Button>
          </>
        );
      case '/engagement/surveys':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createEngagementSurvey')} disabled={loading}>
              Buat Survei
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Survei
            </Button>
          </>
        );
      case '/workforce/holidays':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createWorkforceHolidayCalendar')} disabled={loading}>
              Buat Kalender Libur
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Hari Libur
            </Button>
          </>
        );
      case '/workforce/shift-swaps':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createWorkforceShiftSwap')} disabled={loading}>
              Buat Tukar Shift
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('updateWorkforceShiftSwap')} disabled={loading}>
              Perbarui Status Tukar Shift
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Tukar Shift
            </Button>
          </>
        );
      case '/workforce/overtime-rules':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createWorkforceOvertimeRule')} disabled={loading}>
              Buat Aturan Lembur
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Aturan Lembur
            </Button>
          </>
        );
      case '/notifications':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('markNotificationRead')} disabled={loading}>
              Tandai Satu Sudah Dibaca
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('markAllNotificationsRead')} disabled={loading}>
              Tandai Semua Sudah Dibaca
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('getNotificationUnreadCount')} disabled={loading}>
              Hitung Notifikasi Belum Dibaca
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Notifikasi
            </Button>
          </>
        );
      case '/insights/people/detailed':
      case '/organization/directory':
      case '/organization/summary':
      case '/organization/chart':
      case '/organization/team':
      case '/organization/master-data':
      case '/compliance/overview':
      case '/compliance/audit-summary':
      case '/compliance/expiring-documents':
      case '/performance/summary':
      case '/recruitment/openings':
      case '/documents/expiring':
      case '/my/assets':
      case '/my/trainings':
      case '/attendance/daily':
      case '/attendance/timesheet':
      case '/attendance/shifts':
      case '/attendance/overtime':
      case '/attendance/reports':
      case '/payroll/tax':
      case '/payroll/reports':
      case '/expense/submit':
      case '/expense/list':
      case '/expense/categories':
      case '/expense/reports':
      case '/settings/company':
      case '/settings/user-role':
      case '/settings/permissions':
      case '/settings/master-data/department':
      case '/settings/master-data/position':
      case '/settings/master-data/leave-type':
      case '/settings/master-data/expense-category':
      case '/settings/notification':
      case '/settings/logs':
        return (
          <>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Data
            </Button>
          </>
        );
      case '/reports/attendance':
      case '/reports/leave':
      case '/reports/payroll':
      case '/reports/dashboard-summary':
      case '/reports/competency':
      case '/reports/employee-lifecycle':
      case '/reports/assets':
      case '/reports/custom':
        return (
          <>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Terapkan Filter Laporan
            </Button>
          </>
        );
      case '/my/kpi':
        return (
          <Button variant="primary" size="md" onClick={() => void performAction('submitKpi')} disabled={!formState.id || loading}>
            Submit KPI
          </Button>
        );
      case '/payroll':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('generatePayroll')} disabled={loading}>
              Proses Payroll Bulanan
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('approvePayroll')} disabled={loading}>
              Setujui Payroll
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('markPayrollPaid')} disabled={loading}>
              Tandai Payroll Sudah Dibayar
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Payroll
            </Button>
          </>
        );
      case '/locations':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createLocation')} disabled={loading}>
              Tambah Lokasi
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Lokasi
            </Button>
          </>
        );
      case '/reimbursements':
        return (
          <>
            {isCreateMode ? (
                <Button variant="primary" size="md" onClick={() => void performAction('createReimbursementAdmin')} disabled={loading}>
                  Buat Reimburse
              </Button>
            ) : (
              <>
                <Button variant="outline" size="md" onClick={() => void performAction('approveReimbursement')} disabled={loading}>
                  Setujui Reimburse
                </Button>
                <Button variant="outline" size="md" onClick={() => void performAction('rejectReimbursement')} disabled={loading}>
                  Tolak Reimburse
                </Button>
                <Button variant="outline" size="md" onClick={() => void performAction('markReimbursementPaid')} disabled={loading}>
                  Tandai Sudah Dibayar
                </Button>
              </>
            )}
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Reimburse
            </Button>
          </>
        );
      case '/expense/approval':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('approveReimbursement')} disabled={loading}>
              Setujui Reimburse
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('rejectReimbursement')} disabled={loading}>
              Tolak Reimburse
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('markReimbursementPaid')} disabled={loading}>
              Tandai Sudah Dibayar
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Antrian Persetujuan
            </Button>
          </>
        );
      case '/my/payroll':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('submitMyPayroll')} disabled={loading}>
              Muat Ulang Payroll Saya
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('getMyPayrollSlip')} disabled={loading}>
              Lihat Slip Gaji
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('exportMyPayrollCsv')} disabled={loading}>
              Ekspor Payroll CSV
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('exportMyPayrollPdf')} disabled={loading}>
              Ekspor Payroll PDF
            </Button>
          </>
        );
      case '/admin/users':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('assignRoleToUser')} disabled={loading}>
              Tugaskan Peran ke Pengguna
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Pengguna
            </Button>
          </>
        );
      case '/admin/roles':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('assignPermissionToRole')} disabled={loading}>
              Tugaskan Izin ke Peran
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Peran
            </Button>
          </>
        );
      case '/admin/permissions':
        return (
          <>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Muat Ulang Izin
            </Button>
          </>
        );
      default:
        return supportsList(path) ? (
          <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
            Muat Ulang Data
          </Button>
        ) : null;
    }
  };

  return (
    <div className={`section-page section-variant-${sectionKey}`}>
      <div className="section-header">
        <div className="section-header-left">
          <div className="section-icon" style={{ backgroundColor: section.color + '22' }}>
            <Icon size={22} color={section.color} />
          </div>
          <div>
            <h1 className="section-title">{section.title}</h1>
            <p className="section-subtitle">{section.subtitle}</p>
          </div>
        </div>

        <div className="section-actions">
          <Button variant="outline" size="md" onClick={handleRefresh} disabled={loading || !canRefresh}>
            <Search size={16} />
            Muat Ulang
          </Button>
        </div>
      </div>

      {summaryStats.length > 0 && (
        <div className="section-summary-grid">
          {summaryStats.map((stat) => (
            <Card key={stat.label} className="summary-card" glass>
              <div className="summary-card-top">
                <span className="summary-card-label">{stat.label}</span>
                <Badge variant={stat.variant}>{stat.description}</Badge>
              </div>
              <h3 className="summary-card-value">{stat.value}</h3>
            </Card>
          ))}
        </div>
      )}

      <Card className="section-action-card" glass>
        <div className="section-action-header">
          <div>
            <h2>Panel Kontrol</h2>
            <p>
              {supportsCrudModeSplit(path)
                ? `Route aktif: ${activeCrudMode === 'create' ? 'Halaman Tambah' : 'Halaman Kelola'} (dipisah per halaman).`
                : 'Gunakan panel ini untuk memanggil endpoint sesuai Postman API.'}
            </p>
          </div>
          <div className="action-status-wrap">
            <span className="action-status">{statusMessage}</span>
            {loading && <span className="action-loading">Memuat…</span>}
          </div>
        </div>

        <div className="section-action-grid">
          <div className="section-action-form">
            {renderFormFields()}
            <div className="section-action-buttons">{renderActionButtons()}</div>
          </div>
        </div>
      </Card>

      <Card className="section-table-card" glass>
        <div className="section-table-header">
          <div>
            <h2>Data {section.title}</h2>
            <p>{section.subtitle}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={loading || !canRefresh}>
            Muat Ulang Data
          </Button>
        </div>

        <div className="ui-table-overflow">
          <table className="ui-table">
            <thead>
              <tr>
                {tableColumns.map((column: string) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.length > 0 ? (
                tableRows.map((row: string[], idx: number) => (
                  <tr key={idx}>
                    {row.map((cell: string, cellIndex: number) => (
                      <td key={`${idx}-${cellIndex}`}>{cell}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={tableColumns.length}>Tidak ada data API untuk section ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ui-table-pagination">
          <span className="pagination-info">Menampilkan 1 sampai {tableRows.length} entri</span>
          <div className="pagination-controls">
            <button type="button">Sebelumnya</button>
            <button type="button">Berikutnya</button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SectionPage;
