import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { BarChart3, CheckCircle2, Plus, RefreshCw, Send, Target } from 'lucide-react';
import {
  deleteKpi,
  getAllKpis,
  getKpisByEmployee,
} from '@/features/dashboard/api/kpi.service';
import './KpiPage.css';

type KpiStatus = 'draft' | 'submitted' | 'approved';

type KpiRecord = {
  id?: number | string;
  employee_id?: number | string;
  title?: string;
  description?: string;
  target?: number | string;
  achievement?: number | string;
  period?: string;
  score?: number | string;
  status?: KpiStatus | string;
  created_at?: string;
  updated_at?: string;
  employee?: { id?: number | string; name?: string };
  [key: string]: unknown;
};

const KpiListPage = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<KpiRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState('Ready to load KPI list');
  const [searchEmployee, setSearchEmployee] = useState('');

  const tableColumns = kpis.length > 0 ? Object.keys(kpis[0]) : ['id', 'employee_id', 'title', 'target', 'period', 'status'];
  const summaryCards = useMemo(() => {
    const draftCount = kpis.filter((item) => String(item.status ?? '').toLowerCase() === 'draft').length;
    const submittedCount = kpis.filter((item) => String(item.status ?? '').toLowerCase() === 'submitted').length;
    const approvedCount = kpis.filter((item) => String(item.status ?? '').toLowerCase() === 'approved').length;

    return [
      {
        label: 'Total KPI',
        subtitle: 'Semua data KPI',
        value: String(kpis.length),
        change: 'Data KPI aktif',
        tone: 'blue' as const,
        icon: BarChart3,
      },
      {
        label: 'Draft',
        subtitle: 'Belum dikirim',
        value: String(draftCount),
        change: 'Perlu dipersiapkan',
        tone: 'orange' as const,
        icon: Target,
      },
      {
        label: 'Submitted',
        subtitle: 'Menunggu approval',
        value: String(submittedCount),
        change: 'Menunggu review',
        tone: 'purple' as const,
        icon: Send,
      },
      {
        label: 'Approved',
        subtitle: 'Sudah disetujui',
        value: String(approvedCount),
        change: statusMessage,
        tone: 'green' as const,
        icon: CheckCircle2,
      },
    ];
  }, [kpis, statusMessage]);

  useEffect(() => {
    void loadKpis();
  }, []);

  const loadKpis = async () => {
    setLoading(true);
    setStatusMessage('Memuat semua KPI...');

    try {
      const result = await getAllKpis();
      const payload = result.items;
      setKpis(Array.isArray(payload) ? payload : []);
      setStatusMessage('KPI berhasil dimuat.');
    } catch (error: any) {
      setStatusMessage('Gagal memuat KPI.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadKpisByEmployee = async () => {
    if (!searchEmployee) return;
    setLoading(true);
    setStatusMessage('Mencari KPI berdasarkan employee_id...');

    try {
      const result = await getKpisByEmployee(searchEmployee);
      const payload = result.items.length > 0 ? result.items : [result.payload];
      setKpis(payload as KpiRecord[]);
      setStatusMessage('KPI per employee berhasil dimuat.');
    } catch (error: any) {
      setStatusMessage('Gagal memuat KPI per employee.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKpi = async (id: string) => {
    if (!id) return;
    if (!window.confirm(`Hapus KPI #${id}?`)) return;

    setDeletingId(id);
    setStatusMessage(`Menghapus KPI #${id}...`);

    try {
      await deleteKpi(id);
      setStatusMessage(`KPI #${id} berhasil dihapus.`);

      if (searchEmployee.trim()) {
        await loadKpisByEmployee();
      } else {
        await loadKpis();
      }
    } catch (error: any) {
      setStatusMessage(error?.response?.data?.message || 'Gagal menghapus KPI.');
      console.error(error);
    } finally {
      setDeletingId('');
    }
  };

  const formatCellValue = (value: unknown) => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const candidate = record.name ?? record.title ?? record.id;
      if (candidate !== undefined && candidate !== null && typeof candidate !== 'object') {
        return String(candidate);
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  const getStatusChipClass = (statusValue: unknown) => {
    const status = String(statusValue ?? '').toLowerCase();
    if (status === 'approved') return 'kpi-status-chip kpi-status-chip--approved';
    if (status === 'submitted') return 'kpi-status-chip kpi-status-chip--submitted';
    return 'kpi-status-chip kpi-status-chip--draft';
  };

  return (
    <div className="kpi-page">
      <Card className="kpi-hero" glass>
        <div className="kpi-header">
          <div className="kpi-header-copy">
            <p className="kpi-page-badge">Performance Center</p>
            <div className="kpi-title-row">
              <span className="kpi-header-icon"><Target size={18} /></span>
              <h1>KPI Management</h1>
            </div>
            <p>Kelola KPI perusahaan: lihat, tambah, update, dan approve dengan tampilan yang rapi dan konsisten.</p>
          </div>
          <div className="kpi-header-actions">
            <Button
              variant="outline"
              size="md"
              onClick={loadKpis}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/kpis/add')}
              disabled={loading}
            >
              <Plus size={16} />
              Create KPI
            </Button>
          </div>
        </div>
      </Card>

      <div className="kpi-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="kpi-summary-card" glass>
              <div className="kpi-summary-header">
                <div>
                  <span className="kpi-summary-label">{card.label}</span>
                  <p className="kpi-summary-subtitle">{card.subtitle}</p>
                </div>
                <span className={`kpi-summary-icon kpi-summary-icon--${card.tone}`}>
                  <Icon size={18} />
                </span>
              </div>
              <div className="kpi-summary-value">{card.value}</div>
              <div className="kpi-summary-change">{card.change}</div>
            </Card>
          );
        })}
      </div>

      <Card className="kpi-card" glass>
        <div className="kpi-card-title">
          <Target size={18} />
          <span>Cari KPI berdasarkan ID karyawan</span>
        </div>
        <p className="kpi-hint">
          Endpoint utama: GET /kpis, POST /kpis, GET /kpis/employee/{'{employee_id}'}, GET /kpis/{'{id}'}, PUT /kpis/{'{id}'}, DELETE /kpis/{'{id}'}, PUT /kpis/{'{id}'}/approve.
        </p>
        <p className="kpi-hint">
          Alur status: draft -&gt; submitted -&gt; approved.
        </p>
        <div className="kpi-form-row">
          <input
            value={searchEmployee}
            onChange={(e) => setSearchEmployee(e.target.value)}
            placeholder="Masukkan employee_id"
          />
          <Button 
            variant="secondary" 
            size="md" 
            onClick={loadKpisByEmployee} 
            disabled={loading || !searchEmployee}
          >
            Search
          </Button>
        </div>
      </Card>

      <Card className="kpi-table-card" glass>
        <div className="kpi-table-header">
          <div>
            <h2>KPI List</h2>
            <p>Click on a row to view details and perform actions.</p>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={loadKpis} 
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {kpis.length > 0 ? (
          <div className="ui-table-overflow">
            <table className="ui-table">
              <thead>
                <tr>
                  {tableColumns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {kpis.map((item, index) => (
                  <tr key={`${item.id ?? index}`}>
                    {tableColumns.map((column) => (
                      <td key={`${item.id ?? index}-${column}`}>
                        {column.toLowerCase() === 'status' ? (
                          <span className={getStatusChipClass((item as any)[column])}>
                            {formatCellValue((item as any)[column])}
                          </span>
                        ) : (
                          formatCellValue((item as any)[column])
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="kpi-row-actions">
                        {(() => {
                          const id = String(item.id ?? '');
                          const status = String(item.status ?? '').toLowerCase();
                          const isDraft = status === 'draft';
                          const isSubmitted = status === 'submitted';

                          return (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => navigate(`/kpi/view/${id}`)}
                                disabled={!id}
                              >
                                View
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => navigate(`/kpi/update/${id}`)}
                                disabled={!id || !isDraft}
                                title={isDraft ? 'Update KPI' : 'Hanya KPI status draft yang bisa diupdate'}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => navigate(`/kpi/approve/${id}`)}
                                disabled={!id || !isSubmitted}
                                title={isSubmitted ? 'Approve KPI' : 'Hanya KPI status submitted yang bisa di-approve'}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => void handleDeleteKpi(id)}
                                disabled={!id || deletingId === id}
                              >
                                {deletingId === id ? 'Deleting...' : 'Delete'}
                              </Button>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="kpi-empty-state">
            No KPI records found. {searchEmployee ? 'Try a different employee ID.' : 'Click "Create KPI" to add one.'}
          </div>
        )}
      </Card>

      <div className="kpi-status-bar">
        <strong>Status:</strong> {statusMessage}
      </div>
    </div>
  );
};

export default KpiListPage;
