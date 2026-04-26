import React, { useState, useEffect } from 'react';
import { FileText, Search, RefreshCw, Calendar, BookTemplate, Plus } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { getAllEmployees } from '@/features/employee/api/employee.service';
import { legalService } from '@/features/legal/api/legal.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const EmploymentLettersPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const data = await getAllEmployees();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleGenerate = async (id: string | number, type: 'experience' | 'employment') => {
    try {
      if (type === 'experience') {
        await legalService.generateExperienceLetter(id);
      } else {
        await legalService.generateEmploymentLetter(id);
      }
      alert('Letter generated successfully!');
    } catch (err) {
      alert('Failed to generate letter');
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const fullName = String(emp?.full_name || '').toLowerCase();
    const employeeId = String(emp?.employee_id || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || employeeId.includes(query);
  });

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <BookTemplate size={16} />
              <span>Legal & Korespondensi</span>
            </div>
            <h1 className="hero-title">Surat Pekerjaan</h1>
            <p className="hero-subtitle">
              Hasilkan surat formal untuk karyawan (Pengalaman, Kerja, dan Penugasan).
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

      <Card glass style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--cr-border)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--cr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.3)' }}>
          <div style={{ position: 'relative', width: '400px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Cari karyawan berdasarkan nama atau ID..." 
              style={{ 
                paddingLeft: '44px', 
                width: '100%',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                height: '45px',
                fontSize: '0.95rem'
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
             <Button variant="outline" onClick={() => {}} style={{ borderRadius: '10px' }}>
              <FileText size={18} style={{ marginRight: '8px' }} />
              Queue
            </Button>
          </div>
        </div>

        <div className="crud-table-wrap" style={{ margin: '0' }}>
          <table className="crud-table">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '1.25rem 1.5rem' }}>Employee</th>
                <th>Department</th>
                <th>Position</th>
                <th>Join Date</th>
                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="animate-spin" style={{ marginBottom: '1rem' }}>
                      <RefreshCw size={24} color="#2563eb" />
                    </div>
                    Loading employees...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                    No employees found matching your search.
                  </td>
                </tr>
              ) : filteredEmployees.map((emp) => (
                <tr key={emp.id} style={{ transition: 'all 0.2s' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px', 
                        background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                      }}>
                        {(emp.full_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                          {emp.full_name || emp.user?.name || emp.name || 'Unknown Employee'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{emp.employee_id || emp.employee_code || '#'+emp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', 
                      background: '#f1f5f9', 
                      borderRadius: '6px', 
                      fontSize: '0.85rem',
                      color: '#475569',
                      fontWeight: 500
                    }}>
                      {emp.department || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.9rem', color: '#334155' }}>{emp.designation || emp.position || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#64748b' }}>
                      <Calendar size={14} />
                      {emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : '-'}
                    </div>
                  </td>
                  <td style={{ paddingRight: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn-action-generate"
                        onClick={() => handleGenerate(emp.id, 'employment')}
                        title="Generate Surat Keterangan Kerja"
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          background: 'white',
                          color: '#2563eb',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <FileText size={14} />
                        Suket Kerja
                      </button>
                      <button 
                        className="btn-action-generate"
                        onClick={() => handleGenerate(emp.id, 'experience')}
                        title="Generate Surat Pengalaman Kerja (Paklaring)"
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          background: 'white',
                          color: '#059669',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <FileText size={14} />
                        Paklaring
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default EmploymentLettersPage;
