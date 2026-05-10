import { useEffect, useMemo, useState } from "react";
import { BarChart3, PlusCircle, Settings2, X, RefreshCw, Wallet, Gift, MinusCircle } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { payrollService, toSafeArray, getAllPayroll } from "@/features/payroll/api/payroll.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";
import type { PayrollDetail, PayrollItem } from "@/features/payroll/types/payroll.types";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "@/pages/payroll/PayrollShared.css";
import "./PayrollDetailsPage.css";

const asDisplay = (value: unknown, column?: string) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  
  const strValue = String(value);

  // 1. Format Dates (created_at, updated_at, or ISO strings)
  if (column?.includes("_at") || strValue.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
    try {
      const date = new Date(strValue);
      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date);
      }
    } catch (e) {
      // fallback to string
    }
  }

  // 2. Format Currency (amount)
  if (column === "amount" || (typeof value === "number" && !column?.includes("id"))) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));
  }

  return strValue;
};

const getColumns = (items: PayrollDetail[]) => {
  const defaultCols = ["id", "payroll_id", "type", "description", "amount"];
  if (!Array.isArray(items) || items.length === 0 || !items[0] || typeof items[0] !== 'object') {
    return defaultCols;
  }

  const keys = Object.keys(items[0]);
  const merged = [...defaultCols, ...keys.filter((key) => !defaultCols.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};


const PayrollDetailsPage = () => {
  const [componentType, setComponentType] = useState<"allowance" | "deduction">("allowance");

  const [items, setItems] = useState<PayrollDetail[]>([]);
  const [payrollId, setPayrollId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [detailId, setDetailId] = useState("");
  const [detailType, setDetailType] = useState(componentType);
  const [detailDescription, setDetailDescription] = useState("Housing Allowance");
  const [detailAmount, setDetailAmount] = useState("2000000");
  const [allPayrolls, setAllPayrolls] = useState<PayrollItem[]>([]);
  const [allEmployees, setAllEmployees] = useState<EmployeeItem[]>([]);
  const [bulkRows, setBulkRows] = useState<Array<{ type: string; name: string; amount: string }>>([
    { type: componentType, name: "", amount: "" }
  ]);
  const [activeTab, setActiveTab] = useState<"overview" | "add" | "manage">("overview");
  const [manageTab, setManageTab] = useState<"single" | "bulk">("single");
  const [manageItems, setManageItems] = useState<PayrollDetail[]>([]);
  const [overviewSearch, setOverviewSearch] = useState("");
  const [overviewTypeFilter, setOverviewTypeFilter] = useState<"all" | "allowance" | "deduction">("all");
  const [currentPageOverview, setCurrentPageOverview] = useState(1);
  const [itemsPerPageOverview, setItemsPerPageOverview] = useState(10);
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
    setBulkRows([...bulkRows, { type: componentType, name: "", amount: "" }]);
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
  const filteredOverviewItems = useMemo(() => {
    let list = Array.isArray(items) ? items.slice() : [];
    if (overviewTypeFilter !== 'all') {
      list = list.filter(i => String(i.type).toLowerCase() === overviewTypeFilter);
    }
    if (overviewSearch.trim()) {
      const q = overviewSearch.toLowerCase();
      list = list.filter(i => String(i.description || '').toLowerCase().includes(q) || String(i.id || '').toLowerCase().includes(q));
    }
    return list;
  }, [items, overviewTypeFilter, overviewSearch]);
  const totalPagesOverview = Math.max(1, Math.ceil(filteredOverviewItems.length / itemsPerPageOverview));
  const paginatedOverview = filteredOverviewItems.slice((currentPageOverview - 1) * itemsPerPageOverview, (currentPageOverview - 1) * itemsPerPageOverview + itemsPerPageOverview);
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
        icon: Gift,
      },
      {
        label: "Deductions",
        subtitle: "Komponen potongan",
        value: String(deductionCount),
        change: "Pengurang take home pay",
        tone: "orange" as const,
        icon: MinusCircle,
      },
      {
        label: "Current Type",
        subtitle: "Mode komponen aktif",
        value: componentType === "deduction" ? "Deduction" : "Allowance",
        change: statusMessage,
        tone: "purple" as const,
        icon: Settings2,
      },
    ];
  }, [componentType, items, statusMessage]);

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
      // Don't show error if it's just the initial load or nothing selected
      return;
    }

    setLoading(true);

    try {
      // We use getPayrollDetail(id) because the backend already includes 'details' in the main payroll response
      const result = await payrollService.getPayrollDetail(id);
      
      // If result is wrapped in { data: ... }
      const payrollData = result.data || result;
      const safeDetails = toSafeArray(payrollData.details || []);
      
      setItems(safeDetails);
      setManageItems(JSON.parse(JSON.stringify(safeDetails))); // Deep copy for editing
      setStatusMessage(`Berhasil memuat ${safeDetails.length} komponen`);
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
        description: row.name, // Mapping UI 'name' to backend 'description'
        amount: Number(row.amount) || 0
      })).filter(d => d.description.trim() !== "");

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
      setBulkRows([{ type: componentType, name: "", amount: "" }]);
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
        description: detailDescription,
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
    setDetailType(componentType);
    setDetailDescription(componentType === "deduction" ? "Tax" : "Housing Allowance");
    setDetailAmount(componentType === "deduction" ? "500000" : "2000000");
    setBulkRows([{ type: componentType, name: "", amount: "" }]);
  }, [componentType]);

  useEffect(() => {
    void fetchMetadata();
    // Removed automatic loadPayrollDetails() to prevent 404 on mount
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

      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Wallet size={16} />
              <span>Pusat Payroll</span>
            </div>
            <h1 className="hero-title">Komponen Payroll</h1>
            <p className="hero-subtitle">
              Kelola komponen tunjangan dan potongan payroll karyawan.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadPayrollDetails()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      <div className="payroll-component-tabs" style={{ display: "flex", gap: 0, marginBottom: 24, background: "rgba(0,0,0,0.03)", borderRadius: 12, padding: 4, width: "fit-content" }}>
        <button
          className={`payroll-details-tab ${componentType === "allowance" ? "is-active" : ""}`}
          onClick={() => setComponentType("allowance")}
          style={{ borderRadius: 8, padding: "8px 24px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: componentType === "allowance" ? "#fff" : "transparent", boxShadow: componentType === "allowance" ? "0 2px 8px rgba(0,0,0,0.08)" : "none" }}
        >
          <Gift size={16} /> Tunjangan
        </button>
        <button
          className={`payroll-details-tab ${componentType === "deduction" ? "is-active" : ""}`}
          onClick={() => setComponentType("deduction")}
          style={{ borderRadius: 8, padding: "8px 24px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: componentType === "deduction" ? "#fff" : "transparent", boxShadow: componentType === "deduction" ? "0 2px 8px rgba(0,0,0,0.08)" : "none" }}
        >
          <MinusCircle size={16} /> Potongan
        </button>
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
              <div className="payroll-details-search-mini" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  className="crud-input crud-input--sm"
                  style={{ minWidth: '220px' }}
                  value={selectedEmployeeId}
                  onChange={(event) => { setSelectedEmployeeId(event.target.value); setPayrollId(''); }}
                >
                  <option value="">-- Pilih Karyawan (opsional) --</option>
                  {allEmployees.map(emp => (
                    <option key={String(emp.id)} value={String(emp.id)}>{emp.user?.name || emp.employee_code || String(emp.id)}</option>
                  ))}
                </select>

                <select
                  className="crud-input crud-input--sm"
                  style={{ minWidth: '220px' }}
                  value={payrollId}
                  onChange={(event) => setPayrollId(event.target.value)}
                >
                  <option value="">-- Pilih Payroll --</option>
                  {allPayrolls
                    .filter(p => !selectedEmployeeId || String(p.employee_id) === selectedEmployeeId)
                    .map(p => (
                      <option key={p.id} value={String(p.id)}>{getPayrollLabel(p)}</option>
                  ))}
                </select>

                <Button variant="primary" size="sm" onClick={() => void loadPayrollDetails()} disabled={loading}>
                  Cari
                </Button>
                <input
                  className="crud-input crud-input--sm"
                  placeholder="Cari nama komponen atau ID"
                  value={overviewSearch}
                  onChange={(e) => { setOverviewSearch(e.target.value); setCurrentPageOverview(1); }}
                  style={{ minWidth: 200 }}
                />
                <select className="crud-input crud-input--sm" value={overviewTypeFilter} onChange={(e) => { setOverviewTypeFilter(e.target.value as any); setCurrentPageOverview(1); }}>
                  <option value="all">Semua Tipe</option>
                  <option value="allowance">Allowance</option>
                  <option value="deduction">Deduction</option>
                </select>
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
                        {column === "description" && "Nama"}
                        {column === "amount" && "Jumlah"}
                        {!["id", "payroll_id", "type", "name", "amount", "description"].includes(column) && column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedOverview.length > 0 ? (
                    paginatedOverview.map((item, index) => (
                      <tr key={String(item.id ?? index)}>
                        {columns.map((column) => (
                          <td key={`${String(item.id ?? index)}-${column}`}>
                            {asDisplay((item as Record<string, unknown>)[column], column)}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="payroll-details-empty-row">
                        {items.length > 0 ? "Tidak ada komponen yang cocok dengan filter." : (payrollId ? `Tidak ada data komponen payroll untuk ID ${payrollId}.` : "Pilih Payroll untuk melihat rincian.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredOverviewItems.length > itemsPerPageOverview && (
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select className="crud-input crud-input--sm" value={itemsPerPageOverview} onChange={(e) => { setItemsPerPageOverview(Number(e.target.value)); setCurrentPageOverview(1); }}>
                    <option value={5}>5 / halaman</option>
                    <option value={10}>10 / halaman</option>
                    <option value={25}>25 / halaman</option>
                  </select>
                  <div>
                    <button className="btn-outline" onClick={() => setCurrentPageOverview(Math.max(1, currentPageOverview - 1))}>&lt;</button>
                    <span style={{ margin: '0 8px' }}>{currentPageOverview} / {totalPagesOverview}</span>
                    <button className="btn-outline" onClick={() => setCurrentPageOverview(Math.min(totalPagesOverview, currentPageOverview + 1))}>&gt;</button>
                  </div>
                </div>
              </div>
            )}
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
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    className="crud-input"
                    value={selectedEmployeeId}
                    onChange={(e) => { setSelectedEmployeeId(e.target.value); setPayrollId(''); }}
                    style={{ minWidth: 180 }}
                  >
                    <option value="">-- Pilih Karyawan (opsional) --</option>
                    {allEmployees.map(emp => (
                      <option key={String(emp.id)} value={String(emp.id)}>{emp.user?.name || emp.employee_code || String(emp.id)}</option>
                    ))}
                  </select>

                  <select
                    className="crud-input"
                    value={payrollId}
                    onChange={(event) => setPayrollId(event.target.value)}
                  >
                    <option value="">-- Pilih Payroll --</option>
                    {allPayrolls
                      .filter(p => !selectedEmployeeId || String(p.employee_id) === selectedEmployeeId)
                      .map(p => (
                        <option key={p.id} value={String(p.id)}>{getPayrollLabel(p)}</option>
                    ))}
                  </select>
                </div>
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
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      className="crud-input crud-input--sm"
                      value={selectedEmployeeId}
                      onChange={(e) => { setSelectedEmployeeId(e.target.value); setPayrollId(''); }}
                      style={{ minWidth: 180 }}
                    >
                      <option value="">-- Pilih Karyawan (opsional) --</option>
                      {allEmployees.map(emp => (
                        <option key={String(emp.id)} value={String(emp.id)}>{emp.user?.name || emp.employee_code || String(emp.id)}</option>
                      ))}
                    </select>

                    <select
                      className="crud-input crud-input--sm"
                      style={{ minWidth: '220px' }}
                      value={payrollId}
                      onChange={(event) => setPayrollId(event.target.value)}
                    >
                      <option value="">-- Pilih Payroll --</option>
                      {allPayrolls
                        .filter(p => !selectedEmployeeId || String(p.employee_id) === selectedEmployeeId)
                        .map(p => (
                          <option key={p.id} value={String(p.id)}>{getPayrollLabel(p)}</option>
                      ))}
                    </select>
                  </div>
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
                        setDetailType(item.type || "allowance");
                        setDetailDescription(item.description || "");
                        setDetailAmount(String(item.amount));
                      }
                    }}
                  >
                    <option value="">-- Pilih Komponen dari ID {payrollId} --</option>
                    {manageItems.map(item => (
                      <option key={item.id} value={String(item.id)}>
                        [{String(item.type).toUpperCase()}] {item.description} - Rp {Number(item.amount).toLocaleString()}
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
                        onChange={(event) => setDetailType(event.target.value as "allowance" | "deduction")}
                      >
                        <option value="allowance">Allowance</option>
                        <option value="deduction">Deduction</option>
                      </select>
                    </label>
                    <label>
                      <strong>Nama Komponen</strong>
                      <input
                        className="crud-input"
                        value={detailDescription}
                        onChange={(event) => setDetailDescription(event.target.value)}
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
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      className="crud-input crud-input--sm"
                      value={selectedEmployeeId}
                      onChange={(e) => { setSelectedEmployeeId(e.target.value); setPayrollId(''); }}
                      style={{ minWidth: 180 }}
                    >
                      <option value="">-- Pilih Karyawan (opsional) --</option>
                      {allEmployees.map(emp => (
                        <option key={String(emp.id)} value={String(emp.id)}>{emp.user?.name || emp.employee_code || String(emp.id)}</option>
                      ))}
                    </select>

                    <select
                      className="crud-input crud-input--sm"
                      style={{ minWidth: '220px' }}
                      value={payrollId}
                      onChange={(event) => setPayrollId(event.target.value)}
                    >
                      <option value="">-- Pilih Payroll --</option>
                      {allPayrolls
                        .filter(p => !selectedEmployeeId || String(p.employee_id) === selectedEmployeeId)
                        .map(p => (
                          <option key={p.id} value={String(p.id)}>{getPayrollLabel(p)}</option>
                      ))}
                    </select>
                  </div>
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
                          <td style={{ fontWeight: 600 }}>{item.description}</td>
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
                        manageItems.map(item => payrollService.updatePayrollDetail(String(item.id), { amount: item.amount }))
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
