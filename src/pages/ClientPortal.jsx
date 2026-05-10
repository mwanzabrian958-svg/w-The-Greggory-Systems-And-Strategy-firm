import { useState, useEffect } from "react";
import {
  Briefcase,
  Calendar,
  FileText,
  MessageSquare,
  Phone,
  Bell,
  ChevronRight,
  DollarSign,
  ClipboardList,
  Layers,
  TrendingUp,
  ShieldCheck,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../services/api";

const ClientPortal = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [resourceAllocations, setResourceAllocations] = useState([]);
  const [budgetOverview, setBudgetOverview] = useState(null);
  const [documentSummary, setDocumentSummary] = useState([]);
  const [kpiMetrics, setKpiMetrics] = useState([]);
  const [roleUpdates, setRoleUpdates] = useState({ admin: [], developer: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingSMS, setSendingSMS] = useState(false);
  const [smsStatus, setSmsStatus] = useState(null);
  const [messageType, setMessageType] = useState("sms"); // 'sms' or 'whatsapp'
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    loadClientData();
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      setSmsStatus({ type: "error", message: "Please enter a message" });
      return;
    }

    setSendingSMS(true);
    setSmsStatus(null);

    try {
      const endpoint =
        messageType === "whatsapp" ? "/api/whatsapp/send" : "/api/sms/send";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          message: messageText,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSmsStatus({
          type: "success",
          message: `${messageType === "whatsapp" ? "WhatsApp" : "SMS"} message sent successfully to company (+254799789956)!`,
        });
        setMessageText("");
        setTimeout(() => {
          setShowMessageModal(false);
          setSmsStatus(null);
        }, 2000);
      } else {
        setSmsStatus({
          type: "error",
          message: data.message || "Failed to send message",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setSmsStatus({
        type: "error",
        message: "Error sending message. Please try again.",
      });
    } finally {
      setSendingSMS(false);
    }
  };

  const loadClientData = async () => {
    try {
      setError(null);
      setLoading(true);
      const userId = user?.id || user?.userId;

      if (!userId) {
        throw new Error("Unable to determine current user ID");
      }

      const response = await fetch(
        getApiUrl(`/api/users/client-dashboard/${userId}`),
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch dashboard data");
      }

      const dashboard = data.dashboard || {};
      setProjects(dashboard.projects || []);
      setInvoices(dashboard.invoices || []);
      setMessages(dashboard.messages || []);
      setTasks(dashboard.tasks || []);
      setResourceAllocations(dashboard.resourceAllocations || []);
      setBudgetOverview(dashboard.budgetOverview || null);
      setDocumentSummary(dashboard.documentSummary || []);
      setKpiMetrics(dashboard.kpiMetrics || []);
      setRoleUpdates(dashboard.roleUpdates || { admin: [], developer: [] });
    } catch (err) {
      console.error("Error loading client data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-700 mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadClientData}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-[160px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-10 animate-fade-in">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/50">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Welcome back, {user?.display_name || user?.name || "Client"}!
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Your dashboard is ready. Here's what's happening today.
            </p>
          </div>
        </div>

        {/* Portfolio Summary */}
        {!showProjects &&
          !showInvoices &&
          !showMessages &&
          !showQuickActions && (
            <div className="grid gap-6 mb-10 xl:grid-cols-[1.7fr_1fr] animate-fade-in">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                        Project health
                      </p>
                      <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                        Live delivery overview
                      </h2>
                      <p className="mt-3 text-sm text-slate-600">
                        A modern, transparent summary of milestones, spending,
                        and task progress.
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 text-slate-700">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                  </div>

                  <div className="mt-7 grid gap-4">
                    <div className="rounded-3xl bg-slate-50 p-5 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">
                          Budget status
                        </p>
                        <span className="text-xs uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                          Updated
                        </span>
                      </div>
                      <div className="mt-4 flex items-end gap-4">
                        <div>
                          <p className="text-3xl font-semibold text-slate-900">
                            ${budgetOverview?.spent?.toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-500">
                            of ${budgetOverview?.planned?.toLocaleString()}{" "}
                            planned
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Forecast</p>
                          <p className="text-xl font-semibold text-slate-900">
                            ${budgetOverview?.forecast?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 h-3 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                          style={{
                            width: `${Math.min(100, (budgetOverview?.spent / budgetOverview?.planned) * 100 || 0)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {kpiMetrics.map((metric) => (
                        <div
                          key={metric.id}
                          className="rounded-3xl bg-slate-50 p-5 border border-slate-100"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">
                              {metric.label}
                            </p>
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${metric.trend === "up" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                            >
                              {metric.trend === "up" ? "↑" : "↓"}{" "}
                              {metric.trend === "up" ? "Positive" : "Alert"}
                            </span>
                          </div>
                          <p className="mt-4 text-3xl font-semibold text-slate-900">
                            {metric.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
                        Service alignment
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold">
                        Admin + Developer focus
                      </h3>
                    </div>
                    <Users className="h-10 w-10 text-teal-300" />
                  </div>
                  <div className="mt-6 space-y-5">
                    <div className="rounded-3xl bg-slate-900/80 p-5 border border-white/10">
                      <div className="flex items-center justify-between text-sm text-slate-300 uppercase tracking-[0.2em]">
                        <span>Admin</span>
                        <span className="text-emerald-300">Control</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-200">
                        Approval workflows, budget tracking, payments, and audit
                        logs are managed by admin teams.
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-900/80 p-5 border border-white/10">
                      <div className="flex items-center justify-between text-sm text-slate-300 uppercase tracking-[0.2em]">
                        <span>Developer</span>
                        <span className="text-cyan-300">Execution</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-200">
                        Developers update tasks, QA checkpoints, deliverables,
                        and technical status in real-time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-5 gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                        Actionable transparency
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                        Administration & development updates
                      </h3>
                    </div>
                    <ShieldCheck className="h-10 w-10 text-teal-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            Admin responsibilities
                          </h4>
                          <p className="mt-2 text-sm text-slate-600">
                            Responsible for governance, financial accuracy, and
                            client-facing approvals.
                          </p>
                        </div>
                        <Users className="h-10 w-10 text-slate-400" />
                      </div>
                      <div className="mt-4 grid gap-3">
                        {roleUpdates.admin.map((item) => (
                          <div
                            key={item.title}
                            className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100"
                          >
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                              <p className="font-semibold text-slate-900">
                                {item.title}
                              </p>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            Developer responsibilities
                          </h4>
                          <p className="mt-2 text-sm text-slate-600">
                            Focused on delivery quality, task execution, and
                            technical updates.
                          </p>
                        </div>
                        <ClipboardList className="h-10 w-10 text-slate-400" />
                      </div>
                      <div className="mt-4 space-y-3">
                        {roleUpdates.developer.map((item) => (
                          <div
                            key={item.title}
                            className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100"
                          >
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-sky-500" />
                              <p className="font-semibold text-slate-900">
                                {item.title}
                              </p>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Quick Stats */}
        {!showProjects &&
          !showInvoices &&
          !showMessages &&
          !showQuickActions && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-fade-in">
              <div
                onClick={() => setShowProjects(!showProjects)}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Active Projects
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {projects.length}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>

              <div
                onClick={() => setShowInvoices(!showInvoices)}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Total Invoices
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {invoices.length}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>

              <div
                onClick={() => setShowMessages(!showMessages)}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      New Messages
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {messages.filter((m) => m.unread).length}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                    style={{ width: "40%" }}
                  ></div>
                </div>
              </div>

              <div
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Quick Actions
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">4</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl shadow-lg">
                    <Bell className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

        {!showProjects &&
          !showInvoices &&
          !showMessages &&
          !showQuickActions && (
            <div className="grid gap-6 mb-10 xl:grid-cols-[1fr_0.8fr] animate-fade-in">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
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
                  {tasks.slice(0, 3).map((task) => (
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
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${task.priority === "Critical" ? "bg-rose-100 text-rose-700" : task.priority === "High" ? "bg-orange-100 text-orange-700" : task.priority === "Medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}
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

              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
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

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                        Document snapshot
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                        Review requests and updates
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        Check the latest document statuses and next steps.
                      </p>
                    </div>
                    <FileText className="h-7 w-7 text-slate-600" />
                  </div>
                  <div className="mt-6 grid gap-4">
                    {documentSummary.map((doc) => (
                      <div
                        key={doc.id}
                        className="rounded-3xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {doc.label}
                          </p>
                          <p className="text-xs text-slate-500">
                            Updated by your team workflow
                          </p>
                        </div>
                        <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
                          {doc.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Main Content Grid */}
        {showProjects && (
          <div className="max-w-7xl mx-auto animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Briefcase className="w-6 h-6 mr-3" />
                  Your Projects
                </h3>
                <button
                  onClick={() => setShowProjects(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-6 h-6 transform rotate-270" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="border-2 border-gray-100 rounded-xl p-5 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {project.name}
                        </h4>
                        <span
                          className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            project.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : project.status === "in-progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span>Manager: {project.manager}</span>
                        <span className="font-semibold">
                          {project.progress}% complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {showInvoices && (
          <div className="max-w-7xl mx-auto animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <DollarSign className="w-6 h-6 mr-3" />
                  Recent Invoices
                </h3>
                <button
                  onClick={() => setShowInvoices(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-6 h-6 transform rotate-270" />
                </button>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {invoice.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {invoice.project}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            ${invoice.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                invoice.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : invoice.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {invoice.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {showMessages && (
          <div className="max-w-7xl mx-auto animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <MessageSquare className="w-6 h-6 mr-3" />
                  Recent Messages
                  <span className="ml-3 bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                    {messages.filter((m) => m.unread).length} unread
                  </span>
                </h3>
                <button
                  onClick={() => setShowMessages(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-6 h-6 transform rotate-270" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {messages.slice(0, 4).map((msg) => (
                    <div
                      key={msg.id}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${msg.unread ? "bg-amber-500" : "bg-gray-300"}`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-900">
                            {msg.sender}
                          </p>
                          <p className="text-xs text-gray-400">{msg.time}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {msg.subject}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-amber-600 text-sm font-bold hover:text-amber-700 flex items-center justify-center py-3 border-2 border-amber-200 rounded-xl hover:border-amber-300 transition-all">
                  View All Messages
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {showQuickActions && (
          <div className="max-w-7xl mx-auto animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Bell className="w-6 h-6 mr-3" />
                  Quick Actions
                </h3>
                <button
                  onClick={() => setShowQuickActions(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-6 h-6 transform rotate-270" />
                </button>
              </div>
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border-2 border-teal-100 hover:border-teal-300 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="p-4 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <span className="mt-3 font-semibold text-gray-700 group-hover:text-teal-600 transition-colors">
                    Schedule Meeting
                  </span>
                </button>

                <button
                  onClick={() => setShowMessageModal(true)}
                  className="group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <span className="mt-3 font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                    Send Message
                  </span>
                </button>

                <button className="group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <span className="mt-3 font-semibold text-gray-700 group-hover:text-emerald-600 transition-colors">
                    View Documents
                  </span>
                </button>

                <button className="group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <span className="mt-3 font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                    Call Support
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Modal (SMS/WhatsApp) */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-6">
              <h3 className="text-xl font-bold text-white">
                Send Message to Company
              </h3>
              <p className="text-teal-50 mt-1 text-sm">
                Message will be sent to +254799789956
              </p>
            </div>
            <div className="p-6">
              {/* Message Type Toggle */}
              <div className="flex space-x-3 mb-6">
                <button
                  onClick={() => setMessageType("sms")}
                  className={
                    messageType === "sms"
                      ? "flex-1 py-3 px-4 rounded-xl font-semibold transition-all bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg"
                      : "flex-1 py-3 px-4 rounded-xl font-semibold transition-all bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                >
                  SMS
                </button>
                <button
                  onClick={() => setMessageType("whatsapp")}
                  className={
                    messageType === "whatsapp"
                      ? "flex-1 py-3 px-4 rounded-xl font-semibold transition-all bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                      : "flex-1 py-3 px-4 rounded-xl font-semibold transition-all bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                >
                  WhatsApp
                </button>
              </div>

              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={
                  messageType === "whatsapp"
                    ? "Type your WhatsApp message here..."
                    : "Type your SMS message here..."
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-all"
                rows="5"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-2 text-right">
                {messageText.length}/160 characters
              </p>
              {smsStatus && (
                <div
                  className={
                    smsStatus.type === "success"
                      ? "mt-4 p-4 rounded-xl bg-green-50 border-2 border-green-200 text-green-700"
                      : "mt-4 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-700"
                  }
                >
                  {smsStatus.message}
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageText("");
                  setSmsStatus(null);
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
                disabled={sendingSMS}
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendingSMS || !messageText.trim()}
                className={
                  messageType === "whatsapp"
                    ? "px-6 py-3 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg font-semibold"
                    : "px-6 py-3 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg font-semibold"
                }
              >
                {sendingSMS
                  ? "Sending..."
                  : messageType === "whatsapp"
                    ? "Send WhatsApp"
                    : "Send SMS"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortal;
