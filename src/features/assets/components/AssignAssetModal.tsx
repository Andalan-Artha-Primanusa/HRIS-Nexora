import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { getAllLocations } from '@/features/location/api/location.service';
import { User, MapPin, Calendar, FileText, AlertCircle } from 'lucide-react';

export const AssignAssetModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  assets: any[];
}> = ({ isOpen, onClose, onSave, assets }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    asset_id: '',
    employee_id: '',
    location_id: '',
    assignment_note: '',
    assigned_at: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
      setFormData({
        asset_id: '',
        employee_id: '',
        location_id: '',
        assignment_note: '',
        assigned_at: new Date().toISOString().split('T')[0],
      });
    }
  }, [isOpen]);

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

  const loadDependencies = async () => {
    try {
      const { getAllEmployees } = await import('@/features/employee/api/employee.service');
      const empsRes = await getAllEmployees();
      setEmployees(extractArr(empsRes));

      const locsRes = await getAllLocations();
      setLocations(extractArr(locsRes));
    } catch (err) {
      console.error('Failed to load dependencies', err);
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Asset Assignment">
      <div style={{ padding: '0.5rem' }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', marginTop: '-0.5rem' }}>
          Assign an available asset to an employee and specify the location.
        </p>
        
        <form onSubmit={handleSubmit} className="crud-form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Select Asset</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }}>
                  <AlertCircle size={18} />
                </div>
                <select 
                  className="crud-input"
                  value={formData.asset_id}
                  onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                  required
                  style={{ paddingLeft: '44px', height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', appearance: 'none', background: 'white url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E") no-repeat right 16px center', backgroundSize: '16px' }}
                >
                  <option value="">Select an available asset...</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} {asset.serial_number ? `(${asset.serial_number})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Assign To Employee</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                <select
                  className="crud-input"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  required
                  style={{ paddingLeft: '44px', height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
                >
                  <option value="">-- Select Employee --</option>
                  {employees.length === 0 && <option disabled>Loading employees...</option>}
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.user?.name || emp.full_name || emp.name || `Employee #${emp.id}`} {emp.employee_code ? `[${emp.employee_code}]` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Location</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                <select
                  className="crud-input"
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  style={{ paddingLeft: '44px', height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
                >
                  <option value="">-- Select Location (Optional) --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.city ? `– ${loc.city}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Assignment Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                <input 
                  type="date" 
                  className="crud-input" 
                  value={formData.assigned_at}
                  onChange={(e) => setFormData({ ...formData, assigned_at: e.target.value })}
                  required
                  style={{ paddingLeft: '44px', height: '52px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Assignment Note</label>
              <div style={{ position: 'relative' }}>
                <FileText size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: '#94a3b8' }} />
                <textarea 
                  className="crud-input"
                  style={{ paddingLeft: '44px', minHeight: '100px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', paddingTop: '14px' }}
                  value={formData.assignment_note}
                  onChange={(e) => setFormData({ ...formData, assignment_note: e.target.value })}
                  placeholder="e.g. Dipinjamkan untuk dinas luar kota..."
                />
              </div>
            </div>

          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
            <Button variant="ghost" onClick={onClose} type="button" disabled={loading} style={{ flex: 1, height: '52px', borderRadius: '12px' }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading} style={{ flex: 1.5, height: '52px', borderRadius: '12px', fontWeight: 600 }}>
              {loading ? 'Processing...' : 'Confirm Assignment'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
