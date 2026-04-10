import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { getMyPayroll } from "@/features/ess/api/ess.service";
import type { GenericApiItem } from "@/features/ess/types/ess.types";
import "./EssPages.css";

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: GenericApiItem[]) => {
  if (items.length === 0) {
    return ["id", "period", "gross_salary", "net_salary", "status"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "period", "gross_salary", "net_salary", "status"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const MyPayrollPage = () => {
  const [items, setItems] = useState<GenericApiItem[]>([]);
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call my payroll API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const loadPayroll = async () => {
    setLoading(true);
    setStatusMessage("Memuat data payroll saya...");
    setResponseText("");

    try {
      const result = await getMyPayroll();
      setItems(result.items);
      formatResponse(result.raw);
      setStatusMessage("Data payroll saya berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat payroll saya.";
      formatResponse(message);
      setStatusMessage("Gagal memuat payroll saya.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ess-page">
      <div className="ess-header">
        <div>
          <h1>My Payroll</h1>
          <p>Endpoint: GET /api/my/payroll</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadPayroll()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="ess-card" glass>
        <h2>Payroll Table</h2>
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
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={String(item.id ?? index)}>
                    {columns.map((column) => (
                      <td key={`${String(item.id ?? index)}-${column}`}>{asDisplay(item[column])}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>No payroll data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="ess-card" glass>
        <h2>Raw Response</h2>
        <pre className="ess-response">{responseText || "Response API akan tampil di sini."}</pre>
        <p className="ess-status">{statusMessage}</p>
      </Card>
    </div>
  );
};

export default MyPayrollPage;
