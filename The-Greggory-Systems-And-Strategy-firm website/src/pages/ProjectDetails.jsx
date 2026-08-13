import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Briefcase,
  Calendar,
  CheckCircle, 
  Clock, 
  FileText,
  MessageSquare,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
  Download,
  Eye,
  Edit,
  Activity,
  DollarSign,
  Layers,
  Send,
  MessageCircle,
  Shield,
  Maximize2,
  Mail
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getApiUrl } from '../services/api'

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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const submitProjectFeedback = async () => {
    if (!feedbackMsg.trim()) return
    setIsSubmittingFeedback(true)
    try {
      const response = await fetch(getApiUrl('/api/feedback'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: project.id,
          feedback_type: 'incident',
          message: feedbackMsg,
          title: `Anomaly: ${project.name}`,
          priority: 'High'
        })
      })
      const data = await response.json()
      if (data.success) {
        setFeedbackMsg('')
        setShowFeedbackModal(false)
        alert('Anomaly relay synchronized')
      }
    } catch (err) {
      console.error('Relay failure:', err)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjectDetails()
    } else {
      navigate('/login')
    }
  }, [id, isAuthenticated])

  const fetchProjectDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(getApiUrl(`/api/users/projects/${id}`), {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setProject(data.project)
      } else {
        setProject(null)
      }
    } catch (error) {
      console.error('Project telemetry failure:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (item, section) => {
    console.log(`Downloading from ${section}:`, item)
    // Add logic here
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
    return document.file_path || '#'
  }

  const handleShare = (platform) => {
    console.log(`Sharing project via ${platform}`)
    setShowShareModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gold-500/20 blur-[60px] rounded-full animate-pulse" />
          <div className="relative z-10">
            <Activity className="h-16 w-16 text-gold-500 mx-auto animate-spin mb-6" />
            <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.5em]">Synchronizing Entity Telemetry...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-lg w-full relative mb-10">
          <div className="absolute inset-0 bg-gold-500/10 blur-[80px] rounded-full" />
          <div className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl">
            <Layers className="h-16 w-16 text-slate-700 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Null Entity Detected</h2>
            <p className="text-slate-400 font-medium leading-relaxed mb-8">The requested project node could not be found or access is restricted.</p>
            <button onClick={() => navigate('/client-portal')} className="w-full py-4 bg-gold-500 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-gold-400 transition-all">Return to Command Center</button>
          </div>
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

      <div className="relative z-10 bg-white/5 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center">
              <button onClick={() => navigate("/client-portal")} className="mr-6 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-gold-500" title="Back to Dashboard">
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
              <button onClick={() => setShowFeedbackModal(true)} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-rose-500/10 transition-all text-slate-400 hover:text-rose-500" title="Report Anomaly">
                <AlertCircle className="w-5 h-5" />
              </button>
              <button onClick={() => setShowShareModal(true)} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-gold-500">
                <Send className="w-5 h-5" />
              </button>
              <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg bg-emerald-500/10 border-emerald-500/20 text-emerald-400`}>{project.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-white/[0.02] border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-10 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Telemetry', icon: Activity },
              { id: 'reports', label: 'Relays', icon: FileText },
              { id: 'accounting', label: 'Ledger', icon: DollarSign },
              { id: 'work-done', label: 'Synchronized', icon: CheckCircle },
              { id: 'work-pending', label: 'Queued', icon: Clock },
              { id: 'documents', label: 'Vault', icon: FileText },
              { id: 'team', label: 'Personnel', icon: Users }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveSection(tab.id)} className={`flex items-center py-6 border-b-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap ${activeSection === tab.id ? "border-gold-500 text-gold-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "border-transparent text-slate-500 hover:text-white"}`}>
                <tab.icon className={`w-4 h-4 mr-3 ${activeSection === tab.id ? "text-gold-500" : "text-slate-600"}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
         {activeSection === 'overview' && (
           <div className="space-y-10 animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               <div className="lg:col-span-2 space-y-10">
                 <div className="bg-white/5 backdrop-blur-2xl rounded-[40px] p-10 border border-white/10 relative overflow-hidden group hover:bg-white/[0.08] transition-all duration-500">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Briefcase size={120} /></div>
                    <h2 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-6">Mission Briefing</h2>
                    <p className="text-2xl font-black text-white leading-tight uppercase italic mb-8">{project.name}</p>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-3xl">{project.description}</p>
                 </div>
               </div>
               <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 border border-white/10">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Synchronization Status</h3>
                    <div className="flex items-end justify-between mb-4">
                       <span className="text-4xl font-black text-white">{project.progress}%</span>
                       <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-400/20 px-3 py-1 rounded-full bg-emerald-400/5">Encrypted Sync</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 mb-8">
                       <div className="h-full bg-gradient-to-r from-gold-500 to-yellow-300 transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.4)]" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
               </div>
             </div>
           </div>
         )}

         {activeSection === 'reports' && (
           <div className="space-y-10 animate-fade-in">
              <h2 className="text-3xl font-black uppercase tracking-tight">Active Relays</h2>
              {(!project.reports || project.reports.length === 0) ? (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                   <FileText className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No Operational Relays Available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {project.reports.map(report => (
                    <div key={report.id} className="bg-white/5 p-8 rounded-[32px] border border-white/10 group hover:bg-white/[0.08] transition-all">
                       <p className="text-[9px] font-black text-gold-500 uppercase tracking-widest mb-2">{report.type} protocol</p>
                       <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6">{report.title}</h3>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-500 uppercase">{report.date}</span>
                          <button onClick={() => handleDownload(report, 'reports')} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:text-gold-500 transition-all"><Download size={16} /></button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
         )}

         {activeSection === 'documents' && (
           <div className="space-y-10 animate-fade-in">
              <h2 className="text-3xl font-black uppercase tracking-tight">Vault Protocol</h2>
              {(!project.documents || project.documents.length === 0) ? (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                   <FileText className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Vault Empty: Zero Documents Registered</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.documents.map(doc => (
                    <div key={doc.id} onClick={() => handleViewDocument(doc)} className="bg-white/5 p-8 rounded-[32px] border border-white/10 group hover:bg-white/[0.08] transition-all cursor-pointer relative overflow-hidden">
                       <div className="flex items-start gap-6">
                          <div className="p-4 bg-white/5 rounded-2xl text-gold-500 border border-white/10"><FileText size={24} /></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-white uppercase text-sm truncate">{doc.name}</p>
                            <p className="text-[9px] font-black text-slate-500 uppercase mt-2 tracking-widest">{doc.category} Protocol</p>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={(e) => { e.stopPropagation(); handleViewDocument(doc) }} className="p-3 bg-white/5 rounded-xl hover:text-gold-500 transition-all"><Eye size={16} /></button>
                             <button onClick={(e) => { e.stopPropagation(); handleDownload(doc, 'documents') }} className="p-3 bg-white/5 rounded-xl hover:text-gold-500 transition-all"><Download size={16} /></button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
         )}
      </main>

      {/* Share Modal Protocol */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-fade-in">
          <div className="bg-[#1e293b] rounded-[40px] shadow-2xl max-w-lg w-full border border-white/10 p-10 relative">
            <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Relay Entity Telemetry</h3>
            <p className="text-slate-400 font-medium leading-relaxed mb-10">Select a secure channel to broadcast project metrics.</p>
            
            <div className="space-y-4">
              <button onClick={() => handleShare('whatsapp')} className="w-full flex items-center justify-between p-6 bg-emerald-500 text-slate-950 rounded-3xl hover:bg-emerald-400 transition-all font-black text-[10px] uppercase tracking-[0.3em]"><span className="font-black text-[10px] uppercase tracking-[0.3em]">Secure WhatsApp</span><MessageCircle className="w-6 h-6" /></button>
              <button onClick={() => handleShare('email')} className="w-full flex items-center justify-between p-6 bg-white/5 text-white border border-white/10 rounded-3xl hover:bg-white/10 transition-all"><span className="font-black text-[10px] uppercase tracking-[0.3em]">Encrypted Email</span><Mail className="w-6 h-6" /></button>
            </div>
            
            <div className="mt-10 flex justify-center">
              <button onClick={() => setShowShareModal(false)} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.4em] transition-colors">Abort Protocol</button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal Protocol */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[200] p-4 md:p-10 animate-fade-in">
          <div className="bg-[#0f172a] rounded-[40px] w-full max-w-6xl h-full flex flex-col border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-8 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center">
                <div className="p-4 bg-gold-500/10 rounded-2xl text-gold-500 mr-6 border border-gold-500/20"><FileText className="w-6 h-6" /></div>
                <div>
                  <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-1">Asset Decryption</p>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{selectedDocument.name || selectedDocument.title}</h3>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => handleDownload(selectedDocument, 'viewer')} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-gold-500 hover:bg-white/10 transition-all"><Download className="w-6 h-6" /></button>
                <button onClick={handleCloseDocumentViewer} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden relative">
               <iframe src={getDocumentPreviewUrl(selectedDocument)} className="w-full h-full border-0 brightness-[0.8] grayscale-[0.5] contrast-[1.2] invert" title={selectedDocument.name || selectedDocument.title} />
            </div>
          </div>
        </div>
      )}
      {/* Project Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-[#1e293b] rounded-[40px] shadow-2xl max-w-lg w-full border border-white/10 p-10 relative">
            <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Report Anomaly</h3>
            <p className="text-slate-400 font-medium leading-relaxed mb-8">Direct relay to tactical command regarding this entity.</p>

            <textarea
              value={feedbackMsg}
              onChange={(e) => setFeedbackMsg(e.target.value)}
              placeholder="Describe the tactical disruption..."
              className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500/50 mb-8 h-32 resize-none"
            />

            <div className="space-y-4">
              <button
                onClick={submitProjectFeedback}
                disabled={isSubmittingFeedback || !feedbackMsg.trim()}
                className="w-full py-4 bg-rose-500 text-white rounded-2xl hover:bg-rose-400 transition-all font-black text-[10px] uppercase tracking-[0.3em] disabled:opacity-50"
              >
                {isSubmittingFeedback ? 'Synchronizing...' : 'Initialize Alert'}
              </button>
              <button onClick={() => setShowFeedbackModal(false)} className="w-full py-4 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.4em] transition-colors">Abort Protocol</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDetails
