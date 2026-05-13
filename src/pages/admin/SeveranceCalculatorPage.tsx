import React, { useState, useEffect } from 'react';
import { Calculator, Download, RefreshCw, BookTemplate } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { getAllEmployees } from '@/features/employee/api/employee.service';
import { legalService } from '@/features/legal/api/legal.service';
import { api } from '@/shared/api/httpClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const SeveranceCalculatorPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [calculation, setCalculation] = useState<any>(null);
  const [joinDate, setJoinDate] = useState('');
  const [terminationDate, setTerminationDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getAllEmployees();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setEmployees([]);
      }
    };
    const fetchCompany = async () => {
      try {
        const response = await api.get('/company');
        const data = response.data;
        const companyData = Array.isArray(data) ? data[0] : data.data || data;
        if (companyData) {
          setCompany(companyData);
        }
      } catch (err) {
        console.error('Failed to fetch company', err);
      }
    };
    fetchEmployees();
    fetchCompany();
  }, []);

  const handleEmployeeChange = (id: string) => {
    setSelectedEmployee(id);
    const emp = employees.find(e => String(e.id) === id);
    if (emp && emp.hire_date) {
      setJoinDate(emp.hire_date.split('T')[0]);
    } else {
      setJoinDate('');
    }
    setCalculation(null);
    setError(null);
  };

  const handleCalculate = async () => {
    if (!selectedEmployee || !joinDate || !terminationDate) {
      setError('Harap pilih karyawan, tanggal masuk, dan tanggal keluar.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await legalService.calculateSeverance(selectedEmployee, {
        join_date: joinDate,
        termination_date: terminationDate
      });
      const responseData = data.data || data;
      setCalculation({
        service_period_formatted: responseData.masa_kerja_bulan ? `${Math.floor(responseData.masa_kerja_bulan)} bulan` : '-',
        base_salary: responseData.employee?.salary || 0,
        severance_pay: responseData.pesangon?.pesangon || 0,
        service_reward: responseData.pesangon?.uang_penghargaan || 0,
        compensation: responseData.pesangon?.uang_penggantian || 0,
        total_severance: responseData.pesangon?.total || 0,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Gagal menghitung pesangon');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const exportPDF = () => {
    if (!calculation) return;
    const doc = new jsPDF();
    const emp = employees.find(e => String(e.id) === selectedEmployee);
    const pageWidth = 210;
    const margin = 20;

    // Professional Header with gradient effect
    doc.setFillColor(20, 30, 48);
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 3, 'F');

    // Company Info
    if (company) {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(company.name || 'Perusahaan', pageWidth / 2, 18, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      
      doc.setFontSize(9);
      const addr = [company.address, company.city, company.state].filter(v => v).join(', ');
      if (addr) doc.text(addr, pageWidth / 2, 26, { align: 'center' });
      
      const contact = [company.phone, company.email].filter(v => v).join(' | ');
      if (contact) doc.text(contact, pageWidth / 2, 32, { align: 'center' });
      if (company.tax_number) {
        doc.text(`NPWP: ${company.tax_number}`, pageWidth / 2, 38, { align: 'center' });
      }
    }

    // Document Title
    doc.setTextColor(20, 30, 48);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PERHITUNGAN PESANGON', pageWidth / 2, 62, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Berdasarkan PP No. 35 Tahun 2021 - Perhitungan Progresif', pageWidth / 2, 68, { align: 'center' });

    // Divider
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, 72, pageWidth - margin, 72);

    // Employee Information Section
    const infoStartY = 80;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, infoStartY, pageWidth - (margin * 2), 38, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, infoStartY, pageWidth - (margin * 2), 38, 3, 3, 'S');

    doc.setTextColor(20, 30, 48);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMASI KARYAWAN', margin + 8, infoStartY + 10);
    doc.setFont('helvetica', 'normal');
    
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    const empName = emp?.full_name || emp?.user?.name || '-';
    const empCode = emp?.employee_code || emp?.employee_id || '-';
    const empPos = emp?.position || '-';
    const empDept = emp?.department || '-';

    doc.text(`Nama: ${empName}`, margin + 8, infoStartY + 17);
    doc.text(`ID Karyawan: ${empCode}`, margin + 8, infoStartY + 23);
    doc.text(`Posisi: ${empPos}`, margin + 8, infoStartY + 29);
    doc.text(`Departemen: ${empDept}`, margin + 75, infoStartY + 17);
    doc.text(`Tanggal Masuk: ${joinDate}`, margin + 75, infoStartY + 23);
    doc.text(`Tanggal Keluar: ${terminationDate}`, margin + 75, infoStartY + 29);

    // Calculation Results Table
    const tableStartY = infoStartY + 48;
    autoTable(doc, {
      startY: tableStartY,
      head: [['Komponen', 'Jumlah (IDR)']],
      body: [
        ['Masa Kerja', calculation.service_period_formatted || '-'],
        ['Gaji Pokok', formatCurrency(calculation.base_salary)],
        ['Uang Pesangon', formatCurrency(calculation.severance_pay)],
        ['Uang Penghargaan Masa Kerja (UPMK)', formatCurrency(calculation.service_reward)],
        ['Uang Penggantian Hak (UPH)', formatCurrency(calculation.compensation)],
      ],
      styles: { fontSize: 10, cellPadding: 7, lineColor: [230, 230, 230] },
      headStyles: { 
        fillColor: [20, 30, 48], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: { 
        0: { fontStyle: 'bold', cellWidth: 130, fillColor: [248, 250, 252] }, 
        1: { halign: 'right', cellWidth: 60, fontStyle: 'bold' } 
      },
      alternateRowStyles: { fillColor: [252, 252, 253] }
    });

    // Total Box
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFillColor(20, 30, 48);
    doc.roundedRect(margin, finalY, pageWidth - (margin * 2), 28, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.text('TOTAL PESANGON', margin + 10, finalY + 11);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(calculation.total_severance), pageWidth - margin - 10, finalY + 11, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    const footerY = 285;
    doc.text(`Dibuat: ${new Date().toLocaleString('id-ID')}`, margin, footerY);
    doc.text(`Didukung oleh ${company?.name || 'Sistem HRIS'}`, pageWidth / 2, footerY, { align: 'center' });
    doc.text('Halaman 1 dari 1', pageWidth - margin, footerY, { align: 'right' });

    // Save
    doc.save(`Pesangon_${empCode}_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <BookTemplate size={16} />
              <span>Legal & Kepatuhan</span>
            </div>
            <h1 className="hero-title">Kalkulator Pesangon</h1>
            <p className="hero-subtitle">
              Perhitungan pesangon otomatis berdasarkan PP 35/2021.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => window.location.reload()}>
              <RefreshCw size={16} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        <Card glass style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--cr-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '12px', color: '#2563eb' }}>
              <Calculator size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Pilih Karyawan</h3>
          </div>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Nama Karyawan
            </label>
            <select 
              className="form-control" 
              value={selectedEmployee}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              style={{ 
                width: '100%', 
                height: '50px', 
                borderRadius: '14px', 
                border: '1px solid #e2e8f0',
                padding: '0 1rem',
                fontSize: '0.95rem',
                background: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <option value="">-- Pilih Karyawan --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name || emp.user?.name || emp.name || 'Tidak diketahui'} ({emp.employee_id || emp.employee_code || '#'+emp.id})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Tanggal Bergabung
              </label>
              <input 
                type="date" 
                className="form-control"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Tanggal Keluar
              </label>
              <input 
                type="date" 
                className="form-control"
                value={terminationDate}
                onChange={(e) => setTerminationDate(e.target.value)}
                style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: '1.5rem', padding: '12px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#dc2626', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span> {error}
            </div>
          )}
          
          <Button 
            variant="primary" 
            style={{ width: '100%', height: '54px', borderRadius: '16px', fontSize: '1rem', fontWeight: 600, boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)' }} 
            onClick={handleCalculate} 
            disabled={!selectedEmployee || !joinDate || !terminationDate || loading}
          >
            <Calculator size={20} style={{ marginRight: '10px' }} />
            {loading ? 'Menghitung...' : 'Hitung Pesangon'}
          </Button>

          <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#f0f9ff', borderRadius: '16px', border: '1px dashed #bae6fd' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#0369a1', lineHeight: 1.5 }}>
              <strong>Catatan:</strong> Perhitungan mencakup uang pesangon, uang penghargaan masa kerja (UPMK), dan uang penggantian hak (UPH) sesuai peraturan pemerintah.
            </p>
          </div>
        </Card>

        <Card glass style={{ padding: '0', borderRadius: '24px', border: '1px solid var(--cr-border)', overflow: 'hidden' }}>
          {calculation ? (
            <div className="calculation-result">
              <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.4)' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Ringkasan Perhitungan</h3>
                <Button variant="outline" style={{ borderRadius: '10px' }} onClick={exportPDF}>
                  <Download size={18} style={{ marginRight: '8px' }} />
                  Ekspor PDF
                </Button>
              </div>

              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Masa Kerja</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>{calculation.service_period_formatted || '-'}</div>
                  </div>
                  <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Gaji Pokok</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>{formatCurrency(calculation.base_salary || 0)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Uang Pesangon</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{formatCurrency(calculation.severance_pay || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Uang Penghargaan Masa Kerja (UPMK)</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{formatCurrency(calculation.service_reward || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Uang Penggantian Hak (UPH)</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{formatCurrency(calculation.compensation || 0)}</span>
                  </div>
                  
                  <div style={{ 
                    marginTop: '1.5rem', 
                    padding: '2rem', 
                    background: 'linear-gradient(135deg, #2563eb, #1e40af)', 
                    borderRadius: '20px', 
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, marginBottom: '4px' }}>Total Pembayaran</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{formatCurrency(calculation.total_severance || 0)}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '14px' }}>
                      <Calculator size={32} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: '3rem', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#cbd5e1' }}>
                <Calculator size={40} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: '#475569', fontWeight: 700 }}>Siap Menghitung</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', maxWidth: '300px' }}>Pilih karyawan dari daftar untuk menghitung paket pesangon sesuai PP 35/2021.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SeveranceCalculatorPage;
