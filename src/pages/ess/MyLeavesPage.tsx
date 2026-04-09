import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { getMyLeaveBalance, getMyLeaves } from "@/features/ess/api/ess.service";
import type { GenericApiItem } from "@/features/ess/types/ess.types";
import "./EssPages.css";

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: GenericApiItem[]) => {
  if (items.length === 0) {
    return ["id", "type", "start_date", "end_date", "status"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "type", "start_date", "end_date", "total_days", "status"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const MyLeavesPage = () => {
  const { pathname } = useLocation();
  const isBalanceRoute = pathname === "/leave/balance";

  const [leaves, setLeaves] = useState<GenericApiItem[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<Record<string, unknown> | null>(null);
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call my leaves API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(leaves), [leaves]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const loadLeaves = async () => {
    setLoading(true);
    setStatusMessage("Memuat data leave saya...");
    setResponseText("");

    try {
      const result = await getMyLeaves();
      setLeaves(result.items);
      formatResponse(result.raw);
      setStatusMessage("Data leave saya berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat leave saya.";
      formatResponse(message);
      setStatusMessage("Gagal memuat leave saya.");
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveBalance = async () => {
    setLoading(true);
    setStatusMessage("Memuat leave balance...");
    setResponseText("");

    try {
      const result = await getMyLeaveBalance();
      const balancePayload =
        result.payload && typeof result.payload === "object"
          ? (result.payload as Record<string, unknown>)
          : null;

      setLeaveBalance(balancePayload);
      formatResponse(result.raw);
      setStatusMessage("Leave balance berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat leave balance.";
      formatResponse(message);
      setStatusMessage("Gagal memuat leave balance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isBalanceRoute) {
      void loadLeaveBalance();
    } else {
      void loadLeaves();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBalanceRoute]);

  return (
    <div className="ess-page">
      <div className="ess-header">
        <div>
          <h1>{isBalanceRoute ? "My Leave Balance" : "My Leaves"}</h1>
          <p>
            {isBalanceRoute
              ? "Endpoint: GET /api/leaves/balance"
              : "Endpoint: GET /api/leaves/my"}
          </p>
        </div>
        <div className="ess-inline-actions">
          <Button variant="outline" size="md" onClick={() => void loadLeaves()} disabled={loading}>
            Refresh Leaves
          </Button>
          <Button variant="secondary" size="md" onClick={() => void loadLeaveBalance()} disabled={loading}>
            Refresh Balance
          </Button>
        </div>
      </div>

      {!isBalanceRoute && (
        <Card className="ess-card" glass>
          <h2>My Leaves Table</h2>
          <div className="ess-table-wrap">
            <table className="ess-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaves.length > 0 ? (
                  leaves.map((item, index) => (
                    <tr key={String(item.id ?? index)}>
                      {columns.map((column) => (
                        <td key={`${String(item.id ?? index)}-${column}`}>{asDisplay(item[column])}</td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length}>No leave data.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {isBalanceRoute && (
        <Card className="ess-card" glass>
          <h2>Leave Balance</h2>
          {leaveBalance ? (
            <div className="ess-balance-grid">
              {Object.entries(leaveBalance).map(([key, value]) => (
                <div className="ess-balance-item" key={key}>
                  <span>{key}</span>
                  <strong>{asDisplay(value)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="ess-empty">No leave balance data.</p>
          )}
        </Card>
      )}

      <Card className="ess-card" glass>
        <h2>Raw Response</h2>
        <pre className="ess-response">{responseText || "Response API akan tampil di sini."}</pre>
        <p className="ess-status">{statusMessage}</p>
      </Card>
    </div>
  );
};

export default MyLeavesPage;
