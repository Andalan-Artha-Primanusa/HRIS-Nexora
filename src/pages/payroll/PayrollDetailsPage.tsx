import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { BarChart3, CreditCard, FileText, PlusCircle, Settings2 } from "lucide-react";
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
import type { PayrollDetail } from "@/features/payroll/types/payroll.types";
import "../admin/AdminCrudPages.css";
import "./PayrollDetailsPage.css";

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: PayrollDetail[]) => {
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

  const [items, setItems] = useState<PayrollDetail[]>([]);
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
  const componentSummaryCards = useMemo(() => {
    const allowanceCount = items.filter((item) => String(item.type).toLowerCase() === "allowance").length;
    const deductionCount = items.filter((item) => String(item.type).toLowerCase() === "deduction").length;

    return [
      {
        label: "Total Components",
        subtitle: "Semua detail komponen payroll",
        value: String(items.length),
        change: "Data yang sedang dimuat",
        tone: "blue" as const,
        icon: BarChart3,
      },
      {
        label: "Allowances",
        subtitle: "Komponen tunjangan",
        value: String(allowanceCount),
        change: "Penguat take home pay",
        tone: "green" as const,
        icon: PlusCircle,
      },
      {
        label: "Deductions",
        subtitle: "Komponen potongan",
        value: String(deductionCount),
        change: "Pengurang take home pay",
        tone: "orange" as const,
        icon: CreditCard,
      },
      {
        label: "Current Type",
        subtitle: "Mode komponen aktif",
        value: defaultType === "deduction" ? "Deduction" : "Allowance",
        change: statusMessage,
        tone: "purple" as const,
        icon: Settings2,
      },
    ];
  }, [defaultType, items, statusMessage]);

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
      setItems(result as PayrollDetail[]);
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal memuat detail";
      showErrorModal("Error Muat Detail", errorText);
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
      setStatusMessage("Detail berhasil ditambahkan");
      await loadPayrollDetails();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal tambah detail";
      showErrorModal("Error Tambah Detail", errorText);
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
      setStatusMessage("Detail berhasil diupdate");
      await loadPayrollDetails();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal update detail";
      showErrorModal("Error Update Detail", errorText);
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdate = async () => {
    setLoading(true);

    try {
      const details = parseJson<Array<{ id: number; amount: number }>>(bulkUpdateText);
      await bulkUpdatePayrollDetails({ details });
      setStatusMessage("Detail berhasil di-update");
      await loadPayrollDetails();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal bulk update";
      showErrorModal("Error Bulk Update", errorText);
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
      setStatusMessage("Detail berhasil dihapus");
      await loadPayrollDetails();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal hapus detail";
      showErrorModal("Error Hapus Detail", errorText);
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
        <div className="payroll-details-modal-content">
          <p>{errorModal.message}</p>
        </div>
      </Modal>

      <Card className="payroll-details-hero" glass>
        <div className="crud-header payroll-details-header">
          <div className="crud-header-copy">
            <p className="crud-page-badge">Payroll Center</p>
            <div className="crud-header-title-row">
              <span className="crud-header-icon"><FileText size={18} /></span>
              <h1>Komponen Payroll</h1>
            </div>
            <p>Kelola komponen tunjangan dan potongan payroll karyawan dengan tampilan yang rapi, konsisten, dan mudah dipindai.</p>
            <p className="payroll-details-status">{statusMessage}</p>
          </div>
          <Button variant="outline" size="md" onClick={() => void loadPayrollDetails()} disabled={loading}>
            Segarkan
          </Button>
        </div>
      </Card>

      <div className="payroll-details-summary-grid">
        {componentSummaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="payroll-details-summary-card" glass>
              <div className="payroll-details-summary-header">
                <div>
                  <span className="payroll-details-summary-label">{card.label}</span>
                  <p className="payroll-details-summary-subtitle">{card.subtitle}</p>
                </div>
                <span className={`payroll-details-summary-icon payroll-details-summary-icon--${card.tone}`}>
                  <Icon size={18} />
                </span>
              </div>
              <div className="payroll-details-summary-value">{card.value}</div>
              <div className="payroll-details-summary-change">{card.change}</div>
            </Card>
          );
        })}
      </div>

      <Card className="crud-card payroll-details-card" glass>
        <h2>Cari Komponen Payroll</h2>
        <div className="crud-form-grid">
          <label>
            <strong>ID Payroll *</strong>
            <input
              className="crud-input"
              value={payrollId}
              onChange={(event) => setPayrollId(event.target.value)}
            />
          </label>
        </div>
        <div className="crud-actions">
          <Button variant="primary" size="md" onClick={() => void loadPayrollDetails()} disabled={loading}>
            Muat Komponen Payroll
          </Button>
        </div>
      </Card>

      <Card className="crud-card payroll-details-card" glass>
        <h2>Tambah Komponen (Bulk)</h2>
        <div className="crud-form-grid">
          <label className="crud-form-full">
            <strong>JSON Array Komponen</strong>
            <textarea value={bulkDetailsText} onChange={(event) => setBulkDetailsText(event.target.value)} />
          </label>
        </div>
        <p className="crud-note">Format: [{"{"} type, name, amount {"}"}]</p>
        <div className="crud-actions">
          <Button variant="primary" size="md" onClick={() => void addBulk()} disabled={loading}>
            Tambah Bulk Komponen
          </Button>
        </div>
      </Card>

      <Card className="crud-card payroll-details-card" glass>
        <h2>Ubah/Hapus Komponen</h2>
        <div className="crud-form-grid">
          <label>
            <strong>ID Detail</strong>
            <input
              className="crud-input"
              value={detailId}
              onChange={(event) => setDetailId(event.target.value)}
              placeholder="ID detail"
            />
          </label>
          <label>
            <strong>Tipe</strong>
            <input
              className="crud-input"
              value={detailType}
              onChange={(event) => setDetailType(event.target.value)}
            />
          </label>
          <label>
            <strong>Nama Komponen</strong>
            <input
              className="crud-input"
              value={detailName}
              onChange={(event) => setDetailName(event.target.value)}
            />
          </label>
          <label>
            <strong>Jumlah</strong>
            <input
              className="crud-input"
              value={detailAmount}
              onChange={(event) => setDetailAmount(event.target.value)}
            />
          </label>
          <label className="crud-form-full">
            <strong>JSON Array Bulk Update</strong>
            <textarea value={bulkUpdateText} onChange={(event) => setBulkUpdateText(event.target.value)} />
          </label>
        </div>

        <p className="crud-note">Format: [{"{"} id, amount {"}"}]</p>

        <div className="crud-actions">
          <Button variant="secondary" size="md" onClick={() => void updateSingle()} disabled={loading}>
            Ubah Detail
          </Button>
          <Button variant="secondary" size="md" onClick={() => void bulkUpdate()} disabled={loading}>
            Bulk Update Komponen
          </Button>
          <Button variant="ghost" size="md" onClick={() => void deleteSingle()} disabled={loading}>
            Hapus Detail
          </Button>
        </div>
      </Card>

      <Card className="crud-card payroll-details-card" glass>
        <h2>Tabel Komponen Payroll</h2>
        <div className="crud-table-wrap">
          <table className="crud-table payroll-details-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>
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
                  >
                    {columns.map((column) => (
                      <td key={`${String(item.id ?? index)}-${column}`}>
                        {asDisplay((item as Record<string, unknown>)[column])}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="payroll-details-empty-row">
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
