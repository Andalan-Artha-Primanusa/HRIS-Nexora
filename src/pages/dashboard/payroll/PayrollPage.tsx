import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import { CreditCard, FileText, ArrowRight } from 'lucide-react';
import './PayrollPage.css';

type PayrollRun = {
  period: string;
  employees: number;
  total: string;
  status: string;
};

type Payslip = {
  employee: string;
  period: string;
  gross: string;
  net: string;
  status: string;
};

const samplePayrollRuns: PayrollRun[] = [
  { period: '2026-04', employees: 254, total: 'Rp 12.420.000.000', status: 'Processed' },
  { period: '2026-03', employees: 250, total: 'Rp 12.135.000.000', status: 'Completed' },
  { period: '2026-02', employees: 248, total: 'Rp 11.850.000.000', status: 'Completed' },
];

const samplePayslips: Payslip[] = [
  { employee: 'Agus Wijaya', period: '2026-04', gross: 'Rp 18.000.000', net: 'Rp 14.400.000', status: 'Issued' },
  { employee: 'Dewi Lestari', period: '2026-04', gross: 'Rp 16.500.000', net: 'Rp 13.200.000', status: 'Issued' },
  { employee: 'Rian Pratama', period: '2026-04', gross: 'Rp 15.200.000', net: 'Rp 12.160.000', status: 'Pending' },
];

const PayrollPage = () => {
  const [period, setPeriod] = useState('2026-04');
  const [statusMessage, setStatusMessage] = useState('Ready for payroll actions');
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<PayrollRun[]>(samplePayrollRuns);
  const [payslips, setPayslips] = useState<Payslip[]>(samplePayslips);

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
        setRuns(payload.map((item: any) => ({
          period: item.period ?? item.name ?? 'unknown',
          employees: item.employee_count ?? item.employees ?? 0,
          total: item.total_amount ?? item.total ?? 'Rp 0',
          status: item.status ?? 'Ready',
        })));
      }
      setStatusMessage('Payroll overview loaded successfully.');
    } catch (error: any) {
      setStatusMessage('Unable to load payroll data. Using sample preview.');
      formatResponse(error.response?.data ?? error.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const loadPayslips = async () => {
    setLoading(true);
    setStatusMessage('Loading payslip preview...');
    setResponseText('');

    try {
      const result = await api.get('/payroll/payslip');
      const payload = result.data?.data ?? result.data;
      formatResponse(payload);
      if (Array.isArray(payload)) {
        setPayslips(payload.map((item: any) => ({
          employee: item.employee_name ?? item.employee ?? 'Unknown',
          period: item.period ?? 'Unknown',
          gross: item.gross_salary ?? item.gross ?? 'Rp 0',
          net: item.net_salary ?? item.net ?? 'Rp 0',
          status: item.status ?? 'Ready',
        })));
      }
      setStatusMessage('Payslip preview loaded successfully.');
    } catch (error: any) {
      setStatusMessage('Unable to load payslip preview. Using sample data.');
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
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll Management</h1>
          <p className="page-subtitle text-gray">Kelola payroll, generate payroll bulanan, dan review payslip karyawan.</p>
        </div>
        <div className="page-actions">
          <Button variant="outline" size="md" onClick={loadPayroll} disabled={loading}>
            Refresh Payroll
          </Button>
          <Button variant="primary" size="md" onClick={loadPayslips} disabled={loading}>
            Refresh Payslip
          </Button>
        </div>
      </div>

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
              <strong>2026-04</strong>
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
                <tr key={item.period}>
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

      <Card className="payroll-card payroll-table-card" glass>
        <div className="section-table-header">
          <div>
            <h2>Recent Payslips</h2>
            <p>Preview slip gaji terbaru untuk karyawan Anda.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadPayslips} disabled={loading}>
            Reload Payslips
          </Button>
        </div>
        <div className="ui-table-overflow">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Period</th>
                <th>Gross</th>
                <th>Net</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((item) => (
                <tr key={`${item.employee}-${item.period}`}>
                  <td>{item.employee}</td>
                  <td>{item.period}</td>
                  <td>{item.gross}</td>
                  <td>{item.net}</td>
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
