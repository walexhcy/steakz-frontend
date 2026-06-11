import { useEffect, useState } from "react";
import { api } from "../services/api";

export function PublicHome() {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [menu, setMenu] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => { api.branches().then(setBranches).catch(e => setError(e.message)); }, []);
  useEffect(() => {
    api.menu(selectedBranch || undefined).then(setMenu).catch(e => setError(e.message));
    api.promotions(selectedBranch || undefined).then(setPromotions).catch(e => setError(e.message));
  }, [selectedBranch]);

  return (
    <section className="page hero">
      <h1>Open Area</h1>
      <p>Public users can view branch details, menu items and promotions without accessing internal data.</p>
      {error && <p className="error">{error}</p>}
      <label>Choose branch</label>
      <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
        <option value="">All branches</option>
        {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
      </select>
      <h2>Branches</h2>
      <div className="grid">{branches.map(b => <div className="card" key={b.id}><h3>{b.name}</h3><p>{b.city}</p><small>{b.address}</small></div>)}</div>
      <h2>Promotions</h2>
      <div className="grid">{promotions.map(p => <div className="card" key={p.id}><h3>{p.title}</h3><p>{p.description}</p><b>{p.discountPercent}% off</b></div>)}</div>
      <h2>Menu</h2>
      <div className="grid">{menu.map(item => <div className="card" key={item.id}><h3>{item.name}</h3><p>{item.category}</p><b>£{Number(item.price).toFixed(2)}</b></div>)}</div>
    </section>
  );
}
