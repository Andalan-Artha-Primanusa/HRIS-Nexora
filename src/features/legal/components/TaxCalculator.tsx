import React, { useEffect, useState } from 'react';
import { Calculator, Wallet, Download, Info } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TaxCalculatorProps {
  income: number;
  setIncome: (val: number) => void;
  result: any;
  loading: boolean;
  onCalculate: () => void;
}

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({ income, setIncome, result, loading, onCalculate }) => {
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await api.get('/company');
        const data = response.data;
        const companyData = Array.isArray(data) ? data[0] : data.data || data;
        if (companyData) {
          setCompany(companyData);
        }
      } catch (err) {
        console.error('Failed to fetch company', err);
      }
    };
    fetchCompany();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();

    // Company Header
    if (company) {
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text(company.name || 'Company', 105, 12, { align: 'center' });
      doc.setFontSize(8);
      if (company.address) doc.text(company.address, 105, 19, { align: 'center' });
      if (company.tax_number) doc.text(`NPWP: ${company.tax_number}`, 105, 26, { align: 'center' });
    }

    doc.setFillColor(37, 99, 235);
    doc.rect(0, company ? 35 : 0, 210, company ? 15 : 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('Tax Calculation', 105, company ? 45 : 25, { align: 'center' });

    const startY = company ? 55 : 35;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Tax Simulation Result', 20, startY);
    doc.setFontSize(10);
    doc.text(`Total PKP: ${formatCurrency(income)}`, 20, startY + 8);
    doc.text(`Total Tax: ${formatCurrency(result.tax || result.total_tax || 0)}`, 20, startY + 14);
    doc.text(`Take Home Pay: ${formatCurrency(income - (result.tax || result.total_tax || 0))}`, 20, startY + 20);

    if (result.breakdown?.length > 0) {
      autoTable(doc, {
        startY: startY + 28,
        head: [['Layer (Rate)', 'Tax Base', 'Tax Amount']],
        body: result.breakdown.map((item: any) => [
          `${item.rate}%`,
          formatCurrency(item.amount),
          formatCurrency(item.tax)
        ]),
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
      });
    }

    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 105, 290, { align: 'center' });
    if (company?.name) doc.text(company.name, 105, 286, { align: 'center' });

    doc.save('tax-calculation.pdf');
  };

  return (
    <div className="tax-grid">
      <Card glass className="tax-input-card">
        <div className="card-inner">
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#1e3a8a', fontWeight: 700 }}>
            Detail Penghasilan
          </h3>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
              Penghasilan Kena Pajak (PKP) Tahunan
            </label>
            <div style={{ position: 'relative' }}>
               <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#2563eb' }}>Rp</span>
               <input 
                 type="number" 
                 className="crud-input" 
                 value={income}
                 onChange={(e) => setIncome(Number(e.target.value))}
                 style={{ paddingLeft: '45px', width: '100%', fontSize: '1.1rem', fontWeight: 600 }}
                 placeholder="0"
               />
            </div>
          </div>
          <Button variant="primary" style={{ width: '100%', height: '48px', fontSize: '1rem' }} onClick={onCalculate} disabled={loading || income <= 0}>
            <Calculator size={20} style={{ marginRight: '8px' }} />
            {loading ? 'Menghitung...' : 'Hitung Simulasi Pajak'}
          </Button>

          <div className="tax-info-box">
             <Info size={20} style={{ flexShrink: 0 }} />
             <p>
               Kalkulasi ini menggunakan tarif Pasal 17 ayat (1) huruf a UU PPh (UU HPP) terbaru dengan mekanisme tarif progresif.
             </p>
          </div>
        </div>
      </Card>

      <Card glass className="tax-result-card">
        {result ? (
          <div className="card-inner">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e3a8a', fontWeight: 700 }}>Hasil Simulasi</h3>
                <Button variant="outline" size="sm" onClick={exportPDF}>
                  <Download size={16} style={{ marginRight: '8px' }} /> Export PDF
                </Button>
              </div>

            <div className="tax-stat-grid">
               <div className="tax-stat-box">
                  <div className="label">Total PKP</div>
                  <div className="value">{formatCurrency(income)}</div>
               </div>
                <div className="tax-stat-box highlight-red">
                   <div className="label">Total Pajak</div>
                   <div className="value">{formatCurrency(result.tax || result.total_tax || 0)}</div>
                </div>
                <div className="tax-stat-box highlight-green">
                   <div className="label">Take Home Pay</div>
                   <div className="value">{formatCurrency(income - (result.tax || result.total_tax || 0))}</div>
                </div>
            </div>

            <div className="tax-table-container">
              <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#64748b' }}>Rincian Lapisan Pajak (Layer)</h4>
              <table className="crud-table">
                 <thead>
                    <tr>
                      <th>Lapisan (Rate)</th>
                      <th>Dasar Pengenaan</th>
                      <th style={{ textAlign: 'right' }}>Nominal Pajak</th>
                    </tr>
                 </thead>
                 <tbody>
                    {result.breakdown?.map((item: any, idx: number) => (
                      <tr key={idx}>
                         <td style={{ fontWeight: 700, color: '#2563eb' }}>{item.rate}%</td>
                         <td>{formatCurrency(item.amount)}</td>
                         <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(item.tax)}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: '3rem' }}>
             <Wallet size={64} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
             <p style={{ fontSize: '1.1rem' }}>Masukkan nominal penghasilan untuk melihat simulasi pajak.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
