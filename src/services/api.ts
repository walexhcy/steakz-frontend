const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export type RoleName =
  | "OPEN_AREA"
  | "HEADQUARTERS_MANAGER"
  | "BRANCH_MANAGER"
  | "ADMIN"
  | "CHEF"
  | "CASHIER"
  | "WAITER";

export type User = {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  branchId?: string | null;
  branch?: any;
};

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("steakz_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined)
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    if (contentType.includes("application/json")) {
      const error = await response.json();
      message = error.message || message;
    }
    throw new Error(message);
  }
  if (contentType.includes("application/pdf")) return response.blob() as T;
  return response.json();
}

export const api = {
  login: (email: string, password: string) => apiFetch<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => apiFetch<User>("/auth/me"),
  branches: () => apiFetch<any[]>("/branches"),
  createBranch: (data: { name: string; city: string; address: string; phone: string; openingHours: string }) =>
    apiFetch<any>("/branches", { method: "POST", body: JSON.stringify(data) }),
  updateBranch: (id: string, data: { name?: string; city?: string; address?: string; phone?: string; openingHours?: string; isActive?: boolean }) =>
    apiFetch<any>(`/branches/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  menu: (branchId?: string) => apiFetch<any[]>(branchId ? `/menu?branchId=${branchId}` : "/menu"),
  promotions: (branchId?: string) => apiFetch<any[]>(branchId ? `/promotions?branchId=${branchId}` : "/promotions"),
  stats: () => apiFetch<any>("/dashboard/stats"),
  users: () => apiFetch<any[]>("/users"),
  createUser: (data: any) => apiFetch<any>("/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: string, data: { name?: string; roleName?: string; branchId?: string | null }) =>
    apiFetch<any>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  orders: () => apiFetch<any[]>("/orders"),
  updateOrderStatus: (id: string, status: string) => apiFetch<any>(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  reports: () => apiFetch<any[]>("/reports/branch-performance"),
  sales: () => apiFetch<any>("/reports/sales"),
  tables: () => apiFetch<any[]>("/tables"),
  createOrder: (data: { customer?: { name: string }; tableId?: string; items: { menuItemId: string; quantity: number }[] }) =>
    apiFetch<any>("/orders", { method: "POST", body: JSON.stringify(data) }),
  receipts: () => apiFetch<any[]>("/receipts"),
  createReceipt: (orderId: string) => apiFetch<any>("/receipts", { method: "POST", body: JSON.stringify({ orderId, paymentMethod: "CARD" }) }),
  receiptPdf: (receiptId: string) => apiFetch<Blob>(`/receipts/${receiptId}/pdf`)
};
