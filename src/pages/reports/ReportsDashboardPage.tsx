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
      {/* ─── Hero ─── */}
      <Card className="reports-hero-card" glass>
        <div className="reports-hero-copy">
          <p className="reports-badge">Laporan & Analitik</p>
          <h1 className="reports-title">Ringkasan Laporan</h1>
          <p className="reports-subtitle">
            Dashboard analitik HR: kehadiran, cuti, payroll, dan klaim reimburse secara visual.
          </p>
        </div>
        <div className="reports-actions">
          <Button variant="outline" size="md" onClick={() => void loadData()} disabled={loading}>
            <RefreshCw size={16} />
            {loading ? 'Memuat...' : 'Segarkan'}
          </Button>
        </div>
      </Card>

      {error && <p className="reports-error">{error}</p>}

      <div className="reports-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {summaryCards.map(card => {
          const Icon = card.icon;
          const colors = getToneColors(card.tone);
          return (
            <Card key={card.label} glass style={{ padding: '1.5rem', border: `1px solid ${colors.bg}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>{card.label}</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>{card.value}</div>
                </div>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '12px',
                  background: colors.bg,
                  color: colors.icon
                }}>
                  <Icon size={22} />
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{card.sub}</span>
                <span style={{ fontSize: '0.7rem', color: colors.icon, fontWeight: 600, background: `${colors.icon}10`, padding: '2px 8px', borderRadius: '4px' }}>
                  Live Data
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ─── Charts ─── */}
      <div className="reports-charts-section">
        <div className="reports-charts-grid">

          {/* 1. Attendance Trend (Area) */}
          <Card className="reports-chart-card" glass>
            <h2 className="reports-chart-title"><BarChart3 size={16} /> Tren Kehadiran Mingguan</h2>
            <p className="reports-chart-subtitle">Perbandingan hadir vs absen per hari</p>
            {attendanceTrend.some(d => d.present > 0 || d.absent > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={attendanceTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.1)" />
                  <XAxis dataKey="day" stroke="#1e40af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#1e40af" style={{ fontSize: '12px' }} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="present" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#gradPresent)" name="Hadir" />
                  <Area type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#gradAbsent)" name="Absen" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="reports-chart-empty">{loading ? 'Memuat data absensi...' : 'Belum ada data absensi.'}</div>
            )}
          </Card>

          {/* 2. Employees by Department (Bar) */}
          <Card className="reports-chart-card" glass>
            <h2 className="reports-chart-title"><Users size={16} /> Karyawan per Departemen</h2>
            <p className="reports-chart-subtitle">Distribusi karyawan menurut departemen</p>
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={departmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.1)" />
                  <XAxis dataKey="name" stroke="#1e40af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#1e40af" style={{ fontSize: '12px' }} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(37,99,235,0.1)' }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} name="Jumlah Karyawan" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="reports-chart-empty">{loading ? 'Memuat data departemen...' : 'Belum ada data departemen.'}</div>
            )}
          </Card>

          {/* 3. Leave Types (Pie) */}
          <Card className="reports-chart-card" glass>
            <h2 className="reports-chart-title"><PieChartIcon size={16} /> Distribusi Jenis Cuti</h2>
            <p className="reports-chart-subtitle">Proporsi cuti berdasarkan tipe</p>
            {leaveTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Pie data={leaveTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} fill="#2563eb" dataKey="value">
                    {leaveTypeData.map((_, i) => (
                      <Cell key={`lt-${i}`} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="reports-chart-empty">{loading ? 'Memuat data cuti...' : 'Belum ada data cuti.'}</div>
            )}
          </Card>

          {/* 4. Leave Status (Pie) */}
          <Card className="reports-chart-card" glass>
            <h2 className="reports-chart-title"><CalendarDays size={16} /> Status Cuti</h2>
            <p className="reports-chart-subtitle">Perbandingan pending, approved, dan rejected</p>
            {leaveStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Pie data={leaveStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} fill="#10b981" dataKey="value">
                    {leaveStatusData.map((_, i) => (
                      <Cell key={`ls-${i}`} fill={['#f59e0b', '#10b981', '#ef4444'][i % 3]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="reports-chart-empty">{loading ? 'Memuat...' : 'Belum ada data cuti.'}</div>
            )}
          </Card>

          {/* 5. Payroll Timeline (Stacked Bar) */}
          <Card className="reports-chart-card" glass>
            <h2 className="reports-chart-title"><Wallet size={16} /> Status Payroll per Periode</h2>
            <p className="reports-chart-subtitle">Payroll yang sudah diproses vs pending</p>
            {payrollTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={payrollTimeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.1)" />
                  <XAxis dataKey="month" stroke="#1e40af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#1e40af" style={{ fontSize: '12px' }} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(37,99,235,0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="processed" stackId="a" fill="#10b981" radius={[8, 8, 0, 0]} name="Diproses" />
                  <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="reports-chart-empty">{loading ? 'Memuat data payroll...' : 'Belum ada data payroll.'}</div>
            )}
          </Card>

          {/* 6. Reimbursement by Category (Bar) */}
          <Card className="reports-chart-card" glass>
            <h2 className="reports-chart-title"><FileBarChart size={16} /> Reimburse per Kategori</h2>
            <p className="reports-chart-subtitle">Total nominal klaim berdasarkan kategori</p>
            {reimbursementByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={reimbursementByCategory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.1)" />
                  <XAxis dataKey="name" stroke="#1e40af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#1e40af" style={{ fontSize: '12px' }} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(37,99,235,0.1)' }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Total (Rp)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="reports-chart-empty">{loading ? 'Memuat...' : 'Belum ada data reimburse.'}</div>
            )}
          </Card>

          {/* 7. Reimbursement Status (Donut) */}
          <Card className="reports-chart-card" glass>
            <h2 className="reports-chart-title"><PieChartIcon size={16} /> Status Reimburse</h2>
            <p className="reports-chart-subtitle">Distribusi status klaim reimburse</p>
            {reimbursementStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Pie data={reimbursementStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} fill="#8b5cf6" dataKey="value">
                    {reimbursementStatusData.map((_, i) => (
                      <Cell key={`rs-${i}`} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="reports-chart-empty">{loading ? 'Memuat...' : 'Belum ada data reimburse.'}</div>
            )}
          </Card>

          {/* 8. Employee Growth (Line) - derived from employees with hire_date */}
          <Card className="reports-chart-card" glass>
            <h2 className="reports-chart-title"><TrendingUp size={16} /> Pertumbuhan Karyawan</h2>
            <p className="reports-chart-subtitle">Jumlah karyawan kumulatif per bulan</p>
            <EmployeeGrowthChart employees={employees} loading={loading} />
          </Card>

        </div>
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
