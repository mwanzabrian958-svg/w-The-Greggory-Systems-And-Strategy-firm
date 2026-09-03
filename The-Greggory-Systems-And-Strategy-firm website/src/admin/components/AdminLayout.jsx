import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut, Search, Bell, X, ChevronRight, HelpCircle,
  Home, Users, FolderKanban, Calculator, Building2,
  Briefcase, MessageSquare, LifeBuoy, BarChart3, ShieldCheck, Activity, ClipboardList,
  FileText
} from "lucide-react";
import { apiCall } from "../../services/api";
import { getNavigationItems } from "../utils/permissions";
import SearchBlock from "../../components/SearchBlock";
import { NotificationBell } from "./NotificationBell";

const ICON_MAP = {
  Home, Users, FolderKanban, Calculator, Building2,
  Briefcase, MessageSquare, LifeBuoy, BarChart3, ShieldCheck, Activity, ClipboardList,
  FileText, Search, Bell, LogOut, X, ChevronRight, HelpCircle
};

function AdminLayout({ user, children, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [imageError, setImagePhotoError] = useState(false);

  const navItems = getNavigationItems(user);
  const displayName = user?.display_name || user?.name || (user?.first_name ? `${user.first_name} ${user.last_name}` : "Admin");
  const initials = displayName.split(" ").map(s => s ? s[0] : "").filter(Boolean).slice(0, 2).join("").toUpperCase();

  const IconComponent = ({ name, ...props }) => {
    const Icon = ICON_MAP[name] || HelpCircle;
    return <Icon {...props} />;
  };

  useEffect(() => {
    if (user?.id) {
      const role = user.role === 'developer' ? 'developer' : 'admin';
      setProfilePhotoUrl(`/api/admin/profile-photo/${role}/${user.id}?v=${Date.now()}`);
      setImagePhotoError(false);
    }
  }, [user]);

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    else { sessionStorage.clear(); localStorage.clear(); navigate("/admin/login", { replace: true }); }
  };

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin' || location.pathname === '/admin/';
    return location.pathname.startsWith(path);
  };

  const isDashboard = location.pathname === '/admin' || location.pathname === '/admin/';
  const activeNavItem = navItems.find(item => isActive(item.path) && item.path !== '/admin');
  const workstationLabel = activeNavItem ? activeNavItem.label : "Management";

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col overflow-hidden">
      <header className="bg-[#0f172a] border-b border-white/10 sticky top-0 z-50 flex-shrink-0 shadow-2xl">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/admin')}>
             <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white font-black text-lg border border-white/10 shadow-lg">GS</div>
             <div className="hidden md:block">
                <p className="text-sm font-bold text-white leading-none uppercase tracking-tighter">Greggory Systems</p>
                <p className="text-[7px] text-teal-400 font-black uppercase tracking-[0.3em] mt-1.5">Management Portal</p>
             </div>
          </div>

          <div className="flex-1 max-w-2xl mx-10">
            <SearchBlock
              endpoint="/api/admin/search"
              resultsBase="/admin/search"
              variant="admin"
              placeholder="Query system database..."
            />
          </div>

          <div className="flex items-center gap-6">
            <NotificationBell />
            <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-white leading-none">{displayName}</p>
                  <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest mt-1">Verified Node</p>
               </div>
               <div className="relative cursor-pointer" onClick={() => navigate('/admin/settings')}>
                  {!imageError && profilePhotoUrl ? (
                    <img src={profilePhotoUrl} alt={displayName} onError={() => setImagePhotoError(true)} className="w-10 h-10 rounded-full object-cover border-2 border-teal-500 shadow-lg" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs border border-white/10 shadow-lg">{initials}</div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full shadow-sm"></div>
               </div>
            </div>
            <button onClick={handleLogoutClick} className="p-2.5 text-slate-400 hover:text-rose-500 transition-colors" title="Logout"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <nav className="bg-[#0f172a] border-b border-white/5 sticky top-20 z-40 backdrop-blur-xl flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)} className={`flex items-center gap-3 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all group ${isActive(item.path) ? 'bg-teal-600 text-white shadow-2xl shadow-teal-900/30' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
              <IconComponent name={item.icon} size={14} className={isActive(item.path) ? 'text-white' : 'text-slate-600 group-hover:text-teal-400'} />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        {/* DASHBOARD VIEW */}
        {isDashboard ? (
          <div className="max-w-[1600px] mx-auto px-6 py-10">
            {children}
          </div>
        ) : (
          /* FULL-PAGE OPERATIONAL WORKSTATION */
          <div className="fixed inset-0 bg-white z-[1000] flex flex-col animate-in fade-in duration-200">
            {/* Workstation Navbar - Edge to Edge */}
            <div className="bg-[#0f172a] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shadow-xl flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white font-black text-lg border border-white/10 shadow-lg">GS</div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter leading-none">{workstationLabel}</h2>
                  <p className="text-[8px] text-teal-400 font-black uppercase tracking-[0.4em] mt-1.5">Operational Workstation Active</p>
                </div>
              </div>

              {/* Global Search — Persistent in Workstation */}
              <div className="flex-1 max-w-xl mx-8 hidden md:block">
                <SearchBlock
                  endpoint="/api/admin/search"
                  resultsBase="/admin/search"
                  variant="admin"
                  placeholder={`Search ${workstationLabel.toLowerCase()}...`}
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden lg:flex flex-col text-right mr-4 border-r border-white/10 pr-6">
                   <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Session Status</p>
                   <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">SECURE RELAY</p>
                </div>
                <button
                  onClick={() => navigate('/admin')}
                  className="p-2.5 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl border border-white/10 transition-all group shadow-xl active:scale-95"
                  title="Close Workstation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Workstation Content - Full Screen Edge-to-Edge */}
            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
               {/* MAIN CONTENT AREA: 100% WIDTH */}
               <div className="w-full p-8 lg:p-12">
                  {children}
               </div>
            </div>

            {/* Terminal Status Bar */}
            <div className="bg-[#0f172a] h-8 border-t border-white/5 flex items-center px-6 justify-between flex-shrink-0">
               <p className="text-[6px] font-black text-slate-500 uppercase tracking-[0.4em]">Property of Greggory Systems & Strategy Firm © {new Date().getFullYear()}</p>
               <p className="text-[6px] font-black text-slate-700 uppercase tracking-[0.6em]">SECURE ARCHITECTURE v4.0</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminLayout;
