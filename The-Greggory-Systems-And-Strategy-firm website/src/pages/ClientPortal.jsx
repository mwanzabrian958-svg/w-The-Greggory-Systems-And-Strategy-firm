import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../services/api";
import { formatKSH } from "../utils/currencyUtils";
import { useAuth } from "../context/AuthContext";
import { FolderKanban, FileText, DollarSign, RefreshCw, LogOut } from "lucide-react";

export function ClientPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.display_name || user?.name || (user?.first_name ? `${user?.first_name} ${user?.last_name}` : (user?.email || "Client"));
  const initials = displayName.split(" ").map(s => s ? s[0] : "").filter(Boolean).slice(0, 2).join("").toUpperCase();
  const profilePhoto = user?.profilePhotoData || null;
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [p, i] = await Promise.all([
        apiCall("/user-projects"),
        apiCall("/api/invoices")
      ]);
      const userId = user?.id;
      setProjects(Array.isArray(p) ? p.filter(proj => String(proj.client_id) === String(userId) || String(proj.user_id) === String(userId)) : []);
      setInvoices(Array.isArray(i) ? i.filter(inv => String(inv.client_id) === String(userId)) : []);
    } catch (e) {
      const msg = String(e?.message || e || "").toLowerCase();
      // Session expired / token revoked -> send the client back to login
      if (msg.includes("401") || msg.includes("authentication") || msg.includes("unauthorized")) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      console.error("Client portal fetch failed:", e);
    }
    finally { setLoading(false); }
  };

  const totalOwed = invoices.reduce((sum, inv) => sum + (parseFloat(inv.total_amount_kes) || 0), 0);
  const activeProjects = projects.filter(p => p.status === "in-progress" || p.status === "planning").length;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <RefreshCw className="animate-spin text-teal-600 w-8 h-8" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">Client Portal</h1>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-teal-500/40 bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">{profilePhoto ? <img src={profilePhoto} alt={displayName} className="w-full h-full object-cover" /> : (initials || "C")}</div>
             <p className="text-[10px] font-bold text-slate-900">{displayName}</p>
            <button onClick={logout} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><LogOut size={16} /></button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <FolderKanban size={16} className="text-teal-600 mb-2" />
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Active Projects</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{activeProjects}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <FileText size={16} className="text-blue-600 mb-2" />
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Total Invoices</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{invoices.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <DollarSign size={16} className="text-amber-600 mb-2" />
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Total Billed</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatKSH(totalOwed)}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">My Projects</h2>
            {projects.length === 0 ? (
              <p className="text-[9px] text-slate-400 italic">No projects assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {projects.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-[9px] font-bold text-slate-900">{p.project_name}</p>
                      <p className="text-[7px] text-slate-400 mt-0.5">{p.start_date ? new Date(p.start_date).toLocaleDateString() : "No date"}</p>
                    </div>
                    <span className={`text-[6px] font-black uppercase px-2 py-0.5 rounded-full ${
                      p.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                      p.status === "in-progress" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                    }`}>{p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">My Invoices</h2>
            {invoices.length === 0 ? (
              <p className="text-[9px] text-slate-400 italic">No invoices yet.</p>
            ) : (
              <div className="space-y-3">
                {invoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-[9px] font-bold text-slate-900">{inv.title || "Invoice #" + inv.id}</p>
                      <p className="text-[7px] text-slate-400 mt-0.5">{formatKSH(inv.total_amount_kes || 0)}</p>
                    </div>
                    <span className={`text-[6px] font-black uppercase px-2 py-0.5 rounded-full ${
                      inv.status === "paid" ? "bg-emerald-50 text-emerald-600" :
                      inv.status === "overdue" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                    }`}>{inv.status || "pending"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Default export — required by React.lazy(() => import("./pages/ClientPortal"))
// in App.jsx. The named export is kept for any direct imports.
export default ClientPortal;
