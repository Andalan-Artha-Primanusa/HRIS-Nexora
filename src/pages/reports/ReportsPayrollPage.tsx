import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, CheckCircle, Users, TrendingUp, RefreshCw, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import './ReportsDashboardPage.css';

type Rec = Record<string, unknown>;
const toRec = (v: unknown): Rec => (v && typeof v === 'object' ? (v as Rec) : {});
const extractArr = (raw: unknown): Rec[] => {
  const payload = (() => { const r = toRec(raw); return r.data ?? raw; })();
  if (Array.isArray(payload)) return payload.filter((i): i is Rec => !!i && typeof i === 'object');
  const r = toRec(payload);
  for (const k of ['items','rows','data','results']) { const c = r[k]; if (Array.isArray(c)) return c.filter((i): i is Rec => !!i && typeof i === 'object'); }
  return [];
};
const getStr = (rec: Rec, keys: string[]) => { for (const k of keys) { const v = rec[k]; if (typeof v === 'string' && v.trim()) return v.trim(); } return ''; };
const getNum = (v: unknown) => { if (typeof v === 'number' && Number.isFinite(v)) return v; if (typeof v === 'string') { const p = Number(v); if (Number.isFinite(p)) return p; } return 0; };

const TT = { contentStyle: { backgroundColor:'#fff', border:'1px solid #dbeafe', borderRadius:'8px' }, labelStyle: { color:'#1e40af', fontWeight:'bold' as const } };
const fmtMonth = (period: string) => { if (!period) return period; const [y,m] = period.split('-'); const d = new Date(Number(y),Number(m)-1,1); return Number.isNaN(d.getTime()) ? period : d.toLocaleDateString('id-ID',{month:'short',year:'numeric'}); };
const fmtRp = (n: number) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);

const MetricCard: React.FC<{label:string;sub:string;value:string;tone:string;icon:React.ElementType}> = ({label,sub,value,tone,icon:Icon}) => (
  <Card className="report-metric-card" glass>
    <div className="report-metric-header">
      <div><span className="report-metric-label">{label}</span><p className="report-metric-sublabel">{sub}</p></div>
      <span className={`report-metric-icon report-metric-icon--${tone}`}><Icon size={20}/></span>
    </div>
    <div className="report-metric-value">{value}</div>
    <div className="report-metric-change neutral">Live data</div>
  </Card>
);

