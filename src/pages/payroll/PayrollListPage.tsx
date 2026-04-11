import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { Search, Filter, ChevronDown } from "lucide-react";
import { getAllPayroll } from "@/features/payroll/api/payroll.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";
import { PayrollStatusBadge } from "@/shared/ui/PayrollStatusBadge";
import { LoadingState, ErrorState, EmptyState } from "@/shared/ui/DataStateDisplay";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import { useDataState } from "@/features/payroll/hooks/usePayrollState";
import "./PayrollListPage.css";

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
        getAllPayroll(),
        getAllEmployees(),
      ]);

      setEmployees(employeeData);

      // Enrich payroll with employee names
      const enrichedPayroll = payrollData.map((payroll: any) => {
        const employee = employeeData.find(
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

  // Helper function to get employee name safely
  const getEmployeeName = (emp: any): string => {
    if (emp?.user?.name && typeof emp.user.name === "string") {
      return emp.user.name;
    }
    if (emp?.name && typeof emp.name === "string") {
      return emp.name;
    }
    if (emp?.fullName && typeof emp.fullName === "string") {
      return emp.fullName;
    }
    if (emp?.full_name && typeof emp.full_name === "string") {
      return emp.full_name;
    }
    return "";
  };

  // For dropdown, filter out employees without names
  const employeesWithNames = useMemo(() => {
    return employees
      .map((emp: any) => ({
        id: emp.id,
        name: getEmployeeName(emp),
      }))
      .filter((emp) => emp.name && emp.name.trim() !== "")
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  // Get unique periods
  const uniquePeriods = useMemo(() => {
    const periods = new Set<string>();
    payrollState.data.forEach((item: any) => {
      if (item.period) periods.add(item.period);
    });
    return Array.from(periods).sort().reverse();
  }, [payrollState.data]);

  // Get unique statuses
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

  // Filter and search
  const filteredItems = useMemo(() => {
    let filtered = payrollState.data;

    // Search filter
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter((item: any) =>
        (item.employeeName && item.employeeName.toLowerCase().includes(search)) ||
        (String(item.id).toLowerCase().includes(search)) ||
        (String(item.employee_id).toLowerCase().includes(search))
      );
    }

    // Employee filter
    if (selectedEmployeeId) {
      filtered = filtered.filter(
        (item: any) => String(item.employee_id) === selectedEmployeeId
      );
    }

    // Period filter
    if (selectedPeriod) {
      filtered = filtered.filter((item: any) => item.period === selectedPeriod);
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter((item: any) => item.status === selectedStatus);
    }

    return filtered;
  }, [
    payrollState.data,
    searchText,
    selectedEmployeeId,
    selectedPeriod,
    selectedStatus,
  ]);

  // Sorting
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

  // Pagination
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, currentPage]);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedEmployeeId, selectedPeriod, selectedStatus, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchText("");
    setSelectedEmployeeId("");
    setSelectedPeriod("");
    setSelectedStatus("");
    setSortBy("period");
    setSortOrder("desc");
  };

  const formatCurrency = (value: number) => {
    return `Rp ${(value || 0).toLocaleString("id-ID")}`;
  };



  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div className="payroll-list-page">
      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        size="md"
      >
        <div style={{ padding: "16px 0", whiteSpace: "pre-wrap" }}>
          <p style={{ margin: 0, lineHeight: "1.6", color: "var(--color-text-primary)" }}>
            {errorModal.message}
          </p>
        </div>
      </Modal>

      {/* Header - Title Section */}
      <div className="payroll-list-header" style={{ borderBottom: "2px solid #2563eb", paddingBottom: "20px" }}>
        <div className="payroll-list-title">
          <h1 style={{ color: "#2563eb", marginBottom: "4px" }}>📊 Daftar Payroll</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Lihat dan kelola semua data payroll karyawan</p>
        </div>
        <div className="payroll-list-actions">
          <Button
            variant="outline"
            size="md"
            onClick={() => void loadData()}
            disabled={payrollState.isLoading}
            style={{ borderColor: "#2563eb", color: "#2563eb" }}
          >
            🔄 Segarkan
          </Button>
        </div>
      </div>



      {/* Search Bar - Compact Header */}
      <Card className="payroll-search-card" glass style={{ borderTop: "4px solid #2563eb" }}>
        <div className="payroll-control-bar">
          {/* Search Box */}
          <div className="payroll-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Cari nama karyawan, ID payroll, atau ID karyawan..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="payroll-search-input"
            />
          </div>

          {/* Quick Controls */}
          <div className="payroll-quick-controls">
            {/* Sort Dropdown */}
            <div className="control-group">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "id" | "employee" | "period" | "total")
                }
                className="payroll-sort-select"
              >
                <option value="period">Urutkan berdasarkan Periode</option>
                <option value="employee">Urutkan berdasarkan Karyawan</option>
                <option value="total">Urutkan berdasarkan Total</option>
                <option value="id">Urutkan berdasarkan ID</option>
              </select>
              <button
                className="payroll-sort-order-btn"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                title={sortOrder === "asc" ? "Naik" : "Turun"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>

            {/* Filter Button */}
            <button
              className={`payroll-filter-btn ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
              style={{ borderColor: "#2563eb", color: "#2563eb" }}
            >
              <Filter size={18} />
              <span>Filter</span>
              <ChevronDown
                size={14}
                style={{
                  transform: showFilters ? "rotate(180deg)" : "",
                  transition: "transform 0.3s ease",
                }}
              />
            </button>

            {/* Clear Filters Button */}
            {(searchText || selectedEmployeeId || selectedPeriod || selectedStatus) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="payroll-clear-btn"
                style={{ borderColor: "#2563eb", color: "#2563eb" }}
              >
                Bersihkan
              </Button>
            )}
          </div>
        </div>

        {/* Filter Panel - Collapsible */}
        {showFilters && (
          <div className="payroll-filter-panel">
            <div className="filter-row">
              {/* Employee Filter */}
              <div className="filter-group">
                <label style={{ color: "#2563eb", fontWeight: "600" }}>Karyawan</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="payroll-filter-select"
                >
                  <option value="">Semua Karyawan ({employeesWithNames.length})</option>
                  {employeesWithNames.map((emp: any) => (
                    <option key={emp.id} value={String(emp.id)}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Filter */}
              <div className="filter-group">
                <label style={{ color: "#2563eb", fontWeight: "600" }}>Periode</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="payroll-filter-select"
                >
                  <option value="">Semua Periode</option>
                  {uniquePeriods.map((period: string) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="filter-group">
                <label style={{ color: "#2563eb", fontWeight: "600" }}>Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="payroll-filter-select"
                >
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

        {/* Results Info */}
        <div className="payroll-results-info" style={{ color: "#2563eb", fontWeight: "600" }}>
          <span className="payroll-count">
            Menampilkan <strong>{paginatedItems.length}</strong> dari{" "}
            <strong>{sortedItems.length}</strong> data
            {payrollState.data.length > 0 && (
              <span className="payroll-total-items"> (Total: {payrollState.data.length})</span>
            )}
          </span>
        </div>
      </Card>

      {/* Table - Main Content */}
      <Card className="payroll-table-card" glass style={{ borderTop: "4px solid #2563eb" }}>
        {/* Loading State */}
        {payrollState.isLoading && (
          <LoadingState message="⏳ Memuat data payroll..." />
        )}

        {/* Error State */}
        {payrollState.isError && (
          <ErrorState
            message="Gagal memuat data payroll"
            error={payrollState.error || undefined}
            onRetry={loadData}
          />
        )}

        {/* Empty State */}
        {payrollState.isEmpty && (
          <EmptyState
            icon="📭"
            title="Tidak ada data"
            message="Tidak ada payroll yang sesuai dengan filter yang dipilih"
            actionLabel={
              searchText || selectedEmployeeId || selectedPeriod || selectedStatus
                ? "🔄 Bersihkan Filter"
                : undefined
            }
            onAction={
              searchText || selectedEmployeeId || selectedPeriod || selectedStatus
                ? clearFilters
                : undefined
            }
          />
        )}

        {/* Success State - Table */}
        {payrollState.isSuccess && paginatedItems.length > 0 && (
          <>
            <div className="payroll-table-wrap">
              <table className="payroll-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#dbeafe" }}>
                    <th style={{ padding: "12px", backgroundColor: "#dbeafe", color: "#2563eb", fontWeight: "600", textAlign: "left", borderBottom: "2px solid #2563eb" }}>ID Payroll</th>
                    <th style={{ padding: "12px", backgroundColor: "#dbeafe", color: "#2563eb", fontWeight: "600", textAlign: "left", borderBottom: "2px solid #2563eb" }}>Nama Karyawan</th>
                    <th style={{ padding: "12px", backgroundColor: "#dbeafe", color: "#2563eb", fontWeight: "600", textAlign: "left", borderBottom: "2px solid #2563eb" }}>Periode</th>
                    <th style={{ padding: "12px", backgroundColor: "#dbeafe", color: "#2563eb", fontWeight: "600", textAlign: "left", borderBottom: "2px solid #2563eb" }}>Gaji Pokok</th>
                    <th style={{ padding: "12px", backgroundColor: "#dbeafe", color: "#2563eb", fontWeight: "600", textAlign: "left", borderBottom: "2px solid #2563eb" }}>Gaji Bersih</th>
                    <th style={{ padding: "12px", backgroundColor: "#dbeafe", color: "#2563eb", fontWeight: "600", textAlign: "left", borderBottom: "2px solid #2563eb" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item: any, index) => (
                    <tr key={`${item.id}-${index}`} style={{ borderBottom: "1px solid #eff6ff" }}>
                      <td style={{ padding: "12px" }}>
                        <span className="payroll-id">{item.id || "-"}</span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span className="payroll-employee-name">
                          {item.employeeName || "-"}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span className="payroll-period">{item.period || "-"}</span>
                      </td>
                      <td className="payroll-amount" style={{ padding: "12px" }}>
                        {formatCurrency(item.basic_salary || 0)}
                      </td>
                      <td className="payroll-amount payroll-total" style={{ padding: "12px", fontWeight: "600", color: "#10b981" }}>
                        {formatCurrency(item.take_home_pay || item.net_salary || 0)}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <PayrollStatusBadge status={item.status} size="md" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="payroll-pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{ borderColor: "#2563eb", color: "#2563eb" }}
                >
                  ← Sebelumnya
                </Button>

                <div className="payroll-page-info" style={{ color: "#2563eb", fontWeight: "600" }}>
                  Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{ borderColor: "#2563eb", color: "#2563eb" }}
                >
                  Selanjutnya →
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default PayrollListPage;
