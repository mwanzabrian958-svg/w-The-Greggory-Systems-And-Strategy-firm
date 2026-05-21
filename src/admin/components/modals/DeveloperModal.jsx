import React, { useState } from 'react';
import { X, Code2, GitBranch, Database, Terminal, Play, Rocket, Bug, BookOpen, Settings, Activity, CheckCircle, AlertCircle, Clock, Zap, Server, Shield } from 'lucide-react';

export function DeveloperModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  const projects = [
    { id: 1, name: 'Website Redesign', branch: 'feature/homepage', status: 'In Progress', lastCommit: '2h ago', builds: 45, tests: 42 },
    { id: 2, name: 'Mobile App API', branch: 'feature/auth', status: 'In Progress', lastCommit: '4h ago', builds: 32, tests: 30 },
    { id: 3, name: 'Admin Panel', branch: 'main', status: 'Stable', lastCommit: '1d ago', builds: 89, tests: 89 },
    { id: 4, name: 'Client Portal', branch: 'develop', status: 'Review', lastCommit: '3d ago', builds: 67, tests: 65 },
  ];

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Stable': return 'bg-green-100 text-green-800 border-green-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Review': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Error': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code2 className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Developer Portal</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-gray-900 border-b px-6 flex gap-1">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'overview' ? 'bg-white border-b-2 border-slate-600 text-slate-600' : 'text-gray-400 hover:text-white'}`}>Overview</button>
          <button onClick={() => setActiveTab('repositories')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'repositories' ? 'bg-white border-b-2 border-slate-600 text-slate-600' : 'text-gray-400 hover:text-white'}`}>Repositories</button>
          <button onClick={() => setActiveTab('api')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'api' ? 'bg-white border-b-2 border-slate-600 text-slate-600' : 'text-gray-400 hover:text-white'}`}>API Testing</button>
          <button onClick={() => setActiveTab('database')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'database' ? 'bg-white border-b-2 border-slate-600 text-slate-600' : 'text-gray-400 hover:text-white'}`}>Database</button>
          <button onClick={() => setActiveTab('deploy')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'deploy' ? 'bg-white border-b-2 border-slate-600 text-slate-600' : 'text-gray-400 hover:text-white'}`}>Deployments</button>
          <button onClick={() => setActiveTab('logs')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'logs' ? 'bg-white border-b-2 border-slate-600 text-slate-600' : 'text-gray-400 hover:text-white'}`}>Logs</button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="w-5 h-5" />
                    <span className="text-sm opacity-90">Active Branches</span>
                  </div>
                  <div className="text-3xl font-bold">12</div>
                  <div className="text-sm opacity-75 mt-1">Across 4 projects</div>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm opacity-90">Tests Passing</span>
                  </div>
                  <div className="text-3xl font-bold">226</div>
                  <div className="text-sm opacity-75 mt-1">98% pass rate</div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-5 h-5" />
                    <span className="text-sm opacity-90">Deployments</span>
                  </div>
                  <div className="text-3xl font-bold">45</div>
                  <div className="text-sm opacity-75 mt-1">This month</div>
                </div>
                <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm opacity-90">Open Issues</span>
                  </div>
                  <div className="text-3xl font-bold">8</div>
                  <div className="text-sm opacity-75 mt-1">3 critical</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {[
                    { action: 'Pushed to feature/homepage', project: 'Website Redesign', time: '2h ago', user: 'John Doe' },
                    { action: 'Merged PR #234', project: 'Mobile App API', time: '4h ago', user: 'Jane Smith' },
                    { action: 'Deployment successful', project: 'Admin Panel', time: '1d ago', user: 'System' },
                    { action: 'Tests failed', project: 'Client Portal', time: '2d ago', user: 'Bob Johnson' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        i === 3 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {i === 3 ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.project} • {activity.user}</p>
                      </div>
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'repositories' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Repositories</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
                  <GitBranch className="w-4 h-4" /> New Repo
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {projects.map(project => (
                  <div key={project.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{project.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <GitBranch className="w-4 h-4" />
                          {project.branch}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Builds</div>
                        <div className="font-semibold text-gray-900">{project.builds}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Tests</div>
                        <div className="font-semibold text-gray-900">{project.tests}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Last Commit</div>
                        <div className="font-semibold text-gray-900">{project.lastCommit}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm">
                        <Terminal className="w-4 h-4" /> Terminal
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                        <BookOpen className="w-4 h-4" /> Docs
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">API Testing</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
                  <Play className="w-4 h-4" /> Run Tests
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="space-y-3">
                  {[
                    { method: 'GET', endpoint: '/api/users', status: 200, time: '45ms' },
                    { method: 'POST', endpoint: '/api/auth/login', status: 200, time: '120ms' },
                    { method: 'PUT', endpoint: '/api/users/123', status: 200, time: '89ms' },
                    { method: 'DELETE', endpoint: '/api/users/123', status: 200, time: '67ms' },
                    { method: 'GET', endpoint: '/api/projects', status: 200, time: '156ms' },
                  ].map((api) => (
                    <div key={api.endpoint} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <span className={`px-3 py-1 rounded font-mono text-xs font-bold ${
                        api.method === 'GET' ? 'bg-green-100 text-green-800' :
                        api.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        api.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {api.method}
                      </span>
                      <code className="flex-1 font-mono text-sm text-gray-900">{api.endpoint}</code>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${api.status === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {api.status}
                        </span>
                        <span className="text-gray-500">{api.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Database Management</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
                  <Database className="w-4 h-4" /> Query
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4">Database Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Server className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900">Primary DB</span>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Online</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900">Backup DB</span>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Synced</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                      <Shield className="w-4 h-4" /> Backup Database
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                      <Activity className="w-4 h-4" /> View Query Logs
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                      <Settings className="w-4 h-4" /> Configure Connection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Deployments</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
                  <Rocket className="w-4 h-4" /> Deploy
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { env: 'Production', status: 'Success', time: '2h ago', version: 'v2.3.1' },
                  { env: 'Staging', status: 'Success', time: '1d ago', version: 'v2.3.0' },
                  { env: 'Development', status: 'Pending', time: 'In progress', version: 'v2.4.0-dev' },
                ].map((deploy) => (
                  <div key={deploy.env} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-slate-700" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{deploy.env}</h4>
                          <p className="text-sm text-gray-600">{deploy.version}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        deploy.status === 'Success' ? 'bg-green-100 text-green-800' :
                        deploy.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {deploy.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {deploy.time}
                      </div>
                      <button className="text-slate-700 hover:text-slate-900 font-medium">View Logs</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">System Logs</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Filter</button>
                  <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900">Export</button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 overflow-auto h-96">
                <div className="font-mono text-sm space-y-1">
                  <div className="text-green-400">[2024-05-20 10:30:15] INFO: Server started on port 3000</div>
                  <div className="text-blue-400">[2024-05-20 10:30:20] DEBUG: Database connection established</div>
                  <div className="text-green-400">[2024-05-20 10:30:25] INFO: API endpoints loaded successfully</div>
                  <div className="text-yellow-400">[2024-05-20 10:35:10] WARN: High memory usage detected (85%)</div>
                  <div className="text-green-400">[2024-05-20 10:40:00] INFO: User authenticated: john@example.com</div>
                  <div className="text-blue-400">[2024-05-20 10:45:30] DEBUG: Query executed in 45ms</div>
                  <div className="text-green-400">[2024-05-20 10:50:00] INFO: Deployment completed successfully</div>
                  <div className="text-red-400">[2024-05-20 11:00:00] ERROR: Failed to send email notification</div>
                  <div className="text-green-400">[2024-05-20 11:05:00] INFO: Backup completed successfully</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}