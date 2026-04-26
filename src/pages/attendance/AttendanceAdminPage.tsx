import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { LoadingState, EmptyState } from "@/shared/ui/DataStateDisplay";
import {
  deleteAttendanceRecord,
  getAllAttendanceRecords,
  getAttendanceDetail,
  type AttendanceItem,
} from "@/features/attendance/api/attendance-admin.service";
import { AttendanceSummary } from "@/features/attendance/components/AttendanceSummary";
import { AttendanceTable } from "@/features/attendance/components/AttendanceTable";
import { AttendanceDetailModal } from "@/features/attendance/components/AttendanceDetailModal";
import { RefreshCw, Search, Filter, Clock, Users } from "lucide-react";
import { showToast } from "@/shared/ui/toast";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "./AttendanceAdminPage.css";

const AttendanceAdminPage = () => {
  const [items, setItems] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadAttendanceRecords = async () => {
    setLoading(true);
    try {
      const result = await getAllAttendanceRecords();
      setItems(result.items);
    } catch (error: any) {
      showToast(error.message || "Gagal memuat data kehadiran", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id: string) => {
    setLoading(true);
    try {
      const result = await getAttendanceDetail(id);
      setSelectedDetail(result.payload);
      setIsDetailModalOpen(true);
    } catch (error: any) {
      showToast(error.message || "Gagal memuat detail", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus catatan kehadiran ini?")) return;
    setLoading(true);
    try {
      await deleteAttendanceRecord(id);
      showToast("Catatan kehadiran berhasil dihapus", "success");
      await loadAttendanceRecords();
    } catch (error: any) {
      showToast(error.message || "Gagal menghapus catatan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAttendanceRecords();
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const present = items.filter((i: any) => String(i.status || '').toLowerCase().includes('present') || String(i.status || '').toLowerCase() === 'active').length;
    const late = items.filter((i: any) => String(i.status || '').toLowerCase().includes('late') || String(i.status || '').toLowerCase().includes('terlambat')).length;
    const absent = 0; // Backend usually doesn't return absent records unless predefined
    return { total, present, late, absent };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      const q = searchQuery.toLowerCase();
      const name = String(item.employee_name || item.employee?.full_name || '').toLowerCase();
      const id = String(item.employee_id || '').toLowerCase();
      const status = String(item.status || '').toLowerCase();

      const matchesSearch = name.includes(q) || id.includes(q);
      const matchesStatus = !filterStatus || status.includes(filterStatus.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, filterStatus]);

  return (
    <div className="crud-page">
      {/* Header - Same style as Dashboard */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Clock size={16} />
              <span>Pusat Kehadiran</span>
            </div>
            <h1 className="hero-title">Manajemen Kehadiran</h1>
            <p className="hero-subtitle">Pantau dan kelola log kehadiran seluruh karyawan secara real-time.</p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadAttendanceRecords()}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      <AttendanceSummary stats={stats} />

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Users size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Kehadiran</h2>
            <p className="analytics-subtitle">Log kehadiran harian karyawan</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
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
          </div>
          <select 
            className="filter-select-premium"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ height: '44px', minWidth: '180px' }}
          >
            <option value="">Semua Status</option>
            <option value="present">Hadir</option>
            <option value="late">Terlambat</option>
          </select>
        </div>
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="table-wrap">
          {loading && items.length === 0 ? (
            <LoadingState message="Memuat data kehadiran..." />
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <EmptyState
                title="Tidak ada data"
                message="Coba ubah kriteria pencarian atau filter Anda."
              />
            </div>
          ) : (
            <AttendanceTable 
              items={filteredItems} 
              onView={handleViewDetail} 
              onDelete={handleDeleteRecord} 
              loading={loading}
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

export default AttendanceAdminPage;

