import React, { useState, useEffect } from "react";
import { getApiUrl } from "../../services/api";
import {
  LogOut,
  User,
  Code,
  Terminal,
  Zap,
  FileText,
  CheckCircle,
  Calendar,
  Layers,
  ShieldCheck,
  Briefcase,
  Target,
  Clock,
  TrendingUp,
  Users,
  AlertTriangle,
  FileCheck,
  ChevronRight,
} from "lucide-react";

export function Developer() {
  const [developerName, setDeveloperName] = useState("Developer's Dashboard");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [focusItems, setFocusItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [resourceAllocations, setResourceAllocations] = useState([]);
  const [qaCheckpoints, setQaCheckpoints] = useState([]);
  const [documentSummary, setDocumentSummary] = useState([]);
  const [kpiMetrics, setKpiMetrics] = useState([]);
  const [projectTimeline, setProjectTimeline] = useState([]);

  useEffect(() => {
    const loadDeveloperData = async () => {
      try {
        setLoading(true);

        // Get user data from session
        const rawSession =
          sessionStorage.getItem("gf_admin_user") ||
          sessionStorage.getItem("gf_admin_session");
        if (rawSession) {
          // gf_admin_session wraps { token, user, expiresAt }; gf_admin_user is the user object directly
          let parsed = JSON.parse(rawSession);
          const userData = parsed.user || parsed;
          setDeveloperName(
            userData.display_name ||
              (userData.first_name && userData.last_name
                ? `${userData.first_name} ${userData.last_name}`
                : userData.first_name) ||
              userData.name ||
              "Developer's Dashboard",
          );
          // Use a relative path so the Vite proxy forwards it to the backend.
          // Works on both localhost and network IP.
          if (userData.id) {
            setProfilePhoto(`/api/admin/profile-photo/developer/${userData.id}`);
          }
        }

        // Fetch developer dashboard data
        const response = await fetch(
          getApiUrl("/api/admin/developer-dashboard"),
        );
        if (!response.ok) {
          throw new Error("Failed to fetch developer dashboard data");
        }
        const data = await response.json();

        if (data.success && data.dashboard) {
          const dashboard = data.dashboard;

          // Set notifications
          setNotifications(dashboard.notifications || []);

          // Set tasks with progress calculation
          const totalTasks = dashboard.tasks?.total || 0;
          const completedTasks = dashboard.tasks?.completed || 0;
          const inProgressTasks = dashboard.tasks?.inProgress || 0;

          setTasks([
            {
              id: 1,
              name: "Completed Tasks",
              progress:
                totalTasks > 0
                  ? Math.round((completedTasks / totalTasks) * 100)
                  : 0,
            },
            {
              id: 2,
              name: "In Progress Tasks",
              progress:
                totalTasks > 0
                  ? Math.round((inProgressTasks / totalTasks) * 100)
                  : 0,
            },
            {
              id: 3,
              name: "Pending Tasks",
              progress:
                totalTasks > 0
                  ? Math.round(
                      ((dashboard.tasks?.pending || 0) / totalTasks) * 100,
                    )
                  : 0,
            },
          ]);

          // Set focus items based on recent activity
          setFocusItems([
            {
              id: 1,
              title: "Task Progress",
              detail: `${completedTasks} of ${totalTasks} tasks completed.`,
            },
            {
              id: 2,
              title: "Recent Activity",
              detail: `${dashboard.recentActivity?.length || 0} recent updates.`,
            },
          ]);
        }

        // Fetch assigned tasks data
        try {
          const tasksResponse = await fetch(getApiUrl("/api/admin/assigned-tasks"));
          if (tasksResponse.ok) {
            const tasksData = await tasksResponse.json();
            if (tasksData.success) {
              setAssignedTasks(tasksData.data || []);
            }
          }
        } catch (err) {
          console.error("Error fetching assigned tasks:", err);
        }

        // Fetch milestones data
        try {
          const milestonesResponse = await fetch(getApiUrl("/api/admin/milestones"));
          if (milestonesResponse.ok) {
            const milestonesData = await milestonesResponse.json();
            if (milestonesData.success) {
              setMilestones(milestonesData.data || []);
            }
          }
        } catch (err) {
          console.error("Error fetching milestones:", err);
        }

        // Fetch resource allocations data
        try {
          const resourcesResponse = await fetch(getApiUrl("/api/admin/resource-allocations"));
          if (resourcesResponse.ok) {
            const resourcesData = await resourcesResponse.json();
            if (resourcesData.success) {
              setResourceAllocations(resourcesData.data || []);
            }
          }
        } catch (err) {
          console.error("Error fetching resource allocations:", err);
        }

        // Fetch QA checkpoints data
        try {
          const qaResponse = await fetch(getApiUrl("/api/admin/qa-checkpoints"));
          if (qaResponse.ok) {
            const qaData = await qaResponse.json();
            if (qaData.success) {
              setQaCheckpoints(qaData.data || []);
            }
          }
        } catch (err) {
          console.error("Error fetching QA checkpoints:", err);
        }

        // Fetch document summary data
        try {
          const docsResponse = await fetch(getApiUrl("/api/admin/document-summary"));
          if (docsResponse.ok) {
            const docsData = await docsResponse.json();
            if (docsData.success) {
              setDocumentSummary(docsData.data || []);
            }
          }
        } catch (err) {
          console.error("Error fetching document summary:", err);
        }

        // Fetch KPI metrics data
        try {
          const kpiResponse = await fetch(getApiUrl("/api/admin/kpi-metrics"));
          if (kpiResponse.ok) {
            const kpiData = await kpiResponse.json();
            if (kpiData.success) {
              setKpiMetrics(kpiData.data || []);
            }
          }
        } catch (err) {
          console.error("Error fetching KPI metrics:", err);
        }

        // Fetch project timeline data
        try {
          const timelineResponse = await fetch(getApiUrl("/api/admin/project-timeline"));
          if (timelineResponse.ok) {
            const timelineData = await timelineResponse.json();
            if (timelineData.success) {
              setProjectTimeline(timelineData.data || []);
            }
          }
        } catch (err) {
          console.error("Error fetching project timeline:", err);
        }
      } catch (err) {
        console.error("Error loading developer data:", err);
        setError(err.message);

        // Fallback data
        setNotifications([
          {
            id: 1,
            title: "Error loading data",
            description: "Unable to fetch developer dashboard.",
            icon: ShieldCheck,
          },
        ]);
        setTasks([{ id: 1, name: "Data loading failed", progress: 0 }]);
        setFocusItems([
          {
            id: 1,
            title: "Connection issue",
            detail: "Please check your internet connection.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDeveloperData();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("gf_admin_session_token");
    sessionStorage.removeItem("gf_admin_user");
    sessionStorage.removeItem("gf_admin_session");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-[160px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-10 animate-fade-in">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/50">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                  Developer workspace
                </p>
                <h1 className="mt-3 text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Welcome back, {developerName}
                </h1>
                <p className="mt-3 text-base text-slate-600 max-w-2xl">
                  Your personal development dashboard puts task progress,
                  deployment notes, and release actions within reach.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" /> Active
                  session
                </span>
                <span className="inline-flex items-center rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-sky-600 mr-2" /> Developer
                  access
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Assigned Tasks
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {assignedTasks.length}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl shadow-lg">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Milestones
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {milestones.length}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  QA Checkpoints
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {qaCheckpoints.length}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl shadow-lg">
                <FileCheck className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-600 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Documents
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {documentSummary.length}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-pink-600 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 mb-10 xl:grid-cols-[1.7fr_1fr] animate-fade-in">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Task Pulse */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                    Task & resource pulse
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                    What your team is doing now
                  </h3>
                </div>
                <div className="rounded-3xl bg-slate-50 p-3 text-slate-700">
                  <Layers className="h-7 w-7" />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {assignedTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="rounded-3xl border border-slate-100 p-5 hover:shadow-lg transition-shadow bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {task.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {task.project} · {task.assignee}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          task.priority === "Critical" ? "bg-rose-100 text-rose-700" :
                          task.priority === "High" ? "bg-orange-100 text-orange-700" :
                          task.priority === "Medium" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{task.status}</span>
                      <span>{task.progress}% complete</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Capacity */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                    Resource capacity
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                    Team availability
                  </h3>
                </div>
                <Users className="h-7 w-7 text-teal-600" />
              </div>
              <div className="mt-6 space-y-4">
                {resourceAllocations.map((resource) => (
                  <div
                    key={resource.id}
                    className="rounded-3xl border border-slate-100 p-4 bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {resource.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {resource.role}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {resource.availability}
                      </span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                        style={{ width: `${resource.utilization}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Utilization {resource.utilization}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestone Tracking */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                    Milestone tracking
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                    Upcoming milestones
                  </h3>
                </div>
                <Target className="h-7 w-7 text-purple-600" />
              </div>
              <div className="mt-6 space-y-4">
                {milestones.slice(0, 3).map((milestone) => (
                  <div
                    key={milestone.id}
                    className="rounded-3xl border border-slate-100 p-4 bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">
                        {milestone.name}
                      </p>
                      <span
                        className={`text-xs font-semibold ${
                          milestone.status === "completed" ? "text-emerald-600" :
                          milestone.status === "in_progress" ? "text-blue-600" :
                          "text-slate-600"
                        }`}
                      >
                        {milestone.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      Due: {milestone.dueDate}
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500"
                        style={{ width: `${milestone.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QA Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                    QA status
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                    Quality checkpoints
                  </h3>
                </div>
                <FileCheck className="h-7 w-7 text-amber-600" />
              </div>
              <div className="mt-6 space-y-4">
                {qaCheckpoints.slice(0, 3).map((qa) => (
                  <div
                    key={qa.id}
                    className="rounded-3xl border border-slate-100 p-4 bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">
                        {qa.name}
                      </p>
                      <span
                        className={`text-xs font-semibold ${
                          qa.status === "passed" ? "text-emerald-600" :
                          qa.status === "failed" ? "text-rose-600" :
                          "text-amber-600"
                        }`}
                      >
                        {qa.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      Issues: {qa.issuesFound} | Resolved: {qa.issuesResolved}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KPI Metrics & Timeline */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                    Performance metrics
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                    KPI overview
                  </h3>
                </div>
                <TrendingUp className="h-7 w-7 text-indigo-600" />
              </div>
              <div className="mt-6 space-y-4">
                {kpiMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="rounded-3xl border border-slate-100 p-4 bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">
                        {metric.name}
                      </p>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          metric.trend === "up" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {metric.trend === "up" ? "↑" : "↓"} {metric.trend === "up" ? "Positive" : "Alert"}
                      </span>
                    </div>
                    <p className="mt-4 text-3xl font-semibold text-slate-900">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                    Project timeline
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                    Upcoming deadlines
                  </h3>
                </div>
                <Clock className="h-7 w-7 text-orange-600" />
              </div>
              <div className="mt-6 space-y-4">
                {projectTimeline.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-slate-100 p-4 bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <span className="text-sm text-slate-500">
                        {item.dueDate}
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Original Sections */}
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr] animate-fade-in">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Quick actions</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">
                    Developer tools
                  </h3>
                </div>
                <FileText className="h-7 w-7 text-slate-600" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Open code review",
                    subtitle: "View pull requests",
                    icon: Code,
                  },
                  {
                    title: "Deployment notes",
                    subtitle: "Review latest release",
                    icon: Calendar,
                  },
                  {
                    title: "Access docs",
                    subtitle: "Project specifications",
                    icon: ShieldCheck,
                  },
                  {
                    title: "System board",
                    subtitle: "See current sprint",
                    icon: Briefcase,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4 hover:border-slate-300 transition"
                    >
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-lg font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {item.subtitle}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Notifications</p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Recent
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {notifications.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Release status</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">
                    Deployment readiness
                  </h3>
                </div>
                <Zap className="h-7 w-7 text-amber-500" />
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-sm text-slate-500">Next deploy window</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    Tomorrow, 09:00
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-sm text-slate-500">Current branch</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    main
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Developer;
