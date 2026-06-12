import { useEffect, useState } from "react";
import { api } from "../services/api";

export function HeadquartersDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [sales, setSales] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => { api.reports().then(setReports); api.sales().then(setSales); }, []);

  async function downloadReport() {
    setDownloading(true);
    setMessage("");
    try {
      const blob = await api.reportPdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `all-branches-orders-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) { setMessage(e.message); }
    finally { setDownloading(false); }
  }

  const topBranch = reports[0];

  return (
    <section className="page">
      <h1>Headquarters Manager Dashboard</h1>
      <p>Read-only access across all branches. Reports cover the full network.</p>

      {message && <p className="notice">{message}</p>}

      {/* ── Global summary cards ── */}
      {sales && (
        <div className="grid" style={{ marginBottom: "24px" }}>
          <div className="card">
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Global Revenue</p>
            <h2 style={{ margin: "4px 0 0" }}>£{Number(sales.revenue).toFixed(2)}</h2>
          </div>
          <div className="card">
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Total Orders</p>
            <h2 style={{ margin: "4px 0 0" }}>{sales.orderCount}</h2>
          </div>
          <div className="card">
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Avg Order Value</p>
            <h2 style={{ margin: "4px 0 0" }}>£{Number(sales.averageOrderValue).toFixed(2)}</h2>
          </div>
          <div className="card">
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Active Branches</p>
            <h2 style={{ margin: "4px 0 0" }}>{reports.length}</h2>
          </div>
          {topBranch && (
            <div className="card">
              <p style={{ margin: 0, fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Top Branch</p>
              <h2 style={{ margin: "4px 0 0", fontSize: 18 }}>{topBranch.branchName}</h2>
              <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>£{Number(topBranch.revenue).toFixed(2)}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Report download ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h2 style={{ margin: 0 }}>Branch Performance</h2>
        <button onClick={downloadReport} disabled={downloading} style={{ background: "#16a34a" }}>
          {downloading ? "Generating…" : "⬇ Download Report (PDF)"}
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Branch</th>
            <th>City</th>
            <th>Total Orders</th>
            <th>Paid Orders</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.branchId}>
              <td><strong>{r.branchName}</strong></td>
              <td>{r.city}</td>
              <td>{r.orderCount}</td>
              <td>{r.paidOrders}</td>
              <td>£{Number(r.revenue).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
