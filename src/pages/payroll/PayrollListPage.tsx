import { useState, useEffect, useMemo } from "react";
import { Card } from "@/shared/ui/Card";
import { Modal } from "@/shared/ui/Modal";
import { ArrowDown, ArrowUp, Briefcase, Filter, RefreshCw, Search, ChevronDown } from "lucide-react";
import { PaginationWithSize } from '@/shared/ui/Pagination';
import { payrollService, toSafeArray } from "@/features/payroll/api/payroll.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";
import { PayrollStatusBadge } from "@/shared/ui/PayrollStatusBadge";
import { LoadingState, ErrorState, EmptyState } from "@/shared/ui/DataStateDisplay";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "./PayrollListPage.css";

interface PayrollWithEmployeeName extends PayrollItem {
  employeeName?: string;
}

const PayrollListPage: React.FC = () => {
  const [items, setItems] = useState<PayrollWithEmployeeName[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: "",
    message: "",
  });

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState<"id" | "employee" | "period" | "total">("period");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Normalize API fields
  const normalizePayroll = (payroll: any): any => ({
    ...payroll,
    basic_salary: payroll.basic_salary ?? payroll.gaji_pokok ?? 0,
    allowance: payroll.allowance ?? payroll.tunjangan ?? 0,
    bonus: payroll.bonus ?? payroll.lembur ?? payroll.bonus_khusus ?? 0,
    deduction: payroll.deduction ?? payroll.potongan ?? 0,
    tax: payroll.tax ?? payroll.pajak ?? 0,
    take_home_pay: payroll.take_home_pay ?? payroll.gaji_bersih ?? payroll.net_salary ?? 0,
    net_salary: payroll.net_salary ?? payroll.gaji_bersih ?? payroll.take_home_pay ?? 0,
    status: payroll.status ?? payroll.status_approval ?? payroll.status_pembayaran ?? 'draft',
    period: payroll.period ?? payroll.periode ?? '',
    employee_id: payroll.employee_id ?? payroll.karyawan_id ?? payroll.employee?.id ?? '',
  });

  const getEmployeeName = (emp: any): string => {
    if (emp?.user?.name && typeof emp.user.name === "string") return emp.user.name;
    if (emp?.name && typeof emp.name === "string") return emp.name;
    if (emp?.fullName && typeof emp.fullName === "string") return emp.fullName;
    if (emp?.full_name && typeof emp.full_name === "string") return emp.full_name;
    return "";
  };

  const employeesWithNames = useMemo(() => {
    return employees
      .map((i: any) => ({ id: i.id, name: getEmployeeName(i) }))
      .filter((i: any) => i.name && i.name.trim() !== "")
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [employees]);

  const uniquePeriods = useMemo(() => {
    const periods = new Set<string>();
    items.forEach((item: any) => {
      if (item.period) periods.add(item.period);
    });
    return Array.from(periods).sort().reverse();
  }, [items]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    statuses.add("draft");
    statuses.add("pending");
    statuses.add("approved");
    statuses.add("paid");
    items.forEach((item: any) => {
      if (item.status) statuses.add(item.status);
    });
    return Array.from(statuses).sort();
  }, [items]);

  // Filter, Sort, Paginate
  const filteredItems = useMemo(() => {
    let filtered = items;
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter((item: any) =>
        (item.employeeName && item.employeeName.toLowerCase().includes(search)) ||
        String(item.id).toLowerCase().includes(search) ||
        String(item.employee_id).toLowerCase().includes(search)
      );
    }
    if (selectedEmployeeId) {
      filtered = filtered.filter((item: any) => String(item.employee_id) === selectedEmployeeId);
    }
    if (selectedPeriod) {
      filtered = filtered.filter((item: any) => item.period === selectedPeriod);
    }
    if (selectedStatus) {
      filtered = filtered.filter((item: any) => item.status === selectedStatus);
    }
    return filtered;
  }, [items, searchText, selectedEmployeeId, selectedPeriod, selectedStatus]);

  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];
    sorted.sort((a: any, b: any) => {
      let compareA: any;
      let compareB: any;
      switch (sortBy) {
        case "employee":
          compareA = a.employeeName?.toLowerCase() || "";
          compareB = b.employeeName?.toLowerCase() || "";
          break;
        case "period":
          compareA = a.period || "";
          compareB = b.period || "";
          break;
        case "total":
          compareA = (Number(a.basic_salary) || 0) + (Number(a.allowance) || 0) + (Number(a.bonus) || 0);
          compareB = (Number(b.basic_salary) || 0) + (Number(b.allowance) || 0) + (Number(b.bonus) || 0);
          break;
        case "id":
        default:
          compareA = String(a.id || "");
          compareB = String(b.id || "");
      }
      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredItems, sortBy, sortOrder]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));

  useEffect(() => { setCurrentPage(1); }, [searchText, selectedEmployeeId, selectedPeriod, selectedStatus, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchText("");
    setSelectedEmployeeId("");
    setSelectedPeriod("");
    setSelectedStatus("");
    setSortBy("period");
    setSortOrder("desc");
  };

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [payrollData, employeeData] = await Promise.all([
        payrollService.getPayrollList(),
        getAllEmployees()
      ]);

      const safePayrollData = toSafeArray(payrollData).map(normalizePayroll);
      const safeEmployeeData = Array.isArray(employeeData) ? employeeData : toSafeArray(employeeData);

      setEmployees(safeEmployeeData);

      const enrichedPayroll = safePayrollData.map((payroll: any) => {
        const employee = safeEmployeeData.find(
          (emp: any) => String(emp.id) === String(payroll.employee_id)
        );
        return {
          ...payroll,
          employeeName: getEmployeeName(employee),
        };
      });

      setItems(enrichedPayroll);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load payroll data";
      setErrorMessage(errorMessage);
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => `Rp ${(value || 0).toLocaleString("id-ID")}`;

  const payrollSummaryCards = useMemo(() => [
    { label: "Total Payroll", subtitle: "Semua data payroll", value: String(items.length), change: "Seluruh data yang tersimpan", tone: "blue" as const, icon: Briefcase },
    { label: "Filtered Results", subtitle: "Hasil pencarian saat ini", value: String(sortedItems.length), change: `${paginatedItems.length} data di halaman ini`, tone: "green" as const, icon: Search },
    { label: "Unique Periods", subtitle: "Periode gaji yang tersedia", value: String(uniquePeriods.length), change: "Distribusi periode payroll", tone: "orange" as const, icon: Briefcase },
    { label: "Status Variants", subtitle: "Variasi status payroll", value: String(uniqueStatuses.length), change: "Tracking status pembayaran", tone: "purple" as const, icon: Briefcase },
  ], [items.length, sortedItems.length, paginatedItems.length, uniquePeriods.length, uniqueStatuses.length]);

  useEffect(() => { void loadData(); }, []);

  return (
    <div className="crud-page" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        size="md"
      >
        <div style={{ padding: "16px 0", whiteSpace: "pre-wrap" }}>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{errorModal.message}</p>
        </div>
      </Modal>

      {/* Header - Same style as Employees Page */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Briefcase size={16} />
              <span>Manajemen Payroll</span>
            </div>
            <h1 className="hero-title">Daftar Payroll</h1>
            <p className="hero-subtitle">
              Lihat dan kelola seluruh data payroll karyawan dalam tampilan yang rapi dan konsisten.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadData()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Sync Data
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="payroll-summary-wrapper">
        {payrollSummaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="payroll-summary-card">
              <div className="payroll-summary-header">
                <div>
                  <p className="payroll-summary-label">{card.label}</p>
                  <p className="payroll-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`payroll-summary-icon-wrapper payroll-icon-${card.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`payroll-summary-value payroll-value-${card.tone}`}>{card.value}</div>
              <p className="payroll-summary-trend">{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Data Table Card */}
      <Card className="data-table-card">
        <div className="data-table-header">
          <h3 className="data-table-title">
            Daftar Payroll
            <span className="data-table-count">{sortedItems.length} ditemukan</span>
          </h3>
        </div>

        <div className="control-bar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Cari nama karyawan, ID payroll, atau ID karyawan..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="quick-controls">
            <div className="control-group">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="sort-select">
                <option value="period">Urutkan: Periode</option>
                <option value="employee">Urutkan: Karyawan</option>
                <option value="total">Urutkan: Total</option>
                <option value="id">Urutkan: ID</option>
              </select>
              <button className="sort-order-btn" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                {sortOrder === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </button>
            </div>

            <button className={`filter-btn ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(!showFilters)}>
              <Filter size={18} />
              <span>Filter</span>
              <ChevronDown size={14} style={{ transform: showFilters ? "rotate(180deg)" : "", transition: "transform 0.3s ease" }} />
            </button>

            {(searchText || selectedEmployeeId || selectedPeriod || selectedStatus) && (
              <button className="btn-clear" onClick={clearFilters}>
                Bersihkan
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="filter-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Karyawan</label>
                <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} className="filter-select">
                  <option value="">Semua Karyawan ({employeesWithNames.length})</option>
                  {employeesWithNames.map((emp: any) => (
                    <option key={emp.id} value={String(emp.id)}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Periode</label>
                <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="filter-select">
                  <option value="">Semua Periode</option>
                  {uniquePeriods.map((period: string) => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Status</label>
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="filter-select">
                  <option value="">Semua Status</option>
                  {uniqueStatuses.map((status: string) => (
                    <option key={status} value={status}>
                      {status === "draft" && "Draft"}
                      {status === "pending" && "Menunggu"}
                      {status === "approved" && "Disetujui"}
                      {status === "paid" && "Sudah Dibayar"}
                      {status === "rejected" && "Ditolak"}
                      {!["draft", "pending", "approved", "paid", "rejected"].includes(status) &&
                        status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {loading && <LoadingState message="Memuat data payroll..." />}
        {errorMessage && (
          <ErrorState message="Gagal memuat data payroll" error={errorMessage} onRetry={loadData} />
        )}

        {!loading && !errorMessage && sortedItems.length === 0 && (
          <EmptyState
            icon=""
            title="Tidak ada data"
            message="Tidak ada payroll yang sesuai dengan filter yang dipilih"
            actionLabel={searchText || selectedEmployeeId || selectedPeriod || selectedStatus ? "Bersihkan Filter" : undefined}
            onAction={searchText || selectedEmployeeId || selectedPeriod || selectedStatus ? clearFilters : undefined}
          />
        )}

        {!loading && !errorMessage && sortedItems.length > 0 && (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID Payroll</th>
                    <th>Nama Karyawan</th>
                    <th>Periode</th>
                    <th className="th-right">Gaji Pokok</th>
                    <th className="th-right">Gaji Bersih</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item: any, index) => (
                    <tr key={`${item.id}-${index}`}>
                      <td className="crud-table-id">
                        <div>{item.id || "N/A"}</div>
                        <div className="crud-table-sub">EMP: {item.employee_id}</div>
                      </td>
                      <td className="crud-table-name">
                        <div className="crud-table-avatar">
                          {item.employeeName ? item.employeeName.charAt(0).toUpperCase() : String(item.employee_id || 'P').charAt(0).toUpperCase()}
                        </div>
                        <span>{item.employeeName || `ID: ${item.employee_id}`}</span>
                      </td>
                      <td><span className="crud-table-tag">{item.period || "-"}</span></td>
                      <td className="crud-table-amount">
                        {formatCurrency(item.basic_salary || 0)} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'normal' }}>Basic</span>
                      </td>
                      <td className="crud-table-amount crud-table-amount-green">
                        {formatCurrency(item.take_home_pay || item.net_salary || 0)} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'normal' }}>Net</span>
                      </td>
                      <td>
                        <PayrollStatusBadge status={item.status} size="md" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedItems.length > itemsPerPage && (
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="pagination-info">
                  Menampilkan {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, sortedItems.length)} dari {sortedItems.length}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
                  <PaginationWithSize
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) => setCurrentPage(p)}
                    totalItems={sortedItems.length}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
                    alignment="end"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default PayrollListPage;
