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
    title: 'Dashboard Overview',
    subtitle: 'Ringkasan HRIS utama dengan KPI, aktivitas, dan tren yang paling penting.',
    icon: BarChart3,
    color: '#2563EB',
  },
  'hr-summary': {
    title: 'HR Summary',
    subtitle: 'Intisari data SDM, headcount, turnover, dan absensi.',
    icon: Users,
    color: '#2563EB',
  },
  analytics: {
    title: 'Analytics',
    subtitle: 'Analisa performa tim, ketidakhadiran, dan produktivitas secara realtime.',
    icon: BarChart3,
    color: '#2563EB',
  },
  employees: {
    title: 'Employee Management',
    subtitle: 'Kelola data karyawan, posisi, dan struktur organisasi.',
    icon: Users,
    color: '#2563EB',
  },
  organization: {
    title: 'Organization Structure',
    subtitle: 'Atur departemen dan posisi yang ada di perusahaan.',
    icon: Network,
    color: '#2563EB',
  },
  employment: {
    title: 'Employment Management',
    subtitle: 'Status kerja, riwayat gaji, dan data karir karyawan.',
    icon: Briefcase,
    color: '#2563EB',
  },
  documents: {
    title: 'Documents',
    subtitle: 'Dokumentasi karyawan yang tersimpan, seperti KTP dan kontrak.',
    icon: FileText,
    color: '#2563EB',
  },
  attendance: {
    title: 'Attendance',
    subtitle: 'Lihat kehadiran harian, timesheet, shift, dan lembur.',
    icon: Clock,
    color: '#2563EB',
  },
  leave: {
    title: 'Leave Management',
    subtitle: 'Kelola izin, saldo cuti, dan kalender cuti karyawan.',
    icon: CalendarDays,
    color: '#2563EB',
  },
  payroll: {
    title: 'Payroll',
    subtitle: 'Proses gaji, slip, komponen upah, dan laporan payroll.',
    icon: CreditCard,
    color: '#2563EB',
  },
  expense: {
    title: 'Reimbursement',
    subtitle: 'Klaim biaya operasional dan persetujuan reimburse.',
    icon: Receipt,
    color: '#2563EB',
  },
  performance: {
    title: 'Performance',
    subtitle: 'Tujuan, review, dan umpan balik karyawan. Kelola KPI di menu terpisah.',
    icon: Target,
    color: '#2563EB',
  },
  ess: {
    title: 'Employee Self Service',
    subtitle: 'Akses mandiri karyawan untuk profil, absen, dan slip gaji.',
    icon: UserCircle,
    color: '#2563EB',
  },
  reports: {
    title: 'Reports & Analytics',
    subtitle: 'Laporan SDM, absensi, cuti, payroll, dan analitik khusus.',
    icon: FileText,
    color: '#2563EB',
  },
  assets: {
    title: 'Assets & Inventory',
    subtitle: 'Kelola aset perusahaan, assignment, dan pengembalian aset karyawan.',
    icon: Briefcase,
    color: '#2563EB',
  },
  training: {
    title: 'Training Programs',
    subtitle: 'Rancang program training dan pantau enrollment sampai completion.',
    icon: Target,
    color: '#2563EB',
  },
  competencies: {
    title: 'Competency Management',
    subtitle: 'Kelola competency matrix dan assignment kompetensi ke karyawan.',
    icon: Target,
    color: '#2563EB',
  },
  requests: {
    title: 'HR Service Requests',
    subtitle: 'Pantau ticket HR, assignment PIC, dan update status request.',
    icon: FileText,
    color: '#2563EB',
  },
  notifications: {
    title: 'Notification Center',
    subtitle: 'Notifikasi approval, reminder, dan pembaruan status lintas modul.',
    icon: Settings,
    color: '#2563EB',
  },
  insights: {
    title: 'People Insights',
    subtitle: 'Dashboard insight lintas attendance, leave, payroll, reimbursement, dan training.',
    icon: BarChart3,
    color: '#2563EB',
  },
  settings: {
    title: 'System Settings',
    subtitle: 'Pengaturan perusahaan, pengguna, peran, dan master data.',
    icon: Settings,
    color: '#2563EB',
  },
  '/my/kpi': {
    title: 'My KPI',
    subtitle: 'Cek KPI pribadi dan submit target yang sudah selesai.',
    icon: Target,
    color: '#2563EB',
  },
  '/my/reimbursements': {
    title: 'My Reimbursements',
    subtitle: 'Lihat klaim Anda dan ajukan reimbursement baru.',
    icon: Receipt,
    color: '#2563EB',
  },
  '/attendance/check-in': {
    title: 'Attendance Check-in',
    subtitle: 'Hit API check-in untuk mencatat kehadiran lokasi.',
    icon: MapPin,
    color: '#2563EB',
  },
  '/attendance/check-out': {
    title: 'Attendance Check-out',
    subtitle: 'Hit API check-out setelah selesai bekerja.',
    icon: MapPin,
    color: '#2563EB',
  },
  '/attendance/history': {
    title: 'Attendance History',
    subtitle: 'Lihat riwayat absensi harian dan jam kerja Anda.',
    icon: CalendarDays,
    color: '#2563EB',
  },
  '/attendance/today': {
    title: "Today's Attendance",
    subtitle: 'Lihat status kehadiran hari ini dan jam masuk/pulang terbaru.',
    icon: CalendarDays,
    color: '#2563EB',
  },
  '/profiles': {
    title: 'Profiles',
    subtitle: 'Kelola profil karyawan dan informasi kontak.',
    icon: UserCircle,
    color: '#2563EB',
  },
  '/my/payroll': {
    title: 'My Payroll',
    subtitle: 'Lihat ringkasan payroll pribadi Anda.',
    icon: CreditCard,
    color: '#2563EB',
  },
  '/locations': {
    title: 'Locations',
    subtitle: 'Kelola wilayah dan radius lokasi absensi.',
    icon: MapPin,
    color: '#2563EB',
  },
  '/admin/users': {
    title: 'User Management',
    subtitle: 'Kelola akun administrator dan karyawan.',
    icon: UserCircle,
    color: '#2563EB',
  },
  '/admin/roles': {
    title: 'Role Management',
    subtitle: 'Tetapkan peran dan level akses pengguna.',
    icon: ShieldCheck,
    color: '#2563EB',
  },
  '/admin/permissions': {
    title: 'Permissions',
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
      return { name: '', code: '', category: '', duration_hours: '', start_date: '', end_date: '' };
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
      return { status: '', start_date: '', end_date: '' };
    case '/reports/payroll':
      return { period: '', status: '' };
    case '/reports/custom':
      return { window_days: '30', expiring_days: '30' };
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
          return value === undefined || value === null ? '-' : String(value);
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
  category: ['travel', 'meals', 'office_supplies', 'client_entertainment', 'other'],
  is_paid: ['true', 'false'],
};

