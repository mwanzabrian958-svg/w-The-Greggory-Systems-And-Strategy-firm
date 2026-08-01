import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Code2,
  GitBranch,
  Database,
  Server,
  Shield,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  Terminal,
  Zap,
  FileCode,
  Globe,
  Network,
  Lock,
  Activity,
  BarChart3,
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Bell,
  User,
  Cpu,
  HardDrive,
  Cloud,
  TestTube,
  Bug,
  FileText,
  Layers,
  GitPullRequest,
  Commit,
  Braces,
  Package,
  Rocket,
  Monitor,
  Smartphone,
  Cpu as CpuIcon,
  Brain,
  Workflow,
} from 'lucide-react';

export function DeveloperNavbar({ user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    // Development
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, section: 'development' },
    { id: 'code', label: 'Code Editor', icon: Code2, section: 'development' },
    { id: 'git', label: 'Git Repository', icon: GitBranch, section: 'development' },
    { id: 'terminal', label: 'Terminal', icon: Terminal, section: 'development' },
    { id: 'api', label: 'API Testing', icon: Globe, section: 'development' },
    { id: 'database', label: 'Database', icon: Database, section: 'development' },
    // Operations
    { id: 'ci-cd', label: 'CI/CD Pipeline', icon: Workflow, section: 'operations' },
    { id: 'debugging', label: 'Debugging', icon: Bug, section: 'operations' },
    { id: 'testing', label: 'Testing', icon: TestTube, section: 'operations' },
    { id: 'infrastructure', label: 'Infrastructure', icon: Server, section: 'operations' },
    { id: 'containers', label: 'Containers', icon: Layers, section: 'operations' },
    { id: 'cloud', label: 'Cloud', icon: Cloud, section: 'operations' },
    { id: 'monitoring', label: 'Monitoring', icon: Monitor, section: 'operations' },
    // Analytics
    { id: 'performance', label: 'Performance', icon: Activity, section: 'analytics' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'analytics' },
    { id: 'ai-ml', label: 'AI/ML', icon: Brain, section: 'analytics' },
    // Collaboration & Tools
    { id: 'documentation', label: 'Documentation', icon: FileText, section: 'collaboration' },
    { id: 'collaboration', label: 'Collaboration', icon: Users, section: 'collaboration' },
    { id: 'security', label: 'Security', icon: Shield, section: 'collaboration' },
    { id: 'mobile', label: 'Mobile Dev', icon: Smartphone, section: 'collaboration' },
    { id: 'settings', label: 'Settings', icon: Settings, section: 'collaboration' },
  ];

  const handleNavClick = (itemId) => {
    setActiveSection(itemId);
    if (itemId === 'overview') {
      navigate('/developer');
    } else {
      navigate(`/developer/${itemId}`);
    }
    setIsMenuOpen(false);
  };

  const userName = user?.display_name || user?.name || 'Developer';

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 shadow-2xl z-50">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl p-2">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">Developer Portal</span>
              <p className="text-xs text-slate-400">The-Greggory-Systems-And-Strategy-firm</p>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search code, commands, documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">⌘K</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 8).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
            {/* More dropdown indicator could be added here for additional items */}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
            </button>

            {/* Quick Actions */}
            <button className="hidden md:flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all">
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Quick Action</span>
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-700">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-slate-400">Developer</p>
              </div>
              <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-full p-2">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-slate-700 bg-slate-900/95 backdrop-blur-xl">
            <div className="p-4 space-y-2">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                        activeSection === item.id
                          ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-700">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Navigation Bar - Quick Tools */}
        <div className="hidden lg:flex items-center gap-2 py-2 border-t border-slate-700 bg-slate-900/50">
          <span className="text-xs text-slate-500 px-2">Quick Tools:</span>
          {[
            { icon: Terminal, label: 'New Terminal', action: () => {} },
            { icon: FileCode, label: 'New File', action: () => {} },
            { icon: GitBranch, label: 'New Branch', action: () => {} },
            { icon: Play, label: 'Run Code', action: () => {} },
            { icon: Commit, label: 'Commit', action: () => {} },
            { icon: Upload, label: 'Deploy', action: () => {} },
          ].map((tool) => (
            <button
              key={tool.label}
              onClick={tool.action}
              className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all"
            >
              <tool.icon className="h-3 w-3" />
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default DeveloperNavbar;