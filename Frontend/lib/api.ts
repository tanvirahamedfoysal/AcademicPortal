// Central API client for the Academic Research Portal backend.
// The backend is untouched — this file only talks to endpoints that
// already exist under /api/v1 on the deployed FastAPI service.

export const API_BASE = "https://academic-portal-16620c77.fastapicloud.dev/api/v1";

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

function getToken(): string | null {
  return localStorage.getItem("arp_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("arp_token", token);
  else localStorage.removeItem("arp_token");
}

type RequestOpts = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  form?: Record<string, string>; // for x-www-form-urlencoded (login)
  auth?: boolean; // attach bearer token, default true
  signal?: AbortSignal;
};

async function request<T = any>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { method = "GET", body, form, auth = true, signal } = opts;
  const headers: Record<string, string> = {};
  let payload: BodyInit | undefined;

  if (form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    payload = new URLSearchParams(form).toString();
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: payload,
    signal,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "detail" in (data as any) && (data as any).detail) ||
      res.statusText ||
      "Request failed";
    throw new ApiError(res.status, typeof message === "string" ? message : JSON.stringify(message), data);
  }

  return data as T;
}

export const api = {
  get: <T = any>(path: string, opts?: Omit<RequestOpts, "method">) => request<T>(path, { ...opts, method: "GET" }),
  post: <T = any>(path: string, body?: unknown, opts?: Omit<RequestOpts, "method" | "body">) =>
    request<T>(path, { ...opts, method: "POST", body }),
  patch: <T = any>(path: string, body?: unknown, opts?: Omit<RequestOpts, "method" | "body">) =>
    request<T>(path, { ...opts, method: "PATCH", body }),
  put: <T = any>(path: string, body?: unknown, opts?: Omit<RequestOpts, "method" | "body">) =>
    request<T>(path, { ...opts, method: "PUT", body }),
  delete: <T = any>(path: string, opts?: Omit<RequestOpts, "method">) => request<T>(path, { ...opts, method: "DELETE" }),
  form: <T = any>(path: string, form: Record<string, string>) => request<T>(path, { method: "POST", form, auth: false }),
};

// ---- Typed endpoint helpers, one per backend router ----

export const AuthAPI = {
  login: (username: string, password: string) => api.form("/auth/login", { username, password }),
  validateToken: () => api.get("/auth/validate-token"),
  validateUsername: (username: string) => api.post("/auth/validate-username", { username }, { auth: false }),
  requestRegisterOtp: (payload: any) => api.post("/auth/register/request-otp", payload, { auth: false }),
  register: (payload: any) => api.post("/auth/register", payload, { auth: false }),
  requestPasswordResetOtp: (payload: any) => api.post("/auth/password-reset/request-otp", payload, { auth: false }),
  resetPassword: (payload: any) => api.patch("/auth/password-reset", payload, { auth: false }),
  validateEmail: (payload: any) => api.post("/auth/validate-email", payload, { auth: false }),
};

export const ProfileAPI = {
  me: () => api.get("/profile/me"),
  meLastUpdate: () => api.get("/profile/me/last-update"),
  updateMe: (payload: any) => api.patch("/profile/me", payload),
  changeUsername: (payload: any) => api.post("/profile/change-username", payload),
  changeEmail: (payload: any) => api.post("/profile/change-email", payload),
};

export const StudentsAPI = {
  listPending: () => api.get("/students/pending"),
  getPending: (uuid: string) => api.get(`/students/pending/${uuid}`),
  deletePending: (uuid: string) => api.delete(`/students/pending/${uuid}`),
  verifyPending: (uuid: string, payload?: any) => api.patch(`/students/pending/${uuid}/verify`, payload),
  list: () => api.get("/students"),
  get: (uuid: string) => api.get(`/students/${uuid}`),
  update: (uuid: string, payload: any) => api.patch(`/students/${uuid}`, payload),
  remove: (uuid: string) => api.delete(`/students/${uuid}`),
};

export const ModeratorsAPI = {
  list: () => api.get("/moderators"),
  get: (uuid: string) => api.get(`/moderators/${uuid}`),
  create: (uuid: string, payload: any) => api.post(`/moderators/${uuid}`, payload),
  remove: (uuid: string) => api.delete(`/moderators/${uuid}`),
};

export const CollaboratorsAPI = {
  list: () => api.get("/collaborators", { auth: false }),
  create: (payload: any) => api.post("/collaborators", payload),
  update: (uuid: string, payload: any) => api.patch(`/collaborators/${uuid}`, payload),
  remove: (uuid: string) => api.delete(`/collaborators/${uuid}`),
};

export const ArticlesAPI = {
  listPublic: (params?: string) => api.get(`/articles/public${params ?? ""}`, { auth: false }),
  getPublic: (id: string) => api.get(`/articles/public/${id}`, { auth: false }),
  list: (params?: string) => api.get(`/articles${params ?? ""}`),
  get: (id: string) => api.get(`/articles/${id}`),
  create: (payload: any) => api.post("/articles", payload),
  update: (id: string, payload: any) => api.patch(`/articles/${id}`, payload),
  updateStatus: (id: string, payload: any) => api.patch(`/articles/${id}/status`, payload),
  remove: (id: string) => api.delete(`/articles/${id}`),
  lastUpdate: (id: string) => api.get(`/articles/${id}/last-update`, { auth: false }),
};

export const PortfolioAPI = {
  get: () => api.get("/portfolio", { auth: false }),
  replace: (payload: any) => api.put("/portfolio", payload),
};

export const ContactAPI = {
  meta: () => api.get("/contact/meta", { auth: false }),
  submit: (payload: any) => api.post("/contact", payload, { auth: false }),
  list: () => api.get("/contact"),
  get: (id: string) => api.get(`/contact/${id}`),
  remove: (id: string) => api.delete(`/contact/${id}`),
};

export const ImagesAPI = {
  upload: async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/images`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    if (!res.ok) throw new ApiError(res.status, "Image upload failed");
    return res.json();
  },
  remove: (payload: any) => api.delete("/images", { body: payload } as any),
};

export const RepositoryAPI = {
  list: () => api.get("/repository/documents"),
  get: (id: string) => api.get(`/repository/documents/${id}`),
  create: (payload: any) => api.post("/repository/documents", payload),
  update: (id: string, payload: any) => api.patch(`/repository/documents/${id}`, payload),
  remove: (id: string) => api.delete(`/repository/documents/${id}`),
};

export const SystemAPI = {
  auditLogs: () => api.get("/system/audit-logs"),
};
