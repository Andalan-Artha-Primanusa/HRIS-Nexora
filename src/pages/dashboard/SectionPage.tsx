import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
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
  Plus,
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
    subtitle: 'Kelola KPI, tujuan, review, dan umpan balik karyawan.',
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

const defaultStats: SectionStat[] = [
  { label: 'Total Items', value: '124', description: 'Data aktif saat ini', variant: 'info' },
  { label: 'Pending', value: '18', description: 'Butuh tindak lanjut', variant: 'warning' },
  { label: 'Completed', value: '96', description: 'Sudah selesai', variant: 'success' },
];

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
    performance: ['Goal', 'Owner', 'Progress', 'Status', 'Review'],
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
    stats: defaultStats,
    tableColumns: tableColumns[safeRoot],
  };
};

const supportsList = (pathname: string) => {
  return [
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
    '/reports/employee',
    '/kpis',
  ].includes(pathname);
};

const getDefaultFormState = (pathname: string) => {
  switch (pathname) {
    case '/profiles':
      return { id: '', phone: '', address: '', city: '', province: '', postal_code: '' };
    case '/employees/add':
      return { user_id: '', employee_code: '', position: '', department: '', hire_date: '', salary: '' };
    case '/leave/requests':
      return { type: 'annual', start_date: '', end_date: '', total_days: '', reason: '' };
    case '/attendance/check-in':
      return { latitude: '-6.200000', longitude: '106.816666' };
    case '/attendance/check-out':
      return {};
    case '/my/reimbursements':
      return { title: '', description: '', amount: '', category: 'travel', expense_date: '2026-04-09', receipt_path: '' };
    case '/my/kpi':
      return { id: '' };
    case '/my/payroll':
      return { employee_id: '', period: '2026-04' };
    case '/locations':
      return { name: '', latitude: '-6.200000', longitude: '106.816666', radius: '100' };
    case '/reimbursements':
      return { title: '', description: '', amount: '', category: 'travel', expense_date: '2026-04-09', receipt_path: '' };
    case '/admin/users':
      return { user_id: '', role_ids: '' };
    case '/admin/roles':
      return { permission_ids: '' };
    case '/admin/permissions':
      return { name: '' };
    case '/kpis':
      return { employee_id: '', title: '', description: '', target: '' };
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
  const section = useMemo(() => getSectionData(path), [path]);
  const Icon = section.icon;
  const [tableColumns, setTableColumns] = useState<string[]>(section.tableColumns);
  const [tableRows, setTableRows] = useState<string[][]>([]);
  const [formState, setFormState] = useState<Record<string, string>>(getDefaultFormState(path));
  const [responseText, setResponseText] = useState('');
  const [statusMessage, setStatusMessage] = useState('Ready to call API');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormState(getDefaultFormState(path));
    setResponseText('');
    setStatusMessage('Ready to call API');
    setTableColumns(section.tableColumns);
    setTableRows([]);
    if (supportsList(path)) {
      void loadList();
    }
  }, [path, section.tableColumns]);

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
        case '/kpis':
          result = await api.get('/kpis');
          break;
        case '/reports/employee':
          result = await api.get('/reports/employee');
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
        case 'createKpi':
          result = await api.post('/kpis', formState);
          break;
        case 'createAdminUser':
          result = await api.post('/admin/users', formState);
          break;
        case 'createAdminRole':
          result = await api.post('/admin/roles', formState);
          break;
        case 'createAdminPermission':
          result = await api.post('/admin/permissions', formState);
          break;
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
      case '/kpis':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createKpi')} disabled={loading}>
              Create KPI
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh KPI
            </Button>
          </>
        );
      case '/admin/users':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createAdminUser')} disabled={loading}>
              Create User
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Users
            </Button>
          </>
        );
      case '/admin/roles':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createAdminRole')} disabled={loading}>
              Create Role
            </Button>
            <Button variant="secondary" size="md" onClick={() => void loadList()} disabled={loading}>
              Refresh Roles
            </Button>
          </>
        );
      case '/admin/permissions':
        return (
          <>
            <Button variant="primary" size="md" onClick={() => void performAction('createAdminPermission')} disabled={loading}>
              Create Permission
            </Button>
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
    <div className="section-page">
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
          <Button variant="outline" size="md" onClick={() => void loadList()} disabled={loading || !supportsList(path)}>
            <Search size={16} />
            Refresh
          </Button>
          <Button variant="primary" size="md" disabled>
            <Plus size={16} />
            Main Action
          </Button>
        </div>
      </div>

      <div className="section-summary-grid">
        {section.stats.map((stat) => (
          <Card key={stat.label} className="summary-card" glass>
            <div className="summary-card-top">
              <span className="summary-card-label">{stat.label}</span>
              <Badge variant={stat.variant}>{stat.description}</Badge>
            </div>
            <h3 className="summary-card-value">{stat.value}</h3>
          </Card>
        ))}
      </div>

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
          <Button variant="secondary" size="sm" onClick={() => void loadList()} disabled={loading || !supportsList(path)}>
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
