import { useEffect, useMemo, useState } from "react";
import { BarChart3, FileText, Receipt, Send, Edit, RefreshCw } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import {
  createMyReimbursement,
  getMyReimbursements,
  submitMyReimbursement,
} from "@/features/ess/api/ess.service";
import type { GenericApiItem, MyReimbursementPayload } from "@/features/ess/types/ess.types";
import { LoadingState, EmptyState } from "@/shared/ui/DataStateDisplay";
import { showToast } from "@/shared/ui/toast";
import "@/shared/styles/CrudPage.css";

const DEFAULT_FORM: MyReimbursementPayload = {
  title: "",
  description: "",
  amount: 0,
  category: "travel",
  expense_date: new Date().toISOString().split('T')[0],
  receipt_path: "",
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const MyReimbursementsPage = () => {
  const [items, setItems] = useState<GenericApiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState<MyReimbursementPayload>(DEFAULT_FORM);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const summaryCards = useMemo(() => {
    const draftCount = items.filter((item) => String(item.status ?? "").toLowerCase() === "draft").length;
    const submittedCount = items.filter((item) => String(item.status ?? "").toLowerCase() === "submitted" || String(item.status ?? "").toLowerCase() === "pending").length;
    const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return [
      { label: "Total Pengajuan", subtitle: "Seluruh riwayat pengajuan", value: String(items.length), change: "Diperbarui otomatis", tone: "blue" as const, icon: BarChart3 },
      { label: "Draft (Belum Submit)", subtitle: "Butuh tindakan Anda", value: String(draftCount), change: "Selesaikan form", tone: "orange" as const, icon: FileText },
      { label: "Dalam Proses", subtitle: "Tahap review", value: String(submittedCount), change: "Menunggu Acc", tone: "purple" as const, icon: Send },
      { label: "Keseluruhan Nilai", subtitle: "Total nominal semua status", value: `Rp ${totalAmount.toLocaleString("id-ID")}`, change: "Total Nilai", tone: "green" as const, icon: Receipt },
    ];
  }, [items]);

  const loadItems = async (status?: string) => {
    setLoading(true);
    try {
      const result = await getMyReimbursements();
      const allItems = result.items || [];
      
      if (!status) {
        setItems(allItems);
      } else {
        const filtered = allItems.filter(i => {
          const s = String(i.status).toLowerCase();
          const f = status.toLowerCase();
          if (f === "pending") return s === "pending" || s === "submitted";
          return s === f;
        });
        setItems(filtered);
      }
    } catch (error: any) {
      showToast(error.message || "Gagal memuat data dari server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.amount) return;
    setActionLoading("form");
    try {
      await createMyReimbursement(form);
      setIsFormOpen(false);
      setForm(DEFAULT_FORM);
      await loadItems(filterStatus || undefined);
    } catch (error: any) {
      showToast(error.message || "Gagal menyimpan pengajuan.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (id: string) => {
    setActionLoading(id);
    try {
      await submitMyReimbursement(id);
      await loadItems(filterStatus || undefined);
    } catch (error: any) {
      showToast(error.message || "Gagal submit reimbursement.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    void loadItems(filterStatus);
  }, [filterStatus]);

  return (
    <div className="crud-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">ESS Center</span>
          <h1>My Reimbursements</h1>
          <p>Beranda pribadi Anda untuk membuat pengajuan baru dan memantau status secara langsung.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadItems(filterStatus || undefined)} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} />
            {loading ? "Memuat..." : "Segarkan"}
          </Button>
          <Button variant="primary" size="md" onClick={() => { setForm(DEFAULT_FORM); setIsFormOpen(!isFormOpen); }}>
            Buat Pengajuan Baru
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="summary-card" glass>
              <div className="summary-card__header">
                <div>
                  <span className="summary-card__label">{card.label}</span>
                  <p className="summary-card__subtitle">{card.subtitle}</p>
                </div>
                <span className={`summary-card__icon summary-card__icon--${card.tone}`}>
                  <Icon size={20} />
                </span>
              </div>
              <div className={`summary-card__value summary-card__value--${card.tone}`}>{card.value}</div>
              <div className="summary-card__change">{card.change}</div>
            </Card>
          );
        })}
      </div>

      {/* Form Card (Inline like other CRUD forms) */}
      {isFormOpen && (
        <Card className="table-card" glass style={{ marginBottom: "1.5rem" }}>
           <div className="table-header-bar">
             <h3>Formulir Pengajuan Reimbursement</h3>
           </div>
           <div className="table-card-inner">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Judul Pengeluaran</label>
                    <input style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} value={form.title} onChange={(e) => setForm(f => ({...f, title: e.target.value}))} placeholder="Makan Siang Tim Proyek ABC" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Kategori</label>
                    <select className="ui-input" value={form.category} onChange={(e) => setForm(f => ({...f, category: e.target.value}))}>
                      <option value="travel">Travel</option>
                      <option value="medical">Medical</option>
                      <option value="office_supplies">Office Supplies</option>
                      <option value="training">Training</option>
                      <option value="meal">Meal</option>
                      <option value="accommodation">Accommodation</option>
                      <option value="transportation">Transportation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Tanggal Transaksi</label>
                    <input style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} type="date" value={form.expense_date} onChange={(e) => setForm(f => ({...f, expense_date: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Nominal (Rp)</label>
                    <input style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} type="number" value={String(form.amount)} onChange={(e) => setForm(f => ({...f, amount: Number(e.target.value)}))} placeholder="Misal: 150000" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Lampiran (Opsional)</label>
                    <input style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} value={form.receipt_path} onChange={(e) => setForm(f => ({...f, receipt_path: e.target.value}))} placeholder="/assets/receipts/001.jpg" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Catatan Tambahan</label>
                    <input style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))} placeholder="Deskripsikan keperluan..." />
                  </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '0.75rem' }}>
                 <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
                 <Button variant="primary" onClick={() => void handleCreate()} disabled={actionLoading === "form"}>Simpan sebagai Draft</Button>
              </div>
           </div>
        </Card>
      )}

      {/* Table */}
      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Riwayat Pengajuan</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', fontSize: '0.85rem' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="draft">Selesai Draft</option>
              <option value="pending">Menunggu (Pending)</option>
              <option value="approved">Disetujui (Approved)</option>
              <option value="paid">Dibayarkan (Paid)</option>
              <option value="rejected">Ditolak (Rejected)</option>
            </select>
            <Button variant="ghost" size="sm" onClick={() => void loadItems(filterStatus || undefined)}>Saring</Button>
          </div>
        </div>

        {loading && <div className="table-card-inner"><LoadingState message="Memuat pengajuan reimbursement..." /></div>}
        {!loading && items.length === 0 && (
          <div className="table-card-inner">
            <EmptyState
              icon=""
              title="Tidak ada pengajuan"
              message="Belum ada riwayat reimbursement."
            />
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="table-card-inner">
             <div className="table-wrap">
               <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Detail Pengajuan</th>
                      <th>Kategori</th>
                      <th>Nominal</th>
                      <th>Status</th>
                      <th className="th-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                       <tr key={String(item.id)}>
                         <td>
                           <div className="cell-id">{index + 1}</div>
                         </td>
                         <td>
                           <div className="cell-name">
                             <div className="cell-avatar" style={{ background: '#eff6ff', color: '#2563eb' }}>
                               <Receipt size={16} />
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column' }}>
                               <span className="cell-name-text">{String(item.title)}</span>
                               <span className="cell-date-sub">{formatDate(String(item.expense_date))}</span>
                             </div>
                           </div>
                         </td>
                         <td><span className="cell-tag">{String(item.category).replace('_', ' ')}</span></td>
                         <td>
                             <strong>Rp {Number(item.amount).toLocaleString('id-ID')}</strong>
                         </td>
                         <td>
                           {item.status === 'approved' ? <span style={{ color: '#10b981', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>APPROVED</span> : 
                            item.status === 'rejected' ? <span style={{ color: '#ef4444', background: '#fef2f2', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>REJECTED</span> :
                            item.status === 'paid' ? <span style={{ color: '#2563eb', background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>PAID</span> :
                            (item.status === 'pending' || item.status === 'submitted') ? <span style={{ color: '#f59e0b', background: '#fffbeb', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>PENDING</span> :
                             <span style={{ color: '#64748b', background: '#f8fafc', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>DRAFT</span>}
                         </td>
                         <td>
                           <div className="cell-actions">
                             {(!item.status || item.status === 'draft') && (
                               <Button variant="outline" size="sm" onClick={() => void handleSubmit(String(item.id))} disabled={actionLoading === String(item.id)} title="Submit" style={{ color: '#2563eb', borderColor: '#2563eb' }}>
                                 <Send size={15} />
                               </Button>
                             )}
                           </div>
                         </td>
                       </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyReimbursementsPage;
