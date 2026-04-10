import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { createLeaveRequest } from '@/features/leave/api/leave.service';
import type { LeaveCreatePayload } from '@/features/leave/types/leave.types';
import { AlertCircle, Check, ArrowLeft } from 'lucide-react';
import './LeavePages.css';

const CreateLeavePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'annual',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    total_days: 1,
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'total_days' ? (parseInt(value) || 1) : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.type.trim()) {
      setError('Tipe leave wajib dipilih');
      return false;
    }
    if (!formData.start_date) {
      setError('Tanggal mulai wajib diisi');
      return false;
    }
    if (!formData.end_date) {
      setError('Tanggal selesai wajib diisi');
      return false;
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError('Tanggal mulai harus sebelum tanggal selesai');
      return false;
    }
    if (!formData.reason.trim()) {
      setError('Alasan wajib diisi');
      return false;
    }
    return true;
  };

  const handleCreateLeave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload: LeaveCreatePayload = {
        type: formData.type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        total_days: formData.total_days,
        reason: formData.reason,
      };

      await createLeaveRequest(payload);
      setSuccess('✓ Pengajuan cuti berhasil dibuat!');
      setTimeout(() => {
        navigate('/leave/requests');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal membuat pengajuan cuti');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/leave/requests');
  };

  return (
    <div className="leave-page">
      {/* Header */}
      <div className="leave-header">
        <button className="leave-back-button" onClick={handleCancel} aria-label="Kembali">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1>Buat Pengajuan Cuti</h1>
          <p>Ajukan pengajuan cuti baru dengan informasi yang lengkap</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="leave-card" glass>
        {error && (
          <div className="leave-alert leave-alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="leave-alert leave-alert-success">
            <Check size={20} />
            <span>{success}</span>
          </div>
        )}

        <form className="leave-form" onSubmit={(e) => { e.preventDefault(); void handleCreateLeave(); }}>
          {/* Tipe Cuti */}
          <div className="leave-form-group">
            <label htmlFor="type">
              Tipe Cuti
              <span className="leave-required">*</span>
            </label>
            <select
              id="type"
              name="type"
              className="leave-input"
              value={formData.type}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="annual">Cuti Tahunan</option>
              <option value="sick">Cuti Sakit</option>
              <option value="personal">Cuti Pribadi</option>
              <option value="maternity">Cuti Melahirkan</option>
              <option value="parental">Cuti Orang Tua</option>
              <option value="unpaid">Cuti Tanpa Gaji</option>
            </select>
          </div>

          {/* Dates */}
          <div className="leave-form-row">
            <div className="leave-form-group">
              <label htmlFor="start_date">
                Tanggal Mulai
                <span className="leave-required">*</span>
              </label>
              <input
                id="start_date"
                type="date"
                name="start_date"
                className="leave-input"
                value={formData.start_date}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="leave-form-group">
              <label htmlFor="end_date">
                Tanggal Selesai
                <span className="leave-required">*</span>
              </label>
              <input
                id="end_date"
                type="date"
                name="end_date"
                className="leave-input"
                value={formData.end_date}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* Total Days */}
          <div className="leave-form-group">
            <label htmlFor="total_days">
              Total Hari
              <span className="leave-required">*</span>
            </label>
            <input
              id="total_days"
              type="number"
              name="total_days"
              className="leave-input"
              value={formData.total_days}
              onChange={handleInputChange}
              min="1"
              disabled={loading}
            />
          </div>

          {/* Reason */}
          <div className="leave-form-group leave-form-full">
            <label htmlFor="reason">
              Alasan Cuti
              <span className="leave-required">*</span>
            </label>
            <textarea
              id="reason"
              name="reason"
              className="leave-input leave-textarea"
              value={formData.reason}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Jelaskan alasan pengajuan cuti Anda..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="leave-actions">
            <Button
              variant="primary"
              size="md"
              onClick={handleCreateLeave}
              disabled={loading}
            >
              {loading ? 'Membuat...' : 'Buat Pengajuan'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={handleCancel}
              disabled={loading}
            >
              Batal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateLeavePage;
