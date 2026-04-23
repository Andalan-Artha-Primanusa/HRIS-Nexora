import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { BarChart3, CheckCircle2, Receipt, Wallet, FileText, Download, Printer } from "lucide-react";
import { getMyPayroll, getMyPayrollDetail, exportMyPayrollPdf } from "@/features/ess/api/ess.service";
import type { GenericApiItem } from "@/features/ess/types/ess.types";
import "./EssPages.css";

const MyPayrollPage = () => {
  const [items, setItems] = useState<GenericApiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const summaryCards = useMemo(() => {
    const paidCount = items.filter((item) => String(item.status ?? "").toLowerCase() === "paid").length;
    const totalNetSalary = items.reduce((sum, item) => sum + (Number(item.net_salary || item.take_home_pay) || 0), 0);
    const uniquePeriods = new Set(items.map((item) => String(item.period ?? "")).filter(Boolean));

    return [
      {
        label: "Total Slip",
        subtitle: "Seluruh riwayat payroll",
        value: String(items.length),
        tone: "blue" as const,
        icon: BarChart3,
      },
      {
        label: "Sudah Dibayar",
        subtitle: "Slip yang telah cair",
        value: String(paidCount),
        tone: "green" as const,
        icon: CheckCircle2,
      },
      {
        label: "Periode",
        subtitle: "Rentang waktu aktif",
        value: String(uniquePeriods.size),
        tone: "orange" as const,
        icon: Receipt,
      },
      {
        label: "Total Gaji Bersih",
        subtitle: "Akumulasi pendapatan",
        value: `Rp ${totalNetSalary.toLocaleString("id-ID")}`,
        tone: "red" as const,
        icon: Wallet,
      },
    ];
  }, [items]);

  const loadPayroll = async () => {
    setLoading(true);
    try {
      const result = await getMyPayroll();
      setItems(result.items);
    } catch (error) {
      console.error("Failed to load payroll:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSlip = async (id: string) => {
    setDetailLoading(true);
    setIsModalOpen(true);
    try {
      const result = await getMyPayrollDetail(id);
      setSelectedSlip(result.payload);
    } catch (error) {
      console.error("Failed to load slip details:", error);
      setIsModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      const blob = await exportMyPayrollPdf(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Slip_Gaji_${selectedSlip?.period || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  };

  useEffect(() => {
    void loadPayroll();
  }, []);

  const formatCurrency = (val: any) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`;

  return (
    <div className="ess-page">
      <div className="ess-header">
        <div className="ess-header-copy">
          <p className="ess-badge">ESS Payroll</p>
          <h1>Riwayat Gaji Saya</h1>
          <p>Lihat dan unduh slip gaji bulanan Anda dengan aman.</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadPayroll()} disabled={loading}>
          Segarkan
        </Button>
      </div>

      <div className="ess-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="ess-summary-card" glass>
              <div className="ess-summary-header">
                <div>
                  <span className="ess-summary-label">{card.label}</span>
                  <p className="ess-summary-subtitle">{card.subtitle}</p>
                </div>
                <span className={`ess-summary-icon ess-summary-icon--${card.tone}`}>
                  <Icon size={18} />
                </span>
              </div>
              <div className="ess-summary-value">{card.value}</div>
            </Card>
          );
        })}
      </div>

      <Card className="ess-card" glass>
        <h2>Daftar Slip Gaji</h2>
        <div className="ess-table-wrap">
          <table className="ess-table">
            <thead>
              <tr>
                <th>Periode</th>
                <th>Gaji Pokok</th>
                <th>Gaji Bersih</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={String(item.id)}>
                    <td style={{ fontWeight: 600 }}>{String(item.period || '-')}</td>
                    <td>{formatCurrency(item.basic_salary)}</td>
                    <td style={{ color: '#10b981', fontWeight: 700 }}>{formatCurrency(item.take_home_pay || item.net_salary)}</td>
                    <td>
                      <span className={`ess-status-badge ess-status-badge--${String(item.status).toLowerCase()}`}>
                        {String(item.status).toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {String(item.status).toLowerCase() === 'paid' ? (
                        <Button variant="ghost" size="sm" onClick={() => handleViewSlip(String(item.id))}>
                          <FileText size={16} style={{ marginRight: '6px' }} />
                          Lihat Slip
                        </Button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Menunggu Pembayaran</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    Belum ada riwayat slip gaji.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Digital Salary Slip"
        size="lg"
      >
        {detailLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="animate-spin" style={{ margin: '0 auto 1rem' }}><Receipt size={32} color="#2563eb" /></div>
            <p>Memuat rincian slip gaji...</p>
          </div>
        ) : selectedSlip && (
          <div className="digital-slip">
            <div className="digital-slip-header">
              <div className="digital-slip-brand">
                <div className="slip-logo">HR</div>
                <div>
                  <h3>Slip Gaji Digital</h3>
                  <p>Periode: {selectedSlip.period}</p>
                </div>
              </div>
              <div className="digital-slip-status">
                <span className="status-badge-paid">PAID</span>
              </div>
            </div>

            <div className="digital-slip-grid">
              <div className="slip-section">
                <h4>PENERIMAAN</h4>
                <div className="slip-row">
                  <span>Gaji Pokok</span>
                  <span>{formatCurrency(selectedSlip.basic_salary)}</span>
                </div>
                {selectedSlip.allowance > 0 && (
                  <div className="slip-row">
                    <span>Tunjangan</span>
                    <span>{formatCurrency(selectedSlip.allowance)}</span>
                  </div>
                )}
                {selectedSlip.bonus > 0 && (
                  <div className="slip-row">
                    <span>Bonus</span>
                    <span>{formatCurrency(selectedSlip.bonus)}</span>
                  </div>
                )}
                <div className="slip-row slip-row--total">
                  <span>Total Pendapatan Kotor</span>
                  <span>{formatCurrency(Number(selectedSlip.basic_salary) + Number(selectedSlip.allowance || 0) + Number(selectedSlip.bonus || 0))}</span>
                </div>
              </div>

              <div className="slip-section">
                <h4>POTONGAN</h4>
                <div className="slip-row">
                  <span>PPh21 (Pajak)</span>
                  <span style={{ color: '#ef4444' }}>- {formatCurrency(selectedSlip.pph21)}</span>
                </div>
                <div className="slip-row">
                  <span>BPJS Kesehatan</span>
                  <span style={{ color: '#ef4444' }}>- {formatCurrency(selectedSlip.bpjs_health)}</span>
                </div>
                <div className="slip-row">
                  <span>BPJS Ketenagakerjaan</span>
                  <span style={{ color: '#ef4444' }}>- {formatCurrency(selectedSlip.bpjs_employment)}</span>
                </div>
                {selectedSlip.total_deduction > (Number(selectedSlip.pph21 || 0) + Number(selectedSlip.bpjs_health || 0) + Number(selectedSlip.bpjs_employment || 0)) && (
                  <div className="slip-row">
                    <span>Potongan Lainnya</span>
                    <span style={{ color: '#ef4444' }}>- {formatCurrency(selectedSlip.total_deduction - (Number(selectedSlip.pph21 || 0) + Number(selectedSlip.bpjs_health || 0) + Number(selectedSlip.bpjs_employment || 0)))}</span>
                  </div>
                )}
                <div className="slip-row slip-row--total">
                  <span>Total Potongan</span>
                  <span style={{ color: '#ef4444' }}>- {formatCurrency(selectedSlip.total_deduction)}</span>
                </div>
              </div>
            </div>

            <div className="digital-slip-footer">
              <div className="thp-box">
                <span className="thp-label">TAKE HOME PAY (GAJI BERSIH)</span>
                <span className="thp-value">{formatCurrency(selectedSlip.take_home_pay || selectedSlip.net_salary)}</span>
              </div>
              
              <div className="slip-actions">
                <Button variant="outline" size="md" onClick={() => window.print()}>
                  <Printer size={16} style={{ marginRight: '8px' }} /> Cetak
                </Button>
                <Button variant="primary" size="md" onClick={() => handleDownloadPdf(String(selectedSlip.id))}>
                  <Download size={16} style={{ marginRight: '8px' }} /> Download PDF
                </Button>
              </div>
            </div>
            
            <p className="slip-disclaimer">
              * Slip gaji ini dihasilkan secara otomatis oleh sistem HRIS dan merupakan dokumen sah perusahaan.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyPayrollPage;

