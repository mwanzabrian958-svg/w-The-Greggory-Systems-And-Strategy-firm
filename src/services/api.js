// API service for connecting to backend

const API_BASE_URL = 'http://localhost:5000/api';

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

// Health check
export const healthCheck = () => apiCall('/health');

export default {
  properties: propertiesAPI,
  applications: applicationsAPI,
  management: managementAPI,
  users: usersAPI,
  healthCheck,
};
