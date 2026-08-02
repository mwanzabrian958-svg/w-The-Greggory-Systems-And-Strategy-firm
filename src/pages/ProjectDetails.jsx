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
        client: 'The-Greggory-Systems-And-Strategy-firm',
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
              client: 'The-Greggory-Systems-And-Strategy-firm'
            },
            {
              id: 2,
              number: 'INV-002',
              amount: 30000,
              date: '2024-03-01',
              status: 'pending',
              client: 'The-Greggory-Systems-And-Strategy-firm'
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
    <div className="min-h-screen bg-[#0f172a] text-white pt-[140px] relative overflow-hidden">
      {/* Immersive Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(245,158,11,0.08),_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,_rgba(45,212,191,0.05),_transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
      </div>

      {/* Header Protocol */}
      <div className="relative z-10 bg-white/5 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/client-portal')}
                className="mr-6 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-gold-500"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-1">Entity Telemetry</p>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">{project.name}</h1>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Serial</p>
                 <p className="text-xs font-black text-white font-mono uppercase tracking-tighter">#{project.id}</p>
              </div>
              <button
                onClick={() => setShowShareModal(true)}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-gold-500"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg ${getStatusColor(project.status).replace('bg-green-100', 'bg-emerald-500/10 border-emerald-500/20').replace('text-green-600', 'text-emerald-400')}`}>
                {project.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Protocol */}
      <div className="relative z-10 bg-white/[0.02] border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-10 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Telemetry', icon: FileText },
              { id: 'reports', label: 'Relays', icon: FileText },
              { id: 'accounting', label: 'Ledger', icon: DollarSign },
              { id: 'work-done', label: 'Synchronized', icon: CheckCircle },
              { id: 'work-pending', label: 'Queued', icon: Clock },
              { id: 'documents', label: 'Vault', icon: File }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center py-6 border-b-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap ${
                  activeSection === tab.id
                    ? 'border-gold-500 text-gold-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : 'border-transparent text-slate-500 hover:text-white'
                }`}
              >
                <tab.icon className={`w-4 h-4 mr-3 ${activeSection === tab.id ? 'text-gold-500' : 'text-slate-600'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Protocol */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                 <Briefcase className="w-48 h-48" />
              </div>

              <div className="relative z-10">
                <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-4">Mission Parameters</p>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Integrated Brief</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">System Descriptioning</p>
                      <p className="text-base text-slate-300 font-medium leading-relaxed">{project.description}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Entity Personnel</p>
                      <div className="flex flex-wrap gap-3">
                        {project.team.map((member, index) => (
                          <span key={index} className="px-4 py-1.5 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5">
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-[24px] p-6 border border-white/5">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Protocol Client</p>
                        <p className="text-sm font-black text-white uppercase tracking-wider">{project.client}</p>
                      </div>
                      <div className="bg-white/5 rounded-[24px] p-6 border border-white/5">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Node Location</p>
                        <p className="text-sm font-black text-white uppercase tracking-wider">{project.location}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-gold-500/5 to-transparent rounded-[24px] p-8 border border-gold-500/10">
                       <div className="flex items-center justify-between mb-6">
                          <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em]">Lifecycle Status</p>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Active</span>
                       </div>
                       <p className="text-sm text-slate-400 font-medium leading-relaxed">
                          Currently in the <span className="text-white font-bold italic">Creation</span> phase.
                          Design protocols validated. Maintenance cycle scheduled for {project.expectedCompletion}.
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Capital Allocation', val: `KES ${project.budget.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Sync Progress', val: `${project.progress}%`, icon: CheckCircle, color: 'text-sky-400', bg: 'bg-sky-500/10' },
                { label: 'Inception', val: project.startDate, icon: Calendar, color: 'text-gold-500', bg: 'bg-gold-500/10' },
                { label: 'Target Sync', val: project.expectedCompletion, icon: Clock, color: 'text-rose-400', bg: 'bg-rose-500/10' }
              ].map((kpi, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl rounded-[28px] p-8 border border-white/10 group hover:bg-white/[0.08] transition-all shadow-xl">
                  <div className={`w-12 h-12 rounded-2xl ${kpi.bg} flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform`}>
                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{kpi.label}</p>
                  <p className="text-xl font-black text-white uppercase tracking-tight">{kpi.val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Section */}
        {activeSection === 'reports' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                 <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2">Relay Protocol</p>
                 <h2 className="text-3xl font-black text-white uppercase tracking-tight">Project Records</h2>
              </div>
              <button className="bg-gold-500 text-slate-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20 inline-flex items-center">
                <Plus className="w-4 h-4 mr-3" />
                Initialize Record
              </button>
            </div>
            
            <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Module Title</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocol Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Classification</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Size</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Relays</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {project.reports.map((report) => (
                    <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gold-500 mr-4 group-hover:scale-110 transition-transform" />
                          <button
                            onClick={() => handleViewDocument(report)}
                            className="text-sm font-black text-white uppercase tracking-wider hover:text-gold-400 transition-colors"
                          >
                            {report.title}
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">{report.date}</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-md bg-white/5 text-gold-500 border border-white/10">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-tighter">{report.size}</td>
                      <td className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">{report.downloads}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleDownload(report, 'reports')}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-gold-500 transition-all border border-white/5"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShare('whatsapp', report)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-emerald-500 transition-all border border-white/5"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShare('email', report)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-sky-500 transition-all border border-white/5"
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
          <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-gold-500/10 blur-3xl rounded-full group-hover:bg-gold-500/20 transition-all" />
                <h3 className="text-xs font-black text-gold-500 uppercase tracking-[0.3em] mb-8">Asset Allocation</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Capital</span>
                    <span className="text-lg font-black text-white">KES {project.accounting.totalBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expended</span>
                    <span className="text-lg font-black text-rose-400">KES {project.accounting.spent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reserve</span>
                    <span className="text-lg font-black text-emerald-400">KES {project.accounting.remaining.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 p-10 shadow-2xl">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                   <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                   Burn Records
                </h3>
                <div className="space-y-4">
                  {project.accounting.expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group">
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-wider">{expense.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{expense.date}</span>
                           <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                           <span className="text-[8px] font-black text-gold-500/60 uppercase tracking-widest px-2 py-0.5 border border-gold-500/20 rounded-md bg-gold-500/5">{expense.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-sm font-black text-white">KES {expense.amount.toLocaleString()}</span>
                        <button className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-gold-500 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 p-10 shadow-2xl">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   Financial Relays
                </h3>
                <div className="space-y-4">
                  {project.accounting.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                      <div>
                        <p className="text-sm font-black text-gold-500 font-mono tracking-tighter">{invoice.number}</p>
                        <div className="flex items-center gap-3 mt-2">
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{invoice.date}</span>
                           <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{invoice.client}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                          invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gold-500/10 text-gold-400 border-gold-500/20'
                        }`}>
                          {invoice.status}
                        </span>
                        <span className="text-sm font-black text-white font-mono">KES {invoice.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Accounting Spreadsheets Protocol */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 p-10 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Systemized Spreadsheets</h3>
                <button className="bg-gold-500 text-slate-950 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20 inline-flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Compile Ledger
                </button>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Budget Tracking Protocol */}
                <div className="border border-white/10 rounded-[28px] overflow-hidden bg-white/[0.01]">
                  <div className="bg-white/5 px-8 py-6 border-b border-white/10">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Telemetry Burn Analysis</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Strategic resource allocation mapping</p>
                  </div>
                  <div className="p-8 overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocol Cycle</th>
                          <th className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Allocated</th>
                          <th className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Expended</th>
                          <th className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Variance</th>
                          <th className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[
                          { month: 'January', yr: new Date().getFullYear(), budget: 25000, spent: 18500 },
                          { month: 'February', yr: new Date().getFullYear(), budget: 25000, spent: 22100 },
                          { month: 'March', yr: new Date().getFullYear(), budget: 25000, spent: 15200 }
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-5 text-xs font-bold text-slate-300 uppercase tracking-wider">{row.month} {row.yr}</td>
                            <td className="px-4 py-5 text-xs font-black text-white">KES {row.budget.toLocaleString()}</td>
                            <td className="px-4 py-5 text-xs font-black text-white">KES {row.spent.toLocaleString()}</td>
                            <td className="px-4 py-5 text-xs font-black text-emerald-400">KES {(row.budget - row.spent).toLocaleString()}</td>
                            <td className="px-4 py-5 text-xs font-black text-slate-500">{Math.round((row.spent/row.budget)*100)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex gap-4 mt-8 pt-8 border-t border-white/5">
                      <button className="text-gold-500 hover:text-gold-400 text-[10px] font-black uppercase tracking-[0.2em] inline-flex items-center border-b border-gold-500/20 pb-0.5">
                        <Download className="w-3.5 h-3.5 mr-2" />
                        Export Protocol
                      </button>
                      <button className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] inline-flex items-center transition-colors">
                        <MessageCircle className="w-3.5 h-3.5 mr-2" />
                        Relay
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cash Flow Protocol */}
                <div className="border border-white/10 rounded-[28px] overflow-hidden bg-white/[0.01]">
                   <div className="bg-white/5 px-8 py-6 border-b border-white/10">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Capital Transmission Delta</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Monthly capital injection vs operational burn</p>
                  </div>
                  <div className="p-8 overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocol Cycle</th>
                          <th className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Inflow</th>
                          <th className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Outflow</th>
                          <th className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Net Delta</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[
                          { month: 'January', yr: new Date().getFullYear(), inflow: 25000, outflow: 18500 },
                          { month: 'February', yr: new Date().getFullYear(), inflow: 25000, outflow: 22100 },
                          { month: 'March', yr: new Date().getFullYear(), inflow: 25000, outflow: 15200 }
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-5 text-xs font-bold text-slate-300 uppercase tracking-wider">{row.month} {row.yr}</td>
                            <td className="px-4 py-5 text-xs font-black text-emerald-400">+ KES {row.inflow.toLocaleString()}</td>
                            <td className="px-4 py-5 text-xs font-black text-rose-400">- KES {row.outflow.toLocaleString()}</td>
                            <td className="px-4 py-5 text-xs font-black text-white">KES {(row.inflow - row.outflow).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex gap-4 mt-8 pt-8 border-t border-white/5">
                      <button className="text-gold-500 hover:text-gold-400 text-[10px] font-black uppercase tracking-[0.2em] inline-flex items-center border-b border-gold-500/20 pb-0.5">
                        <Download className="w-3.5 h-3.5 mr-2" />
                        Export Protocol
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
          <div className="space-y-8 animate-fade-in">
            <div>
               <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2">Protocol History</p>
               <h2 className="text-3xl font-black text-white uppercase tracking-tight">Synchronized Modules</h2>
            </div>
            <div className="grid gap-6">
              {project.workDone.map((work) => (
                <div key={work.id} className="bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 p-10 shadow-2xl relative overflow-hidden group hover:bg-white/[0.08] transition-all">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-wider group-hover:text-gold-400 transition-colors">{work.task}</h3>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed mt-3 max-w-2xl">{work.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                        {work.progress}% Sync Complete
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8 border-y border-white/5">
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Validation Date</p>
                      <p className="text-sm font-black text-slate-300 uppercase tracking-wider">{work.completedDate}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Personnel Uplink</p>
                      <p className="text-sm font-black text-slate-300 uppercase tracking-wider">{work.assignedTo}</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Integrated Resources</p>
                    <div className="flex flex-wrap gap-2">
                      {work.materials.map((material, index) => (
                        <span key={index} className="px-3 py-1.5 bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 border border-white/5">
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Telemetry Capture</p>
                    <div className="flex gap-4">
                      {work.photos.map((photo, index) => (
                        <div key={index} className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group/photo cursor-pointer hover:border-gold-500/40 transition-all">
                          <Eye className="w-6 h-6 text-slate-600 group-hover/photo:text-gold-500 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Pending Section */}
        {activeSection === 'work-pending' && (
          <div className="space-y-8 animate-fade-in">
            <div>
               <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2">Queue Protocol</p>
               <h2 className="text-3xl font-black text-white uppercase tracking-tight">Scheduled Deployments</h2>
            </div>
            <div className="grid gap-6">
              {project.workPending.map((work) => (
                <div key={work.id} className="bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 p-10 shadow-2xl relative overflow-hidden group hover:bg-white/[0.08] transition-all">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-wider group-hover:text-gold-400 transition-colors">{work.task}</h3>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed mt-3 max-w-2xl">{work.description}</p>
                    </div>
                    <div>
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg ${
                        work.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-gold-500/10 text-gold-400 border-gold-500/20'
                      }`}>
                        Priority: {work.priority}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-white/5">
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Planned Inception</p>
                      <p className="text-sm font-black text-slate-300 uppercase tracking-wider">{work.plannedDate}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Assigned Node</p>
                      <p className="text-sm font-black text-slate-300 uppercase tracking-wider">{work.assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Estimated Allocation</p>
                      <p className="text-sm font-black text-white uppercase tracking-wider">KES {work.estimatedCost.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Required Assets</p>
                    <div className="flex flex-wrap gap-2">
                      {work.materials.map((material, index) => (
                        <span key={index} className="px-3 py-1.5 bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 border border-white/5">
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Section */}
        {activeSection === 'documents' && (
          <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                 <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2">Vault Protocol</p>
                 <h2 className="text-3xl font-black text-white uppercase tracking-tight">Secure Assets</h2>
              </div>
              <button className="bg-gold-500 text-slate-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20 inline-flex items-center">
                <Plus className="w-4 h-4 mr-3" />
                Initialize Transfer
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {project.documents.map((doc) => (
                <div key={doc.id} className="bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 p-8 shadow-2xl group hover:bg-white/[0.08] transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                     <File className="w-24 h-24" />
                  </div>

                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="flex items-center">
                      <div className="p-4 bg-white/5 rounded-2xl text-gold-500 mr-5 border border-white/10 group-hover:scale-110 transition-transform">
                        <File className="w-6 h-6" />
                      </div>
                      <div>
                        <button
                          onClick={() => handleViewDocument(doc)}
                          className="font-black text-white uppercase tracking-wider hover:text-gold-400 transition-colors text-left text-sm"
                        >
                          {doc.name}
                        </button>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mt-1">{doc.size}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 py-6 border-y border-white/5 relative z-10">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                      <span className="text-slate-600">Classification:</span>
                      <span className="text-slate-300">{doc.type}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                      <span className="text-slate-600">Vault Node:</span>
                      <span className="text-slate-300">{doc.category}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                      <span className="text-slate-600">Registry Date:</span>
                      <span className="text-slate-300">{doc.uploadDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                      <span className="text-slate-600">Personnel:</span>
                      <span className="text-slate-300">{doc.uploadedBy}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8 relative z-10">
                    <button
                      onClick={() => handleDownload(doc, 'documents')}
                      className="flex-1 bg-white/5 text-gold-500 px-4 py-3 rounded-xl hover:bg-gold-500 hover:text-slate-950 transition-all font-black text-[9px] uppercase tracking-[0.2em] border border-gold-500/20 inline-flex items-center justify-center"
                    >
                      <Download className="w-3.5 h-3.5 mr-2" />
                      Decrypt
                    </button>
                    <button
                      onClick={() => handleShare('whatsapp', doc)}
                      className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-emerald-500 hover:bg-white/10 transition-all border border-white/5"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare('email', doc)}
                      className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-sky-500 hover:bg-white/10 transition-all border border-white/5"
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

      {/* Share Modal Protocol */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-fade-in">
          <div className="bg-[#1e293b] rounded-[40px] p-10 max-w-md w-full border border-white/10 shadow-2xl relative">
            <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2 text-center">Sync Protocol</p>
            <h3 className="text-3xl font-black text-white uppercase tracking-tight text-center mb-4">Relay Asset</h3>
            <p className="text-slate-400 text-center text-xs font-bold uppercase tracking-widest leading-relaxed mb-10">Select secure relay channel for external synchronization</p>
            
            <div className="space-y-4">
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full flex items-center justify-between p-6 bg-emerald-500 text-slate-950 rounded-3xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 group"
              >
                <span className="font-black text-[10px] uppercase tracking-[0.3em]">Secure WhatsApp</span>
                <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => handleShare('email')}
                className="w-full flex items-center justify-between p-6 bg-white/5 text-white border border-white/10 rounded-3xl hover:bg-white/10 transition-all group"
              >
                <span className="font-black text-[10px] uppercase tracking-[0.3em]">Encrypted Email</span>
                <Mail className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => handleShare('telegram')}
                className="w-full flex items-center justify-between p-6 bg-sky-500 text-slate-950 rounded-3xl hover:bg-sky-400 transition-all shadow-xl shadow-sky-500/10 group"
              >
                <span className="font-black text-[10px] uppercase tracking-[0.3em]">Secure Telegram</span>
                <Send className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setShowShareModal(false)}
                className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.4em] transition-colors"
              >
                Abort Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal Protocol */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[200] p-4 md:p-10 animate-fade-in">
          <div className="bg-[#0f172a] rounded-[40px] w-full max-w-6xl h-full flex flex-col border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center">
                <div className="p-4 bg-gold-500/10 rounded-2xl text-gold-500 mr-6 border border-gold-500/20">
                   <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-1">Asset Decryption</p>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{selectedDocument.name || selectedDocument.title}</h3>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleDownload(selectedDocument, 'viewer')}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-gold-500 hover:bg-white/10 transition-all"
                  title="Decrypt Asset"
                >
                  <Download className="w-6 h-6" />
                </button>
                <button
                  onClick={handleCloseDocumentViewer}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                  title="Seal Vault"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-hidden relative">
              {selectedDocument.type === 'pdf' || 
               selectedDocument.name?.toLowerCase().endsWith('.pdf') ||
               selectedDocument.name?.toLowerCase().endsWith('.doc') ||
               selectedDocument.name?.toLowerCase().endsWith('.docx') ||
               selectedDocument.name?.toLowerCase().endsWith('.xls') ||
               selectedDocument.name?.toLowerCase().endsWith('.xlsx') ? (
                <iframe
                  src={getDocumentPreviewUrl(selectedDocument)}
                  className="w-full h-full border-0 brightness-[0.8] grayscale-[0.5] contrast-[1.2] invert"
                  title={selectedDocument.name || selectedDocument.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#050b14]">
                  <div className="text-center relative">
                    <div className="absolute inset-0 bg-gold-500/5 blur-[80px] rounded-full" />
                    <div className="relative z-10">
                      <div className="mb-8 p-10 bg-white/5 rounded-[40px] border border-white/10 inline-block">
                        <FileText className="w-24 h-24 text-slate-700" />
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Protocol Visualization Offline</h3>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-10">Asset requires manual decryption for full telemetry visualization</p>

                      <div className="flex justify-center gap-6">
                        <button
                          onClick={() => handleDownload(selectedDocument, 'viewer')}
                          className="bg-gold-500 text-slate-950 px-10 py-5 rounded-[20px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20 flex items-center gap-3"
                        >
                          <Download className="w-4 h-4" />
                          Initialize Decryption
                        </button>
                        <button
                          onClick={handleCloseDocumentViewer}
                          className="bg-white/5 text-slate-400 px-10 py-5 rounded-[20px] font-black text-[10px] uppercase tracking-[0.3em] border border-white/10 hover:bg-white/10 transition-all"
                        >
                          Seal Vault
                        </button>
                      </div>
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
