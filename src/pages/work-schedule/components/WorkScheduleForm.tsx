import React from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Clock, Tag, Timer } from "lucide-react";
import "./WorkScheduleForm.css";

export interface WorkScheduleFormState {
  name: string;
  check_in_time: string;
  check_out_time: string;
  grace_period: string | number;
}

interface WorkScheduleFormProps {
  formData: WorkScheduleFormState;
  setFormData: React.Dispatch<React.SetStateAction<WorkScheduleFormState>>;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  isUpdate?: boolean;
}

const WorkScheduleForm: React.FC<WorkScheduleFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  loading,
  isUpdate,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="work-schedule-form-card" glass>
      <form
        className="work-schedule-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="work-schedule-form-group">
          <label className="work-schedule-label">
            <Tag size={16} />
            Nama Jadwal <span className="work-schedule-required">*</span>
          </label>
          <input
            type="text"
            name="name"
            className="work-schedule-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="Contoh: Shift Pagi"
            required
          />
          <p className="work-schedule-hint">Gunakan nama yang mudah dikenali</p>
        </div>

        <div className="work-schedule-form-row">
          <div className="work-schedule-form-group">
            <label className="work-schedule-label">
              <Clock size={16} />
              Jam Masuk <span className="work-schedule-required">*</span>
            </label>
            <input
              type="time"
              name="check_in_time"
              className="work-schedule-input"
              value={formData.check_in_time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="work-schedule-form-group">
            <label className="work-schedule-label">
              <Clock size={16} />
              Jam Pulang <span className="work-schedule-required">*</span>
            </label>
            <input
              type="time"
              name="check_out_time"
              className="work-schedule-input"
              value={formData.check_out_time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="work-schedule-form-group">
          <label className="work-schedule-label">
            <Timer size={16} />
            Grace Period (Menit) <span className="work-schedule-required">*</span>
          </label>
          <div className="work-schedule-input-wrapper">
            <input
              type="number"
              name="grace_period"
              className="work-schedule-input"
              value={formData.grace_period}
              onChange={handleChange}
              placeholder="Contoh: 10"
              min="0"
              required
            />
            <span className="work-schedule-unit">Menit</span>
          </div>
          <p className="work-schedule-hint">Toleransi keterlambatan dalam hitungan menit</p>
        </div>

        <div className="work-schedule-form-actions">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : isUpdate ? "Simpan Perubahan" : "Buat Jadwal"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default WorkScheduleForm;
