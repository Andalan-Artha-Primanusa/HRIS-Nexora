import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Plus, Trash2, User, GitBranch, Layers, Users } from 'lucide-react';
import { getAllRoles, getAllUsers } from "@/features/admin/api/admin.service";

interface ApprovalFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const ApprovalFlowModal: React.FC<ApprovalFlowModalProps> = ({ isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    module: 'assignment_letter',
    steps: [{ role_id: '', user_id: '', step_order: 1 }]
  });

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      fetchUsers();
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    try {
      const res = await getAllRoles();
      const items = res.items || [];
      setRoles(items);
    } catch (err) {
      console.error('Failed to fetch roles', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      const data = res as any;
      const items = Array.isArray(data) ? data : data?.items || [];
      setUsers(items);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { role_id: '', user_id: '', step_order: formData.steps.length + 1 }]
    });
  };

  const removeStep = (index: number) => {
    const newSteps = formData.steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, step_order: i + 1 }));
    setFormData({ ...formData, steps: newSteps });
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...formData.steps];
    (newSteps[index] as any)[field] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) return alert('Please enter a flow name');
    if (formData.steps.some(s => !s.role_id)) return alert('Please select a role for all steps');

    setLoading(true);
    try {
      const cleanedData = {
        ...formData,
        steps: formData.steps.map(s => ({
          step_order: s.step_order,
          role_id: Number(s.role_id),
          user_id: s.user_id ? Number(s.user_id) : undefined,
        }))
      };
      await onSave(cleanedData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Approval Flow">
      <form onSubmit={handleSubmit} style={{ padding: '0.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GitBranch size={14} color="#6366f1" /> Flow Name
            </label>
            <input 
              type="text" 
              className="crud-input"
              placeholder="e.g. Standard Assignment Approval"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', padding: '0 16px', fontSize: '0.95rem' }}
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} color="#6366f1" /> Targeted Module
            </label>
            <select 
              className="crud-input"
              value={formData.module}
              onChange={(e) => setFormData({ ...formData, module: e.target.value })}
              style={{ height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', padding: '0 16px', fontSize: '0.95rem', cursor: 'pointer' }}
            >
              <option value="assignment_letter">Assignment Letter (Surat Tugas)</option>
              <option value="leave">Leave Request</option>
              <option value="reimbursement">Reimbursement</option>
              <option value="overtime">Overtime</option>
              <option value="promotion">Promotion Request</option>
              <option value="training">Training Request</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} color="#6366f1" /> Sequence of Approvers
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
              {formData.steps.map((step, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '32px', height: '32px', minWidth: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800,
                    boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ 
                    flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px', background: 'white', 
                    borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    <select 
                      value={step.role_id} 
                      onChange={(e) => updateStep(index, 'role_id', e.target.value)}
                      required
                      style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', outline: 'none', padding: '4px 0' }}
                    >
                      <option value="" disabled>Select Role...</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.display_name || role.name}</option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                      <Users size={14} color="#94a3b8" />
                      <select 
                        value={step.user_id} 
                        onChange={(e) => updateStep(index, 'user_id', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '0.8rem', color: '#64748b', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="">Any user with this role</option>
                        {users.map((u: any) => (
                          <option key={u.id} value={u.id}>{u.name || u.email || `User #${u.id}`}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    type="button" 
                    onClick={() => removeStep(index)}
                    disabled={formData.steps.length === 1}
                    style={{ color: '#ef4444', padding: '10px', borderRadius: '10px', background: '#fef2f2' }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              
              <Button 
                variant="ghost" 
                type="button" 
                onClick={addStep}
                style={{ 
                  alignSelf: 'center', fontSize: '0.85rem', color: '#6366f1', fontWeight: 700, 
                  background: 'rgba(99, 102, 241, 0.05)', padding: '10px 20px', borderRadius: '12px', border: '1px dashed #6366f1',
                  marginTop: '0.5rem', width: '100%'
                }}
              >
                <Plus size={16} style={{ marginRight: '8px' }} /> Add Approval Level
              </Button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
          <Button variant="ghost" onClick={onClose} type="button" style={{ flex: 1, height: '52px', borderRadius: '12px' }}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={loading} style={{ flex: 1.5, height: '52px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
            {loading ? 'Creating flow...' : 'Activate Approval Flow'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
