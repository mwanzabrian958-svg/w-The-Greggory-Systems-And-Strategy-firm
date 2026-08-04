import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Link, useNavigate } from 'react-router-dom'
import { getApiUrl } from '../services/api'
import {
  Home, FolderKanban, CheckSquare, Users, DollarSign, FileText,
  MessageSquare, Bell, Star, Shield, BarChart2, Lock, Map, Plug,
  Download, Settings, Search, Menu, X, ChevronRight, ChevronDown,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Plus,
  Filter, MoreVertical, Calendar, Target, Zap, Award, Eye, Edit,
  Trash2, Upload, ExternalLink, RefreshCw, ArrowRight, Circle,
  AlertTriangle, Info, ThumbsUp, Send, Paperclip, Phone, Video,
  ToggleLeft, ToggleRight, Globe, Cpu, Database, Mail, Smartphone,
  ChevronLeft, Maximize2, Grid, List, Activity, PieChart, Layers,
  UserCheck, UserX, LogIn, LogOut, Key, Fingerprint, Flag, Bookmark,
  Tag, Hash, Briefcase, Building, MapPin, Link2, Share2, Printer,
  HelpCircle, LifeBuoy, GitBranch, GitMerge, Columns, Rows, Archive
} from 'lucide-react'

// ── TOAST ──────────────────────────────────────────────
let _toastFn = null
const useToast = () => {
  const [toasts, setToasts] = useState([])
  _toastFn = (msg, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000)
  }
  return toasts
}
const toast = (msg, type = 'success') => _toastFn && _toastFn(msg, type)

