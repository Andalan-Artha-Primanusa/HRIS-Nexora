import React, { useState } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import type { JobOpening } from '../types/recruitment.types';

interface JobOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<JobOpening>) => void;
  initialData?: JobOpening | null;
}

export const JobOpeningModal: React.FC<JobOpeningModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<JobOpening>>(
    initialData || {
      title: '',
      department: '',
      location: '',
      type: 'full-time',
      status: 'draft',
      description: '',
      requirements: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Job Opening' : 'Post New Job'}>
      <form onSubmit={handleSubmit} className="crud-form">
        <div className="crud-form-grid">
          <div className="form-group">
            <label>Job Title</label>
            <input 
              type="text" 
              className="crud-input" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g. Senior Software Engineer"
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <select 
              className="crud-input"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            >
              <option value="">Select Department</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
            </select>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input 
              type="text" 
              className="crud-input" 
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              placeholder="e.g. Jakarta, Indonesia"
            />
          </div>
          <div className="form-group">
            <label>Job Type</label>
            <select 
              className="crud-input"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea 
            className="crud-input"
            style={{ height: '120px' }}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed job description..."
          />
        </div>

        <div className="form-group">
          <label>Requirements</label>
          <textarea 
            className="crud-input"
            style={{ height: '120px' }}
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            placeholder="List of requirements..."
          />
        </div>

        <div className="form-actions">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit">
            {initialData ? 'Update Job' : 'Publish Job'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
