import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, TrendingUp, Users, Clock, CheckCircle, AlertCircle, Plus, Edit, Trash2, Eye, FileText, Download, DollarSign, Receipt, X } from 'lucide-react'

const Projects = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('projects')
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0
  })
  const [projectDocuments, setProjectDocuments] = useState({})
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)

  const handleRequestNewProject = () => {
    // Navigate to project request form or show modal
    alert('Project request functionality will be implemented here. This would open a form to request a new project.')
    // In a real implementation, this would navigate to a project request form
    // navigate('/request-project')
  }

  const handleEditProject = (projectId) => {
    // Navigate to edit project page or show modal
    alert(`Edit project functionality will be implemented here for project ${projectId}`)
    // In a real implementation, this would navigate to an edit form
    // navigate(`/projects/${projectId}/edit`)
  }

  const fetchProjectDocuments = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/documents`)
      const data = await response.json()
      
      if (data.success) {
        setProjectDocuments(prev => ({
          ...prev,
          [projectId]: data.documents
        }))
      } else {
        console.error('Failed to fetch project documents:', data.message)
        setProjectDocuments(prev => ({
          ...prev,
          [projectId]: []
        }))
      }
    } catch (error) {
      console.error('Error fetching project documents:', error)
      setProjectDocuments(prev => ({
        ...prev,
        [projectId]: []
      }))
    }
  }

  const handleViewDocuments = (project) => {
    setSelectedProject(project)
    setShowDocumentModal(true)
    if (!projectDocuments[project.id]) {
      fetchProjectDocuments(project.id)
    }
  }

  const handleDownloadDocument = async (document, buttonElement) => {
    try {
      // Show loading state
      const originalText = buttonElement.innerHTML
      buttonElement.innerHTML = '<span class="animate-spin">...</span> Downloading'
      buttonElement.disabled = true
      
      const response = await fetch(`/api/documents/generate/${document.type}/${document.id}`, {
        method: 'POST'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${document.type}-${document.invoice_number || document.quote_number || document.transaction_id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        // Show success feedback
        buttonElement.innerHTML = 'Downloaded!'
        setTimeout(() => {
          buttonElement.innerHTML = originalText
          buttonElement.disabled = false
        }, 2000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to download document')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      // Show error feedback
      buttonElement.innerHTML = 'Error!'
      setTimeout(() => {
        buttonElement.innerHTML = originalText
        buttonElement.disabled = false
      }, 2000)
      alert(`Error downloading document: ${error.message}`)
    }
  }

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'invoice':
        return FileText
      case 'quote':
        return FileText
      case 'receipt':
        return Receipt
      default:
        return FileText
    }
  }

  const getDocumentTypeLabel = (type) => {
    switch (type) {
      case 'invoice':
        return 'Invoice'
      case 'quote':
        return 'Quote'
      case 'receipt':
        return 'Payment Receipt'
      default:
        return 'Document'
    }
  }

  const getDocumentStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'accepted':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'sent':
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
      case 'expired':
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProjects()
    }
  }, [isAuthenticated, user])

  const fetchUserProjects = async () => {
    try {
      setLoading(true)
      // Fetch user-specific projects from API
      const response = await fetch(`/api/users/projects?userId=${user.id || user.userId}`)
      const data = await response.json()
      
      if (data.success) {
        // Fetch photos for each project
        const projectsWithPhotos = await Promise.all(
          data.projects.map(async (project) => {
            try {
              const photoResponse = await fetch(`/api/projects/${project.id}/photos`)
              const photoData = await photoResponse.json()
              
              if (photoData.success && photoData.photos.length > 0) {
                // Set main photo (first featured or first photo)
                const featuredPhoto = photoData.photos.find(p => p.isFeatured)
                const mainPhoto = featuredPhoto || photoData.photos[0]
                
                return {
                  ...project,
                  mainPhoto: mainPhoto.dataUrl || mainPhoto.url,
                  photos: photoData.photos
                }
              }
              
              return {
                ...project,
                photos: []
              }
            } catch (error) {
              console.error(`Failed to fetch photos for project ${project.id}:`, error)
              return {
                ...project,
                photos: []
              }
            }
          })
        )
        
        setProjects(projectsWithPhotos)
        
        // Calculate stats
        const stats = {
          total: projectsWithPhotos.length,
          active: projectsWithPhotos.filter(p => p.status === 'active').length,
          completed: projectsWithPhotos.filter(p => p.status === 'completed').length,
          pending: projectsWithPhotos.filter(p => p.status === 'pending').length
        }
        setProjectStats(stats)
      } else {
        console.error('Failed to fetch projects:', data.message)
        // Fallback to mock data if API fails
        setProjects([])
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      // Fallback to mock data
      const mockProjects = [
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
          team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
          mainPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A',
          photos: [
            { type: 'progress', dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A', title: 'Foundation Work' },
            { type: 'progress', dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A', title: 'Framework Installation' },
            { type: 'screenshot', dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A', title: 'Project Dashboard' }
          ],
          activities: [
            { type: 'update', message: 'Foundation work completed', date: '2024-03-15', user: 'John Doe' },
            { type: 'milestone', message: '65% completion reached', date: '2024-03-20', user: 'Jane Smith' },
            { type: 'alert', message: 'Budget adjustment needed', date: '2024-03-22', user: 'Mike Johnson' }
          ]
        },
        {
          id: 2,
          name: 'Youth Sports Program',
          description: 'Development of comprehensive youth sports facilities and programs',
          status: 'active',
          progress: 40,
          startDate: '2024-02-01',
          mainPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A',
          photos: [
            { type: 'site', dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A', title: 'Site Preparation' },
            { type: 'progress', dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A', title: 'Field Construction' }
          ],
          expectedCompletion: '2024-08-15',
          budget: 85000,
          spent: 34000,
          team: ['Sarah Wilson', 'Tom Brown'],
          activities: [
            { type: 'update', message: 'Equipment procurement started', date: '2024-03-10', user: 'Sarah Wilson' },
            { type: 'milestone', message: '40% completion achieved', date: '2024-03-18', user: 'Tom Brown' }
          ]
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
          team: ['Emily Davis', 'Robert Lee'],
          mainPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A',
          photos: [
            { type: 'completion', dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A', title: 'Scholarship Awards Ceremony' },
            { type: 'team', dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A', title: 'Project Team' },
            { type: 'document', dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A', title: 'Certificate Distribution' }
          ],
          activities: [
            { type: 'update', message: 'Final scholarship awards distributed', date: '2024-01-25', user: 'Emily Davis' },
            { type: 'milestone', message: 'Project completed successfully', date: '2024-01-31', user: 'Robert Lee' }
          ]
        }
      ]
      setProjects(mockProjects)
      
      // Calculate stats
      const stats = {
        total: mockProjects.length,
        active: mockProjects.filter(p => p.status === 'active').length,
        completed: mockProjects.filter(p => p.status === 'completed').length,
        pending: mockProjects.filter(p => p.status === 'pending').length
      }
      setProjectStats(stats)
    } finally {
      setLoading(false)
    }
  }

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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'update': return <Edit className="w-4 h-4 text-blue-500" />
      case 'milestone': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'alert': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name || user?.name || 'User'}!
          </h1>
          <p className="text-gray-600">
            Here's an overview of your projects and recent activities
          </p>
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
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-r-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your projects...</p>
          </div>
        ) : (
          <>
            {activeTab === 'projects' && (
              <div className="space-y-6">
                {projects.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <div className="text-gray-400 mb-4">
                      <Calendar className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-600 mb-6">
                      Your projects will appear here once they're assigned to you.
                    </p>
                    <button 
                      onClick={handleRequestNewProject}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 inline-flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Request New Project
                    </button>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
                      {/* Project Photo Section */}
                      <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                        {project.mainPhoto ? (
                          <img 
                            src={project.mainPhoto} 
                            alt={project.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.classList.add('bg-gradient-to-br', 'from-blue-100', 'to-blue-200');
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <div className="text-center">
                              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                              <p className="text-blue-600 font-medium">No Photo Available</p>
                            </div>
                          </div>
                        )}
                        {/* Photo Overlay */}
                        <div className="absolute top-2 right-2">
                          <button 
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="bg-white bg-opacity-90 text-gray-700 p-2 rounded-lg hover:bg-opacity-100 transition duration-200"
                            title="View Project Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Status Badge */}
                        <div className="absolute top-2 left-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} bg-opacity-90`}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                            <p className="text-gray-600 mt-1">{project.description}</p>
                          </div>
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

                        {/* Documents Section */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900 flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              Accounting Documents
                            </h4>
                            <button
                              onClick={() => handleViewDocuments(project)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View All
                            </button>
                          </div>
                          <div className="flex gap-2">
                            {projectDocuments[project.id]?.slice(0, 3).map((doc) => {
                              const Icon = getDocumentIcon(doc.type)
                              return (
                                <div key={doc.id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                                  <Icon className="w-4 h-4 text-gray-600" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 truncate">
                                      {getDocumentTypeLabel(doc.type)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {doc.invoice_number || doc.quote_number || doc.transaction_id}
                                    </p>
                                  </div>
                                  <span className={`px-1 py-0.5 text-xs rounded-full ${getDocumentStatusColor(doc.status)}`}>
                                    {doc.status}
                                  </span>
                                </div>
                              )
                            })}
                            {(!projectDocuments[project.id] || projectDocuments[project.id].length === 0) && (
                              <div className="text-gray-500 text-sm">No documents available</div>
                            )}
                            {projectDocuments[project.id]?.length > 3 && (
                              <div className="text-gray-500 text-sm">+{projectDocuments[project.id].length - 3} more</div>
                            )}
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
                          <button 
                            onClick={() => handleViewDocuments(project)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300 flex items-center"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Documents
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
                {projects.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <div className="text-gray-400 mb-4">
                      <Clock className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
                    <p className="text-gray-600">
                      Your project activities will appear here once you have projects.
                    </p>
                  </div>
                ) : (
                  projects.flatMap(project => 
                    project.activities.map((activity, index) => (
                      <div key={`${project.id}-${index}`} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm text-gray-900">{activity.message}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {activity.date} â¢ {activity.user}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              activity.type === 'update' ? 'bg-blue-100 text-blue-800' :
                              activity.type === 'milestone' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Document Modal */}
      {showDocumentModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto m-4">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedProject.name} - Accounting Documents
                </h3>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Project Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Project Status</p>
                    <p className="font-medium capitalize">{selectedProject.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="font-medium">{selectedProject.progress}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-medium">${selectedProject.budget.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Documents List */}
              <div className="space-y-4">
                {projectDocuments[selectedProject.id]?.length > 0 ? (
                  projectDocuments[selectedProject.id].map((document) => {
                    const Icon = getDocumentIcon(document.type)
                    return (
                      <div key={document.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <Icon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">
                                  {getDocumentTypeLabel(document.type)}
                                </h4>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDocumentStatusColor(document.status)}`}>
                                  {document.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {document.invoice_number || document.quote_number || document.transaction_id}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Date</p>
                                  <p className="font-medium">
                                    {document.issue_date || document.transaction_date || document.created_at}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Amount</p>
                                  <p className="font-medium">
                                    KES {parseFloat(document.total_amount_kes || document.amount || 0).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              {document.description && (
                                <p className="text-sm text-gray-600 mt-2">{document.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleDownloadDocument(document, e.target)}
                              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents available</h3>
                    <p className="text-gray-600">
                      Accounting documents for this project will appear here once they are generated.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects
