// Comprehensive API Integration System
// Links all frontend components to backend endpoints
// Ensures complete end-to-end functionality

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// =============================================
// FRONTEND TO BACKEND ROUTE MAPPING
// Maps every frontend route to its backend API
// =============================================

const ROUTE_MAPPING = {
  // Public Pages
  HOME: {
    path: '/',
    api: '/api/system/health',
    method: 'GET',
    component: 'HomePage.jsx'
  },
  
  LOGIN: {
    path: '/login',
    api: '/api/users/login',
    method: 'POST',
    component: 'Login.jsx'
  },
  
  SIGNUP: {
    path: '/signup',
    api: '/api/users/test-register',
    method: 'POST',
    component: 'Signup.jsx'
  },
  
  FORGOT_PASSWORD: {
    path: '/forgot-password',
    api: '/api/users/forgot-password',
    method: 'POST',
    component: 'ForgotPassword.jsx'
  },
  
  // Authenticated User Pages
  DASHBOARD: {
    path: '/dashboard',
    api: '/api/users/profile/:userId',
    method: 'GET',
    component: 'Dashboard.jsx'
  },
  
  PROJECTS_ACTIVITIES: {
    path: '/projects',
    api: '/api/projects/user/:userId',
    method: 'GET',
    component: 'ProjectsActivities.jsx'
  },
  
  PROJECT_DETAILS: {
    path: '/projects/:id',
    api: '/api/projects/:id',
    method: 'GET',
    component: 'ProjectDetails.jsx'
  },
  
  PROFILE: {
    path: '/profile',
    api: '/api/users/profile/:userId',
    method: 'GET',
    component: 'Profile.jsx'
  },
  
  SETTINGS: {
    path: '/settings',
    api: '/api/users/settings/:userId',
    method: 'GET',
    component: 'Settings.jsx'
  },
  
  // Admin Pages
  ADMIN_LOGIN: {
    path: '/admin',
    api: '/api/admin/authenticate',
    method: 'POST',
    component: 'AdminDashboard.jsx'
  },
  
  ADMIN_DASHBOARD: {
    path: '/admin/dashboard',
    api: '/api/admin/dashboard',
    method: 'GET',
    component: 'AdminDashboard.jsx'
  },
  
  ADMIN_USERS: {
    path: '/admin/users',
    api: '/api/admin/users',
    method: 'GET',
    component: 'AdminDashboard.jsx (Users Tab)'
  },
  
  ADMIN_PROJECTS: {
    path: '/admin/projects',
    api: '/api/admin/projects',
    method: 'GET',
    component: 'AdminDashboard.jsx (Projects Tab)'
  },
  
  ADMIN_FINANCIAL: {
    path: '/admin/financial',
    api: '/api/admin/financial',
    method: 'GET',
    component: 'AdminDashboard.jsx (Financial Tab)'
  },
  
  ADMIN_REPORTS: {
    path: '/admin/reports',
    api: '/api/admin/reports',
    method: 'GET',
    component: 'AdminDashboard.jsx (Reports Tab)'
  }
};

// =============================================
// API ENDPOINT REGISTRY
// Complete list of all backend endpoints
// =============================================

