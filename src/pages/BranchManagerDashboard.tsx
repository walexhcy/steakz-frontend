import { useEffect, useState } from "react";
import { api } from "../services/api";

export function BranchManagerDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [sales, setSales] = useState<any>(null);
  const [message, setMessage] = useState("");
  const load = () => { api.orders().then(setOrders); api.sales().then(setSales); };
  useEffect(load, []);
  async function update(id: string, status: string) {
    try { await api.updateOrderStatus(id, status); setMessage("Order updated"); load(); } catch (e: any) { setMessage(e.message); }
  }
  return (
    <section className="page">
      <h1>Branch Manager Dashboard</h1>
      <p>Branch managers can see only their own branch orders, sales and operational data.</p>
      {message && <p className="notice">{message}</p>}
      {sales && <div className="notice">Branch revenue: £{Number(sales.revenue).toFixed(2)} | Orders: {sales.orderCount}</div>}
      <table><thead><tr><th>Order</th><th>Status</th><th>Total</th><th>Action</th></tr></thead><tbody>{orders.map(o => <tr key={o.id}><td>{o.orderNumber}</td><td>{o.status}</td><td>£{Number(o.totalAmount).toFixed(2)}</td><td><button onClick={() => update(o.id, 'SERVED')}>Mark served</button></td></tr>)}</tbody></table>
    </section>
  );
}
