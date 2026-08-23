import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../services/api";
import {
  Briefcase,
  ClipboardList,
  BarChart3,
  CheckCircle,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Clock,
  FileCheck,
  Activity,
  UserCheck,
  RefreshCw,
  ChevronRight
} from "lucide-react";

import { formatKSH } from "../../utils/currencyUtils";

/**
 * AdvancedDashboard - Telemetry & Command Center
 * Optimized for High-Density "Small-Size" Display.
 * Powered by Hardened API Relay to prevent crashes.
 */
export function AdvancedDashboard({ user }) {
  const navigate = useNavigate();
  const userName = user?.display_name || user?.name || "Administrator";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalUsers: 0,
    pendingApprovals: 0,
    systemUptime: "---",
    verifiedUsers: 0,
    liveUsers: 0
  });
  const [budgetOverview, setBudgetOverview] = useState({
    spent: 0,
    planned: 0,
    forecast: 0,
    revenue: 0,
    net_income: 0,
    remaining: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // MISSION CRITICAL: Parallel Fetch Node
      const [dashRes, budgetRes, approvalsRes, invoicesRes] = await Promise.all([
        apiCall("/admin/dashboard"),
        apiCall("/admin/budget-overview"),
        apiCall("/admin/pending-approvals"),
        apiCall("/invoices").catch(() => null)
      ]);

      if (dashRes.success && dashRes.dashboard) {
        setStats({
          activeProjects: dashRes.dashboard.userCounts?.total_active_projects || 0,
          totalUsers: dashRes.dashboard.userCounts?.total || 0,
          verifiedUsers: dashRes.dashboard.userCounts?.verified || 0,
          liveUsers: dashRes.dashboard.userCounts?.live || 0,
          pendingApprovals: dashRes.dashboard.pending_count || 0,
          systemUptime: `${Math.floor(performance.now() / 3600000)}H ${Math.floor((performance.now() % 3600000) / 60000)}M ONLINE`,
        });
        setRecentActivity(dashRes.dashboard.recentActivity || []);
      }

      if (budgetRes.success) setBudgetOverview(budgetRes.data || {});
      if (approvalsRes.success) setPendingApprovals(approvalsRes.data || []);
      if (Array.isArray(invoicesRes)) {
        setRecentInvoices(invoicesRes.slice(0, 5));
      } else if (Array.isArray(invoicesRes?.invoices)) {
        setRecentInvoices(invoicesRes.invoices.slice(0, 5));
      } else if (Array.isArray(invoicesRes?.data)) {
        setRecentInvoices(invoicesRes.data.slice(0, 5));
      }

    } catch (error) {
      console.error("Telemetry Node Failure:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 animate-fade-in">
       <RefreshCw className="animate-spin text-teal-600 w-8 h-8" />
       <p className="mt-4 text-[7px] font-black text-slate-400 uppercase tracking-[0.6em]">Polling Telemetry Node...</p>
    </div>
  );

  const verifiedPercentage = stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0;

  const timeAgo = (t) => {
    const secs = Math.floor((Date.now() - new Date(t).getTime()) / 1000);
    if (!Number.isFinite(secs)) return "";
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
  };

  const statCards = [
    { label: "Active Projects", value: stats.activeProjects, icon: Briefcase, color: "text-sky-400", bg: "bg-sky-500/10", path: "/admin/projects" },
    { label: "Live Now", value: stats.liveUsers, icon: Activity, color: "text-rose-400", bg: "bg-rose-500/10", path: "/admin/users" },
    { label: "Pending Prot.", value: stats.pendingApprovals, icon: ClipboardList, color: "text-orange-400", bg: "bg-orange-500/10", path: "/admin/projects" },
    { label: "Asset Reach", value: stats.totalUsers, icon: BarChart3, color: "text-violet-400", bg: "bg-violet-500/10", path: "/admin/users" },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1400px] mx-auto">
      {/* Welcome Node */}
      <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 blur-[80px] -mr-24 -mt-24"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">Welcome, <span className="text-teal-400">{userName}</span></h1>
            <p className="mt-1 text-slate-500 font-black uppercase tracking-[0.4em] text-[7px]">Node Operational: <span className="text-emerald-500">{stats.systemUptime}</span></p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/admin/billing')} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 hover:bg-white/10 transition-all text-left group">
              <p className="text-[6px] text-slate-500 font-black uppercase tracking-widest group-hover:text-teal-400">Revenue</p>
              <p className="text-sm font-black text-white">{formatKSH(budgetOverview?.revenue)}</p>
            </button>
            <button onClick={() => navigate('/admin/billing/pl-report')} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 hover:bg-white/10 transition-all text-left group">
              <p className="text-[6px] text-slate-500 font-black uppercase tracking-widest group-hover:text-teal-400">Net Income</p>
              <p className="text-sm font-black text-white">{formatKSH(budgetOverview?.net_income)}</p>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "New Invoice", icon: DollarSign, path: "/admin/billing", tone: "text-emerald-600 bg-emerald-50" },
          { label: "Add Personnel", icon: UserCheck, path: "/admin/users", tone: "text-sky-600 bg-sky-50" },
          { label: "Content Hub", icon: MessageSquare, path: "/admin/content", tone: "text-violet-600 bg-violet-50" },
          { label: "Run Reports", icon: BarChart3, path: "/admin/reports", tone: "text-orange-600 bg-orange-50" },
        ].map((a) => (
          <button key={a.label} onClick={() => navigate(a.path)} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex items-center gap-3 hover:border-teal-500/40 hover:shadow-md transition-all group text-left">
            <span className={`p-2 rounded-lg ${a.tone}`}><a.icon size={14} /></span>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-700 group-hover:text-teal-700">{a.label}</span>
            <ChevronRight size={12} className="ml-auto text-slate-300 group-hover:text-teal-500 transition-colors" />
          </button>
        ))}
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            onClick={() => navigate(stat.path)}
            className="bg-white rounded-xl p-4 border border-slate-100 shadow-md flex items-center justify-between hover:scale-[1.02] hover:border-teal-500/30 transition-all cursor-pointer"
          >
            <div>
              <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className="text-xl font-black text-slate-900">{stat.value}</p>
            </div>
            <div className={`${stat.bg} p-2 rounded-lg ${stat.color}`}><stat.icon size={14} /></div>
          </div>
        ))}
      </div>

      {/* Financial Telemetry */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-3">
          <div className="flex items-center gap-3">
            <DollarSign size={14} className="text-emerald-500" />
            <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Financial Telemetry</h3>
          </div>
          <button onClick={() => navigate('/admin/billing')} className="text-[7px] font-black text-teal-600 uppercase tracking-widest hover:underline">Access Hub</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Burn", val: budgetOverview?.expenses, color: "text-slate-900" },
            { label: "Spent Node", val: budgetOverview?.spent, color: "text-teal-600" },
            { label: "Remaining", val: budgetOverview?.remaining, color: "text-blue-600" },
            { label: "Forecast", val: budgetOverview?.forecast, color: "text-violet-600" }
          ].map(node => (
            <div
              key={node.label}
              onClick={() => navigate('/admin/billing')}
              className="bg-slate-50 rounded-xl p-3 border border-slate-100 cursor-pointer hover:bg-white hover:shadow-inner transition-all"
            >
              <p className="text-[6px] text-slate-400 font-black uppercase tracking-widest">{node.label}</p>
              <p className={`text-base font-black mt-1 ${node.color}`}>{formatKSH(node.val)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Identity & Trust Telemetry */}
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl p-5 border border-white/5">
        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <UserCheck size={14} className="text-teal-400" />
            <h3 className="text-[9px] font-black text-white uppercase tracking-widest">Identity &amp; Trust</h3>
          </div>
          <button onClick={() => navigate('/admin/users')} className="text-[7px] font-black text-teal-400 uppercase tracking-widest hover:text-white transition-colors">Manage Users</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-white/5" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * verifiedPercentage) / 100} strokeLinecap="round" className="text-teal-400 transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">{verifiedPercentage}%</div>
            </div>
            <div>
              <p className="text-[6px] text-slate-500 font-black uppercase tracking-widest">Verified</p>
              <p className="text-sm font-black text-white">{stats.verifiedUsers}<span className="text-slate-600 text-[9px]"> / {stats.totalUsers}</span></p>
            </div>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 text-center">
            <p className="text-[6px] text-slate-500 font-black uppercase tracking-widest">Live Right Now</p>
            <p className="text-lg font-black text-rose-400">{stats.liveUsers}</p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 text-center">
            <p className="text-[6px] text-slate-500 font-black uppercase tracking-widest">Node Uptime</p>
            <p className="text-xs font-black text-emerald-500 mt-0.5">{stats.systemUptime}</p>
          </div>
        </div>
      </div>

      {/* Latest Invoices */}
      <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-100">
        <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3">
          <div className="flex items-center gap-3">
            <DollarSign size={14} className="text-emerald-500" />
            <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Latest Invoices</h3>
          </div>
          <button onClick={() => navigate('/admin/billing')} className="text-[7px] font-black text-teal-600 uppercase tracking-widest hover:underline">Billing Hub</button>
        </div>
        {recentInvoices.length > 0 ? (
          <div className="space-y-2">
            {recentInvoices.map((inv) => {
              const st = String(inv.status || 'draft').toLowerCase();
              const tone = st === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : st === 'overdue' ? 'bg-rose-50 text-rose-600 border-rose-100'
                : 'bg-orange-50 text-orange-600 border-orange-100';
              return (
                <div key={inv.id} onClick={() => navigate(`/admin/billing/preview/${inv.id}`)}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white cursor-pointer transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-emerald-500"><DollarSign size={12} /></div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-900 uppercase truncate">{inv.project_name || inv.client_name || `Invoice #${inv.id}`}</p>
                      <p className="text-[6px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{inv.invoice_number || `INV-${inv.id}`}{inv.due_date ? ` · Due ${new Date(inv.due_date).toLocaleDateString()}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-1.5 py-0.5 rounded-md border text-[6px] font-black uppercase ${tone}`}>{st}</span>
                    <p className="text-[10px] font-black text-slate-900">{formatKSH(inv.amount || inv.total_amount)}</p>
                    <ChevronRight size={11} className="text-slate-300 group-hover:text-teal-500" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center opacity-30">
            <FileCheck size={22} className="mx-auto mb-2" />
            <p className="text-[7px] font-black uppercase">No invoices issued yet</p>
          </div>
        )}
      </div>

      {/* Activity and Validations */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-[#0f172a] rounded-2xl shadow-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
            <div className="flex items-center gap-3">
              <Activity size={14} className="text-teal-400" />
              <h3 className="text-[9px] font-black text-white uppercase tracking-widest">Live Activity Log</h3>
            </div>
            <button
              onClick={() => navigate('/admin/activity')}
              className="text-[7px] font-black text-teal-400 uppercase tracking-widest hover:text-white transition-colors"
            >
              Access Logs
            </button>
          </div>
          <div className="space-y-2">
            {recentActivity.length > 0 ? recentActivity.slice(0, 5).map((act, i) => (
              <div
                key={i}
                onClick={() => navigate('/admin/activity')}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all group cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><Clock size={10} className="text-slate-500 group-hover:text-teal-400" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-[9px] truncate">{act.action}</p>
                  <p className="text-slate-600 text-[6px] font-black uppercase tracking-widest mt-0.5" title={new Date(act.timestamp).toLocaleString()}>{timeAgo(act.timestamp)}</p>
                </div>
              </div>
            )) : <div className="py-10 text-center opacity-20"><Activity size={24} className="mx-auto mb-2" /><p className="text-[7px] font-black uppercase">Silent Mode</p></div>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-100">
           <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-3">
            <div className="flex items-center gap-3">
              <FileCheck size={14} className="text-orange-500" />
              <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Pending Validations</h3>
            </div>
            <button onClick={() => navigate('/admin/projects')} className="text-[7px] font-black text-orange-500 uppercase tracking-widest hover:underline">Audit All</button>
          </div>
          <div className="space-y-2">
            {pendingApprovals.length > 0 ? pendingApprovals.slice(0, 4).map((app, i) => (
              <div key={i} onClick={() => navigate('/admin/projects')} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:bg-white transition-all cursor-pointer">
                <div><p className="text-[9px] font-black text-slate-900 uppercase">{app.name}</p><p className="text-[6px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Awaiting Audit</p></div>
                <ChevronRight size={12} className="text-slate-300 group-hover:text-teal-500" />
              </div>
            )) : <div className="py-10 text-center opacity-20"><CheckCircle size={24} className="mx-auto mb-2" /><p className="text-[7px] font-black uppercase">Nodes Clear</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
