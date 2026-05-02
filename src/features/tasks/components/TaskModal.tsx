import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { getAllEmployees } from '@/features/employee/api/employee.service';
import { FileText, Calendar, User, AlignLeft, Flag } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: '',
    due_date: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      if (isEdit) {
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          priority: initialData.priority || 'medium',
          assigned_to: String(initialData.assigned_to || ''),
          due_date: initialData.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '',
        });
      } else {
        setFormData({ title: '', description: '', priority: 'medium', assigned_to: '', due_date: '' });
      }
    }
  }, [isOpen, isEdit, initialData]);

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
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Rendah', color: '#22c55e' },
    { value: 'medium', label: 'Sedang', color: '#f59e0b' },
    { value: 'high', label: 'Tinggi', color: '#ef4444' },
    { value: 'urgent', label: 'Mendesak', color: '#dc2626' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Tugas' : 'Buat Tugas Baru'}>
      <div style={{ padding: '0.5rem' }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', marginTop: '-0.5rem' }}>
          {isEdit ? 'Perbarui informasi tugas' : 'Buat tugas baru dan tugaskan ke karyawan.'}
        </p>

        <form onSubmit={handleSubmit} className="crud-form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Judul Tugas</label>
              <div style={{ position: 'relative' }}>
                <FileText size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                <input
                  type="text"
                  className="crud-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Selesaikan laporan bulanan"
                  style={{ paddingLeft: '44px', height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Ditugaskan Kepada</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                <select
                  className="crud-input"
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  required
                  style={{ paddingLeft: '44px', height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
                >
                  <option value="">Pilih Karyawan...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.user?.name || emp.full_name || emp.name || `Employee #${emp.id}`} {emp.employee_code ? `[${emp.employee_code}]` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Prioritas</label>
              <div style={{ position: 'relative' }}>
                <Flag size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                <select
                  className="crud-input"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  required
                  style={{ paddingLeft: '44px', height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
                >
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Tanggal Deadline</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                <input
                  type="date"
                  className="crud-input"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  style={{ paddingLeft: '44px', height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Deskripsi</label>
              <div style={{ position: 'relative' }}>
                <AlignLeft size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: '#94a3b8' }} />
                <textarea
                  className="crud-input"
                  style={{ paddingLeft: '44px', minHeight: '100px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', paddingTop: '14px' }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan detail tugas yang harus dikerjakan..."
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
            <Button variant="ghost" onClick={onClose} type="button" disabled={loading} style={{ flex: 1, height: '52px', borderRadius: '12px' }}>
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={loading} style={{ flex: 1.5, height: '52px', borderRadius: '12px', fontWeight: 600 }}>
              {loading ? 'Menyimpan...' : isEdit ? 'Perbarui Tugas' : 'Buat Tugas'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
