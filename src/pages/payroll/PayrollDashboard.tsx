import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import {
  getAllPayroll,
  generateMonthlyPayroll,
} from "@/features/payroll/api/payroll.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import "./PayrollDashboard.css";

const PayrollDashboard: React.FC = () => {
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const showErrorModal = (title: string, message: string) => {
    setErrorModal({ isOpen: true, title, message });
  };

  // Chart Data States
  const [monthlyTrendData, setMonthlyTrendData] = useState<
    { month: string; totalPayroll: number; processed: number; pending: number }[]
  >([]);
  const [payrollStatusData, setPayrollStatusData] = useState<
    { name: string; value: number }[]
  >([]);
  const [departmentPayrollData, setDepartmentPayrollData] = useState<
    { name: string; amount: number }[]
  >([]);
  const [employeePayrollData, setEmployeePayrollData] = useState<
    { employee_id: string; employeeName: string; allowance: number; bonus: number; total: number }[]
  >([]);

  // KPI States
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [averagePayroll, setAveragePayroll] = useState(0);

  const chartColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

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

  // Load payroll data
  const loadPayrollData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [payrollData, employeeData] = await Promise.all([
        getAllPayroll(),
        getAllEmployees(),
      ]);

      const items = payrollData || [];
      const emps = employeeData || [];
      setPayrollItems(items);
      setEmployees(emps);

      // Calculate KPIs
      if (items.length > 0) {
        const total = items.length;
        const processed = items.filter((item: any) => item.status === "paid" || item.status === "approved").length;
        const pending = items.filter((item: any) => item.status === "pending" || !item.status).length;

        setTotalPayroll(total);
        setTotalProcessed(processed);
        setTotalPending(pending);
        setAveragePayroll(Math.round(total > 0 ? (total / 12) : 0)); // Rough estimate

        // Process data for charts
        processChartData(items, emps);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load payroll data";
      setError(message);
      showErrorModal("❌ Error Load Dashboard", message);
      console.error("Error loading payroll:", err);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (items: PayrollItem[], emps: EmployeeItem[]) => {
    // Group by month (assuming period field exists)
    const monthlyMap = new Map<
      string,
      { total: number; processed: number; pending: number }
    >();

    items.forEach((item: any) => {
      const month = item.period || "Unknown";
      const current = monthlyMap.get(month) || {
        total: 0,
        processed: 0,
        pending: 0,
      };

      current.total += 1;
      if (item.status === "paid" || item.status === "approved") {
        current.processed += 1;
      } else {
        current.pending += 1;
      }

      monthlyMap.set(month, current);
    });

    const monthlyArray = Array.from(monthlyMap, ([month, data]) => ({
      month,
      totalPayroll: data.total,
      processed: data.processed,
      pending: data.pending,
    }));

    setMonthlyTrendData(monthlyArray);

    // Status breakdown
    const statuses = new Map<string, number>();
    items.forEach((item: any) => {
      const status = item.status || "Draft";
      statuses.set(status, (statuses.get(status) || 0) + 1);
    });

    const statusArray = Array.from(statuses, ([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    setPayrollStatusData(statusArray);

    // Top employees by total compensation
    const employeeMap = new Map<
      string,
      { allowance: number; bonus: number }
    >();
    items.forEach((item: any) => {
      const empId = item.employee_id || "Unknown";
      const current = employeeMap.get(String(empId)) || {
        allowance: 0,
        bonus: 0,
      };

      current.allowance += item.allowance || 0;
      current.bonus += item.bonus || 0;

      employeeMap.set(String(empId), current);
    });

    const employeeArray = Array.from(
      employeeMap,
      ([employee_id, data]) => {
        const employee = emps.find((emp: any) => String(emp.id) === employee_id);
        const employeeName = getEmployeeName(employee);
        
        return {
          employee_id,
          employeeName: employeeName || employee_id,
          allowance: data.allowance,
          bonus: data.bonus,
          total: data.allowance + data.bonus,
        };
      }
    )
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10

    setEmployeePayrollData(employeeArray);

    // Department aggregation (simulated - would need actual department data from employees)
    const departmentMap = new Map<string, number>();
    items.forEach((item: any) => {
      // Placeholder: using first digit of employee ID as department proxy
      const dept = `Dept-${String(item.employee_id || "?")[0]}`;
      const amount = (item.allowance || 0) + (item.bonus || 0);
      departmentMap.set(dept, (departmentMap.get(dept) || 0) + amount);
    });

    const deptArray = Array.from(departmentMap, ([name, amount]) => ({
      name,
      amount,
    }));

    setDepartmentPayrollData(deptArray);
  };

  const handleGenerateMonthly = async () => {
    const period = new Date().toISOString().slice(0, 7); // YYYY-MM format

    try {
      await generateMonthlyPayroll({ period });
      // Reload data
      await loadPayrollData();
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "Failed to generate monthly payroll";
      console.error("Error generating payroll:", err);
      showErrorModal("❌ Error Generate", errorText);
    }
  };

  useEffect(() => {
    void loadPayrollData();
  }, []);

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  return (
    <div className="payroll-dashboard">
      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        size="md"
      >
        <div style={{ padding: "16px 0", whiteSpace: "pre-wrap" }}>
          <p style={{ margin: 0, lineHeight: "1.6", color: "#374151" }}>
            {errorModal.message}
          </p>
        </div>
      </Modal>

      {/* Page Header */}
      <div className="payroll-header" style={{ borderBottom: "2px solid #0284c7", paddingBottom: "20px", marginBottom: "24px" }}>
        <div>
          <h1 style={{ color: "#0284c7", marginBottom: "4px" }}>📊 Dashboard Payroll</h1>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>Kelola payroll, generate payroll bulanan, dan review payslip karyawan</p>
        </div>
        <div className="payroll-actions">
          <Button 
            variant="outline" 
            size="md" 
            onClick={() => void loadPayrollData()} 
            disabled={loading}
            style={{ borderColor: "#0284c7", color: "#0284c7" }}
          >
            🔄 Segarkan
          </Button>
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => void handleGenerateMonthly()} 
            disabled={loading}
            style={{ backgroundColor: "#10b981" }}
          >
            ➕ Generate Bulanan
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="payroll-error" glass>
          <p>⚠️ {error}</p>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="payroll-kpi-grid">
        <Card className="payroll-kpi-card" glass style={{ borderTop: "4px solid #0284c7" }}>
          <div className="kpi-header">
            <span className="kpi-label" style={{ color: "#0284c7", fontWeight: "600" }}>Total Payroll</span>
            <span className="kpi-icon">📋</span>
          </div>
          <div className="kpi-value" style={{ color: "#0284c7" }}>{totalPayroll}</div>
          <div className="kpi-subtext">records di sistem</div>
        </Card>

        <Card className="payroll-kpi-card" glass style={{ borderTop: "4px solid #10b981" }}>
          <div className="kpi-header">
            <span className="kpi-label" style={{ color: "#10b981", fontWeight: "600" }}>Telah Diproses</span>
            <span className="kpi-icon">✅</span>
          </div>
          <div className="kpi-value" style={{ color: "#10b981" }}>{totalProcessed}</div>
          <div className="kpi-subtext">
            {totalPayroll > 0
              ? `${((totalProcessed / totalPayroll) * 100).toFixed(1)}%`
              : "0%"}{" "}
            selesai
          </div>
        </Card>

        <Card className="payroll-kpi-card" glass style={{ borderTop: "4px solid #f59e0b" }}>
          <div className="kpi-header">
            <span className="kpi-label" style={{ color: "#f59e0b", fontWeight: "600" }}>Menunggu</span>
            <span className="kpi-icon">⏳</span>
          </div>
          <div className="kpi-value" style={{ color: "#f59e0b" }}>{totalPending}</div>
          <div className="kpi-subtext">menunggu persetujuan</div>
        </Card>

        <Card className="payroll-kpi-card" glass style={{ borderTop: "4px solid #8b5cf6" }}>
          <div className="kpi-header">
            <span className="kpi-label" style={{ color: "#8b5cf6", fontWeight: "600" }}>Rata-rata Bulanan</span>
            <span className="kpi-icon">📊</span>
          </div>
          <div className="kpi-value" style={{ color: "#8b5cf6" }}>{averagePayroll}</div>
          <div className="kpi-subtext">estimasi bulanan</div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="payroll-charts-grid">
        {/* Monthly Trend Chart */}
        <Card className="payroll-chart-card" glass style={{ borderTop: "4px solid #0284c7" }}>
          <h3 style={{ color: "#0284c7", marginTop: 0 }}>📈 Tren Pemprosesan Payroll</h3>
          {monthlyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="processed"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b98122"
                  name="Diproses"
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b22"
                  name="Menunggu"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-empty">Tidak ada data tersedia</p>
          )}
        </Card>

        {/* Payroll Status Breakdown */}
        <Card className="payroll-chart-card" glass style={{ borderTop: "4px solid #0284c7" }}>
          <h3 style={{ color: "#0284c7", marginTop: 0 }}>📊 Ringkasan Status Payroll</h3>
          {payrollStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={payrollStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {payrollStatusData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-empty">Tidak ada data tersedia</p>
          )}
        </Card>
      </div>

      {/* Department Payroll Comparison */}
      <Card className="payroll-full-width-chart" glass style={{ borderTop: "4px solid #0284c7" }}>
        <h3 style={{ color: "#0284c7", marginTop: 0 }}>🏢 Payroll berdasarkan Departemen</h3>
        {departmentPayrollData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentPayrollData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
              />
              <Bar dataKey="amount" fill="#0284c7" name="Total Payroll" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="chart-empty">Tidak ada data tersedia</p>
        )}
      </Card>

      {/* Top Employees by Compensation */}
      <Card className="payroll-full-width-chart" glass style={{ borderTop: "4px solid #0284c7" }}>
        <h3 style={{ color: "#0284c7", marginTop: 0 }}>🏆 Top 10 Karyawan dengan Kompensasi Terbesar</h3>
        {employeePayrollData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeePayrollData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="employeeName" type="category" width={150} />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
              />
              <Legend />
              <Bar dataKey="allowance" stackId="a" fill="#10b981" name="Tunjangan" />
              <Bar dataKey="bonus" stackId="a" fill="#f59e0b" name="Bonus" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="chart-empty">Tidak ada data tersedia</p>
        )}
      </Card>

      {/* Action Links */}
      <div className="payroll-quick-actions" style={{ marginTop: "32px" }}>
        <h3 style={{ color: "#0284c7", fontSize: "1.25rem", marginBottom: "20px" }}>⚡ Aksi Cepat</h3>
        <div className="payroll-action-links">
          <Link 
            to="/payroll/list" 
            className="action-link"
            style={{ borderTop: "4px solid #0284c7" }}
          >
            <span className="action-icon">📊</span>
            <div className="action-content">
              <h4 style={{ color: "#0284c7" }}>Daftar Payroll</h4>
              <p style={{ color: "#666" }}>Lihat semua data payroll</p>
            </div>
          </Link>

          <Link 
            to="/payroll/crud" 
            className="action-link"
            style={{ borderTop: "4px solid #10b981" }}
          >
            <span className="action-icon">✏️</span>
            <div className="action-content">
              <h4 style={{ color: "#10b981" }}>Kelola Payroll</h4>
              <p style={{ color: "#666" }}>Buat, ubah, atau hapus payroll</p>
            </div>
          </Link>

          <Link 
            to="/payroll/approve" 
            className="action-link"
            style={{ borderTop: "4px solid #0ea5e9" }}
          >
            <span className="action-icon">✅</span>
            <div className="action-content">
              <h4 style={{ color: "#0ea5e9" }}>Setujui Payroll</h4>
              <p style={{ color: "#666" }}>Review dan setujui payroll</p>
            </div>
          </Link>

          <Link 
            to="/payroll/payment" 
            className="action-link"
            style={{ borderTop: "4px solid #10b981" }}
          >
            <span className="action-icon">💳</span>
            <div className="action-content">
              <h4 style={{ color: "#10b981" }}>Pembayaran</h4>
              <p style={{ color: "#666" }}>Tandai payroll sebagai dibayar</p>
            </div>
          </Link>

          <Link 
            to="/payroll/component/allowance" 
            className="action-link"
            style={{ borderTop: "4px solid #f59e0b" }}
          >
            <span className="action-icon">📋</span>
            <div className="action-content">
              <h4 style={{ color: "#f59e0b" }}>Komponen Payroll</h4>
              <p style={{ color: "#666" }}>Kelola komponen gaji</p>
            </div>
          </Link>

          <Link 
            to="/payroll/details" 
            className="action-link"
            style={{ borderTop: "4px solid #8b5cf6" }}
          >
            <span className="action-icon">📊</span>
            <div className="action-content">
              <h4 style={{ color: "#8b5cf6" }}>Detail Komponen</h4>
              <p style={{ color: "#666" }}>Lihat detail komponen payroll</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Payroll List Table Preview */}
      {payrollItems.length > 0 && (
        <Card className="payroll-table-preview" glass style={{ borderTop: "4px solid #0284c7", marginTop: "32px" }}>
          <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ color: "#0284c7", margin: 0 }}>📋 Catatan Payroll Terbaru</h3>
            <Link 
              to="/payroll/list" 
              className="view-all-link"
              style={{ color: "#0284c7", textDecoration: "none", fontWeight: "500" }}
            >
              Lihat Semua →
            </Link>
          </div>
          <div className="payroll-table-wrap">
            <table className="payroll-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#e0f2fe" }}>
                  <th style={{ padding: "12px", backgroundColor: "#e0f2fe", color: "#0284c7", fontWeight: "600", textAlign: "left", borderBottom: "2px solid #0284c7" }}>ID Payroll</th>
                  <th style={{ padding: "12px", backgroundColor: "#e0f2fe", color: "#0284c7", fontWeight: "600", textAlign: "left", borderBottom: "2px solid #0284c7" }}>Nama Karyawan</th>
                  <th style={{ padding: "12px", backgroundColor: "#e0f2fe", color: "#0284c7", fontWeight: "600", textAlign: "left", borderBottom: "2px solid #0284c7" }}>Periode</th>
                  <th style={{ padding: "12px", backgroundColor: "#e0f2fe", color: "#0284c7", fontWeight: "600", textAlign: "left", borderBottom: "2px solid #0284c7" }}>Tunjangan</th>
                  <th style={{ padding: "12px", backgroundColor: "#e0f2fe", color: "#0284c7", fontWeight: "600", textAlign: "left", borderBottom: "2px solid #0284c7" }}>Bonus</th>
                  <th style={{ padding: "12px", backgroundColor: "#e0f2fe", color: "#0284c7", fontWeight: "600", textAlign: "left", borderBottom: "2px solid #0284c7" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollItems.slice(0, 5).map((item: any, index) => {
                  const emp = employees.find((e: any) => e.id === item.employee_id);
                  const empName = emp ? getEmployeeName(emp) : "Unknown";
                  return (
                    <tr 
                      key={index}
                      style={{ borderBottom: "1px solid #f0f9ff" }}
                    >
                      <td style={{ padding: "12px" }}>{item.id || "-"}</td>
                      <td style={{ padding: "12px" }}>{empName}</td>
                      <td style={{ padding: "12px" }}>{item.period || "-"}</td>
                      <td style={{ padding: "12px" }}>{formatCurrency(item.allowance || 0)}</td>
                      <td style={{ padding: "12px" }}>{formatCurrency(item.bonus || 0)}</td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "16px",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                            backgroundColor: 
                              item.status === "paid" ? "#d1fae5" :
                              item.status === "approved" ? "#dbeafe" :
                              item.status === "pending" ? "#fef3c7" :
                              item.status === "rejected" ? "#fee2e2" :
                              "#f3f4f6",
                            color:
                              item.status === "paid" ? "#065f46" :
                              item.status === "approved" ? "#0c4a6e" :
                              item.status === "pending" ? "#78350f" :
                              item.status === "rejected" ? "#7c2d12" :
                              "#374151"
                          }}
                        >
                          {item.status === "paid" && "Sudah Dibayar"}
                          {item.status === "approved" && "Disetujui"}
                          {item.status === "pending" && "Menunggu"}
                          {item.status === "rejected" && "Ditolak"}
                          {!["paid", "approved", "pending", "rejected"].includes(item.status) && (item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Draft")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {loading && (
        <Card className="payroll-loading" glass style={{ textAlign: "center", padding: "32px", borderTop: "4px solid #0284c7" }}>
          <p style={{ color: "#0284c7", fontWeight: "500" }}>⏳ Memuat data payroll...</p>
        </Card>
      )}
    </div>
  );
};

export default PayrollDashboard;
