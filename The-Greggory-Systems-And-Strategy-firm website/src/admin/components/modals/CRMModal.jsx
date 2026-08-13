import React, { useState } from 'react';
import { X, Building2, Users, Phone, Mail, MapPin, Star, Calendar, DollarSign, Plus, Search, Filter, MessageCircle, FileText, TrendingUp, CheckCircle } from 'lucide-react';

export function CRMModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('clients');

  const clients = [
    { id: 1, name: 'Acme Corporation', industry: 'Technology', value: 450000, status: 'Active', contact: 'John Doe', email: 'john@acme.com', phone: '+254 700 123 456', location: 'Nairobi', projects: 3 },
    { id: 2, name: 'Global Solutions Ltd', industry: 'Finance', value: 890000, status: 'Active', contact: 'Jane Smith', email: 'jane@global.com', phone: '+254 700 234 567', location: 'Mombasa', projects: 5 },
    { id: 3, name: 'Tech Innovations', industry: 'Software', value: 320000, status: 'Lead', contact: 'Bob Johnson', email: 'bob@techinnov.com', phone: '+254 700 345 678', location: 'Kisumu', projects: 1 },
    { id: 4, name: 'Future Corp', industry: 'Manufacturing', value: 1200000, status: 'Active', contact: 'Alice Williams', email: 'alice@future.com', phone: '+254 700 456 789', location: 'Eldoret', projects: 8 },
    { id: 5, name: 'StartUp Hub', industry: 'Technology', value: 150000, status: 'Prospect', contact: 'Charlie Brown', email: 'charlie@startup.com', phone: '+254 700 567 890', location: 'Nairobi', projects: 0 },
  ];

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-300';
      case 'Lead': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Prospect': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Inactive': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Client Relationship Management</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-gray-50 border-b px-6 flex gap-1">
          <button onClick={() => setActiveTab('clients')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'clients' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Clients</button>
          <button onClick={() => setActiveTab('pipeline')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'pipeline' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Pipeline</button>
          <button onClick={() => setActiveTab('deals')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'deals' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Deals</button>
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'analytics' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Analytics</button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'clients' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search clients..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" /> Add Client
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Industry</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Value</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Projects</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clients.map(client => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold">
                              {client.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{client.name}</div>
                              <div className="text-xs text-gray-500">{client.contact}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{client.industry}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">KES {client.value.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{client.projects}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{client.location}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-blue-100 rounded transition-colors">
                              <MessageCircle className="w-4 h-4 text-blue-600" />
                            </button>
                            <button className="p-1 hover:bg-green-100 rounded transition-colors">
                              <FileText className="w-4 h-4 text-green-600" />
                            </button>
                            <button className="p-1 hover:bg-purple-100 rounded transition-colors">
                              <Star className="w-4 h-4 text-purple-600" />
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

          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Sales Pipeline</h3>
              
              <div className="grid grid-cols-4 gap-4">
                {[
                  { stage: 'Lead', count: 5, value: 150000, color: 'from-blue-500 to-blue-600' },
                  { stage: 'Qualified', count: 3, value: 450000, color: 'from-yellow-500 to-orange-600' },
                  { stage: 'Proposal', count: 2, value: 890000, color: 'from-purple-500 to-purple-600' },
                  { stage: 'Closed', count: 8, value: 1200000, color: 'from-green-500 to-green-600' },
                ].map((stage) => (
                  <div key={stage.stage} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{stage.stage}</h4>
                      <span className="text-2xl font-bold text-gray-900">{stage.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className={`bg-gradient-to-r ${stage.color} h-2 rounded-full`} style={{ width: `${(stage.count / 18) * 100}%` }} />
                    </div>
                    <div className="text-sm text-gray-600">KES {stage.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Active Deals</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" /> New Deal
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { title: 'Enterprise Software License', value: 450000, probability: 75, stage: 'Proposal', client: 'Global Solutions Ltd', closeDate: '2024-06-30' },
                  { title: 'Website Redesign Project', value: 150000, probability: 90, stage: 'Negotiation', client: 'Acme Corporation', closeDate: '2024-05-30' },
                  { title: 'Mobile App Development', value: 320000, probability: 50, stage: 'Qualified', client: 'Tech Innovations', closeDate: '2024-07-15' },
                ].map((deal) => (
                  <div key={deal.title} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{deal.title}</h4>
                        <p className="text-sm text-gray-600">{deal.client}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">KES {deal.value.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{deal.probability}% probability</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {deal.closeDate}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          deal.stage === 'Negotiation' ? 'bg-orange-100 text-orange-800' :
                          deal.stage === 'Proposal' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {deal.stage}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">View</button>
                        <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">Update</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">CRM Analytics</h3>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5" />
                    <span className="text-sm opacity-90">Total Clients</span>
                  </div>
                  <div className="text-3xl font-bold">{clients.length}</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-sm opacity-90">Total Value</span>
                  </div>
                  <div className="text-3xl font-bold">KES 3.0M</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm opacity-90">Conversion Rate</span>
                  </div>
                  <div className="text-3xl font-bold">24%</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm opacity-90">Active Deals</span>
                  </div>
                  <div className="text-3xl font-bold">12</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Client Distribution by Industry</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Technology', count: 2, percent: 40, color: 'bg-blue-500' },
                    { name: 'Finance', count: 1, percent: 20, color: 'bg-green-500' },
                    { name: 'Software', count: 1, percent: 20, color: 'bg-purple-500' },
                    { name: 'Manufacturing', count: 1, percent: 20, color: 'bg-orange-500' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.percent}%` }} />
                      </div>
                      <div className="w-8 text-sm font-medium text-gray-900">{item.count}</div>
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