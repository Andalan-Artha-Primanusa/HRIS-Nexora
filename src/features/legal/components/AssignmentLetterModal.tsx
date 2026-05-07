import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { getAllEmployees } from '@/features/employee/api/employee.service';
import { useAuthStore } from '@/app/store/auth.store';
import { User, FileText, Calendar, MapPin, AlignLeft, Lock } from 'lucide-react';

export const AssignmentLetterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void | Promise<void>;
}> = ({ isOpen, onClose, onSave }) => {
  const user = useAuthStore((state) => state.user);
  const isAdminOrHR = user?.roles?.some((r: any) =>
    ['admin', 'hr', 'super_admin'].includes(String(r.name ?? '').toLowerCase())
  );

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      setFormData({
        user_id: '',
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
      });
    }
  }, [isOpen, isAdminOrHR, user?.id]);

  const extractArr = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (res && typeof res === 'object') {
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.items)) return res.items;
      if (Array.isArray(res.results)) return res.results;
      if (res.data && typeof res.data === 'object') {
        if (Array.isArray(res.data.data)) return res.data.data;
        if (Array.isArray(res.data.items)) return res.data.items;
      }
    }
    return [];
  };

  const fetchEmployees = async () => {
    if (!isAdminOrHR) return;
    try {
      const data = await getAllEmployees();
      setEmployees(extractArr(data));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = isAdminOrHR
        ? formData
        : {
            title: formData.title,
            description: formData.description,
            start_date: formData.start_date,
            end_date: formData.end_date,
            location: formData.location,
          };
      await onSave(payload);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Official Assignment Letter">
      <div style={{ padding: '0.5rem' }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', marginTop: '-0.5rem' }}>
          Issue a new official duty letter (Surat Tugas) for an employee.
        </p>
        
        <form onSubmit={handleSubmit} className="crud-form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>
                {isAdminOrHR ? 'Assignee' : 'Employee'}
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                {isAdminOrHR ? (
                  <select 
                    className="crud-input"
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    required
                    style={{ paddingLeft: '44px', height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
                  >
                    <option value="">Select Employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.user?.name || emp.full_name || emp.name || `Employee #${emp.id}`} {emp.employee_code ? `[${emp.employee_code}]` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ paddingLeft: '44px', height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', display: 'flex', alignItems: 'center', background: '#f8fafc', color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>
                    {user?.name || user?.email || 'Current User'}
                    <Lock size={14} style={{ marginLeft: '8px', color: '#94a3b8' }} />
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Letter Title / Purpose</label>
              <div style={{ position: 'relative' }}>
                <FileText size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                <input 
                  type="text" 
                  className="crud-input" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Audit Kepatuhan Cabang Surabaya"
                  style={{ paddingLeft: '44px', height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Start Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                  <input 
                    type="date" 
                    className="crud-input" 
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    style={{ paddingLeft: '44px', height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>End Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                  <input 
                    type="date" 
                    className="crud-input" 
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    style={{ paddingLeft: '44px', height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Destination Location</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                <input 
                  type="text" 
                  className="crud-input" 
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  placeholder="e.g. Surabaya, Jawa Timur"
                  style={{ paddingLeft: '44px', height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Detailed Description</label>
              <div style={{ position: 'relative' }}>
                <AlignLeft size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: '#94a3b8' }} />
                <textarea 
                  className="crud-input"
                  style={{ paddingLeft: '44px', minHeight: '100px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', paddingTop: '14px' }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the scope and objectives of this assignment..."
                />
              </div>
            </div>

          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
            <Button variant="ghost" onClick={onClose} type="button" disabled={loading} style={{ flex: 1, height: '52px', borderRadius: '12px' }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading} style={{ flex: 1.5, height: '52px', borderRadius: '12px', fontWeight: 600 }}>
              {loading ? 'Submitting Request...' : 'Issue Letter'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
