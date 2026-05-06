import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Alert } from '@/shared/ui/Alert';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { api } from '@/shared/api/httpClient';
import { BarChart3, RefreshCw, Users, TrendingUp, Clock, FileText } from 'lucide-react';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import './AttendanceShared.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CardHeader } from '@/shared/ui';

interface ReportRecord {
  id?: number;
  date?: string;
  total_present?: number;
  total_absent?: number;
  total_late?: number;
  department?: string;
  [key: string]: any;
}

const AttendanceReportsPage = () => {
  const [records, setRecords] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('error');

  const loadRecords = async () => {
    setLoading(true);
    setAlertMessage('');
    try {
      const result = await api.get('/attendance/intelligence', { params: { days: 30 } });
      const payload = result.data?.data ?? result.data;
      setRecords(Array.isArray(payload) ? payload : []);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      setAlertMessage(message);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords();
  }, []);

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const totalPresent = records.reduce((sum, r) => sum + (r.total_present || 0), 0);
  const totalAbsent = records.reduce((sum, r) => sum + (r.total_absent || 0), 0);
  const totalLate = records.reduce((sum, r) => sum + (r.total_late || 0), 0);

  const chartData = records.slice(0, 7).map(r => ({
    name: r.date ? new Date(r.date).toLocaleDateString('id-ID', { weekday: 'short' }) : 'N/A',
    hadir: r.total_present || 0,
    absent: r.total_absent || 0,
    late: r.total_late || 0,
  }));

  return (
    <div className="crud-page">
      {/* Header - Same style as Dashboard */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <FileText size={16} />
              <span>Pusat Laporan</span>
            </div>
            <h1 className="hero-title">Laporan Kehadiran</h1>
            <p className="hero-subtitle">Analitik dan laporan kehadiran karyawan.</p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadRecords()}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {alertMessage && (
        <Alert variant={alertType === 'success' ? 'success' : 'error'} title={alertType === 'success' ? 'Berhasil' : 'Kesalahan'}>
          {alertMessage}
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="attendance-reports-wrapper">
        <div className="attendance-summary-card">
          <div className="attendance-summary-header">
            <div>
              <p className="attendance-summary-label">Total Records</p>
              <p className="attendance-summary-subtitle">Semua laporan</p>
            </div>
            <div className="attendance-summary-icon-wrapper attendance-icon-blue">
              <BarChart3 size={28} />
            </div>
          </div>
          <div className="attendance-summary-value attendance-value-blue">{records.length}</div>
          <p className="attendance-summary-trend">Data 30 hari terakhir</p>
        </div>

        <div className="attendance-summary-card">
          <div className="attendance-summary-header">
            <div>
              <p className="attendance-summary-label">Hadir</p>
              <p className="attendance-summary-subtitle">Total kehadiran</p>
            </div>
            <div className="attendance-summary-icon-wrapper attendance-icon-green">
              <Users size={28} />
            </div>
          </div>
          <div className="attendance-summary-value attendance-value-green">{totalPresent}</div>
          <p className="attendance-summary-trend">Total check-in</p>
        </div>

        <div className="attendance-summary-card">
          <div className="attendance-summary-header">
            <div>
              <p className="attendance-summary-label">Tidak Hadir</p>
              <p className="attendance-summary-subtitle">Total absen</p>
            </div>
            <div className="attendance-summary-icon-wrapper attendance-icon-red">
              <Clock size={28} />
            </div>
          </div>
          <div className="attendance-summary-value attendance-value-red">{totalAbsent}</div>
          <p className="attendance-summary-trend">Tanpa keterangan</p>
        </div>

        <div className="attendance-summary-card">
          <div className="attendance-summary-header">
            <div>
              <p className="attendance-summary-label">Terlambat</p>
              <p className="attendance-summary-subtitle">Total late</p>
            </div>
            <div className="attendance-summary-icon-wrapper attendance-icon-orange">
              <TrendingUp size={28} />
            </div>
          </div>
          <div className="attendance-summary-value attendance-value-orange">{totalLate}</div>
          <p className="attendance-summary-trend">Tidak tepat waktu</p>
        </div>
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <CardHeader
          icon={BarChart3}
          title="Analitik Kehadiran"
          subtitle="Laporan dan tren kehadiran"
          iconColor="#1d4ed8"
          iconBgColor="#dbeafe"
        />
      </Card>

      {/* Chart Section */}
      <div className="chart-section">
        <Card className="chart-card">
          {loading && <LoadingState message="Memuat laporan..." />}
          {!loading && records.length === 0 && (
            <div className="empty-state">
              <EmptyState title="Tidak Ada Data" message="Belum ada data laporan." />
            </div>
          )}
          {!loading && records.length > 0 && (
            <>
              <div className="chart-header">
                <h3 className="chart-title">Tren Kehadiran Mingguan</h3>
                <p className="chart-subtitle">Perbandingan kehadiran karyawan</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(37, 99, 235, 0.1)" />
                  <XAxis dataKey="name" stroke="#1e40af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#1e40af" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #dbeafe',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="hadir" fill="#10b981" radius={[4, 4, 0, 0]} name="Hadir" />
                  <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Terlambat" />
                  <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AttendanceReportsPage;