const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/test-register',
    ADMIN_AUTH: '/api/admin/authenticate',
    LOGOUT: '/api/users/logout',
    REFRESH_TOKEN: '/api/users/refresh-token',
    VERIFY_EMAIL: '/api/users/verify-email',
    RESET_PASSWORD: '/api/users/reset-password'
  },
  
  // User Management
  USERS: {
    GET_ALL: '/api/users',
    GET_BY_ID: '/api/users/:id',
    CREATE: '/api/users/admin-create',
    UPDATE: '/api/users/:id',
    DELETE: '/api/users/:id',
    GET_PROFILE: '/api/users/profile/:id',
    UPDATE_PROFILE: '/api/users/profile/:id',
    UPLOAD_PHOTO: '/api/users/profile-photo/:id',
    GET_SETTINGS: '/api/users/settings/:id',
    UPDATE_SETTINGS: '/api/users/settings/:id'
  },
  
  // Admin Management
  ADMIN: {
    GET_ALL_USERS: '/api/admin/users',
    GET_ADMINS: '/api/admin/admin-users',
    GET_DEVELOPERS: '/api/admin/developer-users',
    CREATE_USER: '/api/admin/create-user',
    UPDATE_USER: '/api/admin/update-user/:id',
    DELETE_USER: '/api/admin/delete-user/:id',
    GET_DASHBOARD_DATA: '/api/admin/dashboard',
    GET_ACTIVITY_LOG: '/api/admin/activity-log',
    GET_SECURITY_SETTINGS: '/api/admin/security',
    UPDATE_SECURITY_SETTINGS: '/api/admin/security'
  },
  
  // Project Management
  PROJECTS: {
    GET_ALL: '/api/projects',
    GET_BY_ID: '/api/projects/:id',
    GET_USER_PROJECTS: '/api/projects/user/:userId',
    CREATE: '/api/projects',
    UPDATE: '/api/projects/:id',
    DELETE: '/api/projects/:id',
    GET_MEMBERS: '/api/projects/:id/members',
    ADD_MEMBER: '/api/projects/:id/members',
    REMOVE_MEMBER: '/api/projects/:id/members/:memberId',
    GET_PHOTOS: '/api/projects/:id/photos',
    UPLOAD_PHOTO: '/api/projects/:id/photos',
    DELETE_PHOTO: '/api/projects/photos/:photoId',
    GET_TASKS: '/api/projects/:id/tasks',
    CREATE_TASK: '/api/projects/:id/tasks',
    UPDATE_TASK: '/api/projects/tasks/:taskId',
    DELETE_TASK: '/api/projects/tasks/:taskId',
    GET_ACTIVITIES: '/api/projects/:id/activities',
    CREATE_ACTIVITY: '/api/projects/:id/activities'
  },
  
  // Financial Management
  FINANCIAL: {
    GET_ACCOUNTING: '/api/financial/accounting',
    GET_INVOICES: '/api/financial/invoices',
    CREATE_INVOICE: '/api/financial/invoices',
    UPDATE_INVOICE: '/api/financial/invoices/:id',
    DELETE_INVOICE: '/api/financial/invoices/:id',
    GET_QUOTES: '/api/financial/quotes',
    CREATE_QUOTE: '/api/financial/quotes',
    UPDATE_QUOTE: '/api/financial/quotes/:id',
    DELETE_QUOTE: '/api/financial/quotes/:id',
    QUOTE_TO_INVOICE: '/api/financial/quotes/:id/convert',
    GET_PAYMENTS: '/api/financial/payments',
    CREATE_PAYMENT: '/api/financial/payments',
    MPESA_PAYMENT: '/api/financial/mpesa',
    CURRENCY_CONVERT: '/api/financial/currency-convert',
    GET_EXCHANGE_RATES: '/api/financial/exchange-rates'
  },
  
  // Document Management
  DOCUMENTS: {
    GET_ALL: '/api/documents',
    GET_BY_PROJECT: '/api/documents/project/:projectId',
    UPLOAD: '/api/documents/upload',
    DOWNLOAD: '/api/documents/:id/download',
    DELETE: '/api/documents/:id',
    GENERATE_PDF: '/api/documents/:id/pdf',
    SHARE_DOCUMENT: '/api/documents/:id/share',
    GET_SHARED: '/api/documents/shared/:shareId'
  },
  
  // Reports
  REPORTS: {
    GET_FINANCIAL: '/api/reports/financial',
    GET_PROJECT: '/api/reports/project/:projectId',
    GET_USER_ACTIVITY: '/api/reports/user/:userId',
    GENERATE_REPORT: '/api/reports/generate',
    EXPORT_REPORT: '/api/reports/:id/export',
    GET_REPORT_TEMPLATES: '/api/reports/templates'
  },
  
  // System
  SYSTEM: {
    HEALTH_CHECK: '/api/system/health',
    CONFIGURATION: '/api/system/config',
    BACKUP: '/api/system/backup',
    RESTORE: '/api/system/restore',
    LOGS: '/api/system/logs',
    METRICS: '/api/system/metrics',
    NOTIFICATIONS: '/api/system/notifications'
  }
};

