import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { ArrowDown, ArrowUp, Briefcase, ChevronDown, Filter, RefreshCw, Search, Download } from "lucide-react";
import { payrollService, toSafeArray } from "@/features/payroll/api/payroll.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";
import { PayrollStatusBadge } from "@/shared/ui/PayrollStatusBadge";
import { LoadingState, ErrorState, EmptyState } from "@/shared/ui/DataStateDisplay";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import { useDataState } from "@/features/payroll/hooks/usePayrollState";
import "@/shared/styles/CrudPage.css";

interface PayrollWithEmployeeName extends PayrollItem {
  employeeName?: string;
}

const PayrollListPage: React.FC = () => {
  const payrollState = useDataState<PayrollWithEmployeeName>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
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
  const itemsPerPage = 10;

  // Load data
  const loadData = async () => {
    payrollState.setLoading();

    try {
      const [payrollData, employeeData] = await Promise.all([
        payrollService.getPayrollList(),
        getAllEmployees(),
      ]);

      const safePayrollData = toSafeArray(payrollData);
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

      payrollState.setSuccess(enrichedPayroll);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load payroll data";
      payrollState.setError(errorMessage);
      console.error("Load error:", err);
    }
  };

  const getEmployeeName = (emp: any): string => {
    if (emp?.user?.name && typeof emp.user.name === "string") return emp.user.name;
    if (emp?.name && typeof emp.name === "string") return emp.name;
    if (emp?.fullName && typeof emp.fullName === "string") return emp.fullName;
    if (emp?.full_name && typeof emp.full_name === "string") return emp.full_name;
    return "";
  };

  const employeesWithNames = useMemo(() => {
    return employees
      .map((emp: any) => ({ id: emp.id, name: getEmployeeName(emp) }))
      .filter((emp) => emp.name && emp.name.trim() !== "")
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  const uniquePeriods = useMemo(() => {
    const periods = new Set<string>();
    payrollState.data.forEach((item: any) => {
      if (item.period) periods.add(item.period);
    });
    return Array.from(periods).sort().reverse();
  }, [payrollState.data]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    statuses.add("draft");
    statuses.add("pending");
    statuses.add("approved");
    statuses.add("paid");
    payrollState.data.forEach((item: any) => {
      if (item.status) statuses.add(item.status);
    });
    return Array.from(statuses).sort();
  }, [payrollState.data]);

  const filteredItems = useMemo(() => {
    let filtered = payrollState.data;
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
  }, [payrollState.data, searchText, selectedEmployeeId, selectedPeriod, selectedStatus]);

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
          compareA = (a.allowance || 0) + (a.bonus || 0);
          compareB = (b.allowance || 0) + (b.bonus || 0);
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
  }, [sortedItems, currentPage]);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchText, selectedEmployeeId, selectedPeriod, selectedStatus, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchText("");
    setSelectedEmployeeId("");
    setSelectedPeriod("");
    setSelectedStatus("");
    setSortBy("period");
    setSortOrder("desc");
  };

  const handleExportCSV = () => {
    if (sortedItems.length === 0) return;
    
    const headers = ["ID", "Employee", "Period", "Basic Salary", "Allowance", "Bonus", "Deduction", "Net Salary", "Status"];
    const rows = sortedItems.map((item: any) => [
      item.id,
      item.employeeName,
      item.period,
      item.basic_salary,
      item.allowance,
      item.bonus,
      item.total_deduction,
      item.take_home_pay || item.net_salary,
      item.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payroll_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (value: number) => `Rp ${(value || 0).toLocaleString("id-ID")}`;

  const payrollSummaryCards = useMemo(() => [
    { label: "Total Payroll", subtitle: "Semua data payroll", value: String(payrollState.data.length), change: "Seluruh data yang tersimpan", tone: "blue" as const, icon: Briefcase },
    { label: "Filtered Results", subtitle: "Hasil pencarian saat ini", value: String(sortedItems.length), change: `${paginatedItems.length} data di halaman ini`, tone: "green" as const, icon: Search },
    { label: "Unique Periods", subtitle: "Periode gaji yang tersedia", value: String(uniquePeriods.length), change: "Distribusi periode payroll", tone: "orange" as const, icon: Briefcase },
    { label: "Status Variants", subtitle: "Variasi status payroll", value: String(uniqueStatuses.length), change: "Tracking status pembayaran", tone: "purple" as const, icon: Briefcase },
  ], [payrollState.data.length, sortedItems.length, paginatedItems.length, uniquePeriods.length, uniqueStatuses.length]);

  useEffect(() => { void loadData(); }, []);

  return (
    <div className="crud-page">
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

      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Payroll Center</span>
          <h1>Daftar Payroll</h1>
          <p>Kelola data payroll karyawan dengan tampilan yang rapi, konsisten, dan mudah dipindai.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={handleExportCSV} disabled={sortedItems.length === 0} style={{ borderColor: "#10b981", color: "#10b981" }}>
            <Download size={16} />
            Ekspor CSV
          </Button>
          <Button variant="outline" size="md" onClick={() => void loadData()} disabled={payrollState.isLoading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} />
            Segarkan
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        {payrollSummaryCards.map((card) => {
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
          <h3>Data Payroll</h3>
          <span className="table-count">{paginatedItems.length} dari {sortedItems.length} data</span>
        </div>

        <div className="table-card-inner" style={{ paddingBottom: '1.5rem' }}>
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
        </div>

        {payrollState.isLoading && <div className="table-card-inner"><LoadingState message="Memuat data payroll..." /></div>}
        {payrollState.isError && (
          <div className="table-card-inner">
            <ErrorState message="Gagal memuat data payroll" error={payrollState.error || undefined} onRetry={loadData} />
          </div>
        )}
        {payrollState.isEmpty && (
          <div className="table-card-inner">
            <EmptyState
              icon=""
              title="Tidak ada data"
              message="Tidak ada payroll yang sesuai dengan filter yang dipilih"
              actionLabel={searchText || selectedEmployeeId || selectedPeriod || selectedStatus ? "Bersihkan Filter" : undefined}
              onAction={searchText || selectedEmployeeId || selectedPeriod || selectedStatus ? clearFilters : undefined}
            />
          </div>
        )}

        {payrollState.isSuccess && paginatedItems.length > 0 && (
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
                      <td>
                        <div className="cell-id">{item.id || "N/A"}</div>
                        <div className="cell-sub">EMP: {item.employee_id}</div>
                      </td>
                      <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {item.employeeName ? item.employeeName.charAt(0).toUpperCase() : String(item.employee_id || 'P').charAt(0).toUpperCase()}
                            </div>
                            <span className="cell-name-text">{item.employeeName || `ID: ${item.employee_id}`}</span>
                          </div>

                      </td>
                      <td><span className="cell-tag">{item.period || "-"}</span></td>

                      <td className="cell-amount" title="Gaji pokok sebelum tunjangan/potongan">
                        {formatCurrency(item.basic_salary || 0)} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'normal' }}>Basic</span>
                      </td>
                      <td className="cell-amount cell-amount-green" title="Gaji bersih setelah semua tunjangan & potongan">
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

            {totalPages > 1 && (
              <div className="pagination">
                <div className="pagination__info">
                  Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
                </div>
                <div className="pagination__controls">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
                    ← Prev
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
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

export default PayrollListPage;
