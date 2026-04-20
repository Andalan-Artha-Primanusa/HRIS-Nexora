import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { getAllWorkSchedules, deleteWorkSchedule } from "@/features/work-schedule/api/work-schedule.service";
import type { WorkScheduleItem } from "@/features/work-schedule/types/work-schedule.types";
import { 
  Clock, 
  Pencil, 
  Plus, 
  RefreshCw, 
  Trash2, 
  CalendarDays,
  Timer
} from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "./WorkSchedulesPage.css";

const WorkSchedulesPage = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<WorkScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);

  const loadSchedules = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      const result = await getAllWorkSchedules();
      setSchedules(result.items);
    } catch (err: any) {
      setStatusMessage(err.message || "Gagal memuat jadwal kerja");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    setLoading(true);
    try {
      await deleteWorkSchedule(id);
      setStatusMessage("Jadwal kerja berhasil dihapus");
      setStatusType("success");
      setDeleteConfirmId(null);
      await loadSchedules();
    } catch (err: any) {
      setStatusMessage(err.message || "Gagal menghapus jadwal kerja");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSchedules();
  }, []);

  const summaryCards = [
    {
      label: "Total Jadwal",
      subtitle: "Shift yang terdaftar",
      value: String(schedules.length),
      change: "Data shift aktif",
      tone: "blue" as const,
      icon: Clock,
    },
    {
      label: "Jam Kerja Standar",
      subtitle: "Rata-rata durasi",
      value: "9 Jam",
      change: "Termasuk istirahat",
      tone: "green" as const,
      icon: CalendarDays,
    },
  ];

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Workforce Center</span>
          <h1>Manajemen Jadwal Kerja</h1>
          <p>Kelola shift, jam masuk, jam pulang, dan toleransi keterlambatan karyawan.</p>
        </div>
        <div className="page-header-actions">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/work-schedules/add")}
            disabled={loading}
          >
            <Plus size={16} />
            Buat Jadwal Baru
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => void loadSchedules()}
            disabled={loading}
            style={{ borderColor: "#2563eb", color: "#2563eb" }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Memuat..." : "Segarkan"}
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="summary-card" glass>
              <div className="summary-card__header">
                <div>
                  <span className="summary-card__label">{card.label}</span>
                  <p className="summary-card__subtitle">{card.subtitle}</p>
                </div>
                <span className={`summary-card__icon summary-card__icon--${card.tone}`}>
                  <Icon size={20} />
                </span>
              </div>
              <div className={`summary-card__value summary-card__value--${card.tone}`}>{card.value}</div>
              <div className="summary-card__change">{card.change}</div>
            </Card>
          );
        })}
      </div>

      {statusMessage && (
        <Alert
          type={statusType}
          message={statusMessage}
          onClose={() => setStatusMessage("")}
          dismissible
        />
      )}

      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Daftar Shift & Jadwal</h3>
          <span className="table-count">{schedules.length} jadwal</span>
        </div>

        {schedules.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Jadwal</th>
                  <th>Jam Masuk</th>
                  <th>Jam Pulang</th>
                  <th>Grace Period</th>
                  <th className="th-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td>
                      <div className="cell-name">
                        <div className="cell-avatar">
                          <Clock size={14} />
                        </div>
                        <span className="cell-name-text">{schedule.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge-soft badge-soft--blue">
                        {schedule.check_in_time}
                      </span>
                    </td>
                    <td>
                      <span className="badge-soft badge-soft--blue">
                        {schedule.check_out_time}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Timer size={14} style={{ color: '#64748b' }} />
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          {schedule.grace_period} menit
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="cell-actions">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/work-schedules/edit/${schedule.id}`)}
                          disabled={loading}
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (deleteConfirmId === schedule.id) {
                              void handleDelete(schedule.id);
                            } else {
                              setDeleteConfirmId(schedule.id);
                            }
                          }}
                          disabled={loading}
                          style={{ color: deleteConfirmId === schedule.id ? '#ef4444' : undefined }}
                        >
                          <Trash2 size={15} />
                        </Button>
                        {deleteConfirmId === schedule.id && (
                          <span style={{ fontSize: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Yakin?
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmId(null)}
                              disabled={loading}
                              style={{ padding: '0 4px', fontSize: '0.8rem', color: '#64748b' }}
                            >
                              Batal
                            </Button>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Clock size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Belum ada jadwal kerja yang terdaftar.</p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/work-schedules/add")}
              style={{ marginTop: '1rem' }}
            >
              <Plus size={16} />
              Buat Jadwal Pertama
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WorkSchedulesPage;
