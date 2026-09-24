import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, RefreshCw, LayoutDashboard, FolderKanban, ListChecks,
  Receipt, MessageSquare, Star, FileText, Plus, Trash2, Send, Save,
  AlertCircle, CheckCircle, User, Calendar, DollarSign,
  Mail, Phone, Activity, Paperclip, X
} from "lucide-react";
import { apiCall } from "../../services/api";
import { InlineLoader, Spinner } from "../../components/Loading";
import { formatKSH } from "../../utils/currencyUtils";
import { CreateProjectModal, EditProjectModal } from "../components/ProjectModals";

/**
 * ClientPortalData - Admin workstation to view & edit the exact data a
 * client's portal renders (projects, tasks, billing, messages, feedback,
 * documents) for any client node.
 *
 * Payload comes from GET /api/admin/client-portal/:id — built by the SAME
 * builder (server/utils/clientPortalData.js) the client portal consumes, so
 * what staff see here is literally what the client sees. Writes go through the
 * portal-backed endpoints (user-projects, project tasks, project_invoices,
 * user_feedback, admin client-feedback relay).
 */
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "tasks", label: "Tasks", icon: ListChecks },
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "feedback", label: "Feedback", icon: Star },
  { id: "documents", label: "Documents", icon: FileText },
];

const FEEDBACK_STATUSES = ["new", "open", "in_progress", "resolved", "closed"];
const TASK_STATUSES = ["not_started", "in_progress", "completed", "blocked"];
const INVOICE_STATUSES = ["draft", "sent", "pending", "paid", "overdue", "cancelled"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

const FEEDBACK_CHIP = {
  new: "bg-blue-50 text-blue-600 border-blue-200",
  open: "bg-amber-50 text-amber-600 border-amber-200",
  in_progress: "bg-sky-50 text-sky-600 border-sky-200",
  resolved: "bg-emerald-50 text-emerald-600 border-emerald-200",
  closed: "bg-slate-100 text-slate-500 border-slate-200",
};

const INVOICE_CHIP = {
  paid: "bg-emerald-50 text-emerald-600 border-emerald-200",
  overdue: "bg-rose-50 text-rose-600 border-rose-200",
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  sent: "bg-amber-50 text-amber-600 border-amber-200",
  draft: "bg-slate-50 text-slate-500 border-slate-200",
  cancelled: "bg-slate-100 text-slate-400 border-slate-200",
};

const TASK_CHIP = {
  not_started: "bg-slate-50 text-slate-500 border-slate-200",
  in_progress: "bg-sky-50 text-sky-600 border-sky-200",
  completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  blocked: "bg-rose-50 text-rose-600 border-rose-200",
};

const PROJECT_CHIP = {
  planning: "bg-amber-50 text-amber-600 border-amber-200",
  "in-progress": "bg-blue-50 text-blue-600 border-blue-200",
  "on-hold": "bg-orange-50 text-orange-600 border-orange-200",
  completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-400 border-slate-200",
};

const toDateInput = (v) => (v ? String(v).slice(0, 10) : "");

export function ClientPortalData({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState(null);

  // Projects
  const [projects, setProjects] = useState([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editProject, setEditProject] = useState(null);

  // Tasks
  const [activeProjectId, setActiveProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({ task_name: "", assigned_to: "", status: "not_started", priority: "medium" });
  const [team, setTeam] = useState([]);

  // Billing (project_invoices — the table the portal Billing tab reads)
  const [invoices, setInvoices] = useState([]);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [invoiceDraftId, setInvoiceDraftId] = useState(null);
  const [invoiceValues, setInvoiceValues] = useState({});
  const [newInvoice, setNewInvoice] = useState({ project_id: "", invoice_number: "", amount: "", status: "draft", due_date: "", issue_date: "" });

  // Messages & Feedback (user_feedback)
  const [thread, setThread] = useState([]);
  const [newMessage, setNewMessage] = useState({ title: "", message: "", priority: "medium" });
  const [replyText, setReplyText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);

  const notify = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  // ---------------------------------------------------------------------------
  // Loaders
  // ---------------------------------------------------------------------------
  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [dash, proj, inv, thr] = await Promise.all([
        apiCall(`/admin/client-portal/${id}`),
        apiCall("/user-projects"),
        apiCall(`/admin/project-invoices?client_id=${id}`),
        apiCall(`/feedback?user_id=${id}&limit=100`),
      ]);
      if (!dash?.success) throw new Error(dash?.message || "Portal payload unavailable");
      setDashboard(dash.dashboard);

      // Same owner filter the UserDetail workstation applies to the relay.
      const mine = Array.isArray(proj)
        ? proj.filter((p) => String(p.user_id) === String(id) || String(p.client_id) === String(id))
        : [];
      setProjects(mine);
      setInvoices(inv?.invoices || []);
      setThread(thr?.feedback || []);
      setActiveProjectId((prev) => prev || (mine.length ? String(mine[0].id) : ""));
    } catch (e) {
      console.error("Portal payload sync failure:", e);
      setError(e.message || "Could not load client portal data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [id]);

  useEffect(() => {
    apiCall("/api/users").then((d) => setTeam(d?.users || [])).catch(() => setTeam([]));
  }, []);

  // Load tasks for the selected project (portal Tasks tab source).
  useEffect(() => {
    if (!activeProjectId) { setTasks([]); return; }
    let cancelled = false;
    (async () => {
      try {
        setTasksLoading(true);
        const r = await apiCall(`/projects/${activeProjectId}/tasks`);
        if (!cancelled) setTasks(r?.tasks || []);
      } catch (e) {
        if (!cancelled) setTasks([]);
      } finally {
        if (!cancelled) setTasksLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeProjectId]);

  const refreshInvoices = async () => {
    const inv = await apiCall(`/admin/project-invoices?client_id=${id}`);
    setInvoices(inv?.invoices || []);
  };

  const refreshThread = async () => {
    const thr = await apiCall(`/feedback?user_id=${id}&limit=100`);
    setThread(thr?.feedback || []);
  };

  // ---------------------------------------------------------------------------
  // Projects (user_projects — portal Projects tab)
  // ---------------------------------------------------------------------------
  const handleCreateProject = async (formData) => {
    // Force ownership onto THIS client so projects never land on another node.
    const res = await apiCall("/user-projects", {
      method: "POST",
      body: JSON.stringify({ ...formData, user_id: Number(id), created_by: user?.id }),
    });
    if (!res?.id) throw new Error(res?.error || "Project creation failed");
    setShowCreateProject(false);
    notify("success", "Project created — it now appears in the client's portal.");
    loadAll();
  };

  const handleUpdateProject = async (projectId, formData) => {
    const res = await apiCall(`/user-projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify({ ...formData, user_id: Number(id), updated_by: user?.id }),
    });
    if (!res?.success) throw new Error(res?.error || "Project update failed");
    setEditProject(null);
    notify("success", "Project updated — the portal reflects this immediately.");
    loadAll();
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Archive this project? It will disappear from the client's portal.")) return;
    try {
      await apiCall(`/user-projects/${projectId}`, {
        method: "DELETE",
        body: JSON.stringify({ deleted_by: user?.id }),
      });
      notify("success", "Project archived.");
      loadAll();
    } catch (e) { notify("error", "Archive failed"); }
  };

  // ---------------------------------------------------------------------------
  // Tasks (project_tasks — portal Tasks tab)
  // ---------------------------------------------------------------------------
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!activeProjectId) return;
    setIsSubmitting(true);
    try {
      const res = await apiCall(`/projects/${activeProjectId}/tasks`, {
        method: "POST",
        body: JSON.stringify(newTask),
      });
      if (res?.success || res?.id) {
        setShowAddTask(false);
        setNewTask({ task_name: "", assigned_to: "", status: "not_started", priority: "medium" });
        const r = await apiCall(`/projects/${activeProjectId}/tasks`);
        setTasks(r?.tasks || []);
        notify("success", "Task added to the portal task matrix.");
      }
    } catch (e) { notify("error", "Task creation failed"); }
    finally { setIsSubmitting(false); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const r = await apiCall(`/tasks/${taskId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (r?.success) setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status } : t)));
    } catch (e) { notify("error", "Status update failed"); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Remove this task from the portal task matrix?")) return;
    try {
      const r = await apiCall(`/tasks/${taskId}`, { method: "DELETE" });
      if (r?.success) {
        setTasks(tasks.filter((t) => t.id !== taskId));
        notify("success", "Task removed.");
      }
    } catch (e) { notify("error", "Task removal failed"); }
  };

  // ---------------------------------------------------------------------------
  // Billing (project_invoices — portal Billing tab)
  // ---------------------------------------------------------------------------
  const handleAddInvoice = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const projectId = newInvoice.project_id || activeProjectId || projects[0]?.id;
      if (!projectId) throw new Error("No project available for this invoice");
      const res = await apiCall("/admin/project-invoices", {
        method: "POST",
        body: JSON.stringify({
          project_id: Number(projectId),
          invoice_number: newInvoice.invoice_number,
          amount: Number(newInvoice.amount) || 0,
          status: newInvoice.status,
          due_date: newInvoice.due_date || null,
          issue_date: newInvoice.issue_date || null,
        }),
      });
      if (!res?.success) throw new Error(res?.message || "Invoice creation failed");
      setShowAddInvoice(false);
      setNewInvoice({ project_id: "", invoice_number: "", amount: "", status: "draft", due_date: "", issue_date: "" });
      await refreshInvoices();
      notify("success", "Invoice saved — visible in the client's Billing tab.");
    } catch (e) { notify("error", e.message || "Invoice creation failed"); }
    finally { setIsSubmitting(false); }
  };

  const beginInvoiceEdit = (inv) => {
    setInvoiceDraftId(inv.id);
    setInvoiceValues({
      invoice_number: inv.invoice_number || "",
      amount: String(inv.amount ?? ""),
      status: inv.status || "draft",
      due_date: toDateInput(inv.due_date),
      issue_date: toDateInput(inv.issue_date),
    });
  };

  const handleSaveInvoice = async (invId) => {
    try {
      const res = await apiCall(`/admin/project-invoices/${invId}`, {
        method: "PUT",
        body: JSON.stringify({
          invoice_number: invoiceValues.invoice_number,
          amount: Number(invoiceValues.amount) || 0,
          status: invoiceValues.status,
          due_date: invoiceValues.due_date || null,
          issue_date: invoiceValues.issue_date || null,
        }),
      });
      if (!res?.success) throw new Error(res?.message || "Invoice update failed");
      setInvoiceDraftId(null);
      await refreshInvoices();
      notify("success", "Invoice updated.");
    } catch (e) { notify("error", e.message || "Invoice update failed"); }
  };

  // ---------------------------------------------------------------------------
  // Messages & Feedback (user_feedback — portal Inbox/Feedback tabs)
  // ---------------------------------------------------------------------------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiCall("/admin/client-feedback", {
        method: "POST",
        body: JSON.stringify({
          userId: Number(id),
          title: newMessage.title,
          message: newMessage.message,
          priority: newMessage.priority,
          type: "message",
        }),
      });
      if (!res?.success) throw new Error(res?.message || "Message send failed");
      setNewMessage({ title: "", message: "", priority: "medium" });
      await refreshThread();
      notify("success", "Message delivered to the client's portal inbox.");
    } catch (e) { notify("error", e.message || "Message send failed"); }
    finally { setIsSubmitting(false); }
  };

  const handleReply = async (row) => {
    if (!replyText.trim()) return;
    try {
      const res = await apiCall(`/feedback/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: row.status === "new" ? "open" : row.status,
          admin_response: replyText,
          assigned_to: row.assigned_to ?? null,
          internal_notes: row.internal_notes ?? "",
        }),
      });
      if (!res?.success) throw new Error(res?.message || "Reply failed");
      setReplyText("");
      setReplyTarget(null);
      await refreshThread();
      notify("success", "Reply recorded on the thread.");
    } catch (e) { notify("error", e.message || "Reply failed"); }
  };

  const handleFeedbackStatus = async (row, status) => {
    try {
      const res = await apiCall(`/feedback/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          admin_response: row.admin_response ?? "",
          assigned_to: row.assigned_to ?? null,
          internal_notes: row.internal_notes ?? "",
        }),
      });
      if (!res?.success) throw new Error(res?.message || "Status update failed");
      setThread(thread.map((t) => (t.id === row.id ? { ...t, status } : t)));
    } catch (e) { notify("error", "Status update failed"); }
  };

  // ---------------------------------------------------------------------------
  // Derived views
  // ---------------------------------------------------------------------------
  const dash = dashboard;
  const biz = dash?.businessSummary || {};
  const budget = dash?.budgetOverview || {};
  const docs = dash?.documents || [];
  const docSummary = dash?.documentSummary || [];
  const clientUser = dash?.user || null;
  const portalMessages = dash?.messages || [];
  const inboxRows = thread.filter((t) => t.author !== "admin");
  const feedbackRows = thread;

  const statTile = (label, value, tone = "text-slate-900") => (
    <div key={label} className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
      <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`text-xl font-black mt-1 ${tone}`}>{value}</p>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20">
      <InlineLoader label="Synchronising Client Portal Matrix…" tone="teal" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center p-20 text-center">
      <AlertCircle className="text-rose-500 w-12 h-12 mb-4" />
      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{error}</p>
      <div className="flex gap-3 mt-6">
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-slate-100 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-600">Back</button>
        <button onClick={loadAll} className="px-6 py-2 bg-teal-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col font-sans text-slate-900 animate-in fade-in duration-300">
      {/* Header */}
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white sticky top-0 z-40 no-print">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/admin/users/detail/${id}/client`)} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-600"><ArrowLeft size={18} /></button>
          <div className="h-6 w-px bg-slate-100 mx-2"></div>
          <div className="hidden sm:block">
            <h2 className="text-sm font-black uppercase tracking-widest leading-none text-slate-900">Client Portal Data</h2>
            <p className="text-[7px] text-teal-600 font-black uppercase tracking-[0.3em] mt-1.5">
              CLIENT NODE: {id}{clientUser ? ` — ${clientUser.display_name}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadAll} className="flex items-center gap-2 px-4 py-2 bg-teal-600/10 hover:bg-teal-600 text-teal-600 hover:text-white border border-teal-600/20 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all shadow-lg group">
            <RefreshCw size={12} className="group-hover:rotate-180 transition-transform" /> Sync Portal
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
          {toast.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {toast.text}
        </div>
      )}

      {/* Tab Nav */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex flex-wrap gap-2 sticky top-16 z-30 no-print">
        {TABS.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${tab === tabId ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-teal-500 hover:text-teal-600"}`}
          >
            <Icon size={12} /> {label}
            {tabId === "billing" && biz.openInvoices > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded text-[7px] ${tab === tabId ? "bg-teal-500 text-white" : "bg-amber-100 text-amber-700"}`}>{biz.openInvoices}</span>
            )}
            {tabId === "messages" && biz.openMessages > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded text-[7px] ${tab === tabId ? "bg-teal-500 text-white" : "bg-blue-100 text-blue-700"}`}>{biz.openMessages}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 md:p-10">
        {/* ── OVERVIEW (live mirror of the client's portal) ─────────────── */}
        {tab === "overview" && dash && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {statTile("Active Projects", biz.activeProjects ?? 0)}
              {statTile("Completed", biz.completedProjects ?? 0, "text-emerald-600")}
              {statTile("Open Invoices", biz.openInvoices ?? 0, "text-amber-600")}
              {statTile("Unread Messages", biz.openMessages ?? 0, "text-blue-600")}
              {statTile("Next Milestone", biz.nextMilestone || "Synced", "text-teal-600")}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Client identity */}
              <div className="bg-white border border-slate-200 rounded-[40px] p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-blue-600" />
                <p className="text-[7px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4">Portal Identity</p>
                <h3 className="text-sm font-black uppercase tracking-tight">{clientUser?.display_name || "Client"}</h3>
                <div className="mt-4 space-y-2 text-[9px] font-bold text-slate-500">
                  <p className="flex items-center gap-2"><Mail size={11} className="text-teal-500" /> {clientUser?.email || "—"}</p>
                  <p className="flex items-center gap-2"><Phone size={11} className="text-teal-500" /> {clientUser?.phone_number || "—"}</p>
                  <p className="flex items-center gap-2"><Calendar size={11} className="text-teal-500" /> Joined {toDateInput(clientUser?.created_at) || "—"}</p>
                  <p className="flex items-center gap-2"><Activity size={11} className="text-teal-500" /> Last login {clientUser?.last_login_at ? new Date(clientUser.last_login_at).toLocaleString() : "Never"}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-[7px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Mission Briefing</p>
                  <p className="text-[9px] leading-relaxed text-slate-600 font-medium">
                    {clientUser?.mission_briefing || "No mission briefing written for this node. Use Modify Node on the profile to set one."}
                  </p>
                </div>
              </div>

              {/* Budget overview */}
              <div className="bg-white border border-slate-200 rounded-[40px] p-6 shadow-xl">
                <p className="text-[7px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4">Budget Telemetry</p>
                <div className="grid grid-cols-2 gap-3">
                  {statTile("Planned", formatKSH(budget.planned || 0))}
                  {statTile("Spent", formatKSH(budget.spent || 0), "text-rose-500")}
                  {statTile("Forecast", formatKSH(budget.forecast || 0), "text-teal-600")}
                  {statTile("Variance", `${budget.variance ?? 0}%`, (budget.variance || 0) > 0 ? "text-rose-500" : "text-emerald-600")}
                </div>
              </div>

              {/* Documents summary */}
              <div className="bg-white border border-slate-200 rounded-[40px] p-6 shadow-xl">
                <p className="text-[7px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4">Document Vault</p>
                <div className="space-y-3">
                  {docSummary.length > 0 ? docSummary.map((d) => (
                    <div key={d.id ?? d.label} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{d.label}</span>
                      <span className="text-[10px] font-black text-slate-900">{d.value}</span>
                    </div>
                  )) : <p className="text-[9px] text-slate-400 font-bold">No documents catalogued.</p>}
                </div>
              </div>
            </div>

            {/* Portal preview: what the client's Inbox widget shows */}
            <div className="bg-white border border-slate-200 rounded-[40px] p-6 shadow-xl">
              <p className="text-[7px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4">Portal Inbox Preview (read-only mirror)</p>
              <div className="space-y-2">
                {portalMessages.length > 0 ? portalMessages.slice(0, 5).map((m) => (
                  <div key={m.id} className={`flex items-start gap-3 px-4 py-3 rounded-2xl border ${m.unread ? "bg-teal-50/60 border-teal-100" : "bg-slate-50 border-slate-100"}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.sender === "Company Admin" ? "bg-slate-900 text-white" : "bg-teal-500 text-white"}`}>
                      <User size={12} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-900">{m.sender}</p>
                        {m.unread && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />}
                      </div>
                      <p className="text-[9px] text-slate-600 font-medium mt-0.5 line-clamp-2">{m.text || m.title}</p>
                    </div>
                    <span className="text-[7px] font-black uppercase text-slate-400 shrink-0">{m.timeLabel || ""}</span>
                  </div>
                )) : <p className="text-[9px] text-slate-400 font-bold">Inbox is empty.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── PROJECTS ──────────────────────────────────────────────────── */}
        {tab === "projects" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">Portal Projects — {projects.length} node{projects.length === 1 ? "" : "s"}</p>
              <button onClick={() => setShowCreateProject(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg">
                <Plus size={12} /> New Project
              </button>
            </div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {projects.map((p) => {
                  const mapped = PROJECT_CHIP[p.status] ? p.status : "planning";
                  return (
                    <div key={p.id} className="bg-white border border-slate-200 rounded-[32px] p-5 shadow-md hover:shadow-xl transition-all flex flex-col group">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-2 py-0.5 rounded text-[6px] font-black uppercase border ${PROJECT_CHIP[mapped]}`}>
                          {String(p.status || "planning").replace("_", " ")}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditProject(p)} title="Edit project" className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-600 hover:text-white transition-all"><Edit2 size={11} /></button>
                          <button onClick={() => handleDeleteProject(p.id)} title="Archive project" className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={11} /></button>
                        </div>
                      </div>
                      <h4 className="text-[11px] font-black uppercase tracking-tight text-slate-900">{p.project_name}</h4>
                      <p className="text-[9px] text-slate-500 font-medium mt-1 line-clamp-2 flex-1">{p.project_description || "Operational delivery in progress."}</p>

                      <div className="mt-4">
                        <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-slate-400 mb-1">
                          <span>Progress</span><span>{Number(p.progress_percentage || 0)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full transition-all" style={{ width: `${Math.min(100, Number(p.progress_percentage || 0))}%` }} />
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-50 grid grid-cols-2 gap-2 text-[7px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-1.5 text-slate-400"><DollarSign size={10} className="text-teal-500" /><span className="text-slate-700">{formatKSH(Number(p.estimated_budget || 0))}</span></div>
                        <div className="flex items-center gap-1.5 text-slate-400"><Calendar size={10} className="text-blue-500" /><span className="text-slate-700">{toDateInput(p.end_date) || "No date"}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">No projects on this portal yet</p>
              </div>
            )}

            <CreateProjectModal isOpen={showCreateProject} onClose={() => setShowCreateProject(false)} onCreate={handleCreateProject} />
            <EditProjectModal isOpen={!!editProject} onClose={() => setEditProject(null)} onUpdate={handleUpdateProject} project={editProject} />
          </div>
        )}

        {/* ── TASKS ─────────────────────────────────────────────────────── */}
        {tab === "tasks" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">Project Node</label>
                <select
                  value={activeProjectId}
                  onChange={(e) => setActiveProjectId(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest outline-none focus:border-teal-500 min-w-[220px]"
                >
                  {projects.length === 0 && <option value="">No projects</option>}
                  {projects.map((p) => <option key={p.id} value={String(p.id)}>{p.project_name}</option>)}
                </select>
                {tasksLoading && <Spinner size={12} tone="teal" />}
              </div>
              <button
                onClick={() => setShowAddTask((v) => !v)}
                disabled={!activeProjectId}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg disabled:opacity-40"
              >
                <Plus size={12} /> New Task
              </button>
            </div>

            {showAddTask && activeProjectId && (
              <form onSubmit={handleAddTask} className="bg-white border border-teal-500/30 rounded-3xl p-5 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-3">
                <input
                  required
                  value={newTask.task_name}
                  onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
                  placeholder="TASK NAME"
                  className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider outline-none focus:border-teal-500 placeholder:text-slate-400"
                />
                <select
                  value={newTask.assigned_to}
                  onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                  className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[9px] font-black uppercase outline-none focus:border-teal-500"
                >
                  <option value="">Unassigned</option>
                  {team.map((m) => <option key={m.id} value={m.id}>{m.display_name || m.email}</option>)}
                </select>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[9px] font-black uppercase outline-none focus:border-teal-500"
                >
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                </select>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[9px] font-black uppercase outline-none focus:border-teal-500"
                >
                  {TASK_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ").toUpperCase()}</option>)}
                </select>
                <button type="submit" disabled={isSubmitting} className="md:col-span-1 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-1.5 disabled:opacity-50">
                  {isSubmitting ? <Spinner size={10} tone="white" /> : <Save size={11} />} Save
                </button>
              </form>
            )}

            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-white border border-slate-200 rounded-[32px] p-5 shadow-md hover:shadow-xl transition-all flex flex-col group">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-0.5 rounded text-[6px] font-black uppercase border ${TASK_CHIP[task.status] || TASK_CHIP.not_started}`}>
                        {String(task.status || "not_started").replace("_", " ")}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[6px] font-black uppercase border ${task.priority === "urgent" ? "bg-rose-50 text-rose-600 border-rose-200" : task.priority === "high" ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-blue-50 text-blue-600 border-blue-200"}`}>
                        {task.priority || "medium"}
                      </span>
                    </div>
                    <h4 className="text-[11px] font-black uppercase tracking-tight text-slate-900">{task.task_name}</h4>
                    <p className="text-[9px] text-slate-500 font-medium mt-1 line-clamp-2 flex-1">{task.task_description || "Strategic sub-node in delivery."}</p>

                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[7px] font-black uppercase tracking-widest text-slate-400">
                      <span className="flex items-center gap-1.5"><User size={10} className="text-teal-500" />{task.assigned_to_name || "Unassigned"}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={10} className="text-blue-500" />{toDateInput(task.due_date) || "No date"}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[8px] font-black uppercase text-slate-700 outline-none focus:border-teal-500"
                      >
                        {TASK_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ").toUpperCase()}</option>)}
                      </select>
                      <button onClick={() => handleDeleteTask(task.id)} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <ListChecks className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{activeProjectId ? "No tasks on this project node" : "Select a project node to load tasks"}</p>
              </div>
            )}
          </div>
        )}

        {/* ── BILLING (project_invoices — the portal Billing tab source) ── */}
        {tab === "billing" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">Portal Billing — {invoices.length} invoice{invoices.length === 1 ? "" : "s"}</p>
              <button onClick={() => setShowAddInvoice((v) => !v)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg">
                <Plus size={12} /> New Invoice
              </button>
            </div>

            {showAddInvoice && (
              <form onSubmit={handleAddInvoice} className="bg-white border border-teal-500/30 rounded-3xl p-5 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-3">
                <select
                  value={newInvoice.project_id}
                  onChange={(e) => setNewInvoice({ ...newInvoice, project_id: e.target.value })}
                  required
                  className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[9px] font-black uppercase outline-none focus:border-teal-500"
                >
                  <option value="">Select project…</option>
                  {projects.map((p) => <option key={p.id} value={String(p.id)}>{p.project_name}</option>)}
                </select>
                <input
                  required
                  value={newInvoice.invoice_number}
                  onChange={(e) => setNewInvoice({ ...newInvoice, invoice_number: e.target.value })}
                  placeholder="INVOICE #"
                  className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[9px] font-bold uppercase outline-none focus:border-teal-500 placeholder:text-slate-400"
                />
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  placeholder="AMOUNT (KSH)"
                  className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[9px] font-bold outline-none focus:border-teal-500 placeholder:text-slate-400"
                />
                <input
                  type="date"
                  value={newInvoice.issue_date}
                  onChange={(e) => setNewInvoice({ ...newInvoice, issue_date: e.target.value })}
                  className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[9px] font-bold outline-none focus:border-teal-500"
                />
                <input
                  type="date"
                  value={newInvoice.due_date}
                  onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                  className="md:col-span-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[9px] font-bold outline-none focus:border-teal-500"
                />
                <select
                  value={newInvoice.status}
                  onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value })}
                  className="md:col-span-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-[9px] font-black uppercase outline-none focus:border-teal-500"
                >
                  {INVOICE_STATUSES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
                <button type="submit" disabled={isSubmitting} className="md:col-span-1 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-1.5 disabled:opacity-50">
                  {isSubmitting ? <Spinner size={10} tone="white" /> : <Save size={11} />}
                </button>
              </form>
            )}

            {invoices.length > 0 ? (
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div key={inv.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-md">
                    {invoiceDraftId === inv.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        <div className="md:col-span-3">
                          <label className="text-[7px] font-black uppercase tracking-widest text-slate-400">Invoice #</label>
                          <input value={invoiceValues.invoice_number} onChange={(e) => setInvoiceValues({ ...invoiceValues, invoice_number: e.target.value })} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[9px] font-bold outline-none focus:border-teal-500" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[7px] font-black uppercase tracking-widest text-slate-400">Amount (KSH)</label>
                          <input type="number" min="0" step="0.01" value={invoiceValues.amount} onChange={(e) => setInvoiceValues({ ...invoiceValues, amount: e.target.value })} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[9px] font-bold outline-none focus:border-teal-500" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[7px] font-black uppercase tracking-widest text-slate-400">Issued</label>
                          <input type="date" value={invoiceValues.issue_date} onChange={(e) => setInvoiceValues({ ...invoiceValues, issue_date: e.target.value })} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[9px] font-bold outline-none focus:border-teal-500" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[7px] font-black uppercase tracking-widest text-slate-400">Due</label>
                          <input type="date" value={invoiceValues.due_date} onChange={(e) => setInvoiceValues({ ...invoiceValues, due_date: e.target.value })} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[9px] font-bold outline-none focus:border-teal-500" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[7px] font-black uppercase tracking-widest text-slate-400">Status</label>
                          <select value={invoiceValues.status} onChange={(e) => setInvoiceValues({ ...invoiceValues, status: e.target.value })} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[9px] font-black uppercase outline-none focus:border-teal-500">
                            {INVOICE_STATUSES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                          </select>
                        </div>
                        <div className="md:col-span-1 flex gap-2">
                          <button onClick={() => handleSaveInvoice(inv.id)} className="flex-1 bg-emerald-600 text-white rounded-xl p-2 hover:bg-emerald-700 transition-all" title="Save"><Save size={13} /></button>
                          <button onClick={() => setInvoiceDraftId(null)} className="bg-slate-100 text-slate-500 rounded-xl p-2 hover:bg-slate-200 transition-all" title="Cancel"><X size={13} /></button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[180px]">
                          <div className="flex items-center gap-2">
                            <p className="text-[11px] font-black uppercase tracking-tight text-slate-900">{inv.invoice_number || `Invoice #${inv.id}`}</p>
                            <span className={`px-2 py-0.5 rounded text-[6px] font-black uppercase border ${INVOICE_CHIP[inv.status] || INVOICE_CHIP.draft}`}>{inv.status}</span>
                          </div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">{inv.project_name || `Project #${inv.project_id}`}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">{formatKSH(Number(inv.amount || 0))}</p>
                          <p className="text-[7px] font-black uppercase tracking-widest text-slate-400">Due {toDateInput(inv.due_date) || "—"}</p>
                        </div>
                        <button onClick={() => beginInvoiceEdit(inv)} className="p-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-600 hover:text-white transition-all" title="Edit invoice"><Edit2 size={13} /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">No invoices on this portal yet</p>
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES (thread + send to portal inbox) ──────────────────── */}
        {tab === "messages" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <form onSubmit={handleSendMessage} className="bg-white border border-teal-500/30 rounded-[32px] p-5 shadow-xl space-y-3">
              <p className="text-[7px] font-black uppercase tracking-[0.25em] text-slate-400">Send message to this client's portal inbox</p>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <input
                  required
                  value={newMessage.title}
                  onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                  placeholder="SUBJECT"
                  className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider outline-none focus:border-teal-500 placeholder:text-slate-400"
                />
                <select
                  value={newMessage.priority}
                  onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value })}
                  className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[9px] font-black uppercase outline-none focus:border-teal-500"
                >
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                </select>
                <input
                  required
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                  placeholder="MESSAGE BODY"
                  className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-bold outline-none focus:border-teal-500 placeholder:text-slate-400"
                />
                <button type="submit" disabled={isSubmitting} className="md:col-span-2 flex items-center justify-center gap-2 bg-teal-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg disabled:opacity-50">
                  {isSubmitting ? <Spinner size={11} tone="white" /> : <Send size={12} />} Send
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {thread.length > 0 ? thread.map((row) => {
                const fromAdmin = row.author === "admin";
                return (
                  <div key={row.id} className={`rounded-3xl p-5 border shadow-md ${fromAdmin ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200"}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${fromAdmin ? "bg-slate-900 text-white" : "bg-teal-500 text-white"}`}>
                          <User size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-900">{row.title || "Message"}</p>
                            <span className={`px-2 py-0.5 rounded border text-[6px] font-black uppercase ${FEEDBACK_CHIP[row.status] || FEEDBACK_CHIP.new}`}>{row.status}</span>
                            {row.rating && <span className="text-[7px] font-black text-amber-500">★ {row.rating}</span>}
                          </div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                            {fromAdmin ? "Company Admin" : (row.user_name || `Client #${row.user_id}`)} · {row.created_at ? new Date(row.created_at).toLocaleString() : ""}
                          </p>
                          <p className="text-[9px] text-slate-600 font-medium mt-2 whitespace-pre-wrap">{row.message}</p>
                          {row.admin_response && (
                            <div className="mt-3 ml-4 pl-3 border-l-2 border-teal-400 bg-teal-50/60 rounded-r-xl py-2 pr-3">
                              <p className="text-[7px] font-black uppercase tracking-widest text-teal-600">Admin response</p>
                              <p className="text-[9px] text-slate-700 font-medium mt-1 whitespace-pre-wrap">{row.admin_response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={row.status}
                          onChange={(e) => handleFeedbackStatus(row, e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[7px] font-black uppercase outline-none focus:border-teal-500"
                        >
                          {FEEDBACK_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ").toUpperCase()}</option>)}
                        </select>
                        <button
                          onClick={() => { setReplyTarget(replyTarget === row.id ? null : row.id); setReplyText(""); }}
                          className="p-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-600 hover:text-white transition-all"
                          title="Reply on thread"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </div>

                    {replyTarget === row.id && (
                      <div className="mt-3 flex gap-2">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type the reply recorded on this thread…"
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-medium outline-none focus:border-teal-500 resize-none"
                        />
                        <button onClick={() => handleReply(row)} className="self-end px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-black transition-all">
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">No messages on this thread yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FEEDBACK (status management on the portal Feedback list) ───── */}
        {tab === "feedback" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">Portal Feedback — {feedbackRows.length} entr{feedbackRows.length === 1 ? "y" : "ies"}</p>
            {feedbackRows.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbackRows.map((row) => (
                  <div key={`fb-${row.id}`} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-900">{row.title || "Feedback"}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                          {(row.feedback_type || "general").toUpperCase()} · {row.created_at ? new Date(row.created_at).toLocaleDateString() : ""}
                          {row.rating ? ` · ★ ${row.rating}` : ""}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded border text-[6px] font-black uppercase shrink-0 ${FEEDBACK_CHIP[row.status] || FEEDBACK_CHIP.new}`}>{row.status}</span>
                    </div>
                    <p className="text-[9px] text-slate-600 font-medium mt-2 line-clamp-3">{row.message}</p>
                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2">
                      <label className="text-[7px] font-black uppercase tracking-widest text-slate-400">Status</label>
                      <select
                        value={row.status}
                        onChange={(e) => handleFeedbackStatus(row, e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[7px] font-black uppercase outline-none focus:border-teal-500"
                      >
                        {FEEDBACK_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ").toUpperCase()}</option>)}
                      </select>
                      <button
                        onClick={() => { setTab("messages"); setReplyTarget(row.id); setReplyText(""); }}
                        className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-600 hover:text-white transition-all"
                        title="Reply to this feedback"
                      >
                        <Send size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">No feedback submitted on this portal</p>
              </div>
            )}
          </div>
        )}

        {/* ── DOCUMENTS (portal Document Vault — the same rows the client opens) */}
        {tab === "documents" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">
              Portal Document Vault — {docs.length} file{docs.length === 1 ? "" : "s"}
            </p>

            {docSummary.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {docSummary.map((d) => (
                  <div key={d.id ?? d.label} className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100"><FileText size={14} /></div>
                    <div>
                      <p className="text-lg font-black text-slate-900 leading-none">{d.value}</p>
                      <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">{d.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {docs.length > 0 ? (
              <div className="space-y-3">
                {docs.map((d) => (
                  <div key={d.id} className="bg-white border border-slate-200 rounded-3xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-100 shrink-0"><Paperclip size={14} /></div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-tight text-slate-900 truncate">{d.name}</p>
                        <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">
                          {d.category} · {d.project} · {d.size} · {d.version}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[7px] font-black uppercase tracking-widest text-slate-400">
                      {d.downloadPath && (
                        <span
                          title="System document — streamed in the client's own authenticated session"
                          className="px-2 py-0.5 rounded border bg-teal-50 text-teal-600 border-teal-200"
                        >
                          System doc
                        </span>
                      )}
                      {d.date && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={10} className="text-blue-500" />
                          {new Date(d.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Vault empty — contracts &amp; deliverables appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}