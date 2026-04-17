import { useEffect, useMemo, useState } from "react";
import { api } from "@/shared/api/httpClient";
import { getAllLocations } from "@/features/location/api/location.service";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { LoadingState, ErrorState, EmptyState } from "@/shared/ui/DataStateDisplay";
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
  ArrowUp,
  ArrowDown,
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
  location_id: string;
  manager_id: string;
  work_schedule_id: string;
};

const DEFAULT_FORM: EmployeeFormState = {
  id: "",
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Metadata State
  const [allLocations, setAllLocations] = useState<Record<string, any>[]>([]);
  const [allUsers, setAllUsers] = useState<Record<string, any>[]>([]);
  const [allSchedules, setAllSchedules] = useState<Record<string, any>[]>([]);
  const [allDepartments, setAllDepartments] = useState<string[]>([]);

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

  const loadMetadata = async () => {
    try {
      console.log("🔍 Fetching metadata...");
      // Fetch Locations
      const locs = await getAllLocations();
      const locList = Array.isArray(locs.items) ? locs.items : [];
      console.log("📍 Locations fetched:", locList);
      setAllLocations(locList);

      // Fetch Users (for Managers and direct user_id link)
      const usersRes = await api.get('/admin/users');
      let usersList = usersRes.data?.data?.items || usersRes.data?.data || [];
      if (!Array.isArray(usersList)) usersList = [];
      console.log("👤 Users fetched:", usersList);
      setAllUsers(usersList);

      // Fetch Work Schedules
      const schedRes = await api.get('/work-schedules');
      let schedList = schedRes.data?.data || schedRes.data || [];
      if (!Array.isArray(schedList)) schedList = [];
      console.log("📅 Schedules fetched:", schedList);
      setAllSchedules(schedList);

      // Fetch Departments
      const deptRes = await api.get('/organization/master-data');
      const deptList = deptRes.data?.data?.departments;
      const finalDeptList = Array.isArray(deptList) ? deptList : [];
      console.log("🏢 Departments fetched:", finalDeptList);
      setAllDepartments(finalDeptList);
    } catch (err) {
      console.error("❌ Failed to load metadata:", err);
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    setStatusMessage("Memuat semua employees...");
    setErrorMessage(null);

    try {
      const result = await getAllEmployees();
      setItems(result);
      setStatusMessage("Semua employee berhasil dimuat.");
      
      // Load metadata in parallel
      void loadMetadata();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat employee.";
      setStatusMessage(message);
      setErrorMessage(message);
    } finally {
      setLoading(false);
      setHasLoaded(true);
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
        location_id: Number(createForm.location_id) || undefined,
        manager_id: Number(createForm.manager_id) || undefined,
        work_schedule_id: Number(createForm.work_schedule_id) || undefined,
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
        location_id: Number(updateForm.location_id) || undefined,
        manager_id: Number(updateForm.manager_id) || undefined,
        work_schedule_id: Number(updateForm.work_schedule_id) || undefined,
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
      void loadMetadata();
      return;
    }

    void loadEmployees();
  }, [isAddPage, isUpdatePage]);

  // Reset page on filter changes (like PayrollListPage)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedDepartment, selectedPosition, sortBy, sortOrder]);

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
          location_id: String(result?.location_id ?? ""),
          manager_id: String(result?.manager_id ?? ""),
          work_schedule_id: String(result?.work_schedule_id ?? ""),
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

        <Card className="control-card" glass>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#1e3a8a', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={18} style={{ color: '#2563eb' }} />
              Form Data Karyawan
            </h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <span>USER</span>
              <select
                className="form-input"
                value={createForm.user_id}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, user_id: event.target.value }))}
              >
                <option value="">Pilih User</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <span>KODE KARYAWAN</span>
              <input
                className="form-input"
                value={createForm.employee_code}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, employee_code: event.target.value }))}
                placeholder="Contoh: EMP-001"
              />
            </div>
            <div className="form-group">
              <span>JABATAN</span>
              <input
                className="form-input"
                value={createForm.position}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, position: event.target.value }))}
                placeholder="Contoh: Manager"
              />
            </div>
            <div className="form-group">
              <span>DEPARTEMEN</span>
              <select
                className="form-input"
                value={createForm.department}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, department: event.target.value }))}
              >
                <option value="">Pilih Departemen</option>
                {allDepartments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <span>TANGGAL BERGABUNG</span>
              <input
                className="form-input"
                type="date"
                value={createForm.hire_date}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, hire_date: event.target.value }))}
              />
            </div>
            <div className="form-group">
              <span>GAJI POKOK</span>
              <input
                className="form-input"
                value={createForm.salary}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, salary: event.target.value }))}
                placeholder="Masukkan nominal gaji"
              />
            </div>
            <div className="form-group">
              <span>LOKASI KERJA</span>
              <select
                className="form-input"
                value={createForm.location_id}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, location_id: event.target.value }))}
              >
                <option value="">Pilih Lokasi</option>
                {allLocations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <span>MANAGER</span>
              <select
                className="form-input"
                value={createForm.manager_id}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, manager_id: event.target.value }))}
              >
                <option value="">Pilih Manager</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <span>WORK SCHEDULE</span>
              <select
                className="form-input"
                value={createForm.work_schedule_id}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, work_schedule_id: event.target.value }))}
              >
                <option value="">Pilih Jadwal</option>
                {allSchedules.map((s) => (
                  <option key={s.id} value={s.id}>{s.name || s.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <Button variant="outline" size="md" onClick={() => navigate("/employees")} disabled={loading}>
              Batal
            </Button>
            <Button variant="primary" size="md" onClick={() => void createNewEmployee()} disabled={loading}>
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
      <div className="crud-page">
        <div className="page-header">
          <div className="page-header-title">
            <span className="page-badge">People Center</span>
            <h1>Update Data Karyawan</h1>
            <p>Perbarui informasi posisi dan gaji karyawan</p>
          </div>
          <div className="page-header-actions">
            <Button variant="outline" size="md" onClick={() => navigate("/employees")} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
              Kembali ke Daftar
            </Button>
          </div>
        </div>

        <Card className="control-card" glass>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#1e3a8a', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Pencil size={18} style={{ color: '#2563eb' }} />
              Form Update Karyawan
            </h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <span>EMPLOYEE ID</span>
              <input className="form-input" value={updateForm.id} readOnly style={{ backgroundColor: "#f3f4f6" }} />
            </div>
            <div className="form-group">
              <span>JABATAN</span>
              <input
                className="form-input"
                value={updateForm.position}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, position: event.target.value }))}
                placeholder="Masukkan Jabatan"
              />
            </div>
            <div className="form-group">
              <span>DEPARTEMEN</span>
              <select
                className="form-input"
                value={updateForm.department}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, department: event.target.value }))}
              >
                <option value="">Pilih Departemen</option>
                {allDepartments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <span>GAJI POKOK</span>
              <input
                className="form-input"
                value={updateForm.salary}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, salary: event.target.value }))}
                placeholder="Masukkan Gaji"
              />
            </div>
            <div className="form-group">
              <span>LOKASI KERJA</span>
              <select
                className="form-input"
                value={updateForm.location_id}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, location_id: event.target.value }))}
              >
                <option value="">Pilih Lokasi</option>
                {allLocations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <span>MANAGER</span>
              <select
                className="form-input"
                value={updateForm.manager_id}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, manager_id: event.target.value }))}
              >
                <option value="">Pilih Manager</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <span>WORK SCHEDULE</span>
              <select
                className="form-input"
                value={updateForm.work_schedule_id}
                onChange={(event) => setUpdateForm((prev) => ({ ...prev, work_schedule_id: event.target.value }))}
              >
                <option value="">Pilih Jadwal</option>
                {allSchedules.map((s) => (
                  <option key={s.id} value={s.id}>{s.name || s.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <Button variant="outline" size="md" onClick={() => navigate("/employees")} disabled={loading}>
              Batal
            </Button>
            <Button variant="primary" size="md" onClick={() => void updateExistingEmployee()} disabled={loading}>
              <Pencil size={16} />
              Update Data
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="crud-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">People Center</span>
          <h1>Daftar Karyawan</h1>
          <p>Kelola jabatan, departemen, dan gaji karyawan dalam tampilan yang lebih rapi dan konsisten.</p>
        </div>
        <div className="page-header-actions">
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

      {/* Summary Cards */}
      <div className="summary-grid">
        {employeeSummaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="summary-card" glass>
              <div className="summary-card__header">
                <div>
                  <span className="summary-card__label">{card.label}</span>
                  <p className="summary-card__subtitle">{card.subtitle}</p>
                </div>
                <span className={`summary-card__icon summary-card__icon--${card.tone}`}>
                  <Icon size={20} />
                </span>
              </div>
              <div className={`summary-card__value summary-card__value--${card.tone}`}>{card.value}</div>
              <div className="summary-card__change">{card.change}</div>
            </Card>
          );
        })}
      </div>

      {/* Combined Table & Control Section */}
      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Data Karyawan</h3>
          <span className="table-count">{paginatedEmployees.length} dari {sortedEmployees.length} data</span>
        </div>

        <div className="table-card-inner" style={{ paddingBottom: '1.5rem' }}>
          <div className="control-bar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Cari nama, ID, atau kode karyawan..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="quick-controls">
              <div className="control-group">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="sort-select"
                >
                  <option value="name">Urutkan: Nama</option>
                  <option value="id">Urutkan: ID</option>
                  <option value="code">Urutkan: Kode</option>
                  <option value="department">Urutkan: Departemen</option>
                  <option value="position">Urutkan: Jabatan</option>
                </select>
                <button
                  className="sort-order-btn"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </button>
              </div>

              <button
                className={`filter-btn ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
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
            <div className="filter-panel" style={{ marginTop: '1rem' }}>
              <div className="filter-row">
                <div className="filter-group">
                  <label>Departemen</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Semua Departemen</option>
                    {uniqueDepartments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Jabatan</label>
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="filter-select"
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
        </div>

        {loading && <div className="table-card-inner"><LoadingState message="Memuat data karyawan..." /></div>}
        {!loading && errorMessage && (
          <div className="table-card-inner">
            <ErrorState message="Gagal memuat data karyawan" error={errorMessage} onRetry={() => void loadEmployees()} />
          </div>
        )}
        {!loading && !errorMessage && hasLoaded && paginatedEmployees.length === 0 && (
          <div className="table-card-inner">
            <EmptyState
              icon=""
              title="Tidak ada data"
              message="Tidak ada karyawan yang sesuai dengan filter yang dipilih"
              actionLabel={searchText || selectedDepartment || selectedPosition ? "Bersihkan Filter" : undefined}
              onAction={searchText || selectedDepartment || selectedPosition ? clearFilters : undefined}
            />
          </div>
        )}

        {!loading && !errorMessage && paginatedEmployees.length > 0 && (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kode / ID</th>
                    <th>Nama Karyawan</th>
                    <th>Departemen</th>
                    <th>Jabatan</th>
                    <th>Lokasi</th>
                    <th>Manager</th>
                    <th>Tgl Bergabung</th>
                    <th className="th-right">Gaji Pokok</th>
                    <th className="th-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.map((item) => (
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
                        <span className="cell-tag" style={{ backgroundColor: '#f0fdf4', color: '#166534' }}>
                          {allLocations.find(l => String(l.id) === String(item.location_id))?.name || "-"}
                        </span>
                      </td>
                      <td>
                        {allUsers.find(u => String(u.id) === String(item.manager_id))?.name || "-"}
                      </td>
                      <td>
                        <span className="cell-date">{item.hire_date ? formatDateTime(item.hire_date) : "-"}</span>
                      </td>
                      <td className="cell-amount">
                        {item.salary ? `Rp ${Number(item.salary).toLocaleString("id-ID")}` : "-"}
                      </td>
                      <td>
                        <div className="cell-actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/employees/update/${item.id}`)}
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void deleteExistingEmployee(String(item.id))}
                            title="Delete"
                            style={{ color: "var(--status-danger)" }}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
          </>
        )}
      </Card>
    </div>
  );
};

export default EmployeesPage;
