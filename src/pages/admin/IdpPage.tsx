import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Clock, BookOpen, TrendingUp } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { engagementService } from '@/features/engagement/api/engagement.service';

const IdpPage: React.FC = () => {
  const [, setIdp] = useState<any>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await engagementService.getIdps();
        setIdp(Array.isArray(data) ? data[0] : data.data?.[0] || data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-ess">ESS</span>
          <h1>Individual Development Plan (IDP)</h1>
          <p>Your personalized roadmap for career growth and skill development.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="primary">
            <Plus size={18} style={{ marginRight: '8px' }} />
            New Goal
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card glass style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#1e3a8a' }}>Development Goals 2026</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { title: 'Master Advanced React Patterns', category: 'Technical', progress: 65, deadline: 'June 2026' },
                { title: 'Public Speaking & Presentation', category: 'Soft Skill', progress: 30, deadline: 'August 2026' },
                { title: 'AWS Solutions Architect Associate', category: 'Certification', progress: 10, deadline: 'December 2026' },
              ].map((goal, i) => (
                <div key={i} style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                         <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>{goal.category}</span>
                         <h4 style={{ margin: '4px 0', fontSize: '1rem' }}>{goal.title}</h4>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Due: {goal.deadline}</span>
                   </div>
                   
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                         <div style={{ width: `${goal.progress}%`, height: '100%', background: '#2563eb' }}></div>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{goal.progress}%</span>
                   </div>

                   <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                      <Button variant="ghost" size="sm" style={{ fontSize: '0.75rem' }}>View Steps</Button>
                      <Button variant="ghost" size="sm" style={{ fontSize: '0.75rem' }}>Update Progress</Button>
                   </div>
                </div>
              ))}
            </div>
          </Card>

          <Card glass style={{ padding: '1.5rem' }}>
             <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#1e3a8a' }}>Action Items</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { task: 'Complete Epic React workshop', status: 'completed' },
                  { task: 'Read "Clean Code" by Robert C. Martin', status: 'pending' },
                  { task: 'Attend internal leadership training', status: 'pending' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                     {item.status === 'completed' ? <CheckCircle2 size={18} color="#10b981" /> : <Clock size={18} color="#f59e0b" />}
                     <span style={{ fontSize: '0.85rem', flex: 1, color: item.status === 'completed' ? '#94a3b8' : '#334155', textDecoration: item.status === 'completed' ? 'line-through' : 'none' }}>
                        {item.task}
                     </span>
                  </div>
                ))}
             </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <Card glass style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#2563eb' }}>
                 <TrendingUp size={40} />
              </div>
              <h4 style={{ margin: '0 0 0.5rem' }}>Career Path</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                 Current: <strong>Senior Developer</strong>
                 <br />
                 Target: <strong>Lead Developer</strong>
              </p>
              <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', marginBottom: '1rem' }}>
                 <div style={{ width: '45%', height: '100%', background: '#2563eb' }}></div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>45% Readiness for Lead role</span>
           </Card>

           <Card glass style={{ padding: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem' }}>Recommended Learning</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {[
                   { title: 'System Design 101', type: 'Course' },
                   { title: 'Mentorship Skills', type: 'Workshop' },
                 ].map((rec, i) => (
                   <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '8px' }}>
                         <BookOpen size={16} color="#2563eb" />
                      </div>
                      <div>
                         <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{rec.title}</div>
                         <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{rec.type}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default IdpPage;
