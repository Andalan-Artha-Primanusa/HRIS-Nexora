import { useEffect, useMemo, useState } from "react";
import { BarChart3, PlusCircle, Settings2, X, RefreshCw, Wallet, Gift, MinusCircle, Search } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { payrollService, toSafeArray, getAllPayroll } from "@/features/payroll/api/payroll.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";
import { showToast } from "@/shared/ui/toast";
import type { PayrollDetail, PayrollItem } from "@/features/payroll/types/payroll.types";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "./PayrollDetailsPage.css";

const getColumns = (items: PayrollDetail[]) => {
  const defaultCols = ["id", "payroll_id", "type", "name", "amount"];
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
  const [detailName, setDetailName] = useState("Housing Allowance");
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
  const pageSizeOverview = 10;
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchMetadata = async () => {
    try {
      const [pRes, eRes] = await Promise.all([getAllPayroll(), getAllEmployees()]);
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

  const columns = useMemo(() => {
    const cols = getColumns(items);
    return cols.filter(c => !['created_at', 'updated_at', 'payroll_id'].includes(c));
  }, [items]);

  const filteredOverviewItems = useMemo(() => {
    let list = Array.isArray(items) ? items.slice() : [];
    if (overviewTypeFilter !== 'all') {
      list = list.filter(i => String(i.type).toLowerCase() === overviewTypeFilter);
    }
    if (overviewSearch.trim()) {
      const q = overviewSearch.toLowerCase();
      list = list.filter(i =>
        String(i.name || i.description || '').toLowerCase().includes(q) ||
        String(i.id || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, overviewTypeFilter, overviewSearch]);

  const totalPagesOverview = Math.max(1, Math.ceil(filteredOverviewItems.length / pageSizeOverview));
  const paginatedOverview = filteredOverviewItems.slice(
    (currentPageOverview - 1) * pageSizeOverview,
    currentPageOverview * pageSizeOverview
  );

  const componentSummaryCards = useMemo(() => {
    const allowanceCount = items.filter((item) => String(item.type).toLowerCase() === "allowance").length;
    const deductionCount = items.filter((item) => String(item.type).toLowerCase() === "deduction").length;
    return [
      {
        label: "Total Komponen",
        subtitle: "Semua detail komponen payroll",
        value: String(items.length),
        tone: "blue" as const,
        icon: BarChart3,
      },
      {
        label: "Tunjangan",
        subtitle: "Komponen tunjangan",
        value: String(allowanceCount),
        tone: "green" as const,
        icon: Gift,
      },
      {
        label: "Potongan",
        subtitle: "Komponen potongan",
        value: String(deductionCount),
        tone: "orange" as const,
        icon: MinusCircle,
      },
      {
        label: "Mode Aktif",
        subtitle: "Jenis komponen",
        value: componentType === "deduction" ? "Deduction" : "Allowance",
        tone: "purple" as const,
        icon: Settings2,
      },
    ];
  }, [componentType, items]);

  const requirePayrollId = (): string | null => {
    const id = payrollId.trim();
    return id || null;
  };

  const loadPayrollDetails = async () => {
    const id = requirePayrollId();
    if (!id) {
      showToast("Pilih Payroll terlebih dahulu", "error");
      return;
    }
    setLoading(true);
    try {
      const result = await payrollService.getPayrollDetail(id);
      const payrollData = result.data || result;
      const safeDetails = toSafeArray(payrollData.details || []);
      setItems(safeDetails);
      setManageItems(JSON.parse(JSON.stringify(safeDetails)));
      showToast(`Berhasil memuat ${safeDetails.length} komponen`, "success");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Gagal memuat detail";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const addBulk = async () => {
    const id = requirePayrollId();
    if (!id) {
      showToast("Masukkan Payroll ID terlebih dahulu", "error");
      return;
    }
    const validRows = bulkRows.filter(r => r.name.trim() !== "");
    if (validRows.length === 0) {
      showToast("Isi minimal satu nama komponen", "error");
      return;
    }
    setLoading(true);
    try {
      let successCount = 0;
      for (const row of validRows) {
        await payrollService.addPayrollDetail({
          payroll_id: Number(id),
          type: row.type,
          name: row.name,
          amount: Number(row.amount) || 0,
        });
        successCount++;
      }
      showToast(`${successCount} komponen berhasil ditambahkan`, "success");
      setBulkRows([{ type: componentType, name: "", amount: "" }]);
      await loadPayrollDetails();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Gagal tambah detail";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const updateSingle = async () => {
    const id = detailId.trim();
    if (!id) {
      showToast("Pilih komponen terlebih dahulu", "error");
      return;
    }
    setLoading(true);
    try {
      await payrollService.updatePayrollDetail(id, {
        type: detailType,
        name: detailName,
        amount: Number(detailAmount) || 0,
      });
      showToast("Komponen berhasil diperbarui", "success");
      await loadPayrollDetails();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Gagal update detail";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const requestDeleteSingle = () => {
    const id = detailId.trim();
    if (!id) {
      showToast("Pilih komponen terlebih dahulu", "error");
      return;
    }
    setDeleteDialogOpen(true);
  };

  const deleteSingle = async () => {
    const id = detailId.trim();
    if (!id) {
      showToast("Pilih komponen terlebih dahulu", "error");
      return;
    }
    setLoading(true);
    try {
      await payrollService.deletePayrollDetail(id);
      showToast("Komponen berhasil dihapus", "success");
      setDetailId("");
      setDeleteDialogOpen(false);
      await loadPayrollDetails();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Gagal hapus detail";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDetailType(componentType);
    setDetailName(componentType === "deduction" ? "Tax" : "Housing Allowance");
    setDetailAmount(componentType === "deduction" ? "500000" : "2000000");
    setBulkRows([{ type: componentType, name: "", amount: "" }]);
  }, [componentType]);

  useEffect(() => {
    void fetchMetadata();
  }, []);

  return (
    <div className="crud-page">
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

      <div className="payroll-component-tabs">
        <button
          className={`payroll-component-tab ${componentType === "allowance" ? "is-active" : ""}`}
          onClick={() => setComponentType("allowance")}
        >
          <Gift size={16} /> Tunjangan
        </button>
        <button
          className={`payroll-component-tab ${componentType === "deduction" ? "is-active" : ""}`}
          onClick={() => setComponentType("deduction")}
        >
          <MinusCircle size={16} /> Potongan
        </button>
      </div>

      <div className="payroll-details-tabs">
        <button className={`payroll-details-tab ${activeTab === 'overview' ? 'is-active' : ''}`} onClick={() => setActiveTab('overview')}>
          <BarChart3 size={16} /> Overview & List
        </button>
        <button className={`payroll-details-tab ${activeTab === 'add' ? 'is-active' : ''}`} onClick={() => setActiveTab('add')}>
          <PlusCircle size={16} /> Add Bulk
        </button>
        <button className={`payroll-details-tab ${activeTab === 'manage' ? 'is-active' : ''}`} onClick={() => setActiveTab('manage')}>
          <Settings2 size={16} /> Manage
        </button>
      </div>

      <div className="payroll-details-summary-grid">
        {componentSummaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="payroll-details-summary-card">
              <div className="payroll-summary-header">
                <div>
                  <p className="payroll-summary-label">{card.label}</p>
                  <p className="payroll-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`payroll-summary-icon ${card.tone}`}>
                  <Icon size={22} />
                </div>
              </div>
              <div className="payroll-summary-value">{card.value}</div>
            </div>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <div className="payroll-details-tab-content">
          <Card className="payroll-details-card">
            <div className="payroll-details-overview-header">
              <h2>Daftar Komponen</h2>
              <div className="payroll-filter-row">
                <select className="crud-input crud-input--sm" value={selectedEmployeeId} onChange={(e) => { setSelectedEmployeeId(e.target.value); setPayrollId(''); }}>
                  <option value="">-- Pilih Karyawan --</option>
                  {allEmployees.map(emp => (
                    <option key={String(emp.id)} value={String(emp.id)}>{emp.user?.name || emp.employee_code || String(emp.id)}</option>
                  ))}
                </select>
                <select className="crud-input crud-input--sm" value={payrollId} onChange={(e) => setPayrollId(e.target.value)}>
                  <option value="">-- Pilih Payroll --</option>
                  {allPayrolls.filter(p => !selectedEmployeeId || String(p.employee_id) === selectedEmployeeId).map(p => (
                    <option key={p.id} value={String(p.id)}>{getPayrollLabel(p)}</option>
                  ))}
                </select>
                <Button variant="primary" size="sm" onClick={() => void loadPayrollDetails()} disabled={loading}>Cari</Button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', borderRadius: '8px', padding: '0 10px' }}>
                  <Search size={16} color="#94a3b8" />
                  <input className="crud-input crud-input--sm" style={{ border: 'none', background: 'transparent', minWidth: '160px' }} placeholder="Cari komponen..." value={overviewSearch} onChange={(e) => { setOverviewSearch(e.target.value); setCurrentPageOverview(1); }} />
                </div>
                <select className="crud-input crud-input--sm" value={overviewTypeFilter} onChange={(e) => { setOverviewTypeFilter(e.target.value as any); setCurrentPageOverview(1); }}>
                  <option value="all">Semua</option>
                  <option value="allowance">Allowance</option>
                  <option value="deduction">Deduction</option>
                </select>
              </div>
            </div>

            <div className="payroll-details-table-wrap">
              <table className="payroll-details-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col}>
                        {col === "id" ? "ID" : col === "type" ? "Tipe" : col === "name" ? "Nama" : col === "description" ? "Deskripsi" : col === "amount" ? "Jumlah" : col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedOverview.length > 0 ? (
                    paginatedOverview.map((item, index) => (
                      <tr key={String(item.id ?? index)}>
                        {columns.map((col) => (
                          <td key={`${String(item.id ?? index)}-${col}`}>
                            {col === "amount" ? (
                              <span style={{ fontWeight: 700 }}>Rp {Number((item as any)[col]).toLocaleString('id-ID')}</span>
                            ) : col === "type" ? (
                              <span className={`status-badge status-badge--${String((item as any)[col]).toLowerCase()}`}>
                                {String((item as any)[col]).toUpperCase()}
                              </span>
                            ) : col === "name" || col === "description" ? (
                              <span style={{ fontWeight: 600 }}>{(item as any).name || (item as any).description}</span>
                            ) : (
                              String((item as any)[col] ?? '-')
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="payroll-details-empty-row">
                        {items.length > 0 ? "Tidak ada komponen yang cocok." : (payrollId ? "Tidak ada data komponen." : "Pilih Payroll untuk melihat rincian.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredOverviewItems.length > pageSizeOverview && (
              <div className="payroll-pagination">
                <div className="payroll-pagination-info">
                  Menampilkan <strong>{paginatedOverview.length}</strong> dari <strong>{filteredOverviewItems.length}</strong> data
                </div>
                <div className="payroll-pagination-controls">
                  <button className="payroll-pagination-btn" onClick={() => setCurrentPageOverview(Math.max(1, currentPageOverview - 1))} disabled={currentPageOverview === 1}>‹</button>
                  {Array.from({ length: totalPagesOverview }, (_, i) => i + 1).map((page) => (
                    <button key={page} className={`payroll-pagination-btn ${currentPageOverview === page ? 'active' : ''}`} onClick={() => setCurrentPageOverview(page)}>{page}</button>
                  ))}
                  <button className="payroll-pagination-btn" onClick={() => setCurrentPageOverview(Math.min(totalPagesOverview, currentPageOverview + 1))} disabled={currentPageOverview === totalPagesOverview}>›</button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "add" && (
        <div className="payroll-details-tab-content">
          <Card className="payroll-details-card">
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem' }}>Tambah Komponen</h2>

            <div className="payroll-filter-row" style={{ marginBottom: '1.5rem' }}>
              <select className="crud-input crud-input--sm" value={selectedEmployeeId} onChange={(e) => { setSelectedEmployeeId(e.target.value); setPayrollId(''); }}>
                <option value="">-- Pilih Karyawan --</option>
                {allEmployees.map(emp => (
                  <option key={String(emp.id)} value={String(emp.id)}>{emp.user?.name || emp.employee_code || String(emp.id)}</option>
                ))}
              </select>
              <select className="crud-input crud-input--sm" value={payrollId} onChange={(e) => setPayrollId(e.target.value)}>
                <option value="">-- Pilih Payroll --</option>
                {allPayrolls.filter(p => !selectedEmployeeId || String(p.employee_id) === selectedEmployeeId).map(p => (
                  <option key={p.id} value={String(p.id)}>{getPayrollLabel(p)}</option>
                ))}
              </select>
            </div>

            <div className="payroll-details-form-section">
              <h3>Daftar Komponen</h3>
              <div className="payroll-details-rows">
                {bulkRows.map((row, index) => (
                  <div key={index} className="payroll-details-row-item">
                    <div className="row-field">
                      <label>Tipe</label>
                      <select value={row.type} onChange={e => updateBulkRow(index, 'type', e.target.value)} className="crud-input">
                        <option value="allowance">Allowance</option>
                        <option value="deduction">Deduction</option>
                      </select>
                    </div>
                    <div className="row-field">
                      <label>Nama Komponen</label>
                      <input placeholder="Misal: Bonus Proyek" value={row.name} onChange={e => updateBulkRow(index, 'name', e.target.value)} className="crud-input" />
                    </div>
                    <div className="row-field">
                      <label>Jumlah (IDR)</label>
                      <input type="number" placeholder="0" value={row.amount} onChange={e => updateBulkRow(index, 'amount', e.target.value)} className="crud-input" />
                    </div>
                    <button className="row-remove-btn" onClick={() => removeBulkRow(index)} title="Hapus baris"><X size={16} /></button>
                  </div>
                ))}
              </div>
              <button className="row-add-btn" onClick={addBulkRow}>+ Tambah Baris</button>
            </div>

            <div className="payroll-add-actions">
              <Button variant="primary" size="md" onClick={() => void addBulk()} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Semua Komponen'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "manage" && (
        <div className="payroll-details-tab-content">
          <div className="payroll-details-subtabs">
            <button className={`payroll-details-subtab ${manageTab === 'single' ? 'is-active' : ''}`} onClick={() => setManageTab('single')}>Single Update</button>
            <button className={`payroll-details-subtab ${manageTab === 'bulk' ? 'is-active' : ''}`} onClick={() => setManageTab('bulk')}>Bulk Adjust</button>
          </div>

          {manageTab === "single" && (
            <Card className="payroll-details-card">
              <div className="payroll-manage-header">
                <h2>Update / Hapus Komponen</h2>
                <div className="payroll-manage-filters">
                  <select className="crud-input crud-input--sm" value={selectedEmployeeId} onChange={(e) => { setSelectedEmployeeId(e.target.value); setPayrollId(''); }}>
                    <option value="">-- Pilih Karyawan --</option>
                    {allEmployees.map(emp => (
                      <option key={String(emp.id)} value={String(emp.id)}>{emp.user?.name || emp.employee_code || String(emp.id)}</option>
                    ))}
                  </select>
                  <select className="crud-input crud-input--sm" value={payrollId} onChange={(e) => setPayrollId(e.target.value)}>
                    <option value="">-- Pilih Payroll --</option>
                    {allPayrolls.filter(p => !selectedEmployeeId || String(p.employee_id) === selectedEmployeeId).map(p => (
                      <option key={p.id} value={String(p.id)}>{getPayrollLabel(p)}</option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm" onClick={() => void loadPayrollDetails()} disabled={loading}>Muat</Button>
                </div>
              </div>

              {manageItems.length > 0 && (
                <div className="payroll-manage-select-wrap">
                  <label className="payroll-manage-component-select-label">Pilih Komponen</label>
                  <select className="crud-input" value={detailId} onChange={(e) => {
                    const id = e.target.value;
                    setDetailId(id);
                    const item = manageItems.find(i => String(i.id) === id);
                    if (item) {
                      setDetailType(item.type || "allowance");
                      setDetailName(item.name || item.description || "");
                      setDetailAmount(String(item.amount));
                    }
                  }}>
                    <option value="">-- Pilih Komponen --</option>
                    {manageItems.map(item => (
                      <option key={item.id} value={String(item.id)}>
                        [{String(item.type).toUpperCase()}] {item.name || item.description} - Rp {Number(item.amount).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {detailId && (
                <div className="payroll-manage-form-grid">
                  <div className="payroll-manage-form-field">
                    <label>Tipe</label>
                    <select className="crud-input" value={detailType} onChange={(e) => setDetailType(e.target.value as "allowance" | "deduction")}>
                      <option value="allowance">Allowance</option>
                      <option value="deduction">Deduction</option>
                    </select>
                  </div>
                  <div className="payroll-manage-form-field">
                    <label>Nama</label>
                    <input className="crud-input" value={detailName} onChange={(e) => setDetailName(e.target.value)} />
                  </div>
                  <div className="payroll-manage-form-field">
                    <label>Jumlah</label>
                    <input className="crud-input" type="number" value={detailAmount} onChange={(e) => setDetailAmount(e.target.value)} />
                  </div>
                </div>
              )}

              {!detailId && manageItems.length === 0 && (
                <p className="payroll-manage-empty">Pilih Payroll yang memiliki komponen untuk diedit.</p>
              )}

              <div className="payroll-manage-actions">
                <Button variant="primary" size="md" onClick={() => void updateSingle()} disabled={loading || !detailId}>
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
                <Button variant="ghost" size="md" onClick={requestDeleteSingle} disabled={loading || !detailId} style={{ color: '#ef4444' }}>
                  Hapus Komponen
                </Button>
              </div>
            </Card>
          )}

          {manageTab === "bulk" && (
            <Card className="payroll-details-card">
              <div className="payroll-manage-header">
                <h2>Bulk Adjust Amounts</h2>
                <div className="payroll-manage-filters">
                  <select className="crud-input crud-input--sm" value={selectedEmployeeId} onChange={(e) => { setSelectedEmployeeId(e.target.value); setPayrollId(''); }}>
                    <option value="">-- Pilih Karyawan --</option>
                    {allEmployees.map(emp => (
                      <option key={String(emp.id)} value={String(emp.id)}>{emp.user?.name || emp.employee_code || String(emp.id)}</option>
                    ))}
                  </select>
                  <select className="crud-input crud-input--sm" value={payrollId} onChange={(e) => setPayrollId(e.target.value)}>
                    <option value="">-- Pilih Payroll --</option>
                    {allPayrolls.filter(p => !selectedEmployeeId || String(p.employee_id) === selectedEmployeeId).map(p => (
                      <option key={p.id} value={String(p.id)}>{getPayrollLabel(p)}</option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm" onClick={() => void loadPayrollDetails()} disabled={loading}>Muat</Button>
                </div>
              </div>

              <p className="payroll-bulk-subtitle">Ubah jumlah pada tabel di bawah ini dan klik Simpan Semua untuk memperbarui secara massal.</p>

              <div className="payroll-details-table-wrap">
                <table className="payroll-details-table">
                  <thead>
                    <tr>
                      <th>Nama Komponen</th>
                      <th>Tipe</th>
                      <th style={{ width: '220px' }}>Jumlah Baru (IDR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manageItems.length > 0 ? (
                      manageItems.map((item, idx) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 600 }}>{item.name || item.description}</td>
                          <td><span className={`status-badge status-badge--${item.type}`}>{String(item.type).toUpperCase()}</span></td>
                          <td>
                            <input type="number" className="crud-input crud-input--sm payroll-bulk-amount-input"
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
                        <td colSpan={3} className="payroll-manage-empty-cell">Pilih Payroll yang memiliki komponen untuk diedit.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <Button variant="primary" size="md" className="payroll-bulk-save-btn" disabled={loading || manageItems.length === 0}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      let count = 0;
                      for (const item of manageItems) {
                        await payrollService.updatePayrollDetail(String(item.id), { amount: Number(item.amount) || 0 });
                        count++;
                      }
                      showToast(`${count} komponen berhasil diperbarui`, "success");
                      await loadPayrollDetails();
                    } catch (err) {
                      showToast("Gagal melakukan bulk update", "error");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Hapus Komponen Payroll"
        message={`Komponen "${detailName || "ini"}" akan dihapus dari payroll. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        loading={loading}
        onConfirm={() => void deleteSingle()}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default PayrollDetailsPage;
