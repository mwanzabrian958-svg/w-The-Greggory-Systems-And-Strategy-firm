import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Save, RefreshCw, Shield, Power, Activity, User, Lock, Loader2,
  CheckCircle2, AlertTriangle, Eraser, Timer, Wrench, Users, Moon,
} from "lucide-react";
import { apiCall } from "../../services/api";

/* Defaults mirror the server whitelist (GET /api/admin/node-settings) */
const DEFAULTS = {
  site_title: "The Greggory Systems And Strategy Firm",
  contact_email: "",
  contact_phone: "",
  admin_session_timeout: "60",
  maintenance_mode: "false",
  allow_registration: "true",
  deep_space_mode: "false",
  admin_lockdown: "false",
};

const toBool = (v) => v === true || v === "true" || v === 1 || v === "1";
const boolStr = (v) => (toBool(v) ? "true" : "false");

/* Real on/off switch — every toggle below is wired to persisted settings */
function Toggle({ on, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={`w-10 h-5 rounded-full relative transition-colors duration-200 shrink-0 ${on ? "bg-teal-500" : "bg-slate-300"} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export function Settings({ user }) {
  const [form, setForm] = useState(DEFAULTS);
  const [system, setSystem] = useState(null);
  const [calibration, setCalibration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [locking, setLocking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const flashTimer = useRef(null);

  const flash = useCallback((type, text) => {
    setFeedback({ type, text });
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFeedback(null), 4500);
  }, []);

  /* ---- Load settings + system snapshot from the node ---- */
  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await apiCall("/admin/node-settings");
        if (data && data.success) {
          setForm({ ...DEFAULTS, ...data.settings });
          setSystem(data.system || null);
          if (data.settings && data.settings.last_calibration) {
            try { setCalibration(JSON.parse(data.settings.last_calibration)); } catch { setCalibration(null); }
          }
        } else {
          throw new Error((data && data.message) || "Load failed");
        }
      } catch (e) {
        flash("err", "Could not load node settings: " + e.message);
      } finally {
        setLoading(false);
      }
    },
    [flash]
  );

  useEffect(() => {
    load();
    return () => { if (flashTimer.current) window.clearTimeout(flashTimer.current); };
  }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleKey = (k) => setForm((f) => ({ ...f, [k]: boolStr(f[k]) === "true" ? "false" : "true" }));
  /* ---- Commit Changes → PUT /api/admin/node-settings ---- */
  const commit = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.last_calibration;
      const data = await apiCall("/admin/node-settings", {
        method: "PUT",
        body: JSON.stringify({ settings: payload }),
      });
      if (data && data.success) flash("ok", `Committed ${data.updated} setting(s) to the node.`);
      else throw new Error((data && data.message) || "Save failed");
    } catch (e) {
      flash("err", e.message);
    } finally {
      setSaving(false);
    }
  };

  /* ---- Run System Calibration → POST /api/admin/system-calibration ---- */
  const runCalibration = async () => {
    setCalibrating(true);
    try {
      const data = await apiCall("/admin/system-calibration", { method: "POST" });
      if (data && data.success) {
        setCalibration(data.report);
        flash(data.report.status === "healthy" ? "ok" : "err", `Calibration complete — node status: ${String(data.report.status).toUpperCase()} (DB ${data.report.db_latency_ms}ms)`);
      } else throw new Error((data && data.message) || "Calibration failed");
    } catch (e) {
      flash("err", e.message);
    } finally {
      setCalibrating(false);
    }
  };
  /* ---- Clear System Cache: purges session + HTTP caches, then re-syncs (never touches auth tokens) ---- */
  const clearCache = async () => {
    setClearing(true);
    try {
      try { sessionStorage.clear(); } catch { /* private mode */ }
      try {
        if (window.caches && caches.keys) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch { /* CacheStorage unavailable */ }
      await load(true);
      flash("ok", "Local caches purged — live settings re-synced from the node.");
    } catch (e) {
      flash("err", e.message);
    } finally {
      setClearing(false);
    }
  };

  /* ---- Emergency Hub Lockdown → persists admin_lockdown on the node ---- */
  const toggleLockdown = async () => {
    const engaging = !toBool(form.admin_lockdown);
    const msg = engaging
      ? "ENGAGE EMERGENCY HUB LOCKDOWN?\n\nThe lockdown flag is persisted on the node and stays engaged until manually lifted here."
      : "Lift the Emergency Hub Lockdown?";
    if (!window.confirm(msg)) return;
    setLocking(true);
    try {
      const data = await apiCall("/admin/node-settings", {
        method: "PUT",
        body: JSON.stringify({ settings: { admin_lockdown: boolStr(engaging) } }),
      });
      if (data && data.success) {
        set("admin_lockdown", boolStr(engaging));
        flash(engaging ? "err" : "ok", engaging ? "HUB LOCKDOWN ENGAGED." : "Lockdown lifted.");
      } else throw new Error((data && data.message) || "Lockdown failed");
    } catch (e) {
      flash("err", e.message);
    } finally {
      setLocking(false);
    }
  };

  const timeoutOn = form.admin_session_timeout !== "0" && form.admin_session_timeout !== "";
  const lockdownOn = toBool(form.admin_lockdown);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 animate-fade-in">
        <Loader2 size={18} className="animate-spin text-teal-600" />
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Node Calibration…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Calibration</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Admin Node Settings</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load()} disabled={loading} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-black text-[8px] uppercase tracking-widest shadow-sm hover:border-teal-500 hover:text-teal-700 transition-all disabled:opacity-50">
            <RefreshCw size={12} /> Refresh
          </button>
          <button onClick={commit} disabled={saving || loading} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 text-white font-black text-[8px] uppercase tracking-widest shadow-md hover:bg-teal-700 transition-all disabled:opacity-50">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} {saving ? "Committing…" : "Commit Changes"}
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${feedback.type === "ok" ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
          {feedback.type === "ok" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />} {feedback.text}
        </div>
      )}

      {lockdownOn && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-rose-600 text-white border-rose-700 text-[9px] font-black uppercase tracking-widest shadow-lg">
          <Lock size={13} /> Emergency Hub Lockdown is ENGAGED — lift it from Mission Controls below.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Identity & Contact — every field wired */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xl">
           <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-3 mb-4">
              <User size={14} /><h4 className="text-[9px] font-black uppercase tracking-widest">Identity &amp; Contact</h4>
           </div>
           <div className="space-y-3">
              <div>
                 <label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Display Node Name</label>
                 <input type="text" value={user?.display_name || user?.username || ""} readOnly className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[9px] font-bold outline-none cursor-not-allowed" />
                 <p className="text-[6px] font-bold text-slate-300 uppercase tracking-widest mt-1 px-1">Managed by your admin session</p>
              </div>
              <div>
                 <label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Admin Email Relay</label>
                 <input type="email" value={user?.email || ""} readOnly className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[9px] font-bold outline-none cursor-not-allowed" />
              </div>
              <div>
                 <label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Site Title (public node name)</label>
                 <input type="text" value={form.site_title || ""} onChange={(e) => set("site_title", e.target.value)} placeholder="The Greggory Systems And Strategy Firm" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[9px] font-bold outline-none focus:ring-1 focus:ring-teal-500" />
              </div>
              <div>
                 <label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Public Contact Email</label>
                 <input type="email" value={form.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} placeholder="contact@greggoryfirm.com" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[9px] font-bold outline-none focus:ring-1 focus:ring-teal-500" />
              </div>
              <div>
                 <label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Public Contact Phone</label>
                 <input type="text" value={form.contact_phone || ""} onChange={(e) => set("contact_phone", e.target.value)} placeholder="+254 …" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[9px] font-bold outline-none focus:ring-1 focus:ring-teal-500" />
              </div>
           </div>
        </section>

        {/* Security Protocols — every toggle persists */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xl">
           <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-3 mb-4">
              <Shield size={14} /><h4 className="text-[9px] font-black uppercase tracking-widest">Security Protocols</h4>
           </div>
           <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="flex items-center gap-1.5">
                    <Timer size={11} className="text-slate-400" />
                    <p className="text-[8px] font-black text-slate-600 uppercase">Session Auto-Term</p>
                 </div>
                 <Toggle on={timeoutOn} onClick={() => set("admin_session_timeout", timeoutOn ? "0" : (form.admin_session_timeout && form.admin_session_timeout !== "0" ? form.admin_session_timeout : "60"))} />
              </div>
              {timeoutOn && (
                 <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-100">
                    <p className="text-[7px] font-black text-slate-400 uppercase">Auto-logout after (minutes)</p>
                    <input type="number" min="10" max="720" step="5" value={form.admin_session_timeout || ""} onChange={(e) => set("admin_session_timeout", e.target.value)} className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[9px] font-black text-center outline-none focus:ring-1 focus:ring-teal-500" />
                 </div>
              )}
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="flex items-center gap-1.5">
                    <Wrench size={11} className="text-slate-400" />
                    <p className="text-[8px] font-black text-slate-600 uppercase">Maintenance Mode</p>
                 </div>
                 <Toggle on={toBool(form.maintenance_mode)} onClick={() => toggleKey("maintenance_mode")} />
              </div>
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="flex items-center gap-1.5">
                    <Users size={11} className="text-slate-400" />
                    <p className="text-[8px] font-black text-slate-600 uppercase">Public Registration</p>
                 </div>
                 <Toggle on={toBool(form.allow_registration)} onClick={() => toggleKey("allow_registration")} />
              </div>
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="flex items-center gap-1.5">
                    <Moon size={11} className="text-slate-400" />
                    <p className="text-[8px] font-black text-slate-600 uppercase">Deep Space Mode</p>
                 </div>
                 <Toggle on={toBool(form.deep_space_mode)} onClick={() => toggleKey("deep_space_mode")} />
              </div>
              <p className="text-[6px] font-bold text-slate-300 uppercase tracking-widest px-1 pt-1">Toggle changes take effect after you press Commit Changes.</p>
           </div>
        </section>

        {/* Mission Controls — every button performs a real task */}
        <section className="bg-[#0f172a] rounded-2xl p-5 border border-white/5 shadow-2xl flex flex-col">
           <div className="flex items-center gap-2 text-teal-400 border-b border-white/5 pb-3 mb-4">
              <Power size={14} /><h4 className="text-[9px] font-black uppercase tracking-widest">Mission Controls</h4>
           </div>
           <div className="space-y-2 flex-1">
              <button onClick={runCalibration} disabled={calibrating} className="w-full py-2 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[7px] font-black uppercase tracking-widest border border-white/5 transition-all disabled:opacity-50">
                 {calibrating ? <Loader2 size={11} className="animate-spin" /> : <Activity size={11} />} {calibrating ? "Calibrating…" : "Run System Calibration"}
              </button>
              <button onClick={clearCache} disabled={clearing} className="w-full py-2 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[7px] font-black uppercase tracking-widest border border-white/5 transition-all disabled:opacity-50">
                 {clearing ? <Loader2 size={11} className="animate-spin" /> : <Eraser size={11} />} {clearing ? "Purging…" : "Clear System Cache"}
              </button>
              <button onClick={toggleLockdown} disabled={locking} className={`w-full py-2 flex items-center justify-center gap-1.5 rounded-lg text-[7px] font-black uppercase tracking-widest border transition-all disabled:opacity-50 ${lockdownOn ? "bg-rose-600 text-white border-rose-500 hover:bg-rose-700" : "bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border-rose-600/20"}`}>
                 {locking ? <Loader2 size={11} className="animate-spin" /> : <Lock size={11} />} {lockdownOn ? "Lift Hub Lockdown" : "Emergency Hub Lockdown"}
              </button>
           </div>
           {system && (
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1">
                 <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest">Node: {system.node} · {String(system.env).toUpperCase()}</p>
                 <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest">Uptime {Math.floor((system.uptimeSeconds || 0) / 60)}m · RSS {system.rssMb}MB</p>
              </div>
           )}
        </section>
      </div>

      {/* Calibration report — generated by Run System Calibration, persisted on the node */}
      <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xl">
         <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-slate-900">
               <Activity size={14} /><h4 className="text-[9px] font-black uppercase tracking-widest">Last Calibration Report</h4>
            </div>
            {calibration && (
               <span className={`px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-widest ${calibration.status === "healthy" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}>
                  {String(calibration.status).toUpperCase()}
               </span>
            )}
         </div>
         {calibration ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">DB Latency</p><p className="text-sm font-black text-slate-900">{calibration.db_latency_ms} ms</p></div>
               <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">DB Tables</p><p className="text-sm font-black text-slate-900">{calibration.tables}</p></div>
               <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Memory (RSS / Heap)</p><p className="text-sm font-black text-slate-900">{calibration.rss_mb} / {calibration.heap_mb} MB</p></div>
               <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Uptime / Node</p><p className="text-sm font-black text-slate-900">{Math.floor((calibration.uptime_seconds || 0) / 60)} min · {calibration.node}</p></div>
               <p className="col-span-2 md:col-span-4 text-[6px] font-black text-slate-300 uppercase tracking-widest px-1">Run at {new Date(calibration.ran_at).toLocaleString()} · DB host …{calibration.db_host}</p>
            </div>
         ) : (
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest py-4 text-center">No calibration has been run yet — press “Run System Calibration” to generate a live node report.</p>
         )}
      </section>

      <footer className="pt-10 pb-20 flex flex-col items-center opacity-30">
         <p className="text-[6px] font-black text-slate-400 uppercase tracking-[0.8em]">Calibration Mode V.0.7.2</p>
      </footer>
    </div>
  );
}

export default Settings;
