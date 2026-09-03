import React, { useState } from "react";
import { Shield, Check, X, Edit2 } from "lucide-react";

const PERMISSIONS = [
  { key: "VIEW_USERS", label: "View Users", category: "User Management" },
  { key: "MANAGE_USERS", label: "Create/Edit Users", category: "User Management" },
  { key: "VIEW_PROJECTS", label: "View Projects", category: "Projects" },
  { key: "MANAGE_PROJECTS", label: "Create/Edit Projects", category: "Projects" },
  { key: "VIEW_FINANCIAL", label: "View Financials", category: "Billing" },
  { key: "MANAGE_INVOICES", label: "Create/Edit Invoices", category: "Billing" },
  { key: "VIEW_CRM", label: "View CRM", category: "CRM" },
  { key: "VIEW_CONTENT", label: "Manage Content", category: "Content" },
  { key: "VIEW_SUPPORT", label: "View Support", category: "Support" },
  { key: "VIEW_SECURITY", label: "View Security Logs", category: "Security" },
  { key: "VIEW_REPORTS", label: "View Reports", category: "Reports" },
  { key: "VIEW_SETTINGS", label: "Manage Settings", category: "Settings" },
  { key: "VIEW_ACTIVITY_LOGS", label: "View Activity Logs", category: "Logs" },
  { key: "MANAGE_TEAM", label: "Manage Team", category: "Team" },
  { key: "VIEW_DATA_SAFETY", label: "View Data Safety", category: "Security" },
];

const ROLES = [
  { name: "Super Admin", level: "super", permissions: PERMISSIONS.map(p => p.key) },
  { name: "Admin", level: "admin", permissions: ["VIEW_USERS", "MANAGE_USERS", "VIEW_PROJECTS", "MANAGE_PROJECTS", "VIEW_FINANCIAL", "MANAGE_INVOICES", "VIEW_CRM", "VIEW_CONTENT", "VIEW_SUPPORT", "VIEW_REPORTS", "VIEW_SETTINGS", "VIEW_ACTIVITY_LOGS", "MANAGE_TEAM", "VIEW_DATA_SAFETY"] },
  { name: "Manager", level: "manager", permissions: ["VIEW_USERS", "VIEW_PROJECTS", "VIEW_FINANCIAL", "VIEW_CRM", "VIEW_CONTENT", "VIEW_SUPPORT", "VIEW_REPORTS", "VIEW_ACTIVITY_LOGS"] },
  { name: "Viewer", level: "viewer", permissions: ["VIEW_PROJECTS", "VIEW_CRM", "VIEW_REPORTS"] },
];

export function PermissionsManager() {
  const [roles, setRoles] = useState(ROLES);
  const [editing, setEditing] = useState(null);

  const togglePermission = (roleIdx, permKey) => {
    const next = [...roles];
    const r = { ...next[roleIdx] };
    r.permissions = r.permissions.includes(permKey)
      ? r.permissions.filter(p => p !== permKey)
      : [...r.permissions, permKey];
    next[roleIdx] = r;
    setRoles(next);
  };

  const categories = [...new Set(PERMISSIONS.map(p => p.category))];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Roles & Permissions</h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Manage what each role can access</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((role, roleIdx) => (
          <div key={role.level} className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-teal-600" />
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{role.name}</h3>
              </div>
              <button onClick={() => setEditing(editing === roleIdx ? null : roleIdx)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <Edit2 size={12} />
              </button>
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
                              : "bg-slate-50 text-slate-400 border border-slate-200"
                          }`}>{perm.label}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
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
