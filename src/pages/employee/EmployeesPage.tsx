import { useEffect, useMemo, useState } from "react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import { Card, CardHeader } from "@/shared/ui";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
=======
import { api } from "@/shared/api/httpClient";
import { getAllLocations, getActiveLocations } from "@/features/location/api/location.service";
import type { LocationItem } from "@/features/location/types/location.types";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, ConfirmDialog } from "@/shared/ui";
>>>>>>> 5d9d0d74aafb4b4c58ee638b424b33317641d20c
import { LoadingState, ErrorState, EmptyState } from "@/shared/ui/DataStateDisplay";
import { showToast } from "@/shared/ui/toast";
import {
  deleteEmployee,
  getEmployeesPage,
} from "@/features/employee/api/employee.service";
import { getAllLocations, getActiveLocations } from "@/features/location/api/location.service";
import type { LocationItem } from "@/features/location/types/location.types";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import { useAuthStore } from "@/app/store/auth.store";
import { RBACUtils } from "@/shared/hooks/rbac";
import EmployeeLifecycleModals from "./components/EmployeeLifecycleModals";
import {
  Search,
  Filter,
  Pencil,
  Trash2,
  Briefcase,
  Users,
  Building2,
  Calendar,
  RefreshCw,
  Plus,
  ChevronDown,
  Download
} from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "./EmployeesPage.css";

const formatDateTime = (input: string) => {
  if (!input) return "-";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
};

const EmployeesPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
<<<<<<< HEAD
=======
  const [deleteTarget, setDeleteTarget] = useState<EmployeeItem | null>(null);
  // const [hasLoaded, setHasLoaded] = useState(false);

  // Authentication & RBAC
>>>>>>> 5d9d0d74aafb4b4c58ee638b424b33317641d20c
  const user = useAuthStore((state) => state.user);
  const allowedMenuKeys = useAuthStore((state) => state.allowedMenuKeys);
  
  const canManageEmployees = RBACUtils.hasPermission(user, ["employee.manage", "admin.access"]);
  const canViewAdminMetadata = RBACUtils.hasPermission(user, ["admin.access"]);

  const [activeActionModal, setActiveActionModal] = useState<"onboarding_start" | "onboarding_complete" | "offboarding_start" | "offboarding_complete" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeItem | null>(null);
  const [onboardingDate, setOnboardingDate] = useState("");
  const [offboardingDate, setOffboardingDate] = useState("");
  const [offboardingReason, setOffboardingReason] = useState("");
  const [allLocations, setAllLocations] = useState<LocationItem[]>([]);

<<<<<<< HEAD
  // Search & Filter
=======
  // Metadata State
  const [allLocations, setAllLocations] = useState<LocationItem[]>([]);
  // const [allUsers, setAllUsers] = useState<Record<string, unknown>[]>([]);
  // const [allSchedules, setAllSchedules] = useState<Record<string, unknown>[]>([]);
  // const [allDepartments, setAllDepartments] = useState<string[]>([]);

  // Search & Filter State
>>>>>>> 5d9d0d74aafb4b4c58ee638b424b33317641d20c
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [activeTab, setActiveTab] = useState<"Semua" | "Aktif" | "Probation" | "Resigned">("Semua");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.department).filter(Boolean))).sort();
  }, [items]);

  const uniquePositions = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.position).filter(Boolean))).sort();
  }, [items]);

  const loadMetadata = async () => {
    try {
      let locList: LocationItem[] = [];
      if (canViewAdminMetadata) {
        const locs = await getAllLocations();
        locList = Array.isArray(locs.items) ? locs.items : [];
      } else {
        const active = await getActiveLocations();
        locList = Array.isArray(active.items) ? active.items : [];
      }
      setAllLocations(locList);
    } catch (err) { console.warn("Metadata failed:", err); }
  };

  const loadEmployees = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        per_page: pageSize,
      };
      if (searchText.trim()) params.search = searchText.trim();
      if (selectedDepartment) params.department = selectedDepartment;
      
      let statusParam = "";
      if (activeTab === "Aktif") statusParam = "active";
      else if (activeTab === "Probation") statusParam = "pending";
      else if (activeTab === "Resigned") statusParam = "inactive";
      if (statusParam) params.status = statusParam;

<<<<<<< HEAD
      const result = await getEmployeesPage(currentPage, pageSize, params);
      setItems(Array.isArray(result.items) ? result.items : []);
      setTotalPages(result.totalPages || 1);
      setTotalEmployees(result.total || 0);
      void loadMetadata();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error as never));
    } finally { setLoading(false); }
  };

  const getErrorMessage = (error: any) => {
    return error?.response?.data?.message || error?.message || "Gagal memuat data";
  };
