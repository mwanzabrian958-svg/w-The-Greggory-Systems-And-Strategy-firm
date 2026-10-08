import React, { useState } from "react";
import { InlineLoader, Spinner, PageLoader } from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Key, Eye, EyeOff, AlertTriangle, Shield, RefreshCw, ChevronRight, FileText } from "lucide-react";

export function Security() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const SECURITY_NODES = [
    { label: "Encrypted Relay", status: "Active", node: "AES-256", ok: true },
    { label: "Identity Node", status: "Solidified", node: "WhatsApp", ok: true },
    { label: "Ledger Audit", status: "Valid", node: "MySQL-Sync", ok: true },
    { label: "Data Safety", status: "Compliant", node: "GDPR/KRA", ok: true },
  ];

  if (loading) return <InlineLoader label="Verifying Security Posture…" tone="teal" rail />;

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Security & Hardening</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Systems Protection Protocol</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => navigate('/admin/data-safety')} className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5 hover:bg-emerald-100 transition-colors">
              <Shield size={10} /> Data Safety Hub
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SECURITY_NODES.map((node) => (
          <div key={node.label} className="bg-white rounded-xl p-3 border border-slate-100 shadow-md flex items-center justify-between">
            <div>
              <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{node.label}</p>
              <div className="flex items-center gap-2">
                {node.ok ? (
                  <>
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <p className="text-sm font-black text-emerald-600">{node.status}</p>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} className="text-amber-500" />
                    <p className="text-sm font-black text-amber-600">{node.status}</p>
                  </>
                )}
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><p className="text-[6px] font-black">{node.node}</p></div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Threat Monitor */}
        <section className="bg-[#0f172a] rounded-2xl p-5 border border-white/5 shadow-2xl">
           <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Active Threat Monitor</h3>
            <AlertTriangle size={14} className="text-teal-400" />
          </div>
          <div className="space-y-3">
             {[1, 2].map(i => (
               <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-white uppercase">Brute Force Mitigation</p>
                    <p className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Origin: 192.168.x.x · Blocked</p>
                  </div>
                  <Lock size={12} className="text-emerald-500" />
               </div>
             ))}
          </div>
        </section>

        {/* Access Logs */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xl overflow-hidden">
           <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Data Safety & Compliance</h3>
            <ShieldCheck size={14} className="text-emerald-500" />
          </div>
          <div className="space-y-2">
             <button onClick={() => navigate('/admin/data-safety')} className="w-full p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between group hover:bg-white transition-all">
                <div>
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Audit Logs & Access Control</p>
                  <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Track data access, classifications, and consent</p>
                </div>
                <ChevronRight size={12} className="text-slate-300 group-hover:text-teal-500" />
             </button>
             <button onClick={() => navigate('/admin/team')} className="w-full p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between group hover:bg-white transition-all">
                <div>
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Team & Personnel</p>
                  <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Manage team members and project assignments</p>
                </div>
                <ChevronRight size={12} className="text-slate-300 group-hover:text-teal-500" />
             </button>
          </div>
        </section>
      </div>
    </div>
  );
}
