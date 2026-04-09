import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import { FileText, Target, Users, ShieldCheck } from 'lucide-react';
import './KpiPage.css';

type KpiRecord = {
  id?: number | string;
  employee_id?: number | string;
  title?: string;
  description?: string;
  target?: number | string;
  achievement?: number | string;
  status?: string;
  approved?: boolean;
};

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

  const handleFieldChange = (key: keyof KpiRecord, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const loadKpis = async () => {
    setLoading(true);
    setStatusMessage('Memuat semua KPI...');
    setResponseText('');

    try {
      const result = await api.get('/kpis');
      const payload = result.data?.data ?? result.data;
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
      const result = await api.get('/my/kpi');
      const payload = result.data?.data ?? result.data;
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
      const result = await api.get(`/kpis/employee/${searchEmployee}`);
      const payload = result.data?.data ?? result.data;
      formatResponse(payload);
      setKpis(Array.isArray(payload) ? payload : [payload]);
      setStatusMessage('KPI per employee berhasil dimuat.');
    } catch (error: any) {
      setStatusMessage('Gagal memuat KPI per employee.');
      formatResponse(error.response?.data ?? error.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (action: string) => {
    setLoading(true);
    setResponseText('');
    setStatusMessage('Mengirim request...');

    try {
      let result;
      switch (action) {
        case 'create':
          result = await api.post('/kpis', {
            employee_id: Number(formState.employee_id),
            title: formState.title,
            description: formState.description,
            target: Number(formState.target),
          });
          break;
        case 'detail':
          result = await api.get(`/kpis/${formState.id}`);
          break;
        case 'update':
          result = await api.put(`/kpis/${formState.id}`, {
            title: formState.title,
            target: Number(formState.target),
            achievement: formState.achievement ? Number(formState.achievement) : undefined,
          });
          break;
        case 'delete':
          result = await api.delete(`/kpis/${formState.id}`);
          break;
        case 'approve':
          result = await api.put(`/kpis/${formState.id}/approve`);
          break;
        case 'submit':
          result = await api.post(`/my/kpi/${formState.id}/submit`);
          break;
        default:
          result = { data: { message: 'Action not configured' } };
      }

      formatResponse(result.data);
      setStatusMessage('Request berhasil.');
      if (isMyKpi) {
        void loadMyKpis();
      } else {
        void loadKpis();
      }
    } catch (error: any) {
      setStatusMessage('Request gagal.');
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
                      {String((item as any)[column] ?? '-')}
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
