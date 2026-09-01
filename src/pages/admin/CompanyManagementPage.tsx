import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { showToast } from "@/shared/ui/toast";
import { companyService, type Company, type CompanyUserAccess } from "@/features/company/api/company.service";
import { getAllUsers } from "@/features/admin/api/admin.service";
import type { AdminUser } from "@/features/admin/types/admin.types";
import { useAuthStore } from "@/app/store/auth.store";
import { RBACUtils } from "@/shared/hooks/rbac";
import { PERMISSIONS } from "@/shared/types/rbac.types";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "./CompanyManagementPage.css";

const emptyCompany = {
  code: "",
  name: "",
  legal_name: "",
  tax_number: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "Indonesia",
  status: "active",
  timezone: "Asia/Jakarta",
  currency: "IDR",
};

const integrationStatus = [
  {
    title: "Company CRUD",
    status: "done",
    label: "Selesai",
    description: "Create, edit, deactivate, dan list company sudah terhubung penuh ke backend.",
  },
  {
    title: "Company switcher",
    status: "done",
    label: "Selesai",
    description: "Header dan sidebar sudah punya pilihan HO / semua company atau company spesifik.",
  },
  {
    title: "Employee list/create/detail/update/delete",
    status: "done",
    label: "Selesai",
    description: "Employee sudah mengikuti company aktif melalui X-Company-Id.",
  },
  {
    title: "Attendance utama",
    status: "done",
    label: "Selesai",
    description: "Attendance overview, history, dan reports utama membaca scope company.",
  },
  {
    title: "Leave utama",
    status: "done",
    label: "Selesai",
    description: "Leave request, approval, dan calendar terfilter per company.",
  },
  {
    title: "Reimbursement utama",
    status: "done",
    label: "Selesai",
    description: "Management dan approval reimbursement terfilter per company.",
  },
  {
    title: "Payroll utama",
    status: "done",
    label: "Selesai",
    description: "List, process, dan report payroll mengikuti company aktif.",
  },
  {
    title: "User access per company",
    status: "done",
    label: "Selesai",
    description: "Backend list/assign/remove access + tab User Access (scope_role, is_default) aktif penuh.",
  },
  {
    title: "Dashboard custom",
    status: "partial",
    label: "Sebagian",
    description: "Config dashboard custom sudah per config; widget data belum semuanya discope ulang.",
  },
  {
    title: "Reports analytics",
    status: "done",
    label: "Selesai",
    description: "Query analytics ReportingService (module + app) kini discope company aktif via X-Company-Id.",
  },
  {
    title: "Training, Assets, Overtime",
    status: "done",
    label: "Selesai",
    description: "Query list/detail/enroll/approve terfilter per company (asset & training via company_id, overtime via employee).",
  },
  {
    title: "Master data (department/position/location)",
    status: "partial",
    label: "Sebagian",
    description: "Index dan create sudah discope company (data global company_id=null tetap tampil); show/update/delete belum diguard silang.",
  },
  {
    title: "Approval detail security",
    status: "done",
    label: "Selesai",
    description: "Guard company diterapkan pada show/approve/reject/pay/bulk/export Leave, Reimbursement, Payroll, Overtime, Asset, Training, Promotion, Assignment Letter, KPI.",
  },
];

