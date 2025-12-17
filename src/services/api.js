// API service for connecting to backend

const API_BASE_URL = 'http://localhost:8080/api';

// Generic API helper
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Properties API
export const propertiesAPI = {
  // Get all properties
  getAll: () => apiCall('/properties'),
  
  // Get properties by company
  getByCompany: (companyId) => apiCall(`/properties/company/${companyId}`),
  
  // Get property by ID
  getById: (id) => apiCall(`/properties/${id}`),
  
  // Get property statistics
  getStats: (companyId) => apiCall(`/properties/stats/${companyId}`),
  
  // Get property features for specific room
  getFeatures: (propertyId, roomNumber) => 
    apiCall(`/properties/${propertyId}/features/${roomNumber}`),
};

// Applications API
export const applicationsAPI = {
  // Create new application
  create: (applicationData) => apiCall('/applications', {
    method: 'POST',
    body: JSON.stringify(applicationData),
  }),
  
  // Get application by ID
  getById: (id) => apiCall(`/applications/${id}`),
  
  // Get all applications (with optional filters)
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/applications?${params}`);
  },
  
  // Update application status
  updateStatus: (id, statusId) => apiCall(`/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status_id: statusId }),
  }),
};

// Management API
export const managementAPI = {
  // Get management info by company
  getByCompany: (companyId) => apiCall(`/management/${companyId}`),
  
  // Update management info
  update: (companyId, data) => apiCall(`/management/${companyId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Users API
export const usersAPI = {
  // Login
  login: (credentials) => apiCall('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  // Google Authentication
  googleAuth: (data) => apiCall('/users/google-auth', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Get all users (admin)
  getAll: () => apiCall('/users'),
  
  // Get user by ID
  getById: (id) => apiCall(`/users/${id}`),
  
  // Create new user (admin)
  create: (userData) => apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};

// Images API (profile photos, etc.)
export const imagesAPI = {
  // Upload a profile image (returns { image_id })
  uploadProfile: (payload) => apiCall('/images/profile', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  
  // Delete image (admin only)
  delete: (id) => apiCall(`/images/${id}`, {
    method: 'DELETE',
  }),
};

// Content API (requires admin key header)
const contentApiCall = async (endpoint, options = {}) => {
  const adminKey = localStorage.getItem('admin_key') || '';
  return apiCall(endpoint, {
    ...options,
    headers: {
      'x-admin-key': adminKey,
      ...options.headers,
    },
  });
};

export const contentAPI = {
  // Blog articles
  getBlogArticles: (publishedOnly = false) => 
    apiCall(`/content/blog${publishedOnly ? '?published_only=true' : ''}`),
  getBlogArticle: (id) => apiCall(`/content/blog/${id}`),
  createBlogArticle: (data) => contentApiCall('/content/blog', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateBlogArticle: (id, data) => contentApiCall(`/content/blog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteBlogArticle: (id) => contentApiCall(`/content/blog/${id}`, {
    method: 'DELETE',
  }),
  
  // Case studies
  getCaseStudies: () => apiCall('/content/case-studies'),
  getCaseStudy: (id) => apiCall(`/content/case-studies/${id}`),
  createCaseStudy: (data) => contentApiCall('/content/case-studies', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateCaseStudy: (id, data) => contentApiCall(`/content/case-studies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteCaseStudy: (id) => contentApiCall(`/content/case-studies/${id}`, {
    method: 'DELETE',
  }),
  
  // Contact forms
  getContactForms: () => contentApiCall('/content/contact-forms'),
  getContactForm: (id) => contentApiCall(`/content/contact-forms/${id}`),
  deleteContactForm: (id) => contentApiCall(`/content/contact-forms/${id}`, {
    method: 'DELETE',
  }),
};

// Health check
export const healthCheck = () => apiCall('/health');

export default {
  properties: propertiesAPI,
  applications: applicationsAPI,
  management: managementAPI,
  users: usersAPI,
  content: contentAPI,
  images: imagesAPI,
  healthCheck,
};
