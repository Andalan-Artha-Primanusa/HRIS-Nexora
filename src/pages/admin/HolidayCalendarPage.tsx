import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, RefreshCw, MapPin, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';

const HolidayCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/workforce/holidays');
      setHolidays(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Workforce Policy</span>
          <h1>Holiday Calendar 2026</h1>
          <p>Manage national holidays and company-specific off-days.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary" onClick={() => navigate('/workforce/holidays/create')}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            Add Holiday
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
        <Card glass style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e3a8a' }}>April 2026</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="ghost" size="sm"><ChevronLeft size={20} /></Button>
              <Button variant="ghost" size="sm"><ChevronRight size={20} /></Button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#e2e8f0', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ padding: '0.75rem', textAlign: 'center', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i - 2; 
              const isHoliday = [1, 2, 10, 15].includes(day);
              return (
                <div key={i} style={{ 
                  height: '100px', 
                  padding: '0.5rem', 
                  background: 'white', 
                  fontSize: '0.9rem', 
                  color: (i % 7 === 0) ? '#ef4444' : '#1e293b',
                  opacity: (day < 1 || day > 30) ? 0.3 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <span style={{ fontWeight: isHoliday ? 700 : 400 }}>{day > 0 && day <= 30 ? day : ''}</span>
                  {isHoliday && (
                    <div style={{ 
                      fontSize: '0.65rem', 
                      background: '#fee2e2', 
                      color: '#ef4444', 
                      padding: '2px 4px', 
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      National Holiday
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card glass style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e3a8a' }}>Upcoming Holidays</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {holidays.length === 0 ? (
                [
                  { id: 1, name: 'Idul Fitri 1447H', date: 'March 20, 2026', color: '#ef4444', day: 20 },
                  { id: 2, name: 'Good Friday', date: 'April 3, 2026', color: '#ef4444', day: 3 },
                  { id: 3, name: 'Labor Day', date: 'May 1, 2026', color: '#ef4444', day: 1 },
                ].map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px', position: 'relative' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: h.color }}>APR</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{h.day}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{h.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{h.date}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/workforce/holidays/edit/${h.id}`)}>
                      <Edit2 size={14} />
                    </Button>
                  </div>
                ))
              ) : (
                holidays.map((h) => (
                  <div key={h.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ef4444' }}>HOL</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{new Date(h.date).getDate()}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{h.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{h.date}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/workforce/holidays/edit/${h.id}`)}>
                      <Edit2 size={14} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card glass style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#1e3a8a' }}>Location Policies</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="#64748b" />
                <span style={{ fontSize: '0.85rem' }}>Jakarta Office: <strong>Standard</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="#64748b" />
                <span style={{ fontSize: '0.85rem' }}>Remote: <strong>Regional Specific</strong></span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HolidayCalendarPage;

