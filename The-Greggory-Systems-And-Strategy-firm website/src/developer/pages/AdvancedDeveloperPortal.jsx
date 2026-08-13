import React, { useState } from 'react';
import {
  Code2,
  GitBranch,
  Terminal,
  Globe,
  Database,
  Server,
  Shield,
  Activity,
  Bug,
  TestTube,
  Monitor,
  Layers,
  Cloud,
  Smartphone,
  Brain,
  BarChart3,
  Users,
  MessageSquare,
  FileText,
  Settings,
  Lock,
  Network,
  Workflow,
  Cpu,
  HardDrive,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Clock,
  GitPullRequest,
  Commit,
  Braces,
  Package,
  Rocket,
  LayoutDashboard,
  FileCode,
  Globe2,
  Server as ServerIcon,
  Cpu as CpuIcon,
  LineChart,
  PieChart,
  Calendar,
  Timer,
  FileSearch,
  Code,
  TerminalSquare,
} from 'lucide-react';

export function AdvancedDeveloperPortal({ user }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'code-editor', label: 'Code Editor', icon: Code2 },
    { id: 'git', label: 'Git Repository', icon: GitBranch },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'api', label: 'API Testing', icon: Globe },
    { id: 'database', label: 'Database Tools', icon: Database },
    { id: 'ci-cd', label: 'CI/CD Pipeline', icon: Workflow },
    { id: 'debugging', label: 'Debugging', icon: Bug },
    { id: 'testing', label: 'Testing Suite', icon: TestTube },
    { id: 'monitoring', label: 'Monitoring', icon: Monitor },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'documentation', label: 'Documentation', icon: FileText },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'infrastructure', label: 'Infrastructure', icon: ServerIcon },
    { id: 'containers', label: 'Containers', icon: Layers },
    { id: 'cloud', label: 'Cloud', icon: Cloud },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'backup', label: 'Backup & Recovery', icon: HardDrive },
    { id: 'logging', label: 'Logging', icon: FileSearch },
    { id: 'mobile', label: 'Mobile Dev', icon: Smartphone },
    { id: 'ai-ml', label: 'AI/ML', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: LineChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'code-editor':
        return <CodeEditorSection />;
      case 'git':
        return <GitRepositorySection />;
      case 'terminal':
        return <TerminalSection />;
      case 'api':
        return <APITestingSection />;
      case 'database':
        return <DatabaseToolsSection />;
      case 'ci-cd':
        return <CICDSection />;
      case 'debugging':
        return <DebuggingSection />;
      case 'testing':
        return <TestingSection />;
      case 'monitoring':
        return <MonitoringSection />;
      case 'security':
        return <SecuritySection />;
      case 'documentation':
        return <DocumentationSection />;
      case 'collaboration':
        return <CollaborationSection />;
      case 'performance':
        return <PerformanceSection />;
      case 'infrastructure':
        return <InfrastructureSection />;
      case 'containers':
        return <ContainersSection />;
      case 'cloud':
        return <CloudSection />;
      case 'network':
        return <NetworkSection />;
      case 'backup':
        return <BackupSection />;
      case 'logging':
        return <LoggingSection />;
      case 'mobile':
        return <MobileSection />;
      case 'ai-ml':
        return <AIMLSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'reports':
        return <ReportsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <OverviewSection />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-700 p-2">
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                      activeSection === item.id
                        ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-700/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="animate-fade-in">
          {renderContent()}
        </div>

      </div>
    </div>
  );
}

