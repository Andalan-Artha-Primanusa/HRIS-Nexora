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
} from "lucide-react";
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
    <div className="payroll-dashboard">
      <Card className="payroll-hero-card" glass>
        <div className="payroll-hero-copy">
          <p className="payroll-badge">Payroll Operations</p>
          <h1 className="payroll-title">Dashboard Penggajian</h1>
          <p className="payroll-subtitle">
            Pusat manajemen payroll perusahaan. Lacak tren, generate data bulanan, 
            dan kelola slip gaji karyawan secara efisien dalam satu dasbor terpadu.
          </p>
        </div>
        <div className="payroll-actions">
          <Button variant="ghost" size="md" onClick={() => void loadPayrollData()} disabled={loading}>
            <RefreshCw size={18} style={{ marginRight: "8px" }} />
            Segarkan
          </Button>
          <Button variant="primary" size="md" onClick={() => void handleGenerateMonthly()} disabled={loading}>
            Generate Payroll
          </Button>
        </div>
      </Card>

      <div className="payroll-kpi-grid">
        <Card className="payroll-kpi-card payroll-accent-blue" glass>
          <div className="kpi-header">
            <div>
              <span className="kpi-label">Total Record</span>
              <div className="kpi-value">{totalPayroll}</div>
            </div>
            <span className="kpi-icon"><FileText size={20} /></span>
          </div>
          <Badge variant="info">Seluruh Riwayat</Badge>
        </Card>

        <Card className="payroll-kpi-card payroll-accent-green" glass>
          <div className="kpi-header">
            <div>
              <span className="kpi-label">Selesai Diproses</span>
              <div className="kpi-value">{totalProcessed}</div>
            </div>
            <span className="kpi-icon"><CheckCircle2 size={20} /></span>
          </div>
          <Badge variant="success">
            {totalPayroll > 0 ? `${((totalProcessed / totalPayroll) * 100).toFixed(1)}%` : "0%"} Tuntas
          </Badge>
        </Card>

        <Card className="payroll-kpi-card payroll-accent-orange" glass>
          <div className="kpi-header">
            <div>
              <span className="kpi-label">Pending / Draft</span>
              <div className="kpi-value">{totalPending}</div>
            </div>
            <span className="kpi-icon"><Clock3 size={20} /></span>
          </div>
          <Badge variant="warning">Butuh Review</Badge>
        </Card>

        <Card className="payroll-kpi-card payroll-accent-purple" glass>
          <div className="kpi-header">
            <div>
              <span className="kpi-label">Rata-rata / Bulan</span>
              <div className="kpi-value">{averagePayroll}</div>
            </div>
            <span className="kpi-icon"><TrendingUp size={20} /></span>
          </div>
          <Badge variant="info">Estimasi Volume</Badge>
        </Card>
      </div>

      <div className="payroll-charts-grid">
        <Card className="payroll-chart-card" glass>
          <h2 className="payroll-section-title">Tren Pemrosesan</h2>
          <p className="chart-subtitle">Status payroll (Paid vs Pending) per periode</p>
          {monthlyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Area type="monotone" dataKey="processed" stackId="1" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProcessed)" name="Diproses" />
                <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorPending)" name="Menunggu" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Belum ada data periode</div>
          )}
        </Card>

        <Card className="payroll-chart-card" glass>
          <h2 className="payroll-section-title">Status Saat Ini</h2>
          <p className="chart-subtitle">Distribusi status dari semua catatan payroll</p>
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
      </div>

      <Card className="payroll-chart-card payroll-full-width-chart" glass>
        <h2 className="payroll-section-title">Distribusi Gaji per Departemen</h2>
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

      <Card className="payroll-quick-actions" glass>
        <h2 className="payroll-section-title">Aksi Cepat</h2>
        <p className="chart-subtitle">Akses langsung ke fungsi operasional payroll</p>
        <div className="payroll-action-links">
          {[
            { to: "/payroll/list", label: "Daftar Payroll", sub: "Lihat semua riwayat", icon: BarChart3, accent: "blue" },
            { to: "/payroll/crud", label: "Kelola Payroll", sub: "Update data manual", icon: PencilLine, accent: "green" },
            { to: "/payroll/approve", label: "Persetujuan", sub: "Review & approve", icon: ShieldCheck, accent: "sky" },
            { to: "/payroll/payment", label: "Pembayaran", sub: "Proses transaksi", icon: CreditCard, accent: "green" },
            { to: "/payroll/component/allowance", label: "Komponen Gaji", sub: "Atur tunjangan", icon: ReceiptText, accent: "orange" },
            { to: "/payroll/details", label: "Analitik Komponen", sub: "Detail variabel gaji", icon: LayoutDashboard, accent: "purple" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className={`payroll-action-link payroll-accent-${item.accent}`}>
                <span className="action-icon"><Icon size={24} /></span>
                <div className="action-content">
                  <h4>{item.label}</h4>
                  <p>{item.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      {payrollItems.length > 0 && (
        <Card className="payroll-table-preview" glass>
          <div className="payroll-table-header">
            <div>
              <h2 className="payroll-section-title">Catatan Terbaru</h2>
              <p className="chart-subtitle">Ringkasan entri payroll terakhir</p>
            </div>
            <Link to="/payroll/list" className="view-all-link">Lihat Semua →</Link>
          </div>
          <div className="ui-table-overflow">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Karyawan</th>
                  <th>Periode</th>
                  <th>Tunjangan</th>
                  <th>Bonus</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollItems.slice(0, 5).map((item: any, idx) => {
                  const emp = employees.find((e: any) => String(e.id) === String(item.employee_id));
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{emp ? getEmployeeName(emp) : `ID: ${item.employee_id}`}</td>
                      <td>{item.period || "-"}</td>
                      <td>{formatCurrency(item.allowance || 0)}</td>
                      <td>{formatCurrency(item.bonus || 0)}</td>
                      <td>
                        <span className={`status-badge payroll-status-${item.status?.toLowerCase() || "draft"}`}>
                          {item.status?.toUpperCase() || "DRAFT"}
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

      {loading && <div className="payroll-loading-overlay">Memproses data...</div>}
    </div>
  );
};

export default PayrollDashboard;
