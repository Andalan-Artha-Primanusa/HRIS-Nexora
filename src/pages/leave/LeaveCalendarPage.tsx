import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Alert } from "@/shared/ui/Alert";
import { getLeaveCalendar } from "@/features/leave/api/leave.service";

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, ChevronLeft, ChevronRight, CircleCheckBig, CircleX, Clock3, Calendar, RefreshCw } from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "./LeaveShared.css";
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
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');
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
      setAlertMessage("Leave calendar berhasil dimuat");
      setAlertType('info');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat leave calendar";
      setAlertMessage(message);
      setAlertType('error');
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
      default: return '#2563eb';
    }
  };

  const monthDays = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: monthDays }, (_, i) => i + 1);
  const previousDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const chartColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _leaveSummaryCards = [
    {
      label: 'Total Requests',
      subtitle: 'Semua data pengajuan cuti',
      value: String(stats.total),
      change: 'Ringkasan keseluruhan',
      tone: 'blue' as const,
      icon: BarChart3,
    },
    {
      label: 'Pending',
      subtitle: 'Menunggu persetujuan',
      value: String(stats.pending),
      change: 'Perlu tindakan approval',
      tone: 'orange' as const,
      icon: Clock3,
    },
    {
      label: 'Approved',
      subtitle: 'Pengajuan disetujui',
      value: String(stats.approved),
      change: 'Status final berhasil',
      tone: 'green' as const,
      icon: CircleCheckBig,
    },
    {
      label: 'Rejected',
      subtitle: 'Pengajuan ditolak',
      value: String(stats.rejected),
      change: 'Perlu revisi atau tindak lanjut',
      tone: 'red' as const,
      icon: CircleX,
    },
  ];

  return (
    <div className="crud-page">
      {/* Header - Same style as Dashboard */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Calendar size={16} />
              <span>Pusat Kalender</span>
            </div>
            <h1 className="hero-title">Kalender Cuti</h1>
            <p className="hero-subtitle">Visual kalender pengajuan cuti dengan analitik yang konsisten.</p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadCalendar()}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {alertMessage && (
        <Alert 
          type={alertType} 
          message={alertMessage}
          onClose={() => setAlertMessage('')}
          dismissible
        />
      )}

      {/* Summary Cards */}
      <div className="leave-requests-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Total Pengajuan</p>
              <p className="leave-summary-subtitle">Semua data cuti</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <BarChart3 size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-blue">{stats.total}</div>
          <p className="leave-summary-trend">Ringkasan keseluruhan</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Menunggu</p>
              <p className="leave-summary-subtitle">Menunggu persetujuan</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-orange">
              <Clock3 size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-orange">{stats.pending}</div>
          <p className="leave-summary-trend">Perlu tindakan approval</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Disetujui</p>
              <p className="leave-summary-subtitle">Pengajuan disetujui</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-green">
              <CircleCheckBig size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-green">{stats.approved}</div>
          <p className="leave-summary-trend">Status final berhasil</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Ditolak</p>
              <p className="leave-summary-subtitle">Pengajuan ditolak</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-red">
              <CircleX size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-red">{stats.rejected}</div>
          <p className="leave-summary-trend">Perlu revisi</p>
        </div>
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Kalender Cuti</h2>
            <p className="analytics-subtitle">Visual kalender pengajuan cuti</p>
          </div>
        </div>
      </Card>

      <div className="crud-table-section">
        {/* Calendar Grid */}
        <Card className="crud-table-card">
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
              <span>Disetujui</span>
            </div>
            <div className="legend-item">
              <div className="legend-color pending"></div>
              <span>Menunggu</span>
            </div>
            <div className="legend-item">
              <div className="legend-color rejected"></div>
              <span>Ditolak</span>
            </div>
          </div>
        </Card>

        {/* Charts Section */}
        <div className="calendar-charts-grid">
          {/* Leave Types Pie Chart */}
          <Card className="chart-card" glass>
            <h3 className="chart-title">Distribusi Jenis Cuti</h3>
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
            <h3 className="chart-title">Ringkasan Status</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[{ name: 'Requests', approved: stats.approved, pending: stats.pending, rejected: stats.rejected }]}>
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
            <h3 className="chart-title">Detail Status per Jenis Cuti</h3>
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
