// API service for connecting to backend
// Hardened for Strategic Mission Control
//
// Base URL resolution:
//   - Local dev: leave VITE_API_BASE_URL unset -> falls back to '/api'
//     (the Vite dev server proxies '/api' to http://localhost:3000)
//   - Production: leave it unset too — Render serves the built app and the API
//     from ONE origin, so '/api' just works (same as local dev). Only set
//     VITE_API_BASE_URL if you ever move the API to a separate domain
//     (set it in the Render dashboard so it's baked in at build time).
const RAW_BASE = import.meta.env?.VITE_API_BASE_URL || "";
export const API_BASE_URL =
  String(RAW_BASE).trim().replace(/\/+$/, "") || "/api";

/**
 * Hardened API Relay
 * Automatically injects authentication tokens and handles malformed JSON.
 */
export const apiCall = async (endpoint, options = {}) => {
  try {
    const { headers = {}, ...restOptions } = options;

    // 1. Resolve Token Telemetry
    const sessionStr = localStorage.getItem("gf_admin_session") || sessionStorage.getItem("gf_admin_session");
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    // Fallback: client-portal sessions may persist under 'tgf_user' (AuthContext)
    let clientSession = null;
    try { clientSession = JSON.parse(localStorage.getItem("tgf_user") || "null"); } catch { clientSession = null; }
    const token = session?.token || localStorage.getItem("gf_admin_session_token") || clientSession?.token;

    // 2. Construct Protocol Header
    const authHeaders = {
      "Content-Type": "application/json",
      ...headers
    };
    if (token) authHeaders["Authorization"] = `Bearer ${token}`;

    // 3. Resolve Endpoint URL (normalized; tolerates endpoints that already include '/api')
    const url = /^https?:\/\//i.test(endpoint) ? endpoint : getApiUrl(endpoint);

    // 4. Execute Secure Handshake
    const response = await fetch(url, {
      headers: authHeaders,
      ...restOptions,
    });

    // 5. Handle Response Payload
    const text = await response.text();

    // Handle Empty Response
    if (!text || text.trim() === "") {
        if (!response.ok) throw new Error(`Protocol Error: ${response.status}`);
        return { success: true, empty: true };
    }

    let data = null;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // If it's not JSON, it might be an error page or raw text
      if (!response.ok) throw new Error(`Server Error (${response.status}): ${text.substring(0, 100)}`);
      data = { message: text, success: response.ok };
    }

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `Node Relay Failure: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("MISSION CRITICAL: Secure Relay Failure:", error.message);
    throw error;
  }
};

/**
 * Resolve a full API URL from a path.
 * Tolerates paths that already include a legacy "/api" prefix so callers
 * never produce doubled prefixes like "/api/api/...".
 */
export const getApiUrl = (path) => {
  const p = String(path ?? "").trim();
  if (/^https?:\/\//i.test(p)) return p;
  let clean = p.startsWith("/") ? p : `/${p}`;
  // Normalize legacy callers that already include the "/api" prefix
  if (clean === "/api") clean = "";
  else if (clean.startsWith("/api/")) clean = clean.slice(4);
  clean = clean.replace(/\/+$/, "");
  return `${API_BASE_URL}${clean}`;
};

// M-Pesa API
export const mpesaAPI = {
  stkPush: (data) => apiCall('/mpesa/stkpush', { method: 'POST', body: JSON.stringify(data) }),
  queryStatus: (checkoutRequestID) => apiCall(`/mpesa/status/${checkoutRequestID}`),
};

// User Projects API
export const projectsAPI = {
  getAll: () => apiCall('/user-projects'),
  getById: (id) => apiCall(`/user-projects/${id}`),
  create: (data) => apiCall('/user-projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/user-projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/user-projects/${id}`, { method: 'DELETE' })
};

// Invoices API
export const invoicesAPI = {
  getAll: () => apiCall('/invoices'),
  getById: (id) => apiCall(`/invoices/${id}`),
  create: (data) => apiCall('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/invoices/${id}`, { method: 'DELETE' })
};

// Users API
export const usersAPI = {
  login: (credentials) => apiCall("/users/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (userData) => apiCall("/users/register", { method: "POST", body: JSON.stringify(userData) }),
  googleAuth: (data) => apiCall("/users/google-auth", { method: "POST", body: JSON.stringify(data) }),
  getAll: () => apiCall("/users"),
  getById: (id) => apiCall(`/users/${id}`),
};

export default {
  apiCall,
  mpesa: mpesaAPI,
  projects: projectsAPI,
  invoices: invoicesAPI,
  users: usersAPI
};
