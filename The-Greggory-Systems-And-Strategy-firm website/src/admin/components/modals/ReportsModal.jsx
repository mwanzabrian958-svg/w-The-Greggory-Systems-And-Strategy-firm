import React, { useState } from 'react';
import { X, FileText, Plus, Search, Download, Calendar, Filter, BarChart3, PieChart, TrendingUp, FileSpreadsheet, Printer, Share2, Eye } from 'lucide-react';

export function ReportsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('templates');
  const [searchTerm, setSearchTerm] = useState('');

  const reportTemplates = [
    { id: 1, name: 'Monthly Revenue Report', category: 'Financial', description: 'Detailed breakdown of monthly revenue', icon: BarChart3 },
    { id: 2, name: 'Project Status Report', category: 'Projects', description: 'Current status of all active projects', icon: TrendingUp },
    { id: 3, name: 'User Activity Report', category: 'Users', description: 'User engagement and activity metrics', icon: PieChart },
    { id: 4, name: 'Performance Report', category: 'Analytics', description: 'System performance and uptime metrics', icon: BarChart3 },
    { id: 5, name: 'Sales Report', category: 'Financial', description: 'Sales performance and conversion rates', icon: TrendingUp },
    { id: 6, name: 'Custom Report', category: 'Custom', description: 'Create your own custom report', icon: FileSpreadsheet },
  ];

  const recentReports = [
    { id: 1, name: 'Q1 Revenue Report', generated: '2024-04-15', format: 'PDF', size: '2.4 MB', author: 'Admin' },
    { id: 2, name: 'March Project Status', generated: '2024-04-01', format: 'Excel', size: '1.8 MB', author: 'Jane Doe' },
    { id: 3, name: 'User Analytics Q1', generated: '2024-03-31', format: 'PDF', size: '3.2 MB', author: 'Admin' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Reports & Analytics</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-gray-50 border-b px-6 flex gap-1">
          <button onClick={() => setActiveTab('templates')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'templates' ? 'bg-white border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600 hover:text-gray-900'}`}>Templates</button>
          <button onClick={() => setActiveTab('recent')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'recent' ? 'bg-white border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600 hover:text-gray-900'}`}>Recent Reports</button>
          <button onClick={() => setActiveTab('scheduled')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'scheduled' ? 'bg-white border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600 hover:text-gray-900'}`}>Scheduled Reports</button>
          <button onClick={() => setActiveTab('builder')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'builder' ? 'bg-white border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600 hover:text-gray-900'}`}>Report Builder</button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                  <Plus className="w-4 h-4" /> Create Template
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {reportTemplates.map(template => {
                  const Icon = template.icon;
                  return (
                    <div key={template.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-cyan-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <span className="text-xs font-medium text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">{template.category}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                    <Plus className="w-4 h-4" /> Generate Report
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Report Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Generated</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Format</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Author</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentReports.map(report => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{report.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{report.generated}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{report.format}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{report.size}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{report.author}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-blue-100 rounded transition-colors">
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <button className="p-1 hover:bg-green-100 rounded transition-colors">
                              <Download className="w-4 h-4 text-green-600" />
                            </button>
                            <button className="p-1 hover:bg-purple-100 rounded transition-colors">
                              <Share2 className="w-4 h-4 text-purple-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'scheduled' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Scheduled Reports</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                  <Plus className="w-4 h-4" /> Schedule Report
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Weekly Revenue Summary', frequency: 'Weekly', nextRun: '2024-05-27', status: 'Active' },
                  { name: 'Monthly Project Status', frequency: 'Monthly', nextRun: '2024-06-01', status: 'Active' },
                  { name: 'Quarterly Analytics', frequency: 'Quarterly', nextRun: '2024-07-01', status: 'Active' },
                  { name: 'Annual Performance', frequency: 'Yearly', nextRun: '2025-01-01', status: 'Paused' },
                ].map((scheduled) => (
                  <div key={scheduled.name} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{scheduled.name}</h4>
                        <p className="text-sm text-gray-600">{scheduled.frequency}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${scheduled.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {scheduled.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Next: {scheduled.nextRun}
                      </div>
                      <button className="text-cyan-600 hover:text-cyan-700 font-medium">Configure</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'builder' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Report Builder</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Data Source</h4>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                    <option value="">Select data source</option>
                    <option value="projects">Projects</option>
                    <option value="users">Users</option>
                    <option value="revenue">Revenue</option>
                    <option value="analytics">Analytics</option>
                  </select>

                  <h4 className="font-medium text-gray-900">Date Range</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                    <input type="date" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                  </div>

                  <h4 className="font-medium text-gray-900">Filters</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-600">Include archived data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-600">Show trends</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Chart Type</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Bar Chart', 'Line Chart', 'Pie Chart', 'Table'].map((type) => (
                      <button key={type} className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                        {type}
                      </button>
                    ))}
                  </div>

                  <h4 className="font-medium text-gray-900">Columns</h4>
                  <div className="space-y-2">
                    {['Date', 'Revenue', 'Users', 'Projects'].map((col) => (
                      <div key={col} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm text-gray-700">{col}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Output Format</h4>
                  <div className="space-y-2">
                    {['PDF', 'Excel', 'CSV', 'HTML'].map((format) => (
                      <button key={format} className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors text-left">
                        {format}
                      </button>
                    ))}
                  </div>

                  <h4 className="font-medium text-gray-900">Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                      <BarChart3 className="w-4 h-4" /> Generate Preview
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Printer className="w-4 h-4" /> Print Report
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Share2 className="w-4 h-4" /> Share Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}