import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
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
// HELPER COMPONENTS
// ─────────────────────────────────────────────

const Badge = ({ label, color }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
    {label}
  </span>
)

const StatusBadge = ({ status }) => {
  const map = {
    active:       'bg-emerald-100 text-emerald-700',
    completed:    'bg-blue-100 text-blue-700',
    pending:      'bg-yellow-100 text-yellow-700',
    overdue:      'bg-red-100 text-red-700',
    paid:         'bg-emerald-100 text-emerald-700',
    draft:        'bg-gray-100 text-gray-600',
    'In Progress':'bg-blue-100 text-blue-700',
    'To Do':      'bg-gray-100 text-gray-600',
    'Review':     'bg-purple-100 text-purple-700',
    'Complete':   'bg-emerald-100 text-emerald-700',
    Success:      'bg-emerald-100 text-emerald-700',
    Failed:       'bg-red-100 text-red-700',
    connected:    'bg-emerald-100 text-emerald-700',
    disconnected: 'bg-gray-100 text-gray-500',
    Mitigating:   'bg-yellow-100 text-yellow-700',
    Monitoring:   'bg-blue-100 text-blue-700',
    Open:         'bg-red-100 text-red-700',
    Closed:       'bg-gray-100 text-gray-500',
  }
  const cls = map[status] || 'bg-gray-100 text-gray-600'
  return <Badge label={status} color={cls} />
}

const PriorityBadge = ({ priority }) => {
  const map = {
    Critical: 'bg-red-100 text-red-700 border border-red-200',
    High:     'bg-orange-100 text-orange-700 border border-orange-200',
    Medium:   'bg-yellow-100 text-yellow-700 border border-yellow-200',
    Low:      'bg-gray-100 text-gray-600 border border-gray-200',
  }
  return <Badge label={priority} color={map[priority] || 'bg-gray-100 text-gray-600'} />
}

