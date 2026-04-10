import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { getLeaveCalendar } from "@/features/leave/api/leave.service";
import type { LeaveItem } from "@/features/leave/types/leave.types";
import "./LeavePages.css";

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: LeaveItem[]) => {
  if (items.length === 0) {
    return ["date", "employee", "type", "status"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["date", "employee", "type", "start_date", "end_date", "status"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const LeaveCalendarPage = () => {
  const [items, setItems] = useState<LeaveItem[]>([]);
  const [summaryPayload, setSummaryPayload] = useState<Record<string, unknown> | null>(null);
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call leave calendar API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const loadCalendar = async () => {
    setLoading(true);
    setStatusMessage("Memuat leave calendar...");
    setResponseText("");

    try {
      const result = await getLeaveCalendar();
      setItems(result.items);

      const payload =
        result.payload && typeof result.payload === "object"
          ? (result.payload as Record<string, unknown>)
          : null;

      setSummaryPayload(payload);
      formatResponse(result.raw);
      setStatusMessage("Leave calendar berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat leave calendar.";
      formatResponse(message);
      setStatusMessage("Gagal memuat leave calendar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="leave-page">
      <div className="leave-header">
        <div>
          <h1>Leave Calendar</h1>
          <p>Endpoint: GET /api/leaves/calendar</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadCalendar()} disabled={loading}>
          Refresh Calendar
        </Button>
      </div>

      <Card className="leave-card" glass>
        <h2>Calendar Summary</h2>
        {summaryPayload ? (
          <div className="leave-summary-grid">
            {Object.entries(summaryPayload).map(([key, value]) => (
              <div className="leave-summary-item" key={key}>
                <span>{key}</span>
                <strong>{asDisplay(value)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="leave-empty">No calendar summary.</p>
        )}
      </Card>

      <Card className="leave-card" glass>
        <h2>Calendar Table</h2>
        <div className="leave-table-wrap">
          <table className="leave-table">
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
                  <tr key={String(item.id ?? item.date ?? index)}>
                    {columns.map((column) => (
                      <td key={`${String(item.id ?? index)}-${column}`}>{asDisplay(item[column])}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>No leave calendar data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="leave-card" glass>
        <h2>Raw Response</h2>
        <pre className="leave-response">{responseText || "Response API akan tampil di sini."}</pre>
        <p className="leave-status">{statusMessage}</p>
      </Card>
    </div>
  );
};

export default LeaveCalendarPage;
