import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  FileText, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Calendar,
  Users,
  File,
  Mail,
  MessageCircle,
  Send,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

const ProjectDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDocumentViewer, setShowDocumentViewer] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchProjectDetails()
    }
  }, [isAuthenticated, id])

  const fetchProjectDetails = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockProject = {
        id: parseInt(id),
        name: 'Community Center Renovation',
        description: 'Renovation of the main community center with updated facilities, modern amenities, and improved accessibility features.',
        status: 'active',
        progress: 65,
        startDate: '2024-01-15',
        expectedCompletion: '2024-06-30',
        budget: 150000,
        spent: 97500,
        team: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'],
        client: 'Greggory Foundation Ltd',
        location: 'Nairobi, Kenya',
        
        // Reports section
        reports: [
          {
            id: 1,
            title: 'Monthly Progress Report - March 2024',
            date: '2024-03-31',
            type: 'progress',
            size: '2.4 MB',
            downloads: 45
          },
          {
            id: 2,
            title: 'Budget Analysis Q1 2024',
            date: '2024-03-15',
            type: 'financial',
            size: '1.8 MB',
            downloads: 32
          },
          {
            id: 3,
            title: 'Site Inspection Report',
            date: '2024-03-10',
            type: 'inspection',
            size: '3.2 MB',
            downloads: 28
          }
        ],

        // Accounting section
        accounting: {
          totalBudget: 150000,
          spent: 97500,
          remaining: 52500,
          expenses: [
            {
              id: 1,
              description: 'Building Materials',
              amount: 45000,
              date: '2024-02-15',
              category: 'materials',
              receipt: 'receipt_001.pdf'
            },
            {
              id: 2,
              description: 'Labor Costs',
              amount: 35000,
              date: '2024-02-28',
              category: 'labor',
              receipt: 'receipt_002.pdf'
            },
            {
              id: 3,
              description: 'Equipment Rental',
              amount: 17500,
              date: '2024-03-10',
              category: 'equipment',
              receipt: 'receipt_003.pdf'
            }
          ],
          invoices: [
            {
              id: 1,
              number: 'INV-001',
              amount: 25000,
              date: '2024-02-15',
              status: 'paid',
              client: 'Greggory Foundation Ltd'
            },
            {
              id: 2,
              number: 'INV-002',
              amount: 30000,
              date: '2024-03-01',
              status: 'pending',
              client: 'Greggory Foundation Ltd'
            }
          ]
        },

        // Work Done section
        workDone: [
          {
            id: 1,
            task: 'Foundation Work',
            description: 'Complete foundation excavation and concrete pouring',
            completedDate: '2024-02-28',
            progress: 100,
            assignedTo: 'John Doe',
            materials: ['Concrete', 'Steel Rebar', 'Gravel'],
            photos: ['foundation_1.jpg', 'foundation_2.jpg']
          },
          {
            id: 2,
            task: 'Structural Framework',
            description: 'Erect main structural steel framework',
            completedDate: '2024-03-15',
            progress: 100,
            assignedTo: 'Mike Johnson',
            materials: ['Steel Beams', 'Bolts', 'Welding Supplies'],
            photos: ['structure_1.jpg', 'structure_2.jpg']
          },
          {
            id: 3,
            task: 'Roofing Installation',
            description: 'Install roofing sheets and waterproofing',
            completedDate: '2024-03-20',
            progress: 85,
            assignedTo: 'Sarah Wilson',
            materials: ['Roofing Sheets', 'Waterproofing Membrane', 'Fasteners'],
            photos: ['roofing_1.jpg']
          }
        ],

        // Work Pending section
        workPending: [
          {
            id: 1,
            task: 'Interior Finishing',
            description: 'Complete interior wall finishing and painting',
            plannedDate: '2024-04-15',
            priority: 'high',
            assignedTo: 'Jane Smith',
            estimatedCost: 25000,
            materials: ['Paint', 'Drywall', 'Primer']
          },
          {
            id: 2,
            task: 'Electrical Installation',
            description: 'Install electrical wiring and fixtures',
            plannedDate: '2024-04-20',
            priority: 'high',
            assignedTo: 'Mike Johnson',
            estimatedCost: 18000,
            materials: ['Wiring', 'Switches', 'Light Fixtures']
          },
          {
            id: 3,
            task: 'Plumbing Works',
            description: 'Complete plumbing installation and testing',
            plannedDate: '2024-04-25',
            priority: 'medium',
            assignedTo: 'Sarah Wilson',
            estimatedCost: 15000,
            materials: ['Pipes', 'Fittings', 'Valves']
          }
        ],

        // Documents section
        documents: [
          {
            id: 1,
            name: 'Project Contract.pdf',
            type: 'contract',
            size: '4.2 MB',
            uploadDate: '2024-01-15',
            uploadedBy: 'Admin',
            category: 'legal'
          },
          {
            id: 2,
            name: 'Architectural Plans.dwg',
            type: 'drawing',
            size: '8.7 MB',
            uploadDate: '2024-01-20',
            uploadedBy: 'John Doe',
            category: 'technical'
          },
          {
            id: 3,
            name: 'Safety Manual.pdf',
            type: 'manual',
            size: '2.1 MB',
            uploadDate: '2024-01-25',
            uploadedBy: 'Jane Smith',
            category: 'safety'
          },
          {
            id: 4,
            name: 'Material Specifications.xlsx',
            type: 'spreadsheet',
            size: '1.5 MB',
            uploadDate: '2024-02-01',
            uploadedBy: 'Mike Johnson',
            category: 'technical'
          }
        ]
      }

      setProject(mockProject)
    } catch (error) {
      console.error('Failed to fetch project details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (item, section) => {
    // Implement download functionality
    console.log(`Downloading ${item.name || item.title} from ${section}`)
    // In a real app, this would trigger a file download
  }

  const handleViewDocument = (document) => {
    setSelectedDocument(document)
    setShowDocumentViewer(true)
  }

  const handleCloseDocumentViewer = () => {
    setShowDocumentViewer(false)
    setSelectedDocument(null)
  }

  const getDocumentPreviewUrl = (document) => {
    // In a real app, this would return the actual preview URL
    // For now, we'll use placeholder URLs based on document type
    const typeMap = {
      'pdf': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'doc': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'docx': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'xls': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'xlsx': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'dwg': 'https://upload.wikimedia.org/wikipedia/commons/3/32/Autocad_dwg_sample.png',
      'jpg': 'https://picsum.photos/800/600',
      'jpeg': 'https://picsum.photos/800/600',
      'png': 'https://picsum.photos/800/600'
    }
    
    const extension = document.name?.split('.').pop()?.toLowerCase() || document.type
    return typeMap[extension] || typeMap['pdf']
  }

  const handleShare = (platform, item = null) => {
    const shareData = item || {
      title: project.name,
      description: project.description,
      url: window.location.href
    }

    let shareUrl = ''
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareData.title}: ${shareData.description} - ${shareData.url}`)}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(`${shareData.description}\n\n${shareData.url}`)}`
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title)}`
        break
      default:
        return
    }

    window.open(shareUrl, '_blank')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'paid': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h1>
          <p className="text-gray-600 mb-8">Please log in to view project details.</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-r-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-8">The requested project could not be found.</p>
          <button
            onClick={() => navigate('/projects')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Back to Projects
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/projects')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-500">Project ID: #{project.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'accounting', label: 'Accounting', icon: DollarSign },
              { id: 'work-done', label: 'Work Done', icon: CheckCircle },
              { id: 'work-pending', label: 'Work Pending', icon: Clock },
              { id: 'documents', label: 'Documents', icon: File }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center px-1 py-4 border-b-2 text-sm font-medium ${
                  activeSection === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-900">{project.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Client</p>
                  <p className="text-gray-900">{project.client}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="text-gray-900">{project.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Team Members</p>
                  <div className="flex flex-wrap gap-2">
                    {project.team.map((member, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Budget</p>
                    <p className="text-xl font-semibold text-gray-900">${project.budget.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Progress</p>
                    <p className="text-xl font-semibold text-gray-900">{project.progress}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Start Date</p>
                    <p className="text-xl font-semibold text-gray-900">{project.startDate}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completion</p>
                    <p className="text-xl font-semibold text-gray-900">{project.expectedCompletion}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Section */}
        {activeSection === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Project Reports</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Generate Report
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {project.reports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <button
                            onClick={() => handleViewDocument(report)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {report.title}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.downloads}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownload(report, 'reports')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShare('whatsapp', report)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShare('email', report)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Mail className="w-4 h-4" />
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

        {/* Accounting Section */}
        {activeSection === 'accounting' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Budget</span>
                    <span className="font-medium">${project.accounting.totalBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-medium text-red-600">${project.accounting.spent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining</span>
                    <span className="font-medium text-green-600">${project.accounting.remaining.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses</h3>
              <div className="space-y-3">
                {project.accounting.expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-500">{expense.date} â¢ {expense.category}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">${expense.amount.toLocaleString()}</span>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoices</h3>
              <div className="space-y-3">
                {project.accounting.invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{invoice.number}</p>
                      <p className="text-sm text-gray-500">{invoice.date} â¢ {invoice.client}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                      <span className="font-medium">${invoice.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accounting Spreadsheets */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Financial Spreadsheets</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 inline-flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Spreadsheet
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Budget Tracking Spreadsheet */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h4 className="font-medium text-gray-900">Budget Tracking Spreadsheet</h4>
                    <p className="text-sm text-gray-600">Monthly budget allocation and spending analysis</p>
                  </div>
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Spent</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-3 py-2 text-sm text-gray-900">January 2024</td>
                            <td className="px-3 py-2 text-sm text-gray-900">$25,000</td>
                            <td className="px-3 py-2 text-sm text-gray-900">$18,500</td>
                            <td className="px-3 py-2 text-sm text-green-600">$6,500</td>
                            <td className="px-3 py-2 text-sm text-gray-900">74%</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-sm text-gray-900">February 2024</td>
                            <td className="px-3 py-2 text-sm text-gray-900">$25,000</td>
                            <td className="px-3 py-2 text-sm text-gray-900">$22,100</td>
                            <td className="px-3 py-2 text-sm text-green-600">$2,900</td>
                            <td className="px-3 py-2 text-sm text-gray-900">88%</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-sm text-gray-900">March 2024</td>
                            <td className="px-3 py-2 text-sm text-gray-900">$25,000</td>
                            <td className="px-3 py-2 text-sm text-gray-900">$15,200</td>
                            <td className="px-3 py-2 text-sm text-green-600">$9,800</td>
                            <td className="px-3 py-2 text-sm text-gray-900">61%</td>
                          </tr>
                          <tr className="bg-gray-50 font-medium">
                            <td className="px-3 py-2 text-sm text-gray-900">Total</td>
                            <td className="px-3 py-2 text-sm text-gray-900">$75,000</td>
                            <td className="px-3 py-2 text-sm text-red-600">$55,800</td>
                            <td className="px-3 py-2 text-sm text-green-600">$19,200</td>
                            <td className="px-3 py-2 text-sm text-gray-900">74%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button className="text-blue-600 hover:text-blue-900 text-sm font-medium inline-flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        Download Excel
                      </button>
                      <button className="text-green-600 hover:text-green-900 text-sm font-medium inline-flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expense Breakdown Spreadsheet */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h4 className="font-medium text-gray-900">Expense Breakdown Spreadsheet</h4>
                    <p className="text-sm text-gray-600">Detailed expense tracking by category and date</p>
                  </div>
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-3 py-2 text-sm text-gray-900">2024-02-15</td>
                            <td className="px-3 py-2 text-sm"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Materials</span></td>
                            <td className="px-3 py-2 text-sm text-gray-900">Building Materials</td>
                            <td className="px-3 py-2 text-sm text-gray-900">$45,000</td>
                            <td className="px-3 py-2 text-sm">
                              <button className="text-blue-600 hover:text-blue-900">
                                <FileText className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-sm text-gray-900">2024-02-28</td>
                            <td className="px-3 py-2 text-sm"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Labor</span></td>
                            <td className="px-3 py-2 text-sm text-gray-900">Labor Costs</td>
                            <td className="px-3 py-2 text-sm text-gray-900">$35,000</td>
                            <td className="px-3 py-2 text-sm">
                              <button className="text-blue-600 hover:text-blue-900">
                                <FileText className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-sm text-gray-900">2024-03-10</td>
                            <td className="px-3 py-2 text-sm"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Equipment</span></td>
                            <td className="px-3 py-2 text-sm text-gray-900">Equipment Rental</td>
                            <td className="px-3 py-2 text-sm text-gray-900">$17,500</td>
                            <td className="px-3 py-2 text-sm">
                              <button className="text-blue-600 hover:text-blue-900">
                                <FileText className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button className="text-blue-600 hover:text-blue-900 text-sm font-medium inline-flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        Download Excel
                      </button>
                      <button className="text-green-600 hover:text-green-900 text-sm font-medium inline-flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cash Flow Spreadsheet */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h4 className="font-medium text-gray-900">Cash Flow Spreadsheet</h4>
                    <p className="text-sm text-gray-600">Monthly cash inflow and outflow analysis</p>
                  </div>
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inflow</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Outflow</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net Flow</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-3 py-2 text-sm text-gray-900">January 2024</td>
                            <td className="px-3 py-2 text-sm text-green-600">+$25,000</td>
                            <td className="px-3 py-2 text-sm text-red-600">-$18,500</td>
                            <td className="px-3 py-2 text-sm text-green-600">+$6,500</td>
                            <td className="px-3 py-2 text-sm text-gray-900">$6,500</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-sm text-gray-900">February 2024</td>
                            <td className="px-3 py-2 text-sm text-green-600">+$25,000</td>
                            <td className="px-3 py-2 text-sm text-red-600">-$22,100</td>
                            <td className="px-3 py-2 text-sm text-green-600">+$2,900</td>
                            <td className="px-3 py-2 text-sm text-gray-900">$9,400</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-sm text-gray-900">March 2024</td>
                            <td className="px-3 py-2 text-sm text-green-600">+$25,000</td>
                            <td className="px-3 py-2 text-sm text-red-600">-$15,200</td>
                            <td className="px-3 py-2 text-sm text-green-600">+$9,800</td>
                            <td className="px-3 py-2 text-sm text-gray-900">$19,200</td>
                          </tr>
                          <tr className="bg-gray-50 font-medium">
                            <td className="px-3 py-2 text-sm text-gray-900">Total</td>
                            <td className="px-3 py-2 text-sm text-green-600">+$75,000</td>
                            <td className="px-3 py-2 text-sm text-red-600">-$55,800</td>
                            <td className="px-3 py-2 text-sm text-green-600">+$19,200</td>
                            <td className="px-3 py-2 text-sm text-gray-900">$19,200</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button className="text-blue-600 hover:text-blue-900 text-sm font-medium inline-flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        Download Excel
                      </button>
                      <button className="text-green-600 hover:text-green-900 text-sm font-medium inline-flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Work Done Section */}
        {activeSection === 'work-done' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Completed Work</h2>
            {project.workDone.map((work) => (
              <div key={work.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{work.task}</h3>
                    <p className="text-gray-600 mt-1">{work.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {work.progress}% Complete
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Completed Date</p>
                    <p className="font-medium">{work.completedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assigned To</p>
                    <p className="font-medium">{work.assignedTo}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Materials Used</p>
                  <div className="flex flex-wrap gap-2">
                    {work.materials.map((material, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                        {material}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Photos</p>
                  <div className="flex space-x-3">
                    {work.photos.map((photo, index) => (
                      <div key={index} className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Eye className="w-6 h-6 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Work Pending Section */}
        {activeSection === 'work-pending' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Pending Work</h2>
            {project.workPending.map((work) => (
              <div key={work.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{work.task}</h3>
                    <p className="text-gray-600 mt-1">{work.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(work.priority)}`}>
                      {work.priority} priority
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Planned Date</p>
                    <p className="font-medium">{work.plannedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assigned To</p>
                    <p className="font-medium">{work.assignedTo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Cost</p>
                    <p className="font-medium">${work.estimatedCost.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Required Materials</p>
                  <div className="flex flex-wrap gap-2">
                    {work.materials.map((material, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Documents Section */}
        {activeSection === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Project Documents</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.documents.map((doc) => (
                <div key={doc.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <File className="w-8 h-8 text-gray-400 mr-3" />
                      <div>
                        <button
                          onClick={() => handleViewDocument(doc)}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                        >
                          {doc.name}
                        </button>
                        <p className="text-sm text-gray-500">{doc.size}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{doc.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{doc.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uploaded:</span>
                      <span className="font-medium">{doc.uploadDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">By:</span>
                      <span className="font-medium">{doc.uploadedBy}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleDownload(doc, 'documents')}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition duration-300 inline-flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                    <button
                      onClick={() => handleShare('whatsapp', doc)}
                      className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare('email', doc)}
                      className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-300"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Project</h3>
            <p className="text-gray-600 mb-6">Share this project with stakeholders via different platforms</p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full flex items-center justify-center p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Share via WhatsApp
              </button>
              <button
                onClick={() => handleShare('email')}
                className="w-full flex items-center justify-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300"
              >
                <Mail className="w-5 h-5 mr-2" />
                Share via Email
              </button>
              <button
                onClick={() => handleShare('telegram')}
                className="w-full flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
              >
                <Send className="w-5 h-5 mr-2" />
                Share via Telegram
              </button>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-screen mx-4 my-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-gray-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedDocument.name || selectedDocument.title}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedDocument.type} â¢ {selectedDocument.size || 'Unknown size'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(selectedDocument, 'viewer')}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleShare('whatsapp', selectedDocument)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition duration-200"
                  title="Share via WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCloseDocumentViewer}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition duration-200"
                  title="Close"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-hidden">
              {selectedDocument.type === 'pdf' || 
               selectedDocument.name?.toLowerCase().endsWith('.pdf') ||
               selectedDocument.name?.toLowerCase().endsWith('.doc') ||
               selectedDocument.name?.toLowerCase().endsWith('.docx') ||
               selectedDocument.name?.toLowerCase().endsWith('.xls') ||
               selectedDocument.name?.toLowerCase().endsWith('.xlsx') ? (
                <iframe
                  src={getDocumentPreviewUrl(selectedDocument)}
                  className="w-full h-full border-0"
                  title={selectedDocument.name || selectedDocument.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="mb-4">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Document Preview</h3>
                    <p className="text-gray-600 mb-4">
                      {selectedDocument.name || selectedDocument.title}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        Type: {selectedDocument.type}
                      </p>
                      <p className="text-sm text-gray-500">
                        Size: {selectedDocument.size || 'Unknown'}
                      </p>
                      {selectedDocument.uploadDate && (
                        <p className="text-sm text-gray-500">
                          Uploaded: {selectedDocument.uploadDate}
                        </p>
                      )}
                      {selectedDocument.uploadedBy && (
                        <p className="text-sm text-gray-500">
                          By: {selectedDocument.uploadedBy}
                        </p>
                      )}
                    </div>
                    <div className="mt-6 flex justify-center space-x-3">
                      <button
                        onClick={() => handleDownload(selectedDocument, 'viewer')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 inline-flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                      <button
                        onClick={handleCloseDocumentViewer}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-300"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDetails
