import React, { useState } from 'react';
import { 
  Code2, Terminal, Database, Server, Shield, 
  FileJson, Webhook, AlertTriangle, CheckCircle,
  RefreshCw, Copy, ExternalLink
} from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/permissions';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export function Developer({ user }) {
  const { can } = usePermissions(user);
  const [activeTab, setActiveTab] = useState('api');
  const [apiTestResult, setApiTestResult] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    try {
      const start = performance.now();
      const response = await fetch(`${API_URL}/health`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('gf_admin_session')?.token}`
        }
      });
      const end = performance.now();
      
      setApiTestResult({
        success: response.ok,
        status: response.status,
        latency: Math.round(end - start),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setApiTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const checkDbStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/database-status`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('gf_admin_session')?.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDbStatus(data);
      } else {
        setDbStatus({ status: 'error', message: 'Failed to check database status' });
      }
    } catch (error) {
      setDbStatus({ status: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!can(PERMISSIONS.ACCESS_API_DOCS)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Code2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-medium text-gray-900">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to access developer tools.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Developer Tools</h1>
        <p className="text-gray-600 mt-1">API documentation, database tools, and system diagnostics</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('api')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'api'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Webhook className="w-4 h-4 inline mr-2" />
              API Status
            </button>
            {can(PERMISSIONS.VIEW_DATABASE) && (
              <button
                onClick={() => setActiveTab('database')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'database'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Database className="w-4 h-4 inline mr-2" />
                Database
              </button>
            )}
            <button
              onClick={() => setActiveTab('docs')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'docs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileJson className="w-4 h-4 inline mr-2" />
              API Documentation
            </button>
            {can(PERMISSIONS.MANAGE_BACKUPS) && (
              <button
                onClick={() => setActiveTab('backups')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'backups'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Server className="w-4 h-4 inline mr-2" />
                Backups
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {/* API Status Tab */}
          {activeTab === 'api' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">API Connection Test</h3>
                  <p className="text-sm text-gray-500">Test connectivity to the backend API</p>
                </div>
                <button
                  onClick={testApiConnection}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Test Connection
                </button>
              </div>

              {apiTestResult && (
                <div className={`rounded-lg p-4 ${apiTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-start">
                    {apiTestResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="ml-3">
                      <h4 className={`text-sm font-medium ${apiTestResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        {apiTestResult.success ? 'Connection Successful' : 'Connection Failed'}
                      </h4>
                      <div className="mt-2 text-sm">
                        {apiTestResult.success ? (
                          <ul className="space-y-1 text-green-700">
                            <li>Status: {apiTestResult.status}</li>
                            <li>Latency: {apiTestResult.latency}ms</li>
                            <li>Timestamp: {apiTestResult.timestamp}</li>
                          </ul>
                        ) : (
                          <p className="text-red-700">{apiTestResult.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-900 mb-3">API Endpoints</h4>
                <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium text-gray-500">Method</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500">Endpoint</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3"><span className="text-green-600 font-medium">GET</span></td>
                        <td className="py-2 px-3 font-mono text-gray-700">/api/users</td>
                        <td className="py-2 px-3 text-gray-600">List all users</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3"><span className="text-blue-600 font-medium">POST</span></td>
                        <td className="py-2 px-3 font-mono text-gray-700">/api/users</td>
                        <td className="py-2 px-3 text-gray-600">Create new user</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3"><span className="text-green-600 font-medium">GET</span></td>
                        <td className="py-2 px-3 font-mono text-gray-700">/api/projects</td>
                        <td className="py-2 px-3 text-gray-600">List all projects</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3"><span className="text-green-600 font-medium">GET</span></td>
                        <td className="py-2 px-3 font-mono text-gray-700">/api/content</td>
                        <td className="py-2 px-3 text-gray-600">List all content</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3"><span className="text-green-600 font-medium">GET</span></td>
                        <td className="py-2 px-3 font-mono text-gray-700">/api/applications</td>
                        <td className="py-2 px-3 text-gray-600">List all applications</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && can(PERMISSIONS.VIEW_DATABASE) && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Database Status</h3>
                  <p className="text-sm text-gray-500">Check database connectivity and performance</p>
                </div>
                <button
                  onClick={checkDbStatus}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Check Status
                </button>
              </div>

              {dbStatus && (
                <div className={`rounded-lg p-4 mb-6 ${dbStatus.status === 'ok' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-start">
                    {dbStatus.status === 'ok' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="ml-3">
                      <h4 className={`text-sm font-medium ${dbStatus.status === 'ok' ? 'text-green-800' : 'text-red-800'}`}>
                        {dbStatus.status === 'ok' ? 'Database Connected' : 'Database Error'}
                      </h4>
                      {dbStatus.status === 'ok' ? (
                        <ul className="mt-2 text-sm text-green-700 space-y-1">
                          <li>Connection: Active</li>
                          {dbStatus.responseTime && <li>Response Time: {dbStatus.responseTime}ms</li>}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-red-700">{dbStatus.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Database Tables</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['users', 'admin_users', 'developer_users', 'projects', 'content', 'applications', 'admin_activity_log', 'user_roles'].map(table => (
                    <div key={table} className="bg-white rounded border border-gray-200 px-3 py-2 text-sm font-mono text-gray-700">
                      {table}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* API Documentation Tab */}
          {activeTab === 'docs' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">API Documentation</h3>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Authentication</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    All admin API endpoints require authentication. Include the session token in the Authorization header:
                  </p>
                  <code className="block bg-slate-900 text-green-400 p-3 rounded text-sm font-mono">
                    Authorization: Bearer {'<your-session-token>'}
                  </code>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Base URL</h4>
                  <code className="block bg-slate-900 text-blue-400 p-3 rounded text-sm font-mono">
                    {API_URL}
                  </code>
                  <button 
                    onClick={() => navigator.clipboard.writeText(API_URL)}
                    className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy to clipboard
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Response Format</h4>
                  <p className="text-sm text-gray-600">
                    All responses are returned in JSON format. Successful responses include a <code className="bg-gray-200 px-1 rounded">success: true</code> field.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Need more details?</span>
                  <a 
                    href="#" 
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                    onClick={(e) => e.preventDefault()}
                  >
                    View Full Documentation
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Backups Tab */}
          {activeTab === 'backups' && can(PERMISSIONS.MANAGE_BACKUPS) && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Database Backups</h3>
                  <p className="text-sm text-gray-500">Manage and download database backups</p>
                </div>
                <button
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Server className="w-4 h-4 mr-2" />
                  Create Backup
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-gray-900 font-medium mb-1">No Backups Available</h4>
                <p className="text-sm text-gray-500 mb-4">Create your first database backup</p>
                <button
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Developer;
