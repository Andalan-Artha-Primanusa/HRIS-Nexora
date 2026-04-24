import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Download, RefreshCw } from 'lucide-react';
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

const PayrollTaxPage: React.FC = () => {
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
      setError(err.message || 'Gagal memuat data pajak & BPJS');
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
    pph21: acc.pph21 + (parseFloat(curr.pph21) || 0),
    bpjs: acc.bpjs + (parseFloat(curr.bpjs_kesehatan) || 0) + (parseFloat(curr.bpjs_ketenagakerjaan) || 0),
    records: acc.records + 1
  }), { pph21: 0, bpjs: 0, records: 0 });

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Compliance & Legal</span>
          <h1>Laporan Pajak & BPJS</h1>
          <p>Ringkasan potongan PPh21 dan iuran BPJS karyawan per periode penggajian.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadData()} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="crud-card" glass>
          <p>⚠️ {error}</p>
        </Card>
      )}

      <div className="summary-grid">
        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Total PPh21</span>
              <p className="summary-card__subtitle">Akumulasi</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <ShieldCheck size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{formatCurrency(totals.pph21)}</div>
          <div className="summary-card__change">Potongan pajak</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Total Iuran BPJS</span>
              <p className="summary-card__subtitle">Kesehatan & TK</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <ShieldCheck size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">{formatCurrency(totals.bpjs)}</div>
          <div className="summary-card__change">Iuran BPJS</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Jumlah Entri</span>
              <p className="summary-card__subtitle">Records</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <ShieldCheck size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{totals.records}</div>
          <div className="summary-card__change">Total records</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Data Kontribusi Pajak & BPJS</h3>
              <span className="wuw-count-badge">{filteredData.length} Records</span>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Cari karyawan atau kode..." 
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
                  <th>PPh21</th>
                  <th>BPJS Kesehatan</th>
                  <th>BPJS TK</th>
                  <th>Total Potongan</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10">Memuat data...</td>
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
                      <td><Badge variant="default">{item.period}</Badge></td>
                      <td style={{ fontWeight: 500 }}>{formatCurrency(item.basic_salary)}</td>
                      <td style={{ color: '#e11d48', fontWeight: 600 }}>{formatCurrency(item.pph21)}</td>
                      <td>{formatCurrency(item.bpjs_kesehatan)}</td>
                      <td>{formatCurrency(item.bpjs_ketenagakerjaan)}</td>
                      <td style={{ fontWeight: 800 }}>{formatCurrency(item.total_deduction)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10">Tidak ada data ditemukan.</td>
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

export default PayrollTaxPage;
