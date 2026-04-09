import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import {
  addPayrollDetailsBulk,
  bulkUpdatePayrollDetails,
  deletePayrollDetail,
  getPayrollDetails,
  updatePayrollDetailSingle,
} from "@/features/payroll/api/payroll.service";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import "../admin/AdminCrudPages.css";

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: PayrollItem[]) => {
  if (items.length === 0) {
    return ["id", "payroll_id", "type", "name", "amount"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "payroll_id", "type", "name", "amount"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const parseJson = <T,>(value: string): T => JSON.parse(value) as T;

const PayrollDetailsPage = () => {
  const location = useLocation();
  const defaultType = location.pathname.includes("/deduction") ? "deduction" : "allowance";

  const [items, setItems] = useState<PayrollItem[]>([]);
  const [payrollId, setPayrollId] = useState("1");
  const [detailId, setDetailId] = useState("");
  const [detailType, setDetailType] = useState(defaultType);
  const [detailName, setDetailName] = useState(defaultType === "deduction" ? "Tax" : "Housing Allowance");
  const [detailAmount, setDetailAmount] = useState(defaultType === "deduction" ? "500000" : "2000000");
  const [bulkDetailsText, setBulkDetailsText] = useState(
    JSON.stringify(
      [
        {
          type: defaultType,
          name: defaultType === "deduction" ? "Tax" : "Housing Allowance",
          amount: defaultType === "deduction" ? 500000 : 2000000,
        },
      ],
      null,
      2
    )
  );
  const [bulkUpdateText, setBulkUpdateText] = useState(
    JSON.stringify(
      [
        { id: 1, amount: 2500000 },
        { id: 2, amount: 600000 },
      ],
      null,
      2
    )
  );
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call payroll details API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const requirePayrollId = () => {
    const id = payrollId.trim();
    if (!id) {
      setStatusMessage("Payroll ID wajib diisi.");
      return null;
    }
    return id;
  };

  const requireDetailId = () => {
    const id = detailId.trim();
    if (!id) {
      setStatusMessage("Payroll Detail ID wajib diisi.");
      return null;
    }
    return id;
  };

  const loadPayrollDetails = async () => {
    const id = requirePayrollId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Memuat payroll details...");
    setResponseText("");

    try {
      const result = await getPayrollDetails(id);
      setItems(result.items);
      formatResponse(result.raw);
      setStatusMessage("Payroll details berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat payroll details.";
      formatResponse(message);
      setStatusMessage("Gagal memuat payroll details.");
    } finally {
      setLoading(false);
    }
  };

  const addBulk = async () => {
    const id = requirePayrollId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Menambah payroll details (bulk)...");
    setResponseText("");

    try {
      const details = parseJson<Array<{ type: string; name: string; amount: number }>>(bulkDetailsText);
      const result = await addPayrollDetailsBulk({
        payroll_id: Number(id) || 0,
        details,
      });
      formatResponse(result.raw);
      setStatusMessage("Payroll details bulk berhasil ditambahkan.");
      await loadPayrollDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menambah payroll details bulk.";
      formatResponse(message);
      setStatusMessage("Gagal menambah payroll details bulk.");
    } finally {
      setLoading(false);
    }
  };

  const updateSingle = async () => {
    const id = requireDetailId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Mengupdate payroll detail...");
    setResponseText("");

    try {
      const result = await updatePayrollDetailSingle(id, {
        type: detailType,
        name: detailName,
        amount: Number(detailAmount) || 0,
      });
      formatResponse(result.raw);
      setStatusMessage("Payroll detail berhasil diupdate.");
      await loadPayrollDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal update payroll detail.";
      formatResponse(message);
      setStatusMessage("Gagal update payroll detail.");
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdate = async () => {
    setLoading(true);
    setStatusMessage("Bulk update payroll details...");
    setResponseText("");

    try {
      const details = parseJson<Array<{ id: number; amount: number }>>(bulkUpdateText);
      const result = await bulkUpdatePayrollDetails({ details });
      formatResponse(result.raw);
      setStatusMessage("Bulk update payroll details berhasil.");
      await loadPayrollDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal bulk update payroll details.";
      formatResponse(message);
      setStatusMessage("Gagal bulk update payroll details.");
    } finally {
      setLoading(false);
    }
  };

  const deleteSingle = async () => {
    const id = requireDetailId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Menghapus payroll detail...");
    setResponseText("");

    try {
      const result = await deletePayrollDetail(id);
      formatResponse(result.raw);
      setStatusMessage("Payroll detail berhasil dihapus.");
      await loadPayrollDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menghapus payroll detail.";
      formatResponse(message);
      setStatusMessage("Gagal menghapus payroll detail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDetailType(defaultType);
    setDetailName(defaultType === "deduction" ? "Tax" : "Housing Allowance");
    setDetailAmount(defaultType === "deduction" ? "500000" : "2000000");
    setBulkDetailsText(
      JSON.stringify(
        [
          {
            type: defaultType,
            name: defaultType === "deduction" ? "Tax" : "Housing Allowance",
            amount: defaultType === "deduction" ? 500000 : 2000000,
          },
        ],
        null,
        2
      )
    );
  }, [defaultType]);

  useEffect(() => {
    void loadPayrollDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <h1>Payroll Details Management</h1>
          <p>Endpoint: /payroll-details/{"{payroll_id}"}, /payroll-details, /payroll-details/bulk-update</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadPayrollDetails()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="crud-card" glass>
        <h2>Lookup Payroll Details</h2>
        <div className="crud-form-grid">
          <label>
            Payroll ID
            <input
              className="crud-input"
              value={payrollId}
              onChange={(event) => setPayrollId(event.target.value)}
            />
          </label>
        </div>
        <div className="crud-actions">
          <Button variant="primary" size="md" onClick={() => void loadPayrollDetails()} disabled={loading}>
            Get Payroll Details
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Add Payroll Details (Bulk)</h2>
        <div className="crud-form-grid">
          <label className="crud-form-full">
            Details JSON Array
            <textarea value={bulkDetailsText} onChange={(event) => setBulkDetailsText(event.target.value)} />
          </label>
        </div>
        <p className="crud-note">Format: [{"{"} type, name, amount {"}"}]</p>
        <div className="crud-actions">
          <Button variant="primary" size="md" onClick={() => void addBulk()} disabled={loading}>
            Add Bulk Details
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Update/Delete Payroll Detail</h2>
        <div className="crud-form-grid">
          <label>
            Detail ID
            <input
              className="crud-input"
              value={detailId}
              onChange={(event) => setDetailId(event.target.value)}
              placeholder="detail id"
            />
          </label>
          <label>
            Type
            <input
              className="crud-input"
              value={detailType}
              onChange={(event) => setDetailType(event.target.value)}
            />
          </label>
          <label>
            Name
            <input
              className="crud-input"
              value={detailName}
              onChange={(event) => setDetailName(event.target.value)}
            />
          </label>
          <label>
            Amount
            <input
              className="crud-input"
              value={detailAmount}
              onChange={(event) => setDetailAmount(event.target.value)}
            />
          </label>
          <label className="crud-form-full">
            Bulk Update JSON Array
            <textarea value={bulkUpdateText} onChange={(event) => setBulkUpdateText(event.target.value)} />
          </label>
        </div>

        <p className="crud-note">Format: [{"{"} id, amount {"}"}]</p>

        <div className="crud-actions">
          <Button variant="secondary" size="md" onClick={() => void updateSingle()} disabled={loading}>
            Update Detail
          </Button>
          <Button variant="secondary" size="md" onClick={() => void bulkUpdate()} disabled={loading}>
            Bulk Update Details
          </Button>
          <Button variant="ghost" size="md" onClick={() => void deleteSingle()} disabled={loading}>
            Delete Detail
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Payroll Details Table</h2>
        <div className="crud-table-wrap">
          <table className="crud-table">
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
                  <td colSpan={columns.length}>No payroll detail data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Raw Response</h2>
        <pre className="crud-response">{responseText || "Response API akan tampil di sini."}</pre>
        <p className="crud-status">{statusMessage}</p>
      </Card>
    </div>
  );
};

export default PayrollDetailsPage;
