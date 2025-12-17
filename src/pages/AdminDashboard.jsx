import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  Briefcase, 
  Mail, 
  Settings, 
  LogOut, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Home
} from 'lucide-react'
import { contentAPI } from '../services/api'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('blog')
  const [adminKey, setAdminKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [blogPosts, setBlogPosts] = useState([])
  const [caseStudies, setCaseStudies] = useState([])
  const [contactForms, setContactForms] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const storedKey = localStorage.getItem('admin_key')
    if (storedKey) {
      setAdminKey(storedKey)
      setIsAuthenticated(true)
      loadData()
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [blogs, studies, contacts] = await Promise.all([
        contentAPI.getBlogArticles(),
        contentAPI.getCaseStudies(),
        contentAPI.getContactForms().catch(() => [])
      ])
      setBlogPosts(blogs || [])
      setCaseStudies(studies || [])
      setContactForms(contacts || [])
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Failed to load data. Check your admin key and backend connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (adminKey.trim()) {
      localStorage.setItem('admin_key', adminKey)
      setIsAuthenticated(true)
      loadData()
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_key')
    setAdminKey('')
    setIsAuthenticated(false)
    setBlogPosts([])
    setCaseStudies([])
    setContactForms([])
  }

  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      if (type === 'blog') {
        await contentAPI.deleteBlogArticle(id)
        setBlogPosts(blogPosts.filter(p => p.id !== id))
      } else if (type === 'case-study') {
        await contentAPI.deleteCaseStudy(id)
        setCaseStudies(caseStudies.filter(c => c.id !== id))
      } else if (type === 'contact') {
        await contentAPI.deleteContactForm(id)
        setContactForms(contactForms.filter(c => c.id !== id))
      }
      alert('Deleted successfully!')
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Failed to delete. Check your admin key.')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-navy-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Enter your admin key to access the dashboard</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter admin key"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Login
            </button>
          </form>
          <button
            onClick={() => navigate('/')}
            className="mt-4 w-full text-gray-600 hover:text-gray-800"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800"
            >
              <Home className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-navy-900">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('blog')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'blog'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FileText className="w-5 h-5" />
              Blog Posts ({blogPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('case-studies')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'case-studies'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              Case Studies ({caseStudies.length})
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'contacts'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Mail className="w-5 h-5" />
              Contact Forms ({contactForms.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'blog' && (
              <BlogManagement 
                posts={blogPosts} 
                onDelete={handleDelete}
                onRefresh={loadData}
              />
            )}
            {activeTab === 'case-studies' && (
              <CaseStudiesManagement 
                studies={caseStudies} 
                onDelete={handleDelete}
                onRefresh={loadData}
              />
            )}
            {activeTab === 'contacts' && (
              <ContactFormsManagement 
                forms={contactForms} 
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Blog Management Component
const BlogManagement = ({ posts, onDelete, onRefresh }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Blog Posts</h2>
        <button
          onClick={() => navigate('/admin/blog/new')}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Post
        </button>
      </div>
      <div className="divide-y divide-gray-200">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No blog posts found. Create your first post!
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                    {post.is_published ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Published</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">Draft</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Author: {post.author || 'Unknown'}</span>
                    <span>Category: {post.category || 'Uncategorized'}</span>
                    {post.published_date && (
                      <span>Published: {new Date(post.published_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => navigate(`/admin/blog/${post.id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete('blog', post.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Case Studies Management Component
const CaseStudiesManagement = ({ studies, onDelete, onRefresh }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Case Studies</h2>
        <button
          onClick={() => navigate('/admin/case-studies/new')}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Case Study
        </button>
      </div>
      <div className="divide-y divide-gray-200">
        {studies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No case studies found. Create your first case study!
          </div>
        ) : (
          studies.map((study) => (
            <div key={study.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{study.title}</h3>
                    {study.is_featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">Featured</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">Client: {study.client || 'N/A'}</p>
                  <p className="text-gray-600 mb-2">Industry: {study.industry || 'N/A'}</p>
                  {study.duration && (
                    <p className="text-sm text-gray-500">Duration: {study.duration}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => navigate(`/admin/case-studies/${study.id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete('case-study', study.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Contact Forms Management Component
const ContactFormsManagement = ({ forms, onDelete }) => {
  const [selectedForm, setSelectedForm] = useState(null)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Contact Form Submissions</h2>
        </div>
        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
          {forms.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No contact form submissions yet.
            </div>
          ) : (
            forms.map((form) => (
              <div
                key={form.id}
                onClick={() => setSelectedForm(form)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedForm?.id === form.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{form.name}</p>
                    <p className="text-sm text-gray-600">{form.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(form.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete('contact', form.id)
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Message Details</h2>
        </div>
        {selectedForm ? (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-gray-900">{selectedForm.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{selectedForm.email}</p>
              </div>
              {selectedForm.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-gray-900">{selectedForm.phone}</p>
                </div>
              )}
              {selectedForm.company && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Company</label>
                  <p className="mt-1 text-gray-900">{selectedForm.company}</p>
                </div>
              )}
              {selectedForm.subject && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <p className="mt-1 text-gray-900">{selectedForm.subject}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Message</label>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedForm.message}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Submitted</label>
                <p className="mt-1 text-gray-900">
                  {new Date(selectedForm.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Select a form submission to view details
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