const ToastContainer = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
    {toasts.map(t => (
      <div key={t.id} className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white flex items-center gap-2 animate-fade-in
        ${t.type === 'error' ? 'bg-red-600' : t.type === 'warn' ? 'bg-yellow-500' : 'bg-emerald-600'}`}>
        {t.type === 'error' ? '✕' : t.type === 'warn' ? '⚠' : '✓'} {t.msg}
      </div>
    ))}
  </div>
)

// ── MODAL ──────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-md p-6 relative border border-slate-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-slate-600 dark:text-slate-300">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────

const projects = [
  { id: 1, name: 'Community Center Renovation', description: 'Renovation of the main community center with updated facilities', status: 'active', progress: 65, startDate: '2024-01-15', expectedCompletion: '2024-06-30', budget: 150000, spent: 97500, team: ['John Doe', 'Jane Smith', 'Mike Johnson'] },
  { id: 2, name: 'Youth Sports Program', description: 'Development of comprehensive youth sports facilities and programs', status: 'active', progress: 40, startDate: '2024-02-01', expectedCompletion: '2024-08-15', budget: 85000, spent: 34000, team: ['Sarah Wilson', 'Tom Brown'] },
  { id: 3, name: 'Educational Scholarship Fund', description: 'Scholarship program for underprivileged students', status: 'completed', progress: 100, startDate: '2023-09-01', expectedCompletion: '2024-01-31', budget: 50000, spent: 48500, team: ['Emily Davis', 'Robert Lee'] },
]

const mockTasks = [
  { id: 1, title: 'Finalize renovation blueprints', project: 'Community Center Renovation', priority: 'Critical', status: 'In Progress', assignee: 'John Doe', due: '2024-03-20', tags: ['Design', 'Architecture'] },
  { id: 2, title: 'Procurement of sports equipment', project: 'Youth Sports Program', priority: 'High', status: 'To Do', assignee: 'Sarah Wilson', due: '2024-03-25', tags: ['Procurement'] },
  { id: 3, title: 'Scholarship award ceremony planning', project: 'Educational Scholarship Fund', priority: 'Medium', status: 'Review', assignee: 'Emily Davis', due: '2024-02-28', tags: ['Event', 'Community'] },
  { id: 4, title: 'Electrical systems inspection', project: 'Community Center Renovation', priority: 'High', status: 'To Do', assignee: 'Mike Johnson', due: '2024-04-05', tags: ['Safety', 'Inspection'] },
  { id: 5, title: 'Publish scholarship recipients list', project: 'Educational Scholarship Fund', priority: 'Low', status: 'Complete', assignee: 'Robert Lee', due: '2024-02-10', tags: ['Communications'] },
  { id: 6, title: 'Youth coaching staff onboarding', project: 'Youth Sports Program', priority: 'High', status: 'In Progress', assignee: 'Tom Brown', due: '2024-04-01', tags: ['HR', 'Onboarding'] },
]

const mockTeam = [
  { id: 1, name: 'John Doe', role: 'Project Manager', avatar: 'JD', capacity: 85, projects: 2, status: 'active', email: 'john.doe@tgf.org', skills: ['Management', 'Architecture', 'Planning'] },
  { id: 2, name: 'Jane Smith', role: 'Lead Architect', avatar: 'JS', capacity: 70, projects: 1, status: 'active', email: 'jane.smith@tgf.org', skills: ['Architecture', 'AutoCAD', 'Design'] },
  { id: 3, name: 'Mike Johnson', role: 'Site Engineer', avatar: 'MJ', capacity: 90, projects: 1, status: 'active', email: 'mike.j@tgf.org', skills: ['Engineering', 'Site Inspection', 'Safety'] },
  { id: 4, name: 'Sarah Wilson', role: 'Program Coordinator', avatar: 'SW', capacity: 60, projects: 1, status: 'active', email: 's.wilson@tgf.org', skills: ['Coordination', 'Events', 'Community'] },
  { id: 5, name: 'Tom Brown', role: 'Sports Director', avatar: 'TB', capacity: 75, projects: 1, status: 'active', email: 'tom.b@tgf.org', skills: ['Sports Management', 'Coaching', 'HR'] },
  { id: 6, name: 'Emily Davis', role: 'Education Lead', avatar: 'ED', capacity: 50, projects: 1, status: 'away', email: 'e.davis@tgf.org', skills: ['Education', 'Grants', 'Research'] },
  { id: 7, name: 'Robert Lee', role: 'Communications', avatar: 'RL', capacity: 40, projects: 1, status: 'active', email: 'r.lee@tgf.org', skills: ['PR', 'Writing', 'Social Media'] },
]

const mockInvoices = [
  { id: 'INV-001', project: 'Community Center Renovation', amount: 45000, status: 'paid', date: '2024-01-20', due: '2024-02-20' },
  { id: 'INV-002', project: 'Community Center Renovation', amount: 32500, status: 'paid', date: '2024-02-15', due: '2024-03-15' },
  { id: 'INV-003', project: 'Youth Sports Program', amount: 20000, status: 'pending', date: '2024-03-01', due: '2024-04-01' },
  { id: 'INV-004', project: 'Youth Sports Program', amount: 14000, status: 'paid', date: '2024-02-10', due: '2024-03-10' },
  { id: 'INV-005', project: 'Educational Scholarship Fund', amount: 48500, status: 'paid', date: '2024-01-31', due: '2024-02-28' },
  { id: 'INV-006', project: 'Community Center Renovation', amount: 20000, status: 'overdue', date: '2024-02-28', due: '2024-03-10' },
]

const mockDocuments = [
  { id: 1, name: 'Community Center Contract.pdf', category: 'Contracts', project: 'Community Center Renovation', version: 'v2.1', size: '4.2 MB', date: '2024-01-15', author: 'John Doe' },
  { id: 2, name: 'Renovation Proposal Final.docx', category: 'Proposals', project: 'Community Center Renovation', version: 'v1.0', size: '2.8 MB', date: '2023-12-20', author: 'Jane Smith' },
  { id: 3, name: 'Q1 Progress Report.pdf', category: 'Reports', project: 'Community Center Renovation', version: 'v1.3', size: '1.5 MB', date: '2024-03-31', author: 'John Doe' },
  { id: 4, name: 'Youth Sports Proposal.pdf', category: 'Proposals', project: 'Youth Sports Program', version: 'v1.0', size: '3.1 MB', date: '2024-01-25', author: 'Sarah Wilson' },
  { id: 5, name: 'Scholarship Fund Deliverables.xlsx', category: 'Deliverables', project: 'Educational Scholarship Fund', version: 'v2.0', size: '0.9 MB', date: '2024-01-28', author: 'Emily Davis' },
  { id: 6, name: 'Sports Equipment Specs.pdf', category: 'Deliverables', project: 'Youth Sports Program', version: 'v1.1', size: '2.0 MB', date: '2024-02-15', author: 'Tom Brown' },
]

const mockMessages = [
  { id: 1, author: 'John Doe', avatar: 'JD', message: 'The blueprints have been updated. Please review the new electrical layout on page 12.', time: '10:32 AM', date: 'Today', project: 'Community Center Renovation', unread: true },
  { id: 2, author: 'Sarah Wilson', avatar: 'SW', message: 'Equipment vendor confirmed delivery for April 15th. Need sign-off on the purchase order.', time: '9:15 AM', date: 'Today', project: 'Youth Sports Program', unread: true },
  { id: 3, author: 'Emily Davis', avatar: 'ED', message: 'Scholarship recipients have been notified. Ceremony planning is underway for the 28th.', time: 'Yesterday', date: 'Yesterday', project: 'Educational Scholarship Fund', unread: false },
  { id: 4, author: 'Mike Johnson', avatar: 'MJ', message: 'Safety inspection passed with minor recommendations. Full report attached.', time: 'Mar 15', date: 'Mar 15', project: 'Community Center Renovation', unread: false },
]

const mockNotifications = [
  { id: 1, type: 'alert', title: 'Invoice Overdue', message: 'INV-006 for Community Center Renovation is 5 days overdue.', time: '2 hours ago', read: false, icon: AlertCircle, color: 'text-red-500' },
  { id: 2, type: 'info', title: 'Task Due Tomorrow', message: 'Finalize renovation blueprints is due on March 20th.', time: '4 hours ago', read: false, icon: Clock, color: 'text-yellow-500' },
  { id: 3, type: 'success', title: 'Milestone Reached', message: 'Community Center Renovation has hit 65% completion.', time: '1 day ago', read: true, icon: CheckCircle, color: 'text-green-500' },
  { id: 4, type: 'info', title: 'New Document Uploaded', message: 'Q1 Progress Report added by John Doe.', time: '2 days ago', read: true, icon: FileText, color: 'text-blue-500' },
  { id: 5, type: 'success', title: 'Project Completed', message: 'Educational Scholarship Fund has been marked complete.', time: '3 days ago', read: true, icon: Award, color: 'text-purple-500' },
]

const mockRisks = [
  { id: 1, title: 'Contractor Delays', project: 'Community Center Renovation', probability: 'High', impact: 'High', status: 'Mitigating', owner: 'John Doe', mitigation: 'Penalty clauses in contract; weekly check-ins' },
  { id: 2, title: 'Budget Overrun', project: 'Youth Sports Program', probability: 'Medium', impact: 'High', status: 'Monitoring', owner: 'Sarah Wilson', mitigation: '10% contingency reserve allocated' },
  { id: 3, title: 'Equipment Supply Chain', project: 'Youth Sports Program', probability: 'Low', impact: 'Medium', status: 'Open', owner: 'Tom Brown', mitigation: 'Identified 3 alternative suppliers' },
  { id: 4, title: 'Permit Delays', project: 'Community Center Renovation', probability: 'Medium', impact: 'Medium', status: 'Closed', owner: 'Mike Johnson', mitigation: 'Early permit application filed' },
]

const mockIntegrations = [
  { id: 1, name: 'Salesforce CRM', category: 'CRM', icon: Building, connected: true, lastSync: '5 min ago', description: 'Sync client contacts and opportunities' },
  { id: 2, name: 'QuickBooks', category: 'Accounting', icon: DollarSign, connected: true, lastSync: '1 hour ago', description: 'Two-way financial data sync' },
  { id: 3, name: 'Slack', category: 'Communications', icon: MessageSquare, connected: false, lastSync: null, description: 'Team messaging and notifications' },
  { id: 4, name: 'Google Drive', category: 'Storage', icon: Database, connected: true, lastSync: '30 min ago', description: 'Document storage and sharing' },
  { id: 5, name: 'Zoom', category: 'Communications', icon: Video, connected: false, lastSync: null, description: 'Video meetings and recordings' },
  { id: 6, name: 'HubSpot', category: 'CRM', icon: Globe, connected: false, lastSync: null, description: 'Marketing and lead management' },
]

const mockAccessLogs = [
  { id: 1, user: 'John Doe', action: 'Logged In', resource: 'Portal', ip: '192.168.1.45', time: '2024-03-18 10:32:00', status: 'Success' },
  { id: 2, user: 'Admin', action: 'Role Updated', resource: 'User: Emily Davis', ip: '10.0.0.5', time: '2024-03-18 09:15:22', status: 'Success' },
  { id: 3, user: 'Sarah Wilson', action: 'Document Exported', resource: 'Youth Sports Proposal.pdf', ip: '192.168.1.88', time: '2024-03-17 16:44:10', status: 'Success' },
  { id: 4, user: 'Unknown', action: 'Login Attempt', resource: 'Portal', ip: '83.14.22.101', time: '2024-03-17 03:12:55', status: 'Failed' },
]

const mockRoles = [
  { id: 1, role: 'Admin', users: 2, permissions: ['Full Access', 'User Management', 'Billing', 'Settings'], color: 'bg-red-100 text-red-700' },
  { id: 2, role: 'Project Manager', users: 3, permissions: ['Projects', 'Tasks', 'Team', 'Reports', 'Documents'], color: 'bg-blue-100 text-blue-700' },
  { id: 3, role: 'Contributor', users: 8, permissions: ['Projects (Read)', 'Tasks', 'Documents', 'Messages'], color: 'bg-green-100 text-green-700' },
  { id: 4, role: 'Viewer', users: 5, permissions: ['Projects (Read)', 'Reports (Read)'], color: 'bg-gray-100 text-gray-700' },
]

const mockMilestones = [
  { id: 1, title: 'Phase 1: Design Complete', project: 'Community Center Renovation', date: '2024-02-28', status: 'completed', color: 'bg-green-500' },
  { id: 2, title: 'Equipment Procurement', project: 'Youth Sports Program', date: '2024-04-15', status: 'upcoming', color: 'bg-blue-500' },
  { id: 3, title: 'Phase 2: Construction Start', project: 'Community Center Renovation', date: '2024-03-15', status: 'completed', color: 'bg-green-500' },
  { id: 4, title: 'Scholarship Disbursement', project: 'Educational Scholarship Fund', date: '2024-01-31', status: 'completed', color: 'bg-purple-500' },
  { id: 5, title: 'Grand Opening Ceremony', project: 'Community Center Renovation', date: '2024-06-30', status: 'upcoming', color: 'bg-orange-400' },
  { id: 6, title: 'Season Kickoff', project: 'Youth Sports Program', date: '2024-08-01', status: 'upcoming', color: 'bg-yellow-500' },
]

// ─────────────────────────────────────────────
// SIDEBAR NAV CONFIG
// ─────────────────────────────────────────────
const navSections = [
  { id: 'overview',       label: 'Overview',       icon: Home },
  { id: 'projects',       label: 'Projects',        icon: FolderKanban },
  { id: 'tasks',          label: 'Tasks',           icon: CheckSquare },
  { id: 'resources',      label: 'Resources',       icon: Users },
  { id: 'financials',     label: 'Financials',      icon: DollarSign },
  { id: 'documents',      label: 'Documents',       icon: FileText },
  { id: 'communication',  label: 'Communication',   icon: MessageSquare },
  { id: 'notifications',  label: 'Notifications',   icon: Bell },
  { id: 'feedback',       label: 'Feedback',        icon: Star },
  { id: 'risk',           label: 'Risk & Quality',  icon: Shield },
  { id: 'analytics',      label: 'Analytics',       icon: BarChart2 },
  { id: 'security',       label: 'Security',        icon: Lock },
  { id: 'roadmap',        label: 'Roadmap',         icon: Map },
  { id: 'integrations',   label: 'Integrations',    icon: Plug },
  { id: 'reports',        label: 'Reports',         icon: Download },
  { id: 'settings',       label: 'Settings',        icon: Settings },
]

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const getNotifConfig = (type) => {
  switch (type) {
    case 'alert':
    case 'risk_alert':
      return { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' }
    case 'success':
    case 'milestone_complete':
      return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
    case 'project_update':
    case 'task_assigned':
      return { icon: Clock, color: 'text-sky-400', bg: 'bg-sky-400/10' }
    case 'invoice_sent':
    case 'payment_received':
      return { icon: DollarSign, color: 'text-gold-500', bg: 'bg-gold-500/10' }
    default:
      return { icon: Bell, color: 'text-slate-400', bg: 'bg-slate-400/10' }
  }
}

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffInMs = now - date
  const diffInMins = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMins < 60) return `${diffInMins}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  return date.toLocaleDateString()
}

// ── HELPER COMPONENTS ──
const Badge = ({ label, color }) => (
  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${color}`}>
    {label}
  </span>
)

const StatusBadge = ({ status }) => {
  const map = {
    active:       'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    completed:    'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    pending:      'bg-gold-500/10 text-gold-600 dark:text-gold-400 border-gold-500/20',
    overdue:      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    paid:         'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    'In Progress':'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    'To Do':      'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10',
    'Review':     'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    'Complete':   'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Success:      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Failed:       'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    connected:    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    disconnected: 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10',
    Mitigating:   'bg-gold-500/10 text-gold-600 dark:text-gold-400 border-gold-500/20',
    Monitoring:   'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    Open:         'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    Closed:       'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10',
  }
  const cls = map[status] || 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'
  return <Badge label={status} color={cls} />
}

const PriorityBadge = ({ priority }) => {
  const map = {
    Critical: 'bg-rose-500/10 text-rose-600 dark:text-rose-500 border border-rose-500/20',
    High:     'bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-500/20',
    Medium:   'bg-gold-500/10 text-gold-600 dark:text-gold-500 border border-gold-500/20',
    Low:      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20',
  }
  return <Badge label={priority} color={map[priority] || 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'} />
}

const GradientBar = ({ value, max = 100 }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const gradient = pct >= 80
    ? 'from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
    : pct >= 60
      ? 'from-blue-500 to-sky-400'
      : pct >= 40
        ? 'from-gold-500 to-yellow-400'
        : 'from-rose-500 to-pink-400'
  return (
    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-1.5 rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

const SectionCard = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-white/5 backdrop-blur-2xl rounded-[28px] border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl transition-all duration-300 ${className}`}>
    {children}
  </div>
)

const KpiCard = ({ icon: Icon, label, value, delta, deltaLabel, color = 'bg-gold-500/10 text-gold-500 border-gold-500/20' }) => (
  <SectionCard className="flex flex-col gap-4 p-8 group hover:bg-white/[0.08] border border-white/10">
    <div className="flex items-center justify-between">
      <div className={`p-4 rounded-2xl ${color} border transition-transform group-hover:scale-110`}>
        <Icon className="w-6 h-6" />
      </div>
      {delta !== undefined && (
        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {delta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {Math.abs(delta)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">{label}</p>
      {deltaLabel && <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-2">{deltaLabel}</p>}
    </div>
  </SectionCard>
)

const Avatar = ({ initials, src = null, size = 'sm', color = 'bg-gradient-to-br from-blue-500 to-indigo-600' }) => {
  const sz = size === 'lg' ? 'w-16 h-16 text-lg' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-[10px]'
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-black uppercase tracking-tighter border-2 border-white/10 shadow-lg flex-shrink-0 overflow-hidden`}>
      {src ? (
        <img src={src} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )
}

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
    <div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
)

// ─────────────────────────────────────────────
// SECTION: OVERVIEW
// ─────────────────────────────────────────────
const OverviewSection = ({ user, data = null, notifs = [], isLoading = false }) => {
  const realProjects = data?.projects || []
  const totalBudget = realProjects.reduce((s, p) => s + (p.plannedBudget || 0), 0)
  const totalSpent = realProjects.reduce((s, p) => s + (p.actualBudget || 0), 0)
  const avgProgress = realProjects.length > 0
    ? Math.round(realProjects.reduce((s, p) => s + (p.progress || 0), 0) / realProjects.length)
    : 0

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Active Deployments', val: realProjects.filter(p => p.status === 'active' || p.status === 'in-progress').length, color: 'text-gold-500' },
          { label: 'Global Progress', val: `${avgProgress}%`, color: 'text-teal-400' },
          { label: 'Total Allocation', val: `KES ${(totalBudget / 1000).toFixed(0)}K`, color: 'text-emerald-400' },
          { label: 'Resource Burn', val: `KES ${(totalSpent / 1000).toFixed(0)}K`, color: 'text-rose-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl px-6 py-6 border border-slate-200 dark:border-white/10 flex-1 min-w-[160px] hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-xl dark:shadow-2xl">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color.includes('text-emerald') ? 'text-emerald-600 dark:text-emerald-400' : stat.color.includes('text-gold') ? 'text-gold-600 dark:text-gold-500' : stat.color.includes('text-teal') ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard icon={FolderKanban} label="Portfolio Units" value={realProjects.length} delta={0} deltaLabel="Live Project Nodes" color="bg-gold-500/10 text-gold-500 border-gold-500/20" />
        <KpiCard icon={CheckCircle} label="Success Protocols" value={realProjects.filter(p => p.status === 'completed').length} delta={0} deltaLabel="Deployment Accuracy" color="bg-teal-500/10 text-teal-500 border-teal-500/20" />
        <KpiCard icon={Clock} label="Pending Modules" value={(data?.tasks || []).filter(t => !['completed', 'cancelled'].includes(t.status)).length} delta={0} deltaLabel="Actionable Logic" color="bg-sky-500/10 text-sky-400 border-sky-500/20" />
        <KpiCard icon={AlertCircle} label="Resource Overruns" value={data?.budgetOverview?.variance > 0 ? `KES ${(data.budgetOverview.variance/1000).toFixed(0)}K` : 'Normal'} delta={0} deltaLabel="Capital Delta" color="bg-rose-500/10 text-rose-500 border-rose-500/20" />
      </div>

      {/* Project Summary Cards */}
      <div>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-white/5"></div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Strategic Summary</h3>
          <div className="h-px flex-1 bg-white/5"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
             <div className="lg:col-span-3 py-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                <RefreshCw className="w-12 h-12 text-gold-500/20 animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Compiling Deployment Matrix…</p>
             </div>
          ) : realProjects.length === 0 ? (
             <div className="lg:col-span-3 py-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                <Layers className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No Active Missions Found</p>
             </div>
          ) : (
            realProjects.map(p => (
              <SectionCard key={p.id} className="p-8 group hover:bg-white/[0.08] flex flex-col h-full border border-slate-200 dark:border-white/10">
                <div className="flex items-start justify-between mb-8 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-gold-500 uppercase tracking-widest mb-1">Entity-0{p.id}</p>
                    <h4 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight leading-tight">{p.name}</h4>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div className="mt-auto space-y-6">
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                      <span>Synchronization</span>
                      <span className="text-slate-900 dark:text-white">{p.progress}%</span>
                    </div>
                    <GradientBar value={p.progress} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Allocated</p>
                      <p className="text-xs font-black text-slate-900 dark:text-slate-300">KES {(p.plannedBudget || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Expended</p>
                      <p className="text-xs font-black text-emerald-400">KES {(p.actualBudget || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                       <Avatar initials={p.manager?.split(' ').map(n => n[0]).join('') || 'M'} size="sm" color="bg-blue-500" />
                    </div>
                    <button onClick={() => toast('Telemetry Link: Active', 'success')} className="text-[10px] font-black text-gold-500 uppercase tracking-[0.2em] hover:text-gold-400 transition-colors">
                      View Uplink
                    </button>
                  </div>
                </div>
              </SectionCard>
            ))
          )}
        </div>
      </div>

      {/* Recent Notifications Preview */}
      <SectionCard className="p-8 group hover:bg-white/[0.08] border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
             <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse"></div>
             Live Data Relay
          </h3>
          <button onClick={() => toast('Initializing Audit Log…', 'warn')} className="text-[10px] font-black text-gold-500 uppercase tracking-[0.2em] cursor-pointer hover:text-gold-400 transition-colors border-b border-gold-500/20 pb-0.5">Access Logs</button>
        </div>
        <div className="space-y-4">
          {isLoading ? (
             <div className="py-10 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-gold-500/20" /></div>
          ) : notifs.length === 0 ? (
             <div className="py-10 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">No Recent Transmissions</div>
          ) : (
            notifs.slice(0, 3).map(n => {
              const { icon: Icon, color } = getNotifConfig(n.notification_type)
              const isRead = n.status === 'read'
              return (
                <div key={n.id} className={`flex items-start gap-6 p-6 rounded-[24px] border transition-all
                  ${isRead ? 'bg-white/[0.01] border-white/5 opacity-60' : 'bg-white/[0.03] border-gold-500/20 shadow-lg shadow-gold-500/5'}`}>
                  <div className={`p-4 rounded-2xl bg-white/[0.02] border border-white/10 shadow-sm ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{n.title}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 uppercase tracking-widest">{n.message}</p>
                  </div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] whitespace-nowrap">{formatTime(n.created_at)}</span>
                </div>
              )
            })
          )}
        </div>
      </SectionCard>
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION: PROJECTS
// ─────────────────────────────────────────────
const ProjectsSection = ({ onView, onEdit }) => {
  const [viewMode, setViewMode] = useState('list')
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2">Portfolio Protocol</p>
           <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Deployment Matrix</h2>
        </div>
        <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-gold-500 transition-colors" />
              <input
                type="text"
                placeholder="Initialize Filter…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-11 pr-6 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500/40 transition-all text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 w-full md:w-64"
              />
            </div>
            <button
              onClick={() => setViewMode(v => v === 'list' ? 'kanban' : 'list')}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition text-gold-500"
              title="Toggle view"
            >
              {viewMode === 'list' ? <Columns className="w-5 h-5" /> : <List className="w-5 h-5" />}
            </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
          {['active', 'completed', 'pending'].map(col => (
            <div key={col} className="bg-slate-50 dark:bg-white/5 backdrop-blur-xl rounded-[32px] p-6 border border-slate-200 dark:border-white/10 min-w-[320px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${col === 'active' ? 'bg-emerald-500' : col === 'completed' ? 'bg-blue-500' : 'bg-gold-500'}`}></div>
                   <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">{col}</h3>
                </div>
                <span className="bg-slate-100 dark:bg-white/5 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
                  {filtered.filter(p => p.status === col).length}
                </span>
              </div>
              <div className="space-y-4">
                {filtered.filter(p => p.status === col).map(p => (
                  <div key={p.id} className="bg-white dark:bg-white/[0.02] rounded-[24px] p-6 border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer group shadow-sm dark:shadow-none" onClick={() => onView && onView(p)}>
                    <p className="text-[9px] font-black text-gold-500 uppercase tracking-widest mb-2">Entity-0{p.id}</p>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4 leading-tight group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">{p.name}</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">
                           <span>Sync</span>
                           <span className="text-slate-900 dark:text-white">{p.progress}%</span>
                        </div>
                        <GradientBar value={p.progress} />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex -space-x-1.5">
                           {p.team.slice(0, 2).map((t, i) => (
                             <Avatar key={i} initials={t.split(' ').map(n => n[0]).join('')} size="sm" />
                           ))}
                        </div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">ETA: {p.expectedCompletion.split('-').slice(1).join('/')}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.filter(p => p.status === col).length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-[24px]">
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Null Sprints</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List / Gantt-style View */
        <div className="space-y-6">
          {filtered.map(p => (
            <SectionCard key={p.id} className="p-8 group hover:bg-white/[0.08] border border-white/10 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                 <Layers className="w-32 h-32" />
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center gap-10 relative z-10">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <p className="text-[10px] font-black text-gold-500 uppercase tracking-widest">Protocol Entity-0{p.id}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3 group-hover:text-gold-400 transition-colors">{p.name}</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-2xl">{p.description}</p>

                  {/* Gantt-style progress bar */}
                  <div className="mt-10">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">
                      <span className="flex items-center gap-2">
                        <Activity size={14} className="text-gold-500" />
                        Execution Timeline
                      </span>
                      <span className="text-white">{p.progress}% Synchronized</span>
                    </div>
                    <div className="relative w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-400 transition-all duration-1000 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-600 mt-4">
                      <span>INIT: {p.startDate}</span>
                      <span>TERM: {p.expectedCompletion}</span>
                    </div>
                  </div>
                </div>

                <div className="lg:w-72 space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Asset Value</p>
                      <p className="text-xs font-black text-white">KES {p.budget.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Burn Rate</p>
                      <p className="text-xs font-black text-emerald-400">KES {p.spent.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                     <div className="flex -space-x-2">
                       {p.team.map((t, i) => (
                         <Avatar key={i} initials={t.split(' ').map(n => n[0]).join('')} size="sm" />
                       ))}
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => onView && onView(p)} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition text-gold-500" title="Telemetry">
                           <Eye size={16} />
                        </button>
                        <button onClick={() => onEdit && onEdit(p)} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition text-slate-400" title="Modify">
                           <Edit size={16} />
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION: TASKS
// ─────────────────────────────────────────────
const TasksSection = ({ onAddTask }) => {
  const cols = ['To Do', 'In Progress', 'Review', 'Complete']
  const colColors = {
    'To Do':       'border-t-slate-500',
    'In Progress': 'border-t-blue-500',
    'Review':      'border-t-purple-500',
    'Complete':    'border-t-emerald-500',
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2">Module Protocol</p>
           <h2 className="text-3xl font-black text-white uppercase tracking-tight">Execution Board</h2>
        </div>
        <button onClick={() => onAddTask && onAddTask()} className="flex items-center justify-center gap-3 bg-gold-500 text-slate-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20">
          <Plus className="w-4 h-4" /> Initialize Task
        </button>
      </div>

      {/* Priority Legend */}
      <div className="flex flex-wrap gap-4 items-center bg-white/5 border border-white/10 p-6 rounded-2xl">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Priority Levels:</span>
        <div className="flex flex-wrap gap-2">
           {['Critical','High','Medium','Low'].map(p => <PriorityBadge key={p} priority={p} />)}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 overflow-x-auto pb-4">
        {cols.map(col => (
          <div key={col} className={`bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 p-6 min-h-[500px] min-w-[300px] relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${col === 'In Progress' ? 'from-blue-600 to-sky-400' : col === 'Review' ? 'from-purple-600 to-pink-400' : col === 'Complete' ? 'from-emerald-600 to-teal-400' : 'from-slate-600 to-slate-400'}`} />

            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">{col}</h3>
              <span className="bg-white/5 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full border border-white/10 shadow-inner">
                {mockTasks.filter(t => t.status === col).length}
              </span>
            </div>

            <div className="space-y-4">
              {mockTasks.filter(t => t.status === col).map(task => (
                <div key={task.id} onClick={() => toast(`Module: ${task.title}`, 'success')} className="bg-white/[0.02] rounded-[24px] p-6 border border-white/5 hover:bg-white/[0.05] hover:border-white/20 transition-all cursor-pointer group shadow-lg">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <p className="text-sm font-black text-white uppercase tracking-wider leading-tight group-hover:text-gold-400 transition-colors">{task.title}</p>
                    <button onClick={e => { e.stopPropagation(); toast('Secure options encrypted', 'warn') }} className="p-1 rounded-lg hover:bg-white/10 transition">
                      <MoreVertical className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-1 rounded-full bg-gold-500"></div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{task.project}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {task.tags.map(tag => (
                      <span key={tag} className="bg-white/5 text-slate-400 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-white/5">{tag}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <PriorityBadge priority={task.priority} />
                    <Avatar initials={task.assignee.split(' ').map(n => n[0]).join('')} size="sm" />
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>DUE: {task.due}</span>
                  </div>
                </div>
              ))}
              <button onClick={() => onAddTask && onAddTask()} className="w-full border-2 border-dashed border-white/5 rounded-[24px] py-6 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] hover:border-gold-500/20 hover:text-gold-500 hover:bg-gold-500/[0.02] transition-all flex items-center justify-center gap-2 mt-2">
                <Plus className="w-4 h-4" /> Add Module
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION: RESOURCES
// ─────────────────────────────────────────────
const ResourcesSection = () => (
  <div className="space-y-10">
    <div>
       <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2">Human Protocol</p>
       <h2 className="text-3xl font-black text-white uppercase tracking-tight">Active Personnel</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {mockTeam.map(member => (
        <SectionCard key={member.id} className="p-8 group hover:bg-white/[0.08] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-3xl -z-10 group-hover:bg-gold-500/10 transition-colors" />

          <div className="flex items-center gap-6 mb-8">
            <Avatar initials={member.avatar} size="lg"
              color={member.status === 'away' ? 'bg-white/10 border border-white/10' : 'bg-gradient-to-br from-gold-400 to-gold-600'} />
            <div>
              <p className="text-lg font-black text-white uppercase tracking-tight">{member.name}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">{member.role}</p>
              <div className="flex items-center gap-2 mt-3">
                <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gold-500'}`} />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{member.status} protocol</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">
                <span>Synchronization Load</span>
                <span className={`font-black ${member.capacity >= 80 ? 'text-rose-500' : member.capacity >= 60 ? 'text-orange-500' : 'text-emerald-400'}`}>
                  {member.capacity}%
                </span>
              </div>
              <GradientBar value={member.capacity} />
            </div>
            <div className="flex flex-wrap gap-2">
              {member.skills.slice(0, 3).map(s => (
                <span key={s} className="bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/5">{s}</span>
              ))}
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <span className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest"><Briefcase className="w-3.5 h-3.5" />{member.projects} Units</span>
              <button onClick={() => toast(`Encrypted relay sent to ${member.email}`, 'success')} className="text-[9px] font-black text-gold-500 uppercase tracking-widest hover:text-gold-400 transition-colors flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Direct Sync
              </button>
            </div>
          </div>
        </SectionCard>
      ))}
    </div>

    {/* Resource Calendar Stub */}
    <SectionCard className="p-8 border border-white/10">
      <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
         <Calendar className="w-4 h-4 text-gold-500" />
         Deployment Schedule — {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
      </h3>
      <div className="grid grid-cols-7 gap-2 text-center text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="py-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 31 }, (_, i) => {
          const day = i + 1
          const hasMeeting = [5, 12, 15, 19, 26].includes(day)
          const isToday = day === new Date().getDate()
          return (
            <div key={day}
              onClick={() => hasMeeting ? toast(`Protocol session scheduled: Day ${day}`, 'success') : toast(`Cycle Clear: Day ${day}`)}
              className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all cursor-pointer border
                ${isToday ? 'bg-gold-500 text-slate-950 border-gold-500 shadow-xl shadow-gold-500/20' : hasMeeting ? 'bg-white/5 text-gold-500 border-gold-500/20 hover:bg-white/10' : 'bg-white/[0.01] text-slate-500 border-white/5 hover:border-white/10 hover:text-white'}`}>
              {day}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-6 mt-8 pt-8 border-t border-white/5">
        <div className="flex items-center gap-2.5">
           <div className="w-3 h-3 rounded bg-gold-500 shadow-lg shadow-gold-500/20" />
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Node</span>
        </div>
        <div className="flex items-center gap-2.5">
           <div className="w-3 h-3 rounded bg-white/5 border border-gold-500/20" />
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Planned Protocol</span>
        </div>
      </div>
    </SectionCard>
  </div>
)

// ─────────────────────────────────────────────
// SECTION: FINANCIALS
// ─────────────────────────────────────────────
const FinancialsSection = () => {
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0)
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0)
  const remaining = totalBudget - totalSpent
  const utilPct = Math.round((totalSpent / totalBudget) * 100)

  // CSS-only donut segments
  const segments = [
    { label: 'Community Hub', pct: Math.round((projects[0].spent / totalSpent) * 100), color: '#f59e0b' },
    { label: 'Athletic Units', pct: Math.round((projects[1].spent / totalSpent) * 100), color: '#38bdf8' },
    { label: 'Strategic Fund', pct: Math.round((projects[2].spent / totalSpent) * 100), color: '#10b981' },
  ]
  let cumulativePct = 0

  return (
    <div className="space-y-10">
      <div>
         <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2">Capital Protocol</p>
         <h2 className="text-3xl font-black text-white uppercase tracking-tight">Financial Ledger</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard icon={DollarSign} label="Total Allocation" value={`KES ${(totalBudget / 1000).toFixed(0)}K`} color="bg-gold-500/10 text-gold-500 border-gold-500/20" />
        <KpiCard icon={TrendingUp} label="Actual Burn" value={`KES ${(totalSpent / 1000).toFixed(0)}K`} delta={utilPct} deltaLabel="Utilization Index" color="bg-sky-500/10 text-sky-400 border-sky-500/20" />
        <KpiCard icon={CheckCircle} label="Reserve Capital" value={`KES ${(remaining / 1000).toFixed(0)}K`} color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
        <KpiCard icon={AlertCircle} label="Risk Exposure" value="KES 2.0M" color="bg-rose-500/10 text-rose-500 border-rose-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Donut Chart (CSS-only) */}
        <SectionCard className="flex flex-col items-center p-10 border border-white/10 group hover:bg-white/[0.08]">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-10 self-start">Burn Matrix</h3>
          <div className="relative w-48 h-48 flex-shrink-0" style={{ borderRadius: '50%' }}>
            <svg viewBox="0 0 36 36" className="w-48 h-48 -rotate-90">
              <circle cx="18" cy="18" r="15.9154943" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              {segments.map((seg, idx) => {
                const startPct = cumulativePct
                cumulativePct += seg.pct
                const strokeDasharray = `${seg.pct} ${100 - seg.pct}`
                const strokeDashoffset = -startPct
                return (
                  <circle key={idx} cx="18" cy="18" r="15.9154943"
                    fill="transparent" stroke={seg.color} strokeWidth="3.5"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                    className="drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-4xl font-black text-white">{utilPct}%</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Expended</p>
            </div>
          </div>
          <div className="space-y-4 mt-10 w-full">
            {segments.map((seg, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{seg.label}</span>
                </div>
                <span className="text-xs font-black text-white">{seg.pct}%</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Budget per project */}
        <SectionCard className="lg:col-span-2 p-10 border border-white/10 group hover:bg-white/[0.08]">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-10">Entity Allocation Tracker</h3>
          <div className="space-y-8">
            {projects.map(p => {
              const pct = Math.round((p.spent / p.budget) * 100)
              return (
                <div key={p.id} className="group/item">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                       <p className="text-[9px] font-black text-gold-500 uppercase tracking-widest mb-1">Entity-0{p.id}</p>
                       <span className="text-sm font-black text-white uppercase tracking-wider">{p.name}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-black text-slate-300">KES {p.spent.toLocaleString()}</span>
                       <span className="text-slate-600 text-[10px] font-black mx-2">/</span>
                       <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">KES {p.budget.toLocaleString()}</span>
                    </div>
                  </div>
                  <GradientBar value={p.spent} max={p.budget} />
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 mt-4">
                    <span className="text-gold-500">{pct}% Utilization</span>
                    <span>Remaining: KES {(p.budget - p.spent).toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>
      </div>

      {/* Invoice List */}
      <SectionCard className="p-8 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Capital Transmission Records</h3>
          <button onClick={() => toast('Compiling Encrypted CSV…')} className="flex items-center gap-2 text-[10px] font-black text-gold-500 uppercase tracking-[0.2em] hover:text-gold-400 transition-all border-b border-gold-500/20 pb-0.5">
            <Download className="w-3.5 h-3.5" /> Export Ledger
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                {['Transmission','Deployment','Value','Protocol Date','Due Date','Protocol Status',''].map(h => (
                  <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5 text-sm font-black text-gold-500 font-mono tracking-tighter">{inv.id}</td>
                  <td className="px-6 py-5 text-xs font-black text-white uppercase tracking-wider">{inv.project}</td>
                  <td className="px-6 py-5 text-sm font-black text-white">KES {inv.amount.toLocaleString()}</td>
                  <td className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{inv.date.replace('2024', new Date().getFullYear())}</td>
                  <td className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{inv.due.replace('2024', new Date().getFullYear())}</td>
                  <td className="px-6 py-5"><StatusBadge status={inv.status} /></td>
                  <td className="px-6 py-5">
                    <button onClick={() => toast(`Initializing Download: ${inv.id}…`)} className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-gold-500 hover:bg-white/10 transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION: DOCUMENTS
// ─────────────────────────────────────────────
const DocumentsSection = () => {
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = ['All', 'Contracts', 'Proposals', 'Reports', 'Deliverables']
  const filtered = activeCategory === 'All' ? mockDocuments : mockDocuments.filter(d => d.category === activeCategory)
  const docTypeIcon = { Contracts: Lock, Proposals: FileText, Reports: BarChart2, Deliverables: CheckSquare }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2">Vault Protocol</p>
           <h2 className="text-3xl font-black text-white uppercase tracking-tight">Secure Repository</h2>
        </div>
        <button onClick={() => toast('Initializing Secure Upload…', 'warn')} className="flex items-center justify-center gap-3 bg-gold-500 text-slate-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20">
          <Upload className="w-4 h-4" /> Secure Transmission
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border
              ${activeCategory === cat ? 'bg-gold-500 text-slate-950 border-gold-500 shadow-lg shadow-gold-500/20' : 'bg-white/5 text-slate-500 border-white/10 hover:bg-white/10 hover:text-white'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(doc => {
          const Icon = docTypeIcon[doc.category] || FileText
          return (
            <SectionCard key={doc.id} className="p-8 group hover:bg-white/[0.08] border border-white/10 cursor-pointer overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                 <Icon className="w-24 h-24" />
              </div>

              <div className="flex items-start gap-6 relative z-10">
                <div className="p-5 bg-white/5 rounded-2xl text-gold-500 border border-white/10 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-black text-white text-sm uppercase tracking-wider truncate">{doc.name}</p>
                    <span className="bg-white/5 text-slate-500 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-white/5 whitespace-nowrap">{doc.version}</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{doc.project}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-6">
                    <span className="bg-gold-500/10 text-gold-500 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md border border-gold-500/20">{doc.category}</span>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{doc.size}</span>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{doc.date}</span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button onClick={() => toast(`Decrypting ${doc.name}…`)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-gold-500 border border-white/10 transition-all shadow-lg"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => toast(`Downloading Encrypted Blob: ${doc.name}…`)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-gold-500 border border-white/10 transition-all shadow-lg"><Download className="w-4 h-4" /></button>
                </div>
              </div>
            </SectionCard>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION: COMMUNICATION
// ─────────────────────────────────────────────
const CommunicationSection = () => {
  const [msg, setMsg] = useState('')

  const meetings = [
    { id: 1, title: 'Weekly Project Sync', date: 'Mar 20, 2024', time: '10:00 AM', attendees: 5, type: 'Video' },
    { id: 2, title: 'Budget Review Q1', date: 'Mar 22, 2024', time: '2:00 PM', attendees: 3, type: 'In-Person' },
    { id: 3, title: 'Scholarship Ceremony Planning', date: 'Mar 28, 2024', time: '11:00 AM', attendees: 4, type: 'Video' },
  ]

  return (
    <div className="space-y-10">
      <div>
         <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2">Sync Protocol</p>
         <h2 className="text-3xl font-black text-white uppercase tracking-tight">Communication Hub</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Message Threads */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8">Secure Discussion Threads</h3>
          <div className="space-y-4">
            {mockMessages.map(m => (
              <SectionCard key={m.id} className={`p-8 group hover:bg-white/[0.08] transition-all cursor-pointer border border-white/10 ${m.unread ? 'border-l-4 border-l-gold-500 shadow-lg shadow-gold-500/5' : ''}`}>
                <div className="flex items-start gap-6">
                  <Avatar initials={m.avatar} size="md"
                    color={m.unread ? 'bg-gradient-to-br from-gold-400 to-gold-600 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-white/10 border border-white/10'} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-white text-sm uppercase tracking-wider">{m.author}</span>
                        {m.unread && <div className="w-1.5 h-1.5 bg-gold-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
                      </div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{m.time}</span>
                    </div>
                    <p className="text-[9px] font-black text-gold-500 uppercase tracking-widest mb-2">Entity Uplink: {m.project}</p>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">{m.message}</p>
                  </div>
                </div>
              </SectionCard>
            ))}
          </div>

          {/* Compose */}
          <SectionCard className="p-8 border border-white/10 mt-10">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Initialize New Relay</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder="Enter encrypted protocol message…"
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all"
              />
              <div className="flex gap-3">
                 <button
                   onClick={() => { setMsg(''); toast('Transmission Complete!') }}
                   className="bg-gold-500 text-slate-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20 flex items-center gap-3"
                 >
                   <Send className="w-4 h-4" /> Initialize
                 </button>
                 <button onClick={() => toast('Vault attachment protocol active', 'warn')} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition text-slate-400 hover:text-white">
                   <Paperclip className="w-5 h-5" />
                 </button>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Meeting Scheduler */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8">Active Synchronizations</h3>
          <div className="space-y-4">
            {meetings.map(meet => (
              <SectionCard key={meet.id} className="p-6 border border-white/10 group hover:bg-white/[0.08] transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl border border-white/10 ${meet.type === 'Video' ? 'bg-gold-500/10 text-gold-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {meet.type === 'Video' ? <Video className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                  </div>
                  <p className="font-black text-white text-sm uppercase tracking-wider">{meet.title}</p>
                </div>
                <div className="space-y-3 pl-2">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest"><Calendar className="w-3.5 h-3.5" />{meet.date}</div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest"><Clock className="w-3.5 h-3.5" />{meet.time}</div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest"><Users className="w-3.5 h-3.5" />{meet.attendees} Personnel</div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={() => toast(`Establishing Link: ${meet.title}…`)} className="flex-1 bg-gold-500 text-slate-950 text-[9px] font-black uppercase tracking-[0.2em] py-3 rounded-xl hover:bg-gold-400 transition shadow-lg shadow-gold-500/10">Initialize Link</button>
                  <button onClick={() => toast(`Accessing Protocol: ${meet.title}`)} className="flex-1 bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] py-3 rounded-xl border border-white/5 hover:bg-white/10 transition">Telemetry</button>
                </div>
              </SectionCard>
            ))}
          </div>
          <button onClick={() => toast('Scheduler protocol encrypted', 'warn')} className="w-full border-2 border-dashed border-white/5 rounded-[32px] py-8 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] hover:border-gold-500/20 hover:text-gold-500 hover:bg-gold-500/[0.02] transition-all flex items-center justify-center gap-3 mt-6">
            <Plus className="w-4 h-4" /> Schedule Sync
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION: NOTIFICATIONS
// ─────────────────────────────────────────────
const NotificationsSection = ({ user, notifs = [], isLoading = false, onToggleRead, onAcknowledgeAll, onRefresh }) => {
  const userId = user?.id || user?.userId

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
           <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2">Relay Protocol</p>
           <h2 className="text-3xl font-black text-white uppercase tracking-tight">Data Inbox</h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gold-500 disabled:opacity-50"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="max-w-4xl">
        {/* Notification List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">System Relays</h3>
            <button
              onClick={onAcknowledgeAll}
              disabled={notifs.length === 0 || notifs.every(n => n.status === 'read')}
              className="text-[10px] font-black text-gold-500 uppercase tracking-[0.2em] hover:text-gold-400 transition-all border-b border-gold-500/20 pb-0.5 disabled:opacity-30 disabled:cursor-not-allowed">
              Acknowledge All
            </button>
          </div>

          {isLoading ? (
            <div className="py-20 text-center">
               <RefreshCw className="w-10 h-10 text-gold-500/20 animate-spin mx-auto mb-4" />
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Scanning Frequencies…</p>
            </div>
          ) : notifs.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[32px]">
               <Bell className="w-10 h-10 text-slate-700 mx-auto mb-4" />
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Relay Silence: No Active Notifications</p>
            </div>
          ) : (
            notifs.map(n => {
              const { icon: Icon, color, bg } = getNotifConfig(n.notification_type)
              const isRead = n.status === 'read'
              return (
                <div
                  key={n.id}
                  onClick={() => !isRead && onToggleRead(n.id)}
                  className={`flex items-start gap-6 p-6 rounded-[24px] border transition-all
                    ${isRead
                      ? 'bg-white/[0.01] border-white/5 opacity-60 grayscale-[0.5]'
                      : 'bg-white/[0.03] border-gold-500/20 shadow-lg shadow-gold-500/5 cursor-pointer hover:bg-white/[0.05]'}`}>
                  <div className={`p-4 rounded-2xl bg-white/[0.02] border border-white/10 shadow-sm ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <p className={`text-sm font-black uppercase tracking-wider ${isRead ? 'text-slate-300' : 'text-white'}`}>{n.title}</p>
                      {!isRead && <div className="w-2 h-2 bg-gold-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)] flex-shrink-0 animate-pulse" />}
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2 uppercase tracking-widest">{n.message}</p>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-4 flex items-center gap-2">
                       <Clock size={10} />
                       {formatTime(n.created_at)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION: FEEDBACK
// ─────────────────────────────────────────────
const FeedbackSection = () => {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [featureRequests, setFeatureRequests] = useState([
    { id: 1, title: 'Mobile app for field teams', votes: 24, status: 'Under Review' },
    { id: 2, title: 'Bulk document upload', votes: 18, status: 'Planned' },
    { id: 3, title: 'Gantt chart export to PDF', votes: 15, status: 'In Progress' },
    { id: 4, title: 'Multi-currency support', votes: 9, status: 'Open' },
  ])

  return (
    <div className="space-y-6">
      <SectionHeader title="Feedback & Support" subtitle="Rate your experience, report issues, and request features" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Satisfaction Survey */}
        <SectionCard>
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" />Satisfaction Survey</h3>
          <p className="text-sm text-slate-600 mb-4">How would you rate your experience with the portal this month?</p>
          <div className="flex gap-2 mb-5">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(s)}
                className="transition-transform hover:scale-110">
                <Star className={`w-8 h-8 transition-colors ${s <= (hovered || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
              </button>
            ))}
          </div>
          <textarea rows={3} placeholder="Tell us more about your experience…"
            className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3" />
          <button onClick={() => { if (rating > 0) { toast('Thank you for your feedback!', 'success') } else { toast('Please select a star rating first', 'warn') } }} className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">Submit Feedback</button>
        </SectionCard>

        {/* Issue Report */}
        <SectionCard>
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" />Report an Issue</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Issue Type</label>
              <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Bug / Error</option>
                <option>Performance Issue</option>
                <option>Data Discrepancy</option>
                <option>Access Problem</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
              <textarea rows={3} placeholder="Describe the issue in detail…"
                className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={() => toast('Issue report submitted. We will respond within 24 hours.', 'success')} className="w-full bg-red-50 text-red-600 border border-red-200 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition">Submit Report</button>
          </div>
        </SectionCard>
      </div>

      {/* Feature Requests */}
      <SectionCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Zap className="w-4 h-4 text-purple-500" />Feature Requests</h3>
          <button onClick={() => toast('Feature request form coming soon', 'warn')} className="flex items-center gap-1 text-sm bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl hover:bg-purple-100 transition">
            <Plus className="w-3.5 h-3.5" /> Request Feature
          </button>
        </div>
        <div className="space-y-3">
          {featureRequests.map(fr => (
            <div key={fr.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-purple-200 transition">
              <button onClick={() => { setFeatureRequests(prev => prev.map(f => f.id === fr.id ? {...f, votes: f.votes + 1} : f)); toast('Vote recorded!') }} className="flex flex-col items-center bg-white border border-slate-200 rounded-xl px-3 py-2 hover:border-purple-400 hover:text-purple-600 transition min-w-12">
                <TrendingUp className="w-3.5 h-3.5 mb-0.5" />
                <span className="text-xs font-bold">{fr.votes}</span>
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{fr.title}</p>
              </div>
              <StatusBadge status={fr.status} />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION: RISK & QUALITY
// ─────────────────────────────────────────────
const RiskSection = () => {
  const qaChecklist = [
    { item: 'All deliverables reviewed by PM', done: true },
    { item: 'Client sign-off on Phase 1', done: true },
    { item: 'Safety audit completed', done: false },
    { item: 'Budget reconciliation for Q1', done: false },
    { item: 'Stakeholder report submitted', done: true },
    { item: 'Environmental impact assessment', done: false },
  ]
  const [checks, setChecks] = useState(qaChecklist)

  const probImpactColor = (prob, impact) => {
    const score = (prob === 'High' ? 3 : prob === 'Medium' ? 2 : 1) * (impact === 'High' ? 3 : impact === 'Medium' ? 2 : 1)
    if (score >= 6) return 'bg-red-50 border-red-200'
    if (score >= 3) return 'bg-yellow-50 border-yellow-200'
    return 'bg-green-50 border-green-200'
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Risk & Quality" subtitle="Risk register, probability-impact assessment, and QA checklist" />

      {/* Risk Matrix Legend */}
      <SectionCard>
        <h3 className="font-semibold text-slate-800 mb-4">Probability / Impact Matrix</h3>
        <div className="grid grid-cols-4 gap-2 text-xs text-center mb-4">
          <div className="font-medium text-slate-500 py-2">Probability ↓ / Impact →</div>
          {['Low Impact','Med Impact','High Impact'].map(h => (
            <div key={h} className="font-semibold text-slate-600 py-2 bg-slate-50 rounded-lg">{h}</div>
          ))}
          {[['High Prob','bg-yellow-50','bg-orange-100','bg-red-100'],
            ['Med Prob','bg-green-50','bg-yellow-50','bg-orange-100'],
            ['Low Prob','bg-green-50','bg-green-50','bg-yellow-50']].map(row => (
            <>{row.slice(1).reduce((acc, bg, i) => {
              if (i === 0) return [<div key="label" className="font-medium text-slate-600 py-2 flex items-center justify-center">{row[0]}</div>]
              return acc
            }, [<div key="label" className="font-medium text-slate-600 py-2 flex items-center justify-center">{row[0]}</div>])}</>
          ))}
        </div>

        {/* Risk Register Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Risk','Project','Probability','Impact','Status','Owner','Mitigation'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockRisks.map(risk => (
                <tr key={risk.id} className={`hover:bg-slate-50 transition`}>
                  <td className="py-3 pr-4 font-medium text-slate-800 text-xs max-w-32">{risk.title}</td>
                  <td className="py-3 pr-4 text-xs text-slate-500 max-w-28 truncate">{risk.project}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${risk.probability === 'High' ? 'bg-red-100 text-red-700' : risk.probability === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {risk.probability}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${risk.impact === 'High' ? 'bg-red-100 text-red-700' : risk.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {risk.impact}
                    </span>
                  </td>
                  <td className="py-3 pr-4"><StatusBadge status={risk.status} /></td>
                  <td className="py-3 pr-4 text-xs text-slate-600">{risk.owner}</td>
                  <td className="py-3 text-xs text-slate-500 max-w-40">{risk.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* QA Checklist */}
      <SectionCard>
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-500" />Quality Assurance Checklist
        </h3>
        <div className="space-y-2">
          {checks.map((c, i) => (
            <div key={i} onClick={() => { const done = !checks[i].done; setChecks(prev => prev.map((ch, j) => j === i ? { ...ch, done: !ch.done } : ch)); toast(done ? 'Item marked complete ✓' : 'Item marked incomplete') }}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition
                ${c.done ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 hover:border-emerald-200'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition
                ${c.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                {c.done && <CheckCircle className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`text-sm ${c.done ? 'line-through text-emerald-600' : 'text-slate-700'}`}>{c.item}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>{checks.filter(c => c.done).length} of {checks.length} completed</span>
          <GradientBar value={checks.filter(c => c.done).length} max={checks.length} />
        </div>
      </SectionCard>
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION: ANALYTICS
// ─────────────────────────────────────────────
const AnalyticsSection = () => {
  const healthScore = 78
  const kpis = [
    { icon: Target, label: 'On-Time Delivery Rate', value: '87%', delta: 4, color: 'bg-emerald-50 text-emerald-600' },
    { icon: DollarSign, label: 'Budget Efficiency', value: '91%', delta: -2, color: 'bg-blue-50 text-blue-600' },
    { icon: Users, label: 'Team Utilization', value: '74%', delta: 6, color: 'bg-purple-50 text-purple-600' },
    { icon: CheckSquare, label: 'Task Completion Rate', value: '83%', delta: 8, color: 'bg-orange-50 text-orange-600' },
    { icon: Star, label: 'Client Satisfaction', value: '4.7/5', delta: 3, color: 'bg-yellow-50 text-yellow-600' },
    { icon: AlertCircle, label: 'Risk Exposure', value: 'Medium', color: 'bg-red-50 text-red-500' },
  ]

  const trends = [
    { month: 'Oct', progress: 35 }, { month: 'Nov', progress: 48 },
    { month: 'Dec', progress: 52 }, { month: 'Jan', progress: 60 },
    { month: 'Feb', progress: 65 }, { month: 'Mar', progress: 68 },
  ]
  const maxTrend = Math.max(...trends.map(t => t.progress))

  return (
    <div className="space-y-6">
      <SectionHeader title="Analytics & Performance" subtitle="KPIs, health scores, and project performance trends" />

      {/* Health Score */}
      <SectionCard>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                <circle cx="18" cy="18" r="15.9154943" fill="transparent" stroke="#e2e8f0" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9154943" fill="transparent"
                  stroke={healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#3b82f6' : '#f59e0b'}
                  strokeWidth="3"
                  strokeDasharray={`${healthScore} ${100 - healthScore}`}
                  strokeDashoffset="0"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-slate-800">{healthScore}</p>
                <p className="text-xs text-slate-400">/ 100</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-700 mt-2">Overall Health Score</p>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mt-1">Good</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 mb-3">Portfolio Health Breakdown</h3>
            <div className="space-y-2">
              {[['Schedule Performance',82],['Budget Performance',91],['Quality Index',74],['Risk Score',65]].map(([label, val]) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-slate-500 mb-1"><span>{label}</span><span className="font-semibold">{val}%</span></div>
                  <GradientBar value={val} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} />)}
      </div>

      {/* Trend Chart (CSS Bar Chart) */}
      <SectionCard>
        <h3 className="font-semibold text-slate-800 mb-4">Average Progress Trend (6 Months)</h3>
        <div className="flex items-end gap-3 h-40 px-2">
          {trends.map((t, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-slate-500 font-medium">{t.progress}%</span>
              <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-indigo-400 transition-all duration-700"
                style={{ height: `${(t.progress / maxTrend) * 100}%`, minHeight: '4px' }} />
              <span className="text-xs text-slate-400">{t.month}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION: SECURITY
// ─────────────────────────────────────────────
const SecuritySection = () => {
  const [twoFAEnabled, setTwoFAEnabled] = useState(true)

  return (
    <div className="space-y-6">
      <SectionHeader title="Security & Access Control" subtitle="Two-factor auth, access logs, RBAC, and audit trail" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2FA Status */}
        <SectionCard>
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Fingerprint className="w-4 h-4 text-blue-500" />Two-Factor Authentication</h3>
          <div className={`p-4 rounded-xl border ${twoFAEnabled ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} mb-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-sm ${twoFAEnabled ? 'text-emerald-700' : 'text-red-700'}`}>
                  2FA is {twoFAEnabled ? 'Enabled' : 'Disabled'}
                </p>
                <p className={`text-xs mt-0.5 ${twoFAEnabled ? 'text-emerald-600' : 'text-red-600'}`}>
                  {twoFAEnabled ? 'Your account is secured with an authenticator app' : 'Enable 2FA for better security'}
                </p>
              </div>
              <button onClick={() => { const next = !twoFAEnabled; setTwoFAEnabled(next); toast(next ? '2FA enabled — your account is now secured' : '2FA disabled — please re-enable soon', next ? 'success' : 'warn') }}
                className={`relative w-12 h-6 rounded-full transition-colors ${twoFAEnabled ? 'bg-emerald-500' : 'bg-red-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${twoFAEnabled ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <button onClick={() => toast('Backup codes downloaded')} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition"><Key className="w-4 h-4 text-slate-400" />Backup codes: <strong>8 remaining</strong></button>
            <div className="flex items-center gap-2 text-slate-600"><Smartphone className="w-4 h-4 text-slate-400" />Authenticator app linked</div>
          </div>
        </SectionCard>

        {/* RBAC */}
        <SectionCard>
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-purple-500" />Role-Based Access Control</h3>
          <div className="space-y-2">
            {mockRoles.map(r => (
              <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.color}`}>{r.role}</span>
                  <span className="text-xs text-slate-500">{r.users} users</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {r.permissions.map(p => (
                    <span key={p} className="bg-white text-xs text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Access Logs */}
      <SectionCard>
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-slate-500" />Audit Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['User','Action','Resource','IP Address','Timestamp','Status'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockAccessLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 pr-4 font-medium text-slate-800 text-xs">{log.user}</td>
                  <td className="py-3 pr-4 text-xs text-slate-600">{log.action}</td>
                  <td className="py-3 pr-4 text-xs text-slate-500 max-w-32 truncate">{log.resource}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-400">{log.ip}</td>
                  <td className="py-3 pr-4 text-xs text-slate-400">{log.time}</td>
                  <td className="py-3"><StatusBadge status={log.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION: ROADMAP
// ─────────────────────────────────────────────
const RoadmapSection = () => (
  <div className="space-y-6">
    <SectionHeader title="Strategic Roadmap" subtitle="Timeline of milestones and project dependencies" />

    {/* Timeline */}
    <SectionCard>
      <h3 className="font-semibold text-slate-800 mb-6">{new Date().getFullYear()} Milestone Timeline</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
        <div className="space-y-6 pl-12">
          {mockMilestones.map((ms, i) => (
            <div key={ms.id} className="relative group">
              {/* Dot */}
              <div className={`absolute -left-8 w-4 h-4 rounded-full border-2 border-white shadow-md ${ms.color} top-1`} />
              {/* Dependency line (dashed) */}
              {i < mockMilestones.length - 1 && (
                <div className="absolute -left-6 top-5 w-0 border-l-2 border-dashed border-slate-200 h-8" />
              )}
              <div className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow
                ${ms.status === 'completed' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className={`font-semibold text-sm ${ms.status === 'completed' ? 'text-emerald-700' : 'text-slate-800'}`}>{ms.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{ms.project}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ms.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {ms.status === 'completed' ? '✓ Done' : 'Upcoming'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{ms.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>

    {/* Milestone Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SectionCard className="text-center">
        <div className="text-3xl font-bold text-emerald-600 mb-1">{mockMilestones.filter(m => m.status === 'completed').length}</div>
        <p className="text-sm text-slate-500">Milestones Completed</p>
      </SectionCard>
      <SectionCard className="text-center">
        <div className="text-3xl font-bold text-blue-600 mb-1">{mockMilestones.filter(m => m.status === 'upcoming').length}</div>
        <p className="text-sm text-slate-500">Upcoming Milestones</p>
      </SectionCard>
      <SectionCard className="text-center">
        <div className="text-3xl font-bold text-purple-600 mb-1">Q3 2024</div>
        <p className="text-sm text-slate-500">Final Project Delivery</p>
      </SectionCard>
    </div>
  </div>
)

// ─────────────────────────────────────────────
// SECTION: INTEGRATIONS
// ─────────────────────────────────────────────
const IntegrationsSection = () => {
  const [integrations, setIntegrations] = useState(mockIntegrations)
  const [webhookUrl, setWebhookUrl] = useState('')
  return (
  <div className="space-y-6">
    <SectionHeader title="Integrations" subtitle="Connect your tools and sync data across platforms" />

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {integrations.map(intg => {
        const Icon = intg.icon
        return (
          <SectionCard key={intg.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700 flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-slate-800 text-sm">{intg.name}</p>
                  <StatusBadge status={intg.connected ? 'connected' : 'disconnected'} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{intg.category}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3">{intg.description}</p>
            {intg.connected && intg.lastSync && (
              <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />Last synced {intg.lastSync}
              </p>
            )}
            <button onClick={() => { const next = !intg.connected; setIntegrations(prev => prev.map(i => i.id === intg.id ? { ...i, connected: next, lastSync: next ? 'just now' : null } : i)); toast(next ? `Connected to ${intg.name}!` : `Disconnected from ${intg.name}`) }} className={`w-full text-sm py-2 rounded-xl font-medium transition ${intg.connected
              ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {intg.connected ? 'Disconnect' : 'Connect'}
            </button>
          </SectionCard>
        )
      })}
    </div>

    <SectionCard>
      <h3 className="font-semibold text-slate-800 mb-1">Add Custom Integration</h3>
      <p className="text-sm text-slate-500 mb-4">Connect any tool using webhooks or our REST API.</p>
      <div className="flex gap-3 flex-wrap">
        <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://your-webhook-url.com" className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48" />
        <button onClick={() => { if (webhookUrl.trim()) { toast('Webhook added successfully!'); setWebhookUrl('') } else { toast('Please enter a webhook URL first', 'warn') } }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">Add Webhook</button>
        <button onClick={() => toast('Opening API documentation…')} className="border border-blue-200 text-blue-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 transition flex items-center gap-1">
          <ExternalLink className="w-4 h-4" />API Docs
        </button>
      </div>
    </SectionCard>
  </div>
  )
}

// ─────────────────────────────────────────────
// SECTION: REPORTS
// ─────────────────────────────────────────────
const ReportsSection = () => {
  const reportTypes = ['Progress Report', 'Financial Summary', 'Risk Assessment', 'Resource Utilization', 'Client Summary', 'Custom']
  const [selectedReport, setSelectedReport] = useState('Progress Report')
  const [scheduledReports, setScheduledReports] = useState([
    { id: 1, name: 'Weekly Project Status', frequency: 'Weekly', nextRun: 'Mar 25, 2024', recipients: 3, format: 'PDF' },
    { id: 2, name: 'Monthly Financial Report', frequency: 'Monthly', nextRun: 'Apr 1, 2024', recipients: 2, format: 'Excel' },
    { id: 3, name: 'Quarterly KPI Dashboard', frequency: 'Quarterly', nextRun: 'Jun 30, 2024', recipients: 5, format: 'PDF' },
  ])

  return (
    <div className="space-y-6">
      <SectionHeader title="Reports & Exports" subtitle="Generate, schedule, and export custom reports" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Builder */}
        <SectionCard className="lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Download className="w-4 h-4 text-blue-500" />Custom Report Builder</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Report Type</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {reportTypes.map(rt => (
                  <button key={rt} onClick={() => setSelectedReport(rt)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition ${selectedReport === rt ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {rt}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Date From</label>
                <input type="date" defaultValue="2024-01-01"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Date To</label>
                <input type="date" defaultValue="2024-03-31"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Projects to Include</label>
              <div className="space-y-2">
                {projects.map(p => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" defaultChecked className="accent-blue-600 w-4 h-4" />
                    <span className="text-sm text-slate-700 group-hover:text-blue-600 transition">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button onClick={() => toast('Generating PDF report… Download will start shortly')} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                <Download className="w-4 h-4" /> Export PDF
              </button>
              <button onClick={() => toast('Generating Excel report… Download will start shortly')} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition">
                <Download className="w-4 h-4" /> Export Excel
              </button>
              <button onClick={() => { toast('Opening print dialog…'); setTimeout(() => window.print(), 500) }} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 transition">
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Scheduled Reports */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-800">Scheduled Reports</h3>
          {scheduledReports.map(r => (
            <SectionCard key={r.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold text-slate-800 text-sm">{r.name}</p>
                <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">{r.format}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5"><RefreshCw className="w-3 h-3" />{r.frequency}</div>
                <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />Next: {r.nextRun}</div>
                <div className="flex items-center gap-1.5"><Users className="w-3 h-3" />{r.recipients} recipients</div>
              </div>
              <div className="flex gap-1.5 mt-3">
                <button onClick={() => toast(`Editing "${r.name}"`, 'warn')} className="flex-1 bg-slate-50 text-slate-600 text-xs py-1.5 rounded-lg hover:bg-slate-100 transition">Edit</button>
                <button onClick={() => { setScheduledReports(prev => prev.filter(sr => sr.id !== r.id)); toast('Report removed') }} className="flex-1 bg-red-50 text-red-500 text-xs py-1.5 rounded-lg hover:bg-red-100 transition">Remove</button>
              </div>
            </SectionCard>
          ))}
          <button onClick={() => toast('Report scheduler coming soon', 'warn')} className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-slate-400 text-sm hover:border-blue-300 hover:text-blue-500 transition flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Schedule Report
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION: SETTINGS
// ─────────────────────────────────────────────
const SettingsSection = ({ user }) => {
  const { darkMode, toggleTheme } = useTheme()
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)
  const [compactView, setCompactView] = useState(false)
  const [largeText, setLargeText] = useState(false)

  const [profileData, setProfileData] = useState({
    displayName: user?.display_name || user?.name || '',
    email: user?.email || '',
    timezone: user?.timezone || 'Africa/Nairobi'
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast('Neural parameters synchronized successfully', 'success')
    }, 1500)
  }

  return (
    <div className="space-y-10">
      <div>
         <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2">Account settings</p>
         <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Preferences and account details</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Profile */}
        <SectionCard className="p-10 border border-slate-200 dark:border-white/10 relative overflow-hidden bg-white dark:bg-white/5">
          <div className="absolute top-0 right-0 p-8">
             <Shield className="w-6 h-6 text-slate-200 dark:text-white/5" />
          </div>

          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-4">
             <Users className="w-4 h-4 text-gold-500" />
             Profile information
          </h3>

          <div className="flex items-center gap-8 mb-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-gold-500 to-gold-200 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <Avatar
                initials={user?.first_name ? user.first_name[0] : (user?.name ? user.name[0] : 'U')}
                src={user?.has_photo && (user?.id || user?.userId) ? `/api/users/profile-photo/${user.id || user.userId}` : null}
                size="lg"
                color="bg-slate-100 dark:bg-slate-900 border border-gold-500/20" />
              <button onClick={() => toast('Asset capture module offline', 'warn')}
                className="absolute bottom-0 right-0 p-2 bg-gold-500 text-slate-950 rounded-lg shadow-xl hover:bg-gold-400 transition-all">
                <Maximize2 size={12} />
              </button>
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{user?.display_name || user?.name || 'Authorized Agent'}</p>
              <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.2em] mt-1">{user?.role || 'Client Status'}</p>
              <p className="text-[9px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                 Session Encrypted
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="group">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 block group-focus-within:text-gold-500 transition-colors">Display name</label>
              <input 
                value={profileData.displayName}
                onChange={(e) => handleProfileChange('displayName', e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500/40 transition-all" />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 block">Email address</label>
              <div className="relative">
                <input
                  value={profileData.email}
                  type="email"
                  disabled
                  className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 cursor-not-allowed" />
                <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-700" />
              </div>
            </div>
            <div className="group">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 block group-focus-within:text-gold-500 transition-colors">Time zone</label>
              <select 
                value={profileData.timezone}
                onChange={(e) => handleProfileChange('timezone', e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500/40 transition-all appearance-none cursor-pointer">
                <option className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white">Africa/Nairobi (UTC+3)</option>
                <option className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white">UTC (UTC+0)</option>
                <option className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white">America/New_York (UTC-5)</option>
                <option className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white">Europe/London (UTC+0)</option>
                <option className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white">Asia/Tokyo (UTC+9)</option>
              </select>
            </div>
            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full bg-gold-500 text-slate-950 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-3">
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </SectionCard>

        <div className="space-y-6">
          {/* Notification Preferences */}
          <SectionCard className="p-10 border border-white/10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
               <Bell className="w-4 h-4 text-gold-500" />
               Notifications
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Email updates', val: emailNotifs, setter: setEmailNotifs },
                { label: 'SMS alerts', val: smsNotifs, setter: setSmsNotifs }
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between group">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{pref.label}</span>
                  <button onClick={() => pref.setter(p => !p)}
                    className={`relative w-12 h-6 rounded-full transition-all border ${pref.val ? 'bg-gold-500 border-gold-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-white/5 border-white/10'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full shadow-lg transition-transform ${pref.val ? 'translate-x-6 bg-slate-950' : 'bg-slate-600'}`} />
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Accessibility */}
          <SectionCard className="p-10 border border-white/10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
               <Eye className="w-4 h-4 text-gold-500" />
               Display options
            </h3>
            <div className="space-y-6">
              {[
                { id: 'theme', label: 'Dark mode', val: darkMode, setter: toggleTheme },
                { id: 'density', label: 'Compact view', val: compactView, setter: setCompactView },
                { id: 'matrix', label: 'Larger text', val: largeText, setter: setLargeText }
              ].map((pref) => (
                <div key={pref.id} className="flex items-center justify-between group">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{pref.label}</span>
                  <button onClick={() => { if (pref.label.includes('(coming soon)')) return; pref.setter(p => !p) }}
                    className={`relative w-12 h-6 rounded-full transition-all border ${pref.val ? 'bg-gold-500 border-gold-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-white/5 border-white/10'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full shadow-lg transition-transform ${pref.val ? 'translate-x-6 bg-slate-950' : 'bg-slate-600'}`} />
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Mobile App Links */}
          <SectionCard className="p-10 border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
               <Smartphone className="w-4 h-4 text-gold-500" />
               Mobile access
            </h3>
            <p className="text-[11px] font-medium text-slate-400 leading-relaxed uppercase tracking-widest mb-8">Use your mobile device to stay connected to project updates and important notices.</p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => toast('iOS Module: Deployment Pending', 'warn')} className="flex-1 flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                <Smartphone className="w-4 h-4" /> App Store
              </button>
              <button onClick={() => toast('Android Module: Deployment Pending', 'warn')} className="flex-1 flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                <Globe className="w-4 h-4" /> Google Play
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const Projects = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('overview')
  const [menuOpen, setMenuOpen] = useState(false)

  // Real Data State
  const [dashboardData, setDashboardData] = useState(null)
  const [notifs, setNotifs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const token = user?.token

  const fetchData = useCallback(async () => {
    if (!token) return
    try {
      setIsLoading(true)

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // 1. Fetch Consolidated Dashboard (Server extracts identity from Token)
      const dashRes = await fetch(getApiUrl('/api/users/client-dashboard'), { headers })

      if (dashRes.status === 401) {
        toast('Session Compromised: Re-authentication Required', 'error')
        logout()
        return
      }

      const dashData = await dashRes.json()
      if (dashData.success) {
        setDashboardData(dashData.dashboard)
      }

      // 2. Fetch Notifications (Server extracts identity from Token)
      const notifRes = await fetch(getApiUrl('/api/users/notifications/me'), { headers })
      const notifData = await notifRes.json()
      if (notifData.success) {
        setNotifs(notifData.notifications)
      }
    } catch (error) {
      console.error('Tactical synchronization failure:', error)
      toast('Neural Link Interrupted', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [token, logout])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    } else {
      fetchData()
    }
  }, [isAuthenticated, navigate, fetchData])

  const toggleNotifRead = async (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n))
    try {
      await fetch(getApiUrl(`/api/users/notifications/${id}/read`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
    } catch (error) {
      console.error('Acknowledgement relay failure:', error)
    }
  }

  const acknowledgeAllNotifs = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, status: 'read' })))
    try {
      await fetch(getApiUrl('/api/users/notifications/read-all/me'), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      toast('All relays acknowledged', 'success')
    } catch (error) {
      console.error('Command frequency error:', error)
    }
  }

  const unreadNotifCount = notifs.filter(n => n.status === 'unread').length
  const [modal, setModal] = useState({ open: false, type: '', data: null })
  const openModal = (type, data = null) => setModal({ open: true, type, data })
  const closeModal = () => setModal({ open: false, type: '', data: null })
  const toasts = useToast()

  // Close menu on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuOpen && !e.target.closest('.portal-menu-container')) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="text-center max-w-lg w-full relative">
          <div className="absolute inset-0 bg-gold-500/10 blur-[80px] rounded-full" />
          <div className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl">
            <Lock className="h-16 w-16 text-gold-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">
              Access Restricted
            </h2>
            <p className="text-slate-400 font-medium leading-relaxed mb-8">
              Protocol requires authentication to access the Client Portal.
            </p>
            <Link to="/login"
              className="block w-full py-4 bg-gold-500 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20 text-center">
              Initialize Secure Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const renderSection = () => {
    let content;
    switch (activeSection) {
      case 'overview':       content = <OverviewSection user={user} data={dashboardData} notifs={notifs} isLoading={isLoading} />; break
      case 'projects':       content = <ProjectsSection onView={p => openModal('viewProject', p)} onEdit={p => openModal('editProject', p)} />; break
      case 'tasks':          content = <TasksSection onAddTask={() => openModal('addTask')} />; break
      case 'resources':      content = <ResourcesSection />; break
      case 'financials':     content = <FinancialsSection />; break
      case 'documents':      content = <DocumentsSection />; break
      case 'communication':  content = <CommunicationSection />; break
      case 'notifications':  content = content = <NotificationsSection
                                      user={user}
                                      notifs={notifs}
                                      isLoading={isLoading}
                                      onToggleRead={toggleNotifRead}
                                      onAcknowledgeAll={acknowledgeAllNotifs}
                                      onRefresh={fetchData}
                                    />; break
      case 'feedback':       content = <FeedbackSection />; break
      case 'risk':           content = <RiskSection />; break
      case 'analytics':      content = <AnalyticsSection />; break
      case 'security':       content = <SecuritySection user={user} />; break
      case 'roadmap':        content = <RoadmapSection />; break
      case 'integrations':   content = <IntegrationsSection />; break
      case 'reports':        content = <ReportsSection />; break
      case 'settings':       content = <SettingsSection user={user} />; break
      default:               content = <OverviewSection user={user} data={dashboardData} notifs={notifs} isLoading={isLoading} />; break
    }

    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both">
        {content}
      </div>
    )
  }

  const currentNav = navSections.find(n => n.id === activeSection)

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col overflow-hidden text-[var(--text-primary)] font-medium relative transition-colors duration-500">
      {/* Immersive Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50 dark:opacity-100">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(13,148,136,0.05),_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,_rgba(234,179,8,0.03),_transparent_50%)]" />
      </div>

      {/* ── HEADER PROTOCOL ── */}
      <header className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl border-b border-slate-200 dark:border-white/10 px-6 sm:px-10 py-5 flex items-center justify-between flex-shrink-0 relative z-[100] shadow-xl dark:shadow-2xl transition-colors">
        <div className="flex items-center gap-6">
          {/* Hamburger Menu Dropdown */}
          <div className="relative portal-menu-container">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-3 rounded-2xl transition-all duration-300 border ${menuOpen ? 'bg-gold-500 text-slate-950 border-gold-500' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-gold-600 dark:hover:text-gold-500'}`}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {menuOpen && (
              <div className="absolute left-0 top-full mt-4 w-72 bg-white dark:bg-[#1e293b]/95 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up">
                <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                   <p className="text-[10px] font-black text-gold-600 dark:text-gold-500 uppercase tracking-[0.4em] px-4 py-2">Portal sections</p>
                </div>
                <div className="max-h-[60vh] overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                  {navSections.map(section => {
                    const Icon = section.icon
                    const isActive = activeSection === section.id
                    return (
                      <button
                        key={section.id}
                        onClick={() => { setActiveSection(section.id); setMenuOpen(false) }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group
                          ${isActive
                            ? 'bg-gold-500 text-slate-950 shadow-xl shadow-gold-500/20'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                      >
                        <Icon size={18} className={`${isActive ? 'text-slate-950' : 'text-slate-400 dark:text-slate-500 group-hover:text-gold-600 dark:group-hover:text-gold-500'}`} />
                        <span className="truncate text-[11px] font-black uppercase tracking-[0.2em]">
                          {section.label}
                          {section.id === 'notifications' && unreadNotifCount > 0 && (
                            <span className="ml-3 bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full">
                              {unreadNotifCount}
                            </span>
                          )}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{currentNav?.label || 'Portal'}</h2>
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Greggory client portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 mr-2">
            <Avatar
              initials={user?.first_name ? user.first_name[0] : (user?.name ? user.name[0] : 'U')}
              src={user?.has_photo && (user?.id || user?.userId) ? `/api/users/profile-photo/${user.id || user.userId}` : null}
              size="md"
              color="bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg" />
          </div>

          <div className="h-10 w-px bg-slate-200 dark:bg-white/10 mx-2" />

          {/* Close Portal Button */}
          <button
            onClick={() => navigate('/')}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-rose-500 hover:text-white transition-all text-slate-500 dark:text-slate-400 group"
            title="Close portal"
          >
            <X size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      {/* ── MAIN DISPLAY AREA ── */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-16 relative z-10 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {renderSection()}
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />

      {/* View Project Modal */}
      <Modal open={modal.open && modal.type === 'viewProject'} onClose={closeModal} title={modal.data?.name || 'Project Details'}>
        {modal.data && (
          <div className="space-y-3 text-sm">
            <p className="text-slate-600 dark:text-slate-300">{modal.data.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3"><p className="text-xs text-slate-400">Progress</p><p className="font-bold text-slate-900 dark:text-white">{modal.data.progress}%</p></div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3"><p className="text-xs text-slate-400">Status</p><p className="font-bold text-slate-900 dark:text-white capitalize">{modal.data.status}</p></div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3"><p className="text-xs text-slate-400">Budget</p><p className="font-bold text-slate-900 dark:text-white">${modal.data.budget?.toLocaleString()}</p></div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3"><p className="text-xs text-slate-400">Spent</p><p className="font-bold text-slate-900 dark:text-white">${modal.data.spent?.toLocaleString()}</p></div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3"><p className="text-xs text-slate-400">Start</p><p className="font-bold text-slate-900 dark:text-white">{modal.data.startDate}</p></div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3"><p className="text-xs text-slate-400">Expected End</p><p className="font-bold text-slate-900 dark:text-white">{modal.data.expectedCompletion}</p></div>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3"><p className="text-xs text-slate-400 mb-1">Team</p><p className="font-medium text-slate-700 dark:text-slate-200">{modal.data.team?.join(', ')}</p></div>
            <button onClick={closeModal} className="w-full bg-gold-500 text-slate-950 py-2.5 rounded-xl font-black uppercase text-xs hover:bg-gold-400 transition">Close</button>
          </div>
        )}
      </Modal>

      {/* Edit Project Modal */}
      <Modal open={modal.open && modal.type === 'editProject'} onClose={closeModal} title={`Edit: ${modal.data?.name || ''}`}>
        {modal.data && (
          <div className="space-y-3">
            <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Project Name</label>
              <input defaultValue={modal.data.name} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Description</label>
              <textarea rows={3} defaultValue={modal.data.description} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div className="flex gap-2">
              <button onClick={() => { toast('Project updated successfully!'); closeModal() }} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition">Save Changes</button>
              <button onClick={closeModal} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-medium hover:bg-slate-200 transition">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Task Modal */}
      <Modal open={modal.open && modal.type === 'addTask'} onClose={closeModal} title="Add New Task">
        <div className="space-y-3">
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Task Title</label>
            <input placeholder="Enter task title…" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Priority</label>
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
            </select></div>
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Project</label>
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Community Center Renovation</option><option>Youth Sports Program</option><option>Educational Scholarship Fund</option>
            </select></div>
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Due Date</label>
            <input type="date" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex gap-2">
            <button onClick={() => { toast('Task created successfully!'); closeModal() }} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition">Create Task</button>
            <button onClick={closeModal} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-medium hover:bg-slate-200 transition">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Projects
