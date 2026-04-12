import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { api } from '@/shared/api/httpClient';
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
  return (
    [
    '/profiles',
    '/employees',
    '/leave/requests',
    '/leave/my-leave',
    '/leave/approval',
    '/attendance',
    '/attendance/history',
    '/attendance/today',
    '/payroll',
    '/reimbursements',
    '/my/reimbursements',
    '/my/kpi',
    '/my/payroll',
    '/locations',
    '/admin/users',
    '/admin/roles',
    '/admin/permissions',
    ].includes(pathname)
  );
};

const getDefaultFormState = (pathname: string) => {
  switch (pathname) {
    case '/profiles':
      return { id: '', phone: '', address: '', city: '', province: '', postal_code: '' };
    case '/employees/add':
      return { user_id: '', employee_code: '', position: '', department: '', hire_date: '', salary: '' };
    case '/leave/requests':
      return { type: '', start_date: '', end_date: '', total_days: '', reason: '' };
    case '/attendance/check-in':
      return { latitude: '', longitude: '' };
    case '/attendance/check-out':
      return {};
    case '/my/reimbursements':
      return { title: '', description: '', amount: '', category: '', expense_date: '', receipt_path: '' };
    case '/my/kpi':
      return { id: '' };
    case '/my/payroll':
      return { employee_id: '', period: '' };
    case '/locations':
      return { name: '', latitude: '', longitude: '', radius: '' };
    case '/reimbursements':
      return { title: '', description: '', amount: '', category: '', expense_date: '', receipt_path: '' };
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

const SectionPage = () => {
  const location = useLocation();
  const path = location.pathname;
  const sectionKey = useMemo(() => getSectionTableKey(path), [path]);
  const section = useMemo(() => getSectionData(path), [path]);
  const Icon = section.icon;
  const [summaryStats, setSummaryStats] = useState<SectionStat[]>([]);
  const [tableColumns, setTableColumns] = useState<string[]>(section.tableColumns);
  const [tableRows, setTableRows] = useState<string[][]>([]);
  const [formState, setFormState] = useState<Record<string, string>>(getDefaultFormState(path));
  const [responseText, setResponseText] = useState('');
  const [statusMessage, setStatusMessage] = useState('Ready to call API');
  const [loading, setLoading] = useState(false);

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
    setFormState(getDefaultFormState(path));
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
  }, [path, section.tableColumns, loadHrSummaryStats]);

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

  const getRequiredProfileId = () => {
    const id = formState.id?.trim();
    if (!id) {
      throw new Error('Profile ID wajib diisi untuk operasi detail, update, atau delete.');
    }
    return id;
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
      switch (path) {
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
        case '/attendance':
          result = await api.get('/attendance/all');
          break;
        case '/attendance/history':
          result = await api.get('/attendance/history');
          break;
        case '/attendance/today':
          result = await api.get('/attendance/today');
          break;
        case '/payroll':
          result = await api.get('/payroll');
          break;
        case '/reimbursements':
          result = await api.get('/reimbursements');
          break;
        case '/my/reimbursements':
          result = await api.get('/my/reimbursements');
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
      let result;
      switch (action) {
        case 'createProfile':
          result = await api.post('/profiles', buildProfilePayload());
          break;
        case 'getProfileDetail': {
          const id = getRequiredProfileId();
          result = await api.get(`/profiles/${id}`);
          break;
        }
        case 'updateProfile': {
          const id = getRequiredProfileId();
          result = await api.put(`/profiles/${id}`, buildProfilePayload());
          break;
        }
        case 'deleteProfile': {
          const id = getRequiredProfileId();
          result = await api.delete(`/profiles/${id}`);
          break;
        }
        case 'createEmployee':
          result = await api.post('/employees', formState);
          break;
        case 'createLeave':
          result = await api.post('/leaves', formState);
          break;
        case 'checkIn':
          result = await api.post('/attendance/check-in', formState);
          break;
        case 'checkOut':
          result = await api.post('/attendance/check-out');
          break;
        case 'createReimbursement':
          result = await api.post('/my/reimbursements', formState);
          break;
        case 'submitKpi':
          result = await api.post(`/my/kpi/${formState.id}/submit`);
          break;
        case 'generatePayroll':
          result = await api.post('/payroll/generate/monthly', { period: formState.period });
          break;
        case 'createLocation':
          result = await api.post('/locations', formState);
          break;
        case 'createReimbursementAdmin':
          result = await api.post('/reimbursements', formState);
          break;
        case 'submitMyPayroll':
          result = await api.get('/my/payroll');
          break;
        case 'assignRoleToUser': {
          const id = formState.id?.trim();
          if (!id) {
            throw new Error('User ID wajib diisi.');
          }

          const roleIds = (formState.role_ids ?? '')
            .split(',')
            .map((item) => Number(item.trim()))
            .filter((item) => Number.isInteger(item) && item > 0);

          if (roleIds.length === 0) {
            throw new Error('role_ids wajib diisi (pisahkan dengan koma).');
          }

          result = await api.post(`/admin/users/${id}/assign-role`, { role_ids: roleIds });
          break;
        }
        case 'assignPermissionToRole': {
          const id = formState.id?.trim();
          if (!id) {
            throw new Error('Role ID wajib diisi.');
          }

          const permissionIds = (formState.permission_ids ?? '')
            .split(',')
            .map((item) => Number(item.trim()))
            .filter((item) => Number.isInteger(item) && item > 0);

          if (permissionIds.length === 0) {
            throw new Error('permission_ids wajib diisi (pisahkan dengan koma).');
          }

          result = await api.post(`/admin/roles/${id}/assign-permission`, {
            permission_ids: permissionIds,
          });
          break;
        }
        default:
          result = { data: { message: 'No action configured' } };
      }

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
            <input
              value={value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange(key, e.target.value)}
              placeholder={key}
              className="action-input"
            />
          </label>
        ))}
      </div>
    );
  };

  const renderActionButtons = () => {
    switch (path) {
      case '/profiles':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createProfile')} disabled={loading}>
              Create Profile
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('getProfileDetail')} disabled={loading}>
              Get Profile Detail
            </Button>
            <Button variant="secondary" size="md" onClick={() => void performAction('updateProfile')} disabled={loading}>
              Update Profile
            </Button>
            <Button variant="outline" size="md" onClick={() => void performAction('deleteProfile')} disabled={loading}>
              Delete Profile
            </Button>
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
      case '/leave/requests':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createLeave')} disabled={loading}>
              Submit Leave Request
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Leave Data
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
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Reimbursements
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
            <Button variant="primary" size="md" onClick={() => void performAction('createReimbursementAdmin')} disabled={loading}>
              Create Reimbursement
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Reimbursements
            </Button>
          </>
        );
      case '/my/payroll':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('submitMyPayroll')} disabled={loading}>
              Refresh My Payroll
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
        if (supportsList(path)) {
          return (
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Data
            </Button>
          );
        }

        return <p className="action-note">Tidak ada aksi langsung untuk halaman ini. Silakan gunakan menu atau form khusus yang tersedia.</p>;
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
            <p>Gunakan panel ini untuk memanggil endpoint sesuai Postman API.</p>
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
