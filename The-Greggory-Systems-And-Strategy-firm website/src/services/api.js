// API service for connecting to backend
// Hardened for Strategic Mission Control

export const API_BASE_URL = '/api';

export const getApiUrl = (path) => path;

/**
 * Hardened API Relay
 */
export const apiCall = async (endpoint, options = {}) => {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });

    const text = await response.text();
    if (!text) {
        if (!response.ok) throw new Error(`Node Relay Error: ${response.status}`);
        return { success: true };
    }

    let data = null;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text, success: response.ok };
    }

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `Protocol Error: ${response.status}`);
    }

    return data || {};
  } catch (error) {
    console.error("MISSION CRITICAL: API Relay Failure:", error);
    throw error;
  }
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
  getAll: () => apiCall("/users"),
  getById: (id) => apiCall(`/users/${id}`),
};

// Communication Hub API
export const communicationAPI = {
  getMessages: () => apiCall('/communication/messages'),
  sendMessage: (data) => apiCall('/communication/messages', { method: 'POST', body: JSON.stringify(data) }),
  getAnnouncements: () => apiCall('/communication/announcements'),
};

// Content API (Blog/Articles)
export const contentAPI = {
  getArticles: () => apiCall('/blog-articles'),
  getArticleById: (id) => apiCall(`/blog-articles/${id}`),
  createArticle: (data) => apiCall('/blog-articles', { method: 'POST', body: JSON.stringify(data) }),
  updateArticle: (id, data) => apiCall(`/blog-articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteArticle: (id) => apiCall(`/blog-articles/${id}`, { method: 'DELETE' }),
};

export default {
  apiCall,
  mpesa: mpesaAPI,
  projects: projectsAPI,
  invoices: invoicesAPI,
  users: usersAPI,
  communication: communicationAPI,
  content: contentAPI
};
