import { useState, useRef, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function go(path: string) {
    setOpen(false);
    navigate(path);
  }

  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <div className="nav-dropdown" ref={ref}>
      <button
        className={`nav-dropdown-trigger${isAdminPath ? " active" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
        Admin ▾
      </button>
      {open && (
        <div className="nav-dropdown-menu">
          <button onClick={() => go("/admin/users")}>Users</button>
          <button onClick={() => go("/admin/branches")}>Branches</button>
        </div>
      )}
    </div>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <>
      <nav className="nav">
        <Link to="/" className="brand">Steakz MIS</Link>
        <NavLink to="/">Open Area</NavLink>
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
        {user?.role === "ADMIN" && <AdminDropdown />}
        {user?.role === "HEADQUARTERS_MANAGER" && <NavLink to="/headquarters">HQ Reports</NavLink>}
        {user?.role === "BRANCH_MANAGER" && <NavLink to="/branch-manager">Branch</NavLink>}
        {user?.role === "CHEF" && <NavLink to="/chef">Chef</NavLink>}
        {user?.role === "CASHIER" && <NavLink to="/cashier">Cashier</NavLink>}
        {user?.role === "WAITER" && <NavLink to="/waiter">Waiter</NavLink>}
        {!user ? <NavLink to="/login">Login</NavLink> : <button onClick={logout}>Logout</button>}
      </nav>
      <main className="container"><Outlet /></main>
    </>
  );
}
