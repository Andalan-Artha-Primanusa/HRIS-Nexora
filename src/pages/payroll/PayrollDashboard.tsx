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
import { Badge } from "@/shared/ui/Badge";
import { payrollService, toSafeArray } from "@/features/payroll/api/payroll.service";
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
  RefreshCw,
  Wallet,
} from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "./PayrollDashboard.css";

const PayrollDashboard: React.FC = () => {
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);

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

    try {
      const [payrollData, employeeData] = await Promise.all([
        payrollService.getPayrollList(),
        getAllEmployees(),
      ]);

      const items = toSafeArray(payrollData);
      const emps = Array.isArray(employeeData) ? employeeData : toSafeArray(employeeData);
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
        processChartData(items);
      }
    } catch (err) {
      console.error("Error loading payroll:", err);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (items: PayrollItem[]) => {
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
      await payrollService.generateMonthlyPayroll(period);
      // Reload data
      await loadPayrollData();
    } catch (err) {
      console.error("Error generating payroll:", err);
    }
  };

  useEffect(() => {
    void loadPayrollData();
  }, []);

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#fff",
      border: "1px solid #dbeafe",
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(37, 99, 235, 0.1)",
    },
    labelStyle: { color: "#1e3a8a", fontWeight: "bold" as const },
  };

  return (
    <div className="crud-page">
      {/* Header - Same style as Dashboard */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Wallet size={16} />
              <span>Operasi Penggajian</span>
            </div>
            <h1 className="hero-title">Dashboard Penggajian</h1>
            <p className="hero-subtitle">
              Pusat manajemen payroll perusahaan. Lacak tren, generate data bulanan, 
              dan kelola slip gaji karyawan secara efisien dalam satu dasbor terpadu.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadPayrollData()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="leave-requests-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Total Record</p>
              <p className="leave-summary-subtitle">Seluruh riwayat payroll</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <FileText size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-blue">{totalPayroll}</div>
          <p className="leave-summary-trend">Seluruh Riwayat</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Selesai Diproses</p>
              <p className="leave-summary-subtitle">Status paid/approved</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-green">
              <CheckCircle2 size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-green">{totalProcessed}</div>
          <p className="leave-summary-trend">{totalPayroll > 0 ? `${((totalProcessed / totalPayroll) * 100).toFixed(1)}%` : "0%"} Tuntas</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Menunggu</p>
              <p className="leave-summary-subtitle">Status pending/draft</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-orange">
              <Clock3 size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-orange">{totalPending}</div>
          <p className="leave-summary-trend">Butuh Review</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Rata-rata / Bulan</p>
              <p className="leave-summary-subtitle">Estimasi volume</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-purple">
              <TrendingUp size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-purple">{averagePayroll}</div>
          <p className="leave-summary-trend">Estimasi Volume</p>
        </div>
      </div>

      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Tren Pemrosesan</h2>
            <p className="analytics-subtitle">Status payroll per periode</p>
          </div>
        </div>
      </Card>

<Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <ReceiptText size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Status Saat Ini</h2>
            <p className="analytics-subtitle">Distribusi status payroll</p>
          </div>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="payroll-charts-grid">
        <Card className="crud-table-card">
          {payrollStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={payrollStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" nameKey="name">
                  {payrollStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Belum ada data status</div>
          )}
        </Card>

        <Card className="crud-table-card">
          <h3 className="payroll-section-title">Distribusi Gaji per Departemen</h3>
          <p className="chart-subtitle">Total kompensasi (Tunjangan + Bonus) per departemen</p>
          {departmentPayrollData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={departmentPayrollData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `Rp ${v/1000000}jt`} />
                <Tooltip {...tooltipStyle} formatter={(v: any) => formatCurrency(Number(v))} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Total Payroll" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Data departemen tidak ditemukan</div>
          )}
        </Card>
      </div>

    </div>
  );
};

export default PayrollDashboard;
