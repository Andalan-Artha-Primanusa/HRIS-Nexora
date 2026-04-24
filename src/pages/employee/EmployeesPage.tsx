import { useEffect, useMemo, useState } from "react";
import { api } from "@/shared/api/httpClient";
import { getAllLocations } from "@/features/location/api/location.service";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { LoadingState, ErrorState, EmptyState } from "@/shared/ui/DataStateDisplay";
import {
  deleteEmployee,
  getAllEmployees,
  startOnboarding,
  completeOnboarding,
  startOffboarding,
  completeOffboarding,
} from "@/features/employee/api/employee.service";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import { useAuthStore } from "@/app/store/auth.store";
import { RBACUtils } from "@/shared/hooks/rbac";
import EmployeeLifecycleModals from "./components/EmployeeLifecycleModals";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Briefcase,
  FileText,
  TrendingUp,
} from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "./EmployeesPage.css";



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
  const navigate = useNavigate();

  const [items, setItems] = useState<EmployeeItem[]>([]);
  const [, setStatusMessage] = useState("Ready to call employee API");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // const [hasLoaded, setHasLoaded] = useState(false);

  // Authentication & RBAC
  const user = useAuthStore((state) => state.user);
  const canManageEmployees = RBACUtils.hasRole(user, ['super_admin', 'admin', 'hr']);

  // Lifecycle Modals State
  const [activeActionModal, setActiveActionModal] = useState<"onboarding_start" | "onboarding_complete" | "offboarding_start" | "offboarding_complete" | null>(null);
  const [selectedEmployeeId] = useState<string>("");
  const [onboardingDate, setOnboardingDate] = useState("");
  const [offboardingDate, setOffboardingDate] = useState("");
  const [offboardingReason, setOffboardingReason] = useState("");

  // Metadata State
  const [allLocations, setAllLocations] = useState<Record<string, any>[]>([]);
  // const [allUsers, setAllUsers] = useState<Record<string, any>[]>([]);
  // const [allSchedules, setAllSchedules] = useState<Record<string, any>[]>([]);
  // const [allDepartments, setAllDepartments] = useState<string[]>([]);

  // Search & Filter State
  const [searchText, setSearchText] = useState("");
  const [sortBy] = useState<"id" | "name" | "code" | "department" | "position">("name");
  const [sortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [activeTab, setActiveTab] = useState<"Semua" | "Aktif" | "Probation" | "Resigned">("Semua");

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
      // 1. Search Logic
      const searchStr = searchText.toLowerCase();
      const nameMatch = item.user?.name?.toLowerCase().includes(searchStr);
      const codeMatch = item.employee_code?.toLowerCase().includes(searchStr);
      const idMatch = String(item.id).includes(searchStr);
      const textMatch = nameMatch || codeMatch || idMatch;

      // 2. Metadata Filters (Dept, Position)
      const deptMatch = !selectedDepartment || item.department === selectedDepartment;
      const posMatch = !selectedPosition || item.position === selectedPosition;

      // 3. Status Tab Filter
      let statusMatch = true;
      if (activeTab === "Aktif") statusMatch = item.status === "active";
      else if (activeTab === "Probation") statusMatch = item.status === "pending";
      else if (activeTab === "Resigned") statusMatch = item.status === "inactive";

      return textMatch && deptMatch && posMatch && statusMatch;
    });
  }, [items, searchText, selectedDepartment, selectedPosition, activeTab]);

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
    setActiveTab("Semua");
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
      // setAllUsers(usersList);

      // Fetch Work Schedules
      const schedRes = await api.get('/work-schedules');
      let schedList = schedRes.data?.data || schedRes.data || [];
      if (!Array.isArray(schedList)) schedList = [];
      console.log("📅 Schedules fetched:", schedList);
      // setAllSchedules(schedList);

      // Fetch Departments
      const deptRes = await api.get('/organization/master-data');
      const deptList = deptRes.data?.data?.departments;
      const finalDeptList = Array.isArray(deptList) ? deptList : [];
      console.log("🏢 Departments fetched:", finalDeptList);
      // setAllDepartments(finalDeptList);
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
      // setHasLoaded(true);
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



  const handleLifecycleAction = async () => {
    if (!selectedEmployeeId || !activeActionModal) return;
    setLoading(true);
    setStatusMessage("Memproses aksi karyawan...");
    try {
      if (activeActionModal === "onboarding_start") {
        if (!onboardingDate) throw new Error("Tanggal masa percobaan wajib diisi");
        await startOnboarding(selectedEmployeeId, { probation_end_date: onboardingDate });
      } else if (activeActionModal === "onboarding_complete") {
        await completeOnboarding(selectedEmployeeId);
      } else if (activeActionModal === "offboarding_start") {
        if (!offboardingDate || !offboardingReason) throw new Error("Tanggal dan alasan berhenti wajib diisi");
        await startOffboarding(selectedEmployeeId, { termination_date: offboardingDate, termination_reason: offboardingReason });
      } else if (activeActionModal === "offboarding_complete") {
        await completeOffboarding(selectedEmployeeId);
      }
      setActiveActionModal(null);
      setStatusMessage("Aksi berhasil diproses.");
      await loadEmployees();
    } catch (e: any) {
      setStatusMessage(e.message || "Gagal memproses aksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEmployees();
  }, []);

  // Reset page on filter changes (like PayrollListPage)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedDepartment, selectedPosition, sortBy, sortOrder, activeTab]);



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
          {/* Redundant buttons removed in favor of integrated wrapper actions */}
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

      {/* Elyra-Inspired Open Header Section */}
      <div className="white-unified-wrapper">
        <div className="wuw-header">
          {/* Top Section: Title & Primary Action */}
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar Karyawan</h3>
              <span className="wuw-count-badge">{items.length} Total</span>
            </div>
            <div className="wuw-actions-area">
              <Button
                variant="outline"
                size="md"
                onClick={() => void loadEmployees()}
                disabled={loading}
                className="btn-pill btn-refresh"
              >
                <RefreshCw size={18} />
                <span>Segarkan</span>
              </Button>
              {canManageEmployees && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate("/employees/add")}
                  disabled={loading}
                  className="btn-pill btn-add-employee"
                >
                  <Plus size={20} />
                  <span>Tambah Karyawan</span>
                </Button>
              )}
            </div>
          </div>

          {/* Bottom Section: Segmented Tabs & Search Tools */}
          <div className="wuw-header-bottom">
            <div className="elyra-tabs">
              {(["Semua", "Aktif", "Probation", "Resigned"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`elyra-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="wuw-actions-area">
              <div className="search-box">
                <div className="search-icon-inside"><Search size={18} /></div>
                <input
                  type="text"
                  placeholder="Cari karyawan..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="search-input-pill"
                />
              </div>
              <button 
                className={`filter-btn-rounded ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel (Integrated Dropdown) */}
        {showFilters && (
          <div className="wuw-controls filter-panel-wrapper">
            <div className="filter-panel-premium">
              <div className="filter-row">
                <div className="filter-group">
                  <label>Departemen</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="filter-select-premium"
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
                    className="filter-select-premium"
                  >
                    <option value="">Semua Jabatan</option>
                    {uniquePositions.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                {(searchText || selectedDepartment || selectedPosition || activeTab !== "Semua") && (
                  <div className="filter-group-reset">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="btn-reset">
                      Reset Filter
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Integrated Table Area */}
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat karyawan..." />}
          {!loading && errorMessage && (
            <ErrorState message="Koneksi Terputus" error={errorMessage} onRetry={() => void loadEmployees()} />
          )}

          {!loading && !errorMessage && paginatedEmployees.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Pencarian Kosong"
                message="Kami tidak menemukan karyawan yang sesuai dengan kriteria Anda."
                actionLabel="Bersihkan Filter"
                onAction={clearFilters}
              />
            </div>
          )}

          {!loading && !errorMessage && paginatedEmployees.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '400px' }}>Anggota Tim</th>
                      <th>Departemen</th>
                      <th>Jabatan</th>
                      <th>Lokasi</th>
                      <th>Detail Bergabung</th>
                      <th className="th-center">Status</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmployees.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {item.user?.name ? item.user.name.charAt(0).toUpperCase() : String(item.id || 'E').charAt(0).toUpperCase()}
                            </div>

                            <div className="cell-stacked">
                              <span className="cell-name-text">{item.user?.name || "Unknown"}</span>
                              <span className="cell-stacked__sub">{item.employee_code || item.id}</span>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ color: '#475569', fontWeight: 600 }}>{item.department || "-"}</span></td>
                        <td><span style={{ color: '#64748b', fontWeight: 500 }}>{item.position || "-"}</span></td>
                        <td>
                          <span className="badge-soft badge-soft--blue" style={{ borderRadius: '999px' }}>
                            {allLocations.find(l => String(l.id) === String(item.location_id))?.name || "Remote"}
                          </span>
                        </td>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>{item.hire_date ? formatDateTime(item.hire_date) : "-"}</span>
                            <span className="cell-stacked__sub">Join Date</span>
                          </div>
                        </td>
                        <td className="td-center">
                          <span className={`badge-soft badge-soft--${
                            item.status === "active" ? "green" : 
                            item.status === "pending" ? "orange" : "red"
                          }`} style={{ borderRadius: '999px' }}>
                            {item.status === "active" ? "Aktif" : 
                             item.status === "pending" ? "Probation" : "Resigned"}
                          </span>
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => navigate(`/employees/update/${item.id}`)}
                              title="Edit Profil"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="action-btn action-btn-secondary"
                              onClick={() => navigate(`/legal/letters?employee=${item.id}`)}
                              title="Buat Surat"
                            >
                              <FileText size={16} />
                            </button>
                            <button
                              className="action-btn action-btn-view"
                              onClick={() => navigate(`/performance/summary?employee=${item.id}`)}
                              style={{ color: '#10b981', background: '#ecfdf5' }}
                              title="Kenaikan Jabatan"
                            >
                              <TrendingUp size={16} />
                            </button>
                            <button
                              className="action-btn action-btn-delete"
                              onClick={() => void deleteExistingEmployee(String(item.id))}
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination (Elyra Style) */}
              <div className="pagination" style={{ padding: '2.5rem', background: '#ffffff', borderTop: 'none', borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px' }}>
                <div className="pagination__info">
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
                    Menampilkan <strong>{paginatedEmployees.length}</strong> data dari <strong>{sortedEmployees.length}</strong> karyawan
                  </span>
                </div>
                <div className="pagination__controls" style={{ gap: '0.75rem' }}>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn-pill"
                    style={{ height: '40px', background: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b' }}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-pill"
                    style={{ height: '40px', background: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b' }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lifecycle Modals */}
      <EmployeeLifecycleModals
        activeActionModal={activeActionModal}
        setActiveActionModal={setActiveActionModal}
        onboardingDate={onboardingDate}
        setOnboardingDate={setOnboardingDate}
        offboardingDate={offboardingDate}
        setOffboardingDate={setOffboardingDate}
        offboardingReason={offboardingReason}
        setOffboardingReason={setOffboardingReason}
        handleLifecycleAction={handleLifecycleAction}
        loading={loading}
      />
    </div>
  );
};

export default EmployeesPage;
