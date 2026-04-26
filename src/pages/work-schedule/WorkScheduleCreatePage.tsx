import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "@/shared/ui/Alert";
import { ChevronLeft, Tag } from "lucide-react";
import { createWorkSchedule } from "@/features/work-schedule/api/work-schedule.service";
import WorkScheduleForm, { type WorkScheduleFormState } from "./components/WorkScheduleForm";
import "./WorkScheduleFormContainer.css";
import "../dashboard/overview/OverviewPage.css";
import { Card } from "@/shared/ui/Card";

const WorkScheduleCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("error");

  const [formData, setFormData] = useState<WorkScheduleFormState>({
    name: "",
    check_in_time: "08:00",
    check_out_time: "17:00",
    grace_period: "10",
  });

  const handleCreate = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      await createWorkSchedule({
        ...formData,
        grace_period: Number(formData.grace_period),
      });
      setStatusMessage("Jadwal kerja berhasil dibuat");
      setStatusType("success");
      setTimeout(() => navigate("/work-schedules"), 1500);
    } catch (err: any) {
      setStatusMessage(err.message || "Gagal membuat jadwal kerja");
      setStatusType("error");
      setLoading(false);
    }
  };

  return (
    <div className="crud-page">
      <Card className="hero-card" style={{ marginBottom: '2rem' }}>
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Tag size={16} />
              <span>Workforce Center</span>
            </div>
            <h1 className="hero-title">Buat Jadwal Baru</h1>
            <p className="hero-subtitle">
              Tambahkan shift kerja baru ke dalam sistem.
            </p>
          </div>
          <div className="hero-actions">
            <button type="button" className="btn-outline" onClick={() => navigate("/work-schedules")} disabled={loading}>
              <ChevronLeft size={16} style={{ marginRight: '8px' }} />
              Kembali
            </button>
          </div>
        </div>
      </Card>

      {statusMessage && (
        <Alert
          type={statusType}
          message={statusMessage}
          onClose={() => setStatusMessage("")}
          dismissible
        />
      )}

      <WorkScheduleForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreate}
        onCancel={() => navigate("/work-schedules")}
        loading={loading}
        isUpdate={false}
      />
    </div>
  );
};

export default WorkScheduleCreatePage;
