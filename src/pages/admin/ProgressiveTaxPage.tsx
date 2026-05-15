import React, { useState } from 'react';
import { BookTemplate, RefreshCw, Shield } from 'lucide-react';
import { TaxCalculator } from '@/features/legal/components/TaxCalculator';
import { legalService } from '@/features/legal/api/legal.service';
import { Card } from '@/shared/ui/Card';
import { useAuthStore } from '@/app/store/auth.store';
import { RBACUtils } from '@/shared/hooks/rbac';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
import './ProgressiveTaxPage.css';

const ProgressiveTaxPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const canAccess = RBACUtils.hasPermission(user, 'payroll.view');
  if (!canAccess) {
    return (
      <div className="crud-page"><Card className="hero-card"><div className="hero-card-inner"><div className="hero-content"><div className="hero-badge"><Shield size={16} /><span>Admin Center</span></div><h1 className="hero-title">Akses Ditolak</h1><p className="hero-subtitle">Anda tidak memiliki izin untuk mengakses halaman ini.</p></div></div></Card></div>
    );
  }
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
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <BookTemplate size={16} />
              <span>Legal & Kepatuhan</span>
            </div>
            <h1 className="hero-title">Simulasi Pajak PPh21</h1>
            <p className="hero-subtitle">
              Kalkulator simulasi pajak penghasilan karyawan berdasarkan aturan PPh Pasal 17 terbaru.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => window.location.reload()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
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
