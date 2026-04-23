import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Box, Calendar, Hash, Tag, Info, Truck, DollarSign } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { assetService } from '@/features/assets/api/asset.service';
import '@/shared/styles/CrudPage.css';

const AssetFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Electronics',
    brand: '',
    model: '',
    serial_number: '',
    condition: 'new',
    status: 'available',
    purchase_date: '',
    purchase_price: 0,
    notes: ''
  });

  useEffect(() => {
    if (isEdit) {
      const fetchAsset = async () => {
        setFetching(true);
        try {
          const data = await assetService.getAsset(id);
          setFormData(data.data || data);
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchAsset();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await assetService.updateAsset(id, formData);
      } else {
        await assetService.createAsset(formData);
      }
      navigate('/inventory/assets');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'purchase_price' ? Number(value) : value });
  };

  if (fetching) return <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading asset details...</div>;

  return (
    <div className="crud-page" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="crud-header" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
           <button 
             onClick={() => navigate('/inventory/assets')}
             style={{ 
               background: 'rgba(255, 255, 255, 0.5)', 
               border: '1px solid rgba(226, 232, 240, 0.8)',
               padding: '10px',
               borderRadius: '12px',
               cursor: 'pointer',
               display: 'flex',
               alignItems: 'center',
               transition: 'all 0.2s'
             }}
             onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(-4px)'}
             onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
           >
              <ArrowLeft size={20} color="#64748b" />
           </button>
           <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="reimb-badge reimb-badge-admin" style={{ margin: 0 }}>Inventory</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Asset Management</span>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#1e293b' }}>
                {isEdit ? 'Update Asset Info' : 'Register New Asset'}
              </h1>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', alignItems: 'start' }}>
           
           {/* Left Column: Core Info */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <Card glass style={{ padding: '2.5rem', borderRadius: '24px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                    <div style={{ padding: '10px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '12px', color: 'white', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
                      <Box size={22} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#1e293b' }}>Asset Identification</h3>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                       <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>Asset Name</label>
                       <div style={{ position: 'relative' }}>
                          <Tag size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            className="form-control" 
                            required 
                            placeholder="e.g. MacBook Pro M3 14-inch" 
                            style={{ padding: '14px 14px 14px 44px', borderRadius: '14px', fontSize: '1rem', border: '1px solid #e2e8f0', width: '100%' }}
                          />
                       </div>
                    </div>

                    <div className="form-group">
                       <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>Asset Code</label>
                       <input 
                         name="code" 
                         value={formData.code} 
                         onChange={handleChange} 
                         className="form-control" 
                         required 
                         placeholder="LAP-001" 
                         style={{ padding: '14px', borderRadius: '14px', fontSize: '1rem', border: '1px solid #e2e8f0', width: '100%' }}
                       />
                    </div>

                    <div className="form-group">
                       <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>Category</label>
                       <select 
                         name="category" 
                         value={formData.category} 
                         onChange={handleChange} 
                         className="form-control"
                         style={{ padding: '14px', borderRadius: '14px', fontSize: '1rem', border: '1px solid #e2e8f0', width: '100%', appearance: 'none', background: 'white url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E") no-repeat right 16px center', backgroundSize: '16px' }}
                       >
                          <option value="Electronics">💻 Electronics</option>
                          <option value="Hardware">🔌 Hardware</option>
                          <option value="Software">💿 Software</option>
                          <option value="Furniture">🪑 Furniture</option>
                          <option value="Vehicle">🚗 Vehicle</option>
                          <option value="Office Supplies">📎 Office Supplies</option>
                          <option value="Others">📦 Others</option>
                       </select>
                    </div>

                    <div className="form-group">
                       <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>Brand</label>
                       <input 
                         name="brand" 
                         value={formData.brand} 
                         onChange={handleChange} 
                         className="form-control" 
                         placeholder="e.g. Apple" 
                         style={{ padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', width: '100%' }}
                       />
                    </div>

                    <div className="form-group">
                       <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>Model</label>
                       <input 
                         name="model" 
                         value={formData.model} 
                         onChange={handleChange} 
                         className="form-control" 
                         placeholder="e.g. A2918" 
                         style={{ padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', width: '100%' }}
                       />
                    </div>
                    
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                       <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>Serial Number</label>
                       <div style={{ position: 'relative' }}>
                          <Hash size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input 
                            name="serial_number" 
                            value={formData.serial_number} 
                            onChange={handleChange} 
                            className="form-control" 
                            style={{ padding: '14px 14px 14px 44px', borderRadius: '14px', fontSize: '1rem', border: '1px solid #e2e8f0', width: '100%' }} 
                            placeholder="SN123456789" 
                          />
                       </div>
                    </div>
                 </div>
              </Card>

              <Card glass style={{ padding: '2.5rem', borderRadius: '24px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                    <div style={{ padding: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px', color: 'white', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)' }}>
                      <Info size={22} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#1e293b' }}>Additional Details</h3>
                 </div>
                 <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>Notes</label>
                    <textarea 
                      name="notes" 
                      value={formData.notes} 
                      onChange={handleChange} 
                      className="form-control" 
                      rows={4} 
                      placeholder="Add any specific information about this asset..." 
                      style={{ padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', width: '100%', resize: 'vertical', minHeight: '120px' }}
                    />
                 </div>
              </Card>
           </div>

           {/* Right Column: Status & Finance */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '2rem' }}>
              <Card glass style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(241, 245, 249, 0.9))' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.75rem' }}>
                    <div style={{ padding: '8px', background: '#fef3c7', borderRadius: '10px', color: '#d97706' }}>
                      <Truck size={20} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#1e293b' }}>Status & Condition</h4>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', display: 'block' }}>Asset Condition</label>
                       <select 
                         name="condition" 
                         value={formData.condition} 
                         onChange={handleChange} 
                         className="form-control"
                         style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
                       >
                          <option value="new">🆕 New</option>
                          <option value="good">✅ Good</option>
                          <option value="fair">🟡 Fair</option>
                          <option value="damaged">⚠️ Damaged</option>
                          <option value="broken">❌ Broken</option>
                          <option value="retired">🛑 Retired</option>
                       </select>
                    </div>

                    <div className="form-group">
                       <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', display: 'block' }}>Inventory Status</label>
                       <select 
                         name="status" 
                         value={formData.status} 
                         onChange={handleChange} 
                         className="form-control"
                         style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', background: '#f8fafc' }}
                       >
                          <option value="available">🟢 Available</option>
                          <option value="assigned">🔵 Assigned</option>
                          <option value="maintenance">🟠 Maintenance</option>
                          <option value="repair">🔴 Repair</option>
                          <option value="retired">🛑 Retired</option>
                       </select>
                    </div>
                 </div>
              </Card>

              <Card glass style={{ padding: '2rem', borderRadius: '24px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.75rem' }}>
                    <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '10px', color: '#16a34a' }}>
                      <DollarSign size={20} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#1e293b' }}>Finance Details</h4>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', display: 'block' }}>Purchase Price (IDR)</label>
                       <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>Rp</span>
                          <input 
                            name="purchase_price" 
                            type="number" 
                            value={formData.purchase_price} 
                            onChange={handleChange} 
                            className="form-control" 
                            style={{ padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }} 
                            placeholder="25000000" 
                          />
                       </div>
                    </div>
                    <div className="form-group">
                       <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', display: 'block' }}>Purchase Date</label>
                       <div style={{ position: 'relative' }}>
                          <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input 
                            name="purchase_date" 
                            type="date" 
                            value={formData.purchase_date} 
                            onChange={handleChange} 
                            className="form-control" 
                            style={{ padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }} 
                          />
                       </div>
                    </div>
                 </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                 <Button 
                   type="submit" 
                   variant="primary" 
                   size="lg" 
                   disabled={loading} 
                   style={{ 
                     width: '100%', 
                     height: '58px', 
                     borderRadius: '16px', 
                     fontSize: '1.05rem', 
                     fontWeight: 600,
                     boxShadow: '0 10px 20px -10px rgba(37, 99, 235, 0.4)'
                   }}
                 >
                    <Save size={20} style={{ marginRight: '10px' }} />
                    {loading ? 'Saving Changes...' : isEdit ? 'Update Asset' : 'Save Asset Record'}
                 </Button>
                 <Button 
                   type="button" 
                   variant="ghost" 
                   onClick={() => navigate('/inventory/assets')} 
                   style={{ width: '100%', borderRadius: '16px', height: '50px', color: '#64748b' }}
                 >
                    Discard Changes
                 </Button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default AssetFormPage;
