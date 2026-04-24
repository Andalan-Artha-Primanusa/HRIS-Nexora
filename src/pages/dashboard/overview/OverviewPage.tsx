import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ClipboardList, PieChart as PieChartIcon, Users, Wallet, TrendingUp, Activity } from 'lucide-react';
import { KpiCards } from '@/features/dashboard/components/KpiCards';
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import "./OverviewPage.css";

type DashboardRecord = Record<string, unknown>;

type AttendanceTrendPoint = {
  day: string;
  present: number;
  absent: number;
};

type DepartmentPoint = {
  name: string;
  count: number;
};

type PayrollTrendPoint = {
  month: string;
  processed: number;
  pending: number;
};

type LeaveTypePoint = {
  name: string;
  value: number;
};

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const toRecord = (value: unknown): DashboardRecord =>
  value && typeof value === 'object' ? (value as DashboardRecord) : {};

const extractPayload = (raw: unknown) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

const extractArrayPayload = (raw: unknown): DashboardRecord[] => {
  const payload = extractPayload(raw);

  if (Array.isArray(payload)) {
    return payload.filter((item): item is DashboardRecord => !!item && typeof item === 'object');
  }

  const payloadRecord = toRecord(payload);
  const candidates = [payloadRecord.items, payloadRecord.rows, payloadRecord.data, payloadRecord.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is DashboardRecord => !!item && typeof item === 'object');
    }
  }

  return [];
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

const getStringValue = (record: DashboardRecord, keys: string[]): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return '';
};

