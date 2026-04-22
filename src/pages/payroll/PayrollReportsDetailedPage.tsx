import React, { useState, useEffect } from 'react';
import { FileText, Search, Download, RefreshCw, Eye } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await payrollService.getPayrollList();
      setData(toSafeArray(response));
    } catch (err: any) {
      setError(err.message || 'Gagal memuat laporan payroll');
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
          <Badge variant="ghost">Processed</Badge>
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
                        <div className="emp-avatar" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>
                          {(item.employee?.user?.name || 'U')[0]}
                        </div>
                        <div className="emp-info">
                          <span className="emp-name">{item.employee?.user?.name || 'Unknown'}</span>
                          <span className="emp-code">{item.employee?.employee_code || item.employee_id}</span>
                        </div>
                      </div>
                    </td>
                    <td><Badge variant="ghost">{item.period}</Badge></td>
                    <td>{formatCurrency(item.basic_salary)}</td>
                    <td className="text-green-600">+{formatCurrency(item.allowance)}</td>
                    <td className="text-green-600">+{formatCurrency(item.bonus)}</td>
                    <td className="text-red-600">-{formatCurrency(item.total_deduction)}</td>
                    <td className="font-bold">{formatCurrency(item.take_home_pay)}</td>
                    <td>
                      <Badge variant={
                        item.status === 'paid' ? 'success' : 
                        item.status === 'approved' ? 'info' : 
                        'warning'
                      }>
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