const ReportsPayrollPage: React.FC = () => {
  const [records, setRecords] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState("");

  const load = async () => { 
    setLoading(true); 
    setError(null); 
    try { 
      const response = await api.get('/payroll');
      setRecords(extractArr(response.data)); 
    } catch(e){ 
      setError(e instanceof Error ? e.message : 'Error'); 
    } finally { 
      setLoading(false); 
    } 
  };

  useEffect(() => { void load(); }, []);

  const filteredRecords = useMemo(() => {
    if (!filterPeriod) return records;
    return records.filter(r => getStr(r, ['period']).includes(filterPeriod));
  }, [records, filterPeriod]);

  const paid    = useMemo(() => filteredRecords.filter(r=>['paid','approved'].includes(getStr(r,['status']).toLowerCase())).length, [filteredRecords]);
  const totalNet  = useMemo(() => filteredRecords.reduce((s,r)=>s+getNum(r.net_salary??r.total_salary??r.amount),0), [filteredRecords]);
  const uniqueEmps = useMemo(() => new Set(filteredRecords.map(r=>getStr(r,['employee_id','user_id']))).size, [filteredRecords]);

  const statusData = useMemo(() => {
    const m = new Map<string,number>(); filteredRecords.forEach(r=>{ const s=getStr(r,['status'])||'Unknown'; m.set(s,(m.get(s)||0)+1); });
    return [...m].map(([name,value])=>({name:name.charAt(0).toUpperCase()+name.slice(1),value}));
  }, [filteredRecords]);

  const periodTimeline = useMemo(() => {
    const m = new Map<string,{paid:number;pending:number;total:number;net:number}>();
    filteredRecords.forEach(r => {
      const period = getStr(r,['period'])||'Unknown';
      const cur = m.get(period)||{paid:0,pending:0,total:0,net:0};
      const s = getStr(r,['status']).toLowerCase();
      if(s==='paid'||s==='approved') cur.paid++; else cur.pending++;
      cur.total++;
      cur.net += getNum(r.net_salary??r.total_salary??r.amount);
      m.set(period,cur);
    });
    return [...m.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([period,v])=>({month:fmtMonth(period),...v}));
  }, [filteredRecords]);

  const netByPeriod = useMemo(() => periodTimeline.map(p=>({month:p.month,net:p.net})), [periodTimeline]);

  const deptData = useMemo(() => {
    const m = new Map<string,number>(); filteredRecords.forEach(r=>{ const d=getStr(r,['department','department_name'])||'Unassigned'; m.set(d,(m.get(d)||0)+getNum(r.net_salary??r.total_salary??r.amount)); });
    return [...m].map(([name,value])=>({name,value}));
  }, [filteredRecords]);

  const availablePeriods = useMemo(() => {
    return Array.from(new Set(records.map(r => getStr(r, ['period'])))).filter(Boolean).sort();
  }, [records]);

  return (
    <div className="reports-dashboard">
      <Card className="reports-hero-card" glass>
        <div className="reports-hero-copy">
          <p className="reports-badge">Analytics & Reporting</p>
          <h1 className="reports-title">Analitik Data Payroll</h1>
          <p className="reports-subtitle">
            Dashboard analisis data <strong>payroll yang telah diproses</strong>. 
            Lacak tren nominal gaji, status pembayaran per periode, dan distribusi pengeluaran 
            departemen berdasarkan data historis sistem.
          </p>
        </div>
        <div className="reports-actions">
          <Button variant="primary" size="md" onClick={()=>void load()} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} style={{ marginRight: '8px' }} />
            {loading ? 'Menyegarkan...' : 'Segarkan Analitik'}
          </Button>
        </div>
      </Card>

      <div className="reports-filter-bar">
        <label><TrendingUp size={16} style={{ marginRight: '8px' }} /> Filter Periode</label>
        <select 
          value={filterPeriod} 
          onChange={(e) => setFilterPeriod(e.target.value)}
        >
          <option value="">Semua Periode</option>
          {availablePeriods.map(p => (
            <option key={p} value={p}>{fmtMonth(p)}</option>
          ))}
        </select>
        {filterPeriod && (
          <Button variant="ghost" size="sm" onClick={() => setFilterPeriod("")}>Reset</Button>
        )}
      </div>

      {error && <p className="reports-error">{error}</p>}

      <div className="reports-metrics-grid">
        <MetricCard label="Total Records" sub="Seluruh entri" value={String(filteredRecords.length)} tone="blue" icon={BarChart3}/>
        <MetricCard label="Gaji Bersih" sub="Akumulasi periode ini" value={fmtRp(totalNet)} tone="cyan" icon={Wallet}/>
        <MetricCard label="Dibayar" sub="Status Paid/Approved" value={String(paid)} tone="green" icon={CheckCircle}/>
        <MetricCard label="Karyawan" sub="Jumlah penerima unik" value={String(uniqueEmps)} tone="red" icon={Users}/>
      </div>

      <div className="reports-charts-section">
        <div className="reports-charts-grid">
          <Card className="reports-chart-card" glass>
            <h2 className="reports-chart-title"><BarChart3 size={18} color="#2563eb" /> Status Payroll per Periode</h2>
            <p className="reports-chart-subtitle">Perbandingan jumlah payroll Paid vs Pending</p>
            {periodTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={periodTimeline} margin={{top:10,right:30,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.1)"/>
                  <XAxis dataKey="month" stroke="#1e40af" style={{fontSize:'12px'}}/><YAxis stroke="#1e40af" style={{fontSize:'12px'}}/>
                  <Tooltip {...TT}/><Legend wrapperStyle={{paddingTop:'20px'}}/>
                  <Bar dataKey="paid" stackId="a" fill="#10b981" radius={[4,4,0,0]} name="Dibayar"/>
                  <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[0,0,0,0]} name="Pending"/>
                </BarChart>
              </ResponsiveContainer>
            ):(<div className="reports-chart-empty">{loading?'Memuat...':'Belum ada data.'}</div>)}
          </Card>

          <Card className="reports-chart-card" glass>
            <h2 className="reports-chart-title"><Wallet size={18} color="#2563eb" /> Tren Nominal Payroll</h2>
            <p className="reports-chart-subtitle">Total net salary yang diproses per bulan</p>
            {netByPeriod.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={netByPeriod} margin={{top:10,right:30,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.1)"/>
                  <XAxis dataKey="month" stroke="#1e40af" style={{fontSize:'12px'}}/><YAxis stroke="#1e40af" style={{fontSize:'12px'}}/>
                  <Tooltip {...TT} formatter={(v:any)=>fmtRp(Number(v))}/>
                  <Line type="monotone" dataKey="net" stroke="#2563eb" strokeWidth={3} dot={{r:5, fill:'#2563eb', strokeWidth:2, stroke:'#fff'}} activeDot={{r:7}} name="Net Salary"/>
                </LineChart>
              </ResponsiveContainer>
            ):(<div className="reports-chart-empty">{loading?'Memuat...':'Belum ada data.'}</div>)}
          </Card>

          <Card className="reports-chart-card" glass>
            <h2 className="reports-chart-title"><PieIcon size={18} color="#2563eb" /> Proporsi Status</h2>
            <p className="reports-chart-subtitle">Pembagian status payroll keseluruhan</p>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Tooltip {...TT}/><Legend wrapperStyle={{paddingTop:'20px'}}/>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({name,value})=>`${name}: ${value}`}>
                    {statusData.map((_,i)=><Cell key={i} fill={['#10b981','#f59e0b','#2563eb','#ef4444','#8b5cf6'][i%5]}/>)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ):(<div className="reports-chart-empty">{loading?'Memuat...':'Belum ada data.'}</div>)}
          </Card>

          <Card className="reports-chart-card" glass>
            <h2 className="reports-chart-title"><Users size={18} color="#2563eb" /> Pengeluaran per Departemen</h2>
            <p className="reports-chart-subtitle">Distribusi biaya gaji berdasarkan departemen</p>
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptData} margin={{top:10,right:30,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.1)"/>
                  <XAxis dataKey="name" stroke="#1e40af" style={{fontSize:'12px'}}/><YAxis stroke="#1e40af" style={{fontSize:'12px'}} tickFormatter={(v:number)=>Intl.NumberFormat('id-ID',{notation:'compact'}).format(v)}/>
                  <Tooltip {...TT} formatter={(v:any)=>fmtRp(Number(v))} cursor={{fill:'rgba(37,99,235,0.1)'}}/>
                  <Bar dataKey="value" fill="#8b5cf6" radius={[6,6,0,0]} name="Total Salary"/>
                </BarChart>
              </ResponsiveContainer>
            ):(<div className="reports-chart-empty">{loading?'Memuat...':'Belum ada data.'}</div>)}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsPayrollPage;
