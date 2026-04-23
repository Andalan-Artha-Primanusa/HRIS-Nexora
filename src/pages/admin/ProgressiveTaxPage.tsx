import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { TaxCalculator } from '@/features/legal/components/TaxCalculator';
import { legalService } from '@/features/legal/api/legal.service';
import { Card } from '@/shared/ui/Card';
import './ProgressiveTaxPage.css';

const ProgressiveTaxPage: React.FC = () => {
  const [income, setIncome] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (income <= 0) return;
    setLoading(true);
    try {
      const data = await legalService.calculateProgressiveTax(income);
      setResult(data.data || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="progressive-tax-container">
      <Card className="tax-hero-card" glass>
        <div className="tax-hero-copy">
          <span className="tax-badge">Legal & Compliance</span>
          <h1>Simulasi Pajak PPh21</h1>
          <p className="tax-description">
            Kalkulator simulasi pajak penghasilan karyawan berdasarkan aturan PPh Pasal 17 terbaru. 
            Gunakan modul ini untuk <strong>melakukan simulasi</strong> atau pengecekan estimasi potongan pajak secara mandiri 
            sebelum diproses dalam payroll resmi.
          </p>
        </div>
        <div className="tax-hero-icon">
          <ShieldCheck size={72} color="#2563eb" />
        </div>
      </Card>

      <TaxCalculator 
        income={income}
        setIncome={setIncome}
        result={result}
        loading={loading}
        onCalculate={handleCalculate}
      />
    </div>
  );
};

export default ProgressiveTaxPage;
