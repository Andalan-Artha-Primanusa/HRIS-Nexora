import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Edit, Trash2, Search, Building2, Users, MapPin, Briefcase, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';
import './MasterDataPage.css';

interface MasterDataItem {
  id: number;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  parent_id?: number;
}

const MasterDataPage: React.FC = () => {
  const [departments, setDepartments] = useState<MasterDataItem[]>([]);
  const [positions, setPositions] = useState<MasterDataItem[]>([]);
  const [locations, setLocations] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'department' | 'position' | 'location'>('department');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    is_active: true,
  });

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

  const setCurrentData = (data: MasterDataItem[]) => {
    switch (activeTab) {
      case 'department': setDepartments(data); break;
      case 'position': setPositions(data); break;
      case 'location': setLocations(data); break;
    }
  };

  const getApiEndpoint = () => {
    switch (activeTab) {
      case 'department': return '/departments';
      case 'position': return '/positions';
      case 'location': return '/locations';
    }
  };

  const currentData = getCurrentData();
  
  const filteredData = currentData.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (item?: MasterDataItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        code: item.code,
        description: item.description,
        is_active: item.is_active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const endpoint = getApiEndpoint();
      
      if (editingItem) {
        await api.put(`${endpoint}/${editingItem.id}`, formData);
      } else {
        await api.post(endpoint, formData);
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab}?`)) {
      try {
        const endpoint = getApiEndpoint();
        await api.delete(`${endpoint}/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const tabs = [
    { key: 'department', label: 'Departments', icon: Building2, data: departments },
    { key: 'position', label: 'Positions', icon: Briefcase, data: positions },
    { key: 'location', label: 'Locations', icon: MapPin, data: locations },
  ] as const;

  const activeTabData = tabs.find(t => t.key === activeTab);

  return (
    <div className="crud-page master-data-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Organization</span>
          <h1>Master Data</h1>
          <p>Manage your organization's core data: departments, positions, and locations.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            Add {activeTab === 'department' ? 'Department' : activeTab === 'position' ? 'Position' : 'Location'}
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        {tabs.map((tab) => (
          <Card 
            key={tab.key} 
            className="summary-card" 
            glass 
            style={{ 
              cursor: 'pointer', 
              border: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab(tab.key as any)}
          >
            <div className="summary-card__header">
              <div>
                <span className="summary-card__label">{tab.label}</span>
                <p className="summary-card__subtitle">Total count</p>
              </div>
              <span className={`summary-card__icon summary-card__icon--${tab.key === 'department' ? 'blue' : tab.key === 'position' ? 'green' : 'orange'}`}>
                <tab.icon size={20} />
              </span>
            </div>
            <div className={`summary-card__value summary-card__value--${tab.key === 'department' ? 'blue' : tab.key === 'position' ? 'green' : 'orange'}`}>
              {tab.data.length}
            </div>
            <div className="summary-card__change">{tab.label}</div>
          </Card>
        ))}
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>{activeTabData?.label}</h3>
              <span className="wuw-count-badge">{filteredData.length} items</span>
            </div>
            <div className="header-actions">
              <div className="search-box">
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="tab-navigation">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key as any)}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
                <span className="tab-count">{tab.data.length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="wuw-table-area">
          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="animate-spin" />
              <p>Loading {activeTabData?.label.toLowerCase()}...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                {activeTab === 'department' && <Building2 size={48} />}
                {activeTab === 'position' && <Briefcase size={48} />}
                {activeTab === 'location' && <MapPin size={48} />}
              </div>
              <h4>No {activeTabData?.label.toLowerCase()} found</h4>
              <p>Create your first {activeTab} to get started.</p>
              <Button variant="primary" onClick={() => handleOpenModal()}>
                <Plus size={16} /> Add {activeTab === 'department' ? 'Department' : activeTab === 'position' ? 'Position' : 'Location'}
              </Button>
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="cell-with-icon">
                          <div className="cell-icon">
                            {activeTab === 'department' && <Building2 size={18} />}
                            {activeTab === 'position' && <Briefcase size={18} />}
                            {activeTab === 'location' && <MapPin size={18} />}
                          </div>
                          <span className="cell-name-text">{item.name}</span>
                        </div>
                      </td>
                      <td><span className="cell-code">{item.code || '-'}</span></td>
                      <td className="cell-description">{item.description || '-'}</td>
                      <td>
                        <span className={`status-badge ${item.is_active ? 'status-active' : 'status-default'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" danger onClick={() => handleDelete(item.id)}>
                            <Trash2 size={16} />
                          </Button>
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? `Edit ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` : `Add New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={`Enter ${activeTab} name`}
                />
              </div>
              
              <div className="form-group">
                <label>Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., DEPT-001"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={`Describe this ${activeTab}...`}
                  rows={3}
                />
              </div>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <span>Active</span>
              </label>
            </div>
            <div className="modal-footer">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataPage;