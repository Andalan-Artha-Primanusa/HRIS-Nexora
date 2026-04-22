import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { BarChart3, CreditCard, FileText, PlusCircle, Settings2, X } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { payrollService, toSafeArray, getAllPayroll } from "@/features/payroll/api/payroll.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";
import type { PayrollDetail, PayrollItem } from "@/features/payroll/types/payroll.types";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import "../admin/AdminCrudPages.css";
import "./PayrollDetailsPage.css";

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: PayrollDetail[]) => {
  const defaultCols = ["id", "payroll_id", "type", "name", "amount"];
  if (!Array.isArray(items) || items.length === 0 || !items[0] || typeof items[0] !== 'object') {
    return defaultCols;
  }

  const keys = Object.keys(items[0]);
  const merged = [...defaultCols, ...keys.filter((key) => !defaultCols.includes(key))];
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
  const [allPayrolls, setAllPayrolls] = useState<PayrollItem[]>([]);
  const [allEmployees, setAllEmployees] = useState<EmployeeItem[]>([]);
  const [bulkRows, setBulkRows] = useState<Array<{ type: string; name: string; amount: string }>>([
    { type: defaultType, name: "", amount: "" }
  ]);
  const [activeTab, setActiveTab] = useState<"overview" | "add" | "manage">("overview");
  const [manageTab, setManageTab] = useState<"single" | "bulk">("single");
  const [manageItems, setManageItems] = useState<PayrollDetail[]>([]);
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

  const fetchMetadata = async () => {
    try {
      const [pRes, eRes] = await Promise.all([
        getAllPayroll(),
        getAllEmployees(),
      ]);
      setAllPayrolls(toSafeArray(pRes));
      setAllEmployees(Array.isArray(eRes) ? eRes : toSafeArray(eRes));
    } catch (err) {
      console.error("Failed to fetch metadata", err);
    }
  };

  const getPayrollLabel = (payroll: PayrollItem) => {
    const employee = allEmployees.find(emp => String(emp.id) === String(payroll.employee_id));
    const name = employee?.user?.name || employee?.employee_code || `EMP-${payroll.employee_id}`;
    return `#${payroll.id} - ${name} (${payroll.period})`;
  };

  const addBulkRow = () => {
    setBulkRows([...bulkRows, { type: defaultType, name: "", amount: "" }]);
  };

  const removeBulkRow = (index: number) => {
    if (bulkRows.length <= 1) return;
    setBulkRows(bulkRows.filter((_, i) => i !== index));
  };

  const updateBulkRow = (index: number, field: string, value: string) => {
    const newRows = [...bulkRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setBulkRows(newRows);
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
      const result = await payrollService.getPayrollDetails(id);
      const safeData = toSafeArray(result);
      setItems(safeData);
      setManageItems(JSON.parse(JSON.stringify(safeData))); // Deep copy for editing
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
      const details = bulkRows.map(row => ({
        type: row.type,
        name: row.name,
        amount: Number(row.amount) || 0
      })).filter(d => d.name.trim() !== "");

      if (details.length === 0) {
        showErrorModal("Validasi", "Isi minimal satu nama komponen");
        setLoading(false);
        return;
      }

      await payrollService.addPayrollDetail({
        payroll_id: Number(id) || 0,
        details,
      });
      setStatusMessage("Detail berhasil ditambahkan");
      setBulkRows([{ type: defaultType, name: "", amount: "" }]);
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
      await payrollService.updatePayrollDetail(id, {
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
      // Update each detail individually via PUT /payroll-details/{id}
      await Promise.all(
        details.map((d) => payrollService.updatePayrollDetail(d.id, { amount: d.amount }))
      );
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
      await payrollService.deletePayrollDetail(id);
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
    void fetchMetadata();
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

      <div className="payroll-details-tabs">
        <button 
          className={`payroll-details-tab ${activeTab === 'overview' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} />
          Overview & List
        </button>
        <button 
          className={`payroll-details-tab ${activeTab === 'add' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <PlusCircle size={16} />
          Add Bulk
        </button>
        <button 
          className={`payroll-details-tab ${activeTab === 'manage' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          <Settings2 size={16} />
          Manage Single
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="payroll-details-tab-content">
          <Card className="crud-card payroll-details-card" glass>
            <div className="payroll-details-list-header">
              <h2>Komponen Payroll</h2>
              <div className="payroll-details-search-mini">
                <select
                  className="crud-input crud-input--sm"
                  style={{ minWidth: '220px' }}
                  value={payrollId}
                  onChange={(event) => setPayrollId(event.target.value)}
                >
                  <option value="">-- Pilih Payroll --</option>
                  {allPayrolls.map(p => (
                    <option key={p.id} value={String(p.id)}>{getPayrollLabel(p)}</option>
                  ))}
                </select>
                <Button variant="primary" size="sm" onClick={() => void loadPayrollDetails()} disabled={loading}>
                  Cari
                </Button>
              </div>
            </div>
            
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
                      <tr key={String(item.id ?? index)}>
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
                        {payrollId ? `Tidak ada data komponen payroll untuk ID ${payrollId}.` : "Pilih Payroll untuk melihat rincian."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "add" && (
        <div className="payroll-details-tab-content">
          <Card className="crud-card payroll-details-card" glass>
            <h2>Tambah Komponen</h2>
            <div className="crud-form-grid">
              <label className="crud-form-full">
                <strong>ID Payroll Tujuan</strong>
                <select
                  className="crud-input"
                  value={payrollId}
                  onChange={(event) => setPayrollId(event.target.value)}
                >
                  <option value="">-- Pilih Payroll --</option>
                  {allPayrolls.map(p => (
                    <option key={p.id} value={String(p.id)}>{getPayrollLabel(p)}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="payroll-details-form-section">
              <h3>Daftar Komponen</h3>
              <div className="payroll-details-rows">
                {bulkRows.map((row, index) => (
                  <div key={index} className="payroll-details-row-item">
                    <div className="row-field">
                      <label>Tipe</label>
                      <select 
                        value={row.type} 
                        onChange={e => updateBulkRow(index, 'type', e.target.value)}
                        className="crud-input"
                      >
                        <option value="allowance">Allowance</option>
                        <option value="deduction">Deduction</option>
                      </select>
                    </div>
                    <div className="row-field name-field">
                      <label>Nama Komponen</label>
                      <input 
                        placeholder="Misal: Bonus Proyek" 
                        value={row.name}
                        onChange={e => updateBulkRow(index, 'name', e.target.value)}
                        className="crud-input"
                      />
                    </div>
                    <div className="row-field amount-field">
                      <label>Jumlah (IDR)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={row.amount}
                        onChange={e => updateBulkRow(index, 'amount', e.target.value)}
                        className="crud-input"
                      />
                    </div>
                    <button 
                      className="row-remove-btn" 
                      onClick={() => removeBulkRow(index)}
                      title="Hapus baris"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addBulkRow} className="row-add-btn">
                + Tambah Baris
              </Button>
            </div>

            <div className="crud-actions" style={{ marginTop: '2rem' }}>
              <Button variant="primary" size="md" onClick={() => void addBulk()} disabled={loading}>
                Simpan Semua Komponen
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "manage" && (
        <div className="payroll-details-tab-content">
          <div className="payroll-details-subtabs">
            <button 
              className={`payroll-details-subtab ${manageTab === 'single' ? 'is-active' : ''}`}
              onClick={() => setManageTab('single')}
            >
              Single Update
            </button>
            <button 
              className={`payroll-details-subtab ${manageTab === 'bulk' ? 'is-active' : ''}`}
              onClick={() => setManageTab('bulk')}
            >
              Bulk Adjust Amounts
            </button>
          </div>

          {manageTab === "single" && (
            <Card className="crud-card payroll-details-card" glass>
              <div className="payroll-details-manage-header">
                <h2>Update / Hapus Komponen</h2>
                <div className="payroll-details-search-mini">
                  <select
                    className="crud-input crud-input--sm"
                    style={{ minWidth: '220px' }}
                    value={payrollId}
                    onChange={(event) => setPayrollId(event.target.value)}
                  >
                    <option value="">-- Pilih Payroll --</option>
                    {allPayrolls.map(p => (
                      <option key={p.id} value={String(p.id)}>{getPayrollLabel(p)}</option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm" onClick={() => void loadPayrollDetails()} disabled={loading}>
                    Muat
                  </Button>
                </div>
              </div>

              <div className="crud-form-grid">
                <label className="crud-form-full">
                  <strong>Pilih Komponen</strong>
                  <select
                    className="crud-input"
                    value={detailId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setDetailId(id);
                      const item = manageItems.find(i => String(i.id) === id);
                      if (item) {
                        setDetailType(item.type);
                        setDetailName(item.name);
                        setDetailAmount(String(item.amount));
                      }
                    }}
                  >
                    <option value="">-- Pilih Komponen dari ID {payrollId} --</option>
                    {manageItems.map(item => (
                      <option key={item.id} value={String(item.id)}>
                        [{String(item.type).toUpperCase()}] {item.name} - Rp {Number(item.amount).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </label>
                
                {detailId && (
                  <>
                    <label>
                      <strong>Tipe</strong>
                      <select 
                        className="crud-input"
                        value={detailType}
                        onChange={(event) => setDetailType(event.target.value)}
                      >
                        <option value="allowance">Allowance</option>
                        <option value="deduction">Deduction</option>
                      </select>
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
                        type="number"
                        value={detailAmount}
                        onChange={(event) => setDetailAmount(event.target.value)}
                      />
                    </label>
                  </>
                )}
              </div>

              <div className="crud-actions">
                <Button variant="secondary" size="md" onClick={() => void updateSingle()} disabled={loading || !detailId}>
                  Simpan Perubahan
                </Button>
                <Button variant="ghost" size="md" onClick={() => void deleteSingle()} disabled={loading || !detailId}>
                  Hapus Detail
                </Button>
              </div>
            </Card>
          )}

          {manageTab === "bulk" && (
            <Card className="crud-card payroll-details-card" glass>
              <div className="payroll-details-manage-header">
                <h2>Bulk Adjust Amounts</h2>
                <div className="payroll-details-search-mini">
                  <select
                    className="crud-input crud-input--sm"
                    style={{ minWidth: '220px' }}
                    value={payrollId}
                    onChange={(event) => setPayrollId(event.target.value)}
                  >
                    <option value="">-- Pilih Payroll --</option>
                    {allPayrolls.map(p => (
                      <option key={p.id} value={String(p.id)}>{getPayrollLabel(p)}</option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm" onClick={() => void loadPayrollDetails()} disabled={loading}>
                    Muat
                  </Button>
                </div>
              </div>

              <p className="crud-note">Ubah jumlah pada tabel di bawah ini dan klik Simpan Semua untuk memperbarui secara massal.</p>

              <div className="crud-table-wrap" style={{ marginTop: '1rem' }}>
                <table className="crud-table">
                  <thead>
                    <tr>
                      <th>Nama Komponen</th>
                      <th>Tipe</th>
                      <th style={{ width: '250px' }}>Jumlah Baru (IDR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manageItems.length > 0 ? (
                      manageItems.map((item, idx) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 600 }}>{item.name}</td>
                          <td>
                            <span className={`status-badge status-badge--${item.type}`}>
                              {String(item.type).toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <input 
                              type="number"
                              className="crud-input crud-input--sm"
                              style={{ width: '100%', maxWidth: 'none' }}
                              value={item.amount}
                              onChange={(e) => {
                                const newItems = [...manageItems];
                                newItems[idx] = { ...newItems[idx], amount: Number(e.target.value) || 0 };
                                setManageItems(newItems);
                              }}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                          Pilih Payroll yang memiliki komponen untuk diedit.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="crud-actions" style={{ marginTop: '2rem' }}>
                <Button 
                  variant="primary" 
                  size="md" 
                  disabled={loading || manageItems.length === 0}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await Promise.all(
                        manageItems.map(item => payrollService.updatePayrollDetail(item.id, { amount: item.amount }))
                      );
                      setStatusMessage("Bulk update berhasil");
                      await loadPayrollDetails();
                    } catch (err) {
                      showErrorModal("Error", "Gagal melakukan bulk update");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Simpan Semua Perubahan
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

    </div>
  );
};

export default PayrollDetailsPage;
