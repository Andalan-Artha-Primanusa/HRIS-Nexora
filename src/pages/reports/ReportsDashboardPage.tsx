import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Users,
  CalendarDays,
  Clock,
  Wallet,
  RefreshCw,
  PieChart as PieChartIcon,
  Activity,
  CheckCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
import './ReportsDashboardPage.css';

type DashboardRecord = Record<string, unknown>;

const toRecord = (value: unknown): DashboardRecord =>
  value && typeof value === 'object' ? (value as DashboardRecord) : {};

const extractPayload = (raw: unknown) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

const extractArrayPayload = (raw: unknown): DashboardRecord[] => {
  const payload = extractPayload(raw);
  if (Array.isArray(payload)) return payload.filter((i): i is DashboardRecord => !!i && typeof i === 'object');
  const rec = toRecord(payload);
  for (const key of ['items', 'rows', 'data', 'results']) {
    const cand = rec[key];
    if (Array.isArray(cand)) return cand.filter((i): i is DashboardRecord => !!i && typeof i === 'object');
  }
  return [];
};

const getStr = (rec: DashboardRecord, keys: string[]): string => {
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
};

const getNumericValue = (raw: unknown): number | null => {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') { const p = Number(raw); if (Number.isFinite(p)) return p; }
  return null;
};

const getCountFromPayload = (raw: unknown): number => {
  const payload = extractPayload(raw);
  if (Array.isArray(payload)) return payload.length;
  const rec = toRecord(payload);
  for (const key of ['items', 'rows', 'data', 'results']) { if (Array.isArray(rec[key])) return (rec[key] as unknown[]).length; }
  for (const key of ['count', 'total', 'total_count', 'totalCount', 'present', 'present_count']) {
    const n = getNumericValue(rec[key]);
    if (n !== null) return n;
  }
  return 0;
};

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const chartColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const formatPeriodLabel = (period: string) => {
  if (!period) return 'Unknown';
  const parts = period.split('-');
  if (parts.length !== 2) return period;
  const [year, month] = parts;
  const date = new Date(Number(year), Number(month) - 1, 1);
  return Number.isNaN(date.getTime()) ? period : date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
};

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#fff',
    border: '1px solid #dbeafe',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(37,99,235,0.1)',
  },
  labelStyle: { color: '#1e40af', fontWeight: 'bold' as const },
};

const ReportsDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Raw data
  const [employees, setEmployees] = useState<DashboardRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<DashboardRecord[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<DashboardRecord[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<DashboardRecord[]>([]);
  const [reimbursementRecords, setReimbursementRecords] = useState<DashboardRecord[]>([]);
  const [presentToday, setPresentToday] = useState(0);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, attRes, leaveRes, payRes, reimbRes, todayRes] = await Promise.allSettled([
        api.get('/employees'),
        api.get('/attendance/all'),
        api.get('/leaves'),
        api.get('/payroll'),
        api.get('/reimbursements'),
        api.get('/attendance/today'),
      ]);
      setEmployees(empRes.status === 'fulfilled' ? extractArrayPayload(empRes.value.data) : []);
      setAttendanceRecords(attRes.status === 'fulfilled' ? extractArrayPayload(attRes.value.data) : []);
      setLeaveRecords(leaveRes.status === 'fulfilled' ? extractArrayPayload(leaveRes.value.data) : []);
      setPayrollRecords(payRes.status === 'fulfilled' ? extractArrayPayload(payRes.value.data) : []);
      setReimbursementRecords(reimbRes.status === 'fulfilled' ? extractArrayPayload(reimbRes.value.data) : []);
      setPresentToday(todayRes.status === 'fulfilled' ? getCountFromPayload(todayRes.value.data) : 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  // ─── Derived metrics ───
  const totalEmployees = employees.length;
  const activeEmployees = useMemo(
    () => employees.filter(e => { const s = getStr(e, ['status']).toLowerCase(); return !s || s === 'active'; }).length,
    [employees],
  );

  const pendingLeaves = useMemo(() => leaveRecords.filter(r => getStr(r, ['status']).toLowerCase() === 'pending').length, [leaveRecords]);

  const processedPayroll = useMemo(
    () => payrollRecords.filter(r => ['paid', 'approved'].includes(getStr(r, ['status']).toLowerCase())).length,
    [payrollRecords],
  );
  const pendingReimburse = useMemo(
    () => reimbursementRecords.filter(r => getStr(r, ['status']).toLowerCase() === 'pending').length,
    [reimbursementRecords],
  );

  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;
  const payrollRate = payrollRecords.length > 0 ? Math.round((processedPayroll / payrollRecords.length) * 100) : 0;

  // ─── Chart data ───
  const attendanceTrend = useMemo(() => {
    const agg = dayOrder.map(day => ({ day, present: 0, absent: 0 }));
    attendanceRecords.forEach(rec => {
      const raw = getStr(rec, ['date', 'attendance_date', 'created_at', 'check_in', 'checkIn']);
      if (!raw) return;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return;
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const target = agg.find(a => a.day === label);
      if (!target) return;
      const status = getStr(rec, ['status', 'attendance_status', 'state']).toLowerCase();
      if (status.includes('absent') || status.includes('late') || status.includes('rejected')) target.absent++;
      else target.present++;
    });
    return agg;
  }, [attendanceRecords]);

  const departmentData = useMemo(() => {
    const map = new Map<string, number>();
    employees.forEach(e => {
      const dept = getStr(e, ['department', 'department_name', 'departmentName']) || 'Unassigned';
      map.set(dept, (map.get(dept) || 0) + 1);
    });
    return Array.from(map, ([name, count]) => ({ name, count }));
  }, [employees]);

  const leaveTypeData = useMemo(() => {
    const map = new Map<string, number>();
    leaveRecords.forEach(r => {
      const type = getStr(r, ['type', 'leave_type', 'leaveType']) || 'Unknown';
      map.set(type, (map.get(type) || 0) + 1);
    });
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [leaveRecords]);

  const payrollTimeline = useMemo(() => {
    const map = new Map<string, { processed: number; pending: number }>();
    payrollRecords.forEach(r => {
      const period = getStr(r, ['period']) || 'Unknown';
      const cur = map.get(period) || { processed: 0, pending: 0 };
      const s = getStr(r, ['status']).toLowerCase();
      if (s === 'paid' || s === 'approved') cur.processed++; else cur.pending++;
      map.set(period, cur);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, v]) => ({ month: formatPeriodLabel(period), processed: v.processed, pending: v.pending }));
  }, [payrollRecords]);

  // Summary cards
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _summaryCards = [
    { label: 'Total Karyawan', sub: `${activeEmployees} aktif`, value: String(totalEmployees), tone: 'blue', icon: Users },
    { label: 'Kehadiran Hari Ini', sub: `${presentToday} hadir`, value: `${attendanceRate}%`, tone: 'green', icon: Activity },
    { label: 'Cuti Pending', sub: `${leaveRecords.length} total cuti`, value: String(pendingLeaves), tone: 'orange', icon: CalendarDays },
    { label: 'Payroll Diproses', sub: `${payrollRecords.length} payroll records`, value: `${payrollRate}%`, tone: 'purple', icon: Wallet },
    { label: 'Reimburse Pending', sub: `${reimbursementRecords.length} total klaim`, value: String(pendingReimburse), tone: 'red', icon: Clock },
  ];

  return (
    <div className="reports-dashboard">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <BarChart3 size={16} />
              <span>Pusat Analitik</span>
            </div>
            <h1 className="hero-title">Pusat Analitik HR</h1>
            <p className="hero-subtitle">
              Dashboard ringkasan analitik lintas departemen. Pantau tren kehadiran,
              status cuti, performa payroll, dan klaim pengeluaran secara visual dan real-time.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadData()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Menyinkronkan...' : 'Sinkronisasi Data'}
            </button>
          </div>
        </div>
      </Card>

      {error && <p className="reports-error">{error}</p>}

      <div className="leave-requests-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Total Karyawan</p>
              <p className="leave-summary-subtitle">{activeEmployees} aktif</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <Users size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-blue">{totalEmployees}</div>
          <p className="leave-summary-trend">Karyawan Terdaftar</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Kehadiran Hari Ini</p>
              <p className="leave-summary-subtitle">{presentToday} hadir</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-green">
              <CheckCircle size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-green">{attendanceRate}%</div>
          <p className="leave-summary-trend">Tingkat Kehadiran</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Cuti Tertunda</p>
              <p className="leave-summary-subtitle">{leaveRecords.length} total cuti</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-orange">
              <CalendarDays size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-orange">{pendingLeaves}</div>
          <p className="leave-summary-trend">Cuti Tertunda</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Payroll Diproses</p>
              <p className="leave-summary-subtitle">{payrollRecords.length} records</p>
            </div>
            <div className="leave-summary-icon-wrapper" style={{ background: '#f5f3ff' }}>
              <Wallet size={28} color="#8b5cf6" />
            </div>
          </div>
          <div className="leave-summary-value" style={{ color: '#8b5cf6' }}>{payrollRate}%</div>
          <p className="leave-summary-trend">Payroll Diproses</p>
        </div>
      </div>

      <div className="reports-charts-grid">
        <Card className="reports-chart-card" glass>
          <h2 className="reports-chart-title"><BarChart3 size={20} color="#2563eb" /> Tren Kehadiran</h2>
          <p className="reports-chart-subtitle">Perbandingan kehadiran kumulatif dalam satu minggu terakhir</p>
          {attendanceTrend.some(d => d.present > 0 || d.absent > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="present" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#gradPresent)" name="Hadir" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="reports-chart-empty">Belum ada data absensi tercatat</div>
          )}
        </Card>

        <Card className="reports-chart-card" glass>
          <h2 className="reports-chart-title"><Users size={20} color="#2563eb" /> Karyawan per Departemen</h2>
          <p className="reports-chart-subtitle">Distribusi jumlah SDM berdasarkan unit kerja</p>
          {departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip {...tooltipStyle} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} name="Karyawan" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="reports-chart-empty">Data departemen tidak tersedia</div>
          )}
        </Card>

        <Card className="reports-chart-card" glass>
          <h2 className="reports-chart-title"><PieChartIcon size={20} color="#2563eb" /> Jenis Cuti</h2>
          <p className="reports-chart-subtitle">Proporsi permohonan cuti berdasarkan kategori</p>
          {leaveTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={leaveTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {leaveTypeData.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="reports-chart-empty">Belum ada data cuti</div>
          )}
        </Card>

        <Card className="reports-chart-card" glass>
          <h2 className="reports-chart-title"><Wallet size={20} color="#2563eb" /> Status Payroll</h2>
          <p className="reports-chart-subtitle">Perbandingan status pemrosesan payroll saat ini</p>
          {payrollTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={payrollTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Bar dataKey="processed" stackId="a" fill="#10b981" name="Diproses" />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Menunggu" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="reports-chart-empty">Data payroll tidak ditemukan</div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ReportsDashboardPage;
