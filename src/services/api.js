// API service for connecting to backend
// Connected to database: greggory_foundation_db_main

export const API_BASE_URL = 'http://localhost:5000/api';

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

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Properties API
export const propertiesAPI = {
  // Get all properties
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/properties?${params}`);
  },
  
  // Get property by ID
  getById: (id) => apiCall(`/properties/${id}`),
  
  // Create new property
  create: (propertyData) => apiCall('/properties', {
    method: 'POST',
    body: JSON.stringify(propertyData),
  }),
  
  // Delete property
  delete: (id) => apiCall(`/properties/${id}`, {
    method: 'DELETE',
  }),
};

// Companies API
export const companiesAPI = {
  // Get all companies
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/companies?${params}`);
  },
  
  // Get company by ID
  getById: (id) => apiCall(`/companies/${id}`),
  
  // Create new company
  create: (companyData) => apiCall('/companies', {
    method: 'POST',
    body: JSON.stringify(companyData),
  }),
  
  // Delete company
  delete: (id) => apiCall(`/companies/${id}`, {
    method: 'DELETE',
  }),
};

// Videos API
export const videosAPI = {
  // Get all videos
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/videos?${params}`);
  },
  
  // Get video by ID
  getById: (id) => apiCall(`/videos/${id}`),
  
  // Create new video
  create: (videoData) => apiCall('/videos', {
    method: 'POST',
    body: JSON.stringify(videoData),
  }),
  
  // Delete video
  delete: (id) => apiCall(`/videos/${id}`, {
    method: 'DELETE',
  }),
};

// Contact Forms API
export const contactFormsAPI = {
  // Get all contact forms
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/contact-forms?${params}`);
  },
  
  // Get contact form by ID
  getById: (id) => apiCall(`/contact-forms/${id}`),
  
  // Create new contact form
  create: (formData) => apiCall('/contact-forms', {
    method: 'POST',
    body: JSON.stringify(formData),
  }),
  
  // Delete contact form
  delete: (id) => apiCall(`/contact-forms/${id}`, {
    method: 'DELETE',
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
  
  // Registration - ALWAYS sends JSON to users table
  register: (userData) => apiCall('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
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
  getBlogArticles: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/blog-articles?${params}`);
  },
  getBlogArticle: (id) => apiCall(`/blog-articles/${id}`),
  createBlogArticle: (data) => apiCall('/blog-articles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateBlogArticle: (id, data) => apiCall(`/blog-articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteBlogArticle: (id) => apiCall(`/blog-articles/${id}`, {
    method: 'DELETE',
  }),
  
  // Contact forms
  getContactForms: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/contact-forms?${params}`);
  },
  getContactForm: (id) => apiCall(`/contact-forms/${id}`),
  deleteContactForm: (id) => apiCall(`/contact-forms/${id}`, {
    method: 'DELETE',
  }),
};

// Health check
export const healthCheck = () => apiCall('/health');

export default {
  properties: propertiesAPI,
  companies: companiesAPI,
  videos: videosAPI,
  contactForms: contactFormsAPI,
  management: managementAPI,
  users: usersAPI,
  content: contentAPI,
  images: imagesAPI,
  healthCheck,
};