const auditStatus: Array<{
  feature: string;
  status: "done" | "partial" | "todo";
  label: string;
  frontend: string;
  backend: string;
  ux: string;
  risk: string;
  next: string;
  priority: string;
}> = [
  {
    feature: "Multi-company core (switcher & scope)",
    status: "done",
    label: "Selesai",
    frontend: "Switcher company di header + sidebar (HO/All/spesifik), X-Company-Id dikirim di tiap request, badge company di 20 halaman.",
    backend: "CompanyScopeService: canViewAll, availableCompanyIds, selectedCompanyId, applyEmployeeScope, applyThroughEmployee.",
    ux: "Switch company langsung merefetch data halaman; toast pending di sidebar/header.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Company CRUD & user access",
    status: "done",
    label: "Selesai",
    frontend: "Tab Company (CRUD + deactivate) dan tab User Access (assign/remove, scope_role, is_default) di halaman ini.",
    backend: "CRUD company + GET/POST/DELETE access; auto-assign creator (owner, default) saat create company.",
    ux: "Create Company langsung memberi akses ke pembuat.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Employee",
    status: "done",
    label: "Selesai",
    frontend: "List/create/detail/update/delete mengikuti company aktif.",
    backend: "Employee company_id discope via CompanyScopeService.",
    ux: "Data karyawan konsisten dengan company aktif.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Master data (Department/Position/Location)",
    status: "partial",
    label: "Sebagian",
    frontend: "Halaman master data tersedia dan mengikuti company aktif.",
    backend: "Index & store discope company; data global (company_id null) tetap tampil; show/update/delete belum diguard silang.",
    ux: "List berubah saat ganti company.",
    risk: "Sedang — update/delete bisa menyentuh data company lain via URL.",
    next: "Guard show/update/delete per record dengan CompanyScopeService; UI create/edit sudah mengirim company_id aktif.",
    priority: "Menengah",
  },
  {
    feature: "Attendance",
    status: "done",
    label: "Selesai",
    frontend: "Overview, history, dan reports per company.",
    backend: "Query attendance discope company_id.",
    ux: "Mengikuti company aktif.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Leave",
    status: "done",
    label: "Selesai",
    frontend: "Request, list, approval, calendar.",
    backend: "Index scoped; show/calendar/update/destroy/approve/reject diguard melalui relasi employee.",
    ux: "Approve/reject hanya menjangkau company aktif.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Overtime",
    status: "done",
    label: "Selesai",
    frontend: "Request, pending, approval, bukti (evidence).",
    backend: "Index/pending scoped via employee; approve/reject/evidence diguard. Catatan: tabel overtime_rules belum punya company_id (policy admin).",
    ux: "HR company hanya melihat & menyetujui overtime karyawan company-nya.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Payroll",
    status: "done",
    label: "Selesai",
    frontend: "Generate, process, slip, report, BCA KlikPay.",
    backend: "Index scoped; show/approve/pay/bulkPay/export/slip diguard company.",
    ux: "Slip & payout hanya company aktif.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Reimbursement",
    status: "done",
    label: "Selesai",
    frontend: "Submit, list, approval, mark paid, statistik.",
    backend: "Index scoped; show/destroy/approve/reject/markAsPaid/submit/byEmployee/statistics diguard.",
    ux: "Approve hanya company aktif.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Reports analytics",
    status: "done",
    label: "Selesai",
    frontend: "/reports/dashboard-summary dan report lain.",
    backend: "ReportingService & PeopleInsightService (module + app) discope selectedCompanyId; semua /api/reports/* + /api/insights/people; export payroll kini kirim X-Company-Id.",
    ux: "Angka report berubah mengikuti company aktif.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Dashboard Widgets",
    status: "partial",
    label: "Sebagian",
    frontend: "CustomDashboardPage + OverviewPage badge company; data widget diambil lewat endpoint modul yang sudah company-aware.",
    backend: "DashboardConfig scoped per user (user_id) + guard scope=all_companies; widget headcount/attendance/leave/payroll/reimbursement/kpi/training sudah scoped.",
    ux: "Preview widget mengikuti company aktif; angka tidak global.",
    risk: "Sedang — widget compliance_risk masih query global; overtime_rules belum punya company_id.",
    next: "Scope/sembunyikan widget compliance_risk hingga backend scoped; tambah company_id ke overtime_rules via migration.",
    priority: "Menengah",
  },
  {
    feature: "Training",
    status: "done",
    label: "Selesai",
    frontend: "Program, enrollments, approval, progres.",
    backend: "List/show/enroll via company_id; enrollment/approve via employee; store mengisi company_id.",
    ux: "Hanya program company aktif yang tampil.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Assets",
    status: "done",
    label: "Selesai",
    frontend: "Inventory, assignment, approval.",
    backend: "Asset via company_id; update() diguard; assignment via employee; assign hanya ke employee company aktif; store mengisi company_id.",
    ux: "Hanya asset company aktif yang tampil.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Performance — KPI",
    status: "done",
    label: "Selesai",
    frontend: "/kpis dengan form penilaian.",
    backend: "KpiController scoped via employee (index/byEmployee/show/update/destroy/approve) + guard store; kpis tanpa company_id (scope through employee).",
    ux: "Input & list KPI tersedia.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Dashboard custom",
    status: "partial",
    label: "Sebagian",
    frontend: "Konfigurasi dashboard per company.",
    backend: "Config dashboard discope per company; query widget belum semuanya discope ulang.",
    ux: "Widget bisa menampilkan angka global walaupun company aktif.",
    risk: "Sedang — angka widget tidak konsisten dengan company aktif.",
    next: "Scope ulang query widget CustomDashboardPage dengan X-Company-Id yang sama dengan halaman lain.",
    priority: "Menengah",
  },
  {
    feature: "Approval Guard (anti silang company)",
    status: "done",
    label: "Selesai",
    frontend: "Approve/reject + modal reason di semua approval UI.",
    backend: "show/approve/reject/pay/bulk/export diguard (applyThroughEmployee/applyEmployeeScope + canAccessEmployeeCompany) di Leave, Reimbursement, Payroll, Overtime, Asset, Training, Promotion, Assignment Letter, KPI.",
    ux: "Admin company tidak bisa akses/approve record company lain via URL.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Migration Fresh",
    status: "done",
    label: "Selesai",
    frontend: "—",
    backend: "migrate:fresh --force + db:seed --force diuji di SQLite terpisah: EXIT 0, semua seeder sukses (RBAC, Admin, User, Employee, ApprovalFlow, Leave, Reimbursement).",
    ux: "Instalasi baru aman; error lama interview_schedules.candidate_id tidak muncul.",
    risk: "Rendah — prod DB shared TIDAK di-touch (test memakai DB terpisah).",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Security Patrol",
    status: "done",
    label: "Selesai",
    frontend: "/patrol/scan dan /patrol/monitor.",
    backend: "Route patrol aktif.",
    ux: "Scan QR + monitoring patrol.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Notification, Email, Audit Log",
    status: "partial",
    label: "Sebagian",
    frontend: "Admin Notifications, Send Email, Email Logs, Audit Logs, Notification Settings.",
    backend: "Endpoint admin tersedia.",
    ux: "Halaman tersedia.",
    risk: "Sedang — pastikan data log/notification tetap aman per company.",
    next: "Pastikan query log/notification discope company aktif bila relevan.",
    priority: "Menengah",
  },
  {
    feature: "Approval Workflow (multi-step)",
    status: "done",
    label: "Selesai",
    frontend: "Approval Center (menu unik; duplikat di hapus dari Administration).",
    backend: "ApprovalFlowService berjalan multi-step sesuai role flow.",
    ux: "Satu akses masuk Approval Center.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "RBAC — permission source of truth",
    status: "done",
    label: "Selesai",
    frontend: "useRefreshUser kini membaca key effective_permissions (flat) untuk membangun user.permissions — hasPermission langsung akurat tanpa menunggu reload.",
    backend: "AuthController/me/login return effective_permissions dari resolveEffectivePermissions (super_admin → semua, lainnya → union roles[].permissions). config/rbac.php+Permissions::forRole jadi sumber seed defaults.",
    ux: "Refresh data (tanpa login ulang) langsung mencerminkan permission terbaru.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "RBAC — sidebar & menu permission filtering",
    status: "done",
    label: "Selesai",
    frontend: "menuFilter.fetchAllowedMenuKeys kini prioritas /user/menus (difilter permission) ∩ assignment /admin/menus → sidebar hanya menu yang diizinkan.",
    backend: "MenuController::userMenus dan /user/menu-tree membaca registry database.",
    ux: "Sidebar tidak lagi menampilkan menu yang user tidak punya permission.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "RBAC — route guards (MenuRouteGuard)",
    status: "done",
    label: "Selesai",
    frontend: "7 route sensitif tanpa guard kini di-wrap MenuRouteGuard: approval-flows, reimbursements (admin), kpis, competencies, leave/approval, leave/policy, leave/type. MenuRouteGuard punya fallback capability berbasis permission (approval_center→admin.approval_flow.manage, kpi→kpi.view, competency→competency.view, leave.policy→leave.policy.manage, leave.approve→leave.approve).",
    backend: "RoleMiddleware membaca route_permissions dari database + controller checks (defense in depth).",
    ux: "Direct URL ke halaman tanpa izin → ditolak frontend + backend 403.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "RBAC — admin action button gating",
    status: "done",
    label: "Selesai",
    frontend: "AdminUsersPage (Buat Akun→user.create/admin.user.create, Tetapkan Peran→user.assign_role) & AdminRolesPage (Tambah Peran→role.create, Ubah→role.update, Hapus→role.delete) kini digate; konstanta USER_CREATE/UPDATE/DELETE & ROLE_CREATE/UPDATE/DELETE ditambah ke rbac.types.",
    backend: "UserController/RoleController sudah guard per-action (user.create, user.assign_role, role.create/update/delete/assign_permission).",
    ux: "Tombol sensitif hanya tampil untuk yang punya permission; role lain melihat disabled.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "RBAC — authorization bypass fixed (backend)",
    status: "done",
    label: "Selesai",
    frontend: "—",
    backend: "Permissions::all() crash TASK dihapus (fatal memecah seeder); AuditLogController index/show kini diguard admin.audit.view/audit.logs.view; MenuController definitions/assignRole/removeRole kini diguard role.assign_permission/role.view.",
    ux: "Endpoint audit log & menu assignment tidak lagi bisa diakses user asal modal.",
    risk: "Rendah",
    next: "—",
    priority: "Selesai",
  },
  {
    feature: "Approval engine & action gating",
    status: "done",
    label: "Selesai",
    frontend: "Approval action di Leave/Reimbursement/Training/Overtime/KPI memakai permission + can_act; Payroll/Asset action digate permission dan handler defensive.",
    backend: "ApprovalFlowService kini guard anti self-approval, company scope record, flow berdasarkan company aktif, dan can_act tidak default true. Fallback approval Leave/Reimbursement/Overtime/Training/Payroll/KPI ikut guard.",
    ux: "Tombol approval/action hanya muncul saat user punya izin dan memang giliran action.",
    risk: "Rendah",
    next: "Testing manual multi-user lintas company.",
    priority: "Selesai",
  },
];

