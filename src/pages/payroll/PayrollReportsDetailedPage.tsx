import React, { useState, useEffect } from 'react';
import { FileText, Search, Download, RefreshCw } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { payrollService, toSafeArray } from '@/features/payroll/api/payroll.service';
import './PayrollDetailedPages.css';

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num || 0);
};

const PayrollReportsDetailedPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await payrollService.getPayrollList();
      setData(toSafeArray(response));
    } catch (err: any) {
      console.error("Failed to load payroll reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredData = data.filter(item => {
    const empName = item.employee?.user?.name || '';
    const empCode = item.employee?.employee_code || '';
    return empName.toLowerCase().includes(search.toLowerCase()) || 
           empCode.toLowerCase().includes(search.toLowerCase());
  });

  const totals = data.reduce((acc, curr) => ({
    thp: acc.thp + (parseFloat(curr.take_home_pay) || 0),
    deductions: acc.deductions + (parseFloat(curr.total_deduction) || 0),
    records: acc.records + 1
  }), { thp: 0, deductions: 0, records: 0 });

  return (
    <div className="payroll-detailed-page">
      <Card className="detailed-hero-card detailed-hero-purple" glass>
        <div className="detailed-hero-copy">
          <span className="detailed-badge">Financial Reports</span>
          <h1>Laporan Detail Payroll</h1>
          <p>Laporan komprehensif seluruh komponen penghasilan dan potongan karyawan.</p>
        </div>
        <div className="detailed-hero-icon">
          <FileText size={72} color="#8b5cf6" />
        </div>
      </Card>

      <div className="detailed-stats-grid">
        <Card className="mini-stat-card" glass>
          <span className="stat-label">Total Take Home Pay</span>
          <span className="stat-value">{formatCurrency(totals.thp)}</span>
          <Badge variant="success">Net Disbursement</Badge>
        </Card>
        <Card className="mini-stat-card" glass>
          <span className="stat-label">Total Potongan</span>
          <span className="stat-value text-red-600">{formatCurrency(totals.deductions)}</span>
          <Badge variant="danger">Total Deductions</Badge>
        </Card>
        <Card className="mini-stat-card" glass>
          <span className="stat-label">Jumlah Entri</span>
          <span className="stat-value">{totals.records}</span>
          <Badge variant="default">Processed</Badge>
        </Card>
      </div>

      <div className="detailed-actions-bar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Cari karyawan atau kode..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="action-buttons">
          <Button variant="outline" size="md" onClick={() => void loadData()} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary" size="md">
            <Download size={18} style={{ marginRight: '8px' }} />
            Unduh Excel
          </Button>
        </div>
      </div>

      <Card className="detailed-table-card" glass>
        <div className="table-header">
          <h2>Rincian Penggajian Karyawan</h2>
          <Badge variant="info">{filteredData.length} Records</Badge>
        </div>

        <div className="ui-table-overflow">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Periode</th>
                <th>Gaji Pokok</th>
                <th>Tunjangan</th>
                <th>Bonus</th>
                <th>Potongan</th>
                <th>Gaji Bersih (THP)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">Memuat data...</td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="employee-cell">
                        <div className="emp-avatar" style={{ 
                          background: 'linear-gradient(135deg, #8b5cf620 0%, #8b5cf640 100%)', 
                          color: '#5b21b6',
                          boxShadow: 'inset 0 0 0 1px rgba(139, 92, 246, 0.1)'
                        }}>
                          {(item.employee?.user?.name || 'U')[0]}
                        </div>
                        <div className="emp-info">
                          <span className="emp-name" style={{ color: '#0f172a' }}>{item.employee?.user?.name || 'Unknown'}</span>
                          <span className="emp-code" style={{ letterSpacing: '0.05em' }}>{item.employee?.employee_code || item.employee_id}</span>
                        </div>
                      </div>
                    </td>
                    <td><Badge variant="default" style={{ fontWeight: 600 }}>{item.period}</Badge></td>
                    <td style={{ color: '#475569' }}>{formatCurrency(item.basic_salary)}</td>
                    <td style={{ color: '#059669', fontWeight: 600 }}>+{formatCurrency(item.allowance)}</td>
                    <td style={{ color: '#059669', fontWeight: 600 }}>+{formatCurrency(item.bonus)}</td>
                    <td style={{ color: '#e11d48', fontWeight: 600 }}>-{formatCurrency(item.total_deduction)}</td>
                    <td style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem' }}>{formatCurrency(item.take_home_pay)}</td>
                    <td>
                      <Badge 
                        variant={
                          item.status === 'paid' ? 'success' : 
                          item.status === 'approved' ? 'info' : 
                          'warning'
                        }
                        style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem' }}
                      >
                        {item.status?.toUpperCase() || 'DRAFT'}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-10">Tidak ada data ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PayrollReportsDetailedPage;
