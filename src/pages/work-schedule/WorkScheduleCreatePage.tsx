import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "@/shared/ui/Alert";
import { ChevronLeft } from "lucide-react";
import { createWorkSchedule } from "@/features/work-schedule/api/work-schedule.service";
import WorkScheduleForm, { type WorkScheduleFormState } from "./components/WorkScheduleForm";
import "./WorkScheduleFormContainer.css";

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
    <div className="work-schedule-form-container">
      <div className="work-schedule-form-header">
        <button className="work-schedule-back-button" onClick={() => navigate("/work-schedules")}>
          <ChevronLeft size={24} />
        </button>
        <div className="work-schedule-header-text">
          <span className="work-schedule-page-badge">Workforce Center</span>
          <h1>Buat Jadwal Baru</h1>
          <p>Tambahkan shift kerja baru ke dalam sistem.</p>
        </div>
      </div>

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
