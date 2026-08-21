import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showToast } from '@/shared/ui/toast';
import { ChevronLeft, Loader2, Tag } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import "../dashboard/overview/OverviewPage.css";
import { getWorkScheduleDetail, updateWorkSchedule } from "@/features/work-schedule/api/work-schedule.service";
import WorkScheduleForm, { type WorkScheduleFormState } from "./components/WorkScheduleForm";
import "./WorkScheduleFormContainer.css";

const WorkScheduleEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);


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
      showToast(err.message || "Gagal memuat detail jadwal kerja", "error");
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
    try {
      await updateWorkSchedule(id, {
        ...formData,
        grace_period: Number(formData.grace_period),
      });
      showToast("Jadwal kerja berhasil diperbarui", "success");
      setTimeout(() => navigate("/work-schedules"), 1500);
    } catch (err: any) {
      showToast(err.message || "Gagal memperbarui jadwal kerja", "error");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="work-schedule-form-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
      </div>
    );
  }

  return (
    <div className="crud-page">
      <Card className="hero-card" style={{ marginBottom: '2rem' }}>
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Tag size={16} />
              <span>Workforce Center</span>
            </div>
            <h1 className="hero-title">Edit Jadwal Kerja</h1>
            <p className="hero-subtitle">
              Ubah pengaturan shift kerja yang sudah ada.
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
