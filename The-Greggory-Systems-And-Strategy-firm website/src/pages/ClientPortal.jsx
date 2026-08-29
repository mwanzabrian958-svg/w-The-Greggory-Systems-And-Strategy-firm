import { useState, useEffect } from "react";
import {
  Briefcase,
  Bell,
  DollarSign,
  RefreshCw,
  LayoutDashboard,
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
  AlertCircle,
  ArrowRight,
  ListChecks,
  Mail,
  Folder,
  Download,
  UserCheck,
  Wallet,
  Settings,
  Lock,
  Users
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getApiUrl, mpesaAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { formatKSH } from "../utils/currencyUtils";

const ClientPortal = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const authFetch = async (url, options = {}, timeoutMs = 15000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token || ''}`,
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.status === 401 || res.status === 403) {
        logout();
        navigate('/login', { replace: true });
        throw new Error('Session expired');
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') throw new Error('Request timed out');
      throw err;
    }
  };

  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [kpiMetrics, setKpiMetrics] = useState([]);
  const [portalUser, setPortalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
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
  const [teamMembers, setTeamMembers] = useState([]);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    display_name: '',
    phone_number: '',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState(null);
  const [settingsErrors, setSettingsErrors] = useState({});

  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  const unreadMessages = messages.filter(m => m.unread).length;

  const navItems = [
    { id: "overview", label: "Home", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "team", label: "Team", icon: Users },
    { id: "tasks", label: "Tasks", icon: ListChecks, badge: tasks.filter(t => t.status !== "completed").length },
    { id: "billing", label: "Billing", icon: DollarSign, badge: invoices.filter(i => i.status !== "paid").length },
    { id: "documents", label: "Docs", icon: Folder, badge: documents.length },
    { id: "messages", label: "Inbox", icon: Mail, badge: unreadMessages },
    { id: "notifications", label: "Alerts", icon: Bell },
    { id: "feedback", label: "Feedback", icon: HelpCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const loadFeedbackHistory = async (userId) => {
    try {
      const response = await authFetch(getApiUrl(`/api/users/client-feedback/${userId}`));
      const data = await response.json();
      if (data.success) setFeedbackList(data.feedback || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadClientData = async (retries = 2) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authFetch(getApiUrl('/api/users/client-dashboard'));
      if (!response.ok) {
        throw new Error(`Server error (${response.status})`);
      }
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
        setTeamMembers(data.dashboard.teamMembers || []);
        if (user?.userId || user?.id) {
          loadFeedbackHistory(user.userId || user.id);
        }
      } else {
        throw new Error(data.message || 'Failed to load dashboard');
      }
    } catch (err) {
      console.error('Client dashboard load failed:', err);
      if (retries > 0) {
        setTimeout(() => loadClientData(retries - 1), 1500);
        return;
      }
      setError(err.message || 'Disconnected.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClientData(); }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && portalUser) {
        loadClientData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [portalUser]);

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  useEffect(() => {
    if (portalUser) {
      setSettingsForm({
        display_name: portalUser?.display_name || '',
        phone_number: portalUser?.phone_number || '',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
      });
    }
  }, [portalUser]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!settingsForm.display_name.trim()) {
      nextErrors.display_name = 'Display name is required';
    } else if (settingsForm.display_name.trim().length < 2) {
      nextErrors.display_name = 'Name must be at least 2 characters';
    }
    if (settingsForm.phone_number && !/^\+?[\d\s-]{7,15}$/.test(settingsForm.phone_number)) {
      nextErrors.phone_number = 'Enter a valid phone number';
    }
    setSettingsErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSettingsLoading(true);
    setSettingsMessage(null);
    try {
      const res = await authFetch(getApiUrl('/api/users/profile'), {
        method: 'PUT',
        body: JSON.stringify({ display_name: settingsForm.display_name.trim(), phone_number: settingsForm.phone_number.trim() || null }),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsMessage({ type: 'success', text: 'Profile updated successfully' });
        setPortalUser(prev => ({ ...prev, display_name: settingsForm.display_name.trim(), phone_number: settingsForm.phone_number.trim() || null }));
        setTimeout(() => setSettingsMessage(null), 3000);
      } else {
        setSettingsMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (err) {
      setSettingsMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!passwordForm.current_password) nextErrors.current_password = 'Required';
    if (!passwordForm.new_password || passwordForm.new_password.length < 6) nextErrors.new_password = 'At least 6 characters';
    if (passwordForm.new_password !== passwordForm.confirm_password) nextErrors.confirm_password = 'Passwords do not match';
    setSettingsErrors({ ...nextErrors, display_name: '', phone_number: '' });
    if (Object.keys(nextErrors).length > 0) return;

    setPasswordLoading(true);
    setPasswordMessage(null);
    try {
      const res = await authFetch(getApiUrl('/api/users/change-password'), {
        method: 'POST',
        body: JSON.stringify({ current_password: passwordForm.current_password, new_password: passwordForm.new_password }),
      });
      const data = await res.json();
      setPasswordMessage({ type: data.success ? 'success' : 'error', text: data.message || 'Password update failed' });
      if (data.success) setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordMessage(null), 3000);
    } catch (err) {
      setPasswordMessage({ type: 'error', text: 'Network error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.title || !feedbackForm.message) return;
    setIsSubmittingFeedback(true);
    try {
      const response = await authFetch(getApiUrl('/api/users/client-feedback'), {
        method: 'POST',
        body: JSON.stringify({
          userId: user.userId || user.id,
          title: feedbackForm.title,
          message: feedbackForm.message,
          type: feedbackForm.type,
          priority: feedbackForm.priority,
          rating: feedbackForm.rating,
          author: 'client'
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
      const res = await authFetch(getApiUrl(`/api/users/my-invoices/${inv.id}/pdf`));
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
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-slate-900 dark:text-white">
      <RefreshCw className="animate-spin text-teal-600 w-6 h-6 mb-2" />
      <p className="text-[10px] font-bold uppercase tracking-widest">Loading...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-slate-900 dark:text-white p-4">
      <AlertCircle className="text-rose-500 w-8 h-8 mb-3" />
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Connection Failed</p>
      <p className="text-[8px] text-slate-500 dark:text-slate-300 mb-4 text-center max-w-md">{error}</p>
      <button onClick={() => loadClientData()} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-teal-500 transition-all">
        Retry
      </button>
    </div>
  );

  const closePortal = () => { window.location.href = '/'; };
  const profilePhotoSrc = portalUser?.profilePhotoData || user?.profilePhotoData;

  // â”€â”€ Real computed metrics (no more hardcoded placeholders) â”€â”€
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
    paid: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    overdue: 'bg-rose-500/10 text-rose-600 dark:text-rose-600 dark:text-rose-400 border-rose-500/20',
    pending: 'bg-gold-500/10 text-gold-600 border-gold-500/20',
    draft: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-500/20',
  }[String(s).toLowerCase()] || 'bg-sky-500/10 text-sky-600 dark:text-sky-600 dark:text-sky-400 border-sky-500/20');

  return (
    <div className={`min-h-screen pt-10 px-4 pb-8 font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      <div className="max-w-6xl mx-auto">

        {isOffline && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2">
            <AlertCircle className="text-rose-600 dark:text-rose-400 w-4 h-4 shrink-0" />
            <p className="text-[8px] font-black uppercase tracking-widest text-rose-300">You are offline â€” some features may be limited</p>
          </div>
        )}

        {/* NAV */}
        <nav className="mb-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/95 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center justify-between gap-1 py-1 overflow-x-auto no-scrollbar">
            <div className="flex gap-0.5">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'notifications') {
                      navigate('/client-alerts');
                    } else {
                      setActiveSection(item.id);
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all border ${activeSection === item.id ? "bg-teal-600 text-white border-teal-500" : "bg-transparent text-slate-500 dark:text-slate-300 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"}`}
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
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-lg">
                {profilePhotoSrc ? <img src={profilePhotoSrc} alt="U" className="w-5 h-5 rounded-full" /> : <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-600 flex items-center justify-center text-[8px] font-bold">{(portalUser?.display_name || "U")[0]}</div>}
                <p className="text-[8px] font-bold hidden sm:block">{portalUser?.display_name || "User"}</p>
              </div>
              <button onClick={closePortal} aria-label="Close portal" className="p-1 bg-slate-50 dark:bg-slate-800 hover:bg-rose-600/20 rounded-lg transition-all"><X size={12} /></button>
            </div>
          </div>
        </nav>

        {/* CONTENT */}
        <div className="space-y-4">

          {activeSection === "overview" && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-teal-600 mb-3 pb-1 border-b border-slate-200 dark:border-slate-700"><LayoutDashboard size={12} /><h3 className="text-[9px] font-bold uppercase">Profile</h3></div>
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg"><p className="text-slate-500 dark:text-slate-300 text-[7px] mb-0.5 uppercase">Email</p><p className="break-all font-bold">{portalUser?.email}</p></div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg"><p className="text-slate-500 dark:text-slate-300 text-[7px] mb-0.5 uppercase">Phone</p><p className="font-bold">{portalUser?.phone_number || "None"}</p></div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-gold-600 mb-3 pb-1 border-b border-slate-200 dark:border-slate-700"><CheckSquare size={12} /><h3 className="text-[9px] font-bold uppercase">Profile Strength</h3></div>
                  <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gold-500 transition-all duration-700" style={{ width: pct(profileCompletion) }} /></div>
                  <p className="text-[7px] text-slate-500 dark:text-slate-300 mt-1.5 uppercase font-bold text-right">{profileCompletion}% Complete{!portalUser?.phone_number ? ' Â· Add phone' : ''}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {kpiMetrics.map((m, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1.5 opacity-5">
                      {i === 0 ? <Activity size={24} /> : i === 1 ? <Smile size={24} /> : <ShieldCheck size={24} />}
                    </div>
                    <span className="text-[7px] text-slate-500 dark:text-slate-300 uppercase font-bold">{m.label}</span>
                    <p className="text-xl font-bold mt-0.5">{m.value}</p>
                    <div className="h-0.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5"><div className="h-full bg-teal-500 rounded-full transition-all duration-700" style={{ width: pct(String(m.value).includes('%') ? parseFloat(m.value) : m.value) }} /></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h3 className="text-[8px] font-bold uppercase mb-4 text-slate-500 dark:text-slate-300">Project Progress</h3>
                  <div className="h-24 flex items-end justify-between gap-1 relative">
                    <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">{[...Array(3)].map((_, i) => <div key={i} className="w-full h-px bg-slate-50 dark:bg-slate-800" />)}</div>
                    {chartBars.length > 0 ? chartBars.map((h, i) => (
                      <div key={i} title={`${h}%`} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-t-sm relative group" style={{ height: '100%' }}>
                        <div className="absolute bottom-0 left-0 bg-teal-500 w-full rounded-t-sm transition-all duration-700 group-hover:bg-teal-400" style={{ height: `${h}%` }} />
                      </div>
                    )) : <p className="w-full text-center text-[8px] uppercase font-bold text-slate-600 dark:text-slate-300 self-center">No project data yet</p>}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                  <h3 className="text-[8px] font-bold uppercase self-start mb-4 text-slate-500 dark:text-slate-300">Avg Completion</h3>
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-300" /><circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * avgProgress) / 100} stroke-linecap="round" className="text-teal-500 transition-all duration-700" /></svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{avgProgress}%</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { l: outstanding.length ? `Pay ${formatKSH(totalOutstanding)}` : 'All Paid', act: () => setActiveSection('billing'), i: DollarSign, hot: outstanding.length > 0 },
                    { l: 'Documents', act: () => setActiveSection('documents'), i: CheckSquare },
                    { l: 'Send Feedback', act: () => setActiveSection('feedback'), i: MessageSquare },
                  ].map((a, i) => (
                  <button key={i} onClick={a.act} className={`p-2.5 rounded-xl border flex items-center gap-2 hover:bg-slate-100 dark:bg-slate-700 transition-all ${a.hot ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                    <a.i size={13} className={a.hot ? 'text-emerald-600 dark:text-emerald-400' : 'text-teal-600'} />
                    <span className="text-[8px] font-bold uppercase truncate">{a.l}</span>
                  </button>
                ))}
              </div>

              {/* Engagement Briefing */}
              {businessSummary && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400"><Activity size={12} /><h3 className="text-[9px] font-bold uppercase">Engagement Briefing</h3></div>
                    {businessSummary.nextMilestone && <span className="text-[7px] text-slate-500 dark:text-slate-300 uppercase font-bold truncate max-w-[50%]">Next: {businessSummary.nextMilestone}</span>}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center">
                    {[
                      { l: 'Active', v: businessSummary.activeProjects ?? 0 },
                      { l: 'Completed', v: businessSummary.completedProjects ?? 0 },
                      { l: 'Open Invoices', v: businessSummary.openInvoices ?? outstanding.length },
                      { l: 'Unread', v: businessSummary.openMessages ?? unreadMessages },
                      { l: 'Tasks Open', v: tasks.filter(t => t.status !== 'completed').length },
                    ].map((c, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-lg py-1.5"><p className="text-sm font-black">{c.v}</p><p className="text-[6px] uppercase font-bold text-slate-600 dark:text-slate-300">{c.l}</p></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget Overview */}
              {budgetOverviewData && (budgetOverviewData.planned > 0 || budgetOverviewData.spent > 0) && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><Wallet size={12} /><h3 className="text-[9px] font-bold uppercase">Budget Overview</h3></div>
                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full ${budgetOverviewData.spent <= budgetOverviewData.planned ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                      {budgetOverviewData.variance >= 0 ? `${budgetOverviewData.variance}% of plan` : 'On track'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: pct(budgetOverviewData.planned ? (budgetOverviewData.spent / budgetOverviewData.planned) * 100 : 0), background: budgetOverviewData.spent <= budgetOverviewData.planned ? 'linear-gradient(90deg,#059669,#34d399)' : 'linear-gradient(90deg,#e11d48,#fb7185)' }} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2.5 text-[8px]">
                    <div><p className="text-slate-600 dark:text-slate-300 uppercase font-bold text-[6px]">Planned</p><p className="font-black">{formatKSH(budgetOverviewData.planned)}</p></div>
                    <div><p className="text-slate-600 dark:text-slate-300 uppercase font-bold text-[6px]">Spent</p><p className="font-black">{formatKSH(budgetOverviewData.spent)}</p></div>
                    <div><p className="text-slate-600 dark:text-slate-300 uppercase font-bold text-[6px]">Remaining</p><p className="font-black text-emerald-600 dark:text-emerald-400">{formatKSH(budgetOverviewData.forecast)}</p></div>
                  </div>
                </div>
              )}

              {/* Firm Updates */}
              {roleUpdates.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roleUpdates.map((u, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-[9px] font-bold uppercase text-teal-600">{u.title}</p>
                      <p className="text-[8px] text-slate-500 dark:text-slate-300 mt-1 leading-relaxed">{u.description}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { l: 'Projects', v: projects.length, i: Briefcase, c: 'text-blue-400' },
                  { l: 'Due', v: invoices.filter(i => i.status !== 'paid').length, i: DollarSign, c: 'text-emerald-600 dark:text-emerald-400' },
                  { l: 'Unread', v: unreadMessages, i: Mail, c: 'text-gold-600' }
                ].map((s, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <s.i size={12} className={`${s.c} mb-1.5`} />
                    <p className="text-[7px] text-slate-500 dark:text-slate-300 uppercase font-bold">{s.l}</p>
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
                    <p className="text-[8px] font-bold uppercase text-slate-500 dark:text-slate-300">{projects.filter(p => String(p.status).toLowerCase() !== 'completed').length} Active Â· {projects.length} Total</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {projects.map(p => {
                      const st = String(p.status || 'active').toLowerCase();
                      const tone = st === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : st === 'on hold' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        : 'bg-teal-500/10 text-teal-600 border-teal-500/20';
                      const prog = Math.min(100, Math.max(0, Number(p.progress) || 0));
                      return (
                        <div key={p.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-teal-500/30 transition-all space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-[11px] font-bold uppercase leading-snug">{p.name}</h3>
                            <span className={`shrink-0 text-[7px] px-1.5 py-0.5 rounded-full border font-bold uppercase ${tone}`}>{p.status || 'Active'}</span>
                          </div>
                          {p.description && <p className="text-[8px] text-slate-500 dark:text-slate-300 line-clamp-2 leading-relaxed">{p.description}</p>}
                          <div className="grid grid-cols-2 gap-1.5 text-[7px]">
                            {p.manager && <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-1"><span className="text-slate-600 dark:text-slate-300 uppercase font-bold block text-[6px]">Lead</span><span className="font-bold truncate block">{p.manager}</span></div>}
                            {p.priority && <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-1"><span className="text-slate-600 dark:text-slate-300 uppercase font-bold block text-[6px]">Priority</span><span className="font-bold block">{p.priority}</span></div>}
                            {!!p.plannedBudget && <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-1"><span className="text-slate-600 dark:text-slate-300 uppercase font-bold block text-[6px]">Budget</span><span className="font-bold block">{formatKSH(p.plannedBudget)}</span></div>}
                            {(p.deadline) && <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-1"><span className="text-slate-600 dark:text-slate-300 uppercase font-bold block text-[6px]">Deadline</span><span className="font-bold block">{new Date(p.deadline).toLocaleDateString()}</span></div>}
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-[7px] font-bold uppercase mb-1"><span className="text-slate-500 dark:text-slate-300">Progress</span><span className="text-teal-600">{prog}%</span></div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full transition-all duration-700" style={{ width: `${prog}%` }} /></div>
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
                  <p className="text-[8px] text-slate-600 dark:text-slate-300 mt-1 mb-4">Projects from your firm appear here in real time.</p>
                  <button onClick={() => navigate('/contact')} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-[8px] font-bold uppercase transition-all">Start a Project</button>
                </div>
              )}
            </div>
          )}

          {activeSection === "team" && (
            <div className="space-y-4 animate-fade-in">
              {teamMembers.length > 0 ? (
                Object.entries(
                  teamMembers.reduce((acc, member) => {
                    const pid = member.projectId || 'unassigned';
                    if (!acc[pid]) acc[pid] = { projectName: member.projectName || 'Unassigned', members: [] };
                    acc[pid].members.push(member);
                    return acc;
                  }, {})
                ).map(([projectId, group]) => (
                  <div key={projectId} className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                      <Briefcase size={12} className="text-teal-600" />
                      <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white truncate">{group.projectName}</h3>
                      <span className="text-[7px] text-slate-500 dark:text-slate-300 uppercase font-bold ml-auto">{group.members.length} member{group.members.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {group.members.map((m, idx) => (
                         <div key={m.id || idx} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-slate-900 dark:text-white text-[9px] font-black shrink-0">
                            {(m.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-slate-900 dark:text-white truncate">{m.name}</p>
                            <p className="text-[7px] text-slate-500 dark:text-slate-300 truncate">{m.duties}</p>
                          </div>
                          <span className="text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-[80px]">{m.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-14 text-center opacity-40">
                  <Users size={24} className="mx-auto mb-2" />
                  <p className="text-[9px] uppercase font-bold">No team members assigned yet</p>
                  <p className="text-[8px] text-slate-600 dark:text-slate-300 mt-1">Your project team will appear here once assigned.</p>
                </div>
              )}
            </div>
          )}

          {activeSection === "billing" && (
            <div className="space-y-3 animate-fade-in">
              {/* Billing Summary */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { l: 'Outstanding', v: formatKSH(totalOutstanding), c: outstanding.length ? 'text-gold-600' : 'text-slate-500 dark:text-slate-300' },
                  { l: 'Paid to Date', v: formatKSH(totalPaid), c: 'text-emerald-600 dark:text-emerald-400' },
                  { l: 'Invoices', v: invoices.length, c: 'text-sky-600 dark:text-sky-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-[7px] text-slate-500 dark:text-slate-300 uppercase font-bold">{s.l}</p>
                    <p className={`text-xs font-black mt-0.5 ${s.c}`}>{s.v}</p>
                  </div>
                ))}
              </div>

              {invoices.length > 0 ? invoices.map(inv => {
                const ps = paymentStatus?.id === inv.id ? paymentStatus : null;
                return (
                  <div key={inv.id} className={`bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border transition-all ${ps?.type === 'error' ? 'border-rose-500/40' : ps?.type === 'success' ? 'border-emerald-500/40' : 'border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-gold-500/10 text-gold-600'}`}><DollarSign size={14} /></div>
                        <div className="min-w-0">
                          <p className="font-bold uppercase text-[10px] truncate">{inv.project}</p>
                          <p className="text-[7px] text-slate-600 dark:text-slate-300 font-mono mt-0.5">
                            {inv.invoiceNumber || `INV-${inv.id}`}
                            {inv.dueDate ? ` Â· Due ${new Date(inv.dueDate).toLocaleDateString()}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`hidden sm:inline px-1.5 py-0.5 rounded-lg text-[7px] font-black uppercase border ${statusTone(inv.status)}`}>{inv.status}</span>
                        <p className="text-[11px] font-black">{formatKSH(inv.amount)}</p>
                        <button onClick={() => handleDownloadInvoicePdf(inv)} title="Download PDF"
                          className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-400 dark:text-slate-500 hover:text-teal-600 transition-all">
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
                      <p className={`mt-2 text-[8px] font-bold uppercase tracking-wide flex items-center gap-1 ${ps.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : ps.type === 'error' ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-sky-400'}`}>
                        {ps.type === 'success' ? <CheckCircle size={10} /> : <Clock size={10} />} {ps.message}
                      </p>
                    )}
                  </div>
                );
              }) : (
                <div className="py-14 text-center opacity-30">
                  <DollarSign size={24} className="mx-auto mb-2" />
                  <p className="text-[9px] uppercase font-bold">No invoices yet</p>
                  <p className="text-[8px] text-slate-600 dark:text-slate-300 mt-1">Billing appears here once your firm issues an invoice.</p>
                </div>
              )}
            </div>
          )}

          {activeSection === "tasks" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between px-1">
                <p className="text-[8px] font-bold uppercase text-slate-500 dark:text-slate-300">
                  {tasks.filter(t => t.status !== 'completed').length} Open Â· {tasks.length} Total
                </p>
              </div>
              {tasks.length > 0 ? tasks.map(t => {
                const tone = t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : t.status === 'blocked' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  : t.status === 'in-progress' ? 'bg-teal-500/10 text-teal-600 border-teal-500/20'
                  : 'bg-slate-50 dark:bg-slate-8000/10 text-slate-400 dark:text-slate-500 border-slate-500/20';
                const prog = Math.min(100, Math.max(0, Number(t.progress) || 0));
                return (
                  <div key={t.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold truncate">{t.title}</p>
                        <p className="text-[7px] text-slate-600 dark:text-slate-300 mt-0.5">{t.project} Â· {t.assignee}</p>
                      </div>
                      <span className={`shrink-0 px-1.5 py-0.5 rounded-full border text-[7px] font-black uppercase ${tone}`}>{t.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-teal-500 rounded-full transition-all duration-700" style={{ width: `${prog}%` }} /></div>
                      <span className="text-[7px] font-bold text-teal-600">{prog}%</span>
                      {t.priority && <span className={`text-[7px] font-black uppercase ${t.priority === 'Critical' || t.priority === 'High' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-300'}`}>{t.priority}</span>}
                      {t.dueDate && <span className="text-[7px] text-slate-600 dark:text-slate-300 font-mono">{new Date(t.dueDate).toLocaleDateString()}</span>}
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
                <div key={m.id} className={`p-3 rounded-xl border flex items-start gap-3 ${m.unread ? 'bg-teal-500/[0.06] border-teal-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                  <div className={`p-1.5 rounded-lg shrink-0 ${m.unread ? 'bg-teal-500/15 text-teal-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}><Mail size={13} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {m.unread && <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />}
                      <p className="text-[10px] font-bold truncate">{m.subject}</p>
                      {m.time && <span className="ml-auto text-[7px] text-slate-600 dark:text-slate-300 font-mono shrink-0">{new Date(m.time).toLocaleDateString()}</span>}
                    </div>
                    <p className="text-[8px] text-slate-500 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">{m.message}</p>
                    <p className="text-[6px] text-slate-700 dark:text-slate-200 uppercase font-black tracking-widest mt-1">â€” {m.sender}</p>
                  </div>
                </div>
              )) : (
                <div className="py-14 text-center opacity-30"><Mail size={24} className="mx-auto mb-2" /><p className="text-[9px] uppercase font-bold">Inbox zero</p><p className="text-[8px] text-slate-600 dark:text-slate-300 mt-1">Firm updates will land here.</p></div>
              )}
            </div>
          )}

          {activeSection === "documents" && (
            <div className="space-y-4 animate-fade-in">
              {docSummary.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {docSummary.map((d, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <Folder size={12} className="mx-auto text-gold-600 mb-1" />
                      <p className="text-sm font-black">{d.value}</p>
                      <p className="text-[6px] uppercase font-bold text-slate-600 dark:text-slate-300">{d.label}</p>
                    </div>
                  ))}
                </div>
              )}
              {documents.length > 0 ? documents.map(d => (
                <div key={d.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-gold-500/10 text-gold-600 shrink-0"><Folder size={14} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold truncate">{d.name}</p>
                      <p className="text-[7px] text-slate-600 dark:text-slate-300 mt-0.5">{d.category} Â· {d.project} Â· {d.size} Â· {d.version}</p>
                    </div>
                  </div>
                  {d.date && <span className="hidden sm:inline text-[7px] text-slate-600 dark:text-slate-300 font-mono shrink-0">{new Date(d.date).toLocaleDateString()}</span>}
                </div>
              )) : (
                <div className="py-14 text-center opacity-30"><Folder size={24} className="mx-auto mb-2" /><p className="text-[9px] uppercase font-bold">Vault empty</p><p className="text-[8px] text-slate-600 dark:text-slate-300 mt-1">Contracts and deliverables appear here as your firm shares them.</p></div>
              )}
            </div>
          )}

          {activeSection === "feedback" && (
            <div className="space-y-6 pb-10 animate-fade-in">
              {/* FEEDBACK HEADER STATS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { l: 'Satisfaction', v: '98.4%', i: Activity, c: 'text-emerald-600 dark:text-emerald-400' },
                  { l: 'Diagnostic Nodes', v: feedbackList.length, i: MessageSquare, c: 'text-gold-600' },
                  { l: 'Relay Time', v: '4.2h', i: Clock, c: 'text-blue-400' },
                  { l: 'Link Status', v: 'Active', i: ShieldCheck, c: 'text-teal-600' }
                ].map((s, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <s.i size={12} className={`${s.c} mb-1`} />
                    <p className="text-[7px] text-slate-500 dark:text-slate-300 uppercase font-bold">{s.l}</p>
                    <p className="text-[10px] font-bold">{s.v}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* FEEDBACK FORM */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl h-fit">
                  <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <HelpCircle size={14} className="text-gold-600" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">Diagnostic Relay</h3>
                  </div>

                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[7px] font-black uppercase text-slate-500 dark:text-slate-300 tracking-widest ml-1">Sentiment Node</label>
                       <div className="flex justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        {[Frown, Meh, Smile, SmilePlus, Heart].map((Ic, i) => (
                          <button key={i} type="button" onClick={() => setFeedbackData({...feedbackForm, rating: i+1})} className={`transition-all ${feedbackForm.rating === i+1 ? "text-gold-500 scale-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" : "opacity-30 text-slate-900 dark:text-white hover:opacity-60"}`}><Ic size={18} /></button>
                        ))}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[6px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1">Transmission Type</label>
                        <select value={feedbackForm.type} onChange={e => setFeedbackData({...feedbackForm, type: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-[8px] font-bold outline-none text-slate-900 dark:text-white appearance-none border border-slate-200 dark:border-slate-700 focus:border-gold-500/30">
                          <option value="service_feedback">Service</option>
                          <option value="bug_report">Bug Report</option>
                          <option value="feature_request">Feature Request</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[6px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1">Urgency</label>
                        <select value={feedbackForm.priority} onChange={e => setFeedbackData({...feedbackForm, priority: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-[8px] font-bold outline-none text-slate-900 dark:text-white appearance-none border border-slate-200 dark:border-slate-700 focus:border-gold-500/30">
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[6px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1">Header</label>
                      <input type="text" placeholder="Subject..." value={feedbackForm.title} onChange={e => setFeedbackData({...feedbackForm, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-[8px] font-bold outline-none border border-slate-200 dark:border-slate-700 focus:border-gold-500/30" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[6px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1">Payload Details</label>
                      <textarea rows="4" placeholder="Message details..." value={feedbackForm.message} onChange={e => setFeedbackData({...feedbackForm, message: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-[8px] font-medium outline-none resize-none border border-slate-200 dark:border-slate-700 focus:border-gold-500/30" />
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
                        <MessageSquare size={14} className="text-slate-600 dark:text-slate-300" />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">Transmission History</h4>
                     </div>
                     <span className="text-[7px] font-mono text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">{feedbackList.length} Archived</span>
                  </div>

                   <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[640px]">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-[7px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-4 py-3">Timestamp</th>
                          <th className="px-4 py-3">Origin (Sender)</th>
                          <th className="px-4 py-3">Payload (Subject)</th>
                          <th className="px-4 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-[9px]">
                        {feedbackList.length > 0 ? feedbackList.map((item, idx) => (
                           <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:bg-slate-800 transition-all group">
                            <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-300">{new Date(item.created_at).toLocaleString([], {dateStyle:'short', timeStyle:'short'})}</td>
                            <td className="px-4 py-3 font-bold text-slate-400 dark:text-slate-500">{portalUser?.display_name || 'Personnel Node'}</td>
                            <td className="px-4 py-3">
                              <p className="text-slate-900 dark:text-white font-bold uppercase">{item.title}</p>
                              <p className="text-[7px] text-slate-600 dark:text-slate-300 truncate max-w-[200px] mt-0.5">{item.message}</p>
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
                                  <HelpCircle size={24} className="text-slate-600 dark:text-slate-300" />
                                  <div className="space-y-1">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">No Feedback Nodes</p>
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

        {activeSection === "settings" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Settings size={14} className="text-teal-600" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">Display Preferences</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Dark mode</span>
                  <button onClick={toggleTheme} className={`relative w-12 h-6 rounded-full transition-all border ${darkMode ? 'bg-gold-500 border-gold-500' : 'bg-white border-slate-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform bg-white ${darkMode ? 'translate-x-6 bg-slate-950' : 'bg-slate-600'}`} />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[7px] font-black uppercase text-slate-500 dark:text-slate-300 ml-1">Display Name</label>
                    <input type="text" value={settingsForm.display_name} onChange={e => setSettingsForm({...settingsForm, display_name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-[9px] font-bold outline-none border border-slate-200 dark:border-slate-700 focus:border-teal-500/30" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black uppercase text-slate-500 dark:text-slate-300 ml-1">Phone Number</label>
                    <input type="tel" value={settingsForm.phone_number} onChange={e => setSettingsForm({...settingsForm, phone_number: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-[9px] font-bold outline-none border border-slate-200 dark:border-slate-700 focus:border-teal-500/30" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[7px] font-black uppercase text-slate-500 dark:text-slate-300 ml-1">Email</label>
                  <input type="email" value={portalUser?.email || ''} disabled className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-[9px] font-bold outline-none border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300" />
                </div>
                {settingsMessage && (
                  <p className={`text-[8px] font-bold uppercase ${settingsMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{settingsMessage.text}</p>
                )}
                <button type="submit" disabled={settingsLoading} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-500 disabled:opacity-50 transition-all">
                  {settingsLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-200 dark:border-slate-700">
                <Bell size={14} className="text-gold-600" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">Notification Preferences</h3>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive project updates and invoices via email' },
                  { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive payment alerts and reminders via SMS' },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive real-time updates in your browser' },
                ].map(pref => (
                  <div key={pref.key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-[9px] font-bold text-slate-900 dark:text-white">{pref.label}</p>
                      <p className="text-[7px] text-slate-500 dark:text-slate-300">{pref.desc}</p>
                    </div>
                    <button onClick={() => setSettingsForm({...settingsForm, [pref.key]: !settingsForm[pref.key]})} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settingsForm[pref.key] ? 'bg-teal-600' : 'bg-slate-100 dark:bg-slate-700'}`}>
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white dark:bg-slate-900 transition-transform ${settingsForm[pref.key] ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-200 dark:border-slate-700">
                <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">Account Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[7px] text-slate-500 dark:text-slate-300 uppercase font-bold">Account ID</p>
                  <p className="text-[9px] font-black text-slate-900 dark:text-white mt-0.5">{portalUser?.id || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[7px] text-slate-500 dark:text-slate-300 uppercase font-bold">Role</p>
                  <p className="text-[9px] font-black text-slate-900 dark:text-white mt-0.5 uppercase">{portalUser?.role || 'Client'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[7px] text-slate-500 dark:text-slate-300 uppercase font-bold">Member Since</p>
                  <p className="text-[9px] font-black text-slate-900 dark:text-white mt-0.5">{portalUser?.created_at ? new Date(portalUser.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-[7px] text-slate-500 dark:text-slate-300 uppercase font-bold">Last Login</p>
                  <p className="text-[9px] font-black text-slate-900 dark:text-white mt-0.5">{portalUser?.last_login_at ? new Date(portalUser.last_login_at).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-200 dark:border-slate-700">
                <Lock size={14} className="text-rose-600 dark:text-rose-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">Change Password</h3>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
                <div className="space-y-1">
                  <label className="text-[7px] font-black uppercase text-slate-500 dark:text-slate-300 ml-1">Current Password</label>
                  <input type="password" value={passwordForm.current_password} onChange={e => setPasswordForm({...passwordForm, current_password: e.target.value})} className={`w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-[9px] font-bold outline-none border ${settingsErrors.current_password ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500/30'}`} />
                  {settingsErrors.current_password && <p className="text-[7px] text-rose-600 dark:text-rose-400 ml-1">{settingsErrors.current_password}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[7px] font-black uppercase text-slate-500 dark:text-slate-300 ml-1">New Password</label>
                  <input type="password" value={passwordForm.new_password} onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})} className={`w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-[9px] font-bold outline-none border ${settingsErrors.new_password ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500/30'}`} />
                  {settingsErrors.new_password && <p className="text-[7px] text-rose-600 dark:text-rose-400 ml-1">{settingsErrors.new_password}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[7px] font-black uppercase text-slate-500 dark:text-slate-300 ml-1">Confirm New Password</label>
                  <input type="password" value={passwordForm.confirm_password} onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})} className={`w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-[9px] font-bold outline-none border ${settingsErrors.confirm_password ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500/30'}`} />
                  {settingsErrors.confirm_password && <p className="text-[7px] text-rose-600 dark:text-rose-400 ml-1">{settingsErrors.confirm_password}</p>}
                </div>
                {passwordMessage && (
                  <p className={`text-[8px] font-bold uppercase ${passwordMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{passwordMessage.text}</p>
                )}
                <button type="submit" disabled={passwordLoading} className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 disabled:opacity-50 transition-all">
                  {passwordLoading ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ClientPortal;
