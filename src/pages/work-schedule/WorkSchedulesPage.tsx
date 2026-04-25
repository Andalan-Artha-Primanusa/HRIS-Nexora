import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { getAllWorkSchedules, deleteWorkSchedule } from "@/features/work-schedule/api/work-schedule.service";
import type { WorkScheduleItem } from "@/features/work-schedule/types/work-schedule.types";
import { 
  Activity,
  Clock, 
  Pencil, 
  Plus, 
  RefreshCw, 
  Trash2, 
  CalendarDays,
  Timer,
  TrendingUp
} from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "./WorkSchedulesPage.css";

const parseTimeToMinutes = (time?: string) => {
  if (!time) {
    return null;
  }

  const [hour, minute] = time.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  return hour * 60 + minute;
};

const formatDuration = (minutes: number | null) => {
  if (minutes === null || minutes <= 0) {
    return "-";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} Jam`;
  }

  return `${hours}j ${remainingMinutes}m`;
};

const calculateShiftDuration = (schedule: WorkScheduleItem) => {
  const checkIn = parseTimeToMinutes(schedule.check_in_time);
  const checkOut = parseTimeToMinutes(schedule.check_out_time);

  if (checkIn === null || checkOut === null) {
    return null;
  }

  return checkOut >= checkIn ? checkOut - checkIn : checkOut + 24 * 60 - checkIn;
};

const formatEarliestTime = (schedules: WorkScheduleItem[]) => {
  const times = schedules
    .map((schedule) => parseTimeToMinutes(schedule.check_in_time))
    .filter((time): time is number => time !== null)
    .sort((first, second) => first - second);

  if (times.length === 0) {
    return "-";
  }

  const earliest = times[0];
  const hour = String(Math.floor(earliest / 60)).padStart(2, "0");
  const minute = String(earliest % 60).padStart(2, "0");

  return `${hour}:${minute}`;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

const WorkSchedulesPage = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<WorkScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);

  const loadSchedules = async (options: { clearMessage?: boolean } = {}) => {
    const { clearMessage = true } = options;
    setLoading(true);
    if (clearMessage) {
      setStatusMessage("");
    }
    try {
      const result = await getAllWorkSchedules();
      setSchedules(result.items);
    } catch (error) {
      setStatusMessage(getErrorMessage(error, "Gagal memuat jadwal kerja"));
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
      await loadSchedules({ clearMessage: false });
    } catch (error) {
      setStatusMessage(getErrorMessage(error, "Gagal menghapus jadwal kerja"));
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSchedules();
  }, []);

  const totalDuration = schedules.reduce((total, schedule) => {
    const duration = calculateShiftDuration(schedule);
    return duration === null ? total : total + duration;
  }, 0);
  const schedulesWithDuration = schedules.filter((schedule) => calculateShiftDuration(schedule) !== null).length;
  const averageDuration = schedulesWithDuration > 0 ? Math.round(totalDuration / schedulesWithDuration) : null;
  const averageGracePeriod =
    schedules.length > 0
      ? Math.round(schedules.reduce((total, schedule) => total + Number(schedule.grace_period || 0), 0) / schedules.length)
      : 0;

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
      label: "Rata-rata Durasi",
      subtitle: "Durasi shift terjadwal",
      value: formatDuration(averageDuration),
      change: schedulesWithDuration > 0 ? `${schedulesWithDuration} shift terhitung` : "Belum ada durasi",
      tone: "green" as const,
      icon: CalendarDays,
    },
    {
      label: "Grace Period",
      subtitle: "Rata-rata toleransi",
      value: `${averageGracePeriod} mnt`,
      change: "Batas keterlambatan",
      tone: "orange" as const,
      icon: Timer,
    },
    {
      label: "Jam Masuk Awal",
      subtitle: "Shift paling pagi",
      value: formatEarliestTime(schedules),
      change: schedules.length > 0 ? "Berdasarkan jam masuk" : "Belum ada jadwal",
      tone: "purple" as const,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="crud-page work-schedules-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Activity size={16} />
              <span>Workforce Center</span>
            </div>
            <h1 className="hero-title">Manajemen Jadwal Kerja</h1>
            <p className="hero-subtitle">
              Kelola shift, jam masuk, jam pulang, dan toleransi keterlambatan karyawan dalam satu tampilan.
            </p>
          </div>
          <div className="hero-actions">
            <button
              className="btn-outline"
              onClick={() => void loadSchedules()}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Memuat..." : "Segarkan"}
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate("/work-schedules/add")}
              disabled={loading}
            >
              <Plus size={16} />
              Buat Jadwal Baru
            </button>
          </div>
        </div>
      </Card>

      <div className="summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="metric-card">
              <div className="metric-header">
                <div>
                  <span className="metric-label">{card.label}</span>
                  <p className="metric-subtitle">{card.subtitle}</p>
                </div>
                <span className={`metric-icon metric-icon--${card.tone}`}>
                  <Icon size={24} />
                </span>
              </div>
              <div className="metric-value">{card.value}</div>
              <div className="metric-change">{card.change}</div>
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

      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <CalendarDays size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Shift & Jadwal</h2>
            <p className="analytics-subtitle">Pantau konfigurasi jam kerja yang digunakan karyawan.</p>
          </div>
        </div>
      </Card>

      <Card className="table-card work-table-card">
        <div className="table-header-bar">
          <h3>Data Jadwal Kerja</h3>
          <span className="table-count">{schedules.length} jadwal</span>
        </div>

        {loading && schedules.length === 0 ? (
          <div className="empty-state work-empty-state">
            <Clock size={48} />
            <p>Memuat jadwal kerja...</p>
          </div>
        ) : schedules.length > 0 ? (
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
                      <div className="grace-period-cell">
                        <Timer size={14} />
                        <span>
                          {schedule.grace_period} menit
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="action-btn-group">
                        <button
                          className="action-btn action-btn-edit"
                          onClick={() => navigate(`/work-schedules/edit/${schedule.id}`)}
                          disabled={loading}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => {
                            if (deleteConfirmId === schedule.id) {
                              void handleDelete(schedule.id);
                            } else {
                              setDeleteConfirmId(schedule.id);
                            }
                          }}
                          disabled={loading}
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                        {deleteConfirmId === schedule.id && (
                          <span className="delete-confirm">
                            Yakin?
                            <button
                              className="delete-confirm__cancel"
                              onClick={() => setDeleteConfirmId(null)}
                              disabled={loading}
                            >
                              Batal
                            </button>
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
          <div className="empty-state work-empty-state">
            <Clock size={48} />
            <p>Belum ada jadwal kerja yang terdaftar.</p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/work-schedules/add")}
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
