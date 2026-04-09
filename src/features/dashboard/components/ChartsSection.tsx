import React from 'react';
import { Card } from '@/shared/ui/Card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import './ChartsSection.css';

const attendanceData = [
  { name: 'Mon', present: 245, leave: 9 },
  { name: 'Tue', present: 250, leave: 4 },
  { name: 'Wed', present: 242, leave: 12 },
  { name: 'Thu', present: 248, leave: 6 },
  { name: 'Fri', present: 235, leave: 19 },
  { name: 'Sat', present: 10, leave: 244 },
  { name: 'Sun', present: 5, leave: 249 },
];

const departmentData = [
  { name: 'Engineering', value: 85 },
  { name: 'Sales', value: 45 },
  { name: 'Marketing', value: 30 },
  { name: 'HR', value: 15 },
  { name: 'Finance', value: 25 },
  { name: 'Operations', value: 54 },
];

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'];

export const ChartsSection: React.FC = () => {
  return (
    <div className="charts-grid">
      <Card className="chart-card" glass>
        <h3 className="chart-title">Attendance Trend (This Week)</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={attendanceData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Area type="monotone" dataKey="present" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="chart-card" glass>
        <h3 className="chart-title">Employee Distribution</h3>
        <div className="chart-container pie-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {departmentData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

