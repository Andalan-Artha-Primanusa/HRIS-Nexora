import React, { useState, useEffect } from 'react';
import { FileText, User, Download, Plus, Search, RefreshCw } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { legalService } from '@/features/legal/api/legal.service';
import '@/shared/styles/CrudPage.css';
import { api } from '@/shared/api/httpClient';

const EmploymentLettersPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await api.get('/employees');
        setEmployees(response.data.data || []);
      } catch (err) {
        console.error(err);
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

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Legal & Correspondence</span>
          <h1>Employment Letters</h1>
          <p>Generate formal letters for employees (Experience, Employment, and Assignment).</p>
        </div>
      </div>

      <Card glass style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search employee by name or ID..." 
              style={{ paddingLeft: '40px', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => {}}>
            <FileText size={18} style={{ marginRight: '8px' }} />
            Assignment Letter Queue
          </Button>
        </div>

        <div className="crud-table-wrap">
          <table className="crud-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Position</th>
                <th>Join Date</th>
                <th style={{ textAlign: 'right' }}>Generate Document</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>Loading employees...</td></tr>
              ) : filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{emp.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.employee_id}</div>
                  </td>
                  <td>{emp.department || 'N/A'}</td>
                  <td>{emp.designation || 'N/A'}</td>
                  <td>{emp.hire_date || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button variant="ghost" size="sm" onClick={() => handleGenerate(emp.id, 'employment')}>
                        <FileText size={14} style={{ marginRight: '4px' }} />
                        Suket Kerja
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleGenerate(emp.id, 'experience')}>
                        <FileText size={14} style={{ marginRight: '4px' }} />
                        Paklaring
                      </Button>
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
