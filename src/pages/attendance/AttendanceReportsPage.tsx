import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { api } from '@/shared/api/httpClient';
import {
  deleteAttendanceRecord,
  getAllAttendanceRecords,
  getAttendanceDetail,
  type AttendanceItem,
} from '@/features/attendance/api/attendance-admin.service';
import { AttendanceSummary } from '@/features/attendance/components/AttendanceSummary';
import { AttendanceTable } from '@/features/attendance/components/AttendanceTable';
import { AttendanceDetailModal } from '@/features/attendance/components/AttendanceDetailModal';
import {
  RefreshCw, FileText, Search, Filter, Download,
} from 'lucide-react';
import { showToast } from '@/shared/ui/toast';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import './AttendanceShared.css';
import './AttendanceAdminPage.css';


const AttendanceReportsPage = () => {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [adminItems, setAdminItems] = useState<AttendanceItem[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState(todayStr);
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadAdminRecords = async () => {
    setAdminLoading(true);
    try {
      const result = await getAllAttendanceRecords({
        date_from: filterDate,
        date_to: filterDate,
      });
      setAdminItems(result.items);
    } catch (error: any) {
      showToast(error.message || "Gagal memuat data kehadiran", "error");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleViewDetail = async (id: string) => {
    setAdminLoading(true);
    try {
      const result = await getAttendanceDetail(id);
      setSelectedDetail(result.payload);
      setIsDetailModalOpen(true);
    } catch (error: any) {
      showToast(error.message || "Gagal memuat detail", "error");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus catatan kehadiran ini?")) return;
    setAdminLoading(true);
    try {
      await deleteAttendanceRecord(id);
      showToast("Catatan kehadiran berhasil dihapus", "success");
      await loadAdminRecords();
    } catch (error: any) {
      showToast(error.message || "Gagal menghapus catatan", "error");
    } finally {
      setAdminLoading(false);
    }
  };

  const fmtTime = (time: any) => {
    if (!time) return '--:--';
    try {
      const d = new Date(time);
      if (isNaN(d.getTime())) return String(time);
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    } catch { return String(time); }
  };

  const csvVal = (v: any) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const exportCSV = () => {
    const headers = ['Karyawan', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Status'];
    const rows = filteredItems.map((item: any) => [
      item.employee_name || item.employee?.full_name || item.employee?.name || '-',
      item.date ? new Date(item.date).toLocaleDateString('id-ID') : '-',
      fmtTime(item.check_in),
      fmtTime(item.check_out),
      item.status || '-',
    ]);
    const csv = [headers.map(csvVal), ...rows.map(r => r.map(csvVal))].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-kehadiran.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadTotalEmployees = async () => {
    try {
      const res = await api.get('/employees', { params: { per_page: 1 } });
      const total = res.data?.data?.total ?? 0;
      setTotalEmployees(total);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    void loadAdminRecords();
    void loadTotalEmployees();
  }, [filterDate]);

  const adminStats = useMemo(() => {
    const total = totalEmployees;
    const present = adminItems.filter((i: any) => {
      const s = String(i.status || '').toLowerCase();
      return s.includes('present') || s === 'active' || s === 'on_time';
    }).length;
    const late = adminItems.filter((i: any) => String(i.status || '').toLowerCase().includes('late') || String(i.status || '').toLowerCase().includes('terlambat')).length;
    const absent = 0;
    return { total, present, late, absent };
  }, [adminItems, totalEmployees]);

  const filteredItems = useMemo(() => {
    return adminItems.filter((item: any) => {
      const q = searchQuery.toLowerCase();
      const name = String(item.employee_name || item.employee?.full_name || '').toLowerCase();
      const id = String(item.employee_id || '').toLowerCase();
      const status = String(item.status || '').toLowerCase();
      const matchesSearch = name.includes(q) || id.includes(q);
      const matchesStatus = !filterStatus || status.includes(filterStatus.toLowerCase());
      return matchesSearch && matchesStatus;
    });
  }, [adminItems, searchQuery, filterStatus]);

  return (
    <div className="crud-page">
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
            <button className="btn-outline" onClick={exportCSV}>
              <Download size={16} />
              Export Data Karyawan
            </button>
            <button className="btn-outline" onClick={() => void loadAdminRecords()}>
              <RefreshCw size={16} className={adminLoading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      <AttendanceSummary stats={adminStats} />

      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari nama atau ID karyawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-pill"
              />
            </div>
            <div className="filter-btn-rounded">
              <Filter size={18} />
              <span>Filter</span>
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="filter-select-premium"
              style={{ height: '44px', minWidth: '160px' }}
            />
          </div>
          <select
            className="filter-select-premium"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ height: '44px', minWidth: '180px' }}
          >
            <option value="">Semua Status</option>
            <option value="on_time">Hadir</option>
            <option value="late">Terlambat</option>
            <option value="absent">Absen</option>
          </select>
        </div>
      </Card>

      <div className="table-section">
        <div className="table-wrap">
          {adminLoading && adminItems.length === 0 ? (
            <LoadingState message="Memuat data kehadiran..." />
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <EmptyState title="Tidak ada data" message="Coba ubah kriteria pencarian atau filter Anda." />
            </div>
          ) : (
            <AttendanceTable
              items={filteredItems}
              onView={handleViewDetail}
              onDelete={handleDeleteRecord}
              loading={adminLoading}
            />
          )}
        </div>
      </div>

      <AttendanceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        item={selectedDetail}
      />
    </div>
  );
};

export default AttendanceReportsPage;
