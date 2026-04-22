import React, { useState, useEffect } from 'react';
import { Target, Search, Filter, Download, Star, Award, User } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { trainingService } from '@/features/training/api/training.service';

const CompetencyMatrixPage: React.FC = () => {
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await trainingService.getCompetencies();
        setCompetencies(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert': return '#8b5cf6';
      case 'advanced': return '#2563eb';
      case 'intermediate': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Competency</span>
          <h1>Competency Matrix</h1>
          <p>Mapping employee skills, technical expertise, and core competencies.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline">
            <Download size={18} style={{ marginRight: '8px' }} />
            Export Matrix
          </Button>
          <Button variant="primary">
            Assign Skills
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
        <Card glass style={{ padding: '1.5rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a' }}>Skill Inventory</h3>
             <div style={{ position: 'relative', width: '250px' }}>
               <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
               <input type="text" className="form-control" placeholder="Search skills..." style={{ paddingLeft: '32px', fontSize: '0.85rem' }} />
             </div>
           </div>

           <div className="crud-table-wrap">
             <table className="crud-table">
               <thead>
                 <tr>
                   <th>Competency Name</th>
                   <th>Category</th>
                   <th>Required Level</th>
                   <th>Assigned Employees</th>
                   <th style={{ textAlign: 'right' }}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {loading ? (
                   <tr><td colSpan={5} style={{ textAlign: 'center' }}>Loading...</td></tr>
                 ) : (
                   competencies.map((c) => (
                     <tr key={c.id}>
                       <td style={{ fontWeight: 600 }}>{c.name}</td>
                       <td><span className="category-tag">{c.category}</span></td>
                       <td>
                         <span style={{ 
                           padding: '2px 8px', 
                           borderRadius: '4px', 
                           fontSize: '0.75rem', 
                           fontWeight: 700, 
                           color: 'white',
                           background: getLevelColor(c.level)
                         }}>
                           {c.level.toUpperCase()}
                         </span>
                       </td>
                       <td>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                           <User size={14} color="#64748b" />
                           <span>12 Employees</span>
                         </div>
                       </td>
                       <td>
                         <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                           <Button variant="ghost" size="sm">View Matrix</Button>
                         </div>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <Card glass style={{ padding: '1.5rem' }}>
             <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#1e3a8a' }}>Skill Gap Analysis</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { name: 'React Native', current: 65, target: 80 },
                  { name: 'Cloud Infrastructure', current: 40, target: 75 },
                  { name: 'Financial Planning', current: 90, target: 85 },
                ].map((skill, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600 }}>{skill.name}</span>
                      <span style={{ color: skill.current < skill.target ? '#ef4444' : '#10b981' }}>{skill.current}% / {skill.target}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${skill.current}%`, height: '100%', background: skill.current < skill.target ? '#f59e0b' : '#10b981' }}></div>
                    </div>
                  </div>
                ))}
             </div>
             <Button variant="outline" style={{ width: '100%', marginTop: '1.5rem' }}>
               Full Skills Report
             </Button>
           </Card>

           <Card glass style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', color: 'white' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <Award size={32} color="white" />
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>Certifications</h3>
             </div>
             <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '1.25rem' }}>
                8 employees have expiring certifications this month. Schedule renewal training now.
             </p>
             <Button variant="ghost" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
                View List
             </Button>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default CompetencyMatrixPage;