const getCountFromPayload = (raw: unknown): number => {
  const payload = extractPayload(raw);

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

const getStatusText = (record: DashboardRecord) => {
  const status = getStringValue(record, ['status', 'attendance_status', 'state']);
  return status.toLowerCase();
};

const isPresentRecord = (record: DashboardRecord) => {
  const status = getStatusText(record);
  if (status.includes('present') || status.includes('hadir') || status.includes('approved') || status.includes('paid')) {
    return true;
  }

  if (status.includes('absent') || status.includes('late') || status.includes('terlambat') || status.includes('rejected')) {
    return false;
  }

  return Boolean(
    getStringValue(record, ['check_in', 'checkIn', 'clock_in', 'clockIn', 'present']).trim() ||
      getStringValue(record, ['date', 'attendance_date', 'created_at']).trim()
  );
};

const getWeekdayLabel = (record: DashboardRecord) => {
  const candidate =
    getStringValue(record, ['date', 'attendance_date', 'created_at', 'check_in', 'checkIn']) ||
    getStringValue(record, ['day']);

  if (!candidate) {
    return null;
  }

  const parsedDate = new Date(candidate);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toLocaleDateString('en-US', { weekday: 'short' });
};

const formatPeriodLabel = (period: string) => {
  if (!period) {
    return 'Unknown';
  }

  const parts = period.split('-');
  if (parts.length !== 2) {
    return period;
  }

  const [year, month] = parts;
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) {
    return period;
  }

  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState<AttendanceTrendPoint[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentPoint[]>([]);
  const [leaveTypeData, setLeaveTypeData] = useState<LeaveTypePoint[]>([]);
  const [payrollData, setPayrollData] = useState<PayrollTrendPoint[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [pendingReimbursements, setPendingReimbursements] = useState(0);
  const [processedPayrollRate, setProcessedPayrollRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chartColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const summaryCards = [
    {
      label: "Today's Attendance",
      subtitle: 'Persentase kehadiran hari ini',
      value: `${totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0}%`,
      change: `${presentToday} present today`,
      tone: 'blue',
      icon: TrendingUp,
    },
    {
      label: 'Pending Leave Requests',
      subtitle: 'Menunggu approval',
      value: String(pendingLeaves),
      change: 'From /leaves/pending',
      tone: 'orange',
      icon: ClipboardList,
    },
    {
      label: 'Active Employees',
      subtitle: 'Karyawan aktif bulan ini',
      value: String(activeEmployees),
      change: `${totalEmployees} total employees`,
      tone: 'green',
      icon: Users,
    },
    {
      label: 'Payroll Status',
      subtitle: 'Payroll bulan berjalan',
      value: `${processedPayrollRate}%`,
      change: `${payrollData.length} payroll records · ${pendingReimbursements} reimbursement pending`,
      tone: 'purple',
      icon: Wallet,
    },
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [employeesRes, attendanceRes, leavesRes, reimbursementsRes, payrollRes, todayAttendanceRes] = await Promise.allSettled([
          api.get('/employees'),
          api.get('/attendance/all'),
          api.get('/leaves/pending'),
          api.get('/reimbursements/pending'),
          api.get('/payroll'),
          api.get('/attendance/today'),
        ]);

        const employees = employeesRes.status === 'fulfilled' ? extractArrayPayload(employeesRes.value.data) : [];
        const attendanceRecords = attendanceRes.status === 'fulfilled' ? extractArrayPayload(attendanceRes.value.data) : [];
        const pendingLeaveRecords = leavesRes.status === 'fulfilled' ? extractArrayPayload(leavesRes.value.data) : [];
        const pendingReimbursementRecords = reimbursementsRes.status === 'fulfilled' ? extractArrayPayload(reimbursementsRes.value.data) : [];
        const payrollRecords = payrollRes.status === 'fulfilled' ? extractArrayPayload(payrollRes.value.data) : [];
        const todayAttendancePayload = todayAttendanceRes.status === 'fulfilled' ? extractPayload(todayAttendanceRes.value.data) : {};

        setTotalEmployees(employees.length);
        setActiveEmployees(
          employees.filter((employee) => {
            const status = getStringValue(employee, ['status']).toLowerCase();
            return !status || status === 'active';
          }).length
        );

        const presentTodayCount = getCountFromPayload(todayAttendancePayload);
        setPresentToday(presentTodayCount);

        setPendingLeaves(pendingLeaveRecords.length);
        setPendingReimbursements(pendingReimbursementRecords.length);

        const processedPayrollCount = payrollRecords.filter((record) => {
          const status = getStringValue(record, ['status']).toLowerCase();
          return status === 'paid' || status === 'approved';
        }).length;
        setProcessedPayrollRate(
          payrollRecords.length > 0 ? Math.round((processedPayrollCount / payrollRecords.length) * 100) : 0
        );

        const attendanceAggregate = dayOrder.map((day) => ({ day, present: 0, absent: 0 }));
        attendanceRecords.forEach((record) => {
          const dayLabel = getWeekdayLabel(record);
          if (!dayLabel) {
            return;
          }

          const target = attendanceAggregate.find((item) => item.day === dayLabel);
          if (!target) {
            return;
          }

          if (isPresentRecord(record)) {
            target.present += 1;
          } else {
            target.absent += 1;
          }
        });
        setAttendanceData(attendanceAggregate);

        const departmentMap = new Map<string, number>();
        employees.forEach((employee) => {
          const department = getStringValue(employee, ['department', 'department_name', 'departmentName']) || 'Unassigned';
          departmentMap.set(department, (departmentMap.get(department) || 0) + 1);
        });
        setDepartmentData(Array.from(departmentMap, ([name, count]) => ({ name, count })));

        const leaveTypeMap = new Map<string, number>();
        const allLeavesResponse = await api.get('/leaves');
        const allLeaves = extractArrayPayload(allLeavesResponse.data);
        allLeaves.forEach((leave) => {
          const type = getStringValue(leave, ['type', 'leave_type', 'leaveType']) || 'Unknown';
          leaveTypeMap.set(type, (leaveTypeMap.get(type) || 0) + 1);
        });
        setLeaveTypeData(Array.from(leaveTypeMap, ([name, value]) => ({ name, value })));

        const payrollMap = new Map<string, { processed: number; pending: number }>();
        payrollRecords.forEach((record) => {
          const period = getStringValue(record, ['period']) || 'Unknown';
          const current = payrollMap.get(period) || { processed: 0, pending: 0 };
          const status = getStringValue(record, ['status']).toLowerCase();

          if (status === 'paid' || status === 'approved') {
            current.processed += 1;
          } else {
            current.pending += 1;
          }

          payrollMap.set(period, current);
        });

        const payrollTimeline = Array.from(payrollMap.entries())
          .sort(([periodA], [periodB]) => periodA.localeCompare(periodB))
          .map(([period, value]) => ({
            month: formatPeriodLabel(period),
            processed: value.processed,
            pending: value.pending,
          }));

        setPayrollData(payrollTimeline);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load dashboard data';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Activity size={14} />
              <span>Dashboard Center</span>
            </div>
            <h1 className="hero-title">Dashboard Overview</h1>
            <p className="hero-subtitle">Welcome back, here's what's happening with your organization today.</p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => navigate('/admin/analytics/people')}>
              View Analytics
            </button>
            <button className="btn-primary" onClick={() => navigate('/payroll/approve')}>
              Run Payroll
            </button>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="error-card">
          <p>{error}</p>
        </Card>
      )}

      <KpiCards />

      <div className="summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="metric-card">
              <div className="metric-header">
                <div>
                  <span className="metric-label">{card.label}</span>
                  <p className="metric-subtitle">{card.subtitle}</p>
                </div>
                <span className={`metric-icon metric-icon--${card.tone}`}>
                  <Icon size={20} />
                </span>
              </div>
              <div className="metric-value">{card.value}</div>
              <div className="metric-change">
                <span>{card.change}</span>
              </div>
            </Card>
          );
        })}
