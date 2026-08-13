import React, { useState, useEffect } from "react";
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

/**
 * AdvancedDashboard - Telemetry & Command Center
 * Optimized for High-Density "Small-Size" Display.
 * Powered by Hardened API Relay to prevent crashes.
 */
export function AdvancedDashboard({ user }) {
  const userName = user?.display_name || user?.name || "Administrator";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalUsers: 0,
    pendingApprovals: 0,
    systemUptime: "---",
    verifiedUsers: 0
  });
  const [budgetOverview, setBudgetOverview] = useState({
    spent: 0,
    planned: 0,
    forecast: 0,
    revenue: 0,
    net_income: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // MISSION CRITICAL: Parallel Fetch Node
      const [dashRes, budgetRes, approvalsRes] = await Promise.all([
        apiCall("/admin/dashboard"),
        apiCall("/admin/budget-overview"),
        apiCall("/admin/pending-approvals")
      ]);

      if (dashRes.success && dashRes.dashboard) {
        setStats({
          activeProjects: dashRes.dashboard.userCounts?.total_active_projects || 0,
          totalUsers: dashRes.dashboard.userCounts?.total || 0,
          verifiedUsers: dashRes.dashboard.userCounts?.verified || 0,
          pendingApprovals: dashRes.dashboard.pending_count || 0,
          systemUptime: "ONLINE",
        });
        setRecentActivity(dashRes.dashboard.recentActivity || []);
      }

      if (budgetRes.success) setBudgetOverview(budgetRes.data || {});
      if (approvalsRes.success) setPendingApprovals(approvalsRes.data || []);

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
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              <p className="text-[6px] text-slate-500 font-black uppercase tracking-widest">Revenue</p>
              <p className="text-sm font-black text-white">KSh {budgetOverview?.revenue?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              <p className="text-[6px] text-slate-500 font-black uppercase tracking-widest">Net Income</p>
              <p className="text-sm font-black text-white">KSh {budgetOverview?.net_income?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Projects", value: stats.activeProjects, icon: Briefcase, color: "text-sky-400", bg: "bg-sky-500/10" },
          { label: "Identity Sync", value: `${verifiedPercentage}%`, icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Pending Prot.", value: stats.pendingApprovals, icon: ClipboardList, color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Asset Reach", value: stats.totalUsers, icon: BarChart3, color: "text-violet-400", bg: "bg-violet-500/10" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-md flex items-center justify-between hover:scale-[1.02] transition-all">
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
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-50">
          <DollarSign size={14} className="text-emerald-500" />
          <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Financial Telemetry (KSh)</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Burn", val: budgetOverview?.expenses, color: "text-slate-900" },
            { label: "Spent Node", val: budgetOverview?.spent, color: "text-teal-600" },
            { label: "Remaining", val: budgetOverview?.remaining, color: "text-blue-600" },
            { label: "Forecast", val: budgetOverview?.forecast, color: "text-violet-600" }
          ].map(node => (
            <div key={node.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[6px] text-slate-400 font-black uppercase tracking-widest">{node.label}</p>
              <p className={`text-base font-black mt-1 ${node.color}`}>{node.val?.toLocaleString() || '0'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity and Validations */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-[#0f172a] rounded-2xl shadow-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/5">
            <Activity size={14} className="text-teal-400" />
            <h3 className="text-[9px] font-black text-white uppercase tracking-widest">Live Activity Log</h3>
          </div>
          <div className="space-y-2">
            {recentActivity.length > 0 ? recentActivity.slice(0, 5).map((act, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all group">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><Clock size={10} className="text-slate-500 group-hover:text-teal-400" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-[9px] truncate">{act.action}</p>
                  <p className="text-slate-600 text-[6px] font-black uppercase tracking-widest mt-0.5">{new Date(act.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            )) : <div className="py-10 text-center opacity-20"><Activity size={24} className="mx-auto mb-2" /><p className="text-[7px] font-black uppercase">Silent Mode</p></div>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-100">
           <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-50">
            <FileCheck size={14} className="text-orange-500" />
            <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Pending Validations</h3>
          </div>
          <div className="space-y-2">
            {pendingApprovals.length > 0 ? pendingApprovals.slice(0, 4).map((app, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:bg-white transition-all cursor-pointer">
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
