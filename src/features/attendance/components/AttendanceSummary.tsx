import React from 'react';
import { Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';

interface AttendanceSummaryProps {
  stats: {
    total: number;
    present: number;
    late: number;
    absent: number;
  };
}

const StatCard: React.FC<{ label: string; value: number | string; sub: string; tone: string; icon: any }> = ({ label, value, sub, tone, icon: Icon }) => (
  <Card className="summary-card" glass>
    <div className="summary-card__header">
      <div>
        <span className="summary-card__label">{label}</span>
        <p className="summary-card__subtitle">{sub}</p>
      </div>
      <span className={`summary-card__icon summary-card__icon--${tone}`}>
        <Icon size={20} />
      </span>
    </div>
    <div className={`summary-card__value summary-card__value--${tone}`}>{value}</div>
    <div className="summary-card__change">Data Hari Ini</div>
  </Card>
);

export const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ stats }) => {
  return (
    <div className="summary-grid" style={{ marginBottom: '2rem' }}>
      <StatCard label="Total Karyawan" value={stats.total} sub="Terdaftar di sistem" tone="blue" icon={Users} />
      <StatCard label="Hadir" value={stats.present} sub="Sudah Check-in" tone="green" icon={CheckCircle} />
      <StatCard label="Terlambat" value={stats.late} sub="Melewati Grace Period" tone="orange" icon={Clock} />
      <StatCard label="Absen" value={stats.absent} sub="Belum ada catatan" tone="red" icon={AlertTriangle} />
    </div>
  );
};
