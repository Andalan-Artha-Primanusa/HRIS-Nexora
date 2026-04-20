import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { Briefcase } from "lucide-react";
import { api } from "@/shared/api/httpClient";
import { createEmployee } from "@/features/employee/api/employee.service";
import { getAllLocations } from "@/features/location/api/location.service";
import type { EmployeeCreatePayload } from "@/features/employee/types/employee.types";
import EmployeeForm, { DEFAULT_FORM } from "./components/EmployeeForm";
import type { EmployeeFormState } from "./components/EmployeeForm";
import "@/shared/styles/CrudPage.css";

const EmployeeCreatePage = () => {
  const navigate = useNavigate();

  const [createForm, setCreateForm] = useState<EmployeeFormState>(DEFAULT_FORM);
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

  const handleCreate = async () => {
    setLoading(true);
    setStatusMessage("Menyimpan employee...");

    try {
      const payload: EmployeeCreatePayload = {
        user_id: Number(createForm.user_id),
        employee_code: createForm.employee_code,
        position: createForm.position,
        department: createForm.department,
        hire_date: createForm.hire_date,
        salary: Number(createForm.salary),
        location_id: createForm.location_id ? Number(createForm.location_id) : undefined,
        manager_id: createForm.manager_id ? Number(createForm.manager_id) : undefined,
        work_schedule_id: createForm.work_schedule_id ? Number(createForm.work_schedule_id) : undefined,
      };

      await createEmployee(payload);
      setCreateForm(DEFAULT_FORM);
      navigate("/employees");
    } catch (error: any) {
      setStatusMessage(error.message || "Gagal membuat employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">People Center</span>
          <h1>Tambah Karyawan</h1>
          <p>Input data jabatan dan penempatan karyawan baru</p>
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
          formData={createForm}
          setFormData={setCreateForm}
          allUsers={allUsers}
          allDepartments={allDepartments}
          allLocations={allLocations}
          allSchedules={allSchedules}
          onSubmit={handleCreate}
          loading={loading}
          isUpdate={false}
        />
      </Card>
    </div>
  );
};

export default EmployeeCreatePage;
