import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
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
import { RefreshCw, Search, Filter } from "lucide-react";
import { showToast } from "@/shared/ui/toast";
import "@/shared/styles/CrudPage.css";

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
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Workforce Admin</span>
          <h1>Manajemen Kehadiran</h1>
          <p>Pantau dan kelola log kehadiran seluruh karyawan secara real-time.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadAttendanceRecords()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? "Memuat..." : "Segarkan"}
          </Button>
        </div>
      </div>

      <AttendanceSummary stats={stats} />

      <Card className="table-card" glass>
        <div className="table-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '300px' }}>
            <div className="search-box" style={{ flex: 1 }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Cari nama atau ID karyawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} color="#64748b" />
              <select 
                className="form-control" 
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="present">Hadir (Normal)</option>
                <option value="late">Terlambat</option>
              </select>
            </div>
          </div>
          <span className="table-count" style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Menampilkan <strong>{filteredItems.length}</strong> records
          </span>
        </div>

        {loading && items.length === 0 ? (
          <div className="table-card-inner"><LoadingState message="Memuat data kehadiran..." /></div>
        ) : filteredItems.length === 0 ? (
          <div className="table-card-inner">
            <EmptyState
              icon=""
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
      </Card>

      <AttendanceDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        item={selectedDetail} 
      />
    </div>
  );
};

export default AttendanceAdminPage;

