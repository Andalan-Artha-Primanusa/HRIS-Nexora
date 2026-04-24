import React from 'react';
import type { ReimbursementItem } from '../types/reimbursement.types';

interface ReimbursementTableProps {
  items: ReimbursementItem[];
  onView: (item: ReimbursementItem) => void;
  onEdit?: (item: ReimbursementItem) => void;
  onDelete?: (item: ReimbursementItem) => void;
  onSubmit?: (item: ReimbursementItem) => void;
  isAdmin?: boolean;
}

export const ReimbursementTable: React.FC<ReimbursementTableProps> = ({
  items,
  onView,
  onEdit,
  onDelete,
  onSubmit,
  isAdmin = false
}) => {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'status-draft';
      case 'submitted': return 'status-submitted';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'paid': return 'status-paid';
      default: return '';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="card-table-wrapper" style={{ overflowX: 'auto', background: 'white', borderRadius: '18px', border: '1px solid #f1f5f9' }}>
      <table className="crud-table">
        <thead>
          <tr>
            {isAdmin && <th>Employee</th>}
            <th>Title</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Expense Date</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                No reimbursement records found.
              </td>
            </tr>
          ) : (
            items.map((item: any) => (
              <tr key={item.id}>
                {isAdmin && (
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: '#1e3a8a' }}>
                        {item.employee?.full_name || item.employee?.name || item.employee?.user?.name || item.user?.name || item.employee_name || 'N/A'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.employee?.employee_id || item.employee_id || ''}</span>
                    </div>
                  </td>
                )}
                <td>
                  <div style={{ fontWeight: 500 }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.description}
                  </div>
                </td>
                <td>
                  <span className="category-tag">{item.category}</span>
                </td>
                <td style={{ fontWeight: 700, color: '#1e3a8a' }}>
                  {formatCurrency(item.amount)}
                </td>
                <td>{formatDate(item.expense_date)}</td>
                <td>
                  <span className={`status-pill ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="action-btn-group">
                    <button 
                      title="View Details" 
                      onClick={() => onView(item)}
                      className="action-btn action-btn-view"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    
                    {item.status.toLowerCase() === 'draft' && onEdit && (
                      <button 
                        title="Edit" 
                        onClick={() => onEdit(item)}
                        className="action-btn action-btn-edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      </button>
                    )}
                    
                    {item.status.toLowerCase() === 'draft' && onSubmit && (
                      <button 
                        title="Submit" 
                        onClick={() => onSubmit(item)}
                        className="action-btn action-btn-success"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                      </button>
                    )}
                    
                    {item.status.toLowerCase() === 'draft' && onDelete && (
                      <button 
                        title="Delete" 
                        onClick={() => onDelete(item)}
                        className="action-btn action-btn-delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
