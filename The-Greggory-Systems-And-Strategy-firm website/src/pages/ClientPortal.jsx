import { useState, useEffect } from "react";
import {
  Briefcase,
  Bell,
  DollarSign,
  RefreshCw,
  LayoutDashboard,
  BarChart3,
  HelpCircle,
  X,
  CheckSquare,
  Frown,
  Meh,
  Smile,
  SmilePlus,
  Heart,
  Activity,
  ShieldCheck,
  MessageSquare,
  Search,
  Clock,
  CheckCircle,
  ArrowRight,
  ListChecks,
  Mail,
  Folder,
  Download,
  UserCheck,
  Wallet
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getApiUrl, mpesaAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { formatKSH } from "../utils/currencyUtils";

const ClientPortal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [kpiMetrics, setKpiMetrics] = useState([]);
  const [portalUser, setPortalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  // Feedback State
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackForm, setFeedbackData] = useState({
    title: '',
    message: '',
    type: 'service_feedback',
    rating: 5,
    priority: 'Low'
  });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // M-Pesa State
  const [mpesaLoading, setMpesaLoading] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Full payload state (tasks / messages / documents / budgets)
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [docSummary, setDocSummary] = useState([]);
  const [budgetOverviewData, setBudgetOverview] = useState(null);
  const [businessSummary, setBusinessSummary] = useState(null);
  const [roleUpdates, setRoleUpdates] = useState([]);

  const unreadMessages = messages.filter(m => m.unread).length;

  const navItems = [
    { id: "overview", label: "Home", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "tasks", label: "Tasks", icon: ListChecks, badge: tasks.filter(t => t.status !== "completed").length },
    { id: "billing", label: "Billing", icon: DollarSign, badge: invoices.filter(i => i.status !== "paid").length },
    { id: "documents", label: "Docs", icon: Folder, badge: documents.length },
    { id: "messages", label: "Inbox", icon: Mail, badge: unreadMessages },
    { id: "notifications", label: "Alerts", icon: Bell },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "feedback", label: "Feedback", icon: HelpCircle },
  ];

  const loadFeedbackHistory = async (userId) => {
    try {
      const response = await fetch(getApiUrl(`/api/users/client-feedback/${userId}`), {
        headers: { Authorization: `Bearer ${user?.token || ''}` },
      });
      const data = await response.json();
      if (data.success) setFeedbackList(data.feedback || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadClientData = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/users/client-dashboard'), {
        headers: { Authorization: `Bearer ${user?.token || ''}` },
      });
      const data = await response.json();
      if (data.success) {
        setPortalUser(data.dashboard.user);
        setProjects(data.dashboard.projects || []);
        setInvoices(data.dashboard.invoices || []);
        setKpiMetrics(data.dashboard.kpiMetrics || []);
        setTasks(data.dashboard.tasks || []);
        setMessages(data.dashboard.messages || []);
        setDocuments(data.dashboard.documents || []);
        setDocSummary(data.dashboard.documentSummary || []);
        setBudgetOverview(data.dashboard.budgetOverview || null);
        setBusinessSummary(data.dashboard.businessSummary || null);
        setRoleUpdates(
          data.dashboard.roleUpdates?.[(data.dashboard.user?.role || "user")] ||
          Object.values(data.dashboard.roleUpdates || {})[0] ||
          []
        );
        if (user?.userId || user?.id) {
          loadFeedbackHistory(user.userId || user.id);
        }
      }
      setLoading(false);
    } catch (err) {
      setError("Disconnected.");
      setLoading(false);
    }
  };

  useEffect(() => { loadClientData(); }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.title || !feedbackForm.message) return;
    setIsSubmittingFeedback(true);
    try {
      const response = await fetch(getApiUrl('/api/users/client-feedback'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
        body: JSON.stringify({
          userId: user.userId || user.id,
          title: feedbackForm.title,
          message: feedbackForm.message,
          type: feedbackForm.type,
          priority: feedbackForm.priority,
          rating: feedbackForm.rating
        })
      });
      const data = await response.json();
      if (data.success) {
        setFeedbackSuccess(true);
        setFeedbackData({ title: '', message: '', type: 'service_feedback', rating: 5, priority: 'Low' });
        loadFeedbackHistory(user.userId || user.id);
        setTimeout(() => setFeedbackSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleMpesaPay = async (invoice) => {
    setMpesaLoading(invoice.id);
    setPaymentStatus({ id: invoice.id, type: 'info', message: 'Checking phone...' });
    try {
      const response = await mpesaAPI.stkPush({
        phoneNumber: portalUser?.phone_number || '',
        amount: invoice.amount,
        accountReference: invoice.invoiceNumber || `INV-${invoice.id}`,
        description: `Pay: ${invoice.project}`,
        userId: portalUser?.id
      });
      if (response.success) {
        setPaymentStatus({ id: invoice.id, type: 'success', message: 'Prompt sent.' });
        setTimeout(loadClientData, 5000);
      }
    } catch (err) {
      setPaymentStatus({ id: invoice.id, type: 'error', message: 'Failed.' });
    } finally {
      setMpesaLoading(null);
    }
  };

  const handleDownloadInvoicePdf = async (inv) => {
    try {
      const res = await fetch(getApiUrl(`/api/users/my-invoices/${inv.id}/pdf`), {
        headers: { Authorization: `Bearer ${user?.token || ""}` },
      });
      if (!res.ok) throw new Error("PDF unavailable");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${inv.invoiceNumber || `INV-${inv.id}`}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setPaymentStatus({ id: inv.id, type: "error", message: "PDF not available yet." });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
      <RefreshCw className="animate-spin text-teal-500 w-6 h-6 mb-2" />
      <p className="text-[10px] font-bold uppercase tracking-widest">Loading...</p>
    </div>
  );

  const closePortal = () => { window.location.href = '/'; };
  const profilePhotoSrc = portalUser?.profilePhotoData || user?.profilePhotoData;

  // ── Real computed metrics (no more hardcoded placeholders) ──
  const profileFields = [
    Boolean(portalUser?.email),
    Boolean(portalUser?.phone_number),
    Boolean(profilePhotoSrc),
    Boolean(portalUser?.display_name),
  ];
  const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  const outstanding = invoices.filter(i => i.status !== 'paid');
  const totalOutstanding = outstanding.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const progressValues = projects.map(p => Number(p.progress) || 0).filter(n => n >= 0);
  const avgProgress = progressValues.length ? Math.round(progressValues.reduce((a, b) => a + b, 0) / progressValues.length) : 0;
  const chartBars = progressValues.length ? progressValues.slice(0, 8).map(v => Math.max(8, v)) : [];

  const pct = (v) => `${Math.min(100, Math.max(0, Math.round(Number(v) || 0)))}%`;
  const statusTone = (s) => ({
    paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    overdue: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    pending: 'bg-gold-500/10 text-gold-400 border-gold-500/20',
    draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  }[String(s).toLowerCase()] || 'bg-sky-500/10 text-sky-400 border-sky-500/20');

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-10 px-4 pb-8 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* NAV */}
        <nav className="mb-6 border-b border-white/5 bg-[#0f172a]/95 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center justify-between gap-1 py-1 overflow-x-auto no-scrollbar">
            <div className="flex gap-0.5">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'reports') {
                      navigate('/client-reports');
                    } else if (item.id === 'notifications') {
                      navigate('/client-alerts');
                    } else {
                      setActiveSection(item.id);
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all border ${activeSection === item.id ? "bg-teal-600 text-white border-teal-500" : "bg-transparent text-slate-500 border-transparent hover:bg-white/5"}`}
                >
                  <item.icon size={11} />
                  <span className="text-[8px] font-bold uppercase">{item.label}</span>
                  {!!item.badge && item.badge > 0 && (
                    <span className="ml-0.5 px-1 min-w-[12px] text-center text-[7px] font-black rounded-full bg-gold-500 text-slate-950">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/5 px-1.5 py-0.5 rounded-lg">
                {profilePhotoSrc ? <img src={profilePhotoSrc} alt="U" className="w-5 h-5 rounded-full" /> : <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-[8px] font-bold">{(portalUser?.display_name || "U")[0]}</div>}
                <p className="text-[8px] font-bold hidden sm:block truncate max-w-[60px]">{portalUser?.display_name || "User"}</p>
              </div>
              <button onClick={closePortal} className="p-1 bg-white/5 hover:bg-rose-600/20 rounded-lg transition-all"><X size={12} /></button>
            </div>
          </div>
        </nav>

        {/* CONTENT */}
        <div className="space-y-4">

          {activeSection === "overview" && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-teal-400 mb-3 pb-1 border-b border-white/5"><LayoutDashboard size={12} /><h3 className="text-[9px] font-bold uppercase">Profile</h3></div>
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div className="bg-white/5 p-1.5 rounded-lg"><p className="text-slate-500 text-[7px] mb-0.5 uppercase">Email</p><p className="truncate font-bold">{portalUser?.email}</p></div>
                    <div className="bg-white/5 p-1.5 rounded-lg"><p className="text-slate-500 text-[7px] mb-0.5 uppercase">Phone</p><p className="font-bold">{portalUser?.phone_number || "None"}</p></div>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-gold-400 mb-3 pb-1 border-b border-white/5"><CheckSquare size={12} /><h3 className="text-[9px] font-bold uppercase">Profile Strength</h3></div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gold-500 transition-all duration-700" style={{ width: pct(profileCompletion) }} /></div>
                  <p className="text-[7px] text-slate-500 mt-1.5 uppercase font-bold text-right">{profileCompletion}% Complete{!portalUser?.phone_number ? ' · Add phone' : ''}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {kpiMetrics.map((m, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1.5 opacity-5">
                      {i === 0 ? <Activity size={24} /> : i === 1 ? <Smile size={24} /> : <ShieldCheck size={24} />}
                    </div>
                    <span className="text-[7px] text-slate-500 uppercase font-bold">{m.label}</span>
                    <p className="text-xl font-bold mt-0.5">{m.value}</p>
                    <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden mt-1.5"><div className="h-full bg-teal-500 rounded-full transition-all duration-700" style={{ width: pct(String(m.value).includes('%') ? parseFloat(m.value) : m.value) }} /></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <h3 className="text-[8px] font-bold uppercase mb-4 text-slate-500">Project Progress</h3>
                  <div className="h-24 flex items-end justify-between gap-1 relative">
                    <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">{[...Array(3)].map((_, i) => <div key={i} className="w-full h-px bg-white/5" />)}</div>
                    {chartBars.length > 0 ? chartBars.map((h, i) => (
                      <div key={i} title={`${h}%`} className="flex-1 bg-white/5 rounded-t-sm relative group" style={{ height: '100%' }}>
                        <div className="absolute bottom-0 left-0 bg-teal-500 w-full rounded-t-sm transition-all duration-700 group-hover:bg-teal-400" style={{ height: `${h}%` }} />
                      </div>
                    )) : <p className="w-full text-center text-[8px] uppercase font-bold text-slate-600 self-center">No project data yet</p>}
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
                  <h3 className="text-[8px] font-bold uppercase self-start mb-4 text-slate-500">Avg Completion</h3>
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-white/5" /><circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * avgProgress) / 100} stroke-linecap="round" className="text-teal-500 transition-all duration-700" /></svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{avgProgress}%</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { l: outstanding.length ? `Pay ${formatKSH(totalOutstanding)}` : 'All Paid', act: () => setActiveSection('billing'), i: DollarSign, hot: outstanding.length > 0 },
                  { l: 'View Reports', act: () => navigate('/client-reports'), i: BarChart3 },
                  { l: 'Documents', act: () => navigate('/client-reports'), i: CheckSquare },
                  { l: 'Send Feedback', act: () => setActiveSection('feedback'), i: MessageSquare },
                ].map((a, i) => (
                  <button key={i} onClick={a.act} className={`p-2.5 rounded-xl border flex items-center gap-2 hover:bg-white/10 transition-all ${a.hot ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5'}`}>
                    <a.i size={13} className={a.hot ? 'text-emerald-400' : 'text-teal-400'} />
                    <span className="text-[8px] font-bold uppercase truncate">{a.l}</span>
                  </button>
                ))}
              </div>

              {/* Engagement Briefing */}
              {businessSummary && (
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sky-400"><Activity size={12} /><h3 className="text-[9px] font-bold uppercase">Engagement Briefing</h3></div>
                    {businessSummary.nextMilestone && <span className="text-[7px] text-slate-500 uppercase font-bold truncate max-w-[50%]">Next: {businessSummary.nextMilestone}</span>}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center">
                    {[
                      { l: 'Active', v: businessSummary.activeProjects ?? 0 },
                      { l: 'Completed', v: businessSummary.completedProjects ?? 0 },
                      { l: 'Open Invoices', v: businessSummary.openInvoices ?? outstanding.length },
                      { l: 'Unread', v: businessSummary.openMessages ?? unreadMessages },
                      { l: 'Tasks Open', v: tasks.filter(t => t.status !== 'completed').length },
                    ].map((c, i) => (
                      <div key={i} className="bg-white/5 rounded-lg py-1.5"><p className="text-sm font-black">{c.v}</p><p className="text-[6px] uppercase font-bold text-slate-600">{c.l}</p></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget Overview */}
              {budgetOverviewData && (budgetOverviewData.planned > 0 || budgetOverviewData.spent > 0) && (
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-emerald-400"><Wallet size={12} /><h3 className="text-[9px] font-bold uppercase">Budget Overview</h3></div>
                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full ${budgetOverviewData.spent <= budgetOverviewData.planned ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {budgetOverviewData.variance >= 0 ? `${budgetOverviewData.variance}% of plan` : 'On track'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: pct(budgetOverviewData.planned ? (budgetOverviewData.spent / budgetOverviewData.planned) * 100 : 0), background: budgetOverviewData.spent <= budgetOverviewData.planned ? 'linear-gradient(90deg,#059669,#34d399)' : 'linear-gradient(90deg,#e11d48,#fb7185)' }} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2.5 text-[8px]">
                    <div><p className="text-slate-600 uppercase font-bold text-[6px]">Planned</p><p className="font-black">{formatKSH(budgetOverviewData.planned)}</p></div>
                    <div><p className="text-slate-600 uppercase font-bold text-[6px]">Spent</p><p className="font-black">{formatKSH(budgetOverviewData.spent)}</p></div>
                    <div><p className="text-slate-600 uppercase font-bold text-[6px]">Remaining</p><p className="font-black text-emerald-400">{formatKSH(budgetOverviewData.forecast)}</p></div>
                  </div>
                </div>
              )}

              {/* Firm Updates */}
              {roleUpdates.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roleUpdates.map((u, i) => (
                    <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[9px] font-bold uppercase text-teal-400">{u.title}</p>
                      <p className="text-[8px] text-slate-500 mt-1 leading-relaxed">{u.description}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { l: 'Projects', v: projects.length, i: Briefcase, c: 'text-blue-400' },
                  { l: 'Due', v: invoices.filter(i => i.status !== 'paid').length, i: DollarSign, c: 'text-emerald-400' },
                  { l: 'Unread', v: unreadMessages, i: Mail, c: 'text-gold-400' }
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <s.i size={12} className={`${s.c} mb-1.5`} />
                    <p className="text-[7px] text-slate-500 uppercase font-bold">{s.l}</p>
                    <p className="text-sm font-bold">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "projects" && (
            <div className="space-y-3 animate-fade-in">
              {projects.length > 0 ? (
                <>
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[8px] font-bold uppercase text-slate-500">{projects.filter(p => String(p.status).toLowerCase() !== 'completed').length} Active · {projects.length} Total</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {projects.map(p => {
                      const st = String(p.status || 'active').toLowerCase();
                      const tone = st === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : st === 'on hold' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-teal-500/10 text-teal-400 border-teal-500/20';
                      const prog = Math.min(100, Math.max(0, Number(p.progress) || 0));
                      return (
                        <div key={p.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-teal-500/30 transition-all space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-[11px] font-bold uppercase leading-snug">{p.name}</h3>
                            <span className={`shrink-0 text-[7px] px-1.5 py-0.5 rounded-full border font-bold uppercase ${tone}`}>{p.status || 'Active'}</span>
                          </div>
                          {p.description && <p className="text-[8px] text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>}
                          <div className="grid grid-cols-2 gap-1.5 text-[7px]">
                            {p.manager && <div className="bg-white/5 rounded-lg px-2 py-1"><span className="text-slate-600 uppercase font-bold block text-[6px]">Lead</span><span className="font-bold truncate block">{p.manager}</span></div>}
                            {p.priority && <div className="bg-white/5 rounded-lg px-2 py-1"><span className="text-slate-600 uppercase font-bold block text-[6px]">Priority</span><span className="font-bold block">{p.priority}</span></div>}
                            {!!p.plannedBudget && <div className="bg-white/5 rounded-lg px-2 py-1"><span className="text-slate-600 uppercase font-bold block text-[6px]">Budget</span><span className="font-bold block">{formatKSH(p.plannedBudget)}</span></div>}
                            {(p.deadline) && <div className="bg-white/5 rounded-lg px-2 py-1"><span className="text-slate-600 uppercase font-bold block text-[6px]">Deadline</span><span className="font-bold block">{new Date(p.deadline).toLocaleDateString()}</span></div>}
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-[7px] font-bold uppercase mb-1"><span className="text-slate-500">Progress</span><span className="text-teal-400">{prog}%</span></div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full transition-all duration-700" style={{ width: `${prog}%` }} /></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="py-14 text-center opacity-40">
                  <Briefcase size={24} className="mx-auto mb-2" />
                  <p className="text-[9px] uppercase font-bold">No projects assigned yet</p>
                  <p className="text-[8px] text-slate-600 mt-1 mb-4">Projects from your firm appear here in real time.</p>
                  <button onClick={() => navigate('/contact')} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-[8px] font-bold uppercase transition-all">Start a Project</button>
                </div>
              )}
            </div>
          )}

          {activeSection === "billing" && (
            <div className="space-y-3 animate-fade-in">
              {/* Billing Summary */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { l: 'Outstanding', v: formatKSH(totalOutstanding), c: outstanding.length ? 'text-gold-400' : 'text-slate-500' },
                  { l: 'Paid to Date', v: formatKSH(totalPaid), c: 'text-emerald-400' },
                  { l: 'Invoices', v: invoices.length, c: 'text-sky-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                    <p className="text-[7px] text-slate-500 uppercase font-bold">{s.l}</p>
                    <p className={`text-xs font-black mt-0.5 ${s.c}`}>{s.v}</p>
                  </div>
                ))}
              </div>

              {invoices.length > 0 ? invoices.map(inv => {
                const ps = paymentStatus?.id === inv.id ? paymentStatus : null;
                return (
                  <div key={inv.id} className={`bg-white/5 p-3 rounded-xl border transition-all ${ps?.type === 'error' ? 'border-rose-500/40' : ps?.type === 'success' ? 'border-emerald-500/40' : 'border-white/5'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gold-500/10 text-gold-400'}`}><DollarSign size={14} /></div>
                        <div className="min-w-0">
                          <p className="font-bold uppercase text-[10px] truncate">{inv.project}</p>
                          <p className="text-[7px] text-slate-600 font-mono mt-0.5">
                            {inv.invoiceNumber || `INV-${inv.id}`}
                            {inv.dueDate ? ` · Due ${new Date(inv.dueDate).toLocaleDateString()}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`hidden sm:inline px-1.5 py-0.5 rounded-lg text-[7px] font-black uppercase border ${statusTone(inv.status)}`}>{inv.status}</span>
                        <p className="text-[11px] font-black">{formatKSH(inv.amount)}</p>
                        <button onClick={() => handleDownloadInvoicePdf(inv)} title="Download PDF"
                          className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-teal-400 transition-all">
                          <Download size={11} />
                        </button>
                        {inv.status !== 'paid' && (
                          <button onClick={() => handleMpesaPay(inv)} disabled={mpesaLoading === inv.id}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-[8px] font-bold uppercase flex items-center gap-1 transition-all">
                            {mpesaLoading === inv.id ? <RefreshCw size={9} className="animate-spin" /> : 'M-Pesa'}
                          </button>
                        )}
                      </div>
                    </div>
                    {ps && (
                      <p className={`mt-2 text-[8px] font-bold uppercase tracking-wide flex items-center gap-1 ${ps.type === 'success' ? 'text-emerald-400' : ps.type === 'error' ? 'text-rose-400' : 'text-sky-400'}`}>
                        {ps.type === 'success' ? <CheckCircle size={10} /> : <Clock size={10} />} {ps.message}
                      </p>
                    )}
                  </div>
                );
              }) : (
                <div className="py-14 text-center opacity-30">
                  <DollarSign size={24} className="mx-auto mb-2" />
                  <p className="text-[9px] uppercase font-bold">No invoices yet</p>
                  <p className="text-[8px] text-slate-600 mt-1">Billing appears here once your firm issues an invoice.</p>
                </div>
              )}
            </div>
          )}

          {activeSection === "tasks" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between px-1">
                <p className="text-[8px] font-bold uppercase text-slate-500">
                  {tasks.filter(t => t.status !== 'completed').length} Open · {tasks.length} Total
                </p>
              </div>
              {tasks.length > 0 ? tasks.map(t => {
                const tone = t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : t.status === 'blocked' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : t.status === 'in-progress' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                const prog = Math.min(100, Math.max(0, Number(t.progress) || 0));
                return (
                  <div key={t.id} className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold truncate">{t.title}</p>
                        <p className="text-[7px] text-slate-600 mt-0.5">{t.project} · {t.assignee}</p>
                      </div>
                      <span className={`shrink-0 px-1.5 py-0.5 rounded-full border text-[7px] font-black uppercase ${tone}`}>{t.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-teal-500 rounded-full transition-all duration-700" style={{ width: `${prog}%` }} /></div>
                      <span className="text-[7px] font-bold text-teal-400">{prog}%</span>
                      {t.priority && <span className={`text-[7px] font-black uppercase ${t.priority === 'Critical' || t.priority === 'High' ? 'text-rose-400' : 'text-slate-500'}`}>{t.priority}</span>}
                      {t.dueDate && <span className="text-[7px] text-slate-600 font-mono">{new Date(t.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                );
              }) : (
                <div className="py-14 text-center opacity-30"><ListChecks size={24} className="mx-auto mb-2" /><p className="text-[9px] uppercase font-bold">No milestones yet</p></div>
              )}
            </div>
          )}

          {activeSection === "messages" && (
            <div className="space-y-2 animate-fade-in">
              {messages.length > 0 ? messages.map(m => (
                <div key={m.id} className={`p-3 rounded-xl border flex items-start gap-3 ${m.unread ? 'bg-teal-500/[0.06] border-teal-500/20' : 'bg-white/5 border-white/5'}`}>
                  <div className={`p-1.5 rounded-lg shrink-0 ${m.unread ? 'bg-teal-500/15 text-teal-400' : 'bg-white/5 text-slate-600'}`}><Mail size={13} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {m.unread && <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />}
                      <p className="text-[10px] font-bold truncate">{m.subject}</p>
                      {m.time && <span className="ml-auto text-[7px] text-slate-600 font-mono shrink-0">{new Date(m.time).toLocaleDateString()}</span>}
                    </div>
                    <p className="text-[8px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{m.message}</p>
                    <p className="text-[6px] text-slate-700 uppercase font-black tracking-widest mt-1">— {m.sender}</p>
                  </div>
                </div>
              )) : (
                <div className="py-14 text-center opacity-30"><Mail size={24} className="mx-auto mb-2" /><p className="text-[9px] uppercase font-bold">Inbox zero</p><p className="text-[8px] text-slate-600 mt-1">Firm updates will land here.</p></div>
              )}
            </div>
          )}

          {activeSection === "documents" && (
            <div className="space-y-4 animate-fade-in">
              {docSummary.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {docSummary.map((d, i) => (
                    <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                      <Folder size={12} className="mx-auto text-gold-400 mb-1" />
                      <p className="text-sm font-black">{d.value}</p>
                      <p className="text-[6px] uppercase font-bold text-slate-600">{d.label}</p>
                    </div>
                  ))}
                </div>
              )}
              {documents.length > 0 ? documents.map(d => (
                <div key={d.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400 shrink-0"><Folder size={14} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold truncate">{d.name}</p>
                      <p className="text-[7px] text-slate-600 mt-0.5">{d.category} · {d.project} · {d.size} · {d.version}</p>
                    </div>
                  </div>
                  {d.date && <span className="hidden sm:inline text-[7px] text-slate-600 font-mono shrink-0">{new Date(d.date).toLocaleDateString()}</span>}
                </div>
              )) : (
                <div className="py-14 text-center opacity-30"><Folder size={24} className="mx-auto mb-2" /><p className="text-[9px] uppercase font-bold">Vault empty</p><p className="text-[8px] text-slate-600 mt-1">Contracts and deliverables appear here as your firm shares them.</p></div>
              )}
            </div>
          )}

          {activeSection === "feedback" && (
            <div className="space-y-6 pb-10 animate-fade-in">
              {/* FEEDBACK HEADER STATS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { l: 'Satisfaction', v: '98.4%', i: Activity, c: 'text-emerald-400' },
                  { l: 'Diagnostic Nodes', v: feedbackList.length, i: MessageSquare, c: 'text-gold-400' },
                  { l: 'Relay Time', v: '4.2h', i: Clock, c: 'text-blue-400' },
                  { l: 'Link Status', v: 'Active', i: ShieldCheck, c: 'text-teal-400' }
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <s.i size={12} className={`${s.c} mb-1`} />
                    <p className="text-[7px] text-slate-500 uppercase font-bold">{s.l}</p>
                    <p className="text-[10px] font-bold">{s.v}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* FEEDBACK FORM */}
                <div className="lg:col-span-4 bg-[#111827] p-6 rounded-3xl border border-white/5 shadow-xl h-fit">
                  <div className="flex items-center gap-2 mb-6 pb-3 border-b border-white/5">
                    <HelpCircle size={14} className="text-gold-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white">Diagnostic Relay</h3>
                  </div>

                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[7px] font-black uppercase text-slate-500 tracking-widest ml-1">Sentiment Node</label>
                       <div className="flex justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                        {[Frown, Meh, Smile, SmilePlus, Heart].map((Ic, i) => (
                          <button key={i} type="button" onClick={() => setFeedbackData({...feedbackForm, rating: i+1})} className={`transition-all ${feedbackForm.rating === i+1 ? "text-gold-500 scale-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" : "opacity-30 text-white hover:opacity-60"}`}><Ic size={18} /></button>
                        ))}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[6px] font-black uppercase text-slate-600 ml-1">Transmission Type</label>
                        <select value={feedbackForm.type} onChange={e => setFeedbackData({...feedbackForm, type: e.target.value})} className="w-full bg-white/5 p-2 rounded-lg text-[8px] font-bold outline-none text-white appearance-none border border-white/5 focus:border-gold-500/30">
                          <option value="service_feedback">Service</option>
                          <option value="bug_report">Bug Report</option>
                          <option value="feature_request">Feature Request</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[6px] font-black uppercase text-slate-600 ml-1">Urgency</label>
                        <select value={feedbackForm.priority} onChange={e => setFeedbackData({...feedbackForm, priority: e.target.value})} className="w-full bg-white/5 p-2 rounded-lg text-[8px] font-bold outline-none text-white appearance-none border border-white/5 focus:border-gold-500/30">
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[6px] font-black uppercase text-slate-600 ml-1">Header</label>
                      <input type="text" placeholder="Subject..." value={feedbackForm.title} onChange={e => setFeedbackData({...feedbackForm, title: e.target.value})} className="w-full bg-white/5 p-2 rounded-lg text-[8px] font-bold outline-none border border-white/5 focus:border-gold-500/30" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[6px] font-black uppercase text-slate-600 ml-1">Payload Details</label>
                      <textarea rows="4" placeholder="Message details..." value={feedbackForm.message} onChange={e => setFeedbackData({...feedbackForm, message: e.target.value})} className="w-full bg-white/5 p-2 rounded-lg text-[8px] font-medium outline-none resize-none border border-white/5 focus:border-gold-500/30" />
                    </div>

                    <button type="submit" disabled={isSubmittingFeedback} className="w-full py-3 bg-gradient-to-r from-gold-500 to-yellow-500 text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                       {isSubmittingFeedback ? <RefreshCw className="animate-spin size-3" /> : <>Send Transmission <ArrowRight size={12} /></>}
                    </button>
                  </form>
                </div>

                {/* FEEDBACK HISTORY */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-slate-600" />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">Transmission History</h4>
                     </div>
                     <span className="text-[7px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">{feedbackList.length} Archived</span>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-white/5 text-[7px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                        <tr>
                          <th className="px-4 py-3">Timestamp</th>
                          <th className="px-4 py-3">Origin (Sender)</th>
                          <th className="px-4 py-3">Payload (Subject)</th>
                          <th className="px-4 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-[9px]">
                        {feedbackList.length > 0 ? feedbackList.map((item, idx) => (
                          <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all group">
                            <td className="px-4 py-3 font-mono text-slate-500">{new Date(item.created_at).toLocaleString([], {dateStyle:'short', timeStyle:'short'})}</td>
                            <td className="px-4 py-3 font-bold text-slate-400">{portalUser?.display_name || 'Personnel Node'}</td>
                            <td className="px-4 py-3">
                              <p className="text-white font-bold uppercase">{item.title}</p>
                              <p className="text-[7px] text-slate-600 truncate max-w-[200px] mt-0.5">{item.message}</p>
                            </td>
                            <td className="px-4 py-3 text-right">
                               <span className={`px-1.5 py-0.5 rounded text-[6px] font-black uppercase tracking-tighter ${item.status === 'new' ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                  {item.status}
                               </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="4" className="py-20 text-center">
                               <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                                  <HelpCircle size={24} className="text-slate-600" />
                                  <div className="space-y-1">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Feedback Nodes</p>
                                     <p className="text-[8px] uppercase tracking-tighter">Your account has no recorded diagnostic transmissions.</p>
                                  </div>
                               </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ClientPortal;
