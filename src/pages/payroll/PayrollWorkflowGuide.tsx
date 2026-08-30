import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  SlidersHorizontal,
  Zap,
} from "lucide-react";

import { Card } from "@/shared/ui/Card";
import "./PayrollShared.css";

const steps = [
  {
    title: "Cek komponen",
    description: "Pastikan gaji pokok, tunjangan, bonus, potongan, reimbursement, lembur, dan data bank sudah benar.",
    status: "Data master siap",
    icon: SlidersHorizontal,
  },
  {
    title: "Generate periode",
    description: "Buat batch payroll bulanan untuk semua karyawan aktif pada periode yang dipilih.",
    status: "Status draft",
    icon: Zap,
  },
  {
    title: "Approval manager",
    description: "Manager memeriksa nominal payroll, lalu meneruskan batch ke HR.",
    status: "Draft ke pending HR",
    icon: ShieldCheck,
  },
  {
    title: "Approval HR",
    description: "HR melakukan final check payroll sebelum data bisa diproses pembayaran.",
    status: "Pending HR ke approved",
    icon: CheckCircle2,
  },
  {
    title: "Bayar & export",
    description: "Tandai payroll approved sebagai paid, lalu export slip, summary, atau file bank.",
    status: "Approved ke paid",
    icon: CreditCard,
  },
];

const actions = [
  {
    label: "Mulai proses payroll",
    path: "/payroll/process/generate",
    icon: Zap,
    description: "Generate, approve, dan bayar payroll.",
  },
  {
    label: "Lihat daftar payroll",
    path: "/payroll/list",
    icon: FileText,
    description: "Audit status dan detail setiap payroll.",
  },
  {
    label: "Kelola komponen",
    path: "/payroll/component/allowance",
    icon: SlidersHorizontal,
    description: "Tambah allowance atau deduction payroll.",
  },
  {
    label: "Export laporan",
    path: "/payroll/reports",
    icon: FileSpreadsheet,
    description: "Unduh summary, slip, dan file pembayaran.",
  },
];

type PayrollWorkflowGuideProps = {
  compact?: boolean;
};

export const PayrollWorkflowGuide = ({ compact = false }: PayrollWorkflowGuideProps) => (
  <Card className={`payroll-workflow-card ${compact ? "payroll-workflow-card-compact" : ""}`}>
    <div className="payroll-workflow-header">
      <div>
        <p className="payroll-workflow-eyebrow">Alur end-to-end</p>
        <h2>Business process payroll</h2>
      </div>
      <div className="payroll-workflow-status">
        <CheckCircle2 size={16} />
        RBAC dan status berurutan
      </div>
    </div>

    <div className="payroll-workflow-steps">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div className="payroll-workflow-step" key={step.title}>
            <div className="payroll-workflow-step-icon">
              <Icon size={18} />
              <span>{index + 1}</span>
            </div>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <strong>{step.status}</strong>
            </div>
          </div>
        );
      })}
    </div>

    {!compact && (
      <div className="payroll-workflow-actions">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link to={action.path} className="payroll-workflow-action" key={action.path}>
              <Icon size={18} />
              <span>
                <strong>{action.label}</strong>
                <small>{action.description}</small>
              </span>
              <ArrowRight size={16} />
            </Link>
          );
        })}
      </div>
    )}
  </Card>
);

export default PayrollWorkflowGuide;
