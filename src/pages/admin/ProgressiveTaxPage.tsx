import React, { useState } from 'react';
import { TaxCalculator } from '@/features/legal/components/TaxCalculator';
import { legalService } from '@/features/legal/api/legal.service';
import '@/shared/styles/CrudPage.css';

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
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Finance & Legal</span>
          <h1>PPh21 Progressive Tax Calculator</h1>
          <p>Simulate progressive income tax calculations based on TER and PKP rules.</p>
        </div>
      </div>

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
