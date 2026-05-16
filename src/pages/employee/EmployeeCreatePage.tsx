import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { showToast } from '@/shared/ui/toast';
import { Briefcase, Users, ChevronLeft } from "lucide-react";
import { api } from "@/shared/api/httpClient";
import { createEmployee } from "@/features/employee/api/employee.service";
import { getAllLocations } from "@/features/location/api/location.service";
import { getAllUsers } from "@/features/admin/api/admin.service";
import { getAllWorkSchedules } from "@/features/work-schedule/api/work-schedule.service";
import type { EmployeeCreatePayload } from "@/features/employee/types/employee.types";
import EmployeeForm, { DEFAULT_FORM } from "./components/EmployeeForm";
import type { EmployeeFormState } from "./components/EmployeeForm";
import "@/shared/styles/CrudPage.css";
import "../dashboard/overview/OverviewPage.css";

const EmployeeCreatePage = () => {
  const navigate = useNavigate();

  const [createForm, setCreateForm] = useState<EmployeeFormState>(DEFAULT_FORM);
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

      const usersResult = await getAllUsers(1, 100);
      setAllUsers(usersResult.items);

      const schedResult = await getAllWorkSchedules();
      setAllSchedules(schedResult.items);

      const deptRes = await api.get('/organization/master-data');
      // Deeply check for departments array
      const rawDepts = deptRes.data?.data?.departments || deptRes.data?.departments || [];
      setAllDepartments(Array.isArray(rawDepts) ? rawDepts : []);
    } catch (err) {
      console.error("Failed to load metadata:", err);
    }
  };

  useEffect(() => {
    void loadMetadata();
  }, []);

  const handleCreate = async () => {
    // Client-side validation
    if (!createForm.user_id) {
      showToast("Gagal: Silakan pilih pengguna terlebih dahulu.", 'error');
      return;
    }

    setLoading(true);
    showToast("Menyimpan data karyawan...", 'info');

    try {
      const payload: EmployeeCreatePayload = {
        user_id: createForm.user_id ? Number(createForm.user_id) : null, 
        manager_id: createForm.manager_id ? Number(createForm.manager_id) : null,
        employee_code: createForm.employee_code || "",
        position: createForm.position || "",
        department: createForm.department || "",
        status: createForm.status || "pending",
        hire_date: createForm.hire_date || "",
        probation_end_date: createForm.probation_end_date || null,
        salary: createForm.salary ? Number(createForm.salary) : 0,
        location_id: createForm.location_id ? Number(createForm.location_id) : null,
        work_schedule_id: createForm.work_schedule_id ? Number(createForm.work_schedule_id) : null,
      };

      await createEmployee(payload);
      setCreateForm(DEFAULT_FORM);
      navigate("/employees");
    } catch (error: any) {
      if (error.type === "validation" && error.errors) {
        const validationErrors = error.errors;
        const messages = Object.values(validationErrors).flat().join(", ");
        showToast(`Gagal: ${messages}`, 'error');
      } else {
        showToast(error.message || "Gagal membuat data karyawan", 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crud-page">
      <Card className="hero-card" style={{ marginBottom: '2rem' }}>
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Users size={16} />
              <span>People Center</span>
            </div>
            <h1 className="hero-title">Tambah Karyawan</h1>
            <p className="hero-subtitle">Input data jabatan dan penempatan karyawan baru</p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => navigate("/employees")} disabled={loading}>
              <ChevronLeft size={18} />
              Kembali ke Daftar
            </button>
          </div>
        </div>
      </Card>

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
