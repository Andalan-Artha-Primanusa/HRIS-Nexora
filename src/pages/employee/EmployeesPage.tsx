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
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  ChevronDown,
  Briefcase,
} from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "./EmployeesPage.css";

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

const EmployeesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeEmployeeId } = useParams<{ id: string }>();
  const isAddPage = location.pathname === "/employees/add";
  const isUpdatePage = location.pathname.startsWith("/employees/update/");

  const [items, setItems] = useState<EmployeeItem[]>([]);
  const [createForm, setCreateForm] = useState<EmployeeFormState>(DEFAULT_FORM);
  const [updateForm, setUpdateForm] = useState<EmployeeFormState>(DEFAULT_FORM);
  const [, setStatusMessage] = useState("Ready to call employee API");
  const [loading, setLoading] = useState(false);

  // Search & Filter State
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<"id" | "name" | "code" | "department" | "position">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Extract unique values for filters
  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.department).filter(Boolean))).sort();
  }, [items]);

  const uniquePositions = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.position).filter(Boolean))).sort();
  }, [items]);

  // Combined Business Logic: Filter -> Sort -> Paginate
  const filteredEmployees = useMemo(() => {
    return items.filter((item) => {
      const searchStr = searchText.toLowerCase();
      const nameMatch = item.user?.name?.toLowerCase().includes(searchStr);
      const codeMatch = item.employee_code?.toLowerCase().includes(searchStr);
      const idMatch = String(item.id).includes(searchStr);
      const deptMatch = !selectedDepartment || item.department === selectedDepartment;
      const posMatch = !selectedPosition || item.position === selectedPosition;

      return (nameMatch || codeMatch || idMatch) && deptMatch && posMatch;
    });
  }, [items, searchText, selectedDepartment, selectedPosition]);

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      switch (sortBy) {
        case "name":
          valA = a.user?.name?.toLowerCase() || "";
          valB = b.user?.name?.toLowerCase() || "";
          break;
        case "id":
          valA = a.id || 0;
          valB = b.id || 0;
          break;
        case "code":
          valA = a.employee_code?.toLowerCase() || "";
          valB = b.employee_code?.toLowerCase() || "";
          break;
        case "department":
          valA = a.department?.toLowerCase() || "";
          valB = b.department?.toLowerCase() || "";
          break;
        case "position":
          valA = a.position?.toLowerCase() || "";
          valB = b.position?.toLowerCase() || "";
          break;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredEmployees, sortBy, sortOrder]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedEmployees.slice(startIndex, startIndex + pageSize);
  }, [sortedEmployees, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedEmployees.length / pageSize);

  const employeeSummaryCards = useMemo(
    () => [
      {
        label: "Total Employees",
        subtitle: "Semua data karyawan",
        value: String(items.length),
        change: "Seluruh data yang tersimpan",
        tone: "blue" as const,
        icon: Briefcase,
      },
      {
        label: "Filtered Results",
        subtitle: "Hasil pencarian saat ini",
        value: String(sortedEmployees.length),
        change: `${paginatedEmployees.length} data di halaman ini`,
        tone: "green" as const,
        icon: Search,
      },
      {
        label: "Departments",
        subtitle: "Departemen unik yang aktif",
        value: String(uniqueDepartments.length),
        change: "Distribusi struktur kerja",
        tone: "orange" as const,
        icon: Briefcase,
      },
      {
        label: "Positions",
        subtitle: "Jabatan unik yang tersedia",
        value: String(uniquePositions.length),
        change: "Lapisan peran organisasi",
        tone: "purple" as const,
        icon: Briefcase,
      },
    ],
    [items.length, paginatedEmployees.length, sortedEmployees.length, uniqueDepartments.length, uniquePositions.length]
  );

  const clearFilters = () => {
    setSearchText("");
    setSelectedDepartment("");
    setSelectedPosition("");
    setCurrentPage(1);
  };

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
      <div className="employees-page crud-page">
        <div className="employees-list-header" style={{ borderBottom: "2px solid #2563eb", paddingBottom: "20px" }}>
          <div className="employees-list-title">
            <h1 style={{ color: "#2563eb", marginBottom: "4px" }}>👤 Tambah Karyawan</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Input data jabatan dan penempatan karyawan baru</p>
          </div>
          <Button variant="outline" size="md" onClick={() => navigate("/employees")} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            Kembali ke Daftar
          </Button>
        </div>

        <Card className="employees-panel" glass style={{ borderTop: "4px solid #2563eb", marginTop: "1rem" }}>
          <div className="profiles-panel-header" style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ color: "#2563eb" }}><Briefcase size={18} /></div>
              <h2 style={{ color: "#2563eb", margin: 0 }}>Form Data Karyawan</h2>
            </div>
          </div>

          <div className="employee-form-grid">
            <label className="profiles-form-group">
              <span style={{ color: "#2563eb", fontWeight: "700", fontSize: "0.75rem" }}>USER ID</span>
              <input
                className="profiles-input"
                value={createForm.user_id}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, user_id: event.target.value }))}
                placeholder="Masukkan User ID"
                style={{ border: "1px solid rgba(37, 99, 235, 0.2)" }}
              />
            </label>
            <label className="profiles-form-group">
              <span style={{ color: "#2563eb", fontWeight: "700", fontSize: "0.75rem" }}>KODE KARYAWAN</span>
              <input
                className="profiles-input"
                value={createForm.employee_code}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, employee_code: event.target.value }))}
                placeholder="Contoh: EMP-001"
                style={{ border: "1px solid rgba(37, 99, 235, 0.2)" }}
              />
            </label>
            <label className="profiles-form-group">
              <span style={{ color: "#2563eb", fontWeight: "700", fontSize: "0.75rem" }}>JABATAN</span>
              <input
                className="profiles-input"
                value={createForm.position}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, position: event.target.value }))}
                placeholder="Contoh: Manager"
                style={{ border: "1px solid rgba(37, 99, 235, 0.2)" }}
              />
            </label>
            <label className="profiles-form-group">
              <span style={{ color: "#2563eb", fontWeight: "700", fontSize: "0.75rem" }}>DEPARTEMEN</span>
              <input
                className="profiles-input"
                value={createForm.department}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, department: event.target.value }))}
                placeholder="Contoh: IT Support"
                style={{ border: "1px solid rgba(37, 99, 235, 0.2)" }}
              />
            </label>
            <label className="profiles-form-group">
              <span style={{ color: "#2563eb", fontWeight: "700", fontSize: "0.75rem" }}>TANGGAL BERGABUNG</span>
              <input
                className="profiles-input"
                type="date"
                value={createForm.hire_date}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, hire_date: event.target.value }))}
                style={{ border: "1px solid rgba(37, 99, 235, 0.2)" }}
              />
            </label>
            <label className="profiles-form-group">
              <span style={{ color: "#2563eb", fontWeight: "700", fontSize: "0.75rem" }}>GAJI POKOK</span>
              <input
                className="profiles-input"
                value={createForm.salary}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, salary: event.target.value }))}
                placeholder="Masukkan nominal gaji"
                style={{ border: "1px solid rgba(37, 99, 235, 0.2)" }}
              />
            </label>
          </div>

          <div className="profiles-actions" style={{ justifyContent: "flex-end", marginTop: "2rem" }}>
            <Button variant="outline" size="md" onClick={() => navigate("/employees")} disabled={loading}>
              Batal
            </Button>
            <Button variant="primary" size="md" onClick={() => void createNewEmployee()} disabled={loading} style={{ backgroundColor: "#2563eb" }}>
              <Plus size={16} />
              Simpan Karyawan
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isUpdatePage) {
    return (
      <div className="employees-page crud-page">
        <div className="employees-list-header" style={{ borderBottom: "2px solid #2563eb", paddingBottom: "20px" }}>
          <div className="employees-list-title">
            <h1 style={{ color: "#2563eb", marginBottom: "4px" }}>✏️ Update Data Karyawan</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Perbarui informasi posisi dan gaji karyawan</p>
          </div>
          <Button variant="outline" size="md" onClick={() => navigate("/employees")} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            Kembali ke Daftar
          </Button>
        </div>

        <Card className="employees-panel" glass style={{ borderTop: "4px solid #2563eb", marginTop: "1rem" }}>
          <div className="profiles-panel-header" style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ color: "#2563eb" }}><Pencil size={18} /></div>
              <h2 style={{ color: "#2563eb", margin: 0 }}>Form Update Karyawan</h2>
            </div>
          </div>

          <div className="employee-form-grid">
            <label className="profiles-form-group">
              <span style={{ color: "#2563eb", fontWeight: "700", fontSize: "0.75rem" }}>EMPLOYEE ID</span>
              <input className="profiles-input" value={updateForm.id} readOnly style={{ backgroundColor: "#f3f4f6" }} />
            </label>
            <label className="profiles-form-group">
              <span style={{ color: "#2563eb", fontWeight: "700", fontSize: "0.75rem" }}>JABATAN</span>
              <input
                className="profiles-input"
                value={updateForm.position}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, position: event.target.value }))}
                placeholder="Masukkan Jabatan"
                style={{ border: "1px solid rgba(37, 99, 235, 0.2)" }}
              />
            </label>
            <label className="profiles-form-group">
              <span style={{ color: "#2563eb", fontWeight: "700", fontSize: "0.75rem" }}>DEPARTEMEN</span>
              <input
                className="profiles-input"
                value={updateForm.department}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, department: event.target.value }))}
                placeholder="Masukkan Departemen"
                style={{ border: "1px solid rgba(37, 99, 235, 0.2)" }}
              />
            </label>
            <label className="profiles-form-group">
              <span style={{ color: "#2563eb", fontWeight: "700", fontSize: "0.75rem" }}>GAJI POKOK</span>
              <input
                className="profiles-input"
                value={updateForm.salary}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, salary: event.target.value }))}
                placeholder="Masukkan Gaji"
                style={{ border: "1px solid rgba(37, 99, 235, 0.2)" }}
              />
            </label>
          </div>

          <div className="profiles-actions" style={{ justifyContent: "flex-end", marginTop: "2rem" }}>
            <Button variant="outline" size="md" onClick={() => navigate("/employees")} disabled={loading}>
              Batal
            </Button>
            <Button variant="secondary" size="md" onClick={() => void updateExistingEmployee()} disabled={loading} style={{ backgroundColor: "#2563eb" }}>
              <Pencil size={16} />
              Update Data
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="employees-page crud-page">
      {/* Header - Title Section */}
      <div className="employees-list-header">
        <div className="profiles-list-title">
          <span className="employees-page-badge">People Center</span>
          <h1>Daftar Karyawan</h1>
          <p>Kelola jabatan, departemen, dan gaji karyawan dalam tampilan yang lebih rapi dan konsisten.</p>
        </div>
        <div className="profiles-list-actions">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/employees/add")}
            disabled={loading}
          >
            <Plus size={16} />
            Tambah Karyawan
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => void loadEmployees()}
            disabled={loading}
            style={{ borderColor: "#2563eb", color: "#2563eb" }}
          >
            <RefreshCw size={16} />
            Segarkan
          </Button>
        </div>
      </div>

      <div className="employees-summary-grid">
        {employeeSummaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="employees-summary-card" glass>
              <div className="employees-summary-header">
                <div>
                  <span className="employees-summary-label">{card.label}</span>
                  <p className="employees-summary-subtitle">{card.subtitle}</p>
                </div>
                <span className={`employees-summary-icon employees-summary-icon--${card.tone}`}>
                  <Icon size={20} />
                </span>
              </div>
              <div className="employees-summary-value">{card.value}</div>
              <div className="employees-summary-change">{card.change}</div>
            </Card>
          );
        })}
      </div>

      {/* Control Bar - Search & Filter */}
      <Card className="profiles-search-card" glass>
        <div className="profiles-control-bar">
          <div className="profiles-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Cari nama, ID, atau kode karyawan..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="profiles-search-input"
            />
          </div>

          <div className="profiles-quick-controls">
            <div className="control-group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="profiles-sort-select"
              >
                <option value="name">Urutkan: Nama</option>
                <option value="id">Urutkan: ID</option>
                <option value="code">Urutkan: Kode</option>
                <option value="department">Urutkan: Departemen</option>
                <option value="position">Urutkan: Jabatan</option>
              </select>
              <button
                className="profiles-sort-order-btn"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>

            <button
              className={`profiles-filter-btn ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
              style={{ borderColor: "#2563eb", color: "#2563eb" }}
            >
              <Filter size={18} />
              <span>Filter</span>
              <ChevronDown
                size={14}
                style={{ transform: showFilters ? "rotate(180deg)" : "", transition: "transform 0.3s ease" }}
              />
            </button>

            {(searchText || selectedDepartment || selectedPosition) && (
              <Button variant="outline" size="sm" onClick={clearFilters} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
                Bersihkan
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="profiles-filter-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label style={{ color: "#2563eb", fontWeight: "600" }}>Departemen</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="profiles-filter-select"
                >
                  <option value="">Semua Departemen</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label style={{ color: "#2563eb", fontWeight: "600" }}>Jabatan</label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="profiles-filter-select"
                >
                  <option value="">Semua Jabatan</option>
                  {uniquePositions.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="profiles-results-info" style={{ color: "#2563eb", fontWeight: "600" }}>
          Menampilkan <strong>{paginatedEmployees.length}</strong> dari <strong>{sortedEmployees.length}</strong> data
        </div>
      </Card>

      {/* Table Section */}
      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Data Karyawan</h3>
          <span className="table-count">{paginatedEmployees.length} dari {sortedEmployees.length} data</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode / ID</th>
                <th>Nama Karyawan</th>
                <th>Departemen</th>
                <th>Jabatan</th>
                <th>Tgl Bergabung</th>
                <th className="th-right">Gaji Pokok</th>
                <th className="th-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="cell-id">{item.employee_code || "N/A"}</div>
                      <div className="cell-sub">ID: {item.id}</div>
                    </td>
                    <td>
                      <div className="cell-name">
                        <div className="cell-avatar">
                          {item.user?.name?.charAt(0).toUpperCase() || "E"}
                        </div>
                        <span className="cell-name-text">{item.user?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td><span className="cell-tag">{item.department || "-"}</span></td>
                    <td>{item.position || "-"}</td>
                    <td>
                      <span className="cell-date">{item.hire_date ? formatDateTime(item.hire_date) : "-"}</span>
                    </td>
                    <td className="cell-amount">
                      {item.salary ? Number(item.salary).toLocaleString("id-ID") : "-"}
                    </td>
                    <td>
                      <div className="cell-actions">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/employees/update/${item.id}`)}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void deleteExistingEmployee(String(item.id))}
                          title="Delete"
                          style={{ color: "var(--status-danger)" }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="cell-empty">
                    Tidak ada data karyawan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="pagination__info">
              Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
            </div>
            <div className="pagination__controls">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{ borderColor: "#2563eb", color: "#2563eb" }}
              >
                ← Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{ borderColor: "#2563eb", color: "#2563eb" }}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmployeesPage;
