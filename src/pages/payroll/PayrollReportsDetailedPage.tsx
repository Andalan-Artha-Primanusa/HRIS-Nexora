import React, { useState, useEffect } from 'react';
import { FileText, Search, RefreshCw } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { payrollService, toSafeArray } from '@/features/payroll/api/payroll.service';
import '@/shared/styles/CrudPage.css';

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
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Financial Reports</span>
          <h1>Laporan Detail Payroll</h1>
          <p>Laporan komprehensif seluruh komponen penghasilan dan potongan karyawan.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadData()} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Total Take Home Pay</span>
              <p className="summary-card__subtitle">Net Disbursement</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <FileText size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{formatCurrency(totals.thp)}</div>
          <div className="summary-card__change">Total THP</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Total Potongan</span>
              <p className="summary-card__subtitle">Total Deductions</p>
            </div>
            <span className="summary-card__icon summary-card__icon--red">
              <FileText size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--red">{formatCurrency(totals.deductions)}</div>
          <div className="summary-card__change">Potongan seluruh karyawan</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Jumlah Entri</span>
              <p className="summary-card__subtitle">Processed</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <FileText size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{totals.records}</div>
          <div className="summary-card__change">Records</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Laporan Payroll</h3>
              <span className="wuw-count-badge">{filteredData.length} Records</span>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Cari karyawan..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Karyawan</th>
                  <th>Periode</th>
                  <th>Gaji Pokok</th>
                  <th>Tunjangan</th>
                  <th>Bonus</th>
                  <th>Potongan</th>
                  <th>THP</th>
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
                        <div className="cell-name">
                          <div className="cell-avatar">
                            {(item.employee?.user?.name || 'U')[0]}
                          </div>
                          <div className="cell-stacked">
                            <span className="cell-name-text">{item.employee?.user?.name || 'Unknown'}</span>
                            <span className="cell-stacked__sub">{item.employee?.employee_code || item.employee_id}</span>
                          </div>
                        </div>
                      </td>
                      <td>{item.period}</td>
                      <td>{formatCurrency(item.basic_salary)}</td>
                      <td>{formatCurrency(item.allowance)}</td>
                      <td style={{ color: '#10b981' }}>{formatCurrency(item.bonus)}</td>
                      <td style={{ color: '#ef4444' }}>{formatCurrency(item.total_deduction)}</td>
                      <td style={{ fontWeight: 800, color: '#2563eb' }}>{formatCurrency(item.take_home_pay)}</td>
                      <td><Badge variant={item.status === 'paid' ? 'success' : 'warning'}>{item.status}</Badge></td>
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
        </div>
      </div>
    </div>
  );
};

export default PayrollReportsDetailedPage;