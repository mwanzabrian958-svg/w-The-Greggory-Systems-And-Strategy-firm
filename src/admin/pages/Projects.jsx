import React, { useState, useEffect } from "react";
import { FolderKanban, Plus, Search, Edit2, Trash2, Calendar, User, DollarSign, Clock, MoreVertical, Filter, TrendingUp, AlertCircle, CheckCircle, XCircle, Target, FileText, MessageSquare, Star, Flag, LayoutDashboard, BarChart3 } from "lucide-react";
import { API_BASE_URL } from "../../services/api";

const API_URL = import.meta.env.VITE_API_URL || API_BASE_URL;

export function Projects({ user }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("kanban"); // kanban, list, timeline
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("gf_admin_session")?.token;
      const response = await fetch(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || data || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      // Mock data for demo
      setProjects([
        {
          id: 1,
          name: "NGO Website Redesign",
          client: "Community Foundation",
          status: "in-progress",
          priority: "high",
          budget: 45000,
          spent: 32000,
          progress: 75,
          team: ["Alice", "Bob", "Carol"],
          deadline: "2024-03-15",
          description: "Complete website overhaul with modern design and improved UX"
        },
        {
          id: 2,
          name: "Fundraising Campaign Platform",
          client: "Education Initiative",
          status: "planning",
          priority: "high",
          budget: 28000,
          spent: 5000,
          progress: 20,
          team: ["David", "Eve"],
          deadline: "2024-04-01",
          description: "Build fundraising platform with donation processing and donor management"
        },
        {
          id: 3,
          name: "Volunteer Portal",
          client: "Youth Organization",
          status: "review",
          priority: "medium",
          budget: 35000,
          spent: 33000,
          progress: 95,
          team: ["Frank", "Grace"],
          deadline: "2024-02-28",
          description: "Create volunteer management system with scheduling and tracking"
        },
        {
          id: 4,
          name: "Mobile App Development",
          client: "Health Care Network",
          status: "completed",
          priority: "high",
          budget: 85000,
          spent: 82000,
          progress: 100,
          team: ["Henry", "Iris", "Jack"],
          deadline: "2024-01-15",
          description: "Cross-platform mobile app for patient management"
        },
        {
          id: 5,
          name: "Data Analytics Dashboard",
          client: "Financial Services",
          status: "in-progress",
          priority: "medium",
          budget: 52000,
          spent: 28000,
          progress: 55,
          team: ["Kate", "Leo"],
          deadline: "2024-03-30",
          description: "Real-time analytics dashboard with custom reports"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: "planning", title: "Planning", color: "bg-yellow-500" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-500" },
    { id: "review", title: "Review", color: "bg-purple-500" },
    { id: "completed", title: "Completed", color: "bg-green-500" }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-300";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "low": return "bg-green-100 text-green-700 border-green-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProjectsByColumn = (columnId) => {
    return filteredProjects.filter(p => p.status === columnId);
  };

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-600 mt-1">Manage projects, track progress, and coordinate teams</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Projects</p>
              <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
            </div>
            <div className="bg-blue-100 rounded-xl p-3">
              <FolderKanban className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{projects.filter(p => p.status === "in-progress").length}</p>
            </div>
            <div className="bg-blue-100 rounded-xl p-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Budget</p>
              <p className="text-2xl font-bold text-green-600">${(totalBudget / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-green-100 rounded-xl p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Avg Progress</p>
              <p className="text-2xl font-bold text-purple-600">{avgProgress}%</p>
            </div>
            <div className="bg-purple-100 rounded-xl p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === "kanban" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === "list" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(column => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className="bg-slate-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                    <h3 className="font-semibold text-slate-900">{column.title}</h3>
                    <span className="text-sm text-slate-600">({getProjectsByColumn(column.id).length})</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {getProjectsByColumn(column.id).map(project => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                        <button className="p-1 rounded hover:bg-slate-100 transition-colors">
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </button>
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-1">{project.name}</h4>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{project.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Progress</span>
                          <span className="font-medium text-slate-900">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600 mt-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(project.deadline).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {project.team.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Deadline</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProjects.map(project => (
                <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{project.name}</p>
                      <p className="text-sm text-slate-600 truncate max-w-xs">{project.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{project.client}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      project.status === "completed" ? "bg-green-100 text-green-700 border-green-300" :
                      project.status === "in-progress" ? "bg-blue-100 text-blue-700 border-blue-300" :
                      project.status === "review" ? "bg-purple-100 text-purple-700 border-purple-300" :
                      "bg-yellow-100 text-yellow-700 border-yellow-300"
                    }`}>
                      {project.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">${project.budget.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {project.team.slice(0, 3).map((member, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                          {member[0]}
                        </div>
                      ))}
                      {project.team.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 text-xs font-medium border-2 border-white">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{new Date(project.deadline).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <Edit2 className="h-4 w-4 text-slate-600" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedProject.name}</h2>
                  <p className="text-slate-600 mt-1">{selectedProject.client}</p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <XCircle className="h-6 w-6 text-slate-600" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-600">{selectedProject.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <p className="font-semibold text-slate-900 capitalize">{selectedProject.status.replace("-", " ")}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-600 mb-1">Priority</p>
                  <p className="font-semibold text-slate-900 capitalize">{selectedProject.priority}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-600 mb-1">Budget</p>
                  <p className="font-semibold text-green-600">${selectedProject.budget.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-600 mb-1">Spent</p>
                  <p className="font-semibold text-slate-900">${selectedProject.spent.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-600 mb-1">Progress</p>
                  <p className="font-semibold text-slate-900">{selectedProject.progress}%</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-600 mb-1">Deadline</p>
                  <p className="font-semibold text-slate-900">{new Date(selectedProject.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Team Members</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.team.map((member, i) => (
                    <div key={i} className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                        {member[0]}
                      </div>
                      <span className="text-slate-900 font-medium">{member}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all">
                  <Edit2 className="h-4 w-4" />
                  Edit Project
                </button>
                <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  Message Team
                </button>
                <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                  <FileText className="h-4 w-4" />
                  View Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Create New Project</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <XCircle className="h-6 w-6 text-slate-600" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Client</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Describe the project"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Budget</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Deadline</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all">
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}