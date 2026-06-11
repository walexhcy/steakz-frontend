import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const accounts = [
  ["Admin", "admin@steakz.test"],
  ["Headquarters Manager", "hm@steakz.test"],
  ["Branch Manager", "bm.london@steakz.test"],
  ["Chef", "chef.london@steakz.test"],
  ["Cashier", "cashier.london@steakz.test"],
  ["Waiter", "waiter.london@steakz.test"],
  ["Open Area", "public@steakz.test"]
];

export function Login() {
  const [email, setEmail] = useState("admin@steakz.test");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <section className="page narrow">
      <h1>Login</h1>
      <p>Use any seed account below. Password for all accounts is <b>Password123!</b></p>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit} className="form">
        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      <h2>Seed accounts</h2>
      <div className="grid">{accounts.map(([role, mail]) => <button key={mail} className="card account" onClick={() => setEmail(mail)}><b>{role}</b><span>{mail}</span></button>)}</div>
    </section>
  );
}
