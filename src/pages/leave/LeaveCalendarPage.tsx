import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { getLeaveCalendar } from "@/features/leave/api/leave.service";

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./LeavePages.css";

interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  status: string;
}

const LeaveCalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [statusMessage, setStatusMessage] = useState("Ready to load leave calendar");
  const [loading, setLoading] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const approved = events.filter(e => e.status === 'approved').length;
    const rejected = events.filter(e => e.status === 'rejected').length;
    const pending = events.filter(e => e.status === 'pending').length;
    
    // Leave type breakdown
    const leaveTypes = events.reduce((acc, e) => {
      const type = e.title.split(' - ')[0];
      const existing = acc.find(t => t.name === type);
      if (existing) existing.value++;
      else acc.push({ name: type, value: 1 });
      return acc;
    }, [] as { name: string; value: number }[]);

    // Status breakdown by type
    const statusByType = [...new Set(events.map(e => e.title.split(' - ')[0]))].map(type => {
      const typeEvents = events.filter(e => e.title.startsWith(type));
      return {
        type,
        approved: typeEvents.filter(e => e.status === 'approved').length,
        rejected: typeEvents.filter(e => e.status === 'rejected').length,
        pending: typeEvents.filter(e => e.status === 'pending').length,
      };
    });

    return { approved, rejected, pending, total: events.length, leaveTypes, statusByType };
  }, [events]);

  const loadCalendar = async () => {
    setLoading(true);
    setStatusMessage("Memuat leave calendar...");

    try {
      const result = await getLeaveCalendar();

      // Parse events from items
      const parsedEvents = result.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        start: item.start,
        end: item.end,
        status: item.status,
      }));
      
      setEvents(parsedEvents);
      setStatusMessage("Leave calendar berhasil dimuat");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat leave calendar";
      setStatusMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCalendar();
  }, []);

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (day: number, month: number, year: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return events.filter(event => {
      const eventStart = event.start.split('T')[0];
      const eventEnd = event.end.split('T')[0];
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
  };

  const getEventColor = (status: string) => {
    switch(status) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const monthDays = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: monthDays }, (_, i) => i + 1);
  const previousDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="leave-page">
      {/* Header */}
      <div className="leave-header">
        <div>
          <h1>📅 Leave Calendar & Analytics</h1>
          <p>Visual calendar view of all leave requests with detailed analytics</p>
        </div>
        <Button variant="primary" size="md" onClick={() => void loadCalendar()} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Calendar'}
        </Button>
      </div>

      {statusMessage && (
        <div className="leave-alert leave-alert-info" style={{ background: '#dbeafe', borderColor: '#93c5fd', color: '#1e40af' }}>
          ℹ {statusMessage}
        </div>
      )}

      {/* Summary Stats */}
      <div className="calendar-stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-label">Total Requests</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>

        <div className="stat-card stat-approved">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <span className="stat-label">Approved</span>
            <span className="stat-value">{stats.approved}</span>
          </div>
        </div>

        <div className="stat-card stat-pending">
          <div className="stat-icon">⏱</div>
          <div className="stat-content">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>

        <div className="stat-card stat-rejected">
          <div className="stat-icon">✕</div>
          <div className="stat-content">
            <span className="stat-label">Rejected</span>
            <span className="stat-value">{stats.rejected}</span>
          </div>
        </div>
      </div>

      <div className="calendar-section">
        {/* Calendar Grid */}
        <Card className="calendar-card" glass>
          <div className="calendar-header">
            <button 
              className="calendar-nav-btn"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="calendar-month">{monthName}</h2>
            <button 
              className="calendar-nav-btn"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day headers */}
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}

            {/* Previous month days */}
            {previousDays.map((_, i) => (
              <div key={`prev-${i}`} className="calendar-day empty"></div>
            ))}

            {/* Current month days */}
            {days.map(day => {
              const dayEvents = getEventsForDate(day, currentDate.getMonth(), currentDate.getFullYear());
              const hasEvents = dayEvents.length > 0;
              
              return (
                <div 
                  key={day} 
                  className={`calendar-day ${hasEvents ? 'has-events' : ''}`}
                  title={dayEvents.map(e => e.title).join('\n')}
                >
                  <span className="calendar-day-number">{day}</span>
                  {hasEvents && (
                    <div className="calendar-day-events">
                      {dayEvents.slice(0, 2).map(event => (
                        <div 
                          key={event.id}
                          className="calendar-event-dot"
                          style={{ backgroundColor: getEventColor(event.status) }}
                          title={event.title}
                        />
                      ))}
                      {dayEvents.length > 2 && <span className="calendar-event-more">+{dayEvents.length - 2}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-color approved"></div>
              <span>Approved</span>
            </div>
            <div className="legend-item">
              <div className="legend-color pending"></div>
              <span>Pending</span>
            </div>
            <div className="legend-item">
              <div className="legend-color rejected"></div>
              <span>Rejected</span>
            </div>
          </div>
        </Card>

        {/* Charts Section */}
        <div className="calendar-charts-grid">
          {/* Leave Types Pie Chart */}
          <Card className="chart-card" glass>
            <h3 className="chart-title">📋 Leave Types Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #dbeafe',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Pie
                  data={stats.leaveTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#2563eb"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {stats.leaveTypes.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Status Overview Bar Chart */}
          <Card className="chart-card" glass>
            <h3 className="chart-title">📊 Status Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[{ approved: stats.approved, pending: stats.pending, rejected: stats.rejected }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(37, 99, 235, 0.1)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #dbeafe',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="approved" fill="#10b981" />
                <Bar dataKey="pending" fill="#f59e0b" />
                <Bar dataKey="rejected" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Status by Type */}
          <Card className="chart-card full-width" glass>
            <h3 className="chart-title">📈 Status Breakdown by Leave Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.statusByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(37, 99, 235, 0.1)" />
                <XAxis dataKey="type" style={{ fontSize: '12px' }} />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #dbeafe',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="approved" stackId="a" fill="#10b981" />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" />
                <Bar dataKey="rejected" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default LeaveCalendarPage;
