import { Card } from '@/shared/ui/Card';
import { TrendingUp, Calendar, Clock, AlertCircle } from 'lucide-react';
import './AttendancePages.css';

const AttendanceOverviewPage = () => {
  // Mock data - replace with actual API data
  const attendanceStats = {
    present: 18,
    absent: 2,
    late: 3,
    attendanceRate: 85,
    totalWorkingDays: 23,
    workHours: 162,
  };

  return (
    <div className="attendance-page">
      <div className="attendance-hero-card">
        <div>
          <p className="attendance-badge">Attendance Center</p>
          <h1>Attendance Dashboard</h1>
          <p className="attendance-hero-copy">
            Ringkasan kehadiran dan statistik kehadiran Anda bulan ini.
          </p>
        </div>
      </div>

      <div className="attendance-grid">
        {/* Attendance Rate */}
        <Card className="attendance-summary-card" glass>
          <div className="summary-card-head">
            <TrendingUp size={22} />
            <div>
              <p className="summary-label">Tingkat Kehadiran</p>
              <p className="summary-subtitle">Persentase kehadiran bulan ini</p>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
              {attendanceStats.attendanceRate}%
            </p>
          </div>
        </Card>

        {/* Total Present */}
        <Card className="attendance-summary-card" glass>
          <div className="summary-card-head">
            <Calendar size={22} />
            <div>
              <p className="summary-label">Hari Hadir</p>
              <p className="summary-subtitle">Total hari kehadiran</p>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {attendanceStats.present}/{attendanceStats.totalWorkingDays}
            </p>
          </div>
        </Card>

        {/* Total Absent */}
        <Card className="attendance-summary-card" glass>
          <div className="summary-card-head">
            <AlertCircle size={22} />
            <div>
              <p className="summary-label">Hari Tidak Hadir</p>
              <p className="summary-subtitle">Total hari tidak hadir</p>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
              {attendanceStats.absent}
            </p>
          </div>
        </Card>

        {/* Late Count */}
        <Card className="attendance-summary-card" glass>
          <div className="summary-card-head">
            <Clock size={22} />
            <div>
              <p className="summary-label">Keterlambatan</p>
              <p className="summary-subtitle">Total hari terlambat</p>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {attendanceStats.late}
            </p>
          </div>
        </Card>

        {/* Total Work Hours */}
        <Card className="attendance-summary-card" glass>
          <div className="summary-card-head">
            <Clock size={22} />
            <div>
              <p className="summary-label">Total Jam Kerja</p>
              <p className="summary-subtitle">Jam kerja bulan ini</p>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {attendanceStats.workHours}h
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceOverviewPage;