=======
  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / pageSize));

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedEmployees.slice(startIndex, startIndex + pageSize);
  }, [sortedEmployees, currentPage, pageSize]);
>>>>>>> 5d9d0d74aafb4b4c58ee638b424b33317641d20c

  const confirmDeleteEmployee = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await deleteEmployee(String(deleteTarget.id));
      showToast("Karyawan berhasil dihapus", "success");
      setDeleteTarget(null);
      await loadEmployees();
    } catch (error: unknown) {
      showToast(getErrorMessage(error as never), "error");
    } finally { setLoading(false); }
  };

  const handleLifecycleAction = async () => {
    // Logic for onboarding/offboarding ...
    setActiveActionModal(null);
    await loadEmployees();
  };

  useEffect(() => { void loadEmployees(); }, [currentPage, pageSize, searchText, selectedDepartment, activeTab]);

  const clearFilters = () => {
    setSearchText("");
    setSelectedDepartment("");
    setSelectedPosition("");
    setActiveTab("Semua");
    setCurrentPage(1);
  };

<<<<<<< HEAD
=======
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

      // Fetch Locations - managers should use the active list only
      let locList: LocationItem[] = [];
      try {
        if (canViewAdminMetadata) {
          const locs = await getAllLocations();
          locList = Array.isArray(locs.items) ? locs.items : [];
          console.log("📍 Locations fetched (all):", locList);
        } else {
          const active = await getActiveLocations();
          locList = Array.isArray(active.items) ? active.items : [];
          console.log("📍 Locations fetched (active only):", locList);
        }
      } catch (err) {
        console.warn("⚠️ Fetch locations failed:", err);
      }
      setAllLocations(locList);

      // Fetch Users - only admin/super admin can access the admin user listing
      if (canViewAdminMetadata) {
        try {
          const usersRes = await api.get('/admin/users');
          let usersList = usersRes.data?.data?.items || usersRes.data?.data || [];
          if (!Array.isArray(usersList)) usersList = [];
          console.log("👤 Users fetched:", usersList);
          // setAllUsers(usersList);
        } catch (err) {
          console.warn("⚠️ Fetch users failed (likely permission):", err);
        }
      }

      // Fetch Work Schedules - tolerate permission issues
      try {
        const schedRes = await api.get('/work-schedules');
        let schedList = schedRes.data?.data || schedRes.data || [];
        if (!Array.isArray(schedList)) schedList = [];
        console.log("📅 Schedules fetched:", schedList);
        // setAllSchedules(schedList);
      } catch (err) {
        console.warn("⚠️ Fetch schedules failed (likely permission):", err);
      }

      // Fetch Departments - tolerate permission errors
      try {
        const deptRes = await api.get('/organization/master-data');
        const deptList = deptRes.data?.data?.departments;
        const finalDeptList = Array.isArray(deptList) ? deptList : [];
        console.log("🏢 Departments fetched:", finalDeptList);
        // setAllDepartments(finalDeptList);
      } catch (err) {
        console.warn("⚠️ Fetch departments failed (likely permission):", err);
      }
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



  const confirmDeleteEmployee = async () => {
    if (!deleteTarget) return;

    const id = requireId(String(deleteTarget.id));
    if (!id) return;

    setLoading(true);
    setStatusMessage("Menghapus employee...");

    try {
      await deleteEmployee(id);
      setStatusMessage("Employee berhasil dihapus.");
      setDeleteTarget(null);
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
    } catch (e: unknown) {
      setStatusMessage(e instanceof Error ? e.message : "Gagal memproses aksi");
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

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);



>>>>>>> 5d9d0d74aafb4b4c58ee638b424b33317641d20c
  return (
    <div className="crud-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge"><Briefcase size={16} /><span>Pusat Karyawan</span></div>
            <h1 className="hero-title">Daftar Karyawan</h1>
            <p className="hero-subtitle">Kelola seluruh data karyawan dan struktur organisasi secara terpusat.</p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadEmployees()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Segarkan
            </button>
            {canManageEmployees && (
              <button className="btn-primary" onClick={() => navigate("/employees/add")}>
                <Plus size={16} /> Tambah Karyawan
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {[
          { label: "Total Karyawan", value: String(totalEmployees), tone: "blue", icon: Users, sub: "Data terdaftar" },
          { label: "Aktif", value: String(items.filter(i => i.status === 'active').length), tone: "green", icon: Search, sub: "Karyawan aktif" },
          { label: "Departemen", value: String(uniqueDepartments.length), tone: "orange", icon: Building2, sub: "Unit kerja" },
          { label: "Jabatan", value: String(uniquePositions.length), tone: "purple", icon: Briefcase, sub: "Posisi tersedia" },
        ].map((card) => (
          <div key={card.label} className="employee-summary-card">
            <div className="employee-summary-header">
              <div>
                <p className="employee-summary-label">{card.label}</p>
                <p className="employee-summary-subtitle">{card.sub}</p>
              </div>
              <div className={`employee-summary-icon-wrapper employee-icon-${card.tone}`}><card.icon size={28} /></div>
            </div>
            <div className={`employee-summary-value employee-value-${card.tone}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="elyra-tabs">
            {(["Semua", "Aktif", "Probation", "Resigned"] as const).map((tab) => (
              <button key={tab} className={`elyra-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </div>
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input type="text" placeholder="Cari karyawan..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="search-input-pill" />
            </div>
            <button className={`filter-btn-rounded ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(!showFilters)}><Filter size={18} /><span>Filter</span></button>
          </div>
        </div>
        {showFilters && (
          <div className="filter-dropdown" style={{ display: 'block', padding: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="filter-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="filter-group" style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Departemen</label>
                <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="filter-select-premium">
                  <option value="">Semua Departemen</option>
                  {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="filter-group" style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Jabatan</label>
                <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)} className="filter-select-premium">
                  <option value="">Semua Jabatan</option>
                  {uniquePositions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat data karyawan..." />}
          {!loading && errorMessage && <ErrorState message="Terjadi Kesalahan" error={errorMessage} onRetry={loadEmployees} />}
          {!loading && !errorMessage && items.length === 0 && <EmptyState title="Tidak ada data" message="Sesuaikan filter atau pencarian Anda." onAction={clearFilters} actionLabel="Reset Filter" />}
          
          {!loading && !errorMessage && items.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '350px' }}>Nama Karyawan</th>
                      <th>Departemen</th>
                      <th>Jabatan</th>
                      <th>Lokasi</th>
                      <th>Tanggal Masuk</th>
                      <th className="th-center">Status</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="cell-name">
                            <img
                              src={(item.user as { profile?: { avatar_url?: string } } | undefined)?.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user?.name || 'U')}&color=7F9CF5&background=EBF4FF`}
                              alt=""
                              className="cell-avatar"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user?.name || 'U')}&color=7F9CF5&background=EBF4FF`;
                              }}
                            />
                            <div className="cell-stacked">
                              <span className="cell-name-text">{item.user?.name || "Unknown"}</span>
                              <span className="cell-stacked__sub">{item.employee_code || item.id}</span>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ fontWeight: 600, color: '#475569' }}>{item.department || "-"}</span></td>
                        <td><span style={{ fontWeight: 500, color: '#64748b' }}>{item.position || "-"}</span></td>
                        <td><span className="badge-soft badge-soft--blue">{allLocations.find(l => String(l.id) === String(item.location_id))?.name || "Remote"}</span></td>
                        <td>
                          <div className="cell-stacked">
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatDateTime(item.hire_date)}</span>
                            <span className="cell-stacked__sub">Join Date</span>
                          </div>
                        </td>
                        <td className="td-center">
                          <span className={`badge-soft badge-soft--${item.status === "active" ? "green" : item.status === "pending" ? "orange" : "red"}`}>
                            {item.status === "active" ? "Aktif" : item.status === "pending" ? "Probation" : "Resigned"}
                          </span>
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
<<<<<<< HEAD
                            <button className="action-btn action-btn-edit" onClick={() => navigate(`/employees/update/${item.id}`)} title="Edit"><Pencil size={16} /></button>
                            <button className="action-btn action-btn-delete" onClick={() => setDeleteTarget(item)} title="Hapus"><Trash2 size={16} /></button>
=======
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => navigate(`/employees/update/${item.id}`)}
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="action-btn action-btn-delete"
                              onClick={() => setDeleteTarget(item)}
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
>>>>>>> 5d9d0d74aafb4b4c58ee638b424b33317641d20c
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{items.length}</strong> dari <strong>{totalEmployees}</strong> karyawan
                </div>
                <div className="pagination-controls">
                  <button className="pagination-btn" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} className={`pagination-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                  ))}
                  <button className="pagination-btn" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>›</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

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

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Karyawan"
<<<<<<< HEAD
        message={`Karyawan "${deleteTarget?.user?.name || deleteTarget?.employee_code || "ini"}" akan dihapus secara permanen.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        loading={loading}
=======
        message={`Karyawan "${deleteTarget?.user?.name || deleteTarget?.employee_code || "ini"}" akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        loading={loading && !!deleteTarget}
>>>>>>> 5d9d0d74aafb4b4c58ee638b424b33317641d20c
        onConfirm={() => void confirmDeleteEmployee()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default EmployeesPage;
