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
import {
  CheckCircle2,
  BarChart3,
  Clock3,
  CreditCard,
  FileText,
  LayoutDashboard,
  PencilLine,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
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
      showErrorModal("Error Load Dashboard", message);
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
      showErrorModal("Error Generate", errorText);
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
          <p style={{ margin: 0, lineHeight: "1.6", color: "var(--color-text-primary)" }}>
            {errorModal.message}
          </p>
        </div>
      </Modal>

      {/* Page Header */}
      <Card className="payroll-hero-card" glass>
        <div className="payroll-hero-copy">
          <p className="payroll-badge">Payroll Center</p>
          <h1 className="payroll-title">Dashboard Payroll</h1>
          <p className="payroll-subtitle">Kelola payroll, generate payroll bulanan, dan review payslip karyawan dengan tampilan yang rapi, konsisten, dan mudah dipindai.</p>
        </div>
        <div className="payroll-actions">
          <Button
            variant="outline"
            size="md"
            onClick={() => void loadPayrollData()}
            disabled={loading}
          >
            Segarkan
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => void handleGenerateMonthly()}
            disabled={loading}
          >
            Generate Bulanan
          </Button>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card className="payroll-error-card" glass>
          <p className="payroll-error-text">⚠️ {error}</p>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="metrics-grid payroll-kpi-grid">
        <Card className="metric-card payroll-kpi-card payroll-accent-blue" glass>
          <div className="metric-header kpi-header">
            <div>
              <span className="metric-label kpi-label">Total Payroll</span>
              <p className="metric-subtitle">Jumlah record payroll di sistem</p>
            </div>
            <span className="metric-icon kpi-icon"><FileText size={18} /></span>
          </div>
          <div className="metric-value kpi-value">{totalPayroll}</div>
          <div className="metric-change neutral kpi-subtext">
            <span>Data payroll terdaftar</span>
          </div>
        </Card>

        <Card className="metric-card payroll-kpi-card payroll-accent-green" glass>
          <div className="metric-header kpi-header">
            <div>
              <span className="metric-label kpi-label">Telah Diproses</span>
              <p className="metric-subtitle">Payroll dengan status paid/approved</p>
            </div>
            <span className="metric-icon kpi-icon"><CheckCircle2 size={18} /></span>
          </div>
          <div className="metric-value kpi-value">{totalProcessed}</div>
          <div className="metric-change positive kpi-subtext">
            <span>
              {totalPayroll > 0
                ? `${((totalProcessed / totalPayroll) * 100).toFixed(1)}%`
                : "0%"}{" "}
              selesai
            </span>
          </div>
        </Card>

        <Card className="metric-card payroll-kpi-card payroll-accent-orange" glass>
          <div className="metric-header kpi-header">
            <div>
              <span className="metric-label kpi-label">Menunggu</span>
              <p className="metric-subtitle">Payroll yang masih pending</p>
            </div>
            <span className="metric-icon kpi-icon"><Clock3 size={18} /></span>
          </div>
          <div className="metric-value kpi-value">{totalPending}</div>
          <div className="metric-change neutral kpi-subtext">
            <span>Menunggu persetujuan</span>
          </div>
        </Card>

        <Card className="metric-card payroll-kpi-card payroll-accent-purple" glass>
          <div className="metric-header kpi-header">
            <div>
              <span className="metric-label kpi-label">Rata-rata Bulanan</span>
              <p className="metric-subtitle">Estimasi volume payroll per bulan</p>
            </div>
            <span className="metric-icon kpi-icon"><TrendingUp size={18} /></span>
          </div>
          <div className="metric-value kpi-value">{averagePayroll}</div>
          <div className="metric-change neutral kpi-subtext">
            <span>Perkiraan rerata</span>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="payroll-charts-grid">
        {/* Monthly Trend Chart */}
        <Card className="chart-card payroll-chart-card payroll-accent-blue" glass>
          <h2 className="chart-title payroll-section-title">Tren Pemprosesan Payroll</h2>
          <p className="chart-subtitle">Perbandingan payroll diproses vs menunggu tiap periode</p>
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
        <Card className="chart-card payroll-chart-card payroll-accent-blue" glass>
          <h2 className="chart-title payroll-section-title">Ringkasan Status Payroll</h2>
          <p className="chart-subtitle">Distribusi status payroll saat ini</p>
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
      <Card className="chart-card payroll-full-width-chart payroll-accent-blue" glass>
        <h2 className="chart-title payroll-section-title">Payroll berdasarkan Departemen</h2>
        <p className="chart-subtitle">Akumulasi nilai payroll per kelompok departemen</p>
        {departmentPayrollData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentPayrollData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
              />
              <Bar dataKey="amount" fill="#2563eb" name="Total Payroll" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="chart-empty">Tidak ada data tersedia</p>
        )}
      </Card>

      {/* Top Employees by Compensation */}
      <Card className="chart-card payroll-full-width-chart payroll-accent-blue" glass>
        <h2 className="chart-title payroll-section-title">Top 10 Karyawan dengan Kompensasi Terbesar</h2>
        <p className="chart-subtitle">Ranking kompensasi berdasarkan tunjangan dan bonus</p>
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
      <Card className="chart-card payroll-quick-actions payroll-accent-blue" glass>
        <h2 className="chart-title payroll-section-title">Aksi Cepat</h2>
        <p className="chart-subtitle">Navigasi cepat ke modul payroll yang paling sering digunakan</p>
        <div className="payroll-action-links">
          <Link 
            to="/payroll/list" 
            className="action-link payroll-action-link payroll-accent-blue"
          >
            <span className="action-icon"><BarChart3 size={24} /></span>
            <div className="action-content">
              <h4>Daftar Payroll</h4>
              <p>Lihat semua data payroll</p>
            </div>
          </Link>

          <Link 
            to="/payroll/crud" 
            className="action-link payroll-action-link payroll-accent-green"
          >
            <span className="action-icon"><PencilLine size={24} /></span>
            <div className="action-content">
              <h4>Kelola Payroll</h4>
              <p>Buat, ubah, atau hapus payroll</p>
            </div>
          </Link>

          <Link 
            to="/payroll/approve" 
            className="action-link payroll-action-link payroll-accent-sky"
          >
            <span className="action-icon"><ShieldCheck size={24} /></span>
            <div className="action-content">
              <h4>Setujui Payroll</h4>
              <p>Review dan setujui payroll</p>
            </div>
          </Link>

          <Link 
            to="/payroll/payment" 
            className="action-link payroll-action-link payroll-accent-green"
          >
            <span className="action-icon"><CreditCard size={24} /></span>
            <div className="action-content">
              <h4>Pembayaran</h4>
              <p>Tandai payroll sebagai dibayar</p>
            </div>
          </Link>

          <Link 
            to="/payroll/component/allowance" 
            className="action-link payroll-action-link payroll-accent-orange"
          >
            <span className="action-icon"><ReceiptText size={24} /></span>
            <div className="action-content">
              <h4>Komponen Payroll</h4>
              <p>Kelola komponen gaji</p>
            </div>
          </Link>

          <Link 
            to="/payroll/details" 
            className="action-link payroll-action-link payroll-accent-purple"
          >
            <span className="action-icon"><LayoutDashboard size={24} /></span>
            <div className="action-content">
              <h4>Detail Komponen</h4>
              <p>Lihat detail komponen payroll</p>
            </div>
          </Link>
        </div>
      </Card>

      {/* Payroll List Table Preview */}
      {payrollItems.length > 0 && (
        <Card className="chart-card payroll-table-preview payroll-accent-blue" glass>
          <div className="payroll-table-header">
            <div className="payroll-table-head-copy">
              <h2 className="chart-title payroll-section-title">Catatan Payroll Terbaru</h2>
              <p className="chart-subtitle">Ringkasan 5 payroll terakhir yang masuk ke sistem</p>
            </div>
            <Link 
              to="/payroll/list" 
              className="view-all-link"
            >
              Lihat Semua →
            </Link>
          </div>
          <div className="payroll-table-wrap">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>ID Payroll</th>
                  <th>Nama Karyawan</th>
                  <th>Periode</th>
                  <th>Tunjangan</th>
                  <th>Bonus</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollItems.slice(0, 5).map((item: any, index) => {
                  const emp = employees.find((e: any) => e.id === item.employee_id);
                  const empName = emp ? getEmployeeName(emp) : "Unknown";
                  return (
                    <tr key={index}>
                      <td>{item.id || "-"}</td>
                      <td>{empName}</td>
                      <td>{item.period || "-"}</td>
                      <td>{formatCurrency(item.allowance || 0)}</td>
                      <td>{formatCurrency(item.bonus || 0)}</td>
                      <td>
                        <span className={`status-badge payroll-status-${item.status || "draft"}`}>
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
        <Card className="payroll-loading payroll-accent-blue" glass>
          <p>Memuat data payroll...</p>
        </Card>
      )}
    </div>
  );
};

export default PayrollDashboard;
