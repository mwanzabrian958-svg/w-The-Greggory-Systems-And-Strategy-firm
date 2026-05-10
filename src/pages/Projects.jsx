import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, TrendingUp, Users, Clock, CheckCircle, AlertCircle, Plus, Edit, Eye, FileText, Search } from 'lucide-react'

const Projects = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('projects')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data for display
  const projects = [
    {
      id: 1,
      name: 'Community Center Renovation',
      description: 'Renovation of the main community center with updated facilities',
      status: 'active',
      progress: 65,
      startDate: '2024-01-15',
      expectedCompletion: '2024-06-30',
      budget: 150000,
      spent: 97500,
      team: ['John Doe', 'Jane Smith', 'Mike Johnson']
    },
    {
      id: 2,
      name: 'Youth Sports Program',
      description: 'Development of comprehensive youth sports facilities and programs',
      status: 'active',
      progress: 40,
      startDate: '2024-02-01',
      expectedCompletion: '2024-08-15',
      budget: 85000,
      spent: 34000,
      team: ['Sarah Wilson', 'Tom Brown']
    },
    {
      id: 3,
      name: 'Educational Scholarship Fund',
      description: 'Scholarship program for underprivileged students',
      status: 'completed',
      progress: 100,
      startDate: '2023-09-01',
      expectedCompletion: '2024-01-31',
      budget: 50000,
      spent: 48500,
      team: ['Emily Davis', 'Robert Lee']
    }
  ]

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    pending: projects.filter(p => p.status === 'pending').length
  }

  const handleRequestNewProject = () => {
    alert('Project request functionality will be implemented here.')
  }

  const handleEditProject = (projectId) => {
    alert(`Edit project functionality will be implemented here for project ${projectId}`)
  }

  // Filter projects based on search term
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-blue-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h1>
          <p className="text-gray-600 mb-8">Please log in to view your projects and activities.</p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Log In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.first_name || user?.name || 'User'}!
              </h1>
              <p className="text-gray-600">
                Here's an overview of your projects and recent activities
              </p>
            </div>
          </div>
          
          {/* Search Box */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-semibold text-gray-900">{projectStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-semibold text-gray-900">{projectStats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{projectStats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{projectStats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activities
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Your projects will appear here once they\'re assigned to you.'}
                </p>
                {!searchTerm && (
                  <button 
                    onClick={handleRequestNewProject}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 inline-flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Request New Project
                  </button>
                )}
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        <p className="text-gray-600 mt-1">{project.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-medium">{project.startDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Expected Completion</p>
                        <p className="font-medium">{project.expectedCompletion}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Team Size</p>
                        <p className="font-medium">{project.team.length} members</p>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Budget</p>
                        <p className="font-medium">${project.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Spent</p>
                        <p className="font-medium">${project.spent.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleEditProject(project.id)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-300"
                      >
                        Edit Project
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-4">
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-400 mb-4">
                <Clock className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Activities Coming Soon</h3>
              <p className="text-gray-600">
                This section is currently under development. Check back later.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Projects
