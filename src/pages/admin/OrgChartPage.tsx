import React, { useState, useEffect } from 'react';
import { Network, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { OrgChartNode } from '@/features/organization/components/OrgChartNode';
import { organizationService } from '@/features/organization/api/organization.service';

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
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Organization</span>
          <h1>Struktur Organisasi</h1>
          <p>Visualisasi hirarki departemen dan manajemen perusahaan secara real-time.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline"><Search size={18} style={{ marginRight: '8px' }} /> Cari</Button>
          <Button variant="primary">Export PDF</Button>
        </div>
      </div>

      <div style={{ 
        overflow: 'auto', 
        padding: '3rem 1rem', 
        background: '#f8fafc', 
        borderRadius: '16px', 
        minHeight: '600px',
        display: 'flex',
        justifyContent: 'center'
      }}>
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
