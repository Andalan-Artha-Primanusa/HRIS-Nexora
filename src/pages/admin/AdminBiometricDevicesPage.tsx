import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { ROLES } from "@/shared/types/rbac.types";
import { MonitorCog, RefreshCw, ShieldAlert, Smartphone, Wifi, WifiOff, Plus, Edit2 } from "lucide-react";
import {
  getBiometricDevices,
  syncBiometricAttendance,
} from "@/features/admin/api/admin-batch1.service";
import type { BiometricDeviceItem } from "@/features/admin/types/admin.types";
import "@/shared/styles/CrudPage.css";
import "./AdminCrudPages.css";

type AlertType = "success" | "error" | "info";

const hasAdminAccess = (user: any) => {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return roles.some((role: any) => {
    const roleName = String(role?.name || role || "").toLowerCase();
    return roleName === ROLES.ADMIN || roleName === ROLES.SUPER_ADMIN;
  });
};

const normalizeBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const lowered = value.toLowerCase();
    return lowered === "true" || lowered === "1" || lowered === "online" || lowered === "active";
  }
  return false;
};

const AdminBiometricDevicesPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const canAccess = hasAdminAccess(user);

  if (!canAccess) {
    return (
      <div className="crud-page">
        <div className="page-header">
          <div className="page-header-title">
            <span className="page-badge">Admin Center</span>
            <h1><ShieldAlert size={22} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />Akses Ditolak</h1>
            <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          </div>
        </div>
        <Card className="table-card" glass>
          <div className="table-card-inner">
            <p>Silakan hubungi Administrator untuk mendapatkan akses.</p>
          </div>
        </Card>
      </div>
    );
  }

  const [devices, setDevices] = useState<BiometricDeviceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingId, setSyncingId] = useState<string | number | null>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("info");

  const summary = useMemo(() => {
    const online = devices.filter((device) => normalizeBoolean((device as any).is_online ?? (device as any).online ?? (device as any).status === "online")).length;
    return {
      total: devices.length,
      online,
      offline: Math.max(devices.length - online, 0),
    };
  }, [devices]);

  const loadDevices = async () => {
    setLoading(true);
    setAlertMessage("");

    try {
      const result = await getBiometricDevices();
      setDevices(Array.isArray(result.items) ? result.items : []);
    } catch (error: unknown) {
      setAlertMessage(getErrorMessage(error as any));
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDevices();
  }, []);

  const handleSync = async (device: BiometricDeviceItem) => {
    const deviceId = (device as any).id;
    setSyncingId(deviceId);
    setAlertMessage("");

    try {
      await syncBiometricAttendance({
        device_id: deviceId,
      });
      setAlertMessage(`Sinkronisasi attendance untuk perangkat ${String((device as any).name || deviceId)} berhasil dijalankan.`);
      setAlertType("success");
    } catch (error: unknown) {
      setAlertMessage(getErrorMessage(error as any));
      setAlertType("error");
    } finally {
      setSyncingId(null);
    }
  };

  const summaryCards = [
    {
      label: "Total Device",
      subtitle: "Seluruh perangkat biometric",
      value: String(summary.total),
      change: "Terhubung dalam daftar admin",
      tone: "blue" as const,
      icon: MonitorCog,
    },
    {
      label: "Online",
      subtitle: "Device aktif dan merespon",
      value: String(summary.online),
      change: "Siap dipakai sinkronisasi",
      tone: "green" as const,
      icon: Wifi,
    },
    {
      label: "Offline",
      subtitle: "Butuh pengecekan jaringan",
      value: String(summary.offline),
      change: "Perlu tindak lanjut admin",
      tone: "orange" as const,
      icon: WifiOff,
    },
  ];

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Admin Center</span>
          <h1>Biometric Devices</h1>
          <p>Kelola perangkat biometric, pantau status koneksi, dan jalankan sinkronisasi attendance dari satu halaman admin.</p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="md"
            onClick={() => void loadDevices()}
            disabled={loading}
            style={{ borderColor: "#2563eb", color: "#2563eb" }}
          >
            <RefreshCw size={16} />
            {loading ? "Memuat..." : "Segarkan"}
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate('/admin/biometric-devices/create')}>
            <Plus size={16} />
            Tambah Device
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

      {alertMessage && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setAlertMessage("")}
          dismissible
        />
      )}

      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Daftar Device</h3>
          <span className="table-count">{devices.length} device</span>
        </div>

        {devices.length > 0 ? (
          <div className="table-card-inner">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Device</th>
                    <th>IP Address</th>
                    <th>Lokasi</th>
                    <th>Status</th>
                    <th>Terakhir Sinkron</th>
                    <th className="th-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device, index) => {
                    const deviceId = (device as any).id ?? index;
                    const name = String((device as any).name || "Unnamed Device");
                    const ipAddress = String((device as any).ip_address || (device as any).ip || "-");
                    const location = String((device as any).location || (device as any).branch || "-");
                    const isOnline = normalizeBoolean((device as any).is_online ?? (device as any).online ?? (device as any).status === "online");
                    const lastSync = (device as any).last_sync_at || (device as any).last_synced_at || (device as any).updated_at || "-";

                    return (
                      <tr key={String(deviceId)}>
                        <td><span className="cell-id">{String(deviceId)}</span></td>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              <MonitorCog size={14} />
                            </div>
                            <span className="cell-name-text">{name}</span>
                          </div>
                        </td>
                        <td>{ipAddress}</td>
                        <td>{location}</td>
                        <td>
                          <span className={`status-badge ${isOnline ? "status-badge--approved" : "status-badge--draft"}`}>
                            {isOnline ? "online" : "offline"}
                          </span>
                        </td>
                        <td className="cell-date">{String(lastSync)}</td>
                        <td className="td-center">
                          <div className="cell-actions">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/biometric-devices/edit/${deviceId}`)}
                            >
                              <Edit2 size={15} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void handleSync(device)}
                              disabled={syncingId === deviceId}
                            >
                              <RefreshCw size={15} />
                              {syncingId === deviceId ? "Sync..." : "Sync"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="table-card-inner">
            <div className="empty-state">
              <MonitorCog size={32} style={{ opacity: 0.4 }} />
              <p>Belum ada perangkat biometric yang terdaftar.</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminBiometricDevicesPage;