import { useEffect, useState } from "react";
import { Card } from "@/shared/ui";
import { organizationService } from "@/features/organization/api/organization.service";
import { CheckCircle2, XCircle, Clock, User, Shield, Loader2, History } from "lucide-react";

interface ApprovalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: string;
  moduleId: number | string;
}

type HistoryItem = {
  id: number;
  step_order: number;
  role_id: number;
  user_id?: number;
  action: string;
  note?: string;
  acted_at: string;
  role?: { display_name?: string; name?: string };
  user?: { name?: string; email?: string };
};

export const ApprovalHistoryModal = ({ isOpen, onClose, module, moduleId }: ApprovalHistoryModalProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);

  useEffect(() => {
    if (isOpen && moduleId) {
      fetchHistory();
    }
  }, [isOpen, moduleId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await organizationService.getApprovalHistory(module, moduleId);
      const raw = Array.isArray(res) ? res : res?.data || [];
      setHistory(raw);
      if (res?.meta?.total_steps) {
        setTotalSteps(res.meta.total_steps);
      } else {
        const maxStep = raw.reduce((max: number, h: HistoryItem) => Math.max(max, h.step_order || 0), 0);
        setTotalSteps(maxStep);
      }
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const completedSteps = history.filter(h => h.action !== "pending").length;
  const currentStep = Math.min(completedSteps + 1, totalSteps);
  const effectiveTotal = totalSteps;

  const moduleLabels: Record<string, string> = {
    assignment_letter: "surat tugas",
    leave: "cuti",
    reimbursement: "penggantian biaya",
    overtime: "lembur",
    promotion: "promosi",
    training: "pelatihan",
    document: "dokumen",
    asset_assignment: "penugasan aset",
    shift_swap: "tukar giliran kerja",
    payroll: "penggajian",
    kpi: "KPI",
    benefit_assignment: "penugasan tunjangan",
  };

  const moduleLabel = moduleLabels[module] || module.replace(/_/g, " ");

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center",
        justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <Card
        glass
        style={{
          width: "90%", maxWidth: 520, padding: 0, overflow: "hidden",
          maxHeight: "80vh", display: "flex", flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "1.5rem", borderBottom: "1px solid #f1f5f9",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "#f5f3ff", borderRadius: 12, padding: "0.5rem" }}>
              <History size={24} color="#8b5cf6" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#1e293b", fontWeight: 700 }}>
                Riwayat Persetujuan
              </h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                {moduleLabel} #{moduleId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "1.2rem" }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "0 1.5rem", paddingTop: "1.25rem" }}>
          {!loading && history.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>
                  Progres: Tahap {currentStep} dari {effectiveTotal}
                </span>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  {Math.round((completedSteps / effectiveTotal) * 100)}%
                </span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${Math.round((completedSteps / effectiveTotal) * 100)}%`, height: "100%", background: "linear-gradient(90deg, #8b5cf6, #6366f1)", borderRadius: "3px", transition: "width 0.3s ease" }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "0 1.5rem 1.5rem", overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <Loader2 size={24} className="animate-spin" />
              <p style={{ color: "#94a3b8", marginTop: 8 }}>Memuat riwayat...</p>
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
              <p>Riwayat persetujuan tidak ditemukan.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {history.map((item, idx) => {
                const isPending = item.action === "pending";
                const isApproved = item.action === "approved";
                const isRejected = item.action === "rejected";

                return (
                  <div key={item.id || idx} style={{ display: "flex", gap: "16px" }}>
                    <div
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        width: "36px", flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: isApproved
                            ? "#dcfce7"
                            : isRejected
                            ? "#fef2f2"
                            : "#fef3c7",
                          border: `2px solid ${
                            isApproved ? "#86efac" : isRejected ? "#fca5a5" : "#fde68a"
                          }`,
                        }}
                      >
                        {isApproved ? (
                          <CheckCircle2 size={18} color="#16a34a" />
                        ) : isRejected ? (
                          <XCircle size={18} color="#dc2626" />
                        ) : (
                          <Clock size={18} color="#d97706" />
                        )}
                      </div>
                      {idx < history.length - 1 && (
                        <div
                          style={{
                            width: "2px", flex: 1, minHeight: "24px",
                            background: "#e2e8f0",
                          }}
                        />
                      )}
                    </div>

                    <div
                      style={{
                        flex: 1, paddingBottom: idx < history.length - 1 ? "20px" : 0,
                      }}
                    >
                      <div
                        style={{
                          background: "#f8fafc", borderRadius: 12, padding: "12px 16px",
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        <div
                          style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "center", marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px", fontWeight: 600, textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              color: isApproved
                                ? "#16a34a"
                                : isRejected
                                ? "#dc2626"
                                : "#d97706",
                            }}
                          >
                            {isPending ? "Menunggu Persetujuan" : isApproved ? "Disetujui" : "Ditolak"}
                          </span>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                            Tahap {item.step_order}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            fontSize: "13px", color: "#475569", marginBottom: 4,
                          }}
                        >
                          <Shield size={13} />
                          {item.role?.display_name || item.role?.name || `Peran #${item.role_id}`}
                        </div>

                        {item.user && (
                          <div
                            style={{
                              display: "flex", alignItems: "center", gap: "6px",
                              fontSize: "12px", color: "#64748b", marginBottom: 4,
                            }}
                          >
                            <User size={13} />
                            {item.user.name || item.user.email || `Pengguna #${item.user_id}`}
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            fontSize: "12px", color: "#94a3b8", marginTop: 4,
                          }}
                        >
                          <Clock size={12} />
                          {item.acted_at
                            ? new Date(item.acted_at).toLocaleString("id-ID", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </div>

                        {item.note && (
                          <div
                            style={{
                              marginTop: 8, padding: "8px 12px", background: "white",
                              borderRadius: 8, fontSize: "12px", color: "#64748b",
                              border: "1px solid #f1f5f9",
                            }}
                          >
                            {item.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
