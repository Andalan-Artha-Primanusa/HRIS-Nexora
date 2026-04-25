import React, { useState, useEffect } from 'react';
import { Calculator, Download, RefreshCw, BookTemplate, Plus } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { getAllEmployees } from '@/features/employee/api/employee.service';
import { legalService } from '@/features/legal/api/legal.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const SeveranceCalculatorPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [calculation, setCalculation] = useState<any>(null);
  const [joinDate, setJoinDate] = useState('');
  const [terminationDate, setTerminationDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getAllEmployees();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  const handleEmployeeChange = (id: string) => {
    setSelectedEmployee(id);
    const emp = employees.find(e => String(e.id) === id);
    if (emp && emp.hire_date) {
      setJoinDate(emp.hire_date.split('T')[0]);
    } else {
      setJoinDate('');
    }
    setCalculation(null);
    setError(null);
  };

  const handleCalculate = async () => {
    if (!selectedEmployee || !joinDate || !terminationDate) {
      setError('Harap pilih karyawan, tanggal masuk, dan tanggal keluar.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await legalService.calculateSeverance(selectedEmployee, {
        join_date: joinDate,
        termination_date: terminationDate
      });
      setCalculation(data.data || data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Gagal menghitung pesangon');
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
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <BookTemplate size={16} />
              <span>Legal & Kepatuhan</span>
            </div>
            <h1 className="hero-title">Kalkulator Pesangon</h1>
            <p className="hero-subtitle">
              Perhitungan pesangon otomatis berdasarkan PP 35/2021.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => window.location.reload()}>
              <RefreshCw size={16} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        <Card glass style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--cr-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '12px', color: '#2563eb' }}>
              <Calculator size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Select Employee</h3>
          </div>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Employee Name
            </label>
            <select 
              className="form-control" 
              value={selectedEmployee}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              style={{ 
                width: '100%', 
                height: '50px', 
                borderRadius: '14px', 
                border: '1px solid #e2e8f0',
                padding: '0 1rem',
                fontSize: '0.95rem',
                background: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <option value="">-- Choose Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name || emp.user?.name || emp.name || 'Unknown'} ({emp.employee_id || emp.employee_code || '#'+emp.id})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Join Date
              </label>
              <input 
                type="date" 
                className="form-control"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Termination Date
              </label>
              <input 
                type="date" 
                className="form-control"
                value={terminationDate}
                onChange={(e) => setTerminationDate(e.target.value)}
                style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: '1.5rem', padding: '12px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#dc2626', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span> {error}
            </div>
          )}
          
          <Button 
            variant="primary" 
            style={{ width: '100%', height: '54px', borderRadius: '16px', fontSize: '1rem', fontWeight: 600, boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)' }} 
            onClick={handleCalculate} 
            disabled={!selectedEmployee || !joinDate || !terminationDate || loading}
          >
            <Calculator size={20} style={{ marginRight: '10px' }} />
            {loading ? 'Calculating...' : 'Calculate Severance'}
          </Button>

          <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#f0f9ff', borderRadius: '16px', border: '1px dashed #bae6fd' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#0369a1', lineHeight: 1.5 }}>
              <strong>Note:</strong> Calculation includes Severance Pay (Pesangon), Service Reward (UPMK), and Compensation (UPH) as per government regulations.
            </p>
          </div>
        </Card>

        <Card glass style={{ padding: '0', borderRadius: '24px', border: '1px solid var(--cr-border)', overflow: 'hidden' }}>
          {calculation ? (
            <div className="calculation-result">
              <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.4)' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Calculation Summary</h3>
                <Button variant="outline" style={{ borderRadius: '10px' }}>
                  <Download size={18} style={{ marginRight: '8px' }} />
                  Export PDF
                </Button>
              </div>

              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Service Period</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>{calculation.service_period_formatted || 'N/A'}</div>
                  </div>
                  <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Basic Salary (Base)</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>{formatCurrency(calculation.base_salary || 0)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Severance Pay (Uang Pesangon)</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{formatCurrency(calculation.severance_pay || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Service Reward (UPMK)</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{formatCurrency(calculation.service_reward || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Compensation (UPH)</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{formatCurrency(calculation.compensation || 0)}</span>
                  </div>
                  
                  <div style={{ 
                    marginTop: '1.5rem', 
                    padding: '2rem', 
                    background: 'linear-gradient(135deg, #2563eb, #1e40af)', 
                    borderRadius: '20px', 
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, marginBottom: '4px' }}>Total Payout Amount</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{formatCurrency(calculation.total_severance || 0)}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '14px' }}>
                      <Calculator size={32} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: '3rem', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#cbd5e1' }}>
                <Calculator size={40} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: '#475569', fontWeight: 700 }}>Ready to Calculate</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', maxWidth: '300px' }}>Select an employee from the list to compute their severance package according to PP 35/2021.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SeveranceCalculatorPage;
