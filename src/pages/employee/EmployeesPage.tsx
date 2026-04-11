import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  user_id: "",
  employee_code: "",
  position: "",
  department: "",
  hire_date: "",
  salary: "",
};

const DATE_TIME_COLUMNS = ["time", "date", "_at", "time_series"];

const shouldFormatAsTime = (column: string) => {
  const normalized = column.toLowerCase();
  return DATE_TIME_COLUMNS.some((token) => normalized.includes(token));
};

const formatDateTime = (input: string) => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  const hasTime = /t|\d{2}:\d{2}/i.test(input);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    ...(hasTime ? { timeStyle: "short" } : {}),
  }).format(date);
};

const asDisplay = (column: string, value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (Array.isArray(value)) return value.length > 0 ? `${value.length} items` : "-";
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const candidates = [record.name, record.title, record.employee_code, record.status, record.email, record.id];
    const firstPrimitive = candidates.find(
      (candidate) => candidate !== null && candidate !== undefined && typeof candidate !== "object"
    );
    return firstPrimitive ? String(firstPrimitive) : "-";
  }

  if (typeof value === "string" && shouldFormatAsTime(column)) {
    return formatDateTime(value);
  }

  return String(value);
};

const getColumns = (items: EmployeeItem[]) => {
  if (items.length === 0) {
    return ["user_id", "user", "employee_code", "position", "department", "hire_date", "salary"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "user_id", "user", "employee_code", "position", "department", "hire_date", "salary"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index && key !== "id");
};

const EmployeesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeEmployeeId } = useParams<{ id: string }>();
  const isAddPage = location.pathname === "/employees/add";
  const isUpdatePage = location.pathname.startsWith("/employees/update/");

  const [items, setItems] = useState<EmployeeItem[]>([]);
  const [createForm, setCreateForm] = useState<EmployeeFormState>(DEFAULT_FORM);
  const [updateForm, setUpdateForm] = useState<EmployeeFormState>(DEFAULT_FORM);
  const [statusMessage, setStatusMessage] = useState("Ready to call employee API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);

  const requireId = (idValue: string) => {
    const id = idValue.trim();
    if (!id) {
      setStatusMessage("Employee ID wajib diisi.");
      return null;
    }
    return id;
  };

  const loadEmployees = async () => {
    setLoading(true);
    setStatusMessage("Memuat semua employees...");

    try {
      const result = await getAllEmployees();
      setItems(result);
      setStatusMessage("Semua employee berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat employee.";
      setStatusMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const createNewEmployee = async () => {
    setLoading(true);
    setStatusMessage("Membuat employee...");

    try {
      const payload: EmployeeCreatePayload = {
        user_id: Number(createForm.user_id) || 0,
        employee_code: createForm.employee_code,
        position: createForm.position,
        department: createForm.department,
        hire_date: createForm.hire_date,
        salary: Number(createForm.salary) || 0,
      };

      await createEmployee(payload);
      setStatusMessage("Employee berhasil dibuat.");
      setCreateForm(DEFAULT_FORM);
      navigate("/employees");
      await loadEmployees();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal membuat employee.";
      setStatusMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const updateExistingEmployee = async () => {
    const id = requireId(updateForm.id);
    if (!id) return;

    setLoading(true);
    setStatusMessage("Mengupdate employee...");

    try {
      const payload: EmployeeUpdatePayload = {
        position: updateForm.position,
        department: updateForm.department,
        salary: Number(updateForm.salary) || 0,
      };

      await updateEmployee(id, payload);
      setStatusMessage("Employee berhasil diupdate.");
      setUpdateForm(DEFAULT_FORM);
      navigate("/employees");
      await loadEmployees();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal update employee.";
      setStatusMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteExistingEmployee = async (idValue: string) => {
    const id = requireId(idValue);
    if (!id) return;

    setLoading(true);
    setStatusMessage("Menghapus employee...");

    try {
      await deleteEmployee(id);
      setStatusMessage("Employee berhasil dihapus.");
      await loadEmployees();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menghapus employee.";
      setStatusMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAddPage || isUpdatePage) {
      return;
    }

    void loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddPage, isUpdatePage]);

  useEffect(() => {
    if (!isUpdatePage || !routeEmployeeId) {
      return;
    }

    const loadUpdateDetail = async () => {
      setLoading(true);
      setStatusMessage("Memuat detail employee untuk update...");

      try {
        const result = await getEmployeeDetail(routeEmployeeId);

        setUpdateForm({
          id: String(result?.id ?? routeEmployeeId),
          user_id: String(result?.user_id ?? ""),
          employee_code: String(result?.employee_code ?? ""),
          position: String(result?.position ?? ""),
          department: String(result?.department ?? ""),
          hire_date: String(result?.hire_date ?? ""),
          salary: String(result?.salary ?? ""),
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
  }, [isUpdatePage, routeEmployeeId]);

  if (isAddPage) {
    return (
      <div className="crud-page">
        <div className="crud-header">
          <div>
            <h1>Add Employee</h1>
            <p>Halaman khusus create employee agar alur lebih rapi.</p>
          </div>
          <Button variant="outline" size="md" onClick={() => navigate("/employees")} disabled={loading}>
            Back to Employees
          </Button>
        </div>

        <Card className="crud-card" glass>
          <h2>Create Employee</h2>
          <div className="crud-form-grid">
            <label>
              User ID
              <input
                className="crud-input"
                value={createForm.user_id}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, user_id: event.target.value }))}
                placeholder="user id"
              />
            </label>
            <label>
              Employee Code
              <input
                className="crud-input"
                value={createForm.employee_code}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, employee_code: event.target.value }))}
                placeholder="employee code"
              />
            </label>
            <label>
              Position
              <input
                className="crud-input"
                value={createForm.position}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, position: event.target.value }))}
                placeholder="position"
              />
            </label>
            <label>
              Department
              <input
                className="crud-input"
                value={createForm.department}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, department: event.target.value }))}
                placeholder="department"
              />
            </label>
            <label>
              Hire Date
              <input
                className="crud-input"
                type="date"
                value={createForm.hire_date}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, hire_date: event.target.value }))}
              />
            </label>
            <label>
              Salary
              <input
                className="crud-input"
                value={createForm.salary}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, salary: event.target.value }))}
                placeholder="salary"
              />
            </label>
          </div>

          <div className="crud-actions">
            <Button variant="primary" size="md" onClick={() => void createNewEmployee()} disabled={loading}>
              Create Employee
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate("/employees")} disabled={loading}>
              Cancel
            </Button>
          </div>
        </Card>

        <p className="crud-status">{statusMessage}</p>
      </div>
    );
  }

  if (isUpdatePage) {
    return (
      <div className="crud-page">
        <div className="crud-header">
          <div>
            <h1>Update Employee</h1>
            <p>Halaman khusus update employee agar flow lebih rapi.</p>
          </div>
          <Button variant="outline" size="md" onClick={() => navigate("/employees")} disabled={loading}>
            Back to Employees
          </Button>
        </div>

        <Card className="crud-card" glass>
          <h2>Update Employee</h2>
          <div className="crud-form-grid">
            <label>
              Employee ID
              <input className="crud-input" value={updateForm.id} readOnly />
            </label>
            <label>
              Position
              <input
                className="crud-input"
                value={updateForm.position}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, position: event.target.value }))}
                placeholder="position"
              />
            </label>
            <label>
              Department
              <input
                className="crud-input"
                value={updateForm.department}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, department: event.target.value }))}
                placeholder="department"
              />
            </label>
            <label>
              Salary
              <input
                className="crud-input"
                value={updateForm.salary}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, salary: event.target.value }))}
                placeholder="salary"
              />
            </label>
          </div>

          <div className="crud-actions">
            <Button variant="secondary" size="md" onClick={() => void updateExistingEmployee()} disabled={loading}>
              Update Employee
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate("/employees")} disabled={loading}>
              Cancel
            </Button>
          </div>
        </Card>

        <p className="crud-status">{statusMessage}</p>
      </div>
    );
  }

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <h1>Employees</h1>
          <p>Employee list khusus table dengan create dan action update/delete per baris.</p>
        </div>
        <div className="crud-actions">
          <Button variant="primary" size="md" onClick={() => navigate("/employees/add")} disabled={loading}>
            Create Employee
          </Button>
          <Button variant="outline" size="md" onClick={() => void loadEmployees()} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <Card className="crud-card" glass>
        <h2>Employees Table</h2>
        <div className="crud-table-wrap">
          <table className="crud-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={String(item.id ?? index)}>
                    {columns.map((column) => (
                      <td key={`${String(item.id ?? index)}-${column}`} title={asDisplay(column, (item as unknown as Record<string, unknown>)[column])}>
                        {asDisplay(column, (item as unknown as Record<string, unknown>)[column])}
                      </td>
                    ))}
                    <td>
                      <div className="crud-actions" style={{ marginTop: 0 }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/employees/update/${String(item.id ?? "")}`)}
                          disabled={loading || !item.id}
                        >
                          Update
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void deleteExistingEmployee(String(item.id ?? ""))}
                          disabled={loading || !item.id}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1}>No employee data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="crud-status">{statusMessage}</p>
    </div>
  );
};

export default EmployeesPage;
