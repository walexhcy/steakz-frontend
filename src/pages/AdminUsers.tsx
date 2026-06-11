import { FormEvent, useEffect, useState } from "react";
import { api } from "../services/api";

const ALL_ROLES = ['OPEN_AREA', 'HEADQUARTERS_MANAGER', 'BRANCH_MANAGER', 'ADMIN', 'CHEF', 'CASHIER', 'WAITER'];
const GLOBAL_ONLY = ['ADMIN', 'HEADQUARTERS_MANAGER', 'OPEN_AREA'];

type EditState = { name: string; roleName: string; branchId: string };

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "New User", email: "new.user@steakz.test", password: "Password123!", roleName: "WAITER", branchId: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ name: "", roleName: "", branchId: "" });

  const createBranchLocked = GLOBAL_ONLY.includes(form.roleName);
  const editBranchLocked = GLOBAL_ONLY.includes(editState.roleName);

  function load() {
    api.users().then(setUsers);
    api.branches().then(setBranches);
  }
  useEffect(load, []);

  async function submitCreate(e: FormEvent) {
    e.preventDefault();
    try {
      await api.createUser({ ...form, branchId: form.branchId || null });
      setMessage("User created successfully.");
      load();
    } catch (err: any) { setMessage(err.message); }
  }

  function startEdit(u: any) {
    setEditingId(u.id);
    setEditState({ name: u.name, roleName: u.role, branchId: u.branch?.id ?? "" });
    setMessage("");
  }

  async function saveEdit(userId: string) {
    try {
      await api.updateUser(userId, {
        name: editState.name,
        roleName: editState.roleName,
        branchId: editBranchLocked ? null : (editState.branchId || null)
      });
      setMessage("User updated successfully.");
      setEditingId(null);
      load();
    } catch (err: any) { setMessage(err.message); }
  }

  function setEditRole(role: string) {
    setEditState(prev => ({ ...prev, roleName: role, branchId: GLOBAL_ONLY.includes(role) ? "" : prev.branchId }));
  }

  return (
    <section className="page">
      <h1>Manage Users</h1>
      <p>Create users, assign roles and manage branch access.</p>
      {message && <p className="notice">{message}</p>}

      <form className="form inline" onSubmit={submitCreate}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <select value={form.roleName} onChange={e => setForm({ ...form, roleName: e.target.value, branchId: GLOBAL_ONLY.includes(e.target.value) ? "" : form.branchId })}>
          {ALL_ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={form.branchId} disabled={createBranchLocked} onChange={e => setForm({ ...form, branchId: e.target.value })} style={createBranchLocked ? { opacity: 0.4, cursor: "not-allowed" } : undefined}>
          <option value="">{createBranchLocked ? "Global only" : "No branch/global"}</option>
          {!createBranchLocked && branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button type="submit">Create user</button>
      </form>

      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Branch</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map(u => editingId === u.id ? (
            <tr key={u.id}>
              <td><input value={editState.name} onChange={e => setEditState({ ...editState, name: e.target.value })} /></td>
              <td>{u.email}</td>
              <td>
                <select value={editState.roleName} onChange={e => setEditRole(e.target.value)}>
                  {ALL_ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </td>
              <td>
                <select value={editState.branchId} disabled={editBranchLocked} onChange={e => setEditState({ ...editState, branchId: e.target.value })} style={editBranchLocked ? { opacity: 0.4, cursor: "not-allowed" } : undefined}>
                  <option value="">{editBranchLocked ? "Global only" : "No branch/global"}</option>
                  {!editBranchLocked && branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </td>
              <td style={{ display: "flex", gap: "0.4rem" }}>
                <button onClick={() => saveEdit(u.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </td>
            </tr>
          ) : (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.branch?.name ?? "Global"}</td>
              <td><button onClick={() => startEdit(u)}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
