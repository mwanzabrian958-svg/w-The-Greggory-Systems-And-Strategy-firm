import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../services/api";
import { Filter, UserPlus, Shield, User, CheckCircle, Download, MoreVertical, ChevronLeft, ChevronRight, RefreshCw, Users as UsersIcon, Trash2, AlertCircle, Activity } from "lucide-react";

export function Users({ user }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const sessionStr = sessionStorage.getItem("gf_admin_session") || localStorage.getItem("gf_admin_session");
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      const data = await apiCall("/users", { headers: { Authorization: `Bearer ${session?.token}` } });
      if (data.success) setUsers(data.users || []);
    } catch (error) { console.error("User Sync Failure:", error); } finally { setLoading(false); }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const roleType = deletingUser.source_table || 'client';
      const data = await apiCall(`/admin/users/${deletingUser.id}?role_type=${roleType}`, { method: "DELETE" });
      if (data.success) {
        setUsers(users.filter(u => !(u.id === deletingUser.id && u.source_table === deletingUser.source_table)));
        setShowDeleteModal(false);
      }
    } catch (error) { console.error("Deletion failure:", error); } finally { setIsDeleting(false); setDeletingUser(null); }
  };

  const navigateToDetail = (u) => {
    const role = u.source_table || 'client';
    navigate(`/admin/users/detail/${u.id}/${role}`);
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter || u.source_table === roleFilter;
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" && u.is_active) || (statusFilter === "inactive" && !u.is_active);
    return matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading && users.length === 0) return (
    <div className="flex flex-col items-center justify-center py-40">
       <RefreshCw className="animate-spin text-teal-600 w-8 h-8" />
       <p className="mt-4 text-[7px] font-black text-slate-400 uppercase tracking-[0.6em]">Polling Identity Nodes...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Identity Hub</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Personnel Node Control</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-black text-[7px] uppercase tracking-widest hover:bg-slate-200 transition-colors">
            <Download size={12} /> Export
          </button>
          <button onClick={() => navigate('/admin/users/manage')} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 text-white font-black text-[7px] uppercase tracking-widest shadow-md hover:bg-teal-700 border border-teal-400/20">
            <UserPlus size={12} /> Add Personnel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Assets", value: users.length, icon: UsersIcon, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Live Now", value: users.filter(u => u.last_active_at && (new Date() - new Date(u.last_active_at)) < 300000).length, icon: Activity, color: "text-rose-500", bg: "bg-rose-50" },
          { label: "Active Nodes", value: users.filter(u => u.is_active).length, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Admins", value: users.filter(u => u.source_table === "admin").length, icon: Shield, color: "text-purple-500", bg: "bg-purple-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-3 border border-slate-100 shadow-md flex items-center justify-between">
            <div>
              <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className="text-lg font-black text-slate-900">{stat.value}</p>
            </div>
            <div className={`${stat.bg} p-2 rounded-lg ${stat.color}`}><stat.icon size={14} /></div>
          </div>
        ))}
      </div>

      <div className="bg-[#0f172a] rounded-xl p-4 border border-white/10 shadow-xl flex justify-between items-center">
         <div className="flex items-center gap-3 text-teal-400"><Filter size={14} /><span className="text-[8px] font-black uppercase tracking-widest">Filters</span></div>
         <div className="flex gap-3">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[8px] font-black uppercase text-white outline-none">
              <option value="all" className="bg-[#0f172a]">All Roles</option>
              <option value="admin" className="bg-[#0f172a]">Admins</option>
              <option value="client" className="bg-[#0f172a]">Clients</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[8px] font-black uppercase text-white outline-none">
              <option value="all" className="bg-[#0f172a]">All Status</option>
              <option value="active" className="bg-[#0f172a]">Active</option>
              <option value="inactive" className="bg-[#0f172a]">Inactive</option>
            </select>
         </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {paginatedUsers.length > 0 ? paginatedUsers.map((u) => {
          const isOnline = u.last_active_at && (new Date() - new Date(u.last_active_at)) < 300000;
          return (
            <div key={`${u.source_table}-${u.id}`} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-md hover:scale-[1.03] transition-all group flex flex-col cursor-pointer" onClick={() => navigateToDetail(u)}>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-[#0f172a] flex items-center justify-center text-white font-black text-sm">{(u.display_name || u.name || "U")[0]}</div>
                  {isOnline && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-slate-900 text-[10px] uppercase truncate group-hover:text-teal-600">{u.display_name || u.name}</h4>
                  <p className="text-[7px] text-slate-400 font-bold uppercase truncate">{u.email}</p>
                  {u.phone_number && <p className="text-[6.5px] text-teal-600 font-black uppercase mt-0.5 tracking-tighter">{u.phone_number}</p>}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                 <div className="flex justify-between items-center px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[6px] font-black uppercase tracking-widest text-slate-400">Node</span>
                    <span className="text-[7px] font-black uppercase text-slate-900">{u.role || u.primary_role || 'User'}</span>
                 </div>
                 <div className="flex justify-between items-center px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[6px] font-black uppercase tracking-widest text-slate-400">Status</span>
                    <span className={`text-[7px] font-black uppercase ${isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>{isOnline ? 'Live Now' : 'Standby'}</span>
                 </div>
              </div>

              <div className="mt-auto pt-3 border-t border-slate-50 flex gap-2">
                 <button onClick={(e) => { e.stopPropagation(); navigateToDetail(u); }} className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-black transition-all">Analyze</button>
                 <button onClick={(e) => { e.stopPropagation(); setDeletingUser(u); setShowDeleteModal(true); }} className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={12} /></button>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
             <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">No Authorized Nodes Detected</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 pb-12">
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all"><ChevronLeft size={14} /></button>
          <div className="px-4 py-2 bg-[#0f172a] rounded-xl text-[8px] font-black text-white uppercase tracking-widest border border-white/10">Page {currentPage} / {totalPages}</div>
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all"><ChevronRight size={14} /></button>
        </div>
      )}

      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[600] flex items-center justify-center p-4 font-sans">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-5 text-rose-500 mx-auto border border-rose-100"><AlertCircle size={24} /></div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter text-center mb-1">Terminate User Node?</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center mb-8">Confirming deletion: <span className="text-slate-900">{deletingUser.display_name}</span></p>
              <div className="flex gap-3">
                 <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-600 transition-all">Abort</button>
                 <button onClick={handleDeleteUser} disabled={isDeleting} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                    {isDeleting ? <RefreshCw className="animate-spin" size={10} /> : <Trash2 size={10} />} Terminate
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
