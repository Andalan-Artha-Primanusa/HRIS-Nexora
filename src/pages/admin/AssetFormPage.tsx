import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Box, Package, Tag, 
  Hash, Info, Truck, DollarSign, Calendar 
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { assetService } from '@/features/assets/api/asset.service';
import '@/shared/styles/CrudPage.css';
import "../dashboard/overview/OverviewPage.css";

const AssetFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
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
          const res = await assetService.getAsset(id);
          const data = res.data || res;
          setFormData({
            ...data,
            purchase_price: Number(data.purchase_price) || 0
          });
        } catch (err: any) {
          setErrorMessage(err.message || "Gagal memuat detail aset.");
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
    setErrorMessage("");
    try {
      if (isEdit) {
        await assetService.updateAsset(id, formData);
      } else {
        await assetService.createAsset(formData);
      }
      navigate('/inventory/assets');
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan data aset.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'purchase_price' ? Number(value) : value 
    });
  };

  if (fetching) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
      <Package className="animate-pulse" size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
      <p>Memuat detail aset...</p>
    </div>
  );

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Package size={16} />
              <span>Inventory System</span>
            </div>
            <h1 className="hero-title">{isEdit ? 'Edit Asset' : 'Tambah Asset Baru'}</h1>
            <p className="hero-subtitle">
              {isEdit ? 'Perbarui informasi detail aset perusahaan.' : 'Daftarkan aset baru ke dalam sistem inventaris.'}
            </p>
          </div>
          <div className="hero-actions">
            <button type="button" className="btn-outline" onClick={() => navigate('/inventory/assets')}>
              <ArrowLeft size={16} />
              Kembali
            </button>
          </div>
        </div>
      </Card>

      {errorMessage && (
        <div style={{ marginBottom: '2rem' }}>
          <Alert type="error" message={errorMessage} onClose={() => setErrorMessage("")} dismissible />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Left Column: Main Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card glass style={{ padding: '2.5rem', borderRadius: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                <div style={{ padding: '10px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '12px', color: 'white', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
                  <Box size={22} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>Informasi Utama</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'block' }}>Nama Aset <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Tag size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      placeholder="e.g. MacBook Pro M3 14-inch" 
                      style={{ width: '100%', height: '50px', padding: '0 16px 0 44px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'block' }}>Kode Aset <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    name="code" 
                    value={formData.code} 
                    onChange={handleChange} 
                    required 
                    placeholder="AST-001" 
                    style={{ width: '100%', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'block' }}>Kategori</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    style={{ width: '100%', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box' }}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'block' }}>Merek</label>
                  <input 
                    name="brand" 
                    value={formData.brand} 
                    onChange={handleChange} 
                    placeholder="e.g. Apple" 
                    style={{ width: '100%', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'block' }}>Model</label>
                  <input 
                    name="model" 
                    value={formData.model} 
                    onChange={handleChange} 
                    placeholder="e.g. A2918" 
                    style={{ width: '100%', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box' }}
                  />
                </div>
                
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'block' }}>Nomor Seri</label>
                  <div style={{ position: 'relative' }}>
                    <Hash size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      name="serial_number" 
                      value={formData.serial_number} 
                      onChange={handleChange} 
                      placeholder="SN123456789" 
                      style={{ width: '100%', height: '50px', padding: '0 16px 0 44px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card glass style={{ padding: '2.5rem', borderRadius: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                <div style={{ padding: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px', color: 'white', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)' }}>
                  <Info size={22} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>Catatan Tambahan</h3>
              </div>
              <div className="form-group">
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange} 
                  rows={4} 
                  placeholder="Tambahkan informasi spesifik mengenai aset ini..." 
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box', resize: 'vertical', minHeight: '120px' }}
                />
              </div>
            </Card>
          </div>

          {/* Right Column: Status & Finance */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card glass style={{ padding: '2rem', borderRadius: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <div style={{ padding: '8px', background: '#fef3c7', borderRadius: '10px', color: '#d97706' }}>
                  <Truck size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a' }}>Kondisi & Status</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>Kondisi Aset</label>
                  <select 
                    name="condition" 
                    value={formData.condition} 
                    onChange={handleChange} 
                    style={{ width: '100%', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', boxSizing: 'border-box' }}
                  >
                    <option value="new">Baru</option>
                    <option value="good">Baik</option>
                    <option value="fair">Cukup</option>
                    <option value="poor">Buruk</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>Status Inventaris</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    style={{ width: '100%', height: '50px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', boxSizing: 'border-box' }}
                  >
                    <option value="available">Tersedia</option>
                    <option value="in_use">Digunakan</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card glass style={{ padding: '2rem', borderRadius: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '10px', color: '#16a34a' }}>
                  <DollarSign size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a' }}>Detail Finansial</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>Harga Beli (IDR)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 700 }}>Rp</span>
                    <input 
                      name="purchase_price" 
                      type="number" 
                      value={formData.purchase_price} 
                      onChange={handleChange} 
                      placeholder="25000000" 
                      style={{ width: '100%', height: '50px', padding: '0 12px 0 40px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>Tanggal Pembelian</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      name="purchase_date" 
                      type="date" 
                      value={formData.purchase_date} 
                      onChange={handleChange} 
                      style={{ width: '100%', height: '50px', padding: '0 12px 0 40px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                disabled={loading} 
                style={{ 
                  width: '100%', 
                  height: '60px', 
                  borderRadius: '20px', 
                  fontSize: '1.1rem', 
                  fontWeight: 800,
                  boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)'
                }}
              >
                <Save size={20} style={{ marginRight: '10px' }} />
                {loading ? 'Menyimpan...' : isEdit ? 'Perbarui Aset' : 'Simpan Aset'}
              </Button>
              <Button 
                type="button" 
                onClick={() => navigate('/inventory/assets')} 
                style={{ width: '100%', height: '54px', borderRadius: '20px', fontWeight: 700, background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
              >
                Batalkan
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AssetFormPage;
