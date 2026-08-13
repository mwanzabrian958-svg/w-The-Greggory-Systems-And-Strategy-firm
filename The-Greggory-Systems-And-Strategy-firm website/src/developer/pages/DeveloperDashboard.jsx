import React, { useState, useEffect } from 'react';
import { getApiUrl } from "../../services/api";
import {
  Code2,
  GitBranch,
  Database,
  Server,
  Shield,
  Activity,
  Terminal,
  Globe,
  Zap,
  FileCode,
  Layers,
  Cloud,
  Smartphone,
  Brain,
  BarChart3,
  Users,
  MessageSquare,
  Bell,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Cpu,
  HardDrive,
  Network,
  Lock,
  Workflow,
  TestTube,
  Bug,
  Monitor,
  Package,
  Rocket,
  Commit,
  GitPullRequest,
  Braces,
  Plus,
} from 'lucide-react';

export function DeveloperDashboard({ user }) {
  const userName = user?.display_name || user?.name || 'Developer';
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    commits: 142,
    pullRequests: 8,
    issues: 3,
    deployments: 12,
  });
  const [recentCommits, setRecentCommits] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    uptime: '99.9%',
    responseTime: '45ms',
    cpuUsage: '23%',
    memoryUsage: '45%',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate data fetching
        setTimeout(() => {
          setRecentCommits([
            { id: 1, message: 'Fix authentication bug', author: 'John Doe', time: '2 hours ago', branch: 'main' },
            { id: 2, message: 'Add user profile feature', author: 'Jane Smith', time: '5 hours ago', branch: 'feature/profile' },
            { id: 3, message: 'Update dependencies', author: 'Bob Johnson', time: '1 day ago', branch: 'main' },
            { id: 4, message: 'Refactor API endpoints', author: 'Alice Williams', time: '2 days ago', branch: 'refactor/api' },
          ]);

          setActiveProjects([
            { id: 1, name: 'Website Redesign', progress: 75, status: 'In Progress', language: 'React' },
            { id: 2, name: 'Mobile App', progress: 45, status: 'In Progress', language: 'React Native' },
            { id: 3, name: 'API Gateway', progress: 90, status: 'Testing', language: 'Node.js' },
          ]);

          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching developer data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'code', label: 'Code Editor', icon: Code2 },
    { id: 'git', label: 'Git & Version Control', icon: GitBranch },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'api', label: 'API Development', icon: Globe },
    { id: 'database', label: 'Database Tools', icon: Database },
    { id: 'ci-cd', label: 'CI/CD Pipeline', icon: Workflow },
    { id: 'debugging', label: 'Debugging', icon: Bug },
    { id: 'testing', label: 'Testing Suite', icon: TestTube },
    { id: 'monitoring', label: 'Monitoring', icon: Monitor },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto"></div>
              <p className="mt-6 text-lg text-slate-300 font-medium">Loading developer dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-700 rounded-3xl shadow-2xl p-8 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full translate-y-24 -translate-x-24 blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                    <Code2 className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm uppercase tracking-[0.3em] text-teal-100 font-semibold">
                    Developer Command Center
                  </p>
                </div>
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Welcome back, {userName}!
                </h1>
                <p className="mt-4 text-lg text-teal-100 max-w-2xl">
                  Your comprehensive development environment is ready. Code, collaborate, and ship faster than ever.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 hover:bg-white/30 transition-all flex items-center gap-2">
                  <Play className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">Quick Start</span>
                </button>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 hover:bg-white/30 transition-all">
                  <Bell className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-700 p-2">
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                      activeSection === item.id
                        ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-700/50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Developer Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          {[
            { label: "Commits", value: stats.commits, icon: Commit, color: "from-emerald-500 to-teal-600", trend: "+12%" },
            { label: "Pull Requests", value: stats.pullRequests, icon: GitPullRequest, color: "from-blue-500 to-indigo-600", trend: "+3" },
            { label: "Issues", value: stats.issues, icon: Bug, color: "from-orange-500 to-amber-600", trend: "-2" },
            { label: "Deployments", value: stats.deployments, icon: Rocket, color: "from-violet-500 to-purple-600", trend: "+8" },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`bg-gradient-to-br ${stat.color} rounded-3xl shadow-xl p-6 border border-white/10 text-white relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] font-semibold opacity-70">{stat.label}</p>
                      <h3 className="mt-2 text-3xl font-bold">{stat.value}</h3>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>{stat.trend}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 xl:grid-cols-[2fr_1fr] mb-8 animate-fade-in">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Active Projects */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-3">
                    <Layers className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">
                      Development
                    </p>
                    <h3 className="text-xl font-bold text-white">Active Projects</h3>
                  </div>
                </div>
                <button className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Project
                </button>
              </div>
              
              <div className="space-y-4">
                {activeProjects.map((project) => (
                  <div key={project.id} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700 hover:border-teal-500/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileCode className="h-5 w-5 text-teal-400" />
                        <div>
                          <p className="text-white font-medium">{project.name}</p>
                          <p className="text-slate-400 text-sm">{project.language}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        project.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white font-medium">{project.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-500" style={{ width: `${project.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Commits */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-3">
                    <GitBranch className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">
                      Version Control
                    </p>
                    <h3 className="text-xl font-bold text-white">Recent Commits</h3>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {recentCommits.map((commit) => (
                  <div key={commit.id} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700 hover:border-emerald-500/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="bg-emerald-500/20 rounded-xl p-2">
                        <Commit className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{commit.message}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                          <span>{commit.author}</span>
                          <span>•</span>
                          <span>{commit.time}</span>
                          <span>•</span>
                          <span className="text-teal-400">{commit.branch}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* System Health */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-3">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">
                    Infrastructure
                  </p>
                  <h3 className="text-xl font-bold text-white">System Health</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700 text-center">
                  <Activity className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">{systemHealth.uptime}</p>
                  <p className="text-slate-400 text-sm">Uptime</p>
                </div>
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700 text-center">
                  <Zap className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">{systemHealth.responseTime}</p>
                  <p className="text-slate-400 text-sm">Response</p>
                </div>
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700 text-center">
                  <Cpu className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">{systemHealth.cpuUsage}</p>
                  <p className="text-slate-400 text-sm">CPU</p>
                </div>
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700 text-center">
                  <HardDrive className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">{systemHealth.memoryUsage}</p>
                  <p className="text-slate-400 text-sm">Memory</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-3">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">
                    Quick Actions
                  </p>
                  <h3 className="text-xl font-bold text-white">Get Started</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-gradient-to-br from-sky-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-500/30 hover:border-blue-500 transition-all">
                  <Terminal className="h-6 w-6 text-blue-400 mb-2 mx-auto" />
                  <p className="text-sm font-medium text-white text-center">Terminal</p>
                </button>
                <button className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl p-4 border border-emerald-500/30 hover:border-emerald-500 transition-all">
                  <Code2 className="h-6 w-6 text-emerald-400 mb-2 mx-auto" />
                  <p className="text-sm font-medium text-white text-center">Code Editor</p>
                </button>
                <button className="bg-gradient-to-br from-orange-500/20 to-amber-600/20 rounded-2xl p-4 border border-orange-500/30 hover:border-orange-500 transition-all">
                  <GitBranch className="h-6 w-6 text-orange-400 mb-2 mx-auto" />
                  <p className="text-sm font-medium text-white text-center">Git</p>
                </button>
                <button className="bg-gradient-to-br from-rose-500/20 to-pink-600/20 rounded-2xl p-4 border border-rose-500/30 hover:border-rose-500 transition-all">
                  <Globe className="h-6 w-6 text-rose-400 mb-2 mx-auto" />
                  <p className="text-sm font-medium text-white text-center">API Test</p>
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-3">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">
                    Notifications
                  </p>
                  <h3 className="text-xl font-bold text-white">Recent Alerts</h3>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/20 rounded-full p-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Deployment successful</p>
                      <p className="text-slate-400 text-xs">API Gateway deployed to production</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500/20 rounded-full p-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Code review pending</p>
                      <p className="text-slate-400 text-xs">PR #142 needs your attention</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}