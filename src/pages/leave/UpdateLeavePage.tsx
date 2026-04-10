import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { getLeaveDetail, updateLeaveRequest } from '@/features/leave/api/leave.service';
import type { LeaveUpdatePayload } from '@/features/leave/types/leave.types';
import { ArrowLeft } from 'lucide-react';
import './LeavePages.css';

const UpdateLeavePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isViewMode = location.pathname.includes('/view/');
  
  const [formData, setFormData] = useState({
    type: 'annual',
    start_date: '',
    end_date: '',
    total_days: 1,
    reason: '',
  });
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('error');

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) {
        setAlertMessage('Leave ID tidak ditemukan');
        setAlertType('error');
        setLoading(false);
        return;
      }

      try {
        const result = await getLeaveDetail(id);
        const payload = result.payload as Record<string, any>;

        setFormData({
          type: payload.type || 'annual',
          start_date: payload.start_date || '',
          end_date: payload.end_date || '',
          total_days: payload.total_days || 1,
          reason: payload.reason || '',
        });
        setAlertMessage('');
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Gagal memuat data cuti';
        setAlertMessage(message);
        setAlertType('error');
      } finally {
        setLoading(false);
      }
    };

    void loadDetail();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'total_days' ? (parseInt(value) || 1) : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.type.trim()) {
      setAlertMessage('Tipe leave wajib dipilih');
      setAlertType('error');
      return false;
    }
    if (!formData.start_date) {
      setAlertMessage('Tanggal mulai wajib diisi');
      setAlertType('error');
      return false;
    }
    if (!formData.end_date) {
      setAlertMessage('Tanggal selesai wajib diisi');
      setAlertType('error');
      return false;
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setAlertMessage('Tanggal mulai harus sebelum tanggal selesai');
      setAlertType('error');
      return false;
    }
    if (!formData.reason.trim()) {
      setAlertMessage('Alasan wajib diisi');
      setAlertType('error');
      return false;
    }
    return true;
  };

  const handleUpdateLeave = async () => {
    if (!validateForm() || !id) return;

    setLoading(true);
    setAlertMessage('');

    try {
      const payload: LeaveUpdatePayload = {
        start_date: formData.start_date,
        end_date: formData.end_date,
        total_days: formData.total_days,
        reason: formData.reason,
      };

      await updateLeaveRequest(id, payload);
      setAlertMessage('Data cuti berhasil diperbarui!');
      setAlertType('success');
      setTimeout(() => {
        navigate('/leave/requests');
      }, 1500);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Gagal memperbarui data cuti';
      setAlertMessage(message);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/leave/requests');
  };

  if (loading && !formData.start_date) {
    return (
      <div className="leave-page">
        <div className="leave-header">
          <button className="leave-back-button" onClick={handleCancel} aria-label="Kembali">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>{isViewMode ? 'Lihat' : 'Edit'} Pengajuan Cuti</h1>
            <p>Memuat data cuti...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leave-page">
      {/* Header */}
      <div className="leave-header">
        <button className="leave-back-button" onClick={handleCancel} aria-label="Kembali">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1>{isViewMode ? 'Lihat' : 'Edit'} Pengajuan Cuti</h1>
          <p>{isViewMode ? 'Informasi detail pengajuan cuti Anda' : 'Perbarui informasi pengajuan cuti Anda'}</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="leave-card" glass>
        {alertMessage && (
          <Alert 
            type={alertType} 
            message={alertMessage}
            onClose={() => setAlertMessage('')}
            dismissible
          />
        )}

        <form className="leave-form" onSubmit={(e) => { e.preventDefault(); void handleUpdateLeave(); }}>
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
              disabled={isViewMode || loading}
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
                disabled={isViewMode || loading}
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
                disabled={isViewMode || loading}
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
              disabled={isViewMode || loading}
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
              disabled={isViewMode || loading}
              placeholder="Jelaskan alasan pengajuan cuti Anda..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="leave-actions">
            {!isViewMode && (
              <Button
                variant="primary"
                size="md"
                onClick={handleUpdateLeave}
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            )}
            <Button
              variant="secondary"
              size="md"
              onClick={handleCancel}
              disabled={loading}
            >
              {isViewMode ? 'Kembali' : 'Batal'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UpdateLeavePage;