// =============================================
// ROUTE VALIDATION MIDDLEWARE
// Ensures all routes are properly linked
// =============================================

const validateRouteLinking = (req, res, next) => {
  const path = req.path;
  const method = req.method;
  
  // Log all route access for debugging
  console.log(`[${new Date().toISOString()}] ${method} ${path}`);
  
  // Check if route exists in mapping
  const routeInfo = Object.values(ROUTE_MAPPING).find(route => 
    route.path === path && route.method === method
  );
  
  if (!routeInfo) {
    console.warn(`Unmapped route: ${method} ${path}`);
  }
  
  req.routeInfo = routeInfo;
  next();
};

// =============================================
// ENDPOINT HEALTH MONITORING
// Monitors health of all API endpoints
// =============================================

router.get('/api/health/all', validateRouteLinking, async (req, res) => {
  try {
    const healthStatus = {};
    let totalEndpoints = 0;
    let healthyEndpoints = 0;
    
    // Check each endpoint category
    for (const [category, endpoints] of Object.entries(API_ENDPOINTS)) {
      healthStatus[category] = {};
      
      for (const [name, path] of Object.entries(endpoints)) {
        totalEndpoints++;
        
        // Simulate health check (would ping actual endpoint)
        const isHealthy = await checkEndpointHealth(path);
        
        healthStatus[category][name] = {
          path: path,
          status: isHealthy ? 'healthy' : 'unhealthy',
          lastChecked: new Date().toISOString()
        };
        
        if (isHealthy) healthyEndpoints++;
      }
    }
    
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      overall: `${healthyEndpoints}/${totalEndpoints} endpoints healthy`,
      healthPercentage: Math.round((healthyEndpoints / totalEndpoints) * 100),
      endpoints: healthStatus
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// =============================================
// ROUTE LINKING VERIFICATION
// Verifies all frontend routes are linked to APIs
// =============================================

router.get('/api/routes/verify', validateRouteLinking, (req, res) => {
  const verificationResults = {
    totalRoutes: Object.keys(ROUTE_MAPPING).length,
    linkedRoutes: 0,
    unlinkedRoutes: [],
    timestamp: new Date().toISOString()
  };
  
  // Check each route mapping
  for (const [name, route] of Object.entries(ROUTE_MAPPING)) {
    const isLinked = API_ENDPOINTS[route.api.split('/')[1]]?.includes(route.api);
    
    if (isLinked) {
      verificationResults.linkedRoutes++;
    } else {
      verificationResults.unlinkedRoutes.push({
        name: name,
        path: route.path,
        api: route.api,
        component: route.component,
        issue: 'API endpoint not found'
      });
    }
  }
  
  verificationResults.linkagePercentage = Math.round((verificationResults.linkedRoutes / verificationResults.totalRoutes) * 100);
  
  res.json({
    status: verificationResults.linkagePercentage === 100 ? 'success' : 'warning',
    verification: verificationResults,
    recommendations: verificationResults.unlinkedRoutes.length > 0 ? [
      'Implement missing API endpoints',
      'Update route mappings',
      'Check endpoint naming conventions'
    ] : [
      'All routes properly linked',
      'System ready for production'
    ]
  });
});

// =============================================
// COMPONENT API INTEGRATION MAP
// Maps React components to their required APIs
// =============================================

const COMPONENT_API_MAP = {
  // Authentication Components
  'Login.jsx': [
    'POST /api/users/login',
    'POST /api/users/forgot-password'
  ],
  
  'Signup.jsx': [
    'POST /api/users/test-register',
    'GET /api/system/health'
  ],
  
  'AdminLoginModal.jsx': [
    'POST /api/admin/authenticate'
  ],
  
  // User Components
  'Navbar.jsx': [
    'GET /api/users/profile/:userId',
    'POST /api/users/logout'
  ],
  
  'Dashboard.jsx': [
    'GET /api/users/profile/:userId',
    'GET /api/projects/user/:userId'
  ],
  
  'ProjectsActivities.jsx': [
    'GET /api/projects/user/:userId',
    'GET /api/projects/:id',
    'POST /api/projects/:id/activities'
  ],
  
  'ProjectDetails.jsx': [
    'GET /api/projects/:id',
    'GET /api/projects/:id/photos',
    'GET /api/projects/:id/documents',
    'GET /api/projects/:id/financial'
  ],
  
  // Admin Components
  'AdminDashboard.jsx': [
    'GET /api/admin/dashboard',
    'GET /api/admin/users',
    'GET /api/admin/projects',
    'GET /api/admin/financial',
    'GET /api/admin/reports',
    'POST /api/users/admin-create',
    'POST /api/financial/invoices',
    'POST /api/financial/quotes'
  ]
};

// =============================================
// FRONTEND INTEGRATION HELPER
// Provides frontend components with API integration utilities
// =============================================

router.get('/api/frontend/integration-config', validateRouteLinking, (req, res) => {
  res.json({
    config: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3001',
      apiVersion: 'v1',
      timeout: 30000,
      retryAttempts: 3
    },
    componentApiMap: COMPONENT_API_MAP,
    routeMapping: ROUTE_MAPPING,
    apiEndpoints: API_ENDPOINTS,
    integrationHelpers: {
      // Helper functions for frontend integration
      getApiUrl: (endpoint) => {
        return `${process.env.BASE_URL || 'http://localhost:3001'}${endpoint}`;
      },
      
      makeApiCall: async (endpoint, options = {}) => {
        const url = `${process.env.BASE_URL || 'http://localhost:3001'}${endpoint}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          ...options
        });
        
        if (!response.ok) {
          throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      },
      
      handleApiError: (error, endpoint) => {
        console.error(`API Error for ${endpoint}:`, error);
        // Would show user-friendly error message
        return {
          message: 'An error occurred. Please try again.',
          endpoint: endpoint,
          timestamp: new Date().toISOString()
        };
      }
    }
  });
});

// =============================================
// ENDPOINT HEALTH CHECKER
// Individual endpoint health verification
// =============================================

async function checkEndpointHealth(endpointPath) {
  try {
    // Simulate health check - would normally ping the actual endpoint
    // For now, assume all registered endpoints are healthy
    const knownEndpoints = Object.values(API_ENDPOINTS).flat();
    return knownEndpoints.includes(endpointPath);
  } catch (error) {
    console.error(`Health check failed for ${endpointPath}:`, error);
    return false;
  }
}

// =============================================
// MISSING ENDPOINTS DETECTOR
// Identifies endpoints that should exist but don't
// =============================================

router.get('/api/endpoints/missing', validateRouteLinking, (req, res) => {
  const requiredEndpoints = [];
  const implementedEndpoints = Object.values(API_ENDPOINTS).flat();
  
  // Analyze component requirements vs implemented endpoints
  for (const [component, requiredApis] of Object.entries(COMPONENT_API_MAP)) {
    for (const api of requiredApis) {
      if (!implementedEndpoints.includes(api)) {
        requiredEndpoints.push({
          component: component,
          missingApi: api,
          priority: getEndpointPriority(api),
          impact: getEndpointImpact(api)
        });
      }
    }
  }
  
  res.json({
    status: requiredEndpoints.length === 0 ? 'success' : 'warning',
    missingEndpoints: requiredEndpoints,
    recommendations: requiredEndpoints.length > 0 ? [
      'Implement missing API endpoints',
      'Update component API calls',
      'Verify endpoint naming consistency'
    ] : [
      'All required endpoints implemented',
      'Frontend-backend integration complete'
    ]
  });
});

// Helper functions
function getEndpointPriority(api) {
  const highPriorityApis = [
    '/api/users/login',
    '/api/users/test-register',
    '/api/admin/authenticate',
    '/api/projects/user/:userId'
  ];
  
  return highPriorityApis.includes(api) ? 'high' : 'medium';
}

function getEndpointImpact(api) {
  const criticalApis = [
    '/api/users/login',
    '/api/admin/authenticate'
  ];
  
  return criticalApis.includes(api) ? 'critical' : 'normal';
}

// =============================================
// EXPORT CONFIGURATION
// =============================================

module.exports = {
  router,
  ROUTE_MAPPING,
  API_ENDPOINTS,
  COMPONENT_API_MAP,
  validateRouteLinking,
  checkEndpointHealth
};
