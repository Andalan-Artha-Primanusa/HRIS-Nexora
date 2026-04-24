import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Plus, Building2, Users, Briefcase, MapPin, Edit } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';

interface MasterDataItem {
  id: number;
  name: string;
  code?: string;
  description?: string;
  type: 'department' | 'position' | 'location' | 'branch';
}

const MasterDataPage: React.FC = () => {
  const [departments, setDepartments] = useState<MasterDataItem[]>([]);
  const [positions, setPositions] = useState<MasterDataItem[]>([]);
  const [locations, setLocations] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'department' | 'position' | 'location'>('department');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, posRes, locRes] = await Promise.all([
        api.get('/departments'),
        api.get('/positions'),
        api.get('/locations')
      ]);
      
      const deptData = Array.isArray(deptRes.data) ? deptRes.data : Array.isArray(deptRes.data?.data) ? deptRes.data.data : [];
      const posData = Array.isArray(posRes.data) ? posRes.data : Array.isArray(posRes.data?.data) ? posRes.data.data : [];
      const locData = Array.isArray(locRes.data) ? locRes.data : Array.isArray(locRes.data?.data) ? locRes.data.data : [];
      
      setDepartments(deptData);
      setPositions(posData);
      setLocations(locData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCurrentData = () => {
    switch (activeTab) {
      case 'department': return departments;
      case 'position': return positions;
      case 'location': return locations;
      default: return [];
    }
  };

  const currentData = getCurrentData();

  const tabs = [
    { key: 'department', label: 'Departemen', icon: Building2, data: departments },
    { key: 'position', label: 'Posisi', icon: Briefcase, data: positions },
    { key: 'location', label: 'Lokasi', icon: MapPin, data: locations },
  ] as const;

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Organization</span>
          <h1>Master Data</h1>
          <p>Kelola data master organisasi: departemen, posisi, dan lokasi.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button variant="primary" size="md">
            <Plus size={16} />
            Tambah {activeTab === 'department' ? 'Departemen' : activeTab === 'position' ? 'Posisi' : 'Lokasi'}
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        {tabs.map((tab) => (
          <Card 
            key={tab.key} 
            className="summary-card" 
            glass 
            style={{ cursor: 'pointer', border: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent' }}
            onClick={() => setActiveTab(tab.key as any)}
          >
            <div className="summary-card__header">
              <div>
                <span className="summary-card__label">{tab.label}</span>
                <p className="summary-card__subtitle">Total</p>
              </div>
              <span className="summary-card__icon summary-card__icon--blue">
                <tab.icon size={20} />
              </span>
            </div>
            <div className="summary-card__value summary-card__value--blue">{tab.data.length}</div>
            <div className="summary-card__change">{tab.label}</div>
          </Card>
        ))}
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar {tabs.find(t => t.key === activeTab)?.label}</h3>
              <span className="wuw-count-badge">{currentData.length} Total</span>
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
          ) : currentData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              {activeTab === 'department' && <Building2 size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />}
              {activeTab === 'position' && <Briefcase size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />}
              {activeTab === 'location' && <MapPin size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />}
              <p>Belum ada data {tabs.find(t => t.key === activeTab)?.label?.toLowerCase()}.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Kode</th>
                    <th>Deskripsi</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="cell-stacked">
                          <span className="cell-name-text">{item.name}</span>
                          {item.type && <span className="cell-email">{item.type}</span>}
                        </div>
                      </td>
                      <td><span className="cell-code">{item.code || '-'}</span></td>
                      <td>{item.description || '-'}</td>
                      <td><span className="status-badge status-active">ACTIVE</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group">
                          <Button variant="ghost" size="sm"><Edit size={16} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterDataPage;