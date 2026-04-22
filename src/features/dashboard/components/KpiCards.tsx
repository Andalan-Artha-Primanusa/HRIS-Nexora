import React, { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Users, UserCheck, CalendarOff, Clock,TrendingDown, Target } from 'lucide-react';
import { api } from '@/shared/api/httpClient';
import './KpiCards.css';

type KpiCardItem = {
  title: string;
  value: string;
  trend: string;
  icon: React.ComponentType<{ size?: number }>;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'teal';
};

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? (value as UnknownRecord) : {};

const unwrapPayload = (raw: unknown) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

const getNumericValue = (raw: unknown): number | null => {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw === 'string') {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const getCountFromPayload = (raw: unknown): number => {
  const payload = unwrapPayload(raw);

  if (Array.isArray(payload)) {
    return payload.length;
  }

  const payloadRecord = toRecord(payload);
  const arrayCandidates = [payloadRecord.items, payloadRecord.rows, payloadRecord.data, payloadRecord.results];

  for (const candidate of arrayCandidates) {
    if (Array.isArray(candidate)) {
      return candidate.length;
    }
  }

  const numericCandidates = [
    payloadRecord.count,
    payloadRecord.total,
    payloadRecord.total_count,
    payloadRecord.totalCount,
    payloadRecord.present,
    payloadRecord.present_count,
    payloadRecord.presentCount,
  ];

  for (const candidate of numericCandidates) {
    const numericValue = getNumericValue(candidate);
    if (numericValue !== null) {
      return numericValue;
    }
  }

  return 0;
};

export const KpiCards: React.FC = () => {
  const [kpiData, setKpiData] = useState<KpiCardItem[]>([
    { title: 'Total Employees', value: '-', trend: 'Loading...', icon: Users, color: 'blue' },
    { title: 'Present Today', value: '-', trend: 'Loading...', icon: UserCheck, color: 'green' },
    { title: 'Pending Leaves', value: '-', trend: 'Loading...', icon: CalendarOff, color: 'orange' },
    { title: 'Pending Reimbursements', value: '-', trend: 'Loading...', icon: Clock, color: 'red' },
    { title: 'Avg. Performance', value: '-', trend: 'Loading...', icon: Target, color: 'purple' },
    { title: 'Attendance Rate', value: '-', trend: 'Loading...', icon: TrendingDown, color: 'teal' },
  ]);

  useEffect(() => {
    const loadDashboardKpis = async () => {
      const [employees, attendanceToday, pendingLeaves, pendingReimbursements, kpisRes] =
        await Promise.allSettled([
          api.get('/employees'),
          api.get('/attendance/today'),
          api.get('/leaves/pending'),
          api.get('/reimbursements/pending'),
          api.get('/kpis'),
        ]);

      const employeesCount = employees.status === 'fulfilled' ? getCountFromPayload(employees.value.data) : 0;
      const presentTodayCount =
        attendanceToday.status === 'fulfilled' ? getCountFromPayload(attendanceToday.value.data) : 0;
      const pendingLeavesCount =
        pendingLeaves.status === 'fulfilled' ? getCountFromPayload(pendingLeaves.value.data) : 0;
      const pendingReimbursementsCount =
        pendingReimbursements.status === 'fulfilled'
          ? getCountFromPayload(pendingReimbursements.value.data)
          : 0;
      const kpis = kpisRes.status === 'fulfilled' ? unwrapPayload(kpisRes.value.data) : [];
      const kpiItems = Array.isArray(kpis) ? kpis : ((kpis as any)?.items || []);
      const avgKpiScore = kpiItems.length > 0 
        ? kpiItems.reduce((acc: number, k: any) => acc + (Number(k.score) || 0), 0) / kpiItems.length 
        : 0;

      const attendanceRate = employeesCount > 0 ? Math.round((presentTodayCount / employeesCount) * 100) : 0;

      setKpiData([
        {
          title: 'Total Employees',
          value: String(employeesCount),
          trend: 'Employee records',
          icon: Users,
          color: 'blue',
        },
        {
          title: 'Present Today',
          value: String(presentTodayCount),
          trend: `${attendanceRate}% attendance`,
          icon: UserCheck,
          color: 'green',
        },
        {
          title: 'Pending Leaves',
          value: String(pendingLeavesCount),
          trend: 'Need approval',
          icon: CalendarOff,
          color: 'orange',
        },
        {
          title: 'Pending Reimbursements',
          value: String(pendingReimbursementsCount),
          trend: 'Need review',
          icon: Clock,
          color: 'red',
        },
        {
          title: 'Avg. Performance',
          value: `${avgKpiScore.toFixed(1)}%`,
          trend: `${kpiItems.length} KPI records tracked`,
          icon: Target,
          color: 'purple',
        },
        {
          title: 'Attendance Rate',
          value: `${attendanceRate}%`,
          trend: 'Based on today attendance',
          icon: TrendingDown,
          color: 'teal',
        },
      ]);
    };

    void loadDashboardKpis();
  }, []);

  return (
    <div className="kpi-grid">
      {kpiData.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card key={idx} className="kpi-card" glass>
            <div className="kpi-content">
              <div className="kpi-info">
                <p className="kpi-title">{kpi.title}</p>
                <h3 className="kpi-value">{kpi.value}</h3>
              </div>
              <div className={`kpi-icon-wrapper color-${kpi.color}`}>
                <Icon size={24} />
              </div>
            </div>
            <p className="kpi-trend">{kpi.trend}</p>
          </Card>
        );
      })}
    </div>
  );
};

