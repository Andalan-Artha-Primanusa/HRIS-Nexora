import React, { useState, useEffect } from 'react';
import { Calculator, User, FileText, Download, TrendingUp } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { legalService } from '@/features/legal/api/legal.service';
import '@/shared/styles/CrudPage.css';
import { api } from '@/shared/api/httpClient';

const SeveranceCalculatorPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get('/employees');
        setEmployees(response.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
  }, []);

  const handleCalculate = async () => {
    if (!selectedEmployee) return;
    setLoading(true);
    try {
      const data = await legalService.calculateSeverance(selectedEmployee);
      setCalculation(data.data || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Legal & Compliance</span>
          <h1>Severance Calculator</h1>
          <p>Automatic severance calculation based on PP 35/2021.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem' }}>
        <Card glass style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', color: '#1e3a8a' }}>Select Employee</h3>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Employee Name</label>
            <select 
              className="form-control" 
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">-- Choose Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>
              ))}
            </select>
          </div>
          <Button variant="primary" style={{ width: '100%' }} onClick={handleCalculate} disabled={!selectedEmployee || loading}>
            <Calculator size={18} style={{ marginRight: '8px' }} />
            {loading ? 'Calculating...' : 'Calculate Severance'}
          </Button>
        </Card>

        <Card glass style={{ padding: '1.5rem' }}>
          {calculation ? (
            <div className="calculation-result">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e3a8a' }}>Calculation Result</h3>
                <Button variant="outline">
                  <Download size={18} style={{ marginRight: '8px' }} />
                  Export Excel
                </Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div className="detail-item" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Service Period</span>
                  <div style={{ fontWeight: 600 }}>{calculation.service_period_formatted || 'N/A'}</div>
                </div>
                <div className="detail-item" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Basic Salary (Base)</span>
                  <div style={{ fontWeight: 600 }}>{formatCurrency(calculation.base_salary || 0)}</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Severance Pay (Uang Pesangon)</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(calculation.severance_pay || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Service Reward (UPMK)</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(calculation.service_reward || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Compensation (UPH)</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(calculation.compensation || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px solid #e2e8f0', fontSize: '1.25rem' }}>
                  <span style={{ fontWeight: 700, color: '#1e3a8a' }}>Total Severance</span>
                  <span style={{ fontWeight: 800, color: '#2563eb' }}>{formatCurrency(calculation.total_severance || 0)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <Calculator size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>Select an employee and click calculate to see results.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SeveranceCalculatorPage;
