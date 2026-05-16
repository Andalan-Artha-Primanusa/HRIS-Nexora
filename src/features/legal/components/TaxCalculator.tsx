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

  const formatCurrency = (amount: number) => `Rp ${(amount || 0).toLocaleString("id-ID")}`;

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const pageWidth = 210;
    const margin = 20;

    // Professional Header
    doc.setFillColor(20, 30, 48);
    doc.rect(0,0, pageWidth, 50, 'F');
    doc.setFillColor(37, 99, 235);
    doc.rect(0,0, pageWidth, 3, 'F');

    // Company Info
    if (company) {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(String(company.name || 'Company'), pageWidth / 2, 18, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      
      doc.setFontSize(9);
      const addr = [company.address, company.city, company.state].filter((v: any) => v).join(', ');
      if (addr) doc.text(addr, pageWidth / 2, 26, { align: 'center' });
      
      const contact = [company.phone, company.email].filter((v: any) => v).join(' | ');
      if (contact) doc.text(contact, pageWidth / 2, 32, { align: 'center' });
      if (company.tax_number) {
        doc.text(`NPWP: ${company.tax_number}`, pageWidth / 2, 38, { align: 'center' });
      }
    }

    // Title
    doc.setTextColor(20, 30, 48);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX CALCULATION REPORT', pageWidth / 2, 62, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Based on UU PPh (UU HPP) - Progressive Tax Rates', pageWidth / 2, 68, { align: 'center' });

    // Divider
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, 72, pageWidth - margin, 72);

    // Income Info Box
    const infoStartY = 80;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, infoStartY, pageWidth - (margin * 2), 30, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, infoStartY, pageWidth - (margin * 2), 30, 3, 3, 'S');

    doc.setTextColor(20, 30, 48);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX CALCULATION DETAILS', margin + 8, infoStartY + 10);
    doc.setFont('helvetica', 'normal');
    
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`Annual Taxable Income (PKP): ${formatCurrency(income)}`, margin + 8, infoStartY + 18);
    doc.text(`Total Tax Payable: ${formatCurrency(result.tax || result.total_tax || 0)}`, margin + 8, infoStartY + 24);
    doc.text(`Take Home Pay: ${formatCurrency(income - (result.tax || result.total_tax || 0))}`, margin + 100, infoStartY + 18);
    doc.text(`Reference: Government Regulation - Progressive Rates`, margin + 100, infoStartY + 24);

    // Tax Breakdown Table
    if (result.breakdown?.length > 0) {
      autoTable(doc, {
        startY: infoStartY + 38,
        head: [['Tax Layer (Rate)', 'Tax Base', 'Tax Amount']],
        body: result.breakdown.map((item: any) => [
          `${item.rate}%`,
          formatCurrency(item.amount),
          formatCurrency(item.tax)
        ]),
        styles: { fontSize: 10, cellPadding: 7, lineColor: [230, 230, 230] },
        headStyles: { 
          fillColor: [20, 30, 48], 
          textColor: [255, 255, 255], 
          fontStyle: 'bold',
          halign: 'left'
        },
        columnStyles: { 
          0: { fontStyle: 'bold', cellWidth: 60, fillColor: [248, 250, 252] }, 
          2: { halign: 'right', fontStyle: 'bold' } 
        },
        alternateRowStyles: { fillColor: [252, 252, 253] }
      });
    }

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    const footerY = 285;
    doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, margin, footerY);
    doc.text(`Powered by ${company?.name || 'HRIS System'}`, pageWidth / 2, footerY, { align: 'center' });
    doc.text('Page 1 of 1', pageWidth - margin, footerY, { align: 'right' });

    // Save
    doc.save(`TaxCalculation_${new Date().getTime()}.pdf`);
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
                  type="text" 
                  inputMode="numeric"
                  className="crud-input" 
                  value={income ? Number(income).toLocaleString("id-ID") : ""}
                  onChange={(e) => setIncome(Number(e.target.value.replace(/\D/g, "")) || 0)}
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
