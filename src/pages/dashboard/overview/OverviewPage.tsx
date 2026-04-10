import React, { useState, useEffect } from 'react';
import { KpiCards } from '@/features/dashboard/components/KpiCards';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

  const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    // Load real data from API if available
    const loadDashboardData = async () => {
      try {
        // You can replace these with actual API calls
        const [attendanceRes, departmentRes, leaveRes] = await Promise.allSettled([
          api.get('/attendance/weekly'),
          api.get('/employees/by-department'),
          api.get('/leaves/by-type'),
        ]);

        // Only update if API calls succeed, otherwise keep default data
        if (attendanceRes.status === 'fulfilled' && Array.isArray(attendanceRes.value?.data)) {
          setAttendanceData(attendanceRes.value.data);
        }
        if (departmentRes.status === 'fulfilled' && Array.isArray(departmentRes.value?.data)) {
          setDepartmentData(departmentRes.value.data);
        }
        if (leaveRes.status === 'fulfilled' && Array.isArray(leaveRes.value?.data)) {
          setLeaveTypeData(leaveRes.value.data);
        }
      } catch (error) {
        console.warn('Failed to load dashboard data, using defaults', error);
      }
    };

    void loadDashboardData();
  }, []);

  return (
    <div className="overview-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back, here's what's happening today.</p>
        </div>
        <div className="page-actions">
          <button className="ui-button ui-button--outline ui-button--md">Export Report</button>
          <button className="ui-button ui-button--primary ui-button--md">Run Payroll</button>
        </div>
      </div>

      <KpiCards />

      <div className="charts-section">
        <div className="charts-grid">
          {/* Attendance Trend Chart */}
          <Card className="chart-card" glass>
            <h2 className="chart-title">Weekly Attendance Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(37, 99, 235, 0.1)" />
                <XAxis dataKey="day" stroke="#1e40af" />
                <YAxis stroke="#1e40af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fcff', 
                    border: '1px solid #dbeafe',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#1e40af' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="present" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Present"
                />
                <Line 
                  type="monotone" 
                  dataKey="absent" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Absent"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Department Distribution Chart */}
          <Card className="chart-card" glass>
            <h2 className="chart-title">Employees by Department</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(37, 99, 235, 0.1)" />
                <XAxis dataKey="name" stroke="#1e40af" />
                <YAxis stroke="#1e40af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fcff', 
                    border: '1px solid #dbeafe',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#1e40af' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} name="Employee Count" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Leave Types Distribution Chart */}
          <Card className="chart-card full-width" glass>
            <h2 className="chart-title">Leave Types Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fcff', 
                    border: '1px solid #dbeafe',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#1e40af' }}
                />
                <Legend />
                <Pie
                  data={leaveTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#2563eb"
                  dataKey="value"
                >
                  {leaveTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
