import React, { useState } from 'react';
import { X, BarChart3, TrendingUp, Users, DollarSign, Activity, Eye, Calendar, Filter, Download, RefreshCw, ArrowUp, ArrowDown, Minus } from 'lucide-react';

export function AnalyticsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');

  if (!isOpen) return null;

  const metrics = [
    { name: 'Total Users', value: '2,456', change: 12, icon: Users },
    { name: 'Active Projects', value: '34', change: 8, icon: BarChart3 },
    { name: 'Revenue', value: 'KES 1.2M', change: 23, icon: DollarSign },
    { name: 'Page Views', value: '45.6K', change: -5, icon: Eye },
  ];

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowUp className="w-4 h-4" />;
    if (change < 0) return <ArrowDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-3 py-1.5 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none">
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 border-b px-6 flex gap-1">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'overview' ? 'bg-white border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Overview</button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'users' ? 'bg-white border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>User Analytics</button>
          <button onClick={() => setActiveTab('projects')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'projects' ? 'bg-white border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Project Analytics</button>
          <button onClick={() => setActiveTab('revenue')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'revenue' ? 'bg-white border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Revenue</button>
          <button onClick={() => setActiveTab('traffic')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'traffic' ? 'bg-white border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Traffic</button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.name} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor(metric.change)}`}>
                          {getChangeIcon(metric.change)}
                          {Math.abs(metric.change)}%
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                      <div className="text-sm text-gray-600 mt-1">{metric.name}</div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Traffic Overview</h3>
                  <div className="space-y-3">
                    {['Direct', 'Organic Search', 'Social Media', 'Referral', 'Email'].map((source, i) => (
                      <div key={source} className="flex items-center gap-4">
                        <div className="w-32 text-sm text-gray-600">{source}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div className="bg-indigo-600 h-3 rounded-full" style={{ width: `${100 - i * 15}%` }} />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{100 - i * 15}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">User Activity</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'New Users', value: 234, color: 'bg-green-500' },
                      { name: 'Returning Users', value: 456, color: 'bg-blue-500' },
                      { name: 'Active Sessions', value: 89, color: 'bg-purple-500' },
                      { name: 'Page Views', value: '2.3K', color: 'bg-orange-500' },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">User Analytics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-600 mb-2">Total Users</div>
                  <div className="text-3xl font-bold text-gray-900">2,456</div>
                  <div className="text-sm text-green-600 mt-1">↑ 12% from last period</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-600 mb-2">New Users (30d)</div>
                  <div className="text-3xl font-bold text-gray-900">345</div>
                  <div className="text-sm text-green-600 mt-1">↑ 8% from last period</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-600 mb-2">Active Users</div>
                  <div className="text-3xl font-bold text-gray-900">1,234</div>
                  <div className="text-sm text-red-600 mt-1">↓ 3% from last period</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">User Growth Trend</h4>
                <div className="h-64 bg-gradient-to-t from-indigo-50 to-white rounded-lg flex items-end justify-around p-4">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
                    <div key={month} className="flex flex-col items-center gap-2">
                      <div
                        className="w-12 bg-indigo-600 rounded-t-lg transition-all hover:bg-indigo-700"
                        style={{ height: `${40 + i * 15}%` }}
                      />
                      <div className="text-xs text-gray-600">{month}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Project Analytics</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { name: 'Total Projects', value: 34, change: 8 },
                  { name: 'Completed', value: 23, change: 15 },
                  { name: 'In Progress', value: 8, change: -5 },
                  { name: 'On Hold', value: 3, change: 0 },
                ].map((item) => (
                  <div key={item.name} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-600 mb-2">{item.name}</div>
                    <div className="text-3xl font-bold text-gray-900">{item.value}</div>
                    <div className={`text-sm mt-1 ${getChangeColor(item.change)}`}>
                      {getChangeIcon(item.change)} {Math.abs(item.change)}%
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Project Status Distribution</h4>
                <div className="flex items-center gap-8">
                  <div className="flex-1">
                    {[
                      { name: 'Planning', value: 5, color: 'bg-purple-500' },
                      { name: 'In Progress', value: 8, color: 'bg-blue-500' },
                      { name: 'Review', value: 4, color: 'bg-orange-500' },
                      { name: 'Completed', value: 17, color: 'bg-green-500' },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center gap-4 mb-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <div className="w-24 text-sm text-gray-600">{item.name}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div className={`${item.color} h-3 rounded-full`} style={{ width: `${(item.value / 34) * 100}%` }} />
                        </div>
                        <div className="w-8 text-sm font-medium text-gray-900">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'Total Revenue', value: 'KES 4.5M', change: 23 },
                  { name: 'This Month', value: 'KES 890K', change: 15 },
                  { name: 'Avg. Project Value', value: 'KES 132K', change: 8 },
                ].map((item) => (
                  <div key={item.name} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-600 mb-2">{item.name}</div>
                    <div className="text-3xl font-bold text-gray-900">{item.value}</div>
                    <div className={`text-sm mt-1 ${getChangeColor(item.change)}`}>
                      {getChangeIcon(item.change)} {Math.abs(item.change)}%
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Revenue by Project Type</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Web Development', value: 'KES 1.8M', percent: 40 },
                    { name: 'Mobile Apps', value: 'KES 1.2M', percent: 27 },
                    { name: 'Consulting', value: 'KES 900K', percent: 20 },
                    { name: 'Maintenance', value: 'KES 600K', percent: 13 },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className="w-40 text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div className="bg-green-500 h-4 rounded-full" style={{ width: `${item.percent}%` }} />
                      </div>
                      <div className="w-24 text-sm font-medium text-gray-900">{item.value}</div>
                      <div className="w-12 text-sm text-gray-600">{item.percent}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'traffic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Traffic Analytics</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { name: 'Page Views', value: '45.6K', change: 12 },
                  { name: 'Unique Visitors', value: '23.4K', change: 8 },
                  { name: 'Bounce Rate', value: '34%', change: -5 },
                  { name: 'Avg. Session', value: '4:32', change: 15 },
                ].map((item) => (
                  <div key={item.name} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-600 mb-2">{item.name}</div>
                    <div className="text-3xl font-bold text-gray-900">{item.value}</div>
                    <div className={`text-sm mt-1 ${getChangeColor(item.change)}`}>
                      {getChangeIcon(item.change)} {Math.abs(item.change)}%
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Top Pages</h4>
                <div className="space-y-3">
                  {[
                    { page: '/home', views: 12345, change: 15 },
                    { page: '/projects', views: 8765, change: 23 },
                    { page: '/about', views: 6543, change: -8 },
                    { page: '/services', views: 5432, change: 12 },
                    { page: '/contact', views: 4321, change: 5 },
                  ].map((item) => (
                    <div key={item.page} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 font-medium text-gray-900">{item.page}</div>
                      <div className="text-sm text-gray-600">{item.views.toLocaleString()} views</div>
                      <div className={`text-sm font-medium ${getChangeColor(item.change)}`}>
                        {getChangeIcon(item.change)} {Math.abs(item.change)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t px-6 py-4 flex justify-between items-center bg-gray-50">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}