// Overview Section
function OverviewSection() {
  return (
    <div className="space-y-6">
      {/* Developer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Commits", value: "142", icon: Commit, color: "from-emerald-500 to-teal-600" },
          { label: "Pull Requests", value: "8", icon: GitPullRequest, color: "from-blue-500 to-indigo-600" },
          { label: "Issues", value: "3", icon: AlertTriangle, color: "from-orange-500 to-amber-600" },
          { label: "Deployments", value: "12", icon: Rocket, color: "from-violet-500 to-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-3xl shadow-xl p-6 border border-white/10 text-white`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] font-semibold opacity-70">{stat.label}</p>
                <h3 className="mt-2 text-3xl font-bold">{stat.value}</h3>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Terminal, label: 'New Terminal', color: 'from-sky-500 to-blue-600' },
            { icon: FileCode, label: 'New File', color: 'from-emerald-500 to-teal-600' },
            { icon: GitBranch, label: 'New Branch', color: 'from-orange-500 to-amber-600' },
            { icon: Play, label: 'Run Code', color: 'from-violet-500 to-purple-600' },
          ].map((action) => (
            <button key={action.label} className={`bg-gradient-to-br ${action.color} rounded-2xl p-4 border border-white/10 hover:shadow-lg transition-all`}>
              <action.icon className="h-6 w-6 text-white mx-auto mb-2" />
              <p className="text-white text-sm font-medium text-center">{action.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Code Editor Section
function CodeEditorSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-3">
            <Code2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Development</p>
            <h3 className="text-xl font-bold text-white">Code Editor</h3>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all">
          <Plus className="h-4 w-4" />
          New File
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <Code2 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Advanced Code Editor</h3>
          <p className="text-slate-400 mt-2">VS Code-like editor with syntax highlighting, IntelliSense, and multi-language support</p>
        </div>
      </div>
    </div>
  );
}

// Git Repository Section
function GitRepositorySection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-3">
            <GitBranch className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Version Control</p>
            <h3 className="text-xl font-bold text-white">Git Repository</h3>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all">
          <GitPullRequest className="h-4 w-4" />
          New PR
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <GitBranch className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Git Management</h3>
          <p className="text-slate-400 mt-2">Branch management, pull requests, commit history, and code review tools</p>
        </div>
      </div>
    </div>
  );
}

// Terminal Section
function TerminalSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl p-3">
            <Terminal className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Command Line</p>
            <h3 className="text-xl font-bold text-white">Terminal</h3>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-800 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all">
          <TerminalSquare className="h-4 w-4" />
          New Terminal
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <Terminal className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Terminal Emulator</h3>
          <p className="text-slate-400 mt-2">Multi-tab terminal with command history and integrated shell</p>
        </div>
      </div>
    </div>
  );
}

// API Testing Section
function APITestingSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-3">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">API Development</p>
            <h3 className="text-xl font-bold text-white">API Testing</h3>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all">
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <Globe className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">API Testing Interface</h3>
          <p className="text-slate-400 mt-2">Postman-like API testing with collections and environments</p>
        </div>
      </div>
    </div>
  );
}

// Database Tools Section
function DatabaseToolsSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-3">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Data Management</p>
            <h3 className="text-xl font-bold text-white">Database Tools</h3>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all">
          <Plus className="h-4 w-4" />
          New Query
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <Database className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Database Management</h3>
          <p className="text-slate-400 mt-2">SQL editor, schema viewer, and query optimization tools</p>
        </div>
      </div>
    </div>
  );
}

// CI/CD Section
function CICDSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-3">
            <Workflow className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">DevOps</p>
            <h3 className="text-xl font-bold text-white">CI/CD Pipeline</h3>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all">
          <Plus className="h-4 w-4" />
          New Pipeline
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <Workflow className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">CI/CD Pipeline Management</h3>
          <p className="text-slate-400 mt-2">Build automation, deployment workflows, and pipeline monitoring</p>
        </div>
      </div>
    </div>
  );
}

// Debugging Section
function DebuggingSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-3">
          <Bug className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Development</p>
          <h3 className="text-xl font-bold text-white">Debugging Tools</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <Bug className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Debugging Interface</h3>
          <p className="text-slate-400 mt-2">Breakpoints, watch windows, and performance profiling</p>
        </div>
      </div>
    </div>
  );
}

// Testing Section
function TestingSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-3">
          <TestTube className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Quality Assurance</p>
          <h3 className="text-xl font-bold text-white">Testing Suite</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <TestTube className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Testing Dashboard</h3>
          <p className="text-slate-400 mt-2">Unit tests, integration tests, and E2E testing</p>
        </div>
      </div>
    </div>
  );
}

// Monitoring Section
function MonitoringSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-3">
          <Monitor className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Observability</p>
          <h3 className="text-xl font-bold text-white">Monitoring Dashboard</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <Monitor className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">System Monitoring</h3>
          <p className="text-slate-400 mt-2">Application performance, metrics, and alerting</p>
        </div>
      </div>
    </div>
  );
}

// Security Section
function SecuritySection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-3">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Security</p>
          <h3 className="text-xl font-bold text-white">Security Center</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Security Dashboard</h3>
          <p className="text-slate-400 mt-2">Vulnerability scanning, dependency analysis, and security auditing</p>
        </div>
      </div>
    </div>
  );
}

// Documentation Section
function DocumentationSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-3">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Knowledge Base</p>
          <h3 className="text-xl font-bold text-white">Documentation</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Documentation Hub</h3>
          <p className="text-slate-400 mt-2">API docs, technical guides, and code examples</p>
        </div>
      </div>
    </div>
  );
}

// Collaboration Section
function CollaborationSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-3">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Teamwork</p>
          <h3 className="text-xl font-bold text-white">Collaboration Tools</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Collaboration Center</h3>
          <p className="text-slate-400 mt-2">Real-time code collaboration, pair programming, and team chat</p>
        </div>
      </div>
    </div>
  );
}

// Performance Section
function PerformanceSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-3">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Optimization</p>
          <h3 className="text-xl font-bold text-white">Performance Tools</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <Activity className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Performance Analysis</h3>
          <p className="text-slate-400 mt-2">Profiling, optimization, and performance monitoring</p>
        </div>
      </div>
    </div>
  );
}

// Infrastructure Section
function InfrastructureSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl p-3">
          <ServerIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">IT Operations</p>
          <h3 className="text-xl font-bold text-white">Infrastructure</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <ServerIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Infrastructure Management</h3>
          <p className="text-slate-400 mt-2">Server management, resource monitoring, and capacity planning</p>
        </div>
      </div>
    </div>
  );
}

// Containers Section
function ContainersSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-3">
          <Layers className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Containerization</p>
          <h3 className="text-xl font-bold text-white">Container Management</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <Layers className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Docker & Kubernetes</h3>
          <p className="text-slate-400 mt-2">Container orchestration and management</p>
        </div>
      </div>
    </div>
  );
}

// Cloud Section
function CloudSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-3">
          <Cloud className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Cloud Computing</p>
          <h3 className="text-xl font-bold text-white">Cloud Management</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <Cloud className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Multi-Cloud Platform</h3>
          <p className="text-slate-400 mt-2">AWS, Azure, GCP management and cost optimization</p>
        </div>
      </div>
    </div>
  );
}

// Network Section
function NetworkSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-3">
          <Network className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Networking</p>
          <h3 className="text-xl font-bold text-white">Network Management</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <Network className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Network Monitoring</h3>
          <p className="text-slate-400 mt-2">Traffic analysis, bandwidth monitoring, and network security</p>
        </div>
      </div>
    </div>
  );
}

// Backup Section
function BackupSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-3">
          <HardDrive className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Data Protection</p>
          <h3 className="text-xl font-bold text-white">Backup & Recovery</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <HardDrive className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Backup Management</h3>
          <p className="text-slate-400 mt-2">Automated backups, disaster recovery, and data restoration</p>
        </div>
      </div>
    </div>
  );
}

// Logging Section
function LoggingSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-3">
          <FileSearch className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Log Analysis</p>
          <h3 className="text-xl font-bold text-white">Logging & Analysis</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <FileSearch className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Log Aggregation</h3>
          <p className="text-slate-400 mt-2">Centralized logging, log analysis, and troubleshooting</p>
        </div>
      </div>
    </div>
  );
}

// Mobile Section
function MobileSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-3">
          <Smartphone className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Mobile Development</p>
          <h3 className="text-xl font-bold text-white">Mobile Dev Tools</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <Smartphone className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Mobile Development</h3>
          <p className="text-slate-400 mt-2">Device simulators, mobile testing, and app deployment</p>
        </div>
      </div>
    </div>
  );
}

// AI/ML Section
function AIMLSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-3">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Artificial Intelligence</p>
          <h3 className="text-xl font-bold text-white">AI/ML Tools</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Machine Learning Platform</h3>
          <p className="text-slate-400 mt-2">Model training, experiment tracking, and deployment</p>
        </div>
      </div>
    </div>
  );
}

// Analytics Section
function AnalyticsSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl p-3">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Data Analysis</p>
          <h3 className="text-xl font-bold text-white">Analytics Dashboard</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Developer Analytics</h3>
          <p className="text-slate-400 mt-2">Productivity metrics, code quality trends, and insights</p>
        </div>
      </div>
    </div>
  );
}

// Reports Section
function ReportsSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl p-3">
          <LineChart className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Reporting</p>
          <h3 className="text-xl font-bold text-white">Report Center</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-12">
          <LineChart className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Report Generation</h3>
          <p className="text-slate-400 mt-2">Custom reports, data export, and documentation</p>
        </div>
      </div>
    </div>
  );
}

// Settings Section
function SettingsSection() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl p-3">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Configuration</p>
          <h3 className="text-xl font-bold text-white">Settings</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-slate-400" />
              <span className="font-medium text-white">Security Settings</span>
            </div>
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-slate-400" />
              <span className="font-medium text-white">Notification Preferences</span>
            </div>
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CpuIcon className="h-5 w-5 text-slate-400" />
              <span className="font-medium text-white">Environment Configuration</span>
            </div>
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}