import React from 'react';
import { Calculator, Wallet, Download, Info } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';

interface TaxCalculatorProps {
  income: number;
  setIncome: (val: number) => void;
  result: any;
  loading: boolean;
  onCalculate: () => void;
}

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({ income, setIncome, result, loading, onCalculate }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem' }}>
      <Card glass style={{ padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', color: '#1e3a8a' }}>Income Details</h3>
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Annual Taxable Income (PKP)</label>
          <div style={{ position: 'relative' }}>
             <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>Rp</span>
             <input 
               type="number" 
               className="crud-input" 
               value={income}
               onChange={(e) => setIncome(Number(e.target.value))}
               style={{ paddingLeft: '45px', width: '100%' }}
               placeholder="Enter amount..."
             />
          </div>
        </div>
        <Button variant="primary" style={{ width: '100%' }} onClick={onCalculate} disabled={loading || income <= 0}>
          <Calculator size={18} style={{ marginRight: '8px' }} />
          {loading ? 'Calculating...' : 'Calculate Tax'}
        </Button>

        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f9ff', borderRadius: '12px', display: 'flex', gap: '10px' }}>
           <Info size={20} color="#0284c7" style={{ flexShrink: 0 }} />
           <p style={{ margin: 0, fontSize: '0.75rem', color: '#0369a1', lineHeight: 1.5 }}>
             Kalkulasi ini menggunakan tarif Pasal 17 ayat (1) huruf a UU PPh terbaru.
           </p>
        </div>
      </Card>

      <Card glass style={{ padding: '1.5rem' }}>
        {result ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e3a8a' }}>Simulation Result</h3>
              <Button variant="outline"><Download size={18} style={{ marginRight: '8px' }} /> Export</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
               <div className="stat-box">
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Annual PKP</div>
                  <div style={{ fontWeight: 700 }}>{formatCurrency(income)}</div>
               </div>
               <div className="stat-box" style={{ background: '#fff7ed' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9a3412' }}>Total Tax</div>
                  <div style={{ fontWeight: 700, color: '#c2410c' }}>{formatCurrency(result.total_tax || 0)}</div>
               </div>
               <div className="stat-box" style={{ background: '#f0fdf4' }}>
                  <div style={{ fontSize: '0.75rem', color: '#166534' }}>Net Income</div>
                  <div style={{ fontWeight: 700, color: '#15803d' }}>{formatCurrency(income - (result.total_tax || 0))}</div>
               </div>
            </div>

            <table className="crud-table">
               <thead>
                  <tr>
                    <th>Bracket</th>
                    <th>Taxable</th>
                    <th style={{ textAlign: 'right' }}>Tax</th>
                  </tr>
               </thead>
               <tbody>
                  {result.breakdown?.map((item: any, idx: number) => (
                    <tr key={idx}>
                       <td style={{ fontWeight: 600 }}>{item.rate}%</td>
                       <td>{formatCurrency(item.amount)}</td>
                       <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.tax)}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
             <Wallet size={48} />
             <p>Enter income details to see simulation.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
