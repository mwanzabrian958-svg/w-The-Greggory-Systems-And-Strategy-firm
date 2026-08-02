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
  RefreshCw,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../services/api";

const ClientPortal = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [businessSummary, setBusinessSummary] = useState(null);
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
          Authorization: `Bearer ${user?.token || ""}`,
        },
        body: JSON.stringify({
          message: messageText,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const simulated = Boolean(data.simulated);
        const relayLabel = simulated ? "queued for delivery" : "sent successfully";
        setSmsStatus({
          type: "success",
          message: `${messageType === "whatsapp" ? "WhatsApp" : "SMS"} message ${relayLabel} to company (+254799789956)!`,
        });
        setMessageText("");
        setTimeout(() => {
          setShowMessageModal(false);
          setSmsStatus(null);
        }, 2200);
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

      const response = await fetch(getApiUrl('/api/users/client-dashboard'), {
        headers: {
          Authorization: `Bearer ${user?.token || ''}`,
        },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch dashboard data");
      }

      const dashboard = data.dashboard || {};
      setProjects(dashboard.projects || []);
      setBusinessSummary(dashboard.businessSummary || null);
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
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gold-500/20 blur-[60px] rounded-full animate-pulse" />
          <div className="relative z-10">
            <RefreshCw className="h-16 w-16 text-gold-500 mx-auto animate-spin mb-6" />
            <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.5em]">Synchronizing Portal Protocol...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="text-center max-w-lg w-full relative">
          <div className="absolute inset-0 bg-rose-500/10 blur-[80px] rounded-full" />
          <div className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl">
            <AlertCircle className="h-16 w-16 text-rose-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">
              Protocol Disruption
            </h2>
            <p className="text-slate-400 font-medium leading-relaxed mb-8">{error}</p>
            <button
              onClick={loadClientData}
              className="w-full py-4 bg-gold-500 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20"
            >
              Re-Initialize System
            </button>
          </div>
        </div>
      </div>
    );
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Protocol */}
        <div className="mb-10 animate-fade-in">
          <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-48 w-48 bg-gold-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2">Operational Protocol</p>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase">
                  Welcome, {user?.display_name || user?.name || "Client"}
                </h1>
                <div className="h-1 w-12 bg-gold-500 mt-4 rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Status</p>
                  <p className="text-emerald-400 font-bold uppercase tracking-wider text-sm">Strategic Alignment: 100%</p>
                </div>
                <div className="h-12 w-px bg-white/10 hidden sm:block" />
                <button
                  onClick={loadClientData}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gold-500"
                  title="Refresh Systems"
                >
                  <RefreshCw size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Summary - Lifecycle Focused */}
        {!showProjects &&
          !showInvoices &&
          !showMessages &&
          !showQuickActions && (
            <div className="grid gap-6 mb-10 xl:grid-cols-[1.7fr_1fr] animate-fade-in">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/10 p-8 group transition-all duration-500 hover:bg-white/[0.08]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em] mb-2">
                        Business Operations
                      </p>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                        What we are executing for you
                      </h2>
                      <p className="mt-4 text-sm text-slate-400 font-medium leading-relaxed">
                        Every milestone, invoice, document, and communication is visible so you can see the real work being delivered for your business.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gold-500/10 p-4 text-gold-500 border border-gold-500/20 group-hover:scale-110 transition-transform">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4">
                    <div className="rounded-[24px] bg-white/5 p-6 border border-white/5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Budget Architecture
                        </p>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full">
                          Synchronized
                        </span>
                      </div>
                      <div className="mt-6 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-3xl font-black text-white">
                            KES {budgetOverview?.spent?.toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Utilized Capital
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-300">
                            KES {budgetOverview?.planned?.toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Allocated
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gold-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                          style={{
                            width: `${Math.min(100, (budgetOverview?.spent / budgetOverview?.planned) * 100 || 0)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="mt-4 text-xs font-medium text-slate-400">
                        {businessSummary ? `${businessSummary.activeProjects} active engagements and ${businessSummary.openInvoices} open invoice items currently visible.` : "Your operational summary will appear here as work is registered."}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {kpiMetrics.map((metric) => (
                        <div
                          key={metric.id}
                          className="rounded-[24px] bg-white/5 p-5 border border-white/5 hover:border-white/10 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {metric.label}
                            </p>
                            <div className={`h-2 w-2 rounded-full ${metric.trend === "up" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"}`}></div>
                          </div>
                          <p className="mt-4 text-2xl font-black text-white">
                            {metric.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white rounded-[32px] shadow-2xl p-8 border border-white/10 relative overflow-hidden">
                  <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />

                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-2">
                        Operational Focus
                      </p>
                      <h3 className="text-2xl font-black uppercase tracking-tight">
                        Delivery Command
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-8 space-y-4 relative z-10">
                    <div className="rounded-2xl bg-white/[0.03] p-6 border border-white/5 hover:bg-white/[0.05] transition-all">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                        <span className="text-slate-400">Governance</span>
                        <span className="text-emerald-400">Active</span>
                      </div>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed">
                        We monitor project delivery, keep financial commitments transparent, and maintain a running record of the work completed for you.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.03] p-6 border border-white/5 hover:bg-white/[0.05] transition-all">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                        <span className="text-slate-400">Technical</span>
                        <span className="text-cyan-400">In Progress</span>
                      </div>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed">
                        Technical implementation, quality checks, and milestone handoffs remain visible so you can track progress without waiting for updates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/10 p-8">
                  <div className="flex items-center justify-between mb-8 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em] mb-2">
                        Delivery Pulse
                      </p>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                        What the company is doing right now
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500 border border-gold-500/20">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/5"></div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Administration</p>
                        <div className="h-px flex-1 bg-white/5"></div>
                      </div>
                      <div className="grid gap-3">
                        {roleUpdates.admin.map((item) => (
                          <div
                            key={item.title}
                            className="rounded-2xl bg-white/[0.03] p-5 border border-white/5 hover:border-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-black text-white uppercase tracking-wider">
                                  {item.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-400 font-medium leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/5"></div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Development</p>
                        <div className="h-px flex-1 bg-white/5"></div>
                      </div>
                      <div className="grid gap-3">
                        {roleUpdates.developer.map((item) => (
                          <div
                            key={item.title}
                            className="rounded-2xl bg-white/[0.03] p-5 border border-white/5 hover:border-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <CheckCircle className="h-5 w-5 text-sky-500 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-black text-white uppercase tracking-wider">
                                  {item.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-400 font-medium leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>
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
                className="bg-white/5 backdrop-blur-xl rounded-[28px] p-8 border border-white/10 hover:bg-white/[0.08] transition-all duration-300 group cursor-pointer shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                      Active Projects
                    </p>
                    <p className="text-4xl font-black text-white mt-3">
                      {projects.length}
                    </p>
                  </div>
                  <div className="p-4 bg-gold-500/10 rounded-2xl border border-gold-500/20 group-hover:scale-110 transition-transform">
                    <Briefcase className="h-8 w-8 text-gold-500" />
                  </div>
                </div>
                <div className="mt-6 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-500 to-yellow-400 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>

              <div
                onClick={() => setShowInvoices(!showInvoices)}
                className="bg-white/5 backdrop-blur-xl rounded-[28px] p-8 border border-white/10 hover:bg-white/[0.08] transition-all duration-300 group cursor-pointer shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                      Total Invoices
                    </p>
                    <p className="text-4xl font-black text-white mt-3">
                      {invoices.length}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <DollarSign className="h-8 w-8 text-emerald-500" />
                  </div>
                </div>
                <div className="mt-6 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>

              <div
                onClick={() => setShowMessages(!showMessages)}
                className="bg-white/5 backdrop-blur-xl rounded-[28px] p-8 border border-white/10 hover:bg-white/[0.08] transition-all duration-300 group cursor-pointer shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                      New Messages
                    </p>
                    <p className="text-4xl font-black text-white mt-3">
                      {messages.filter((m) => m.unread).length}
                    </p>
                  </div>
                  <div className="p-4 bg-gold-500/10 rounded-2xl border border-gold-500/20 group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-8 w-8 text-gold-500" />
                  </div>
                </div>
                <div className="mt-6 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-500 to-yellow-400 rounded-full"
                    style={{ width: "40%" }}
                  ></div>
                </div>
              </div>

              <div
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="bg-white/5 backdrop-blur-xl rounded-[28px] p-8 border border-white/10 hover:bg-white/[0.08] transition-all duration-300 group cursor-pointer shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                      Quick Actions
                    </p>
                    <p className="text-4xl font-black text-white mt-3">4</p>
                  </div>
                  <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 group-hover:scale-110 transition-transform">
                    <Bell className="h-8 w-8 text-cyan-500" />
                  </div>
                </div>
                <div className="mt-6 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
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
              <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/10 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                      Task & resource pulse
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-white uppercase tracking-tight">
                      Team Execution
                    </h3>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 text-slate-400 border border-white/10">
                    <Layers className="h-7 w-7" />
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  {tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="rounded-[24px] border border-white/5 p-6 hover:bg-white/[0.03] transition-all bg-white/[0.01]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-wider">
                            {task.title}
                          </p>
                          <p className="mt-2 text-xs text-slate-500 font-bold uppercase tracking-widest">
                            {task.project} • {task.assignee}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${task.priority === "Critical" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : task.priority === "High" ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" : task.priority === "Medium" ? "bg-gold-500/10 text-gold-500 border border-gold-500/20" : "bg-slate-500/10 text-slate-500 border border-slate-500/20"}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="mt-6 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 shadow-[0_0_8px_rgba(14,165,233,0.3)]"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>{task.status}</span>
                        <span className="text-sky-400">{task.progress}% synchronized</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/10 p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                        Resource capacity
                      </p>
                      <h3 className="mt-2 text-2xl font-black text-white uppercase tracking-tight">
                        Availability
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-8 space-y-4">
                    {resourceAllocations.map((resource) => (
                      <div
                        key={resource.id}
                        className="rounded-2xl border border-white/5 p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-white uppercase tracking-wider">
                              {resource.name}
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                              {resource.role}
                            </p>
                          </div>
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg">
                            {resource.availability}
                          </span>
                        </div>
                        <div className="mt-5 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                            style={{ width: `${resource.utilization}%` }}
                          ></div>
                        </div>
                        <p className="mt-3 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                          Utilization: {resource.utilization}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/10 p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                        Document snapshot
                      </p>
                      <h3 className="mt-2 text-2xl font-black text-white uppercase tracking-tight">
                        Vault Activity
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-400 border border-white/10">
                      <FileText className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-8 grid gap-4">
                    {documentSummary.map((doc) => (
                      <div
                        key={doc.id}
                        className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex items-center justify-between gap-4 hover:bg-white/[0.04] transition-all"
                      >
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-wider">
                            {doc.label}
                          </p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Secure Repository Update
                          </p>
                        </div>
                        <div className="rounded-xl bg-white/5 px-4 py-2 text-xs font-black text-gold-500 border border-white/10 shadow-lg">
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
            <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/10 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-1">Secure Protocol</p>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
                    <Briefcase className="w-6 h-6 mr-3" />
                    Portfolio Directory
                  </h3>
                </div>
                <button
                  onClick={() => setShowProjects(false)}
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-colors border border-white/10"
                >
                  <ChevronRight className="w-6 h-6 transform rotate-180" />
                </button>
              </div>
              <div className="p-8 grid gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="group border border-white/5 rounded-[24px] p-6 bg-white/[0.01] hover:bg-white/[0.03] transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                           <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em]">Protocol Entity</p>
                           <span className="h-px w-8 bg-white/10"></span>
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">LIFECYCLE: {project.progress > 70 ? 'MAINTAIN' : project.progress > 30 ? 'CREATE' : 'DESIGN'}</p>
                        </div>
                        <h4 className="font-black text-white text-xl uppercase tracking-wider">
                          {project.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                          Strategic Manager: {project.manager}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                          project.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : project.status === "in-progress"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                              : "bg-gold-500/10 text-gold-400 border-gold-500/20"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                      <span>Deployment Sprints</span>
                      <span className="text-white">
                        {project.progress}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full transition-all duration-1000 group-hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showInvoices && (
          <div className="max-w-7xl mx-auto animate-fade-in">
            <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/10 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-1">Financial Ledger</p>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
                    <DollarSign className="w-6 h-6 mr-3" />
                    Capital Allocation
                  </h3>
                </div>
                <button
                  onClick={() => setShowInvoices(false)}
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-colors border border-white/10"
                >
                  <ChevronRight className="w-6 h-6 transform rotate-180" />
                </button>
              </div>
              <div className="p-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                          Serial
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                          Entity/Project
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                          Value
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                          Protocol Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-5 text-sm font-black text-slate-400 font-mono">
                            {invoice.id}
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-white uppercase tracking-wide">
                            {invoice.project}
                          </td>
                          <td className="px-6 py-5 text-sm font-black text-white">
                            KES {invoice.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                                invoice.status === "paid"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : invoice.status === "pending"
                                    ? "bg-gold-500/10 text-gold-400 border-gold-500/20"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
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
            <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/10 overflow-hidden">
              <div className="bg-gradient-to-r from-gold-500 to-orange-600 p-8 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-1">Communication Hub</p>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
                    <MessageSquare className="w-6 h-6 mr-3" />
                    Secure Updates
                    <span className="ml-4 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
                      {messages.filter((m) => m.unread).length} Unread
                    </span>
                  </h3>
                </div>
                <button
                  onClick={() => setShowMessages(false)}
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-colors border border-white/10"
                >
                  <ChevronRight className="w-6 h-6 transform rotate-180" />
                </button>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  {messages.slice(0, 6).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start space-x-6 p-6 rounded-[24px] border transition-all ${msg.feedback ? "bg-sky-500/5 border-sky-500/20 shadow-lg shadow-sky-500/5" : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03]"}`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-2.5 flex-shrink-0 ${msg.unread ? "bg-gold-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-slate-700"}`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-black text-white uppercase tracking-wider">
                            {msg.sender}
                          </p>
                          {msg.feedback ? (
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-400 bg-sky-400/10 border border-sky-400/20 px-2.5 py-1 rounded-lg">
                              Priority Sync
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm font-bold text-slate-300 mt-2">
                          {msg.subject}
                        </p>
                        <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">
                          {msg.message}
                        </p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-4 flex items-center">
                          <Clock className="w-3 h-3 mr-1.5" />
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="group w-full mt-6 text-gold-500 text-[10px] font-black uppercase tracking-[0.3em] hover:text-gold-400 flex items-center justify-center py-5 border-2 border-gold-500/20 rounded-[20px] hover:bg-gold-500/5 transition-all">
                  Open Total Archive
                  <ChevronRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}

        {showQuickActions && (
          <div className="max-w-7xl mx-auto animate-fade-in">
            <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/10 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-1">Fast Track</p>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
                    <Bell className="w-6 h-6 mr-3" />
                    Command Center
                  </h3>
                </div>
                <button
                  onClick={() => setShowQuickActions(false)}
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-colors border border-white/10"
                >
                  <ChevronRight className="w-6 h-6 transform rotate-180" />
                </button>
              </div>
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Calendar, label: "Schedule Sync", color: "from-teal-400 to-cyan-500" },
                  { icon: MessageSquare, label: "Relay Protocol", color: "from-blue-400 to-indigo-500", onClick: () => setShowMessageModal(true) },
                  { icon: FileText, label: "Vault Access", color: "from-emerald-400 to-teal-500" },
                  { icon: Phone, label: "Secure Link", color: "from-purple-400 to-pink-500" }
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={action.onClick}
                    className="group flex flex-col items-center justify-center p-8 bg-white/5 rounded-[28px] border border-white/5 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className={`p-5 bg-gradient-to-br ${action.color} rounded-2xl shadow-xl group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="mt-5 text-xs font-black text-white uppercase tracking-[0.2em] group-hover:text-gold-400 transition-colors">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Modal (SMS/WhatsApp) */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[150] animate-fade-in p-4">
          <div className="bg-[#1e293b] rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden border border-white/10 transform transition-all">
            <div className="bg-gradient-to-r from-gold-500 to-orange-500 p-8">
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-1">Secure Relay</p>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                Send Message
              </h3>
              <p className="text-white/70 mt-2 text-xs font-bold uppercase tracking-widest">
                Direct Sync to Entity Lead (+254799789956)
              </p>
            </div>
            <div className="p-8">
              {/* Message Type Toggle */}
              <div className="flex space-x-4 mb-8">
                <button
                  onClick={() => setMessageType("sms")}
                  className={
                    messageType === "sms"
                      ? "flex-1 py-4 px-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all bg-gold-500 text-slate-950 shadow-xl"
                      : "flex-1 py-4 px-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5"
                  }
                >
                  Cellular SMS
                </button>
                <button
                  onClick={() => setMessageType("whatsapp")}
                  className={
                    messageType === "whatsapp"
                      ? "flex-1 py-4 px-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all bg-emerald-500 text-slate-950 shadow-xl"
                      : "flex-1 py-4 px-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5"
                  }
                >
                  Secure WhatsApp
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={
                    messageType === "whatsapp"
                      ? "Enter secure WhatsApp protocol..."
                      : "Enter cellular SMS relay..."
                  }
                  className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500/40 transition-all text-sm font-medium resize-none"
                  rows="5"
                  maxLength={160}
                />
                <div className="absolute bottom-4 right-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {messageText.length}/160
                </div>
              </div>

              {smsStatus && (
                <div
                  className={
                    smsStatus.type === "success"
                      ? "mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider text-center"
                      : "mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider text-center"
                  }
                >
                  {smsStatus.message}
                </div>
              )}
            </div>
            <div className="p-8 bg-white/[0.02] flex justify-end gap-4 border-t border-white/5">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageText("");
                  setSmsStatus(null);
                }}
                className="px-8 py-4 bg-white/5 text-slate-300 rounded-2xl hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-[0.2em] border border-white/5"
                disabled={sendingSMS}
              >
                Abort
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendingSMS || !messageText.trim()}
                className={
                  messageType === "whatsapp"
                    ? "px-10 py-4 text-slate-950 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20"
                    : "px-10 py-4 text-slate-950 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gold-500 hover:bg-gold-400 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gold-500/20"
                }
              >
                {sendingSMS ? "Transmitting..." : "Initialize Relay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortal;