</div>

      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 className="analytics-title">Analytics Dashboard</h2>
            <p className="analytics-subtitle">Real-time data insights</p>
          </div>
        </div>
      </Card>

      <div className="charts-section">
          <Card className="chart-card">
              <div className="chart-header">
                <div className="chart-title-area">
                  <h3 className="chart-title">Weekly Attendance Trend</h3>
                  <p className="chart-subtitle">Employee presence tracking this week</p>
                </div>
              </div>
              {loading && attendanceData.length === 0 ? (
                <div className="chart-empty">Loading attendance data...</div>
              ) : attendanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={attendanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                      }}
                      labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="present" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorPresent)" name="Present" />
                    <Area type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAbsent)" name="Absent" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty">No attendance data available.</div>
              )}
            </Card>

            <Card className="chart-card">
              <div className="chart-header">
                <div className="chart-title-area">
                  <h3 className="chart-title">Employees by Department</h3>
                  <p className="chart-subtitle">Total workforce distribution</p>
                </div>
              </div>
              {loading && departmentData.length === 0 ? (
                <div className="chart-empty">Loading department data...</div>
              ) : departmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={departmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                      }}
                      labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                      cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} name="Employee Count" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty">No department data available.</div>
              )}
            </Card>

            <Card className="chart-card">
              <div className="chart-header">
                <div className="chart-title-area">
                  <h3 className="chart-title">Payroll Processing Status</h3>
                  <p className="chart-subtitle">Monthly payroll completion rate</p>
                </div>
              </div>
              {loading && payrollData.length === 0 ? (
                <div className="chart-empty">Loading payroll data...</div>
              ) : payrollData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={payrollData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                      }}
                      labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                      cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="processed" stackId="a" fill="#10b981" radius={[8, 8, 0, 0]} name="Processed" />
                    <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty">No payroll data available.</div>
              )}
            </Card>

            <Card className="chart-card">
              <div className="chart-header">
                <div className="chart-title-area">
                  <h3 className="chart-title">Leave Types Distribution</h3>
                  <p className="chart-subtitle">Leave requests by type</p>
                </div>
              </div>
              {loading && leaveTypeData.length === 0 ? (
                <div className="chart-empty">Loading leave data...</div>
              ) : leaveTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                      }}
                      labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Pie
                      data={leaveTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={90}
                      fill="#2563eb"
                      dataKey="value"
                    >
                      {leaveTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty">No leave data available.</div>
              )}
            </Card>
      </div>
    </div>
  );
};

export default OverviewPage;