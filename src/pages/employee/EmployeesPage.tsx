import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployeeDetail,
  updateEmployee,
} from "@/features/employee/api/employee.service";
import type { EmployeeCreatePayload, EmployeeItem, EmployeeUpdatePayload } from "@/features/employee/types/employee.types";
import "../admin/AdminCrudPages.css";

type EmployeeFormState = {
  id: string;
  user_id: string;
  employee_code: string;
  position: string;
  department: string;
  hire_date: string;
  salary: string;
};

const DEFAULT_FORM: EmployeeFormState = {
  id: "",
  user_id: "2",
  employee_code: "EMP-0002",
  position: "Manager",
  department: "IT",
  hire_date: "2025-01-15",
  salary: "50000000",
};

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: EmployeeItem[]) => {
  if (items.length === 0) {
    return ["id", "user_id", "employee_code", "position", "department", "hire_date", "salary"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "user_id", "employee_code", "position", "department", "hire_date", "salary"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const EmployeesPage = () => {
  const location = useLocation();
  const isAddPage = location.pathname === "/employees/add";

  const [items, setItems] = useState<EmployeeItem[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<EmployeeFormState>(DEFAULT_FORM);
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call employee API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const requireId = () => {
    const id = form.id.trim();
    if (!id) {
      setStatusMessage("Employee ID wajib diisi untuk detail/update/delete.");
      return null;
    }
    return id;
  };

  const loadEmployees = async () => {
    setLoading(true);
    setStatusMessage("Memuat semua employees...");
    setResponseText("");

    try {
      const result = await getAllEmployees();
      setItems(result.items);
      formatResponse(result.raw);
      setStatusMessage("Semua employee berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat employee.";
      formatResponse(message);
      setStatusMessage("Gagal memuat employee.");
    } finally {
      setLoading(false);
    }
  };

  const createNewEmployee = async () => {
    setLoading(true);
    setStatusMessage("Membuat employee...");
    setResponseText("");

    try {
      const payload: EmployeeCreatePayload = {
        user_id: Number(form.user_id) || 0,
        employee_code: form.employee_code,
        position: form.position,
        department: form.department,
        hire_date: form.hire_date,
        salary: Number(form.salary) || 0,
      };

      const result = await createEmployee(payload);
      formatResponse(result.raw);
      setStatusMessage("Employee berhasil dibuat.");
      await loadEmployees();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal membuat employee.";
      formatResponse(message);
      setStatusMessage("Gagal membuat employee.");
    } finally {
      setLoading(false);
    }
  };

  const getDetail = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Memuat detail employee...");
    setResponseText("");

    try {
      const result = await getEmployeeDetail(id);
      const payload =
        result.payload && typeof result.payload === "object"
          ? (result.payload as Record<string, unknown>)
          : null;
      setSelectedDetail(payload);
      formatResponse(result.raw);
      setStatusMessage("Detail employee berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat detail employee.";
      formatResponse(message);
      setStatusMessage("Gagal memuat detail employee.");
    } finally {
      setLoading(false);
    }
  };

  const updateExistingEmployee = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Mengupdate employee...");
    setResponseText("");

    try {
      const payload: EmployeeUpdatePayload = {
        position: form.position,
        department: form.department,
        salary: Number(form.salary) || 0,
      };

      const result = await updateEmployee(id, payload);
      formatResponse(result.raw);
      setStatusMessage("Employee berhasil diupdate.");
      await loadEmployees();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal update employee.";
      formatResponse(message);
      setStatusMessage("Gagal update employee.");
    } finally {
      setLoading(false);
    }
  };

  const deleteExistingEmployee = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Menghapus employee...");
    setResponseText("");

    try {
      const result = await deleteEmployee(id);
      formatResponse(result.raw);
      setStatusMessage("Employee berhasil dihapus.");
      await loadEmployees();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menghapus employee.";
      formatResponse(message);
      setStatusMessage("Gagal menghapus employee.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <h1>{isAddPage ? "Add Employee" : "Employees"}</h1>
          <p>Endpoint: GET/POST /employees, GET/PUT/DELETE /employees/{"{id}"}</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadEmployees()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="crud-card" glass>
        <h2>Employee Form</h2>
        <div className="crud-form-grid">
          <label>
            Employee ID
            <input
              className="crud-input"
              value={form.id}
              onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
              placeholder="employee id"
            />
          </label>
          <label>
            User ID
            <input
              className="crud-input"
              value={form.user_id}
              onChange={(event) => setForm((prev) => ({ ...prev, user_id: event.target.value }))}
              placeholder="2"
            />
          </label>
          <label>
            Employee Code
            <input
              className="crud-input"
              value={form.employee_code}
              onChange={(event) => setForm((prev) => ({ ...prev, employee_code: event.target.value }))}
              placeholder="EMP-0002"
            />
          </label>
          <label>
            Position
            <input
              className="crud-input"
              value={form.position}
              onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))}
            />
          </label>
          <label>
            Department
            <input
              className="crud-input"
              value={form.department}
              onChange={(event) => setForm((prev) => ({ ...prev, department: event.target.value }))}
            />
          </label>
          <label>
            Hire Date
            <input
              className="crud-input"
              type="date"
              value={form.hire_date}
              onChange={(event) => setForm((prev) => ({ ...prev, hire_date: event.target.value }))}
            />
          </label>
          <label>
            Salary
            <input
              className="crud-input"
              value={form.salary}
              onChange={(event) => setForm((prev) => ({ ...prev, salary: event.target.value }))}
            />
          </label>
        </div>

        <div className="crud-actions">
          <Button variant="primary" size="md" onClick={() => void createNewEmployee()} disabled={loading}>
            Create Employee
          </Button>
          <Button variant="outline" size="md" onClick={() => void getDetail()} disabled={loading}>
            Get Detail
          </Button>
          <Button variant="secondary" size="md" onClick={() => void updateExistingEmployee()} disabled={loading}>
            Update Employee
          </Button>
          <Button variant="ghost" size="md" onClick={() => void deleteExistingEmployee()} disabled={loading}>
            Delete Employee
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Employee Detail</h2>
        <pre className="crud-response">
          {selectedDetail ? JSON.stringify(selectedDetail, null, 2) : "Belum ada detail employee dipilih."}
        </pre>
      </Card>

      <Card className="crud-card" glass>
        <h2>Employees Table</h2>
        <div className="crud-table-wrap">
          <table className="crud-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={String(item.id ?? index)}>
                    {columns.map((column) => (
                      <td key={`${String(item.id ?? index)}-${column}`}>{asDisplay(item[column])}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>No employee data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Raw Response</h2>
        <pre className="crud-response">{responseText || "Response API akan tampil di sini."}</pre>
        <p className="crud-status">{statusMessage}</p>
      </Card>
    </div>
  );
};

export default EmployeesPage;
