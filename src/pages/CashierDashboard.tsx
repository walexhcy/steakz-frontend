import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function CashierDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);

  const load = () => { api.orders().then(setOrders); api.receipts().then(setReceipts); };
  useEffect(load, []);

  async function confirmPayment(orderId: string) {
    try {
      await api.updateOrderStatus(orderId, "PAID");
      setMessage("Payment confirmed — order marked as PAID.");
      setConfirming(null);
      load();
    } catch (e: any) { setMessage(e.message); }
  }

  async function generateReceipt(orderId: string) {
    try {
      await api.createReceipt(orderId);
      setMessage("Receipt generated.");
      load();
    } catch (e: any) { setMessage(e.message); }
  }

  async function openPdf(receiptId: string) {
    try {
      const blob = await api.receiptPdf(receiptId);
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (e: any) { setMessage(e.message); }
  }

  function receiptAction(o: any) {
    if (o.status === "PENDING" || o.status === "READY") {
      if (confirming === o.id) {
        return (
          <span style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem" }}>Confirm cash received?</span>
            <button onClick={() => confirmPayment(o.id)}>Yes, paid</button>
            <button onClick={() => setConfirming(null)}>Cancel</button>
          </span>
        );
      }
      return <button onClick={() => setConfirming(o.id)}>Confirm Payment</button>;
    }

    if (o.status === "PAID") {
      if (o.receipt) return <span>Already generated</span>;
      return <button onClick={() => generateReceipt(o.id)}>Generate</button>;
    }

    return <span>—</span>;
  }

  return (
    <section className="page">
      <h1>Cashier Dashboard</h1>
      <p>Branch: <strong>{user?.branch?.name ?? "—"}</strong> — showing only orders and receipts for your branch.</p>
      {message && <p className="notice">{message}</p>}

      <h2>Orders</h2>
      <table>
        <thead><tr><th>Order</th><th>Status</th><th>Total</th><th>Action</th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.orderNumber}</td>
              <td>{o.status}</td>
              <td>£{Number(o.totalAmount).toFixed(2)}</td>
              <td>{receiptAction(o)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Receipts</h2>
      <table>
        <thead><tr><th>Receipt</th><th>Order</th><th>Total</th><th>PDF</th></tr></thead>
        <tbody>
          {receipts.map(r => (
            <tr key={r.id}>
              <td>{r.receiptNumber}</td>
              <td>{r.order.orderNumber}</td>
              <td>£{Number(r.totalAmount).toFixed(2)}</td>
              <td><button onClick={() => openPdf(r.id)}>Open PDF</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
