import React from 'react';
import { BarChart3, Clock3, CircleCheckBig, CircleX, Calendar } from 'lucide-react';
import { Card } from '@/shared/ui/Card';

interface LeaveSummaryProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
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
    <div className="summary-card__change">Data Periode Ini</div>
  </Card>
);

export const LeaveSummary: React.FC<LeaveSummaryProps> = ({ stats }) => {
  return (
    <div className="summary-grid" style={{ marginBottom: '2rem' }}>
      <StatCard label="Total Pengajuan" value={stats.total} sub="Request cuti terdaftar" tone="blue" icon={BarChart3} />
      <StatCard label="Menunggu" value={stats.pending} sub="Perlu ditinjau" tone="orange" icon={Clock3} />
      <StatCard label="Disetujui" value={stats.approved} sub="Status final" tone="green" icon={CircleCheckBig} />
      <StatCard label="Ditolak" value={stats.rejected} sub="Tidak disetujui" tone="red" icon={CircleX} />
    </div>
  );
};