const uiAudit: Array<{
  feature: string;
  status: "good" | "polish" | "broken";
  label: string;
  issue: string;
  fixDone: string;
  remaining: string;
  priority: string;
}> = [
  {
    feature: "Auth",
    status: "good",
    label: "Good",
    issue: "Fokus password & link = biru (#1385ff / #1f6db8) berbeda dari tema tosca; duplikasi rule CSS.",
    fixDone: "Focus ring password & link-forgot diubah ke tosca; rule hover ganda dihapus.",
    remaining: "Normalisasi ikon size di halaman auth (14/16/18/20 → satu ukuran).",
    priority: "Rendah",
  },
  {
    feature: "Dashboard",
    status: "polish",
    label: "Needs polish",
    issue: "OverviewPage.css punya stylesheet duplikat (L334-726) ber-hex yang menimpa versi token; aksen ungu/indigo di KPI & chart.",
    fixDone: "Summary-card value → primary-dark (kontras AA); ikon/value purple → tosca; tunjukkan token global.",
    remaining: "Hapus blok CSS duplikat OverviewPage; ganti aksen ungu/indigo chart dengan token palette.",
    priority: "Menengah",
  },
  {
    feature: "Multi Company",
    status: "good",
    label: "Good",
    issue: "Switcher readable; badge company di halaman scoped.",
    fixDone: "Konsisten header+sidebar; toast company scope.",
    remaining: "Tambahkan CompanyScopeBadge ke halaman payroll yang belum punya (Dashboard, Payment, Approve, Generate, Details, ReportsDetailed, Tax).",
    priority: "Rendah",
  },
  {
    feature: "Organization",
    status: "polish",
    label: "Needs polish",
    issue: "Beberapa warna aksen masih biru/abu abu di CompanyManagementPage.css (palet sky-blue).",
    fixDone: "—",
    remaining: "Alihkan halaman ke token tosca / komponen shared summary-card; tampilkan hanya untuk admin.",
    priority: "Menengah",
  },
  {
    feature: "Employees",
    status: "polish",
    label: "Needs polish",
    issue: "Aksen ungu (#7c3aed) di EmployeesPage.css & ProfilesPage.css; beberapa empty/loading masih teks polos.",
    fixDone: "Summary/value accent diarahkan ke token global.",
    remaining: "Ganti aksen ungu per-file; formalisasi empty state ProfilesPage (masih 'Memuat...').",
    priority: "Rendah",
  },
  {
    feature: "Attendance",
    status: "polish",
    label: "Needs polish",
    issue: "Aksen ungu/indigo di AttendancePages/Shared, OvertimePage; CompanyScopeBadge hilang di beberapa halaman; AttendanceTodayPage kosong tanpa state.",
    fixDone: "Penormalan aksen via token global.",
    remaining: "Tambahkan DataStateDisplay saat data hari ini kosong; tambah CompanyScopeBadge.",
    priority: "Menengah",
  },
  {
    feature: "Leave",
    status: "good",
    label: "Good",
    issue: "Karakter rusak (mojibake) pada status dibatalkan; duplikasi rule CSS; background biru-tinted.",
    fixDone: "Hapus duplikat rule; perbaiki karakter; background → tint tosca.",
    remaining: "Tambah CompanyScopeBadge ke Create/Update/Balance; aksen ungu di LeaveTable/Approval.",
    priority: "Rendah",
  },
  {
    feature: "Payroll",
    status: "polish",
    label: "Needs polish",
    issue: "HTML tidak valid (div/span dalam <tr>) di PayrollApprovePage; hero title #0f172a di atas gradient gelap; aksen indigo/ungu luas; CompanyScopeBadge hilang.",
    fixDone: "Bungkus avatar+name dalam <td> (semantik valid); summary-card & aksen global tosca; badge dark-mode paid diperbaiki.",
    remaining: "Ganti #6366f1/#eff6ff/#8b5cf6 per-file; tambah CompanyScopeBadge; shared PayrollTable konsisten.",
    priority: "Menengah",
  },
  {
    feature: "Reimbursement",
    status: "polish",
    label: "Needs polish",
    issue: "Radius 24px (Reimbursement.css), status enum mentah, aksen ungu/azure, empty-state ikon kosong.",
    fixDone: "Arahkan aksen ke token tosca global.",
    remaining: "Normalisasi radius ≤8px; polish status jadi badge; tambah CompanyScopeBadge di halaman ESS.",
    priority: "Menengah",
  },
  {
    feature: "Performance/KPI",
    status: "polish",
    label: "Needs polish",
    issue: "Aksen ungu di MyKpiPage; ukuran ikon summary tidak seragam; CompanyScopeBadge hilang.",
    fixDone: "Arahkan aksen ke token tosca global.",
    remaining: "Normalisasi ikon; tambah CompanyScopeBadge di MyKpi.",
    priority: "Rendah",
  },
  {
    feature: "Training",
    status: "polish",
    label: "Needs polish",
    issue: "Aksen ungu/indigo di TrainingPrograms/Management/Enrollments; CompanyScopeBadge hilang; beberapa status raw.",
    fixDone: "Arahkan aksen ke token tosca global.",
    remaining: "Tambah CompanyScopeBadge; polish status enrollment jadi badge konsisten.",
    priority: "Menengah",
  },
  {
    feature: "Assets",
    status: "polish",
    label: "Needs polish",
    issue: "Aksen ungu di MyAssetsPage; kolom/badge status perlu konsistensi.",
    fixDone: "Arahkan aksen ke token tosca global.",
    remaining: "Normalisasi status badge asset; tambah CompanyScopeBadge di halaman ESS asset.",
    priority: "Rendah",
  },
  {
    feature: "Reports",
    status: "good",
    label: "Good",
    issue: "Empty-state tidak menyebut scope company.",
    fixDone: "Empty-state 6 halaman reports → 'Belum ada data untuk company aktif ini'; export payroll kirim X-Company-Id.",
    remaining: "Aksen ungu di chart report bila ada.",
    priority: "Rendah",
  },
  {
    feature: "Approval Center",
    status: "good",
    label: "Good",
    issue: "—",
    fixDone: "Menu unik (duplikat dihapus); flow approve/reject/return jelas.",
    remaining: "—",
    priority: "Rendah",
  },
  {
    feature: "Administration",
    status: "polish",
    label: "Needs polish",
    issue: "Aksen indigo di payroll generate/process; form-grid collapse (duplikat CSS); btn header hero dipaksa putih untuk semua varian.",
    fixDone: "form-grid kembali 2-kolom responsif; force putih dibatasi ke varian primary/secondary.",
    remaining: "Ganti aksen #6366f1/#eff6ff per-file admin/payroll.",
    priority: "Menengah",
  },
  {
    feature: "Security Patrol",
    status: "good",
    label: "Good",
    issue: "—",
    fixDone: "Menu scan + monitor berfungsi.",
    remaining: "Pastikan ikon konsisten.",
    priority: "Rendah",
  },
];

