import React from "react";
import type { PayrollStatus } from "@/features/payroll/types/payroll.types";
import "./PayrollStatusBadge.css";

interface PayrollStatusBadgeProps {
  status: PayrollStatus;
  size?: "sm" | "md" | "lg";
}

/**
 * Reusable status badge component for payroll items
 */
export const PayrollStatusBadge: React.FC<PayrollStatusBadgeProps> = ({ status, size = "md" }) => {
  const getStatusConfig = (
    s: PayrollStatus
  ): { label: string; className: string; icon: string } => {
    switch (s?.toLowerCase()) {
      case "draft":
        return { label: "Draft", className: "status-draft", icon: "📝" };
      case "pending":
        return { label: "Pending", className: "status-pending", icon: "⏳" };
      case "approved":
        return { label: "Approved", className: "status-approved", icon: "✅" };
      case "paid":
        return { label: "Paid", className: "status-paid", icon: "💰" };
      case "rejected":
        return { label: "Rejected", className: "status-rejected", icon: "❌" };
      default:
        return { label: "Unknown", className: "status-default", icon: "❓" };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`payroll-status-badge ${config.className} size-${size}`}>
      <span className="status-icon">{config.icon}</span>
      <span className="status-label">{config.label}</span>
    </span>
  );
};

export default PayrollStatusBadge;
