import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "@/shared/ui/Alert";
import { ChevronLeft, Loader2 } from "lucide-react";
import { getWorkScheduleDetail, updateWorkSchedule } from "@/features/work-schedule/api/work-schedule.service";
import WorkScheduleForm, { type WorkScheduleFormState } from "./components/WorkScheduleForm";
import "./WorkScheduleFormContainer.css";

const WorkScheduleEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("error");

  const [formData, setFormData] = useState<WorkScheduleFormState>({
    name: "",
    check_in_time: "",
    check_out_time: "",
    grace_period: "",
  });

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setFetching(true);
    try {
      const data = await getWorkScheduleDetail(id);
      setFormData({
        name: data.name,
        check_in_time: data.check_in_time,
        check_out_time: data.check_out_time,
        grace_period: data.grace_period,
      });
    } catch (err: any) {
      setStatusMessage(err.message || "Gagal memuat detail jadwal kerja");
      setStatusType("error");
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const handleUpdate = async () => {
    if (!id) return;
    setLoading(true);
    setStatusMessage("");
    try {
      await updateWorkSchedule(id, {
        ...formData,
        grace_period: Number(formData.grace_period),
      });
      setStatusMessage("Jadwal kerja berhasil diperbarui");
      setStatusType("success");
      setTimeout(() => navigate("/work-schedules"), 1500);
    } catch (err: any) {
      setStatusMessage(err.message || "Gagal memperbarui jadwal kerja");
      setStatusType("error");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="work-schedule-form-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <Loader2 className="animate-spin" size={48} color="#2563eb" />
      </div>
    );
  }

  return (
    <div className="work-schedule-form-container">
      <div className="work-schedule-form-header">
        <button className="work-schedule-back-button" onClick={() => navigate("/work-schedules")}>
          <ChevronLeft size={24} />
        </button>
        <div className="work-schedule-header-text">
          <span className="work-schedule-page-badge">Workforce Center</span>
          <h1>Edit Jadwal Kerja</h1>
          <p>Ubah pengaturan shift kerja yang sudah ada.</p>
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
        onSubmit={handleUpdate}
        onCancel={() => navigate("/work-schedules")}
        loading={loading}
        isUpdate={true}
      />
    </div>
  );
};

export default WorkScheduleEditPage;
