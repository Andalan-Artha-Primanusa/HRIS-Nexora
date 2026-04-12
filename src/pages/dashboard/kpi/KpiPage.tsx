import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { FileText, Target, Users, ShieldCheck } from 'lucide-react';
import {
  approveKpi,
  createKpi,
  deleteKpi,
  getAllKpis,
  getKpiDetail,
  getKpisByEmployee,
  getMyKpis,
  submitMyKpi,
  updateKpi,
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
  approved?: boolean;
  created_at?: string;
  updated_at?: string;
  employee?: { id?: number | string; name?: string };
  user?: { id?: number | string; name?: string };
  [key: string]: unknown;
};

const KPI_STATUS_OPTIONS: KpiStatus[] = ['draft', 'submitted', 'approved'];

const KpiPage = () => {
  const location = useLocation();
  const path = location.pathname;
  const isMyKpi = path === '/my/kpi';

  const [kpis, setKpis] = useState<KpiRecord[]>([]);
  const [formState, setFormState] = useState<KpiRecord>({
    id: '',
    employee_id: '',
    title: '',
    description: '',
    target: '',
    achievement: '',
    period: '',
  });
  const [searchEmployee, setSearchEmployee] = useState('');
  const [responseText, setResponseText] = useState('');
  const [statusMessage, setStatusMessage] = useState('Ready to call KPI endpoints');
  const [loading, setLoading] = useState(false);

  const pageTitle = useMemo(() => (isMyKpi ? 'My KPI' : 'KPI Management'), [isMyKpi]);
  const pageSubtitle = useMemo(
    () =>
      isMyKpi
        ? 'Lihat dan submit KPI pribadi Anda sesuai endpoint API my/kpi.'
        : 'Kelola KPI perusahaan: daftar, buat, update, approve, dan hapus.',
    [isMyKpi]
  );

  useEffect(() => {
    setResponseText('');
    setStatusMessage('Ready to call KPI endpoints');
    if (isMyKpi) {
      void loadMyKpis();
    } else {
      void loadKpis();
    }
  }, [isMyKpi]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2));
  };

  const getErrorMessage = (error: any, fallback: string) => {
    const message = error?.response?.data?.message;
    const errors = error?.response?.data?.errors;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    if (errors && typeof errors === 'object') {
      const firstError = Object.values(errors).find((value) => Array.isArray(value) && value.length > 0) as string[] | undefined;
      if (firstError?.[0]) {
        return firstError[0];
      }
    }

    return fallback;
  };

  const validateAction = (action: string) => {
    if (['detail', 'update', 'delete', 'approve', 'submit'].includes(action) && !String(formState.id ?? '').trim()) {
      return 'KPI ID wajib diisi.';
    }

    if (action === 'create') {
      if (!String(formState.employee_id ?? '').trim()) return 'Employee ID wajib diisi.';
      if (!String(formState.title ?? '').trim()) return 'Title wajib diisi.';
      if (!String(formState.period ?? '').trim()) return 'Period wajib diisi.';
      const target = Number(formState.target);
      if (Number.isNaN(target) || target <= 0) return 'Target harus berupa angka lebih dari 0.';
    }

    return null;
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

  const handleFieldChange = (key: keyof KpiRecord, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const loadKpis = async () => {
    setLoading(true);
    setStatusMessage('Memuat semua KPI...');
    setResponseText('');

    try {
      const result = await getAllKpis();
      const payload = result.items;
      formatResponse(payload);
      setKpis(Array.isArray(payload) ? payload : []);
      setStatusMessage('Semua KPI berhasil dimuat.');
    } catch (error: any) {
      setStatusMessage('Gagal memuat KPI.');
      formatResponse(error.response?.data ?? error.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const loadMyKpis = async () => {
    setLoading(true);
    setStatusMessage('Memuat KPI saya...');
    setResponseText('');

    try {
      const result = await getMyKpis();
      const payload = result.items;
      formatResponse(payload);
      setKpis(Array.isArray(payload) ? payload : []);
      setStatusMessage('KPI pribadi berhasil dimuat.');
    } catch (error: any) {
      setStatusMessage('Gagal memuat KPI saya.');
      formatResponse(error.response?.data ?? error.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const loadKpisByEmployee = async () => {
    if (!searchEmployee) return;
    setLoading(true);
    setStatusMessage('Mencari KPI berdasarkan employee_id...');
    setResponseText('');

    try {
      const result = await getKpisByEmployee(searchEmployee);
      const payload = result.items.length > 0 ? result.items : [result.payload];
      formatResponse(payload);
      setKpis(payload as KpiRecord[]);
      setStatusMessage('KPI per employee berhasil dimuat.');
    } catch (error: any) {
      setStatusMessage('Gagal memuat KPI per employee.');
      formatResponse(error.response?.data ?? error.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (action: string) => {
    const validationMessage = validateAction(action);
    if (validationMessage) {
      setStatusMessage(validationMessage);
      return;
    }

    setLoading(true);
    setResponseText('');
    setStatusMessage('Mengirim request...');

    try {
      let result;
      switch (action) {
        case 'create':
          result = await createKpi({
            employee_id: Number(formState.employee_id),
            title: String(formState.title ?? ''),
            description: formState.description,
            target: Number(formState.target),
            period: String(formState.period ?? ''),
          });
          break;
        case 'detail':
          result = await getKpiDetail(String(formState.id));
          break;
        case 'update':
          result = await updateKpi(String(formState.id), {
            title: formState.title,
            description: formState.description,
            period: formState.period,
            target: Number(formState.target),
            achievement: formState.achievement ? Number(formState.achievement) : undefined,
          });
          break;
        case 'delete':
          result = await deleteKpi(String(formState.id));
          break;
        case 'approve':
          result = await approveKpi(String(formState.id));
          break;
        case 'submit':
          result = await submitMyKpi(String(formState.id));
          break;
        default:
          result = { payload: { message: 'Action not configured' } };
      }

      formatResponse((result as { raw?: unknown; payload?: unknown }).raw ?? result);
      setStatusMessage('Request berhasil.');
      if (isMyKpi) {
        void loadMyKpis();
      } else {
        void loadKpis();
      }
    } catch (error: any) {
      setStatusMessage(getErrorMessage(error, 'Request gagal.'));
      formatResponse(error.response?.data ?? error.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const tableColumns = kpis.length > 0 ? Object.keys(kpis[0]) : ['ID', 'Employee', 'Title', 'Target', 'Status'];

  return (
    <div className="kpi-page">
      <div className="kpi-header">
        <div>
          <div className="kpi-badge">
            <Target size={18} />
            <span>{pageTitle}</span>
          </div>
          <h1>{pageTitle}</h1>
          <p>{pageSubtitle}</p>
        </div>
        <div className="kpi-header-actions">
          <Button variant="outline" size="md" onClick={() => (isMyKpi ? void loadMyKpis() : void loadKpis())} disabled={loading}>
            Refresh List
          </Button>
          {!isMyKpi && (
            <Button variant="primary" size="md" onClick={() => void handleSubmit('create')} disabled={loading}>
              Create KPI
            </Button>
          )}
        </div>
      </div>

      <div className="kpi-actions-grid">
        {!isMyKpi ? (
          <Card className="kpi-card" glass>
            <div className="kpi-card-title">
              <Users size={18} />
              <span>Search KPI by Employee</span>
            </div>
            <div className="kpi-form-row">
              <input
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                placeholder="employee_id"
              />
              <Button variant="secondary" size="md" onClick={loadKpisByEmployee} disabled={loading || !searchEmployee}>
                Search
              </Button>
            </div>
          </Card>
        ) : null}

        <Card className="kpi-card" glass>
          <div className="kpi-card-title">
            <FileText size={18} />
            <span>{isMyKpi ? 'Submit KPI for Review' : 'KPI Detail / Actions'}</span>
          </div>

          {!isMyKpi && (
            <p className="kpi-hint">
              Status flow: {KPI_STATUS_OPTIONS.join(' -> ')}. Score dihitung otomatis oleh backend: (achievement / target) * 100.
            </p>
          )}

          <div className="kpi-form-grid">
            <label>
              KPI ID
              <input
                value={String(formState.id ?? '')}
                onChange={(e) => handleFieldChange('id', e.target.value)}
                placeholder="id"
              />
            </label>

            {!isMyKpi && (
              <>
                <label>
                  Title
                  <input
                    value={formState.title ?? ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="title"
                  />
                </label>
                <label>
                  Target
                  <input
                    value={String(formState.target ?? '')}
                    onChange={(e) => handleFieldChange('target', e.target.value)}
                    placeholder="target"
                  />
                </label>
                <label>
                  Period
                  <input
                    value={String(formState.period ?? '')}
                    onChange={(e) => handleFieldChange('period', e.target.value)}
                    placeholder="Q1 2026"
                  />
                </label>
                <label className="kpi-full-width">
                  Description
                  <input
                    value={formState.description ?? ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="description"
                  />
                </label>
                <label>
                  Achievement
                  <input
                    value={String(formState.achievement ?? '')}
                    onChange={(e) => handleFieldChange('achievement', e.target.value)}
                    placeholder="achievement"
                  />
                </label>
              </>
            )}

            {isMyKpi ? (
              <label>
                Submit KPI ID
                <input
                  value={String(formState.id ?? '')}
                  onChange={(e) => handleFieldChange('id', e.target.value)}
                  placeholder="id"
                />
              </label>
            ) : (
              <label>
                Employee ID
                <input
                  value={String(formState.employee_id ?? '')}
                  onChange={(e) => handleFieldChange('employee_id', e.target.value)}
                  placeholder="employee_id"
                />
              </label>
            )}
          </div>

          <div className="kpi-action-buttons">
            {isMyKpi ? (
              <Button variant="primary" size="md" onClick={() => void handleSubmit('submit')} disabled={loading || !formState.id}>
                Submit KPI
              </Button>
            ) : (
              <>
                <Button variant="primary" size="md" onClick={() => void handleSubmit('detail')} disabled={loading || !formState.id}>
                  Get Detail
                </Button>
                <Button variant="secondary" size="md" onClick={() => void handleSubmit('update')} disabled={loading || !formState.id}>
                  Update KPI
                </Button>
                <Button variant="secondary" size="md" onClick={() => void handleSubmit('approve')} disabled={loading || !formState.id}>
                  Approve KPI
                </Button>
                <Button variant="ghost" size="md" onClick={() => void handleSubmit('delete')} disabled={loading || !formState.id}>
                  Delete KPI
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>

      <Card className="kpi-table-card" glass>
        <div className="kpi-table-header">
          <div>
            <h2>{isMyKpi ? 'My KPI List' : 'All KPI List'}</h2>
            <p>Data ditarik langsung dari API.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => (isMyKpi ? void loadMyKpis() : void loadKpis())} disabled={loading}>
            Refresh
          </Button>
        </div>

        <div className="ui-table-overflow">
          <table className="ui-table">
            <thead>
              <tr>
                {tableColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kpis.map((item, index) => (
                <tr key={`${item.id ?? index}`}>
                  {tableColumns.map((column) => (
                    <td key={`${item.id ?? index}-${column}`}>
                      {column.toLowerCase() === 'status' ? (
                        <span className={getStatusChipClass((item as any)[column])}>{formatCellValue((item as any)[column])}</span>
                      ) : (
                        formatCellValue((item as any)[column])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="kpi-response-card" glass>
        <div className="kpi-response-header">
          <ShieldCheck size={18} />
          <span>API Response</span>
        </div>
        <pre className="kpi-response">{responseText || 'Response akan tampil di sini.'}</pre>
        <div className="kpi-response-status">
          <span>{statusMessage}</span>
          {loading && <span className="kpi-loading">Loading…</span>}
        </div>
      </Card>
    </div>
  );
};

export default KpiPage;
