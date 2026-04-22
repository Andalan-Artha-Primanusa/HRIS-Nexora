import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Users,
  CalendarDays,
  Clock,
  Wallet,
  TrendingUp,
  FileBarChart,
  RefreshCw,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
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
  const approvedLeaves = useMemo(() => leaveRecords.filter(r => ['approved', 'accepted'].includes(getStr(r, ['status']).toLowerCase())).length, [leaveRecords]);
  const rejectedLeaves = useMemo(() => leaveRecords.filter(r => ['rejected', 'declined'].includes(getStr(r, ['status']).toLowerCase())).length, [leaveRecords]);

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

  const leaveStatusData = useMemo(() => [
    { name: 'Pending', value: pendingLeaves },
    { name: 'Approved', value: approvedLeaves },
    { name: 'Rejected', value: rejectedLeaves },
  ].filter(d => d.value > 0), [pendingLeaves, approvedLeaves, rejectedLeaves]);

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

  const reimbursementByCategory = useMemo(() => {
    const map = new Map<string, number>();
    reimbursementRecords.forEach(r => {
      const cat = getStr(r, ['category', 'expense_category']) || 'Other';
      const amt = getNumericValue(r.amount) ?? 0;
      map.set(cat, (map.get(cat) || 0) + amt);
    });
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [reimbursementRecords]);

  const reimbursementStatusData = useMemo(() => {
    const statusMap = new Map<string, number>();
    reimbursementRecords.forEach(r => {
      const s = getStr(r, ['status']) || 'unknown';
      statusMap.set(s, (statusMap.get(s) || 0) + 1);
    });
    return Array.from(statusMap, ([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [reimbursementRecords]);

  // Summary cards
  const summaryCards = [
    { label: 'Total Karyawan', sub: `${activeEmployees} aktif`, value: String(totalEmployees), tone: 'blue', icon: Users },
    { label: 'Kehadiran Hari Ini', sub: `${presentToday} hadir`, value: `${attendanceRate}%`, tone: 'green', icon: TrendingUp },
    { label: 'Cuti Pending', sub: `${leaveRecords.length} total cuti`, value: String(pendingLeaves), tone: 'orange', icon: CalendarDays },
    { label: 'Payroll Diproses', sub: `${payrollRecords.length} payroll records`, value: `${payrollRate}%`, tone: 'purple', icon: Wallet },
    { label: 'Reimburse Pending', sub: `${reimbursementRecords.length} total klaim`, value: String(pendingReimburse), tone: 'red', icon: Clock },
    { label: 'Data Absensi', sub: 'Total catatan absensi', value: String(attendanceRecords.length), tone: 'cyan', icon: Activity },
  ];

  const getToneColors = (tone: string) => {
    switch (tone) {
      case 'blue': return { bg: '#eff6ff', icon: '#2563eb' };
      case 'green': return { bg: '#f0fdf4', icon: '#10b981' };
      case 'orange': return { bg: '#fff7ed', icon: '#f59e0b' };
      case 'purple': return { bg: '#faf5ff', icon: '#8b5cf6' };
      case 'red': return { bg: '#fef2f2', icon: '#ef4444' };
      case 'cyan': return { bg: '#ecfeff', icon: '#0891b2' };
      default: return { bg: '#f8fafc', icon: '#64748b' };
    }
  };

  return (
    <div className="reports-dashboard">
      <Card className="reports-hero-card" glass>
        <div className="reports-hero-copy">
          <p className="reports-badge">HR Intelligence</p>
          <h1 className="reports-title">Pusat Analitik HR</h1>
          <p className="reports-subtitle">
            Dashboard ringkasan analitik lintas departemen. Pantau tren kehadiran, 
            status cuti, performa payroll, dan klaim pengeluaran secara visual dan real-time.
          </p>
        </div>
        <div className="reports-actions">
          <Button variant="primary" size="md" onClick={() => void loadData()} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} style={{ marginRight: '8px' }} />
            {loading ? 'Menyinkronkan...' : 'Sinkronisasi Data'}
          </Button>
        </div>
      </Card>

      {error && <p className="reports-error">{error}</p>}

      <div className="reports-metrics-grid">
        {summaryCards.map(card => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="report-metric-card" glass>
              <div className="report-metric-header">
                <div>
                  <span className="report-metric-label">{card.label}</span>
                  <p className="report-metric-sublabel">{card.sub}</p>
                </div>
                <span className={`report-metric-icon report-metric-icon--${card.tone}`}>
                  <Icon size={22} />
                </span>
              </div>
              <div className="report-metric-value">{card.value}</div>
              <div className="report-metric-change neutral">Live HR Data</div>
            </Card>
          );
        })}
      </div>

      <div className="reports-charts-grid">
        {/* 1. Attendance Trend */}
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

        {/* 2. Department Distribution */}
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

        {/* 3. Leave Distribution */}
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

        {/* 4. Payroll Status */}
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

/* ─── Sub-component: Employee Growth Chart ─── */
const EmployeeGrowthChart: React.FC<{ employees: DashboardRecord[]; loading: boolean }> = ({ employees, loading }) => {
  const data = useMemo(() => {
    const monthMap = new Map<string, number>();
    employees.forEach(e => {
      const raw = getStr(e, ['hire_date', 'created_at', 'start_date']);
      if (!raw) return;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) || 0) + 1);
    });

    const sorted = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b));
    let cumulative = 0;
    return sorted.map(([period, count]) => {
      cumulative += count;
      return { month: formatPeriodLabel(period), count: cumulative, added: count };
    });
  }, [employees]);

  if (data.length === 0) {
    return <div className="reports-chart-empty">{loading ? 'Memuat...' : 'Belum ada data pertumbuhan karyawan.'}</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradGrowth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.1)" />
        <XAxis dataKey="month" stroke="#1e40af" style={{ fontSize: '12px' }} />
        <YAxis stroke="#1e40af" style={{ fontSize: '12px' }} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Total Karyawan" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ReportsDashboardPage;
