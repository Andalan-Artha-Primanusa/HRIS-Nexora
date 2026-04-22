import React from 'react';
import { Eye, Edit, Trash2, MapPin, Users, Calendar } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import type { JobOpening } from '../types/recruitment.types';

interface JobOpeningTableProps {
  items: JobOpening[];
  onView: (item: JobOpening) => void;
  onEdit: (item: JobOpening) => void;
  onDelete: (id: string | number) => void;
}

export const JobOpeningTable: React.FC<JobOpeningTableProps> = ({ items, onView, onEdit, onDelete }) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return { label: 'Open', class: 'status-approved' };
      case 'closed': return { label: 'Closed', class: 'status-rejected' };
      case 'on-hold': return { label: 'On Hold', class: 'status-submitted' };
      default: return { label: 'Draft', class: 'status-draft' };
    }
  };

  return (
    <div className="crud-table-wrap">
      <table className="crud-table">
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Department</th>
            <th>Location</th>
            <th>Type</th>
            <th>Status</th>
            <th>Posted</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const status = getStatusBadge(item.status);
            return (
              <tr key={item.id}>
                <td>
                  <div style={{ fontWeight: 600, color: '#1e3a8a' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {item.id}</div>
                </td>
                <td>{item.department}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                    <MapPin size={14} color="#64748b" />
                    {item.location}
                  </div>
                </td>
                <td>
                  <span className="category-tag">{item.type}</span>
                </td>
                <td>
                  <span className={`status-pill ${status.class}`}>
                    {status.label}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                    <Calendar size={14} color="#64748b" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn-action btn-action-view" onClick={() => onView(item)} title="View Details">
                      <Eye size={16} color="#8b5cf6" />
                    </button>
                    <button className="btn-action btn-action-edit" onClick={() => onEdit(item)} title="Edit">
                      <Edit size={16} color="#2563eb" />
                    </button>
                    <button className="btn-action btn-action-delete" onClick={() => onDelete(item.id)} title="Delete">
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
