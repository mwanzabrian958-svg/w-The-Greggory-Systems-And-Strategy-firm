import React from "react";

export function Dashboard({ user }) {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Welcome, {user?.display_name || user?.name || "Administrator"}</h1>
      <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">Command Center Synchronized</p>
    </div>
  );
}