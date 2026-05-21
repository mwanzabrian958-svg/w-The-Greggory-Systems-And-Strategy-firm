import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Key, Eye, EyeOff, AlertTriangle, CheckCircle, Users, Activity, Smartphone, Mail, Globe, Shield, Clock } from 'lucide-react';

export function SecurityModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Security Center</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-gray-50 border-b px-6 flex gap-1">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'overview' ? 'bg-white border-b-2 border-red-600 text-red-600' : 'text-gray-600 hover:text-gray-900'}`}>Overview</button>
          <button onClick={() => setActiveTab('authentication')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'authentication' ? 'bg-white border-b-2 border-red-600 text-red-600' : 'text-gray-600 hover:text-gray-900'}`}>Authentication</button>
          <button onClick={() => setActiveTab('permissions')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'permissions' ? 'bg-white border-b-2 border-red-600 text-red-600' : 'text-gray-600 hover:text-gray-900'}`}>Permissions</button>
          <button onClick={() => setActiveTab('audit')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'audit' ? 'bg-white border-b-2 border-red-600 text-red-600' : 'text-gray-600 hover:text-gray-900'}`}>Audit Log</button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm opacity-90">Security Score</span>
                  </div>
                  <div className="text-3xl font-bold">92%</div>
                  <div className="text-sm opacity-75 mt-1">Excellent</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="text-sm opacity-90">Active Users</span>
                  </div>
                  <div className="text-3xl font-bold">24</div>
                  <div className="text-sm opacity-75 mt-1">Online now</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm opacity-90">Threats Blocked</span>
                  </div>
                  <div className="text-3xl font-bold">156</div>
                  <div className="text-sm opacity-75 mt-1">Last 30 days</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5" />
                    <span className="text-sm opacity-90">Failed Logins</span>
                  </div>
                  <div className="text-3xl font-bold">12</div>
                  <div className="text-sm opacity-75 mt-1">Last 7 days</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Security Recommendations</h4>
                <div className="space-y-3">
                  {[
                    { title: 'Enable Two-Factor Authentication', status: 'completed', icon: CheckCircle },
                    { title: 'Update SSL Certificate', status: 'warning', icon: AlertTriangle },
                    { title: 'Review User Permissions', status: 'completed', icon: CheckCircle },
                    { title: 'Security Audit Due', status: 'pending', icon: Clock },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Icon className={`w-5 h-5 ${item.status === 'completed' ? 'text-green-600' : item.status === 'warning' ? 'text-orange-600' : 'text-blue-600'}`} />
                        <span className="flex-1 font-medium text-gray-900">{item.title}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'warning' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'authentication' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Authentication Settings</h3>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">SMS Verification</h4>
                    <p className="text-sm text-gray-600">Send codes via SMS</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Verification</h4>
                    <p className="text-sm text-gray-600">Send codes via email</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Password Policy</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Length</label>
                    <input type="number" defaultValue="8" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-gray-700">Require uppercase letters</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-gray-700">Require numbers</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-gray-700">Require special characters</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Permission Management</h3>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Role Permissions</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Permission</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Admin</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Developer</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">User</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {['View Dashboard', 'Manage Users', 'Manage Projects', 'View Reports', 'System Admin', 'Financial Access'].map((perm) => (
                        <tr key={perm}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{perm}</td>
                          <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked className="rounded" /></td>
                          <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked={perm === 'View Dashboard' || perm === 'Manage Projects'} className="rounded" /></td>
                          <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked={perm === 'View Dashboard'} className="rounded" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Audit Log</h3>
              
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {[
                    { action: 'User login successful', user: 'John Doe', time: '2 min ago', ip: '192.168.1.1', status: 'success' },
                    { action: 'Failed login attempt', user: 'Unknown', time: '5 min ago', ip: '192.168.1.100', status: 'danger' },
                    { action: 'Password changed', user: 'Jane Smith', time: '15 min ago', ip: '192.168.1.2', status: 'success' },
                    { action: 'Role updated', user: 'Admin', time: '1 hour ago', ip: '192.168.1.1', status: 'warning' },
                    { action: 'API key generated', user: 'Bob Johnson', time: '2 hours ago', ip: '192.168.1.3', status: 'success' },
                  ].map((log, i) => (
                    <div key={i} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            log.status === 'success' ? 'bg-green-100 text-green-600' :
                            log.status === 'danger' ? 'bg-red-100 text-red-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {log.status === 'success' ? <CheckCircle className="w-4 h-4" /> :
                             log.status === 'danger' ? <AlertTriangle className="w-4 h-4" /> :
                             <Shield className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{log.action}</p>
                            <p className="text-sm text-gray-600">User: {log.user}</p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-600">{log.time}</p>
                          <p className="text-gray-500">{log.ip}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}