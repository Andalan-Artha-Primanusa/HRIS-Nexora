import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Target, RefreshCw, Plus } from 'lucide-react';
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
      <div className="kpi-header">
        <div>
          <div className="kpi-badge">
            <Target size={18} />
            <span>KPI Management</span>
          </div>
          <h1>KPI Management</h1>
          <p>Kelola KPI perusahaan: lihat, tambah, update, dan approve.</p>
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

      <Card className="kpi-card" glass>
        <div className="kpi-card-title">
          <Target size={18} />
          <span>Search KPI by Employee (Manager/HR/Admin/Super Admin)</span>
        </div>
        <p className="kpi-hint">
          Endpoints: GET /kpis, POST /kpis, GET /kpis/employee/{'{employee_id}'}, GET /kpis/{'{id}'}, PUT /kpis/{'{id}'}, DELETE /kpis/{'{id}'}, PUT /kpis/{'{id}'}/approve.
        </p>
        <p className="kpi-hint">
          Status enum: draft -&gt; submitted -&gt; approved.
        </p>
        <div className="kpi-form-row">
          <input
            value={searchEmployee}
            onChange={(e) => setSearchEmployee(e.target.value)}
            placeholder="Enter employee_id"
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
                      <div style={{ display: 'flex', gap: '8px' }}>
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
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No KPI records found. {searchEmployee ? 'Try a different employee ID.' : 'Click "Create KPI" to add one.'}
          </div>
        )}
      </Card>

      <div style={{ marginTop: '16px', padding: '12px', background: '#f0f0f0', borderRadius: '4px', fontSize: '14px' }}>
        <strong>Status:</strong> {statusMessage}
      </div>
    </div>
  );
};

export default KpiListPage;
