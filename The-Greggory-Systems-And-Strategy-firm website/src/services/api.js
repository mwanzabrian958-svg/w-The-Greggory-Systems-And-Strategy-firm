// API service for connecting to backend
// Hardened for Strategic Mission Control

export const API_BASE_URL = '/api';

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
    const token = session?.token || localStorage.getItem("gf_admin_session_token");

    // 2. Construct Protocol Header
    const authHeaders = {
      "Content-Type": "application/json",
      ...headers
    };
    if (token) authHeaders["Authorization"] = `Bearer ${token}`;

    // 3. Resolve Endpoint URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

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

export const getApiUrl = (path) => path;

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
