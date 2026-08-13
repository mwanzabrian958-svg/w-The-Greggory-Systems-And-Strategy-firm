import React, { useState } from "react";
import { Settings as SettingsIcon, Save, RefreshCw, Bell, Shield, Database, Globe, Mail, Smartphone, Palette, User, Key, Power } from "lucide-react";

/**
 * Settings - Administrative Node Calibration
 * Optimized with compact containers and technical micro-typography.
 */
export function Settings({ user }) {
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Calibration</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Admin Node Settings</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 text-white font-black text-[8px] uppercase tracking-widest shadow-md">
          <Save size={12} /> Commit Changes
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Identity calibration */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xl">
           <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-3 mb-4">
              <User size={14} /><h4 className="text-[9px] font-black uppercase tracking-widest">Identity Calibration</h4>
           </div>
           <div className="space-y-4">
              <div><label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Display Node Name</label><input type="text" value={user?.display_name || ""} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[9px] font-bold outline-none focus:ring-1 focus:ring-teal-500" /></div>
              <div><label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Admin Email Relay</label><input type="email" value={user?.email || ""} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[9px] font-bold outline-none focus:ring-1 focus:ring-teal-500" /></div>
           </div>
        </section>

        {/* Security protocol */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xl">
           <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-3 mb-4">
              <Shield size={14} /><h4 className="text-[9px] font-black uppercase tracking-widest">Security Protocols</h4>
           </div>
           <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                 <p className="text-[8px] font-black text-slate-600 uppercase">Two-Factor Relay</p>
                 <div className="w-6 h-3 bg-teal-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-2 h-2 bg-white rounded-full"></div></div>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                 <p className="text-[8px] font-black text-slate-600 uppercase">Session Auto-Term</p>
                 <div className="w-6 h-3 bg-slate-200 rounded-full relative"><div className="absolute left-0.5 top-0.5 w-2 h-2 bg-white rounded-full"></div></div>
              </div>
           </div>
        </section>

        {/* System Operations */}
        <section className="bg-[#0f172a] rounded-2xl p-5 border border-white/5 shadow-2xl">
           <div className="flex items-center gap-2 text-teal-400 border-b border-white/5 pb-3 mb-4">
              <Power size={14} /><h4 className="text-[9px] font-black uppercase tracking-widest">Mission Controls</h4>
           </div>
           <div className="space-y-2">
              <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[7px] font-black uppercase tracking-widest border border-white/5 transition-all">Clear System Cache</button>
              <button className="w-full py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-500 hover:text-white rounded-lg text-[7px] font-black uppercase tracking-widest border border-rose-600/20 transition-all mt-2">Emergency Hub Lockdown</button>
           </div>
        </section>
      </div>

      <footer className="pt-10 pb-20 flex flex-col items-center opacity-30">
         <p className="text-[6px] font-black text-slate-400 uppercase tracking-[0.8em]">Calibration Mode V.0.7.2</p>
      </footer>
    </div>
  );
}

export default Settings;
