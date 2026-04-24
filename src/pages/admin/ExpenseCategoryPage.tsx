import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Edit, Trash2, Search, Tag, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';

const ExpenseCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const activeCount = categories.filter(c => c.is_active).length;

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Settings</span>
          <h1>Kategori Pengeluaran</h1>
          <p>Kelola kategori pengeluaran untuk proses reimbursement.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button variant="primary" size="md">
            <Plus size={16} />
            Tambah Kategori
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Total Kategori</span>
              <p className="summary-card__subtitle">Semua kategori</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <Tag size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{categories.length}</div>
          <div className="summary-card__change">Categories</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Aktif</span>
              <p className="summary-card__subtitle">Kategori aktif</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <CheckCircle size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{activeCount}</div>
          <div className="summary-card__change">Active</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Max Claim</span>
              <p className="summary-card__subtitle">Batas klaim</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <DollarSign size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">-</div>
          <div className="summary-card__change">Limit</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar Kategori Pengeluaran</h3>
              <span className="wuw-count-badge">{categories.length} Total</span>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Cari kategori..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Kategori</th>
                  <th>Kode</th>
                  <th>Deskripsi</th>
                  <th>Max Klaim</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Loading...</td></tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <Tag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                      <p>Belum ada kategori pengeluaran.</p>
                    </td>
                  </tr>
                ) : filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div className="cell-stacked">
                        <span className="cell-name-text">{cat.name}</span>
                        <span className="cell-email">{cat.description || '-'}</span>
                      </div>
                    </td>
                    <td><span className="cell-code">{cat.code || '-'}</span></td>
                    <td>{cat.description || '-'}</td>
                    <td>{cat.max_claim ? `Rp ${Number(cat.max_claim).toLocaleString('id-ID')}` : '-'}</td>
                    <td>
                      <span className={`status-badge ${cat.is_active ? 'status-active' : 'status-default'}`}>
                        {cat.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btn-group">
                        <Button variant="ghost" size="sm"><Edit size={16} /></Button>
                        <Button variant="ghost" size="sm" danger><Trash2 size={16} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCategoryPage;