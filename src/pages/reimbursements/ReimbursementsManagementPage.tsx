import { useEffect, useState, useMemo } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { LoadingState, EmptyState } from "@/shared/ui/DataStateDisplay";
import {
  approveReimbursement,
  rejectReimbursement,
  createReimbursement,
  deleteReimbursement,
  getAllReimbursements,
  markReimbursementAsPaid,
  updateReimbursement,
} from "@/features/reimbursement/api/reimbursement.service";
import type { ReimbursementItem, ReimbursementCreatePayload, ReimbursementUpdatePayload } from "@/features/reimbursement/types/reimbursement.types";
import { BarChart3, Clock3, CircleCheckBig, RefreshCw, DollarSign, Trash2, Edit, Receipt, DownloadCloud, Check, X } from "lucide-react";
import { showToast } from "@/shared/ui/toast";
import "@/shared/styles/CrudPage.css";

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

const getEmployeeName = (item: any) => {
  if (typeof item.employee_name === "string") return item.employee_name;
  if (item.employee?.name) return item.employee.name;
  if (item.employee?.user?.name) return item.employee.user.name;
  if (item.user?.name) return item.user.name;
  return `EMP-${String(item.employee_id).padStart(3, '0')}`;
};

const DEFAULT_FORM = {
  id: "",
  employee_id: "",
  title: "",
  description: "",
  amount: "",
  category: "travel",
  expense_date: new Date().toISOString().split('T')[0],
  receipt_path: "",
};

const ReimbursementsManagementPage = () => {
  const [items, setItems] = useState<ReimbursementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  const [allItemsRaw, setAllItemsRaw] = useState<ReimbursementItem[]>([]);

  const summaryCards = useMemo(() => {
    // Gunakan allItemsRaw agar statistik di atas tidak ikut jadi 0 saat difilter
    const source = allItemsRaw.length > 0 ? allItemsRaw : items;
    // Total Expense Volume hanya menghitung yang sudah APPROVED atau PAID (bukan Rejected/Draft)
    const totalAmount = source.reduce((sum, item) => {
      const s = String(item.status).toLowerCase();
      if (s === 'rejected' || s === 'draft') return sum;
      return sum + (Number(item.amount) || 0);
    }, 0);
    const paidCount = source.filter(i => String(i.status).toLowerCase() === "paid").length;
    return [
      {
        label: "Total Registrations",
        subtitle: "Semua pengajuan yang masuk",
        value: String(source.length),
        change: "Total Ledger",
        tone: "blue" as const,
        icon: BarChart3,
      },
      {
        label: "Unpaid / Pending",
        subtitle: "Belum dibayarkan tunai",
        value: String(source.filter(i => {
           const s = String(i.status).toLowerCase();
           return s === 'pending' || s === 'submitted' || s === 'approved';
        }).length),
        change: "Hutang perusahaan",
        tone: "orange" as const,
        icon: Clock3,
      },
      {
        label: "Paid Successfully",
        subtitle: "Pembayaran telah diselesaikan",
        value: String(paidCount),
        change: "Telah ditransfer finance",
        tone: "green" as const,
        icon: CircleCheckBig,
      },
      {
        label: "Total Expense Volume",
        subtitle: "Total pengeluaran tercatat",
        value: `Rp ${totalAmount.toLocaleString("id-ID")}`,
        change: "Keseluruhan biaya expense",
        tone: "purple" as const,
        icon: Receipt,
      },
    ];
  }, [items, allItemsRaw]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getAllReimbursements();
      const raw = result.items || [];
      setAllItemsRaw(raw);
      
      if (!filterStatus) {
        setItems(raw);
      } else {
        const filtered = raw.filter(i => {
          const s = String(i.status).toLowerCase();
          const f = filterStatus.toLowerCase();
          // Jika filter 'pending', sertakan juga 'submitted'
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


  const handleCreateOrUpdate = async () => {
    if (!form.employee_id || !form.title || !form.amount) return;
    setActionLoading("form");
    try {
      if (form.id) {
        const payload: ReimbursementUpdatePayload = {
          title: form.title,
          description: form.description,
          amount: Number(form.amount),
          category: form.category,
          expense_date: form.expense_date,
          receipt_path: form.receipt_path,
        };
        await updateReimbursement(form.id, payload);
      } else {
        const payload: ReimbursementCreatePayload = {
          employee_id: Number(form.employee_id),
          title: form.title,
          description: form.description,
          amount: Number(form.amount),
          category: form.category,
          expense_date: form.expense_date,
          receipt_path: form.receipt_path,
        };
        await createReimbursement(payload);
      }
      setIsFormOpen(false);
      setForm(DEFAULT_FORM);
      await loadData();
      showToast("Data berhasil disimpan", "success");
    } catch (error: any) {
      showToast(error.message || "Simpan data gagal", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (actionId: string, actionFn: () => Promise<any>, successMsg: string) => {
    setActionLoading(actionId);
    try {
      await actionFn();
      await loadData();
      showToast(successMsg, "success");
    } catch (error: any) {
      showToast(error.message || "Aksi gagal", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('Hapus permanen ledger ini?')) return;
    setActionLoading(id + '_del');
    try {
      await deleteReimbursement(id);
      await loadData();
      showToast("Data dihapus", "success");
    } catch (error: any) {
      showToast(error.message || "Gagal menghapus", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (item: ReimbursementItem) => {
    setForm({
      id: String(item.id),
      employee_id: String(item.employee_id),
      title: String(item.title),
      description: String(item.description || ""),
      amount: String(item.amount),
      category: String(item.category),
      expense_date: String(item.expense_date),
      receipt_path: String(item.receipt_path || ""),
    });
    setIsFormOpen(true);
  };

  useEffect(() => {
    void loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  return (
    <div className="crud-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Reimburse Finance</span>
          <h1>Reimbursement Ledger</h1>
          <p>Master list of all company expense reimbursements for Finance processing.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadData()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} />
            {loading ? "Memuat..." : "Segarkan"}
          </Button>
          <Button variant="primary" size="md" onClick={() => { setForm(DEFAULT_FORM); setIsFormOpen(!isFormOpen); }}>
            Buat Data Baru
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

      {/* Form Overlay */}
      {isFormOpen && (
        <Card className="table-card" glass style={{ marginBottom: "1.5rem" }}>
           <div className="table-header-bar">
             <h3>{form.id ? "Ubah Ledger Entry" : "Buat Ledger Entry Baru"}</h3>
           </div>
           <div className="table-card-inner">
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>ID Karyawan</label>
                  <input style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} value={form.employee_id} onChange={(e) => setForm(f => ({...f, employee_id: e.target.value}))} placeholder="Misal: 1" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Kategori</label>
                  <select className="ui-input" style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }} value={form.category} onChange={(e) => setForm(f => ({...f, category: e.target.value}))}>
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
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Judul Pengeluaran</label>
                  <input style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} value={form.title} onChange={(e) => setForm(f => ({...f, title: e.target.value}))} placeholder="Tiket Pesawat Jakarta-Bali" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Nominal (Rp)</label>
                  <input style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} type="number" value={form.amount} onChange={(e) => setForm(f => ({...f, amount: e.target.value}))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Tanggal Transaksi</label>
                  <input style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} type="date" value={form.expense_date} onChange={(e) => setForm(f => ({...f, expense_date: e.target.value}))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Path Bukti Lampiran</label>
                  <input style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} value={form.receipt_path} onChange={(e) => setForm(f => ({...f, receipt_path: e.target.value}))} placeholder="/assets/receipts/005.jpg" />
                </div>
             </div>
             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '0.75rem' }}>
                 <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Batal</Button>
                 <Button variant="primary" onClick={() => void handleCreateOrUpdate()} disabled={actionLoading === "form"}>Simpan Data Ledger</Button>
              </div>
           </div>
        </Card>
      )}

      {/* Table */}
      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Master Reimbursement Ledger</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', fontSize: '0.85rem' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="draft">Selesai Draft</option>
              <option value="pending">Menunggu (Pending)</option>
              <option value="approved">Disetujui (Approved)</option>
              <option value="paid">Dibayarkan (Paid)</option>
              <option value="rejected">Ditolak (Rejected)</option>
            </select>
            <span className="table-count">{items.length} records</span>
          </div>
        </div>

        {loading && <div className="table-card-inner"><LoadingState message="Memuat database ledger..." /></div>}
        {!loading && items.length === 0 && (
          <div className="table-card-inner">
            <EmptyState
              icon=""
              title="Tidak ada data"
              message="Belum ada catatan biaya operasional/reimburse."
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
                    <th>EMPLOYEE</th>
                    <th>KATEGORI</th>
                    <th>DETAIL ALOKASI DANA</th>
                    <th>LAMPIRAN</th>
                    <th>STATUS PEMBAYARAN</th>
                    <th className="th-center">AKSI FINANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    return (
                      <tr key={String(item.id ?? index)}>
                        <td>
                          <div className="cell-id">{index + 1}</div>
                          <div className="cell-sub">ID: {item.id}</div>
                        </td>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {getEmployeeName(item).charAt(0).toUpperCase()}
                            </div>
                            <span className="cell-name-text">{getEmployeeName(item)}</span>
                          </div>
                        </td>
                        <td>
                          <span className="cell-tag">{String(item.category).replace('_', ' ')}</span>
                        </td>
                        <td>
                          <div className="cell-date">{String(item.title)}</div>
                          <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>Rp {Number(item.amount).toLocaleString('id-ID')} ({formatDate(String(item.expense_date))})</div>
                        </td>
                        <td>
                           {item.receipt_path ? (
                             <a href={String(item.receipt_path)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontSize: '0.8rem', textDecoration: 'none' }}>
                               <DownloadCloud size={14} /> Tinjau
                             </a>
                           ) : (
                             <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Receipt size={14}/> -</span>
                           )}
                        </td>
                        <td>
                           {item.status === 'approved' ? (
                             <>
                               <span style={{ color: '#10b981', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, display: 'inline-block', marginBottom: '4px' }}>APPROVED</span>
                               <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Menunggu transfer</div>
                             </>
                           ) : item.status === 'rejected' ? <span style={{ color: '#ef4444', background: '#fef2f2', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>REJECTED</span> :
                            item.status === 'paid' ? <span style={{ color: '#2563eb', background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>LUNAS / PAID</span> :
                            (item.status === 'pending' || item.status === 'submitted') ? <span style={{ color: '#f59e0b', background: '#fffbeb', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>PENDING</span> :
                             <span style={{ color: '#64748b', background: '#f8fafc', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>DRAFT</span>}
                        </td>
                        <td>
                           <div className="cell-actions">
                             {(item.status === 'pending' || item.status === 'submitted') && (
                               <>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => void handleAction(String(item.id)+'_app', () => approveReimbursement(String(item.id), { note: "Approved from Ledger" }), "Berhasil disetujui")}
                                   disabled={actionLoading === String(item.id)+'_app'}
                                   title="Approve"
                                   style={{ color: '#10b981', borderColor: '#10b981' }}
                                 >
                                   <Check size={14} />
                                 </Button>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => {
                                      const reason = window.prompt("Alasan penolakan:");
                                      if (reason !== null) {
                                        void handleAction(String(item.id)+'_rej', () => rejectReimbursement(String(item.id), { note: reason || "Ditolak oleh Admin" }), "Pengajuan ditolak");
                                      }
                                   }}
                                   disabled={actionLoading === String(item.id)+'_rej'}
                                   title="Reject"
                                   style={{ color: '#ef4444', borderColor: '#ef4444' }}
                                 >
                                   <X size={14} />
                                 </Button>
                               </>
                             )}
                             {item.status === 'approved' && (
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => void handleAction(String(item.id)+'_paid', () => markReimbursementAsPaid(String(item.id)), "Status diubah menjadi PAID")}
                                 disabled={actionLoading === String(item.id)+'_paid'}
                                 title="Tandai Sudah Ditransfer (Mark Paid)"
                                 style={{ color: '#2563eb', borderColor: '#2563eb' }}
                               >
                                 <DollarSign size={15} />
                               </Button>
                             )}
                             <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => handleEdit(item)}
                                 title="Edit Ledger"
                                 style={{ color: '#64748b', borderColor: '#e2e8f0' }}
                              >
                                <Edit size={15} />
                             </Button>
                             <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => void handleDelete(String(item.id))}
                                 disabled={actionLoading === String(item.id)+'_del'}
                                 title="Hapus Permanen"
                                 style={{ color: '#ef4444', borderColor: '#ef4444' }}
                              >
                                 <Trash2 size={15} />
                             </Button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReimbursementsManagementPage;
