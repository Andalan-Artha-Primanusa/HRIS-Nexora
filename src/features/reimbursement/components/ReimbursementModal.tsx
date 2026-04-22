import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import type { ReimbursementItem, ReimbursementCreatePayload } from '../types/reimbursement.types';

interface ReimbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: ReimbursementItem | null;
  employees?: any[]; // Only for admin
  isAdmin?: boolean;
}

const CATEGORIES = [
  { value: 'travel', label: 'Travel' },
  { value: 'medical', label: 'Medical' },
  { value: 'office_supplies', label: 'Office Supplies' },
  { value: 'training', label: 'Training' },
  { value: 'meal', label: 'Meal' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'other', label: 'Other' },
];

export const ReimbursementModal: React.FC<ReimbursementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  employees = [],
  isAdmin = false
}) => {
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    amount: '',
    category: 'other',
    expense_date: new Date().toISOString().split('T')[0],
    employee_id: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        amount: initialData.amount || '',
        category: initialData.category || 'other',
        expense_date: initialData.expense_date ? new Date(initialData.expense_date as string).toISOString().split('T')[0] : '',
        employee_id: initialData.employee_id || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        amount: '',
        category: 'other',
        expense_date: new Date().toISOString().split('T')[0],
        employee_id: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="reimb-modal-overlay" onClick={onClose}>
      <div className="reimb-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="reimb-modal-header">
          <h2>{initialData ? 'Edit Reimbursement' : 'New Reimbursement'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="reimb-modal-body">
            <div className="form-grid">
              {isAdmin && !initialData && (
                <div className="form-group full">
                  <label>Employee</label>
                  <select 
                    name="employee_id" 
                    className="form-control" 
                    value={formData.employee_id} 
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.employee_id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group full">
                <label>Title</label>
                <input 
                  type="text" 
                  name="title" 
                  className="form-control" 
                  placeholder="e.g., Client Meeting Lunch"
                  value={formData.title}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  name="category" 
                  className="form-control" 
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount (IDR)</label>
                <input 
                  type="number" 
                  name="amount" 
                  className="form-control" 
                  placeholder="0"
                  value={formData.amount}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Expense Date</label>
                <input 
                  type="date" 
                  name="expense_date" 
                  className="form-control" 
                  value={formData.expense_date}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group full">
                <label>Description</label>
                <textarea 
                  name="description" 
                  className="form-control" 
                  rows={3} 
                  placeholder="Provide more details about this expense..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="form-group full">
                <label>Receipt URL (Optional)</label>
                <input 
                  type="text" 
                  name="receipt_path" 
                  className="form-control" 
                  placeholder="Link to receipt image/file"
                  value={formData.receipt_path || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="reimb-modal-footer">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit">
              <Save size={18} style={{ marginRight: '8px' }} />
              {initialData ? 'Update' : 'Save as Draft'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
