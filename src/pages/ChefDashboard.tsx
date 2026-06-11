import { useEffect, useState } from "react";
import { api } from "../services/api";

export function ChefDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");
      const data = await api.orders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Unable to load chef orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function markReady(id: string) {
    try {
      await api.updateOrderStatus(id, "READY");
      await loadOrders();
    } catch (err: any) {
      setError(err.message || "Unable to update order status");
    }
  }

  return (
    <section className="page">
      <h1>Chef Dashboard</h1>
      <p>Chef can view customer orders for their branch and mark food as ready.</p>

      {loading && <p>Loading chef orders...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && orders.length === 0 && (
        <p>No orders found for this chef branch.</p>
      )}

      {!loading && orders.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber || "N/A"}</td>
                <td>{order.customer?.name || "Walk-in Customer"}</td>
                <td>
                  {order.orderItems && order.orderItems.length > 0
                    ? order.orderItems
                        .map(
                          (item: any) =>
                            `${item.menuItem?.name || "Menu Item"} x${item.quantity}`
                        )
                        .join(", ")
                    : "No items"}
                </td>
                <td>{order.status}</td>
                <td>
                  <button onClick={() => markReady(order.id)}>
                    Mark ready
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}