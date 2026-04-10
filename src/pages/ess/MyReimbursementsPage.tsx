import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import {
  createMyReimbursement,
  getMyReimbursements,
  submitMyReimbursement,
} from "@/features/ess/api/ess.service";
import type { GenericApiItem, MyReimbursementPayload } from "@/features/ess/types/ess.types";
import "./EssPages.css";

// 🔒 SECURITY: No default/demo data exposed
const DEFAULT_FORM: MyReimbursementPayload = {
  title: "",
  description: "",
  amount: 0,
  category: "",
  expense_date: new Date().toISOString().split('T')[0],
  receipt_path: "",
};

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: GenericApiItem[]) => {
  if (items.length === 0) {
    return ["id", "title", "amount", "status", "expense_date"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "title", "description", "amount", "category", "expense_date", "status"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const MyReimbursementsPage = () => {
  const [items, setItems] = useState<GenericApiItem[]>([]);
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call ESS reimbursements API");
  const [loading, setLoading] = useState(false);
  const [submitId, setSubmitId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState<MyReimbursementPayload>(DEFAULT_FORM);

  const columns = useMemo(() => getColumns(items), [items]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const loadItems = async (status?: string) => {
    setLoading(true);
    setStatusMessage(status ? `Memuat reimbursements status: ${status}` : "Memuat semua reimbursements...");
    setResponseText("");

    try {
      const result = await getMyReimbursements(status);
      setItems(result.items);
      formatResponse(result.raw);
      setStatusMessage("My reimbursements berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat my reimbursements.";
      formatResponse(message);
      setStatusMessage("Gagal memuat my reimbursements.");
    } finally {
      setLoading(false);
    }
  };

  const createItem = async () => {
    setLoading(true);
    setStatusMessage("Membuat reimbursement...");
    setResponseText("");

    try {
      const result = await createMyReimbursement(form);
      formatResponse(result.raw);
      setStatusMessage("My reimbursement berhasil dibuat.");
      await loadItems(filterStatus || undefined);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal membuat reimbursement.";
      formatResponse(message);
      setStatusMessage("Gagal membuat reimbursement.");
    } finally {
      setLoading(false);
    }
  };

  const submitItem = async () => {
    if (!submitId.trim()) {
      setStatusMessage("ID reimbursement wajib diisi untuk submit.");
      return;
    }

    setLoading(true);
    setStatusMessage("Submit reimbursement...");
    setResponseText("");

    try {
      const result = await submitMyReimbursement(submitId.trim());
      formatResponse(result.raw);
      setStatusMessage("My reimbursement berhasil disubmit.");
      await loadItems(filterStatus || undefined);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal submit reimbursement.";
      formatResponse(message);
      setStatusMessage("Gagal submit reimbursement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ess-page">
      <div className="ess-header">
        <div>
          <h1>My Reimbursements</h1>
          <p>Endpoint: list, filter status, create, dan submit reimbursement pribadi.</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadItems(filterStatus || undefined)} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="ess-card" glass>
        <h2>List & Filter</h2>
        <div className="ess-inline-actions">
          <input
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            placeholder="status (contoh: draft)"
            className="ess-input"
          />
          <Button variant="secondary" size="md" onClick={() => void loadItems(filterStatus || undefined)} disabled={loading}>
            Filter Status
          </Button>
          <Button variant="ghost" size="md" onClick={() => void loadItems()} disabled={loading}>
            Clear Filter
          </Button>
        </div>
      </Card>

      <Card className="ess-card" glass>
        <h2>Create My Reimbursement</h2>
        <div className="ess-form-grid">
          <label>
            Title
            <input
              className="ess-input"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />
          </label>
          <label>
            Description
            <input
              className="ess-input"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </label>
          <label>
            Amount
            <input
              className="ess-input"
              value={String(form.amount)}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, amount: Number(event.target.value) || 0 }))
              }
            />
          </label>
          <label>
            Category
            <input
              className="ess-input"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            />
          </label>
          <label>
            Expense Date
            <input
              className="ess-input"
              type="date"
              value={form.expense_date}
              onChange={(event) => setForm((prev) => ({ ...prev, expense_date: event.target.value }))}
            />
          </label>
          <label>
            Receipt Path
            <input
              className="ess-input"
              value={form.receipt_path}
              onChange={(event) => setForm((prev) => ({ ...prev, receipt_path: event.target.value }))}
            />
          </label>
        </div>
        <div className="ess-inline-actions">
          <Button variant="primary" size="md" onClick={() => void createItem()} disabled={loading}>
            Create Reimbursement
          </Button>
        </div>
      </Card>

      <Card className="ess-card" glass>
        <h2>Submit My Reimbursement</h2>
        <div className="ess-inline-actions">
          <input
            value={submitId}
            onChange={(event) => setSubmitId(event.target.value)}
            placeholder="reimbursement id"
            className="ess-input"
          />
          <Button variant="primary" size="md" onClick={() => void submitItem()} disabled={loading}>
            Submit Reimbursement
          </Button>
        </div>
      </Card>

      <Card className="ess-card" glass>
        <h2>Reimbursements Table</h2>
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
                  <td colSpan={columns.length}>No reimbursement data.</td>
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

export default MyReimbursementsPage;
