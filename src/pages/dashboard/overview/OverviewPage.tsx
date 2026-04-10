import React, { useState, useEffect } from 'react';
import { KpiCards } from '@/features/dashboard/components/KpiCards';
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/shared/ui/Card';
import { api } from '@/shared/api/httpClient';
import "./OverviewPage.css";

const OverviewPage: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<{ day: string; present: number; absent: number }[]>([
    { day: 'Mon', present: 45, absent: 5 },
    { day: 'Tue', present: 48, absent: 2 },
    { day: 'Wed', present: 42, absent: 8 },
    { day: 'Thu', present: 50, absent: 0 },
    { day: 'Fri', present: 47, absent: 3 },
  ]);

  const [departmentData, setDepartmentData] = useState<{ name: string; count: number }[]>([
    { name: 'HR', count: 8 },
    { name: 'Engineering', count: 25 },
    { name: 'Sales', count: 15 },
    { name: 'Marketing', count: 10 },
    { name: 'Finance', count: 12 },
  ]);

  const [leaveTypeData, setLeaveTypeData] = useState<{ name: string; value: number }[]>([
    { name: 'Annual Leave', value: 12 },
    { name: 'Medical Leave', value: 8 },
    { name: 'Personal Leave', value: 5 },
    { name: 'Unpaid Leave', value: 3 },
  ]);

  const [payrollData, setPayrollData] = useState<{ month: string; processed: number; pending: number }[]>([
    { month: 'Jan', processed: 90, pending: 10 },
    { month: 'Feb', processed: 92, pending: 8 },
    { month: 'Mar', processed: 88, pending: 12 },
    { month: 'Apr', processed: 95, pending: 5 },
    { month: 'May', processed: 93, pending: 7 },
  ]);

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    // Load real data from API if available
    const loadDashboardData = async () => {
      try {
        const [attendanceRes, departmentRes, leaveRes, payrollRes] = await Promise.allSettled([
          api.get('/attendance/weekly'),
          api.get('/employees/by-department'),
          api.get('/leaves/by-type'),
          api.get('/payroll/monthly'),
        ]);

        if (attendanceRes.status === 'fulfilled' && Array.isArray(attendanceRes.value?.data)) {
          setAttendanceData(attendanceRes.value.data);
        }
        if (departmentRes.status === 'fulfilled' && Array.isArray(departmentRes.value?.data)) {
          setDepartmentData(departmentRes.value.data);
        }
        if (leaveRes.status === 'fulfilled' && Array.isArray(leaveRes.value?.data)) {
          setLeaveTypeData(leaveRes.value.data);
        }
        if (payrollRes.status === 'fulfilled' && Array.isArray(payrollRes.value?.data)) {
          setPayrollData(payrollRes.value.data);
        }
      } catch (error) {
        console.warn('Failed to load dashboard data, using defaults', error);
      }
    };

    void loadDashboardData();
  }, []);

  return (
    <div className="overview-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back, here's what's happening with your organization today.</p>
        </div>
        <div className="page-actions">
          <button className="ui-button ui-button--outline ui-button--md">📊 Export Report</button>
          <button className="ui-button ui-button--primary ui-button--md">▶ Run Payroll</button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <KpiCards />

      {/* Metrics Summary Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Today's Attendance</span>
            <span className="metric-icon">📍</span>
          </div>
          <div className="metric-value">92%</div>
          <div className="metric-change positive">
            <span>↑ 2.5%</span> from yesterday
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Pending Leave Requests</span>
            <span className="metric-icon">📋</span>
          </div>
          <div className="metric-value">12</div>
          <div className="metric-change neutral">
            <span>⏱ Awaiting approval</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Active Employees</span>
            <span className="metric-icon">👥</span>
          </div>
          <div className="metric-value">87</div>
          <div className="metric-change positive">
            <span>↑ 3 new this month</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Payroll Status</span>
            <span className="metric-icon">💰</span>
          </div>
          <div className="metric-value">95%</div>
          <div className="metric-change positive">
            <span>✓ Processed</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="charts-grid charts-grid-2col">
          {/* Attendance Trend Chart */}
          <Card className="chart-card" glass>
            <h2 className="chart-title">📈 Weekly Attendance Trend</h2>
            <p className="chart-subtitle">Employee presence tracking this week</p>
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(37, 99, 235, 0.1)" />
                <XAxis dataKey="day" stroke="#1e40af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#1e40af" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #dbeafe',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
                  }}
                  labelStyle={{ color: '#1e40af', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="present" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorPresent)" name="Present" />
                <Area type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAbsent)" name="Absent" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Department Distribution Chart */}
          <Card className="chart-card" glass>
            <h2 className="chart-title">👥 Employees by Department</h2>
            <p className="chart-subtitle">Total workforce distribution</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(37, 99, 235, 0.1)" />
                <XAxis dataKey="name" stroke="#1e40af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#1e40af" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #dbeafe',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
                  }}
                  labelStyle={{ color: '#1e40af', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(37, 99, 235, 0.1)' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} name="Employee Count" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Payroll Status Chart */}
          <Card className="chart-card" glass>
            <h2 className="chart-title">💰 Payroll Processing Status</h2>
            <p className="chart-subtitle">Monthly payroll completion rate</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={payrollData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(37, 99, 235, 0.1)" />
                <XAxis dataKey="month" stroke="#1e40af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#1e40af" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #dbeafe',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
                  }}
                  labelStyle={{ color: '#1e40af', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(37, 99, 235, 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="processed" stackId="a" fill="#10b981" radius={[8, 8, 0, 0]} name="Processed" />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Leave Types Distribution Chart */}
          <Card className="chart-card" glass>
            <h2 className="chart-title">📅 Leave Types Distribution</h2>
            <p className="chart-subtitle">Leave requests by type</p>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #dbeafe',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
                  }}
                  labelStyle={{ color: '#1e40af', fontWeight: 'bold' }}
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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
