import React from "react";

export function Dashboard({ user }) {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome, {user?.display_name || user?.name || "Administrator"}</h1>
      <p className="text-slate-600">Admin dashboard content has been removed as requested.</p>
    </div>
  );
}