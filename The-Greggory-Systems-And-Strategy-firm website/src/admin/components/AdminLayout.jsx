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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const navItems = getNavigationItems(user);
  const displayName = user?.display_name || user?.name || (user?.first_name ? `${user.first_name} ${user.last_name}` : "Admin");
  const initials = displayName.split(" ").map(s => s ? s[0] : "").filter(Boolean).slice(0, 2).join("").toUpperCase();

  const IconComponent = ({ name, ...props }) => {
    const Icon = ICON_MAP[name] || HelpCircle;
    return <Icon {...props} />;
  };

  useEffect(() => {
    const handleClickOutside = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const data = await apiCall(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
          if (data.success) { setSearchResults(data.results || []); setShowResults(true); }
        } catch (e) { console.error("Search failure", e); } finally { setIsSearching(false); }
      } else { setSearchResults([]); setShowResults(false); }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowResults(false);
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
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

          <div className="flex-1 max-w-2xl mx-10 relative" ref={searchRef}>
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isSearching ? 'text-teal-400 animate-pulse' : 'text-slate-500'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                placeholder="Query system database..."
                className="w-full pl-12 pr-10 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-[#1e293b] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, idx) => (
                      <button key={`${result.id}-${idx}`} onClick={() => { navigate(result.link); setShowResults(false); setSearchQuery(""); }} className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl text-left border-b border-white/5 last:border-0 transition-all group">
                        <div className="bg-teal-500/10 p-2 rounded-lg group-hover:bg-teal-500/20"><IconComponent name={result.type === 'user' ? 'Users' : 'FolderKanban'} size={18} className="text-teal-400" /></div>
                        <div><p className="text-sm font-bold text-white leading-tight">{result.title}</p><p className="text-[9px] font-black text-slate-500 uppercase mt-1">{result.subtitle}</p></div>
                      </button>
                    ))
                  ) : <div className="p-10 text-center text-slate-600 uppercase font-black text-[9px] tracking-widest">No Nodes Found</div>}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/admin/activity')} className="p-2 text-slate-400 hover:text-white rounded-xl transition-all relative group"><Bell className="h-5 w-5" /><span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0f172a]"></span></button>
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
               {/* Internal Branding Strip */}
               <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className="text-teal-600 text-lg font-black uppercase tracking-tighter">Greggory Systems <span className="text-slate-400 font-medium">| Personnel Terminal</span></div>
                  </div>
                  <div className="flex items-center gap-3">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Node ID: {user?.id || 'MASTER'}</p>
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
               </div>

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
