import { FormEvent, useEffect, useState } from "react";
import { api } from "../services/api";

const ALL_ROLES = ['OPEN_AREA', 'HEADQUARTERS_MANAGER', 'BRANCH_MANAGER', 'ADMIN', 'CHEF', 'CASHIER', 'WAITER'];
const GLOBAL_ONLY = ['ADMIN', 'HEADQUARTERS_MANAGER', 'OPEN_AREA'];

type UserEditState = { name: string; roleName: string; branchId: string };
type BranchEditState = { name: string; city: string; address: string; phone: string; openingHours: string; isActive: boolean };

const EMPTY_BRANCH_FORM = { name: "", city: "", address: "", phone: "", openingHours: "12:00 PM - 11:00 PM" };

export function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  // User form
  const [userForm, setUserForm] = useState({ name: "New User", email: "new.user@steakz.test", password: "Password123!", roleName: "WAITER", branchId: "" });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userEdit, setUserEdit] = useState<UserEditState>({ name: "", roleName: "", branchId: "" });

  // Branch form
  const [branchForm, setBranchForm] = useState(EMPTY_BRANCH_FORM);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchEdit, setBranchEdit] = useState<BranchEditState>({ name: "", city: "", address: "", phone: "", openingHours: "", isActive: true });

  const createUserBranchLocked = GLOBAL_ONLY.includes(userForm.roleName);
  const editUserBranchLocked = GLOBAL_ONLY.includes(userEdit.roleName);

  function load() {
    api.users().then(setUsers);
    api.branches().then(setBranches);
  }
  useEffect(load, []);

  // ── User actions ────────────────────────────────────────────────
  async function submitCreateUser(e: FormEvent) {
    e.preventDefault();
    try {
      await api.createUser({ ...userForm, branchId: userForm.branchId || null });
      setMessage("User created successfully.");
      load();
    } catch (err: any) { setMessage(err.message); }
  }

  function startEditUser(u: any) {
    setEditingUserId(u.id);
    setUserEdit({ name: u.name, roleName: u.role, branchId: u.branch?.id ?? "" });
    setEditingBranchId(null);
    setMessage("");
  }

  async function saveEditUser(userId: string) {
    try {
      await api.updateUser(userId, {
        name: userEdit.name,
        roleName: userEdit.roleName,
        branchId: editUserBranchLocked ? null : (userEdit.branchId || null)
      });
      setMessage("User updated successfully.");
      setEditingUserId(null);
      load();
    } catch (err: any) { setMessage(err.message); }
  }

  function setEditUserRole(role: string) {
    setUserEdit(prev => ({ ...prev, roleName: role, branchId: GLOBAL_ONLY.includes(role) ? "" : prev.branchId }));
  }

  // ── Branch actions ───────────────────────────────────────────────
  async function submitCreateBranch(e: FormEvent) {
    e.preventDefault();
    try {
      await api.createBranch(branchForm);
      setMessage("Branch created successfully.");
      setBranchForm(EMPTY_BRANCH_FORM);
      load();
    } catch (err: any) { setMessage(err.message); }
  }

  function startEditBranch(b: any) {
    setEditingBranchId(b.id);
    setBranchEdit({ name: b.name, city: b.city, address: b.address, phone: b.phone, openingHours: b.openingHours, isActive: b.isActive });
    setEditingUserId(null);
    setMessage("");
  }

  async function saveEditBranch(branchId: string) {
    try {
      await api.updateBranch(branchId, branchEdit);
      setMessage("Branch updated successfully.");
      setEditingBranchId(null);
      load();
    } catch (err: any) { setMessage(err.message); }
  }

  return (
    <section className="page">
      <h1>Admin Dashboard</h1>
      <p>Admin can create users, assign roles, manage branch access and manage branches.</p>
      {message && <p className="notice">{message}</p>}

      {/* ── Users ── */}
      <h2>Users</h2>
      <form className="form inline" onSubmit={submitCreateUser}>
        <input placeholder="Name" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
        <input placeholder="Email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
        <select value={userForm.roleName} onChange={e => setUserForm({ ...userForm, roleName: e.target.value, branchId: GLOBAL_ONLY.includes(e.target.value) ? "" : userForm.branchId })}>
          {ALL_ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={userForm.branchId} disabled={createUserBranchLocked} onChange={e => setUserForm({ ...userForm, branchId: e.target.value })} style={createUserBranchLocked ? { opacity: 0.4, cursor: "not-allowed" } : undefined}>
          <option value="">{createUserBranchLocked ? "Global only" : "No branch/global"}</option>
          {!createUserBranchLocked && branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button type="submit">Create user</button>
      </form>

      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Branch</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map(u => editingUserId === u.id ? (
            <tr key={u.id}>
              <td><input value={userEdit.name} onChange={e => setUserEdit({ ...userEdit, name: e.target.value })} /></td>
              <td>{u.email}</td>
              <td>
                <select value={userEdit.roleName} onChange={e => setEditUserRole(e.target.value)}>
                  {ALL_ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </td>
              <td>
                <select value={userEdit.branchId} disabled={editUserBranchLocked} onChange={e => setUserEdit({ ...userEdit, branchId: e.target.value })} style={editUserBranchLocked ? { opacity: 0.4, cursor: "not-allowed" } : undefined}>
                  <option value="">{editUserBranchLocked ? "Global only" : "No branch/global"}</option>
                  {!editUserBranchLocked && branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </td>
              <td style={{ display: "flex", gap: "0.4rem" }}>
                <button onClick={() => saveEditUser(u.id)}>Save</button>
                <button onClick={() => setEditingUserId(null)}>Cancel</button>
              </td>
            </tr>
          ) : (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.branch?.name ?? "Global"}</td>
              <td><button onClick={() => startEditUser(u)}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Branches ── */}
      <h2 style={{ marginTop: "2rem" }}>Branches</h2>
      <form className="form inline" onSubmit={submitCreateBranch}>
        <input required placeholder="Name e.g. Steakz Edinburgh" value={branchForm.name} onChange={e => setBranchForm({ ...branchForm, name: e.target.value })} />
        <input required placeholder="City" value={branchForm.city} onChange={e => setBranchForm({ ...branchForm, city: e.target.value })} />
        <input required placeholder="Address" value={branchForm.address} onChange={e => setBranchForm({ ...branchForm, address: e.target.value })} />
        <input required placeholder="Phone" value={branchForm.phone} onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })} />
        <input required placeholder="Opening hours e.g. 12:00 PM - 11:00 PM" value={branchForm.openingHours} onChange={e => setBranchForm({ ...branchForm, openingHours: e.target.value })} />
        <button type="submit">Create branch</button>
      </form>

      <table>
        <thead><tr><th>Name</th><th>City</th><th>Address</th><th>Phone</th><th>Hours</th><th>Active</th><th>Actions</th></tr></thead>
        <tbody>
          {branches.map(b => editingBranchId === b.id ? (
            <tr key={b.id}>
              <td><input value={branchEdit.name} onChange={e => setBranchEdit({ ...branchEdit, name: e.target.value })} /></td>
              <td><input value={branchEdit.city} onChange={e => setBranchEdit({ ...branchEdit, city: e.target.value })} /></td>
              <td><input value={branchEdit.address} onChange={e => setBranchEdit({ ...branchEdit, address: e.target.value })} /></td>
              <td><input value={branchEdit.phone} onChange={e => setBranchEdit({ ...branchEdit, phone: e.target.value })} /></td>
              <td><input value={branchEdit.openingHours} onChange={e => setBranchEdit({ ...branchEdit, openingHours: e.target.value })} /></td>
              <td>
                <select value={branchEdit.isActive ? "true" : "false"} onChange={e => setBranchEdit({ ...branchEdit, isActive: e.target.value === "true" })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </td>
              <td style={{ display: "flex", gap: "0.4rem" }}>
                <button onClick={() => saveEditBranch(b.id)}>Save</button>
                <button onClick={() => setEditingBranchId(null)}>Cancel</button>
              </td>
            </tr>
          ) : (
            <tr key={b.id}>
              <td>{b.name}</td>
              <td>{b.city}</td>
              <td>{b.address}</td>
              <td>{b.phone}</td>
              <td>{b.openingHours}</td>
              <td>{b.isActive ? "✓" : "✗"}</td>
              <td><button onClick={() => startEditBranch(b)}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
