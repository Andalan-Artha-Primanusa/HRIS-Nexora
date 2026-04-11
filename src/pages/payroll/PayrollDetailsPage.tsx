import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
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
  const [statusMessage, setStatusMessage] = useState("Ready to call payroll details API");
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const showErrorModal = (title: string, message: string) => {
    setErrorModal({ isOpen: true, title, message });
  };

  const columns = useMemo(() => getColumns(items), [items]);

  const requirePayrollId = () => {
    const id = payrollId.trim();
    if (!id) {
      return null;
    }
    return id;
  };

  const requireDetailId = () => {
    const id = detailId.trim();
    if (!id) {
      return null;
    }
    return id;
  };

  const loadPayrollDetails = async () => {
    const id = requirePayrollId();
    if (!id) {
      showErrorModal("Validasi", "Masukkan Payroll ID terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      const result = await getPayrollDetails(id);
      setItems(result);
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal memuat detail";
      showErrorModal("❌ Error Muat Detail", errorText);
    } finally {
      setLoading(false);
    }
  };

  const addBulk = async () => {
    const id = requirePayrollId();
    if (!id) {
      showErrorModal("Validasi", "Masukkan Payroll ID terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      const details = parseJson<Array<{ type: string; name: string; amount: number }>>(bulkDetailsText);
      await addPayrollDetailsBulk({
        payroll_id: Number(id) || 0,
        details,
      });
      setStatusMessage("✓ Detail berhasil ditambahkan");
      await loadPayrollDetails();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal tambah detail";
      showErrorModal("❌ Error Tambah Detail", errorText);
    } finally {
      setLoading(false);
    }
  };

  const updateSingle = async () => {
    const id = requireDetailId();
    if (!id) {
      showErrorModal("Validasi", "Masukkan Detail ID terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      await updatePayrollDetailSingle(id, {
        type: detailType,
        name: detailName,
        amount: Number(detailAmount) || 0,
      });
      setStatusMessage("✓ Detail berhasil diupdate");
      await loadPayrollDetails();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal update detail";
      showErrorModal("❌ Error Update Detail", errorText);
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdate = async () => {
    setLoading(true);

    try {
      const details = parseJson<Array<{ id: number; amount: number }>>(bulkUpdateText);
      await bulkUpdatePayrollDetails({ details });
      setStatusMessage("✓ Detail berhasil di-update");
      await loadPayrollDetails();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal bulk update";
      showErrorModal("❌ Error Bulk Update", errorText);
    } finally {
      setLoading(false);
    }
  };

  const deleteSingle = async () => {
    const id = requireDetailId();
    if (!id) {
      showErrorModal("Validasi", "Masukkan Detail ID terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      await deletePayrollDetail(id);
      setStatusMessage("✓ Detail berhasil dihapus");
      await loadPayrollDetails();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal hapus detail";
      showErrorModal("❌ Error Hapus Detail", errorText);
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
      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        size="md"
      >
        <div style={{ padding: "16px 0", whiteSpace: "pre-wrap" }}>
          <p style={{ margin: 0, lineHeight: "1.6", color: "#374151" }}>
            {errorModal.message}
          </p>
        </div>
      </Modal>

      <div className="crud-header" style={{ borderBottom: "2px solid #0284c7", paddingBottom: "20px" }}>
        <div>
          <h1 style={{ color: "#0284c7", marginBottom: "4px" }}>📋 Komponen Payroll</h1>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>Kelola komponen tunjangan dan potongan payroll karyawan</p>
        </div>
        <Button 
          variant="outline" 
          size="md" 
          onClick={() => void loadPayrollDetails()} 
          disabled={loading}
          style={{ borderColor: "#0284c7", color: "#0284c7" }}
        >
          🔄 Segarkan
        </Button>
      </div>

      <Card className="crud-card" glass style={{ borderTop: "4px solid #0284c7" }}>
        <h2 style={{ color: "#0284c7", marginTop: 0 }}>🔍 Cari Komponen Payroll</h2>
        <div className="crud-form-grid">
          <label>
            <strong style={{ color: "#0284c7" }}>ID Payroll *</strong>
            <input
              className="crud-input"
              value={payrollId}
              onChange={(event) => setPayrollId(event.target.value)}
            />
          </label>
        </div>
        <div className="crud-actions">
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => void loadPayrollDetails()} 
            disabled={loading}
            style={{ backgroundColor: "#0284c7" }}
          >
            Muat Komponen Payroll
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass style={{ borderTop: "4px solid #0284c7" }}>
        <h2 style={{ color: "#0284c7", marginTop: 0 }}>➕ Tambah Komponen (Bulk)</h2>
        <div className="crud-form-grid">
          <label className="crud-form-full">
            <strong style={{ color: "#0284c7" }}>JSON Array Komponen</strong>
            <textarea value={bulkDetailsText} onChange={(event) => setBulkDetailsText(event.target.value)} />
          </label>
        </div>
        <p className="crud-note">Format: [{"{"} type, name, amount {"}"}]</p>
        <div className="crud-actions">
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => void addBulk()} 
            disabled={loading}
            style={{ backgroundColor: "#0284c7" }}
          >
            Tambah Bulk Komponen
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass style={{ borderTop: "4px solid #0284c7" }}>
        <h2 style={{ color: "#0284c7", marginTop: 0 }}>✏️ Ubah/Hapus Komponen</h2>
        <div className="crud-form-grid">
          <label>
            <strong style={{ color: "#0284c7" }}>ID Detail</strong>
            <input
              className="crud-input"
              value={detailId}
              onChange={(event) => setDetailId(event.target.value)}
              placeholder="ID detail"
            />
          </label>
          <label>
            <strong style={{ color: "#0284c7" }}>Tipe</strong>
            <input
              className="crud-input"
              value={detailType}
              onChange={(event) => setDetailType(event.target.value)}
            />
          </label>
          <label>
            <strong style={{ color: "#0284c7" }}>Nama Komponen</strong>
            <input
              className="crud-input"
              value={detailName}
              onChange={(event) => setDetailName(event.target.value)}
            />
          </label>
          <label>
            <strong style={{ color: "#0284c7" }}>Jumlah</strong>
            <input
              className="crud-input"
              value={detailAmount}
              onChange={(event) => setDetailAmount(event.target.value)}
            />
          </label>
          <label className="crud-form-full">
            <strong style={{ color: "#0284c7" }}>JSON Array Bulk Update</strong>
            <textarea value={bulkUpdateText} onChange={(event) => setBulkUpdateText(event.target.value)} />
          </label>
        </div>

        <p className="crud-note">Format: [{"{"} id, amount {"}"}]</p>

        <div className="crud-actions">
          <Button 
            variant="secondary" 
            size="md" 
            onClick={() => void updateSingle()} 
            disabled={loading}
            style={{ backgroundColor: "#0ea5e9" }}
          >
            Ubah Detail
          </Button>
          <Button 
            variant="secondary" 
            size="md" 
            onClick={() => void bulkUpdate()} 
            disabled={loading}
            style={{ backgroundColor: "#0ea5e9" }}
          >
            Bulk Update Komponen
          </Button>
          <Button 
            variant="ghost" 
            size="md" 
            onClick={() => void deleteSingle()} 
            disabled={loading}
            style={{ color: "#ef4444" }}
          >
            Hapus Detail
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass style={{ borderTop: "4px solid #0284c7" }}>
        <h2 style={{ color: "#0284c7", marginTop: 0 }}>📊 Tabel Komponen Payroll</h2>
        <div className="crud-table-wrap">
          <table className="crud-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f9ff" }}>
                {columns.map((column) => (
                  <th 
                    key={column}
                    style={{ 
                      padding: "12px", 
                      backgroundColor: "#e0f2fe",
                      color: "#0284c7",
                      fontWeight: "600",
                      textAlign: "left",
                      borderBottom: "2px solid #0284c7"
                    }}
                  >
                    {column === "id" && "ID"}
                    {column === "payroll_id" && "ID Payroll"}
                    {column === "type" && "Tipe"}
                    {column === "name" && "Nama"}
                    {column === "amount" && "Jumlah"}
                    {!["id", "payroll_id", "type", "name", "amount"].includes(column) && column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr 
                    key={String(item.id ?? index)}
                    style={{ borderBottom: "1px solid #f0f9ff" }}
                  >
                    {columns.map((column) => (
                      <td 
                        key={`${String(item.id ?? index)}-${column}`}
                        style={{ padding: "12px", color: "#1f2937" }}
                      >
                        {asDisplay(item[column])}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} style={{ padding: "16px", textAlign: "center", color: "#999" }}>
                    Tidak ada data komponen payroll.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PayrollDetailsPage;