const dateFields = new Set(['start_date', 'end_date', 'hire_date', 'expense_date', 'issue_date', 'expiry_date', 'assigned_at', 'expected_return_date', 'period']);
const numberFields = new Set(['amount', 'salary', 'duration_hours', 'level', 'radius', 'latitude', 'longitude', 'entitlement_value', 'max_carryover_days', 'per_page', 'window_days', 'expiring_days']);
const textareaFields = new Set(['description', 'reason', 'remarks', 'approval_notes', 'approval_note', 'rejection_note', 'completion_notes', 'comment_text', 'lifecycle_notes']);

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
  const [responseText, setResponseText] = useState('');
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
          break;
        case '/assets/assignments':
          result = await api.get('/assets');
          break;
        case '/my/assets':
          result = await api.get('/my/assets');
          break;
        case '/my/documents':
          result = await api.get('/my/documents');
          break;
        case '/documents/review':
          result = await api.get('/documents', { params: { status: 'pending', per_page: 15 } });
          break;
        case '/documents/expiring':
          result = await api.get('/documents/expiring', { params: { days: 30 } });
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
          break;
        case '/training/enrollments':
          result = await api.get('/training/programs');
          break;
        case '/my/trainings':
          result = await api.get('/my/trainings');
          break;
        case '/competencies':
          result = await api.get('/competencies');
          break;
        case '/my/competencies':
          result = await api.get('/my/competencies');
          break;
        case '/notifications':
          result = await api.get('/notifications');
          break;
        case '/insights/people/detailed':
          result = await api.get('/insights/people/detailed', { params: { window_days: 30, expiring_days: 30 } });
          break;
        case '/reports/attendance':
          result = await api.get('/attendance/intelligence', {
            params: {
              days: formState.window_days || 30,
              start_date: formState.start_date || undefined,
              end_date: formState.end_date || undefined,
            },
          });
          break;
        case '/reports/leave':
          result = await api.get('/leaves', {
            params: {
              status: formState.status || undefined,
              start_date: formState.start_date || undefined,
              end_date: formState.end_date || undefined,
            },
          });
          break;
        case '/reports/payroll':
          result = await api.get('/payroll', {
            params: {
              period: formState.period || undefined,
              status: formState.status || undefined,
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
              Add Comment
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Requests
            </Button>
          </>
        );
      case '/requests/assign':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('assignRequest')} disabled={loading}>
              Assign Request
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Queue
            </Button>
          </>
        );
      case '/requests':
        return (
          <>
            <Button variant="outline" size="md" onClick={() => void performAction('viewRequestDetail')} disabled={loading}>
              View Request Detail
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
              Update Request Status
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
              Create Program
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Programs
            </Button>
          </>
        );
      case '/training/enrollments':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('enrollTrainingProgram')} disabled={loading}>
              Enroll Employees
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('completeTrainingEnrollment')} disabled={loading}>
              Complete Enrollment
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Enrollments
            </Button>
          </>
        );
      case '/competencies':
      case '/my/competencies':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createCompetency')} disabled={loading}>
              Create Competency
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('assignCompetency')} disabled={loading}>
              Assign Competency
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Competencies
            </Button>
          </>
        );
      case '/notifications':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('markNotificationRead')} disabled={loading}>
              Mark One as Read
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('markAllNotificationsRead')} disabled={loading}>
              Mark All as Read
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('getNotificationUnreadCount')} disabled={loading}>
              Get Unread Count
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Notifications
            </Button>
          </>
        );
      case '/insights/people/detailed':
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
              Refresh Data
            </Button>
          </>
        );
      case '/reports/attendance':
      case '/reports/leave':
      case '/reports/payroll':
      case '/reports/custom':
        return (
          <>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Apply Report Filters
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
              Generate Monthly Payroll
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('approvePayroll')} disabled={loading}>
              Approve Payroll
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('markPayrollPaid')} disabled={loading}>
              Mark Payroll as Paid
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Payroll
            </Button>
          </>
        );
      case '/locations':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createLocation')} disabled={loading}>
              Create Location
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Locations
            </Button>
          </>
        );
      case '/reimbursements':
        return (
          <>
            {isCreateMode ? (
              <Button variant="primary" size="md" onClick={() => void performAction('createReimbursementAdmin')} disabled={loading}>
                Create Reimbursement
              </Button>
            ) : (
              <>
                <Button variant="outline" size="md" onClick={() => void performAction('approveReimbursement')} disabled={loading}>
                  Approve Reimbursement
                </Button>
                <Button variant="outline" size="md" onClick={() => void performAction('rejectReimbursement')} disabled={loading}>
                  Reject Reimbursement
                </Button>
                <Button variant="outline" size="md" onClick={() => void performAction('markReimbursementPaid')} disabled={loading}>
                  Mark as Paid
                </Button>
              </>
            )}
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Reimbursements
            </Button>
          </>
        );
      case '/expense/approval':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('approveReimbursement')} disabled={loading}>
              Approve Reimbursement
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('rejectReimbursement')} disabled={loading}>
              Reject Reimbursement
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('markReimbursementPaid')} disabled={loading}>
              Mark as Paid
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Approval Queue
            </Button>
          </>
        );
      case '/my/payroll':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('submitMyPayroll')} disabled={loading}>
              Refresh My Payroll
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('getMyPayrollSlip')} disabled={loading}>
              Get Payroll Slip
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('exportMyPayrollCsv')} disabled={loading}>
              Export Payroll CSV
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('exportMyPayrollPdf')} disabled={loading}>
              Export Payroll PDF
            </Button>
          </>
        );
      case '/admin/users':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('assignRoleToUser')} disabled={loading}>
              Assign Role to User
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Users
            </Button>
          </>
        );
      case '/admin/roles':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('assignPermissionToRole')} disabled={loading}>
              Assign Permission to Role
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Roles
            </Button>
          </>
        );
      case '/admin/permissions':
        return (
          <>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Permissions
            </Button>
          </>
        );
      default:
        return supportsList(path) ? (
          <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
            Refresh Data
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
            Refresh
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
            <h2>Control Panel</h2>
            <p>
              {supportsCrudModeSplit(path)
                ? `Route aktif: ${activeCrudMode === 'create' ? 'Create Page' : 'Manage Page'} (dipisah per halaman).`
                : 'Gunakan panel ini untuk memanggil endpoint sesuai Postman API.'}
            </p>
          </div>
          <div className="action-status-wrap">
            <span className="action-status">{statusMessage}</span>
            {loading && <span className="action-loading">Loading…</span>}
          </div>
        </div>

        <div className="section-action-grid">
          <div className="section-action-form">
            {renderFormFields()}
            <div className="section-action-buttons">{renderActionButtons()}</div>
          </div>
          <div className="section-action-response">
            <div className="response-header">
              <ShieldCheck size={18} />
              <span>Response</span>
            </div>
            <pre className="action-response">{responseText || 'Hasil response akan tampil di sini.'}</pre>
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
            Refresh Data
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
                  <td colSpan={tableColumns.length}>No API data available for this section.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ui-table-pagination">
          <span className="pagination-info">Showing 1 to {tableRows.length} entries</span>
          <div className="pagination-controls">
            <button type="button">Prev</button>
            <button type="button">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SectionPage;
