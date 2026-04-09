import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Clock, MapPin, CalendarDays, ListChecks } from 'lucide-react';
import './AttendancePages.css';

const AttendanceOverviewPage = () => {
  const navigate = useNavigate();

  return (
    <div className="attendance-page">
      <div className="attendance-hero-card">
        <div>
          <p className="attendance-badge">Attendance Center</p>
          <h1>Attendance Dashboard</h1>
          <p className="attendance-hero-copy">
            Kelola check-in, check-out, dan lihat riwayat kehadiran secara aman dan cepat.
          </p>
        </div>

        <div className="attendance-hero-actions">
          <Button variant="primary" size="md" onClick={() => navigate('/attendance/check-in')}>
            Check In
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/attendance/check-out')}>
            Check Out
          </Button>
        </div>
      </div>

      <div className="attendance-grid">
        <Card className="attendance-summary-card" glass>
          <div className="summary-card-head">
            <MapPin size={22} />
            <div>
              <p className="summary-label">Aktivitas Check In</p>
              <p className="summary-subtitle">Touchpoint lokasi dan waktu kerja Anda.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/attendance/check-in')}>
            Buka Check In
          </Button>
        </Card>

        <Card className="attendance-summary-card" glass>
          <div className="summary-card-head">
            <Clock size={22} />
            <div>
              <p className="summary-label">Check Out</p>
              <p className="summary-subtitle">Tutup shift dan catat jam pulang.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/attendance/check-out')}>
            Buka Check Out
          </Button>
        </Card>

        <Card className="attendance-summary-card" glass>
          <div className="summary-card-head">
            <CalendarDays size={22} />
            <div>
              <p className="summary-label">Today</p>
              <p className="summary-subtitle">Lihat status absen hari ini.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/attendance/today')}>
            Lihat Hari Ini
          </Button>
        </Card>

        <Card className="attendance-summary-card" glass>
          <div className="summary-card-head">
            <ListChecks size={22} />
            <div>
              <p className="summary-label">History</p>
              <p className="summary-subtitle">Riwayat absen lengkap Anda.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/attendance/history')}>
            Lihat Riwayat
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceOverviewPage;