const CompanyManagementPage = () => {
  const user = useAuthStore((state) => state.user);
  const setCompanyContext = useAuthStore((state) => state.setCompanyContext);
  const canManage = RBACUtils.hasPermission(user, [
    PERMISSIONS.COMPANY_CREATE,
    PERMISSIONS.COMPANY_ASSIGN_USER,
    PERMISSIONS.ADMIN_COMPANY_UPDATE,
  ]);
  const canView = RBACUtils.hasPermission(user, [
    PERMISSIONS.COMPANY_VIEW,
    PERMISSIONS.COMPANY_VIEW_ALL,
    PERMISSIONS.ADMIN_COMPANY_VIEW,
  ]);
  const [tab, setTab] = useState<"company" | "access" | "next" | "ui">("company");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>(emptyCompany);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);

  // User Access state
  const [accessCompanyId, setAccessCompanyId] = useState<string>("");
  const [accesses, setAccesses] = useState<CompanyUserAccess[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersWarning, setUsersWarning] = useState("");
  const [accessLoading, setAccessLoading] = useState(false);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignScopeRole, setAssignScopeRole] = useState("member");
  const [assignIsDefault, setAssignIsDefault] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const selectedCompany = useMemo(() => companies.find((company) => company.id === selectedId), [companies, selectedId]);

  const loadCompanies = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const data = await companyService.list();
      setCompanies(data);
    } catch (error: any) {
      setLoadError(true);
      showToast(error.response?.data?.message || "Gagal memuat company", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersWarning("");
    try {
      const result = await getAllUsers(1, 500);
      setUsers(result.items ?? []);
    } catch (error: any) {
      setUsers([]);
      if (error?.response?.status === 403 || error?.response?.status === 404) {
        setUsersWarning("Butuh permission admin untuk memuat daftar user. Assign user bisa diisi manual jika endpoint user tersedia.");
      } else {
        setUsersWarning("Gagal memuat daftar user.");
      }
    }
  };

  const loadAccesses = async (companyId: string) => {
    if (!companyId) {
      setAccesses([]);
      return;
    }
    setAccessLoading(true);
    try {
      const result = await companyService.listUsers(Number(companyId));
      setAccesses(result.accesses ?? []);
    } catch (error: any) {
      setAccesses([]);
      showToast(error.response?.data?.message || "Gagal memuat akses user", "error");
    } finally {
      setAccessLoading(false);
    }
  };

  const refreshCompanyContext = async () => {
    try {
      const context = await companyService.context();
      setCompanyContext(context);
    } catch {
      // Abaikan — context akan di-refetch oleh header/sidebar saat reload.
    }
  };

  useEffect(() => {
    void loadCompanies();
  }, []);

  useEffect(() => {
    if (tab !== "access") return;
    void loadUsers();
  }, [tab]);

  useEffect(() => {
    if (tab !== "access") return;
    if (!accessCompanyId && companies.length > 0) {
      const defaultId = selectedId ?? companies[0]?.id;
      if (defaultId) {
        setAccessCompanyId(String(defaultId));
        return;
      }
    }
    if (accessCompanyId) {
      void loadAccesses(accessCompanyId);
    }
  }, [tab, accessCompanyId, companies, selectedId]);

  useEffect(() => {
    if (!selectedCompany) {
      setForm(emptyCompany);
      return;
    }
    setForm({
      code: selectedCompany.code ?? "",
      name: selectedCompany.name ?? "",
      legal_name: selectedCompany.legal_name ?? "",
      tax_number: selectedCompany.tax_number ?? "",
      email: selectedCompany.email ?? "",
      phone: selectedCompany.phone ?? "",
      address: selectedCompany.address ?? "",
      city: selectedCompany.city ?? "",
      country: selectedCompany.country ?? "Indonesia",
      status: selectedCompany.status ?? "active",
      timezone: selectedCompany.timezone ?? "Asia/Jakarta",
      currency: selectedCompany.currency ?? "IDR",
    });
  }, [selectedCompany]);

  const updateField = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveCompany = async () => {
    if (!form.name.trim()) {
      showToast("Nama company wajib diisi", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ""));
      if (selectedId) {
        await companyService.update(selectedId, payload);
        showToast("Company berhasil diperbarui", "success");
      } else {
        await companyService.create(payload);
        showToast("Company berhasil dibuat", "success");
      }
      setSelectedId(null);
      await loadCompanies();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Gagal menyimpan company", "error");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (company: Company) => {
    if (!window.confirm(`Deactivate company "${company.name}"?`)) return;
    try {
      await companyService.deactivate(company.id);
      showToast("Company dinonaktifkan", "success");
      await loadCompanies();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Gagal menonaktifkan company", "error");
    }
  };

  const assignAccess = async () => {
    if (!accessCompanyId) {
      showToast("Pilih company untuk assign user", "error");
      return;
    }
    if (!assignUserId) {
      showToast("Pilih user untuk di-assign", "error");
      return;
    }
    if (accesses.some((access) => access.user_id === Number(assignUserId))) {
      showToast("User sudah punya akses ke company ini", "info");
      return;
    }

    setAssigning(true);
    try {
      await companyService.assignUser(Number(accessCompanyId), {
        user_id: Number(assignUserId),
        scope_role: assignScopeRole || undefined,
        is_default: assignIsDefault,
      });
      showToast("Akses company berhasil diberikan", "success");
      setAssignUserId("");
      setAssignScopeRole("member");
      setAssignIsDefault(false);
      await loadAccesses(accessCompanyId);
      await refreshCompanyContext();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Gagal assign user", "error");
    } finally {
      setAssigning(false);
    }
  };

  const removeAccess = async (access: CompanyUserAccess) => {
    if (!accessCompanyId) return;
    const displayName = access.user?.name || `user #${access.user_id}`;
    if (!window.confirm(`Hapus akses "${displayName}" dari company ini?`)) return;
    try {
      await companyService.removeUser(Number(accessCompanyId), access.user_id);
      showToast("Akses user dihapus", "success");
      await loadAccesses(accessCompanyId);
      await refreshCompanyContext();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Gagal menghapus akses user", "error");
    }
  };

  if (!canView) {
    return (
      <div className="crud-page">
        <Card className="hero-card">
          <div className="hero-card-inner">
            <div className="hero-content">
              <div className="hero-badge"><ShieldCheck size={16} /><span>Company</span></div>
              <h1 className="hero-title">Akses Ditolak</h1>
              <p className="hero-subtitle">Anda tidak memiliki izin untuk melihat company.</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="crud-page company-management-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge"><Building2 size={16} /><span>Multi Company</span></div>
            <h1 className="hero-title">Company Management</h1>
            <p className="hero-subtitle">Kelola company, legal entity, akses user, dan status operasional untuk scope HRIS.</p>
          </div>
          <div className="hero-actions">
            <Button variant="outline" size="md" onClick={loadCompanies} disabled={loading}>
              <RefreshCw size={16} />
              Refresh
            </Button>
            {canManage && (
              <Button variant="primary" size="md" onClick={() => { setSelectedId(null); setTab("company"); }}>
                <Plus size={16} />
                Create Company
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="company-tabs">
        <button type="button" className={`company-tab ${tab === "company" ? "active" : ""}`} onClick={() => setTab("company")}>
          <Building2 size={16} />
          Company
        </button>
        <button type="button" className={`company-tab ${tab === "access" ? "active" : ""}`} onClick={() => setTab("access")}>
          <UserPlus size={16} />
          User Access
        </button>
        <button type="button" className={`company-tab ${tab === "next" ? "active" : ""}`} onClick={() => setTab("next")}>
          <ShieldCheck size={16} />
          Audit Status
        </button>
        <button type="button" className={`company-tab ${tab === "ui" ? "active" : ""}`} onClick={() => setTab("ui")}>
          <CheckCircle2 size={16} />
          UI/UX Audit
        </button>
      </div>

      {loadError && (
        <Card className="company-error-card">
          <AlertTriangle size={18} />
          <span>Gagal memuat daftar company. Pastikan koneksi ke backend tersedia, lalu tekan Refresh.</span>
        </Card>
      )}

      <Card className="company-audit-card">
        <div className="company-list-header">
          <div>
            <h2>Status Integrasi Multi Company</h2>
            <p className="company-audit-subtitle">Checklist real dari audit backend dan frontend saat ini.</p>
          </div>
          <span>{integrationStatus.filter((item) => item.status !== "done").length} belum final</span>
        </div>
        <div className="company-audit-grid">
          {integrationStatus.map((item) => {
            const Icon = item.status === "done" ? CheckCircle2 : item.status === "partial" ? Clock3 : AlertTriangle;
            return (
              <div className={`company-audit-item ${item.status}`} key={item.title}>
                <div className="company-audit-icon"><Icon size={18} /></div>
                <div>
                  <div className="company-audit-title">
                    <strong>{item.title}</strong>
                    <em>{item.label}</em>
                  </div>
                  <p>{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {tab === "company" && (
        <div className="company-grid">
          <Card className="company-list-card">
            <div className="company-list-header">
              <h2>Daftar Company</h2>
              <span>{companies.length} company</span>
            </div>
            <div className="company-list">
              {loading && <div className="company-empty">Memuat company...</div>}
              {!loading &&
                companies.map((company) => (
                  <button
                    className={`company-row ${selectedId === company.id ? "active" : ""}`}
                    key={company.id}
                    onClick={() => setSelectedId(company.id)}
                  >
                    <span>
                      <strong>{company.name}</strong>
                      <small>{company.code || "Tanpa kode"} · {company.city || "Kota belum diisi"}</small>
                    </span>
                    <em>{company.status || "active"}</em>
                  </button>
                ))}
              {!loading && companies.length === 0 && <div className="company-empty">Belum ada company. Buat company baru untuk mulai.</div>}
            </div>
          </Card>

          <Card className="company-form-card">
            <div className="company-list-header">
              <h2>{selectedId ? "Edit Company" : "Create Company"}</h2>
              {selectedCompany && <span>ID {selectedCompany.id}</span>}
            </div>
            <div className="company-form-grid">
              <label>Kode<input value={form.code} onChange={(event) => updateField("code", event.target.value)} /></label>
              <label>Nama Company<input value={form.name} onChange={(event) => updateField("name", event.target.value)} /></label>
              <label>Legal Name<input value={form.legal_name} onChange={(event) => updateField("legal_name", event.target.value)} /></label>
              <label>NPWP<input value={form.tax_number} onChange={(event) => updateField("tax_number", event.target.value)} /></label>
              <label>Email<input value={form.email} onChange={(event) => updateField("email", event.target.value)} /></label>
              <label>Telepon<input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} /></label>
              <label>Kota<input value={form.city} onChange={(event) => updateField("city", event.target.value)} /></label>
              <label>Negara<input value={form.country} onChange={(event) => updateField("country", event.target.value)} /></label>
              <label>Timezone<input value={form.timezone} onChange={(event) => updateField("timezone", event.target.value)} /></label>
              <label>Currency<input value={form.currency} onChange={(event) => updateField("currency", event.target.value)} /></label>
              <label>Status
                <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className="company-address">Alamat<textarea value={form.address} onChange={(event) => updateField("address", event.target.value)} /></label>
            </div>
            <div className="company-actions">
              {selectedCompany?.status !== "inactive" && selectedCompany && canManage && (
                <Button variant="outline" size="md" onClick={() => deactivate(selectedCompany)}>Deactivate</Button>
              )}
              {canManage && (
                <Button variant="primary" size="md" onClick={saveCompany} disabled={saving}>
                  <Save size={16} />
                  {saving ? "Menyimpan..." : "Save"}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === "access" && (
        <div className="company-access-grid">
          <Card className="company-access-card">
            <div className="company-list-header">
              <h2>Pilih Company</h2>
            </div>
            <select
              className="company-access-select"
              value={accessCompanyId}
              onChange={(event) => setAccessCompanyId(event.target.value)}
              aria-label="Pilih company untuk kelola akses user"
            >
              {companies.length === 0 && <option value="">Belum ada company</option>}
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}{company.code ? ` (${company.code})` : ""}
                </option>
              ))}
            </select>

            <div className="company-list-header" style={{ marginTop: 18 }}>
              <h2>User dengan Akses</h2>
              <span>{accesses.length} user</span>
            </div>
            <div className="company-access-list">
              {accessLoading && <div className="company-empty">Memuat akses user...</div>}
              {!accessLoading && !accessCompanyId && <div className="company-empty">Pilih company untuk melihat user access.</div>}
              {!accessLoading && accessCompanyId && accesses.length === 0 && (
                <div className="company-empty">Belum ada user yang punya akses company ini.</div>
              )}
              {!accessLoading &&
                accesses.map((access) => (
                  <div className="company-access-row" key={access.id}>
                    <div>
                      <strong>{access.user?.name || `User #${access.user_id}`}</strong>
                      <small>{access.user?.email || ""}</small>
                    </div>
                    <div className="company-access-meta">
                      {access.is_default && <em className="access-default">default</em>}
                      <em>{access.scope_role || "member"}</em>
                      {canManage && (
                        <button
                          type="button"
                          className="company-access-remove"
                          onClick={() => removeAccess(access)}
                          aria-label={`Hapus akses ${access.user?.name || "user"}`}
                          title="Hapus akses"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <Card className="company-access-card">
            <div className="company-list-header">
              <h2>Assign User ke Company</h2>
            </div>
            {!canManage && <p className="company-access-subtitle">Butuh permission company.assign_user untuk mengelola akses user.</p>}
            {usersWarning && <p className="company-access-warning">{usersWarning}</p>}
            <div className="company-access-form">
              <label>User
                <select value={assignUserId} onChange={(event) => setAssignUserId(event.target.value)} disabled={!canManage}>
                  <option value="">Pilih user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </label>
              <label>Scope Role
                <select value={assignScopeRole} onChange={(event) => setAssignScopeRole(event.target.value)} disabled={!canManage}>
                  <option value="member">member</option>
                  <option value="manager">manager</option>
                  <option value="owner">owner</option>
                </select>
              </label>
              <label className="company-access-check">
                <input
                  type="checkbox"
                  checked={assignIsDefault}
                  onChange={(event) => setAssignIsDefault(event.target.checked)}
                  disabled={!canManage}
                />
                Jadikan default company
              </label>
              <Button variant="primary" size="md" onClick={assignAccess} disabled={!canManage || assigning}>
                <UserPlus size={16} />
                {assigning ? "Assigning..." : "Assign User"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {tab === "next" && (
        <Card className="company-audit-table-card">
          <div className="company-list-header">
            <div>
              <h2>Audit Status HRIS</h2>
              <p className="company-audit-subtitle">
                Audit end-to-end seluruh fitur (frontend, backend, UX, risiko company-scope) per {new Date().toLocaleDateString("id-ID")}.
                Selesai: {auditStatus.filter((item) => item.status === "done").length} · Sebagian: {auditStatus.filter((item) => item.status === "partial").length} · Belum/rusak: {auditStatus.filter((item) => item.status === "todo").length}
              </p>
            </div>
          </div>
          <div className="company-audit-table-wrap">
            <table className="company-audit-table">
              <thead>
                <tr>
                  <th>Fitur</th>
                  <th>Status</th>
                  <th>Frontend</th>
                  <th>Backend</th>
                  <th>UX</th>
                  <th>Risiko</th>
                  <th>Next Action</th>
                  <th>Prioritas</th>
                </tr>
              </thead>
              <tbody>
                {auditStatus.map((item) => (
                  <tr className={`status-${item.status}`} key={item.feature}>
                    <td><strong>{item.feature}</strong></td>
                    <td><span className={`audit-badge ${item.status}`}>{item.label}</span></td>
                    <td>{item.frontend}</td>
                    <td>{item.backend}</td>
                    <td>{item.ux}</td>
                    <td>{item.risk}</td>
                    <td>{item.next}</td>
                    <td>
                      <span className={`audit-priority ${item.priority === "Tinggi" ? "high" : item.priority === "Menengah" ? "mid" : "low"}`}>
                        {item.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "ui" && (
        <Card className="company-audit-table-card">
          <div className="company-list-header">
            <div>
              <h2>UI/UX Audit Status</h2>
              <p className="company-audit-subtitle">
                Keputusan tema putih + tosca; status konsistensi UI/UX per modul per {new Date().toLocaleDateString("id-ID")}.
                Good: {uiAudit.filter((item) => item.status === "good").length} · Perlu polish: {uiAudit.filter((item) => item.status === "polish").length} · Rusak: {uiAudit.filter((item) => item.status === "broken").length}
              </p>
            </div>
          </div>
          <div className="company-audit-table-wrap">
            <table className="company-audit-table">
              <thead>
                <tr>
                  <th>Modul</th>
                  <th>UI Status</th>
                  <th>Masalah UX</th>
                  <th>Fix Sudah Dilakukan</th>
                  <th>Sisa Pekerjaan</th>
                  <th>Prioritas</th>
                </tr>
              </thead>
              <tbody>
                {uiAudit.map((item) => (
                  <tr className={`status-${item.status}`} key={item.feature}>
                    <td><strong>{item.feature}</strong></td>
                    <td><span className={`audit-badge ${item.status}`}>{item.label}</span></td>
                    <td>{item.issue}</td>
                    <td>{item.fixDone}</td>
                    <td>{item.remaining}</td>
                    <td>
                      <span className={`audit-priority ${item.priority === "Tinggi" || item.priority === "Tinggi (backend)" ? "high" : item.priority === "Menengah" ? "mid" : "low"}`}>
                        {item.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CompanyManagementPage;
