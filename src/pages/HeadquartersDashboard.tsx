import { useEffect, useState } from "react";
import { api } from "../services/api";

export function HeadquartersDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [sales, setSales] = useState<any>(null);
  useEffect(() => { api.reports().then(setReports); api.sales().then(setSales); }, []);
  return (
    <section className="page">
      <h1>Headquarters Manager Dashboard</h1>
      <p>Read-only access: compare branch performance and view all-branch statistics. Editing is blocked by RBAC.</p>
      {sales && <div className="notice">All branches revenue: £{Number(sales.revenue).toFixed(2)} | Orders: {sales.orderCount}</div>}
      <table><thead><tr><th>Branch</th><th>City</th><th>Orders</th><th>Paid Orders</th><th>Revenue</th></tr></thead><tbody>{reports.map(r => <tr key={r.branchId}><td>{r.branchName}</td><td>{r.city}</td><td>{r.orderCount}</td><td>{r.paidOrders}</td><td>£{Number(r.revenue).toFixed(2)}</td></tr>)}</tbody></table>
    </section>
  );
}
