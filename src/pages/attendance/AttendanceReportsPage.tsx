import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { api } from '@/shared/api/httpClient';
import { BarChart3, RefreshCw, Users, TrendingUp, Clock, Calendar } from 'lucide-react';
import '@/shared/styles/CrudPage.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Attendance Center</span>
          <h1>Laporan Kehadiran</h1>
          <p>Analitik dan laporan kehadiran karyawan.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadRecords()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} />
            {loading ? 'Memuat...' : 'Segarkan'}
          </Button>
        </div>
      </div>

      {alertMessage && (
        <Alert variant={alertType === 'success' ? 'success' : 'error'} title={alertType === 'success' ? 'Berhasil' : 'Kesalahan'}>
          {alertMessage}
        </Alert>
      )}

      <div className="summary-grid">
        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Total Records</span>
              <p className="summary-card__subtitle">Semua laporan</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <BarChart3 size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{records.length}</div>
          <div className="summary-card__change">Data 30 hari terakhir</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Hadir</span>
              <p className="summary-card__subtitle">Total kehadiran</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <Users size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{totalPresent}</div>
          <div className="summary-card__change">Total check-in</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Tidak Hadir</span>
              <p className="summary-card__subtitle">Total absen</p>
            </div>
            <span className="summary-card__icon summary-card__icon--red">
              <Clock size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--red">{totalAbsent}</div>
          <div className="summary-card__change">Tanpa keterangan</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Terlambat</span>
              <p className="summary-card__subtitle">Total late</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <TrendingUp size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">{totalLate}</div>
          <div className="summary-card__change">Tidak tepat waktu</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Analitik Kehadiran</h3>
              <span className="wuw-count-badge">30 Hari</span>
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat laporan..." />}
          {!loading && records.length === 0 && (
            <EmptyState title="Tidak Ada Data" message="Belum ada data laporan." />
          )}
          {!loading && records.length > 0 && (
            <div style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Tren Kehadiran Mingguan</h3>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceReportsPage;