import React, { useState, useEffect } from 'react';
import { Network, Search, RefreshCw, Share2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { OrgChartNode } from '@/features/organization/components/OrgChartNode';
import { organizationService } from '@/features/organization/api/organization.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const OrgChartPage: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await organizationService.getOrgChart();
        setChartData(data.data || data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderChildren = (children: any[]) => (
    <div className="org-children-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1.5rem' }}>
      <div style={{ width: '2px', height: '24px', background: '#cbd5e1' }}></div>
      <div style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
         <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '2px', background: '#cbd5e1' }}></div>
         {children.map((child: any) => (
           <OrgChartNode key={child.id} node={child} renderChildren={renderChildren} />
         ))}
      </div>
    </div>
  );

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Share2 size={16} />
              <span>Organization</span>
            </div>
            <h1 className="hero-title">Struktur Organisasi</h1>
            <p className="hero-subtitle">
              Visualisasi hirarki departemen dan manajemen perusahaan secara real-time.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline">
              <Search size={16} />
              Cari
            </button>
            <button className="btn-primary">
              Export PDF
            </button>
          </div>
        </div>
      </Card>

      <div className="white-unified-wrapper" style={{ minHeight: '600px', padding: '3rem' }}> 
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <RefreshCw size={24} className="animate-spin" color="#2563eb" />
              <span>Memuat...</span>
            </div>
          ) : chartData ? (
            <OrgChartNode node={chartData} renderChildren={renderChildren} />
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
              <Network size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>Data tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>
  );
};

export default OrgChartPage;
