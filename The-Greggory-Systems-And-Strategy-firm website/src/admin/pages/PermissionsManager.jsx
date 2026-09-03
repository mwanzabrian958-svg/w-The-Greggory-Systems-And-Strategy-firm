import React, { useState, useEffect } from "react";
import { apiCall } from "../../services/api";
import { Shield, Check, RefreshCw, Save, CheckCircle2, AlertTriangle } from "lucide-react";

// Every permission toggled here is persisted in the `admin_settings` table as
// `role_permissions_<level>` keys and ENFORCED in the sidebar navigation
// (see src/admin/utils/permissions.js).
const PERMISSIONS = [
  { key: "VIEW_USERS", label: "View Users", category: "User Management" },
  { key: "MANAGE_USERS", label: "Create/Edit Users", category: "User Management" },
  { key: "VIEW_PROJECTS", label: "View Projects", category: "Projects" },
  { key: "MANAGE_PROJECTS", label: "Create/Edit Projects", category: "Projects" },
  { key: "VIEW_APPLICATIONS", label: "View Applications", category: "Projects" },
  { key: "VIEW_FINANCIAL", label: "View Financials", category: "Billing" },
  { key: "MANAGE_INVOICES", label: "Create/Edit Invoices", category: "Billing" },
  { key: "VIEW_CONTENT", label: "Manage Blog & Personnel", category: "Content" },
  { key: "VIEW_SUPPORT", label: "View Support", category: "Support" },
  { key: "VIEW_SECURITY", label: "View Security Logs", category: "Security" },
  { key: "VIEW_REPORTS", label: "View Reports", category: "Reports" },
  { key: "VIEW_SETTINGS", label: "Manage Settings", category: "Settings" },
  { key: "VIEW_ACTIVITY_LOGS", label: "View Activity Logs", category: "Logs" },
  { key: "MANAGE_TEAM", label: "Manage Team", category: "Team" },
  { key: "VIEW_DATA_SAFETY", label: "View Data Safety", category: "Security" },
];

const DEFAULT_ROLES = [
  { name: "Super Admin", level: "super", permissions: PERMISSIONS.map(p => p.key) },
  { name: "Admin", level: "admin", permissions: ["VIEW_USERS", "MANAGE_USERS", "VIEW_PROJECTS", "MANAGE_PROJECTS", "VIEW_APPLICATIONS", "VIEW_FINANCIAL", "MANAGE_INVOICES", "VIEW_CONTENT", "VIEW_SUPPORT", "VIEW_REPORTS", "VIEW_SETTINGS", "VIEW_ACTIVITY_LOGS", "MANAGE_TEAM", "VIEW_DATA_SAFETY"] },
  { name: "Manager", level: "manager", permissions: ["VIEW_USERS", "VIEW_PROJECTS", "VIEW_APPLICATIONS", "VIEW_FINANCIAL", "VIEW_CONTENT", "VIEW_SUPPORT", "VIEW_REPORTS", "VIEW_ACTIVITY_LOGS"] },
  { name: "Viewer", level: "viewer", permissions: ["VIEW_PROJECTS", "VIEW_APPLICATIONS", "VIEW_REPORTS"] },
];

export function PermissionsManager() {
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedRole, setSavedRole] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [dirty, setDirty] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await apiCall("/admin/settings");
        const settings = res?.settings || {};
        setRoles(DEFAULT_ROLES.map(r => {
          const raw = settings[`role_permissions_${r.level}`];
          if (!raw) return r;
          try {
            const perms = JSON.parse(raw);
            return Array.isArray(perms) ? { ...r, permissions: perms } : r;
          } catch { return r; }
        }));
      } catch (e) { console.error("Failed to load role permissions:", e); }
      finally { setLoading(false); }
    })();
  }, []);

  const persistRole = async (level, permissions) => {
    setSaveError(null);
    try {
      const res = await apiCall("/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ [`role_permissions_${level}`]: JSON.stringify(permissions) })
      });
      if (res?.success) {
        setSavedRole(level);
        setDirty(d => ({ ...d, [level]: false }));
        // Refresh the nav-enforcement cache immediately
        try {
          const cached = JSON.parse(localStorage.getItem("gf_role_permissions") || "{}");
          cached[level] = permissions;
          localStorage.setItem("gf_role_permissions", JSON.stringify(cached));
        } catch { /* cache refresh is best-effort */ }
        setTimeout(() => setSavedRole(null), 2000);
      } else {
        setSaveError(`Failed to save ${level} permissions`);
      }
    } catch (e) {
      console.error(e);
      setSaveError(`Failed to save ${level} permissions`);
    }
  };

  const togglePermission = (roleIdx, permKey) => {
    const next = [...roles];
    const r = { ...next[roleIdx] };
    r.permissions = r.permissions.includes(permKey)
      ? r.permissions.filter(p => p !== permKey)
      : [...r.permissions, permKey];
    next[roleIdx] = r;
    setRoles(next);
    setDirty(d => ({ ...d, [r.level]: true }));
    persistRole(r.level, r.permissions);
  };

  const categories = [...new Set(PERMISSIONS.map(p => p.category))];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <RefreshCw className="animate-spin text-teal-600 w-8 h-8" />
      <p className="mt-4 text-[7px] font-black text-slate-400 uppercase tracking-[0.6em]">Loading Role Matrix...</p>
    </div>
  );


  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Roles & Permissions</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Saved to database — controls each role's sidebar access</p>
        </div>
        {saveError && (
          <div className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl px-4 py-2">
            <AlertTriangle size={12} /><span className="text-[8px] font-black uppercase tracking-widest">{saveError}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((role, roleIdx) => (
          <div key={role.level} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-teal-600" />
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{role.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                {dirty[role.level] && (
                  <span className="flex items-center gap-1 text-[6px] font-black text-amber-500 uppercase tracking-widest"><Save size={9} /> Saving…</span>
                )}
                {savedRole === role.level && (
                  <span className="flex items-center gap-1 text-[6px] font-black text-emerald-600 uppercase tracking-widest"><CheckCircle2 size={9} /> Saved to DB</span>
                )}
                <button onClick={() => setEditing(editing === roleIdx ? null : roleIdx)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <Check size={12} className={editing === roleIdx ? "text-teal-600" : ""} />
                </button>
              </div>
            </div>
            {editing === roleIdx ? (
              <div className="space-y-3">
                {categories.map(cat => (
                  <div key={cat}>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">{cat}</p>
                    <div className="flex flex-wrap gap-1">
                      {PERMISSIONS.filter(p => p.category === cat).map(perm => (
                        <button key={perm.key} onClick={() => togglePermission(roleIdx, perm.key)}
                          className={`text-[6px] font-black uppercase px-2 py-1 rounded-full transition-all ${
                            role.permissions.includes(perm.key)
                              ? "bg-teal-50 text-teal-600 border border-teal-200"
                              : "bg-slate-50 text-slate-400 border border-slate-200 hover:border-slate-300"
                          }`}>{perm.label}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {role.permissions.length === 0 && (
                  <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">No permissions granted</p>
                )}
                {role.permissions.map(p => {
                  const perm = PERMISSIONS.find(pp => pp.key === p);
                  return perm ? (
                    <span key={p} className="text-[6px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-200">
                      {perm.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
