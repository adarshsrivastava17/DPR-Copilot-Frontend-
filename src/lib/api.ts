/**
 * API client with auth token management.
 */
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to all requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("dpr_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("dpr_token");
      localStorage.removeItem("dpr_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────
export const authAPI = {
  register: (data: { email: string; password: string; full_name: string; org_name?: string }) =>
    api.post("/api/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
  me: () => api.get("/api/auth/me"),
};

// ─── Projects ────────────────────────────────────────
export const projectsAPI = {
  list: () => api.get("/api/projects/"),
  create: (data: { name: string; business_type?: string; description?: string; inputs?: Record<string, any> }) =>
    api.post("/api/projects/", data),
  get: (id: string) => api.get(`/api/projects/${id}`),
  update: (id: string, data: Record<string, any>) => api.put(`/api/projects/${id}`, data),
  delete: (id: string) => api.delete(`/api/projects/${id}`),
};

// ─── Documents ───────────────────────────────────────
export const documentsAPI = {
  upload: (projectId: string, file: File, isReference = false) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/api/documents/upload/${projectId}?is_reference=${isReference}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadReference: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/documents/upload-reference", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  listByProject: (projectId: string) => api.get(`/api/documents/project/${projectId}`),
  delete: (id: string) => api.delete(`/api/documents/${id}`),
};

// ─── Reports ─────────────────────────────────────────
export const reportsAPI = {
  generate: (projectId: string, customInstructions?: string, targetPages?: number) =>
    api.post("/api/reports/generate", { project_id: projectId, custom_instructions: customInstructions, target_pages: targetPages || 30 }),
  get: (id: string) => api.get(`/api/reports/${id}`),
  listByProject: (projectId: string) => api.get(`/api/reports/project/${projectId}`),
  updateSection: (reportId: string, sectionKey: string, content: string) =>
    api.put(`/api/reports/${reportId}/section`, { section_key: sectionKey, content }),
  regenerateSection: (reportId: string, sectionKey: string, instructions?: string) =>
    api.post(`/api/reports/${reportId}/regenerate-section`, { section_key: sectionKey, instructions }),
};

// ─── Export ──────────────────────────────────────────
export const exportAPI = {
  pdf: (reportId: string) => api.post(`/api/export/${reportId}/pdf`, {}, { responseType: "blob" }),
  pptx: (reportId: string) => api.post(`/api/export/${reportId}/pptx`, {}, { responseType: "blob" }),
};

// ─── Ingestion ───────────────────────────────────────
export const ingestionAPI = {
  ingestReferences: (directory?: string) =>
    api.post("/api/ingest/reference-dprs", null, { params: { directory } }),
  parseDocument: (documentId: string) =>
    api.post(`/api/ingest/parse-document/${documentId}`),
};

export default api;
