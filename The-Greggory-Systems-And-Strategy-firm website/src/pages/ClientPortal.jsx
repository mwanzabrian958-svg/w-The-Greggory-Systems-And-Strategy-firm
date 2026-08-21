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
  ArrowRight
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

  const navItems = [
    { id: "overview", label: "Home", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "billing", label: "Billing", icon: DollarSign },
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

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
      <RefreshCw className="animate-spin text-teal-500 w-6 h-6 mb-2" />
      <p className="text-[10px] font-bold uppercase tracking-widest">Loading...</p>
    </div>
  );

  const closePortal = () => { window.location.href = '/'; };
  const profilePhotoSrc = portalUser?.profilePhotoData || user?.profilePhotoData;

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
                  <div className="flex items-center gap-1.5 text-gold-400 mb-3 pb-1 border-b border-white/5"><CheckSquare size={12} /><h3 className="text-[9px] font-bold uppercase">Status</h3></div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gold-500 w-[94%]" /></div>
                  <p className="text-[7px] text-slate-500 mt-1.5 uppercase font-bold text-right">94% Solidified</p>
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
                    <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden mt-1.5"><div className="h-full bg-teal-500 w-3/4 rounded-full" /></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <h3 className="text-[8px] font-bold uppercase mb-4 text-slate-500">Project Speed</h3>
                  <div className="h-24 flex items-end justify-between gap-1 relative">
                    <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">{[...Array(3)].map((_, i) => <div key={i} className="w-full h-px bg-white/5" />)}</div>
                    {[40, 65, 45, 90, 75, 55, 85, 60].map((h, i) => <div key={i} className="flex-1 bg-white/5 rounded-t-sm relative" style={{ height: `${h}%` }}><div className="absolute bottom-0 left-0 bg-teal-500 w-full" style={{ height: '30%' }} /></div>)}
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
                  <h3 className="text-[8px] font-bold uppercase self-start mb-4 text-slate-500">Node Usage</h3>
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-white/5" /><circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="62.8" className="text-teal-500" /></svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">75%</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { l: 'Projects', v: projects.length, i: Briefcase, c: 'text-blue-400' },
                  { l: 'Due', v: invoices.filter(i => i.status !== 'paid').length, i: DollarSign, c: 'text-emerald-400' },
                  { l: 'System', v: '98%', i: Activity, c: 'text-teal-400' }
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
              {projects.length > 0 ? projects.map(p => (
                <div key={p.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-teal-500/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-[11px] font-bold uppercase truncate pr-1">{p.name}</h3>
                    <span className="text-[7px] bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded-full border border-teal-500/20 font-bold uppercase">{p.status}</span>
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full"><div className="h-full bg-teal-500 rounded-full" style={{ width: `${p.progress}%` }} /></div>
                </div>
              )) : <p className="text-[8px] opacity-30 uppercase font-bold text-center py-10">Empty</p>}
            </div>
          )}

          {activeSection === "billing" && (
            <div className="space-y-2 animate-fade-in">
              {invoices.length > 0 ? invoices.map(inv => (
                <div key={inv.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gold-500/10 text-gold-400'}`}><DollarSign size={14} /></div>
                    <div><p className="font-bold uppercase">{inv.project}</p><p className="text-[8px] text-slate-600">{formatKSH(inv.amount)}</p></div>
                  </div>
                  {inv.status !== 'paid' ? (
                    <button onClick={() => handleMpesaPay(inv)} className="px-2.5 py-1 bg-emerald-600 rounded-lg text-[8px] font-bold uppercase">Pay</button>
                  ) : <span className="text-emerald-400 text-[8px] font-bold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded-lg">Paid</span>}
                </div>
              )) : <p className="text-[8px] opacity-30 text-center py-10">Empty</p>}
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
