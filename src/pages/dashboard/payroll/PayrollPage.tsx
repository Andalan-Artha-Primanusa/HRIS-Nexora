import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import { CreditCard, FileText, ArrowRight } from 'lucide-react';
import './PayrollPage.css';

type PayrollRun = {
  id: string;
  period: string;
  employees: number;
  total: string;
  status: string;
};

const PayrollPage = () => {
  const [period, setPeriod] = useState('');
  const [statusMessage, setStatusMessage] = useState('Ready for payroll actions');
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<PayrollRun[]>([]);

  useEffect(() => {
    void loadPayroll();
  }, []);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2));
  };

  const loadPayroll = async () => {
    setLoading(true);
    setStatusMessage('Loading payroll overview...');
    setResponseText('');

    try {
      const result = await api.get('/payroll');
      const payload = result.data?.data ?? result.data;
      formatResponse(payload);
      if (Array.isArray(payload)) {
        setRuns(payload.map((item: any, index: number) => ({
          id: String(item.id ?? item.payroll_id ?? `${item.period ?? 'payroll'}-${index}`),
          period: item.period ?? item.name ?? 'unknown',
          employees: item.employee_count ?? item.employees ?? 0,
          total: item.total_amount ?? item.total ?? 'Rp 0',
          status: item.status ?? 'Ready',
        })));
      }
      setStatusMessage('Payroll overview loaded successfully.');
    } catch (error: any) {
      setStatusMessage('Unable to load payroll data.');
      formatResponse(error.response?.data ?? error.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const generatePayroll = async () => {
    setLoading(true);
    setStatusMessage('Generating monthly payroll...');
    setResponseText('');

    try {
      const result = await api.post('/payroll/generate/monthly', { period });
      formatResponse(result.data);
      setStatusMessage(`Payroll for ${period} generated successfully.`);
      void loadPayroll();
    } catch (error: any) {
      setStatusMessage('Failed to generate payroll.');
      formatResponse(error.response?.data ?? error.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payroll-page">
      <Card className="hero-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: 'var(--letter-spacing-wide)', textTransform: 'uppercase', color: 'var(--color-primary-dark)', marginBottom: 'var(--space-3)', background: 'var(--color-primary-lighter)' }}>
              <CreditCard size={16} />
              <span>Payroll Center</span>
            </div>
            <h1 className="hero-title" style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-2) 0', letterSpacing: 'var(--letter-spacing-tight)' }}>Payroll Management</h1>
            <p className="hero-subtitle" style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-secondary)', margin: '0', maxWidth: '50ch' }}>Manage monthly payroll, generate payslips, and review transactions.</p>
          </div>
          <div className="hero-actions" style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="outline" size="md" onClick={loadPayroll} disabled={loading}>
              Refresh Payroll
            </Button>
          </div>
        </div>
      </Card>

      <div className="payroll-grid">
        <Card className="payroll-card" glass>
          <div className="payroll-card-header">
            <div>
              <h3>Payroll Summary</h3>
              <p>Ringkasan run payroll dan status terbaru.</p>
            </div>
            <CreditCard size={22} />
          </div>
          <div className="payroll-stats">
            <div className="stat-card">
              <span>Last Run</span>
              <strong>{runs[0]?.period ?? '-'}</strong>
            </div>
            <div className="stat-card">
              <span>Employees</span>
              <strong>{runs.reduce((sum, item) => sum + item.employees, 0)}</strong>
            </div>
            <div className="stat-card">
              <span>Total Payroll</span>
              <strong>{runs[0]?.total ?? 'Rp 0'}</strong>
            </div>
          </div>
        </Card>

        <Card className="payroll-card" glass>
          <div className="payroll-card-header">
            <div>
              <h3>Generate Payroll</h3>
              <p>Jalankan payroll bulanan menggunakan endpoint Postman.</p>
            </div>
            <ArrowRight size={22} />
          </div>
          <div className="payroll-form">
            <label>
              Periode
              <input
                type="month"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="payroll-input"
              />
            </label>
            <Button variant="primary" size="md" onClick={generatePayroll} disabled={loading}>
              Generate Payroll
            </Button>
          </div>
        </Card>
      </div>

      <Card className="payroll-card payroll-table-card" glass>
        <div className="section-table-header">
          <div>
            <h2>Payroll Runs</h2>
            <p>Daftar payroll bulanan yang sudah diproses.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadPayroll} disabled={loading}>
            Reload
          </Button>
        </div>
        <div className="ui-table-overflow">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Employees</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((item) => (
                <tr key={item.id}>
                  <td>{item.period}</td>
                  <td>{item.employees}</td>
                  <td>{item.total}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="payroll-card payroll-response-card" glass>
        <div className="payroll-response-header">
          <FileText size={18} />
          <span>API Response</span>
        </div>
        <pre className="payroll-response">{responseText || 'Response will appear here after API calls.'}</pre>
        <div className="payroll-response-footer">
          <span>{statusMessage}</span>
          {loading && <span className="loading-indicator">Loading…</span>}
        </div>
      </Card>
    </div>
  );
};

export default PayrollPage;
