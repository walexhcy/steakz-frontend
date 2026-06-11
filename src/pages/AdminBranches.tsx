import { FormEvent, useEffect, useState } from "react";
import { api } from "../services/api";

type BranchEditState = { name: string; city: string; address: string; phone: string; openingHours: string; isActive: boolean };
const EMPTY_FORM = { name: "", city: "", address: "", phone: "", openingHours: "12:00 PM - 11:00 PM" };

export function AdminBranches() {
  const [branches, setBranches] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<BranchEditState>({ name: "", city: "", address: "", phone: "", openingHours: "", isActive: true });

  function load() { api.branches().then(setBranches); }
  useEffect(load, []);

  async function submitCreate(e: FormEvent) {
    e.preventDefault();
    try {
      await api.createBranch(form);
      setMessage("Branch created successfully.");
      setForm(EMPTY_FORM);
      load();
    } catch (err: any) { setMessage(err.message); }
  }

  function startEdit(b: any) {
    setEditingId(b.id);
    setEditState({ name: b.name, city: b.city, address: b.address, phone: b.phone, openingHours: b.openingHours, isActive: b.isActive });
    setMessage("");
  }

  async function saveEdit(branchId: string) {
    try {
      await api.updateBranch(branchId, editState);
      setMessage("Branch updated successfully.");
      setEditingId(null);
      load();
    } catch (err: any) { setMessage(err.message); }
  }

  return (
    <section className="page">
      <h1>Manage Branches</h1>
      <p>Create and update Steakz restaurant branches.</p>
      {message && <p className="notice">{message}</p>}

      <form className="form inline" onSubmit={submitCreate}>
        <input required placeholder="Name e.g. Steakz Edinburgh" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input required placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
        <input required placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
        <input required placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <input required placeholder="Opening hours" value={form.openingHours} onChange={e => setForm({ ...form, openingHours: e.target.value })} />
        <button type="submit">Create branch</button>
      </form>

      <table>
        <thead><tr><th>Name</th><th>City</th><th>Address</th><th>Phone</th><th>Hours</th><th>Active</th><th>Actions</th></tr></thead>
        <tbody>
          {branches.map(b => editingId === b.id ? (
            <tr key={b.id}>
              <td><input value={editState.name} onChange={e => setEditState({ ...editState, name: e.target.value })} /></td>
              <td><input value={editState.city} onChange={e => setEditState({ ...editState, city: e.target.value })} /></td>
              <td><input value={editState.address} onChange={e => setEditState({ ...editState, address: e.target.value })} /></td>
              <td><input value={editState.phone} onChange={e => setEditState({ ...editState, phone: e.target.value })} /></td>
              <td><input value={editState.openingHours} onChange={e => setEditState({ ...editState, openingHours: e.target.value })} /></td>
              <td>
                <select value={editState.isActive ? "true" : "false"} onChange={e => setEditState({ ...editState, isActive: e.target.value === "true" })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </td>
              <td style={{ display: "flex", gap: "0.4rem" }}>
                <button onClick={() => saveEdit(b.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
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
              <td><button onClick={() => startEdit(b)}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
