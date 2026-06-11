import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicHome } from "./pages/PublicHome";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminBranches } from "./pages/AdminBranches";
import { HeadquartersDashboard } from "./pages/HeadquartersDashboard";
import { BranchManagerDashboard } from "./pages/BranchManagerDashboard";
import { ChefDashboard } from "./pages/ChefDashboard";
import { CashierDashboard } from "./pages/CashierDashboard";
import { WaiterDashboard } from "./pages/WaiterDashboard";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<PublicHome />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
              <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/branches" element={<AdminBranches />} />
            </Route>
            <Route element={<ProtectedRoute roles={["HEADQUARTERS_MANAGER"]} />}><Route path="/headquarters" element={<HeadquartersDashboard />} /></Route>
            <Route element={<ProtectedRoute roles={["BRANCH_MANAGER"]} />}><Route path="/branch-manager" element={<BranchManagerDashboard />} /></Route>
            <Route element={<ProtectedRoute roles={["CHEF"]} />}><Route path="/chef" element={<ChefDashboard />} /></Route>
            <Route element={<ProtectedRoute roles={["CASHIER"]} />}><Route path="/cashier" element={<CashierDashboard />} /></Route>
            <Route element={<ProtectedRoute roles={["WAITER"]} />}><Route path="/waiter" element={<WaiterDashboard />} /></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
