import { FormEvent, useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

type OrderItem = { menuItemId: string; quantity: number };

export function WaiterDashboard() {
  const { user } = useAuth();
  const [tables, setTables] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<{ customerName: string; tableId: string; items: OrderItem[] }>({
    customerName: "",
    tableId: "",
    items: []
  });

  function load() {
    api.tables().then(setTables);
    api.orders().then(setOrders);
    if (user?.branchId) api.menu(user.branchId).then(setMenuItems);
  }

  useEffect(load, [user?.branchId]);

  function setItemQty(menuItemId: string, quantity: number) {
    setForm(prev => {
      const existing = prev.items.find(i => i.menuItemId === menuItemId);
      if (quantity <= 0) return { ...prev, items: prev.items.filter(i => i.menuItemId !== menuItemId) };
      if (existing) return { ...prev, items: prev.items.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i) };
      return { ...prev, items: [...prev.items, { menuItemId, quantity }] };
    });
  }

  function getQty(menuItemId: string) {
    return form.items.find(i => i.menuItemId === menuItemId)?.quantity ?? 0;
  }

  async function markServed(orderId: string) {
    try {
      await api.updateOrderStatus(orderId, "SERVED");
      setMessage("Order marked as served.");
      load();
    } catch (err: any) { setMessage(err.message); }
  }

  async function submitOrder(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    if (form.items.length === 0) { setMessage("Add at least one item to the order."); return; }
    try {
      await api.createOrder({
        customer: form.customerName ? { name: form.customerName } : undefined,
        tableId: form.tableId || undefined,
        items: form.items
      });
      setMessage("Order placed successfully.");
      setForm({ customerName: "", tableId: "", items: [] });
      load();
    } catch (err: any) { setMessage(err.message); }
  }

  const byCategory = menuItems.reduce<Record<string, any[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  return (
    <section className="page">
      <h1>Waiter Dashboard</h1>
      <p>Branch: <strong>{user?.branch?.name ?? "—"}</strong> — you can only view and place orders for your own branch.</p>

      {message && <p className="notice">{message}</p>}

      <h2>Place New Order</h2>
      <form className="form" onSubmit={submitOrder}>
        <input
          placeholder="Customer name (optional)"
          value={form.customerName}
          onChange={e => setForm({ ...form, customerName: e.target.value })}
        />
        <select value={form.tableId} onChange={e => setForm({ ...form, tableId: e.target.value })}>
          <option value="">No table / walk-in</option>
          {tables.map(t => (
            <option key={t.id} value={t.id}>
              Table {t.tableNumber} (cap {t.capacity})
            </option>
          ))}
        </select>

        <div>
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat}>
              <h3>{cat}</h3>
              <div className="grid">
                {items.map(item => (
                  <div className="card" key={item.id}>
                    <strong>{item.name}</strong>
                    <p>£{Number(item.price).toFixed(2)}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                      <button type="button" onClick={() => setItemQty(item.id, getQty(item.id) - 1)}>−</button>
                      <span>{getQty(item.id)}</span>
                      <button type="button" onClick={() => setItemQty(item.id, getQty(item.id) + 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {form.items.length > 0 && (
          <div>
            <strong>Order summary:</strong>
            <ul>
              {form.items.map(i => {
                const mi = menuItems.find(m => m.id === i.menuItemId);
                return <li key={i.menuItemId}>{mi?.name} × {i.quantity} = £{(Number(mi?.price) * i.quantity).toFixed(2)}</li>;
              })}
            </ul>
          </div>
        )}

        <button type="submit">Place order</button>
      </form>

      <h2>Branch Orders</h2>
      <table>
        <thead>
          <tr><th>Order #</th><th>Table</th><th>Customer</th><th>Status</th><th>Total</th><th>Action</th></tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.orderNumber}</td>
              <td>{o.table?.tableNumber ?? "—"}</td>
              <td>{o.customer?.name ?? "—"}</td>
              <td>{o.status}</td>
              <td>£{Number(o.totalAmount).toFixed(2)}</td>
              <td>
                {o.status === "READY"
                  ? <button onClick={() => markServed(o.id)}>Mark as Served</button>
                  : <span>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
