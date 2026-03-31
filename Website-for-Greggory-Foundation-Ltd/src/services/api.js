// API service for connecting to backend

const API_BASE_URL = '/api';

import api from '../config/axios';

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

// Generic API helper for FormData (multipart)
const apiCallFormData = async (endpoint, options = {}) => {
  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] Sending FormData POST to: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      headers: {
        // Don't set Content-Type - browser will set it with boundary
        ...options.headers,
      },
      ...options,
    });

    console.log(`[API] Response status: ${response.status}`);
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorData;
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        const text = await response.text();
        errorData = { message: `API Error: ${response.status} - ${response.statusText}`, body: text };
      }
      console.error(`[API] Error response:`, errorData);
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[API] FormData call failed:', error);
    console.error('[API] Error type:', error.message);
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
  // Register new user - UPDATED FOR NEW DATABASE SCHEMA
  register: async (formData) => {
    try {
      console.log('[API] Sending registration request');
      
      // Convert FormData to JSON for new endpoint
      const data = {
        fullName: formData.get('fullName') || `${formData.get('firstName')} ${formData.get('lastName')}`,
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        userType: formData.get('userType') || 'user',
        adminCode: formData.get('adminCode'),
      };
      
      console.log('[API] Data to send:', data);
      console.log('[API] Posting to: http://localhost:8080/api/auth/register');
      
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log('[API] Registration response status:', response.status);
      console.log('[API] Registration response headers:', response.headers);
      
      let responseData;
      
      // Handle both JSON and HTML responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // JSON response
        responseData = await response.json();
        console.log('[API] JSON registration response data:', responseData);
      } else {
        // HTML response or other format
        const text = await response.text();
        console.log('[API] HTML/Text registration response:', text);
        
        // Try to extract error information from HTML
        if (response.status >= 400) {
          // Look for common error patterns in HTML
          const titleMatch = text.match(/<title>(.*?)<\/title>/i);
          const h1Match = text.match(/<h1>(.*?)<\/h1>/i);
          const pMatch = text.match(/<p>(.*?)<\/p>/i);
          
          const errorMessage = titleMatch?.[1] || h1Match?.[1] || pMatch?.[1] || 'Server returned HTML response instead of JSON';
          
          responseData = { 
            success: false, 
            message: errorMessage,
            htmlPreview: text.substring(0, 200) + '...',
            status: response.status
          };
        } else {
          responseData = { 
            success: true, 
            message: 'Request completed but returned HTML',
            htmlPreview: text.substring(0, 200) + '...',
            status: response.status
          };
        }
      }
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Registration failed');
      }
      
      return responseData;
    } catch (error) {
      console.error('[API] Registration failed:', error);
      throw new Error(error.message || 'Registration failed');
    }
  },
  
  // Forgot password
  forgotPassword: async (email) => {
    try {
      console.log('[API] Sending forgot password request');
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      console.log('[API] Forgot password response status:', response.status);
      
      let responseData;
      
      // Handle both JSON and HTML responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        console.log('[API] JSON forgot password response:', responseData);
      } else {
        const text = await response.text();
        console.log('[API] HTML/Text forgot password response:', text);
        responseData = { 
          success: false, 
          message: 'Server returned HTML response instead of JSON',
          htmlPreview: text.substring(0, 200) + '...',
          status: response.status
        };
      }
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Password reset request failed');
      }
      
      return responseData;
    } catch (error) {
      console.error('[API] Forgot password failed:', error);
      throw new Error(error.message || 'Password reset request failed');
    }
  },
  
  // Login
  login: async (credentials) => {
    try {
      console.log('[API] Sending login request');
      console.log('[API] Credentials:', { email: credentials.email, userType: credentials.userType });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      console.log('[API] Login response status:', response.status);
      
      let responseData;
      
      // Handle both JSON and HTML responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // JSON response
        responseData = await response.json();
        console.log('[API] JSON login response data:', responseData);
      } else {
        // HTML response or other format
        const text = await response.text();
        console.log('[API] HTML/Text login response:', text);
        
        // Try to extract error information from HTML
        if (response.status >= 400) {
          // Look for common error patterns in HTML
          const titleMatch = text.match(/<title>(.*?)<\/title>/i);
          const h1Match = text.match(/<h1>(.*?)<\/h1>/i);
          const pMatch = text.match(/<p>(.*?)<\/p>/i);
          
          const errorMessage = titleMatch?.[1] || h1Match?.[1] || pMatch?.[1] || 'Server returned HTML response instead of JSON';
          
          responseData = { 
            success: false, 
            message: errorMessage,
            htmlPreview: text.substring(0, 200) + '...',
            status: response.status
          };
        } else {
          responseData = { 
            success: true, 
            message: 'Request completed but returned HTML',
            htmlPreview: text.substring(0, 200) + '...',
            status: response.status
          };
        }
      }
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Login failed');
      }
      
      return responseData;
    } catch (error) {
      console.error('[API] Login failed:', error);
      throw new Error(error.message || 'Login failed');
    }
  },
  
  // Google Authentication
  googleAuth: (data) => apiCall('/auth/google-auth', {
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

// Profile Photos API
export const profilePhotoAPI = {
  // Get profile photo URL for user
  getProfilePhotoUrl: (userId) => {
    return `http://localhost:8080/api/profile-photos/url/${userId}`;
  },

  // Get profile photo blob data
  getProfilePhoto: (userId) => {
    return apiCall(`/profile-photos/user/${userId}`);
  },

  // Upload profile photo
  uploadProfilePhoto: async (formData) => {
    try {
      console.log('[API] Uploading profile photo');
      
      const response = await fetch('http://localhost:8080/api/profile-photos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });
      
      console.log('[API] Profile photo upload response status:', response.status);
      
      let responseData;
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        console.log('[API] JSON profile photo response:', responseData);
      } else {
        const text = await response.text();
        responseData = { 
          success: false, 
          message: 'Server returned HTML response instead of JSON',
          htmlPreview: text.substring(0, 200) + '...',
          status: response.status
        };
      }
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Profile photo upload failed');
      }
      
      return responseData;
    } catch (error) {
      console.error('[API] Profile photo upload failed:', error);
      throw new Error(error.message || 'Profile photo upload failed');
    }
  }
};

// Content API (requires JWT authentication)
const contentApiCall = async (endpoint, options = {}) => {
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
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
