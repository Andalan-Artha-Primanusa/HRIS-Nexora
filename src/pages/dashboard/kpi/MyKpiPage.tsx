import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Target, RefreshCw, Send } from 'lucide-react';
import { getMyKpis, submitMyKpi } from '@/features/dashboard/api/kpi.service';
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

const MyKpiPage = () => {
  const [kpis, setKpis] = useState<KpiRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState('Ready to load my KPI');

  const tableColumns = kpis.length > 0 ? Object.keys(kpis[0]) : ['id', 'title', 'target', 'achievement', 'period', 'score', 'status'];

  useEffect(() => {
    void loadMyKpis();
  }, []);

  const loadMyKpis = async () => {
    setLoading(true);
    setStatusMessage('Memuat KPI pribadi...');

    try {
      const result = await getMyKpis();
      const payload = result.items;
      setKpis(Array.isArray(payload) ? payload : []);
      setStatusMessage('KPI pribadi berhasil dimuat.');
    } catch (error: any) {
      setStatusMessage(error?.response?.data?.message || 'Gagal memuat KPI pribadi.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitKpi = async (id: string) => {
    if (!id) return;

    setSubmittingId(id);
    setStatusMessage(`Submit KPI #${id}...`);

    try {
      await submitMyKpi(id);
      setStatusMessage(`KPI #${id} berhasil di-submit.`);
      await loadMyKpis();
    } catch (error: any) {
      setStatusMessage(error?.response?.data?.message || 'Gagal submit KPI.');
      console.error(error);
    } finally {
      setSubmittingId('');
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
            <span>My KPI</span>
          </div>
          <h1>My KPI</h1>
          <p>Lihat KPI pribadi dan submit KPI draft untuk approval manager/HR.</p>
        </div>
        <div className="kpi-header-actions">
          <Button variant="outline" size="md" onClick={loadMyKpis} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="kpi-card" glass>
        <div className="kpi-card-title">
          <Target size={18} />
          <span>ESS Endpoint Coverage</span>
        </div>
        <p className="kpi-hint">
          GET /my/kpi untuk lihat KPI sendiri, POST /my/kpi/{'{id}'}/submit untuk submit KPI status draft.
        </p>
      </Card>

      <Card className="kpi-table-card" glass>
        <div className="kpi-table-header">
          <div>
            <h2>My KPI List</h2>
            <p>Status flow: draft -&gt; submitted -&gt; approved.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadMyKpis} disabled={loading}>
            Refresh Data
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
                {kpis.map((item, index) => {
                  const id = String(item.id ?? '');
                  const status = String(item.status ?? '').toLowerCase();
                  const canSubmit = status === 'draft' && id.length > 0;

                  return (
                    <tr key={`${item.id ?? index}`}>
                      {tableColumns.map((column) => (
                        <td key={`${item.id ?? index}-${column}`}>
                          {column.toLowerCase() === 'status' ? (
                            <span className={getStatusChipClass((item as Record<string, unknown>)[column])}>
                              {formatCellValue((item as Record<string, unknown>)[column])}
                            </span>
                          ) : (
                            formatCellValue((item as Record<string, unknown>)[column])
                          )}
                        </td>
                      ))}
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => void handleSubmitKpi(id)}
                          disabled={!canSubmit || submittingId === id}
                        >
                          <Send size={14} />
                          {submittingId === id ? 'Submitting...' : 'Submit'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Belum ada KPI pribadi.
          </div>
        )}
      </Card>

      <div style={{ marginTop: '16px', padding: '12px', background: '#f0f0f0', borderRadius: '4px', fontSize: '14px' }}>
        <strong>Status:</strong> {statusMessage}
      </div>
    </div>
  );
};

export default MyKpiPage;
