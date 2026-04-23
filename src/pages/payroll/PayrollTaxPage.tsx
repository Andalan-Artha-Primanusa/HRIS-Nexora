import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Download, RefreshCw } from 'lucide-react';
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
    <div className="payroll-detailed-page">
      <Card className="detailed-hero-card" glass>
        <div className="detailed-hero-copy">
          <span className="detailed-badge">Compliance & Legal</span>
          <h1>Laporan Pajak & BPJS</h1>
          <p>Ringkasan potongan PPh21 dan iuran BPJS karyawan per periode penggajian.</p>
        </div>
        <div className="detailed-hero-icon">
          <ShieldCheck size={72} color="#0ea5e9" />
        </div>
      </Card>

      <div className="detailed-stats-grid">
        <Card className="mini-stat-card" glass>
          <span className="stat-label">Total PPh21</span>
          <span className="stat-value">{formatCurrency(totals.pph21)}</span>
          <Badge variant="info">Akumulasi</Badge>
        </Card>
        <Card className="mini-stat-card" glass>
          <span className="stat-label">Total Iuran BPJS</span>
          <span className="stat-value">{formatCurrency(totals.bpjs)}</span>
          <Badge variant="warning">Kesehatan & TK</Badge>
        </Card>
        <Card className="mini-stat-card" glass>
          <span className="stat-label">Jumlah Entri</span>
          <span className="stat-value">{totals.records}</span>
          <Badge variant="default">Records</Badge>
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
            Ekspor Data
          </Button>
        </div>
      </div>

      {error && (
        <Card className="detailed-error-card" glass>
          <p>⚠️ {error}</p>
        </Card>
      )}

      <Card className="detailed-table-card" glass>
        <div className="table-header">
          <h2>Data Kontribusi Pajak & BPJS</h2>
          <Badge variant="info">{filteredData.length} Records</Badge>
        </div>

        <div className="ui-table-overflow">
          <table className="premium-table">
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
                      <div className="employee-cell">
                        <div className="emp-avatar" style={{ 
                          background: 'linear-gradient(135deg, #0ea5e920 0%, #0ea5e940 100%)', 
                          color: '#0369a1',
                          boxShadow: 'inset 0 0 0 1px rgba(14, 165, 233, 0.1)'
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
                    <td style={{ fontWeight: 500, color: '#475569' }}>{formatCurrency(item.basic_salary)}</td>
                    <td style={{ color: '#e11d48', fontWeight: 600 }}>{formatCurrency(item.pph21)}</td>
                    <td style={{ color: '#ea580c', fontWeight: 500 }}>{formatCurrency(item.bpjs_kesehatan)}</td>
                    <td style={{ color: '#ea580c', fontWeight: 500 }}>{formatCurrency(item.bpjs_ketenagakerjaan)}</td>
                    <td style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem' }}>{formatCurrency(item.total_deduction)}</td>
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
      </Card>
    </div>
  );
};

export default PayrollTaxPage;
