import React, { useState, useEffect } from 'react';
import { Layers, Search, Filter, Download, User, ArrowRight } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { engagementService } from '@/features/engagement/api/engagement.service';

const SuccessionMatrixPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await engagementService.getSuccessionMatrix();
        setData(Array.isArray(res) ? res : res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 9-Box Grid Mockup
  const gridLabels = [
    { x: 'Potential', y: 'Performance' },
    ['Risk', 'Inconsistent', 'Average'],
    ['Emerging', 'Core Employee', 'High Professional'],
    ['Future Star', 'Rising Star', 'Star Player']
  ];

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Talent Management</span>
          <h1>Succession Planning (9-Box Grid)</h1>
          <p>Identify future leaders and map talent potential across the organization.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline">
            <Download size={18} style={{ marginRight: '8px' }} />
            Export Matrix
          </Button>
          <Button variant="primary">
            Review Sessions
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
        <Card glass style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', marginBottom: '1rem', alignItems: 'center', gap: '1rem' }}>
             <div style={{ transform: 'rotate(-90deg)', fontWeight: 700, color: '#64748b', fontSize: '0.85rem' }}>POTENTIAL</div>
             <div style={{ flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: '12px', height: '600px' }}>
                   {[
                     { label: 'Talent Risk', color: '#fee2e2', text: '#ef4444' },
                     { label: 'Inconsistent', color: '#fef3c7', text: '#f59e0b' },
                     { label: 'Potential Gem', color: '#dcfce7', text: '#10b981' },
                     { label: 'Solid Pro', color: '#fef3c7', text: '#f59e0b' },
                     { label: 'Core Employee', color: '#dcfce7', text: '#10b981' },
                     { label: 'High Flyer', color: '#dcfce7', text: '#10b981' },
                     { label: 'Average', color: '#dcfce7', text: '#10b981' },
                     { label: 'Rising Star', color: '#dcfce7', text: '#10b981' },
                     { label: 'Star / Key Talent', color: '#dcfce7', text: '#10b981', border: '2px solid #10b981' },
                   ].reverse().map((box, i) => (
                     <div key={i} style={{ 
                       background: box.color, 
                       borderRadius: '12px', 
                       padding: '1rem', 
                       display: 'flex', 
                       flexDirection: 'column',
                       border: box.border || '1px solid transparent',
                       position: 'relative'
                     }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: box.text, textTransform: 'uppercase' }}>{box.label}</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                           {/* Mock Avatars */}
                           {i % 2 === 0 && <div title="Employee A" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'white', border: '1px solid #ddd' }}></div>}
                           {i === 0 && <div title="Employee B" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'white', border: '1px solid #ddd' }}></div>}
                        </div>
                     </div>
                   ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: '1rem', fontWeight: 700, color: '#64748b', fontSize: '0.85rem' }}>PERFORMANCE</div>
             </div>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <Card glass style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#1e3a8a' }}>Succession Pool</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {data.map((item, idx) => (
                   <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.position_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>Current: {item.incumbent_name}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                         {item.successors?.map((s: any, si: number) => (
                           <div key={si} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                              <span style={{ color: '#334155' }}>{s.employee_name}</span>
                              <span style={{ 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                background: s.readiness === 'ready-now' ? '#dcfce7' : '#fef3c7',
                                color: s.readiness === 'ready-now' ? '#166534' : '#92400e',
                                fontSize: '0.65rem',
                                fontWeight: 700
                              }}>
                                {s.readiness.replace('-', ' ')}
                              </span>
                           </div>
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           <Card glass style={{ padding: '1.5rem', background: '#eff6ff' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#1e40af' }}>Talent Calibration</h3>
              <p style={{ fontSize: '0.85rem', color: '#1e3a8a', marginBottom: '1rem' }}>
                Next calibration session is scheduled for <strong>June 15, 2026</strong>.
              </p>
              <Button variant="primary" style={{ width: '100%' }}>
                Join Session
              </Button>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default SuccessionMatrixPage;
