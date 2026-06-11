import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api, User } from "../services/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("steakz_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api.me().then(setUser).catch(() => localStorage.removeItem("steakz_token")).finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const result = await api.login(email, password);
    localStorage.setItem("steakz_token", result.token);
    setUser(result.user);
  }

  function logout() {
    localStorage.removeItem("steakz_token");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
