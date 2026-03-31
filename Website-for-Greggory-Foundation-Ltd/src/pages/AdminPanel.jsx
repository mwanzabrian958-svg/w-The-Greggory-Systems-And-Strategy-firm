import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { contentAPI } from '../services/api'
import { LogOut, Plus, Edit, Trash2, Save, Home, FileText, Briefcase } from 'lucide-react'

const AdminPanel = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('blog')
  const [blogPosts, setBlogPosts] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [showBlogForm, setShowBlogForm] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    serviceTitle: '',
    serviceDescription: ''
  })

  useEffect(() => {
    // Check if user is logged in and has admin role
    if (!user) {
      // User not logged in - redirect to login
      navigate('/login')
      return
    }
    
    if (user.role !== 'admin') {
      // User not admin - show message and redirect
      alert('Access denied. Admin privileges required.')
      navigate('/login')
      return
    }
    
    // User is admin - load data
    loadData()
  }, [user, navigate])

  const loadData = async () => {
    setLoading(true)
    try {
      const [blogsData, servicesData] = await Promise.all([
        contentAPI.getBlogArticles(),
        contentAPI.getServices().catch(() => [])
      ])
      setBlogPosts(blogsData.success ? blogsData.data : [])
      setServices(servicesData.success ? servicesData.data : [])
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDelete = async (type, id) => {
    if (!confirm(`Delete this ${type}?`)) return
    try {
      if (type === 'blog') {
        await contentAPI.deleteBlogArticle(id)
        setBlogPosts(blogPosts.filter(p => p.id !== id))
      } else if (type === 'service') {
        await contentAPI.deleteService(id)
        setServices(services.filter(s => s.id !== id))
      }
      alert(`${type} deleted successfully`)
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete')
    }
  }

  const handleBlogSubmit = async (e) => {
    e.preventDefault()
    const submitData = {
      title: formData.title,
      content: formData.content
    }
    try {
      if (editingBlog) {
        await contentAPI.updateBlogArticle(editingBlog.id, submitData)
        setBlogPosts(blogPosts.map(p => p.id === editingBlog.id ? { ...p, ...submitData } : p))
        setEditingBlog(null)
        alert('Blog updated successfully')
      } else {
        const result = await contentAPI.createBlogArticle(submitData)
        setBlogPosts([{ ...result.data, ...blogPosts }])
        alert('Blog created successfully')
      }
      setShowBlogForm(false)
      resetBlogForm()
    } catch (error) {
      console.error('Blog submit error:', error)
      alert('Failed to save blog')
    }
  }

  const handleServiceSubmit = async (e) => {
    e.preventDefault()
    const submitData = {
      title: formData.serviceTitle,
      description: formData.serviceDescription
    }
    try {
      if (editingService) {
        await contentAPI.updateService(editingService.id, submitData)
        setServices(services.map(s => s.id === editingService.id ? { ...s, ...submitData } : s))
        setEditingService(null)
        alert('Service updated successfully')
      } else {
        const result = await contentAPI.createService(submitData)
        setServices([{ ...result.data, ...services }])
        alert('Service created successfully')
      }
      setShowServiceForm(false)
      resetServiceForm()
    } catch (error) {
      console.error('Service submit error:', error)
      alert('Failed to save service')
    }
  }

  const resetBlogForm = () => {
    setFormData({
      ...formData,
      title: '',
      content: ''
    })
  }

  const resetServiceForm = () => {
    setFormData({
      ...formData,
      serviceTitle: '',
      serviceDescription: ''
    })
  }

  const startEditBlog = (post) => {
    setEditingBlog(post)
    setFormData({
      title: post.title,
      content: post.content
    })
    setShowBlogForm(true)
  }

  const startEditService = (service) => {
    setEditingService(service)
    setFormData({
      serviceTitle: service.title,
      serviceDescription: service.description
    })
    setShowServiceForm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="bg-white shadow-sm border-b border-gray-200 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <div className="ml-4 text-sm text-gray-600">
                Logged in as: <span className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Home className="w-4 h-4 mr-2" />
                View Website
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium text-red-600 bg-white hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('blog')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'blog'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5 mr-2" />
                Blog Posts
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'services'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Services
              </button>
            </nav>
          </div>

          {activeTab === 'blog' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Blog Posts</h3>
                <button
                  onClick={() => setShowBlogForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {blogPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{post.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditBlog(post)}
                              className="text-teal-600 hover:text-teal-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('blog', post.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {showBlogForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowBlogForm(false)
                          resetBlogForm()
                          setEditingBlog(null)
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={handleBlogSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Content *</label>
                        <textarea
                          name="content"
                          value={formData.content}
                          onChange={(e) => setFormData({...formData, content: e.target.value})}
                          rows={8}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {editingBlog ? 'Update Post' : 'Create Post'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Services</h3>
                <button
                  onClick={() => setShowServiceForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Service
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{service.title}</div>
                          {service.description && (
                            <div className="text-xs text-gray-500 mt-1">{service.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditService(service)}
                              className="text-teal-600 hover:text-teal-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('service', service.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {showServiceForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {editingService ? 'Edit Service' : 'Add New Service'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowServiceForm(false)
                          resetServiceForm()
                          setEditingService(null)
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={handleServiceSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Service Title *</label>
                        <input
                          type="text"
                          name="serviceTitle"
                          value={formData.serviceTitle}
                          onChange={(e) => setFormData({...formData, serviceTitle: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          name="serviceDescription"
                          value={formData.serviceDescription}
                          onChange={(e) => setFormData({...formData, serviceDescription: e.target.value})}
                          rows={3}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {editingService ? 'Update Service' : 'Add Service'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
