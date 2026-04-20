import React from "react";
import { Button } from "@/shared/ui/Button";

export type EmployeeFormState = {
  id: string;
  name: string;
  user_id: string;
  employee_code: string;
  position: string;
  department: string;
  hire_date: string;
  salary: string;
  location_id: string;
  manager_id: string;
  work_schedule_id: string;
};

export const DEFAULT_FORM: EmployeeFormState = {
  id: "",
  name: "",
  user_id: "",
  employee_code: "",
  position: "",
  department: "",
  hire_date: "",
  salary: "",
  location_id: "",
  manager_id: "",
  work_schedule_id: "",
};

export interface EmployeeFormProps {
  formData: EmployeeFormState;
  setFormData: React.Dispatch<React.SetStateAction<EmployeeFormState>>;
  allUsers: Record<string, any>[];
  allDepartments: string[];
  allLocations: Record<string, any>[];
  allSchedules: Record<string, any>[];
  onSubmit: () => void;
  loading: boolean;
  isUpdate?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  formData,
  setFormData,
  allUsers,
  allDepartments,
  allLocations,
  allSchedules,
  onSubmit,
  loading,
  isUpdate,
}) => {
  return (
    <>
      <div className="form-grid">
        <div className="form-group">
          <span>NAMA LENGKAP</span>
          <input
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Nama lengkap karyawan"
          />
        </div>

        {!isUpdate && (
          <div className="form-group">
            <span>USER</span>
            <select
              className="form-input"
              value={formData.user_id}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedUser = allUsers.find(u => String(u.id) === String(selectedId));
                setFormData((prev) => ({ 
                  ...prev, 
                  user_id: selectedId,
                  name: selectedUser ? selectedUser.name : prev.name 
                }));
              }}
            >
              <option value="">Pilih User</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>

          </div>
        )}

        <div className="form-group">
          <span>KODE KARYAWAN</span>
          <input
            className="form-input"
            value={formData.employee_code}
            onChange={(e) => setFormData((prev) => ({ ...prev, employee_code: e.target.value }))}
            placeholder="Contoh: EMP-001"
            disabled={isUpdate}
          />
        </div>

        <div className="form-group">
          <span>JABATAN</span>
          <input
            className="form-input"
            value={formData.position}
            onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
            placeholder="Contoh: Manager"
          />
        </div>

        <div className="form-group">
          <span>DEPARTEMEN</span>
          <select
            className="form-input"
            value={formData.department}
            onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
          >
            <option value="">Pilih Departemen</option>
            {allDepartments.map((dept, index) => (
              <option key={index} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <span>TANGGAL BERGABUNG</span>
          <input
            type="date"
            className="form-input"
            value={formData.hire_date}
            onChange={(e) => setFormData((prev) => ({ ...prev, hire_date: e.target.value }))}
            disabled={isUpdate}
          />
        </div>

        <div className="form-group">
          <span>GAJI POKOK (Rp)</span>
          <input
            type="number"
            className="form-input"
            value={formData.salary}
            onChange={(e) => setFormData((prev) => ({ ...prev, salary: e.target.value }))}
            placeholder="Contoh: 8500000"
            min="0"
          />
        </div>

        <div className="form-group">
          <span>LOKASI KERJA</span>
          <select
            className="form-input"
            value={formData.location_id}
            onChange={(e) => setFormData((prev) => ({ ...prev, location_id: e.target.value }))}
          >
            <option value="">Pilih Lokasi</option>
            {allLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <span>MANAGER (Opsional)</span>
          <select
            className="form-input"
            value={formData.manager_id}
            onChange={(e) => setFormData((prev) => ({ ...prev, manager_id: e.target.value }))}
          >
            <option value="">Tanpa Manager</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <span>JADWAL KERJA (Opsional)</span>
          <select
            className="form-input"
            value={formData.work_schedule_id}
            onChange={(e) => setFormData((prev) => ({ ...prev, work_schedule_id: e.target.value }))}
          >
            <option value="">Pilih Jadwal</option>
            {allSchedules.map((sched) => (
              <option key={sched.id} value={sched.id}>
                {sched.name} ({sched.start_time} - {sched.end_time})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-actions" style={{ justifyContent: "flex-end", marginTop: "24px" }}>
        <Button variant="primary" size="md" onClick={onSubmit} disabled={loading}>
          {loading ? "Menyimpan..." : isUpdate ? "Update Data" : "Simpan Karyawan Baru"}
        </Button>
      </div>
    </>
  );
};

export default EmployeeForm;
