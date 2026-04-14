import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { BarChart3, CheckCircle2, Receipt, Wallet } from "lucide-react";
import { getMyPayroll } from "@/features/ess/api/ess.service";
import type { GenericApiItem } from "@/features/ess/types/ess.types";
import "./EssPages.css";

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: GenericApiItem[]) => {
  if (items.length === 0) {
    return ["id", "period", "gross_salary", "net_salary", "status"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "period", "gross_salary", "net_salary", "status"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const MyPayrollPage = () => {
  const [items, setItems] = useState<GenericApiItem[]>([]);
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call my payroll API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);
  const summaryCards = useMemo(() => {
    const paidCount = items.filter((item) => String(item.status ?? "").toLowerCase() === "paid").length;
    const totalNetSalary = items.reduce((sum, item) => sum + (Number(item.net_salary) || 0), 0);
    const uniquePeriods = new Set(items.map((item) => String(item.period ?? "")).filter(Boolean));

    return [
      {
        label: "Total Payroll",
        subtitle: "Semua slip payroll pribadi",
        value: String(items.length),
        change: "Data payroll aktif",
        tone: "blue" as const,
        icon: BarChart3,
      },
      {
        label: "Paid",
        subtitle: "Payroll sudah dibayarkan",
        value: String(paidCount),
        change: "Status selesai",
        tone: "green" as const,
        icon: CheckCircle2,
      },
      {
        label: "Periode Tercatat",
        subtitle: "Jumlah periode payroll",
        value: String(uniquePeriods.size),
        change: "Riwayat periode aktif",
        tone: "orange" as const,
        icon: Receipt,
      },
      {
        label: "Total Gaji Bersih",
        subtitle: "Akumulasi net salary",
        value: `Rp ${totalNetSalary.toLocaleString("id-ID")}`,
        change: statusMessage,
        tone: "red" as const,
        icon: Wallet,
      },
    ];
  }, [items, statusMessage]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const loadPayroll = async () => {
    setLoading(true);
    setStatusMessage("Memuat data payroll saya...");
    setResponseText("");

    try {
      const result = await getMyPayroll();
      setItems(result.items);
      formatResponse(result.raw);
      setStatusMessage("Data payroll saya berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat payroll saya.";
      formatResponse(message);
      setStatusMessage("Gagal memuat payroll saya.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ess-page">
      <div className="ess-header">
        <div className="ess-header-copy">
          <p className="ess-badge">ESS Payroll</p>
          <h1>My Payroll</h1>
          <p>Lihat riwayat payroll pribadi dengan tampilan yang rapi, konsisten, dan mudah dipindai.</p>
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
              <div className="ess-summary-change">{card.change}</div>
            </Card>
          );
        })}
      </div>

      <Card className="ess-card" glass>
        <h2>Tabel Payroll</h2>
        <div className="ess-table-wrap">
          <table className="ess-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>
                    {column === "id" && "ID"}
                    {column === "period" && "Periode"}
                    {column === "gross_salary" && "Gaji Kotor"}
                    {column === "net_salary" && "Gaji Bersih"}
                    {column === "status" && "Status"}
                    {!['id', 'period', 'gross_salary', 'net_salary', 'status'].includes(column) && column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={String(item.id ?? index)}>
                    {columns.map((column) => (
                      <td key={`${String(item.id ?? index)}-${column}`}>{asDisplay(item[column])}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>Tidak ada data payroll.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="ess-card" glass>
        <h2>Raw Response</h2>
        <pre className="ess-response">{responseText || "Response API akan tampil di sini."}</pre>
        <p className="ess-status">{statusMessage}</p>
      </Card>
    </div>
  );
};

export default MyPayrollPage;
