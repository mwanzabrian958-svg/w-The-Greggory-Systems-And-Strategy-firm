import { useState, useEffect } from "react";
import {
  Briefcase,
  FileText,
  MessageSquare,
  Bell,
  DollarSign,
  RefreshCw,
  LayoutDashboard,
  BarChart3,
  HelpCircle,
  Smartphone,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getApiUrl, mpesaAPI } from "../services/api";

const ClientPortal = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [portalUser, setPortalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  // M-Pesa State
  const [mpesaLoading, setMpesaLoading] = useState(null); // stores invoice ID being paid
  const [paymentStatus, setPaymentStatus] = useState(null);

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "communication", label: "Communication", icon: MessageSquare },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "feedback", label: "Feedback", icon: HelpCircle },
    { id: "billing", label: "Billing", icon: DollarSign },
  ];

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
        setMessages(data.dashboard.messages || []);
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to load data");
      setLoading(false);
    }
  };

  useEffect(() => { loadClientData(); }, []);

  const handleMpesaPay = async (invoice) => {
    setMpesaLoading(invoice.id);
    setPaymentStatus({ id: invoice.id, type: 'info', message: 'Checking phone for M-Pesa prompt...' });

    try {
      const response = await mpesaAPI.stkPush({
        phoneNumber: portalUser?.phone_number || '',
        amount: invoice.amount,
        accountReference: invoice.invoice_number || `INV-${invoice.id}`,
        description: `Payment for ${invoice.project_name || 'Project'}`,
        userId: portalUser?.id
      });

      if (response.success) {
        setPaymentStatus({
          id: invoice.id,
          type: 'success',
          message: response.simulated
            ? 'SIMULATION: Payment acknowledged. System is updating.'
            : 'STK Push sent! Please complete on your phone.'
        });

        // Poll for status in a real scenario, or just refresh after a delay
        setTimeout(loadClientData, 5000);
      }
    } catch (err) {
      setPaymentStatus({ id: invoice.id, type: 'error', message: 'Payment initialization failed. Contact support.' });
    } finally {
      setMpesaLoading(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white"><RefreshCw className="animate-spin text-gold-500" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">{error}</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[100px] -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight">Welcome, {portalUser?.first_name || "Client"}</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">Client Management Node Active</p>
          </div>
          <button onClick={loadClientData} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"><RefreshCw size={20} className="text-gold-500" /></button>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-4 no-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all whitespace-nowrap border ${activeSection === item.id ? "bg-gold-500 text-black border-gold-500 shadow-xl shadow-gold-500/20" : "bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white"}`}
            >
              <item.icon size={18} />
              <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeSection === "overview" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Profile Telemetry</h2>
                  <div className="space-y-6">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Authenticated Email</p>
                      <p className="font-bold text-lg">{portalUser?.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Verified Phone</p>
                      <p className="font-bold text-lg text-emerald-400">{portalUser?.phone_number || "Awaiting Verification"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col justify-center">
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-2">Engagements</p>
                    <p className="text-4xl font-black">{projects.length}</p>
                  </div>
                  <div className="bg-gold-500/10 p-6 rounded-3xl border border-gold-500/20 flex flex-col justify-center">
                    <p className="text-gold-500/50 text-[10px] uppercase font-black tracking-widest mb-2">Pending Invoices</p>
                    <p className="text-4xl font-black text-gold-500">{invoices.filter(i => i.status !== 'paid').length}</p>
                  </div>
                </div>
            </div>
          </div>
        )}

        {activeSection === "billing" && (
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 animate-fade-in">
            <h2 className="text-xl font-black uppercase tracking-tight mb-8">Financial Ledger</h2>

            <div className="space-y-4">
              {invoices.length > 0 ? invoices.map(i => (
                <div key={i.id} className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${i.status === 'paid' ? 'bg-emerald-500/10' : 'bg-gold-500/10'}`}>
                         <DollarSign className={i.status === 'paid' ? 'text-emerald-400' : 'text-gold-400'} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{i.invoice_number || `INV-${i.id}`}</p>
                         <h3 className="font-bold text-lg">{i.project_name || 'Project Service'}</h3>
                      </div>
                   </div>

                   <div className="flex items-center gap-8">
                      <div className="text-right">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Amount Due</p>
                         <p className="text-xl font-black">KSh {i.amount.toLocaleString()}</p>
                      </div>

                      {i.status !== 'paid' ? (
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => handleMpesaPay(i)}
                            disabled={mpesaLoading === i.id}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                          >
                            {mpesaLoading === i.id ? <RefreshCw className="animate-spin size-3" /> : <Smartphone className="size-3" />}
                            {mpesaLoading === i.id ? 'Processing...' : 'Pay via M-Pesa'}
                          </button>
                          {paymentStatus?.id === i.id && (
                            <p className={`text-[9px] font-bold uppercase tracking-tight ${paymentStatus.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {paymentStatus.message}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                           <CheckCircle className="text-emerald-400 size-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Payment Confirmed</span>
                        </div>
                      )}
                   </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-white/2 rounded-3xl border border-dashed border-white/10">
                   <p className="text-xs font-black uppercase tracking-widest text-slate-500">Zero Outstanding Invoices</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === "projects" && (
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 animate-fade-in">
            <h2 className="text-xl font-black uppercase tracking-tight mb-8">Active Mission Engagement</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {projects.map(p => (
                <div key={p.id} className="p-8 bg-white/5 rounded-3xl border border-white/5 hover:border-gold-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-black text-xl tracking-tight group-hover:text-gold-500 transition-colors">{p.name}</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">{p.status}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                       <span>Tactical Progress</span>
                       <span>{p.progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-gold-500 h-full rounded-full transition-all duration-1000" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPortal;
