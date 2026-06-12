import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function BranchManagerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [sales, setSales] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState(false);

  const load = () => { api.orders().then(setOrders); api.sales().then(setSales); };
  useEffect(load, []);

  async function update(id: string, status: string) {
    try { await api.updateOrderStatus(id, status); setMessage("Order updated."); load(); }
    catch (e: any) { setMessage(e.message); }
  }

  async function downloadReport() {
    setDownloading(true);
    setMessage("");
    try {
      const blob = await api.reportPdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `branch-orders-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) { setMessage(e.message); }
    finally { setDownloading(false); }
  }

  const paidCount = orders.filter(o => o.status === "PAID").length;
  const pendingCount = orders.filter(o => !["PAID", "SERVED"].includes(o.status)).length;

  return (
    <section className="page">
      <h1>Branch Manager Dashboard</h1>
      <p>Branch: <strong>{user?.branch?.name ?? "—"}</strong> — showing only your branch orders and data.</p>

      {message && <p className="notice">{message}</p>}

      {/* ── Summary cards ── */}
      {sales && (
        <div className="grid" style={{ marginBottom: "24px" }}>
          <div className="card">
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Total Revenue</p>
            <h2 style={{ margin: "4px 0 0" }}>£{Number(sales.revenue).toFixed(2)}</h2>
          </div>
          <div className="card">
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Total Orders</p>
            <h2 style={{ margin: "4px 0 0" }}>{sales.orderCount}</h2>
          </div>
          <div className="card">
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Paid Orders</p>
            <h2 style={{ margin: "4px 0 0" }}>{paidCount}</h2>
          </div>
          <div className="card">
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Avg Order Value</p>
            <h2 style={{ margin: "4px 0 0" }}>£{Number(sales.averageOrderValue).toFixed(2)}</h2>
          </div>
          <div className="card">
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Active Orders</p>
            <h2 style={{ margin: "4px 0 0" }}>{pendingCount}</h2>
          </div>
        </div>
      )}

      {/* ── Report download ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h2 style={{ margin: 0 }}>Branch Orders</h2>
        <button onClick={downloadReport} disabled={downloading} style={{ background: "#16a34a" }}>
          {downloading ? "Generating…" : "⬇ Download Report (PDF)"}
        </button>
      </div>

      <table>
        <thead>
          <tr><th>Order #</th><th>Customer</th><th>Status</th><th>Total</th><th>Action</th></tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.orderNumber}</td>
              <td>{o.customer?.name ?? "Walk-in"}</td>
              <td>{o.status}</td>
              <td>£{Number(o.totalAmount).toFixed(2)}</td>
              <td>
                {o.status === "READY"
                  ? <button onClick={() => update(o.id, "SERVED")}>Mark Served</button>
                  : <span style={{ color: "#9ca3af" }}>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
