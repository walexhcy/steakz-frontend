import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { CardGrid } from "../components/CardGrid";

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => { api.stats().then(setStats).catch(e => setError(e.message)); }, []);

  const roleLink: Record<string, string> = {
    ADMIN: "/admin",
    HEADQUARTERS_MANAGER: "/headquarters",
    BRANCH_MANAGER: "/branch-manager",
    CHEF: "/chef",
    CASHIER: "/cashier",
    WAITER: "/waiter",
    OPEN_AREA: "/"
  };

  return (
    <section className="page">
      <h1>{user?.name} Dashboard</h1>
      <p>Role: <b>{user?.role}</b> {user?.branch?.name && <> | Branch: <b>{user.branch.name}</b></>}</p>
      {error && <p className="error">{error}</p>}
      {stats && <CardGrid items={[
        { title: "Total Orders", value: stats.totalOrders },
        { title: "Revenue", value: `£${Number(stats.revenue).toFixed(2)}` },
        { title: "Pending Orders", value: stats.pendingOrders },
        { title: "Ready Orders", value: stats.readyOrders },
        { title: "Tables", value: stats.totalTables },
        { title: "Read-only", value: stats.isReadOnly ? "Yes" : "No" }
      ]} />}
      <Link className="primary" to={roleLink[user?.role || "OPEN_AREA"]}>Open role dashboard</Link>
    </section>
  );
}
