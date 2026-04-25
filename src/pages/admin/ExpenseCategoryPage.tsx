import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Edit, Trash2, Search, Tag, DollarSign, CheckCircle, FileText, Receipt } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
import './ExpenseCategoryPage.css';

interface ExpenseCategory {
  id: number;
  name: string;
  code: string;
  description: string;
  max_claim: number | null;
  is_active: boolean;
  requires_receipt: boolean;
  category_type: 'medical' | 'travel' | ' meals' | 'accommodation' | 'transport' | 'other';
}

const ExpenseCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    max_claim: '',
    is_active: true,
    requires_receipt: true,
    category_type: 'other',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/expense-categories');
      const data = response.data;
      const categoriesArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setCategories(categoriesArray);
    } catch (err) {
      console.error(err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCategories = categories.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (category?: ExpenseCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        code: category.code,
        description: category.description,
        max_claim: category.max_claim?.toString() || '',
        is_active: category.is_active,
        requires_receipt: category.requires_receipt,
        category_type: category.category_type,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        max_claim: '',
        is_active: true,
        requires_receipt: true,
        category_type: 'other',
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        max_claim: formData.max_claim ? parseFloat(formData.max_claim) : null,
      };
      
      if (editingCategory) {
        await api.put(`/expense-categories/${editingCategory.id}`, payload);
      } else {
        await api.post('/expense-categories', payload);
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save category');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/expense-categories/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const activeCount = categories.filter(c => c.is_active).length;
  const totalCategories = categories.length;

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      medical: '#ef4444',
      travel: '#3b82f6',
      meals: '#f59e0b',
      accommodation: '#8b5cf6',
      transport: '#10b981',
      other: '#64748b',
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Receipt size={16} />
              <span>Settings</span>
            </div>
            <h1 className="hero-title">Expense Categories</h1>
            <p className="hero-subtitle">
              Kelola kategori pengeluaran untuk permintaan reimbursemen.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => handleOpenModal()}>
              <Plus size={16} />
              Tambah Kategori
            </button>
          </div>
        </div>
      </Card>

      <div className="leave-requests-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Total Categories</p>
              <p className="leave-summary-subtitle">Semua kategori</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <Tag size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-blue">{totalCategories}</div>
          <p className="leave-summary-trend">Categories</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Active</p>
              <p className="leave-summary-subtitle">Tersedia</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-green">
              <CheckCircle size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-green">{activeCount}</div>
          <p className="leave-summary-trend">Active</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Avg Max Claim</p>
              <p className="leave-summary-subtitle">Rata-rata limit</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-orange">
              <DollarSign size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-orange">
            {totalCategories > 0 
              ? `Rp ${Math.round(categories.reduce((sum, c) => sum + (c.max_claim || 0), 0) / totalCategories).toLocaleString('id-ID')}`
              : '-'}
          </div>
          <p className="leave-summary-trend">Average</p>
        </div>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Category List</h3>
              <span className="wuw-count-badge">{filteredCategories.length} items</span>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search categories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="animate-spin" />
              <p>Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Tag size={48} />
              </div>
              <h4>No categories found</h4>
              <p>Create your first expense category to get started.</p>
              <Button variant="primary" onClick={() => handleOpenModal()}>
                <Plus size={16} /> Add Category
              </Button>
            </div>
          ) : (
            <div className="category-grid">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="category-card" glass>
                  <div className="category-header">
                    <div 
                      className="category-icon"
                      style={{ background: `${getTypeColor(category.category_type)}20`, color: getTypeColor(category.category_type) }}
                    >
                      <Tag size={20} />
                    </div>
                    <div className="category-info">
                      <h4>{category.name}</h4>
                      <span className="category-code">{category.code}</span>
                    </div>
                    <span className={`status-pill ${category.is_active ? 'active' : 'inactive'}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="category-description">{category.description || 'No description'}</p>
                  
                  <div className="category-meta">
                    <div className="meta-item">
                      <DollarSign size={14} />
                      <span>Max: {category.max_claim ? `Rp ${Number(category.max_claim).toLocaleString('id-ID')}` : 'Unlimited'}</span>
                    </div>
                    <div className="meta-item">
                      <FileText size={14} />
                      <span>Receipt: {category.requires_receipt ? 'Required' : 'Optional'}</span>
                    </div>
                  </div>
                  
                  <div className="category-actions">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(category)}>
                      <Edit size={16} /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" danger onClick={() => handleDelete(category.id)}>
                      <Trash2 size={16} /> Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Category Name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Medical Expenses"
                  />
                </div>
                <div className="form-group">
                  <label>Code <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., MED"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this category..."
                  rows={3}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Max Claim Amount</label>
                  <input
                    type="number"
                    value={formData.max_claim}
                    onChange={(e) => setFormData({ ...formData, max_claim: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Category Type</label>
                  <select
                    value={formData.category_type}
                    onChange={(e) => setFormData({ ...formData, category_type: e.target.value as any })}
                  >
                    <option value="medical">Medical</option>
                    <option value="travel">Travel</option>
                    <option value="meals">Meals</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="transport">Transport</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span>Active</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.requires_receipt}
                    onChange={(e) => setFormData({ ...formData, requires_receipt: e.target.checked })}
                  />
                  <span>Requires Receipt</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategoryPage;