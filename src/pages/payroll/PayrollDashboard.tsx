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
      <div className="payroll-header">
        <div>
          <h1>Payroll Management Dashboard</h1>
          <p>Kelola payroll, generate payroll bulanan, dan review payslip karyawan</p>
        </div>
        <div className="payroll-actions">
          <Button variant="outline" size="md" onClick={() => void loadPayrollData()} disabled={loading}>
            🔄 Refresh
          </Button>
          <Button variant="primary" size="md" onClick={() => void handleGenerateMonthly()} disabled={loading}>
            ➕ Generate Monthly
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
        <Card className="payroll-kpi-card" glass>
          <div className="kpi-header">
            <span className="kpi-label">Total Payroll</span>
            <span className="kpi-icon">📋</span>
          </div>
          <div className="kpi-value">{totalPayroll}</div>
          <div className="kpi-subtext">records in system</div>
        </Card>

        <Card className="payroll-kpi-card" glass>
          <div className="kpi-header">
            <span className="kpi-label">Processed</span>
            <span className="kpi-icon">✅</span>
          </div>
          <div className="kpi-value">{totalProcessed}</div>
          <div className="kpi-subtext">
            {totalPayroll > 0
              ? `${((totalProcessed / totalPayroll) * 100).toFixed(1)}%`
              : "0%"}{" "}
            completion
          </div>
        </Card>

        <Card className="payroll-kpi-card" glass>
          <div className="kpi-header">
            <span className="kpi-label">Pending</span>
            <span className="kpi-icon">⏳</span>
          </div>
          <div className="kpi-value">{totalPending}</div>
          <div className="kpi-subtext">waiting for approval</div>
        </Card>

        <Card className="payroll-kpi-card" glass>
          <div className="kpi-header">
            <span className="kpi-label">Avg per Month</span>
            <span className="kpi-icon">📊</span>
          </div>
          <div className="kpi-value">{averagePayroll}</div>
          <div className="kpi-subtext">estimated monthly</div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="payroll-charts-grid">
        {/* Monthly Trend Chart */}
        <Card className="payroll-chart-card" glass>
          <h3>Payroll Processing Trend</h3>
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
                  name="Processed"
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b22"
                  name="Pending"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-empty">No data available</p>
          )}
        </Card>

        {/* Payroll Status Breakdown */}
        <Card className="payroll-chart-card" glass>
          <h3>Payroll Status Breakdown</h3>
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
            <p className="chart-empty">No data available</p>
          )}
        </Card>
      </div>

      {/* Department Payroll Comparison */}
      <Card className="payroll-full-width-chart" glass>
        <h3>Payroll by Department</h3>
        {departmentPayrollData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentPayrollData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
              />
              <Bar dataKey="amount" fill="#3b82f6" name="Total Payroll" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="chart-empty">No data available</p>
        )}
      </Card>

      {/* Top Employees by Compensation */}
      <Card className="payroll-full-width-chart" glass>
        <h3>Top 10 Employees by Total Compensation</h3>
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
              <Bar dataKey="allowance" stackId="a" fill="#10b981" name="Allowance" />
              <Bar dataKey="bonus" stackId="a" fill="#f59e0b" name="Bonus" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="chart-empty">No data available</p>
        )}
      </Card>

      {/* Action Links */}
      <div className="payroll-quick-actions">
        <h3>Quick Actions</h3>
        <div className="payroll-action-links">
          <Link to="/payroll/list" className="action-link">
            <span className="action-icon">📊</span>
            <div className="action-content">
              <h4>Daftar Payroll</h4>
              <p>Lihat semua data payroll</p>
            </div>
          </Link>

          <Link to="/payroll/crud" className="action-link">
            <span className="action-icon">✏️</span>
            <div className="action-content">
              <h4>Kelola Payroll</h4>
              <p>Buat, ubah, atau hapus payroll</p>
            </div>
          </Link>

          <Link to="/payroll/generate" className="action-link">
            <span className="action-icon">🔄</span>
            <div className="action-content">
              <h4>Generate Bulanan</h4>
              <p>Generate payroll otomatis</p>
            </div>
          </Link>

          <Link to="/payroll/approve" className="action-link">
            <span className="action-icon">✅</span>
            <div className="action-content">
              <h4>Approve Payroll</h4>
              <p>Review dan setujui payroll</p>
            </div>
          </Link>

          <Link to="/payroll/payment" className="action-link">
            <span className="action-icon">💰</span>
            <div className="action-content">
              <h4>Pembayaran</h4>
              <p>Tandai payroll sebagai dibayar</p>
            </div>
          </Link>

          <Link to="/payroll/component/allowance" className="action-link">
            <span className="action-icon">💵</span>
            <div className="action-content">
              <h4>Komponen Tunjangan</h4>
              <p>Kelola komponen gaji</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Payroll List Table Preview */}
      {payrollItems.length > 0 && (
        <Card className="payroll-table-preview" glass>
          <div className="table-header">
            <h3>Recent Payroll Records</h3>
            <Link to="/payroll/list" className="view-all-link">
              View All →
            </Link>
          </div>
          <div className="payroll-table-wrap">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Payroll ID</th>
                  <th>Employee Name</th>
                  <th>Period</th>
                  <th>Allowance</th>
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
                        <span
                          className={`status-badge status-${
                            item.status || "draft"
                          }`}
                        >
                          {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Draft"}
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
        <Card className="payroll-loading" glass>
          <p>Loading payroll data...</p>
        </Card>
      )}
    </div>
  );
};

export default PayrollDashboard;
