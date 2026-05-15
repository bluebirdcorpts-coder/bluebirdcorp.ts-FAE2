import type {
  OrchestrateRequest,
  OrchestrateResponse,
  Product,
  ProductCreate,
  Task,
} from "./types";

const BASE = "/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Products
export const api = {
  products: {
    list: (offset = 0, limit = 50) =>
      request<Product[]>(`/products?offset=${offset}&limit=${limit}`),
    get: (id: number) => request<Product>(`/products/${id}`),
    create: (data: ProductCreate) =>
      request<Product>("/products", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/products/${id}`, { method: "DELETE" }),
  },

  orchestrate: {
    run: (req: OrchestrateRequest) =>
      request<OrchestrateResponse>("/orchestrate", {
        method: "POST",
        body: JSON.stringify(req),
      }),
    getTask: (id: number) => request<Task>(`/orchestrate/tasks/${id}`),
  },

  health: {
    check: () => request<{ status: string; service: string }>("/health"),
  },
};
