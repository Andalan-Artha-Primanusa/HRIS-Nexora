import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings, DollarSign, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { workforceService } from '@/features/workforce/api/workforce.service';

const OvertimeRulesPage: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await workforceService.getOvertimeRules();
      setRules(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Workforce</span>
          <h1>Overtime Rules</h1>
          <p>Configure overtime multipliers, caps, and eligibility policies.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary" onClick={() => navigate('/workforce/overtime-rules/create')}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            New Rule
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>Loading...</div>
        ) : rules.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>No overtime rules configured.</div>
        ) : rules.map((rule) => (
          <Card key={rule.id} glass style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
               <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a' }}>{rule.name}</h3>
               <Settings size={18} color="#64748b" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                  <div style={{ padding: '6px', background: '#eff6ff', borderRadius: '6px' }}><DollarSign size={16} color="#2563eb" /></div>
                  <span>Multiplier: <strong>{rule.multiplier}x</strong></span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                  <div style={{ padding: '6px', background: '#fef2f2', borderRadius: '6px' }}><Clock size={16} color="#ef4444" /></div>
                  <span>Max Hours: <strong>{rule.max_hours_per_day}h / day</strong></span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                  <div style={{ padding: '6px', background: '#f0fdf4', borderRadius: '6px' }}><ShieldCheck size={16} color="#10b981" /></div>
                  <span>Eligibility: <strong>{rule.eligibility || 'All Staff'}</strong></span>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
               <Button variant="outline" style={{ flex: 1 }} onClick={() => navigate(`/workforce/overtime-rules/edit/${rule.id}`)}>Edit</Button>
               <Button variant="ghost" style={{ color: '#ef4444' }}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OvertimeRulesPage;

