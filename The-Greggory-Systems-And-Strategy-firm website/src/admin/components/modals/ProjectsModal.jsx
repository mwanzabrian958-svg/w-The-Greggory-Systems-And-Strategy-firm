import React, { useState } from 'react';
import { X, FolderKanban, Plus, Search, Filter, Calendar, Users, DollarSign, TrendingUp, Clock, AlertCircle, CheckCircle, Edit, Trash2, FileText, BarChart3, Settings, GitBranch, Target, Award } from 'lucide-react';

export function ProjectsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [projects, setProjects] = useState([
    { id: 1, name: 'Website Redesign', client: 'The-Greggory-Systems-And-Strategy-firm', status: 'In Progress', progress: 65, priority: 'High', budget: 150000, spent: 97500, team: ['Alice', 'Bob'], deadline: '2024-06-15', description: 'Complete overhaul of company website with modern design' },
    { id: 2, name: 'Mobile App Development', client: 'Ministry of Health', status: 'Planning', progress: 25, priority: 'Medium', budget: 450000, spent: 112500, team: ['Carol', 'David'], deadline: '2024-08-30', description: 'Native mobile application for health services' },
    { id: 3, name: 'E-Commerce Platform', client: 'Retail Kenya Ltd', status: 'Review', progress: 90, priority: 'High', budget: 320000, spent: 288000, team: ['Eve', 'Frank'], deadline: '2024-05-30', description: 'Full-stack e-commerce solution with payment integration' },
    { id: 4, name: 'Banking System', client: 'Central Bank', status: 'Completed', progress: 100, priority: 'High', budget: 890000, spent: 845500, team: ['Grace', 'Henry'], deadline: '2024-04-15', description: 'Secure banking system with transaction processing' },
    { id: 5, name: 'Cloud Migration', client: 'Tech Corp', status: 'In Progress', progress: 45, priority: 'Medium', budget: 275000, spent: 123750, team: ['Ian', 'Jane'], deadline: '2024-07-20', description: 'Migration of legacy systems to cloud infrastructure' },
  ]);

  if (!isOpen) return null;

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Planning': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Review': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const columns = {
    'Planning': projects.filter(p => p.status === 'Planning'),
    'In Progress': projects.filter(p => p.status === 'In Progress'),
    'Review': projects.filter(p => p.status === 'Review'),
    'Completed': projects.filter(p => p.status === 'Completed'),
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderKanban className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Project Management</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-gray-50 border-b px-6 flex gap-1">
          <button onClick={() => setActiveTab('kanban')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'kanban' ? 'bg-white border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}>Kanban Board</button>
          <button onClick={() => setActiveTab('list')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'list' ? 'bg-white border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}>Project List</button>
          <button onClick={() => setActiveTab('timeline')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'timeline' ? 'bg-white border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}>Timeline</button>
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'analytics' ? 'bg-white border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}>Analytics</button>
          <button onClick={() => setActiveTab('add')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'add' ? 'bg-white border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}>+ New Project</button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'kanban' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
              {Object.entries(columns).map(([status, statusProjects]) => (
                <div key={status} className="bg-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">{status}</h3>
                    <span className="text-sm text-gray-500">{statusProjects.length}</span>
                  </div>
                  <div className="space-y-3">
                    {statusProjects.map(project => (
                      <div key={project.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{project.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${project.progress}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-3 h-3" />
                            {project.deadline}
                          </div>
                          <div className="flex -space-x-2">
                            {project.team.slice(0, 2).map((member, i) => (
                              <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                                {member[0]}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  <Plus className="w-4 h-4" /> New Project
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Progress</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Budget</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Deadline</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {projects.map(project => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{project.name}</div>
                            <div className="text-xs text-gray-500">{project.description.substring(0, 40)}...</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{project.client}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${project.progress}%` }} />
                            </div>
                            <span className="text-xs font-medium">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          KES {project.budget.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{project.deadline}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-blue-100 rounded transition-colors">
                              <Edit className="w-4 h-4 text-blue-600" />
                            </button>
                            <button className="p-1 hover:bg-red-100 rounded transition-colors">
                              <Trash2 className="w-4 h-4 text-red-600" />
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

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
              <div className="space-y-4">
                {projects.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).map(project => (
                  <div key={project.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${project.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} />
                      <div className="w-0.5 h-full bg-gray-200" />
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          <p className="text-sm text-gray-600">{project.client}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {project.deadline}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {project.progress}% complete
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Project Analytics</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <FolderKanban className="w-5 h-5" />
                    <span className="text-sm opacity-90">Total Projects</span>
                  </div>
                  <div className="text-2xl font-bold">{projects.length}</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm opacity-90">Completed</span>
                  </div>
                  <div className="text-2xl font-bold">{projects.filter(p => p.status === 'Completed').length}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm opacity-90">In Progress</span>
                  </div>
                  <div className="text-2xl font-bold">{projects.filter(p => p.status === 'In Progress').length}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-sm opacity-90">Total Budget</span>
                  </div>
                  <div className="text-2xl font-bold">KES {(projects.reduce((sum, p) => sum + p.budget, 0) / 1000000).toFixed(1)}M</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Project Status Distribution</h4>
                <div className="space-y-3">
                  {Object.entries(columns).map(([status, statusProjects]) => (
                    <div key={status} className="flex items-center gap-4">
                      <div className="w-32 text-sm text-gray-600">{status}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div className="bg-emerald-500 h-4 rounded-full transition-all" style={{ width: `${(statusProjects.length / projects.length) * 100}%` }} />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{statusProjects.length}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Create New Project</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Enter project name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Client name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" rows="3" placeholder="Project description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget (KES)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Lead</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="">Select team lead</option>
                      <option value="Alice">Alice</option>
                      <option value="Bob">Bob</option>
                      <option value="Carol">Carol</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setActiveTab('kanban')} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">Create Project</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}