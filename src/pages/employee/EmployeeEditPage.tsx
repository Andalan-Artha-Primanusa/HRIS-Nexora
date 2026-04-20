import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { Briefcase } from "lucide-react";
import { api } from "@/shared/api/httpClient";
import { getEmployeeDetail, updateEmployee } from "@/features/employee/api/employee.service";
import { getAllLocations } from "@/features/location/api/location.service";
import type { EmployeeUpdatePayload } from "@/features/employee/types/employee.types";
import EmployeeForm, { DEFAULT_FORM } from "./components/EmployeeForm";
import type { EmployeeFormState } from "./components/EmployeeForm";
import "@/shared/styles/CrudPage.css";

const EmployeeEditPage = () => {
  const navigate = useNavigate();
  const { id: routeEmployeeId } = useParams<{ id: string }>();

  const [updateForm, setUpdateForm] = useState<EmployeeFormState>(DEFAULT_FORM);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Metadata State
  const [allLocations, setAllLocations] = useState<Record<string, any>[]>([]);
  const [allUsers, setAllUsers] = useState<Record<string, any>[]>([]);
  const [allSchedules, setAllSchedules] = useState<Record<string, any>[]>([]);
  const [allDepartments, setAllDepartments] = useState<string[]>([]);

  const loadMetadata = async () => {
    try {
      const locs = await getAllLocations();
      setAllLocations(Array.isArray(locs.items) ? locs.items : []);

      const usersRes = await api.get('/admin/users');
      setAllUsers(Array.isArray(usersRes.data?.data?.items) ? usersRes.data.data.items : Array.isArray(usersRes.data?.data) ? usersRes.data.data : []);

      const schedRes = await api.get('/work-schedules');
      setAllSchedules(Array.isArray(schedRes.data?.data) ? schedRes.data.data : Array.isArray(schedRes.data) ? schedRes.data : []);

      const deptRes = await api.get('/organization/master-data');
      setAllDepartments(Array.isArray(deptRes.data?.data?.departments) ? deptRes.data.data.departments : []);
    } catch (err) {
      console.error("Failed to load metadata:", err);
    }
  };

  useEffect(() => {
    void loadMetadata();
  }, []);

  useEffect(() => {
    if (!routeEmployeeId) return;

    const loadUpdateDetail = async () => {
      setLoading(true);
      setStatusMessage("Memuat detail employee untuk update...");

      try {
        const result = await getEmployeeDetail(routeEmployeeId);

        const hireDate = result?.hire_date ? result.hire_date.split("T")[0] : "";
        const salary = result?.salary ? String(Math.floor(Number(result.salary))) : "";
        
        const formatId = (val: any) => (val === null || val === undefined) ? "" : String(val);

        setUpdateForm({
          id: String(result?.id ?? routeEmployeeId),
          name: String(result?.user?.name ?? ""),
          user_id: formatId(result?.user_id),
          employee_code: String(result?.employee_code ?? ""),
          position: String(result?.position ?? ""),
          department: String(result?.department ?? ""),
          hire_date: hireDate,
          salary: salary,
          location_id: formatId(result?.location_id),
          manager_id: formatId(result?.manager_id),
          work_schedule_id: formatId(result?.work_schedule_id),
        });

        setStatusMessage("Detail employee berhasil dimuat.");
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Gagal memuat detail employee.";
        setStatusMessage(message);
      } finally {
        setLoading(false);
      }
    };

    void loadUpdateDetail();
  }, [routeEmployeeId]);

  const handleUpdate = async () => {
    const targetId = updateForm.id;
    if (!targetId) {
      setStatusMessage("ID tidak ditemukan untuk update.");
      return;
    }

    setLoading(true);
    setStatusMessage("Mengupdate employee...");

    try {
      const payload: EmployeeUpdatePayload = {
        name: updateForm.name,
        user_id: updateForm.user_id ? Number(updateForm.user_id) : undefined,
        employee_code: updateForm.employee_code,
        hire_date: updateForm.hire_date,
        position: updateForm.position,
        department: updateForm.department,
        salary: Number(updateForm.salary),
        location_id: updateForm.location_id ? Number(updateForm.location_id) : undefined,
        manager_id: updateForm.manager_id ? Number(updateForm.manager_id) : undefined,
        work_schedule_id: updateForm.work_schedule_id ? Number(updateForm.work_schedule_id) : undefined,
      };

      await updateEmployee(targetId, payload);
      navigate("/employees");
    } catch (error: any) {
      setStatusMessage(error.message || "Gagal mengupdate employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">People Center</span>
          <h1>Update Data Karyawan</h1>
          <p>Perbarui informasi karyawan: ID {updateForm.id || routeEmployeeId}</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => navigate("/employees")} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            Kembali ke Daftar
          </Button>
        </div>
      </div>

      {statusMessage && (
        <Alert
          type={statusMessage.startsWith("Gagal") ? "error" : "info"}
          message={statusMessage}
          onClose={() => setStatusMessage('')}
          dismissible
        />
      )}

      <Card className="control-card" glass>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#1e3a8a', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={18} style={{ color: '#2563eb' }} />
            Form Data Karyawan
          </h3>
        </div>

        <EmployeeForm
          formData={updateForm}
          setFormData={setUpdateForm}
          allUsers={allUsers}
          allDepartments={allDepartments}
          allLocations={allLocations}
          allSchedules={allSchedules}
          onSubmit={handleUpdate}
          loading={loading}
          isUpdate={true}
        />
      </Card>
    </div>
  );
};

export default EmployeeEditPage;
