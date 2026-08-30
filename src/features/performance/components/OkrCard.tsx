import React from 'react';
import { Target } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import type { OKR } from '../types/performance.types';

interface OkrCardProps {
  okr: OKR;
}

export const OkrCard: React.FC<OkrCardProps> = ({ okr }) => {
  return (
    <Card glass style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={20} color="var(--color-primary)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>{okr.title}</h3>
        </div>
        <span className={`status-pill status-${okr.status}`}>{okr.status}</span>
      </div>
      
      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>{okr.description}</p>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
          <span style={{ color: '#64748b' }}>Total Progress</span>
          <span style={{ fontWeight: 700, color: '#1e293b' }}>{okr.progress}%</span>
        </div>
        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${okr.progress}%`, height: '100%', background: 'var(--color-primary)' }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b' }}>Key Results</h4>
        {okr.key_results?.map((kr) => (
          <div key={kr.id} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
              <span style={{ color: '#475569' }}>{kr.title}</span>
              <span style={{ fontWeight: 600 }}>{kr.current_value} / {kr.target_value} {kr.unit}</span>
            </div>
            <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${(kr.current_value / kr.target_value) * 100}%`, height: '100%', background: '#10b981' }}></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