const GradientBar = ({ value, max = 100 }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const gradient = pct >= 80
    ? 'from-emerald-400 to-emerald-600'
    : pct >= 60
      ? 'from-blue-400 to-blue-600'
      : pct >= 40
        ? 'from-yellow-400 to-orange-500'
        : 'from-red-400 to-red-600'
  return (
    <div className="w-full bg-slate-100 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

const SectionCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 ${className}`}>
    {children}
  </div>
)

const KpiCard = ({ icon: Icon, label, value, delta, deltaLabel, color = 'bg-blue-50 text-blue-600' }) => (
  <SectionCard className="flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {delta !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-medium ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(delta)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      {deltaLabel && <p className="text-xs text-slate-400 mt-1">{deltaLabel}</p>}
    </div>
  </SectionCard>
)

const Avatar = ({ initials, size = 'sm', color = 'bg-gradient-to-br from-blue-500 to-purple-600' }) => {
  const sz = size === 'lg' ? 'w-12 h-12 text-base' : size === 'md' ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs'
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
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
const OverviewSection = ({ user }) => {
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0)
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0)
  const avgProgress = Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #6366f1 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <p className="text-blue-300 text-sm font-medium mb-1">Welcome back</p>
          <h1 className="text-3xl font-bold mb-2">
            {user?.first_name || user?.name || 'Valued Client'} 👋
          </h1>
          <p className="text-slate-300 max-w-lg">
            Here's your real-time project overview. Everything is on track — keep up the great work!
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <p className="text-xs text-blue-200">Active Projects</p>
              <p className="text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <p className="text-xs text-blue-200">Avg Progress</p>
              <p className="text-2xl font-bold">{avgProgress}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <p className="text-xs text-blue-200">Total Budget</p>
              <p className="text-2xl font-bold">${(totalBudget / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <p className="text-xs text-blue-200">Spent to Date</p>
              <p className="text-2xl font-bold">${(totalSpent / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={FolderKanban} label="Total Projects" value={projects.length} delta={12} deltaLabel="vs last quarter" color="bg-blue-50 text-blue-600" />
        <KpiCard icon={CheckCircle} label="Completed" value={projects.filter(p => p.status === 'completed').length} delta={5} deltaLabel="on schedule" color="bg-emerald-50 text-emerald-600" />
        <KpiCard icon={Clock} label="Open Tasks" value={mockTasks.filter(t => t.status !== 'Complete').length} delta={-3} deltaLabel="vs last week" color="bg-orange-50 text-orange-600" />
        <KpiCard icon={AlertCircle} label="Overdue Invoices" value={mockInvoices.filter(i => i.status === 'overdue').length} delta={-1} deltaLabel="vs last month" color="bg-red-50 text-red-500" />
      </div>

      {/* Project Summary Cards */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Project Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map(p => (
            <SectionCard key={p.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-slate-800 text-sm leading-tight pr-2">{p.name}</h4>
                <StatusBadge status={p.status} />
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Progress</span><span className="font-semibold text-slate-700">{p.progress}%</span>
                </div>
                <GradientBar value={p.progress} />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Budget: <strong className="text-slate-700">${p.budget.toLocaleString()}</strong></span>
                <span>Spent: <strong className="text-slate-700">${p.spent.toLocaleString()}</strong></span>
              </div>
              <div className="flex -space-x-1.5 mt-3">
                {p.team.slice(0, 3).map((t, i) => (
                  <Avatar key={i} initials={t.split(' ').map(n => n[0]).join('')} size="sm"
                    color={['bg-blue-500','bg-purple-500','bg-pink-500','bg-emerald-500'][i % 4]} />
                ))}
                {p.team.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold">
                    +{p.team.length - 3}
                  </div>
                )}
              </div>
            </SectionCard>
          ))}
        </div>
      </div>

      {/* Recent Notifications Preview */}
      <SectionCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Recent Activity</h3>
          <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">View all</span>
        </div>
        <div className="space-y-3">
          {mockNotifications.slice(0, 3).map(n => {
            const Icon = n.icon
            return (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl ${n.read ? 'bg-slate-50' : 'bg-blue-50 border border-blue-100'}`}>
                <div className={`p-1.5 rounded-lg bg-white shadow-sm ${n.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">{n.time}</span>
              </div>
            )
          })}
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
    <div className="space-y-6">
      <SectionHeader
        title="Projects"
        subtitle="Manage and track all your active and completed projects"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setViewMode(v => v === 'list' ? 'kanban' : 'list')}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              title="Toggle view"
            >
              {viewMode === 'list' ? <Columns className="w-4 h-4 text-slate-600" /> : <List className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        }
      />

      {viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['active', 'completed', 'pending'].map(col => (
            <div key={col} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700 capitalize">{col}</h3>
                <span className="bg-slate-200 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {filtered.filter(p => p.status === col).length}
                </span>
              </div>
              <div className="space-y-3">
                {filtered.filter(p => p.status === col).map(p => (
                  <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onView && onView(p)}>
                    <h4 className="font-semibold text-slate-800 text-sm mb-2">{p.name}</h4>
                    <div className="mb-2">
                      <GradientBar value={p.progress} />
                      <p className="text-xs text-slate-500 mt-1 text-right">{p.progress}%</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{p.team.length} members</span>
                      <span>Due {p.expectedCompletion}</span>
                    </div>
                  </div>
                ))}
                {filtered.filter(p => p.status === col).length === 0 && (
                  <div className="text-center py-6 text-sm text-slate-400">No projects</div>
                )}
              </div>
              <button onClick={() => toast('Click View Details on a project first', 'warn')}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-2 text-slate-400 text-xs hover:border-blue-300 hover:text-blue-400 transition flex items-center justify-center gap-1 mt-2">
                <Plus className="w-3.5 h-3.5" /> Add task
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* List / Gantt-style View */
        <div className="space-y-4">
          {filtered.map(p => (
            <SectionCard key={p.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-bold text-slate-800">{p.name}</h3>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-sm text-slate-500 mb-4">{p.description}</p>

                  {/* Gantt-style progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span className="font-medium text-slate-600">Timeline Progress</span>
                      <span className="font-bold text-slate-800">{p.progress}%</span>
                    </div>
                    <div className="relative w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-4 rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 transition-all duration-700 flex items-center justify-end pr-2"
                        style={{ width: `${p.progress}%` }}
                      >
                        {p.progress > 15 && <span className="text-white text-xs font-bold">{p.progress}%</span>}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>{p.startDate}</span>
                      <span>{p.expectedCompletion}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-0.5">Budget</p>
                      <p className="font-bold text-slate-800">${p.budget.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-0.5">Spent</p>
                      <p className="font-bold text-slate-800">${p.spent.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-0.5">Remaining</p>
                      <p className={`font-bold ${p.budget - p.spent > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        ${(p.budget - p.spent).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-0.5">Team</p>
                      <p className="font-bold text-slate-800">{p.team.length} members</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:w-36">
                  <div className="flex -space-x-1.5 mb-2">
                    {p.team.slice(0, 4).map((t, i) => (
                      <Avatar key={i} initials={t.split(' ').map(n => n[0]).join('')} size="sm"
                        color={['bg-blue-500','bg-purple-500','bg-pink-500','bg-emerald-500'][i % 4]} />
                    ))}
                  </div>
                  <button onClick={() => onView && onView(p)} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-1 justify-center">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => onEdit && onEdit(p)} className="text-sm bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition flex items-center gap-1 justify-center">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
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
    'To Do':       'border-t-slate-400',
    'In Progress': 'border-t-blue-500',
    'Review':      'border-t-purple-500',
    'Complete':    'border-t-emerald-500',
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Task Management"
        subtitle="Track and manage all tasks across projects"
        action={
          <button onClick={() => onAddTask && onAddTask()} className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        }
      />

      {/* Priority Legend */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-500 font-medium">Priority:</span>
        {['Critical','High','Medium','Low'].map(p => <PriorityBadge key={p} priority={p} />)}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto">
        {cols.map(col => (
          <div key={col} className={`bg-slate-50 rounded-2xl border-t-4 ${colColors[col]} border border-slate-100 p-4 min-h-64`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-700">{col}</h3>
              <span className="bg-white text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm border border-slate-100">
                {mockTasks.filter(t => t.status === col).length}
              </span>
            </div>
            <div className="space-y-3">
              {mockTasks.filter(t => t.status === col).map(task => (
                <div key={task.id} onClick={() => toast(`Task: ${task.title}`, 'success')} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{task.title}</p>
                    <button onClick={e => { e.stopPropagation(); toast('Task options coming soon', 'warn') }}><MoreVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-0.5 transition" /></button>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{task.project}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {task.tags.map(tag => (
                      <span key={tag} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <PriorityBadge priority={task.priority} />
                    <div className="flex items-center gap-1.5">
                      <Avatar initials={task.assignee.split(' ').map(n => n[0]).join('')} size="sm" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>Due {task.due}</span>
                  </div>
                </div>
              ))}
              <button onClick={() => onAddTask && onAddTask()} className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-slate-400 text-xs hover:border-blue-300 hover:text-blue-400 transition flex items-center justify-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add task
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
  <div className="space-y-6">
    <SectionHeader title="Resources & Team" subtitle="Manage team assignments and workload capacity" />

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {mockTeam.map(member => (
        <SectionCard key={member.id} className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Avatar initials={member.avatar} size="lg"
              color={member.status === 'away' ? 'bg-gradient-to-br from-slate-400 to-slate-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} />
            <div>
              <p className="font-bold text-slate-800">{member.name}</p>
              <p className="text-xs text-slate-500">{member.role}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : 'bg-yellow-400'}`} />
                <span className="text-xs text-slate-400 capitalize">{member.status}</span>
              </div>
            </div>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Capacity</span>
              <span className={`font-semibold ${member.capacity >= 80 ? 'text-red-500' : member.capacity >= 60 ? 'text-orange-500' : 'text-emerald-600'}`}>
                {member.capacity}%
              </span>
            </div>
            <GradientBar value={member.capacity} />
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {member.skills.slice(0, 3).map(s => (
              <span key={s} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1"><FolderKanban className="w-3.5 h-3.5" />{member.projects} project{member.projects !== 1 ? 's' : ''}</span>
            <button onClick={() => toast(`Email sent to ${member.email}`, 'success')} className="flex items-center gap-1 hover:text-blue-600 transition"><Mail className="w-3.5 h-3.5 text-blue-400" />{member.email}</button>
          </div>
        </SectionCard>
      ))}
    </div>

    {/* Resource Calendar Stub */}
    <SectionCard>
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" />Resource Calendar — March 2024</h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="font-medium">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 31 }, (_, i) => {
          const day = i + 1
          const hasMeeting = [5, 12, 15, 19, 26].includes(day)
          const isToday = day === 18
          return (
            <div key={day}
              onClick={() => hasMeeting ? toast(`Meeting on day ${day}`, 'success') : toast(`No meetings on day ${day}`)}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs cursor-pointer transition
                ${isToday ? 'bg-blue-600 text-white font-bold' : hasMeeting ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' : 'hover:bg-slate-50 text-slate-600'}`}>
              {day}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-600" /><span>Today</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-50 border border-blue-200" /><span>Meetings scheduled</span></div>
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
    { label: 'Community Center', pct: Math.round((projects[0].spent / totalSpent) * 100), color: '#3b82f6' },
    { label: 'Youth Sports', pct: Math.round((projects[1].spent / totalSpent) * 100), color: '#8b5cf6' },
    { label: 'Scholarship Fund', pct: Math.round((projects[2].spent / totalSpent) * 100), color: '#10b981' },
  ]
  let cumulativePct = 0

  return (
    <div className="space-y-6">
      <SectionHeader title="Financials" subtitle="Budget tracking, invoices, and cost breakdown" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign} label="Total Budget" value={`$${(totalBudget / 1000).toFixed(0)}K`} color="bg-blue-50 text-blue-600" />
        <KpiCard icon={TrendingUp} label="Total Spent" value={`$${(totalSpent / 1000).toFixed(0)}K`} delta={utilPct} deltaLabel="of budget used" color="bg-orange-50 text-orange-600" />
        <KpiCard icon={CheckCircle} label="Remaining" value={`$${(remaining / 1000).toFixed(0)}K`} color="bg-emerald-50 text-emerald-600" />
        <KpiCard icon={AlertCircle} label="Overdue Amount" value="$20K" color="bg-red-50 text-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart (CSS-only) */}
        <SectionCard className="flex flex-col items-center">
          <h3 className="font-semibold text-slate-800 mb-4 self-start">Cost Breakdown</h3>
          <div className="relative w-40 h-40 flex-shrink-0" style={{ borderRadius: '50%' }}>
            <svg viewBox="0 0 36 36" className="w-40 h-40 -rotate-90">
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
                    style={{ transition: 'stroke-dashoffset 0.5s' }}
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-slate-800">{utilPct}%</p>
              <p className="text-xs text-slate-400">Utilized</p>
            </div>
          </div>
          <div className="space-y-2 mt-4 w-full">
            {segments.map((seg, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-slate-600 text-xs">{seg.label}</span>
                </div>
                <span className="font-semibold text-slate-800 text-xs">{seg.pct}%</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Budget per project */}
        <SectionCard className="lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">Budget Tracker</h3>
          <div className="space-y-4">
            {projects.map(p => {
              const pct = Math.round((p.spent / p.budget) * 100)
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{p.name}</span>
                    <span className="text-slate-500">${p.spent.toLocaleString()} / ${p.budget.toLocaleString()}</span>
                  </div>
                  <GradientBar value={p.spent} max={p.budget} />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>{pct}% spent</span>
                    <span>${(p.budget - p.spent).toLocaleString()} remaining</span>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>
      </div>

      {/* Invoice List */}
      <SectionCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Invoice History</h3>
          <button onClick={() => toast('Exporting invoice history as CSV…')} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Invoice','Project','Amount','Date','Due','Status',''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition group">
                  <td className="py-3 pr-4 font-mono text-xs text-blue-600 font-semibold">{inv.id}</td>
                  <td className="py-3 pr-4 text-slate-700 max-w-32 truncate">{inv.project}</td>
                  <td className="py-3 pr-4 font-bold text-slate-800">${inv.amount.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-slate-500">{inv.date}</td>
                  <td className="py-3 pr-4 text-slate-500">{inv.due}</td>
                  <td className="py-3 pr-4"><StatusBadge status={inv.status} /></td>
                  <td className="py-3">
                    <button onClick={() => toast(`Downloading invoice ${inv.id}…`)} className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-blue-600">
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
    <div className="space-y-6">
      <SectionHeader
        title="Document Repository"
        subtitle="Centralized storage for all project documents"
        action={
          <button onClick={() => toast('File upload dialog coming soon', 'warn')} className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-700 transition">
            <Upload className="w-4 h-4" /> Upload
          </button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${activeCategory === cat ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(doc => {
          const Icon = docTypeIcon[doc.category] || FileText
          return (
            <SectionCard key={doc.id} className="hover:shadow-md transition-shadow group cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-sm truncate">{doc.name}</p>
                    <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">{doc.version}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{doc.project}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{doc.category}</span>
                    <span>{doc.size}</span>
                    <span>{doc.date}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => toast(`Opening ${doc.name}…`)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => toast(`Downloading ${doc.name}…`)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition"><Download className="w-4 h-4" /></button>
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
    <div className="space-y-6">
      <SectionHeader title="Communication Hub" subtitle="Messages, discussions, and meeting scheduler" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Threads */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-slate-800">Discussion Threads</h3>
          {mockMessages.map(m => (
            <SectionCard key={m.id} className={`hover:shadow-md transition-shadow cursor-pointer ${m.unread ? 'border-l-4 border-l-blue-500' : ''}`}>
              <div className="flex items-start gap-3">
                <Avatar initials={m.avatar} size="md"
                  color={m.unread ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{m.author}</span>
                      {m.unread && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                    </div>
                    <span className="text-xs text-slate-400">{m.time}</span>
                  </div>
                  <p className="text-xs text-blue-500 mb-1">{m.project}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{m.message}</p>
                </div>
              </div>
            </SectionCard>
          ))}

          {/* Compose */}
          <SectionCard>
            <h4 className="font-semibold text-slate-700 text-sm mb-3">New Message</h4>
            <div className="flex gap-2">
              <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder="Type your message…"
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => { setMsg(''); toast('Message sent!') }}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-1"
              >
                <Send className="w-4 h-4" />
              </button>
              <button onClick={() => toast('File attachment coming soon', 'warn')} className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-400">
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
          </SectionCard>
        </div>

        {/* Meeting Scheduler */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800">Upcoming Meetings</h3>
          {meetings.map(meet => (
            <SectionCard key={meet.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                {meet.type === 'Video' ? <Video className="w-4 h-4 text-blue-500" /> : <Users className="w-4 h-4 text-emerald-500" />}
                <p className="font-semibold text-slate-800 text-sm">{meet.title}</p>
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{meet.date}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{meet.time}</div>
                <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{meet.attendees} attendees</div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => toast(`Joining ${meet.title}…`)} className="flex-1 bg-blue-50 text-blue-600 text-xs py-1.5 rounded-lg hover:bg-blue-100 transition font-medium">Join</button>
                <button onClick={() => toast(`Opening details for ${meet.title}`)} className="flex-1 bg-slate-50 text-slate-600 text-xs py-1.5 rounded-lg hover:bg-slate-100 transition font-medium">Details</button>
              </div>
            </SectionCard>
          ))}
          <button onClick={() => toast('Meeting scheduler coming soon', 'warn')} className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-slate-400 text-sm hover:border-blue-300 hover:text-blue-500 transition flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Schedule Meeting
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION: NOTIFICATIONS
// ─────────────────────────────────────────────
const NotificationsSection = () => {
  const [notifs, setNotifs] = useState(mockNotifications)
  const toggleRead = id => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n))

  const prefToggles = [
    { label: 'Task due reminders', on: true },
    { label: 'Invoice alerts', on: true },
    { label: 'Project milestone updates', on: true },
    { label: 'New document uploads', on: false },
    { label: 'Team messages', on: true },
    { label: 'Weekly digest email', on: false },
  ]
  const [prefs, setPrefs] = useState(prefToggles)

  return (
    <div className="space-y-6">
      <SectionHeader title="Notifications" subtitle="Stay up to date with all project activity" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Inbox</h3>
            <button onClick={() => setNotifs(prev => prev.map(n => ({ ...n, read: true })))}
              className="text-xs text-blue-600 hover:underline">Mark all as read</button>
          </div>
          {notifs.map(n => {
            const Icon = n.icon
            return (
              <div key={n.id} onClick={() => toggleRead(n.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition
                  ${n.read ? 'bg-white border-slate-100 hover:bg-slate-50' : 'bg-blue-50 border-blue-100 shadow-sm'}`}>
                <div className={`p-2 rounded-xl bg-white shadow-sm ${n.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</p>
                    {!n.read && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Preference Toggles */}
        <SectionCard className="h-fit">
          <h3 className="font-semibold text-slate-800 mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            {prefs.map((pref, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-600">{pref.label}</span>
                <button onClick={() => setPrefs(prev => prev.map((p, j) => j === i ? { ...p, on: !p.on } : p))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${pref.on ? 'bg-blue-600' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${pref.on ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
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
      <h3 className="font-semibold text-slate-800 mb-6">2024 Milestone Timeline</h3>
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
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tgf_dark_mode') === 'true'
    }
    return false
  })
  const [compactView, setCompactView] = useState(false)
  const [largeText, setLargeText] = useState(false)

  // Apply dark mode to document when state changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('tgf_dark_mode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('tgf_dark_mode', 'false')
    }
  }, [darkMode])
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
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?.userId || ''
        },
        body: JSON.stringify({
          display_name: profileData.displayName,
          timezone: profileData.timezone
        })
      })
      if (response.ok) {
        toast('Profile saved successfully!')
      } else {
        toast('Failed to save profile', 'error')
      }
    } catch (error) {
      console.error('Profile save error:', error)
      toast('Error saving profile', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Manage your profile, preferences, and accessibility options" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <SectionCard>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" />Profile</h3>
          <div className="flex items-center gap-4 mb-4">
            <Avatar initials={(user?.display_name || user?.name || 'U').slice(0, 2).toUpperCase()} size="lg"
              color="bg-gradient-to-br from-blue-500 to-purple-600" />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">{user?.display_name || user?.name || 'Portal User'}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.role || 'Client'}</p>
              <button onClick={() => toast('Avatar upload coming soon', 'warn')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-0.5">Change avatar</button>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Display Name</label>
              <input 
                value={profileData.displayName}
                onChange={(e) => handleProfileChange('displayName', e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Email</label>
              <input 
                value={profileData.email}
                type="email" 
                disabled
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Email is managed by your account settings</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Time Zone</label>
              <select 
                value={profileData.timezone}
                onChange={(e) => handleProfileChange('timezone', e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                <option>Africa/Nairobi (UTC+3)</option>
                <option>UTC (UTC+0)</option>
                <option>America/New_York (UTC-5)</option>
                <option>Europe/London (UTC+0)</option>
                <option>Asia/Tokyo (UTC+9)</option>
              </select>
            </div>
            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </SectionCard>

        <div className="space-y-4">
          {/* Notification Preferences */}
          <SectionCard>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-yellow-500" />Notifications</h3>
            <div className="space-y-3">
              {[['Email Notifications', emailNotifs, setEmailNotifs],
                ['SMS Alerts', smsNotifs, setSmsNotifs]].map(([label, val, setter]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
                  <button onClick={() => setter(p => !p)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${val ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Accessibility */}
          <SectionCard>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Eye className="w-4 h-4 text-purple-500" />Accessibility</h3>
            <div className="space-y-3">
              {[['Dark Mode', darkMode, setDarkMode],
                ['Compact View (coming soon)', compactView, setCompactView],
                ['Large Text (coming soon)', largeText, setLargeText]].map(([label, val, setter]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{label}</span>
                  <button onClick={() => setter(p => !p)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${val ? 'bg-purple-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Mobile App Links */}
          <SectionCard>
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Smartphone className="w-4 h-4 text-emerald-500" />Mobile App</h3>
            <p className="text-sm text-slate-500 mb-3">Access your portal on the go with our mobile app.</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => toast('iOS app coming soon', 'warn')} className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm hover:bg-gray-800 transition">
                <Smartphone className="w-4 h-4" /> App Store
              </button>
              <button onClick={() => toast('Android app coming soon', 'warn')} className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm hover:bg-green-800 transition">
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
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const unreadNotifCount = mockNotifications.filter(n => !n.read).length
  const [modal, setModal] = useState({ open: false, type: '', data: null })
  const openModal = (type, data = null) => setModal({ open: true, type, data })
  const closeModal = () => setModal({ open: false, type: '', data: null })
  const toasts = useToast()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Required</h1>
          <p className="text-slate-500 mb-8">Please log in to access your client portal.</p>
          <Link to="/login"
            className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition text-center">
            Log In to Portal
          </Link>
        </div>
      </div>
    )
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':       return <OverviewSection user={user} />
      case 'projects':       return <ProjectsSection onView={p => openModal('viewProject', p)} onEdit={p => openModal('editProject', p)} />
      case 'tasks':          return <TasksSection onAddTask={() => openModal('addTask')} />
      case 'resources':      return <ResourcesSection />
      case 'financials':     return <FinancialsSection />
      case 'documents':      return <DocumentsSection />
      case 'communication':  return <CommunicationSection />
      case 'notifications':  return <NotificationsSection />
      case 'feedback':       return <FeedbackSection />
      case 'risk':           return <RiskSection />
      case 'analytics':      return <AnalyticsSection />
      case 'security':       return <SecuritySection user={user} />
      case 'roadmap':        return <RoadmapSection />
      case 'integrations':   return <IntegrationsSection />
      case 'reports':        return <ReportsSection />
      case 'settings':       return <SettingsSection user={user} />
      default:               return <OverviewSection user={user} />
    }
  }

  const currentNav = navSections.find(n => n.id === activeSection)

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 flex flex-col w-64
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
        text-white transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-2xl
      `}>
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">TGF Portal</p>
              <p className="text-xs text-slate-400">Client Hub</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-5 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <Avatar initials={(user?.name || 'U').slice(0, 2).toUpperCase()} size="md"
              color="bg-gradient-to-br from-blue-400 to-purple-500" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Client User'}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role || 'Client'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {navSections.map(section => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            const isNotif = section.id === 'notifications'
            return (
              <button key={section.id}
                onClick={() => { setActiveSection(section.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all duration-150 group relative
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/60'}`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="truncate">{section.label}</span>
                {isNotif && unreadNotifCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                    {unreadNotifCount}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-700/50">
          <button onClick={() => navigate('/login')}
            className="w-full flex items-center gap-2 text-sm text-slate-400 hover:text-white transition py-2 rounded-lg hover:bg-slate-700/40 px-2">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition text-slate-600">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-800">{currentNav?.label || 'Portal'}</h2>
              <p className="text-xs text-slate-400 hidden sm:block">Greggory Systems And Strategy Firm · Client Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection('notifications')}
              className="relative p-2 rounded-xl hover:bg-slate-100 transition text-slate-500 hover:text-slate-700">
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadNotifCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSection('settings')}
              className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500 hover:text-slate-700">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <Avatar initials={(user?.name || 'U').slice(0, 2).toUpperCase()} size="sm"
              color="bg-gradient-to-br from-blue-500 to-indigo-600" />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderSection()}
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />

      {/* View Project Modal */}
      <Modal open={modal.open && modal.type === 'viewProject'} onClose={closeModal} title={modal.data?.name || 'Project Details'}>
        {modal.data && (
          <div className="space-y-3 text-sm">
            <p className="text-slate-600">{modal.data.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Progress</p><p className="font-bold text-slate-800">{modal.data.progress}%</p></div>
              <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Status</p><p className="font-bold text-slate-800 capitalize">{modal.data.status}</p></div>
              <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Budget</p><p className="font-bold text-slate-800">${modal.data.budget?.toLocaleString()}</p></div>
              <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Spent</p><p className="font-bold text-slate-800">${modal.data.spent?.toLocaleString()}</p></div>
              <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Start</p><p className="font-bold text-slate-800">{modal.data.startDate}</p></div>
              <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Expected End</p><p className="font-bold text-slate-800">{modal.data.expectedCompletion}</p></div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400 mb-1">Team</p><p className="font-medium text-slate-700">{modal.data.team?.join(', ')}</p></div>
            <button onClick={closeModal} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition">Close</button>
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
