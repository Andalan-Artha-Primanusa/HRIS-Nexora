import React from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { LoadingState } from "@/shared/ui/DataStateDisplay";
import { Shield } from "lucide-react";
import { RBACUtils } from "@/shared/hooks/rbac";

interface MenuRouteGuardProps {
  menuKey: string;
  children: React.ReactNode;
}

/**
 * MenuRouteGuard Component
 * 
 * Pengaman rute berbasis source of truth dari backend. 
 * Otomatis memvalidasi ketersediaan menuKey di dalam allowedMenuKeys.
 */
export const MenuRouteGuard: React.FC<MenuRouteGuardProps> = ({ menuKey, children }) => {
  const user = useAuthStore((state) => state.user);
  const allowedMenuKeys = useAuthStore((state) => state.allowedMenuKeys);
  const menuKeysLoaded = useAuthStore((state) => state.menuKeysLoaded);

  // Loading state: keys belum selesai di-fetch
  if (!menuKeysLoaded) {
    return <LoadingState message="Memeriksa otorisasi..." />;
  }

  // Otorisasi berhasil jika menuKey eksplisit terdaftar,
  // atau merupakan sub-item dari menu induk yang diizinkan
  const hasExplicitMenu =
    allowedMenuKeys.includes(menuKey) ||
    allowedMenuKeys.some((key) => menuKey.startsWith(`${key}.`));
const hasEmployeeManagementCapability = RBACUtils.hasPermission(user, [
    "employee.create",
    "employee.update",
    "employee.delete",
    "employee.onboard",
    "employee.offboard",
    "admin.access",
  ]);
  const hasMenuPermissionCapability = RBACUtils.hasPermission(user, ["role.assign_permission", "role.view"]);
  const hasCapabilityFallback =
    (menuKey.startsWith("dashboard.custom") && RBACUtils.hasPermission(user, "dashboard.customize_self")) ||
    (menuKey.startsWith("workforce.employees") && RBACUtils.hasPermission(user, "employee.view")) ||
    (menuKey.startsWith("workforce.attendance.qr-generator") && RBACUtils.hasPermission(user, "attendance.qr.generate")) ||
    (menuKey.startsWith("workforce.patrol.scan") && RBACUtils.hasPermission(user, "patrol.scan")) ||
    (menuKey.startsWith("workforce.patrol.monitor") && RBACUtils.hasPermission(user, ["patrol.view", "patrol.manage", "patrol.report"])) ||
    (menuKey.startsWith("performance-dev.training") && RBACUtils.hasPermission(user, "training.view")) ||
    (menuKey.startsWith("admin.companies") && RBACUtils.hasPermission(user, ["company.view", "company.view_all"])) ||
    (menuKey.startsWith("admin.company") && RBACUtils.hasPermission(user, ["company.view", "admin.company.view"])) ||
    (menuKey.startsWith("admin.locations") && RBACUtils.hasPermission(user, "location.view")) ||
    (menuKey.startsWith("admin.work-schedules") && RBACUtils.hasPermission(user, "admin.schedule.manage")) ||
    (menuKey.startsWith("admin.users") && RBACUtils.hasPermission(user, ["user.view", "admin.user.view"])) ||
    (menuKey.startsWith("admin.roles") && RBACUtils.hasPermission(user, ["role.view", "admin.role.view"])) ||
    (menuKey.startsWith("admin.permissions") && RBACUtils.hasPermission(user, ["permission.view", "admin.permission.view"])) ||
    (menuKey.startsWith("admin.menu-permissions") && hasMenuPermissionCapability) ||
    (menuKey.startsWith("admin.audit-logs") && RBACUtils.hasPermission(user, ["audit.logs.view", "admin.audit.view"])) ||
    (menuKey.startsWith("admin.import") && RBACUtils.hasPermission(user, "admin.import.execute")) ||
    (menuKey.startsWith("admin.notifications") && RBACUtils.hasPermission(user, "admin.email.manage")) ||
    (menuKey.startsWith("admin.email-send") && RBACUtils.hasPermission(user, "admin.email.manage")) ||
    (menuKey.startsWith("admin.email-logs") && RBACUtils.hasPermission(user, "admin.email.manage")) ||
    (menuKey.startsWith("admin.notification-settings") && RBACUtils.hasPermission(user, "admin.email.manage")) ||
    (menuKey.startsWith("employee-dashboard") && RBACUtils.hasPermission(user, ["dashboard.customize_self", "attendance.view_own"])) ||
    (menuKey.startsWith("ess.profile") && RBACUtils.hasPermission(user, ["profile.update", "attendance.view_own"])) ||
    (menuKey.startsWith("ess.attendance.check-in") && RBACUtils.hasPermission(user, "attendance.check_in")) ||
    (menuKey.startsWith("ess.attendance.check-out") && RBACUtils.hasPermission(user, "attendance.check_out")) ||
    (menuKey.startsWith("ess.attendance.patrol") && RBACUtils.hasPermission(user, "patrol.scan")) ||
    (menuKey.startsWith("ess.attendance.history") && RBACUtils.hasPermission(user, "attendance.view_own")) ||
    (menuKey.startsWith("ess.leave") && RBACUtils.hasPermission(user, ["leave.view", "leave.create"])) ||
    (menuKey.startsWith("ess.overtime") && RBACUtils.hasPermission(user, ["overtime.view", "overtime.create"])) ||
    (menuKey.startsWith("ess.reimbursement") && RBACUtils.hasPermission(user, ["reimbursement.view", "reimbursement.create"])) ||
    (menuKey.startsWith("ess.payslip") && RBACUtils.hasPermission(user, ["payroll.view", "payroll.view_own"])) ||
    (menuKey.startsWith("ess.kpi") && RBACUtils.hasPermission(user, "kpi.view")) ||
    (menuKey.startsWith("ess.training") && RBACUtils.hasPermission(user, "training.view")) ||
    (menuKey.startsWith("ess.competency") && RBACUtils.hasPermission(user, "competency.view")) ||
    (menuKey.startsWith("ess.assets") && RBACUtils.hasPermission(user, "asset.view")) ||
    (menuKey.startsWith("ess.documents") && RBACUtils.hasPermission(user, "document.view")) ||
    (menuKey.startsWith("ess.dashboard.custom") && RBACUtils.hasPermission(user, "dashboard.customize_self")) ||
    (menuKey.startsWith("ess.notifications") && RBACUtils.hasPermission(user, "attendance.view_own")) ||
    (menuKey.startsWith("manajemen-cuti") && RBACUtils.hasPermission(user, ["leave.view", "leave.approve"])) ||
    (menuKey.startsWith("compensation.payroll") && RBACUtils.hasPermission(user, "payroll.view")) ||
    (menuKey.startsWith("compensation.reimbursement") && RBACUtils.hasPermission(user, ["reimbursement.view", "reimbursement.approve", "reimbursement.pay"])) ||
    (menuKey.startsWith("reimbursements") && RBACUtils.hasPermission(user, ["reimbursement.view", "reimbursement.approve", "reimbursement.pay"])) ||
    (menuKey.startsWith("laporan-analitik") && RBACUtils.hasPermission(user, "reporting.dashboard")) ||
    (menuKey.startsWith("penggajian") && RBACUtils.hasPermission(user, "payroll.view")) ||
    (menuKey.startsWith("employees") && hasEmployeeManagementCapability);
  const isEmployeeMenu = menuKey.startsWith("employees") || menuKey.startsWith("workforce.employees");
  const isAllowed = isEmployeeMenu
    ? hasEmployeeManagementCapability && (hasExplicitMenu || hasCapabilityFallback)
    : hasExplicitMenu || hasCapabilityFallback;

  if (!isAllowed) {
    return (
      <div className="crud-page" style={{ padding: "3rem 1rem", maxWidth: "700px", margin: "0 auto" }}>
        <Card
          style={{
            background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
            border: "1px solid #fecdd3",
            borderRadius: "16px",
            boxShadow: "0 10px 25px -5px rgba(225, 29, 72, 0.1)",
            color: "#9f1239",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "2.5rem 2rem", textAlign: "center" }}>
            <div
              style={{
                background: "#ffe4e6",
                borderRadius: "50%",
                display: "inline-flex",
                padding: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <Shield size={40} color="#e11d48" />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", color: "#881337" }}>
              Akses Menu Terbatas
            </h1>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.5, opacity: 0.9, marginBottom: "1.5rem" }}>
              Sistem otorisasi terpusat memblokir akses ke halaman ini. Kunci menu 
              <code style={{ background: "#fecdd3", padding: "0.2rem 0.5rem", borderRadius: "4px", margin: "0 0.3rem", fontWeight: 600 }}>
                {menuKey}
              </code> 
              tidak terdaftar dalam otorisasi sesi Anda.
            </p>
            <div style={{ fontSize: "0.85rem", color: "#be123c", borderTop: "1px solid #fecdd3", paddingTop: "1rem" }}>
              Silakan hubungi Administrator jika Anda memerlukan penugasan peran pada menu ini.
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default MenuRouteGuard;
