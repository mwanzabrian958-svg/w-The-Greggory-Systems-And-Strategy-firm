import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import {
  LogOut, Search, Bell, X, ChevronRight, HelpCircle,
  Home, Users, FolderKanban, Calculator, Building2,
  Briefcase, MessageSquare, LifeBuoy, BarChart3, ShieldCheck, Activity, ClipboardList
} from "lucide-react";
import { apiCall } from "../../services/api";
import { getNavigationItems } from "../utils/permissions";

/**
 * AdminLayout - Mission Control Framing
 */
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
  const displayName = user?.display_name || user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "Admin";
  const initials = displayName.split(" ").map(s => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  const IconComponent = ({ name, ...props }) => {
    const Icon = LucideIcons[name] || HelpCircle;
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
          const data = await apiCall(`/admin/search?q=${searchQuery}`);
          if (data.success) {
            setSearchResults(data.results || []);
            setShowResults(true);
          }
        } catch (e) {
          console.error("Search failure", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
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
      let role = user.role === "developer" || user.developer_level ? "developer" : "admin";
      setProfilePhotoUrl(`/api/admin/profile-photo/${role}/${user.id}?v=${Date.now()}`);
      setImagePhotoError(false);
    }
  }, [user]);

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    else {
      sessionStorage.clear(); localStorage.clear();
      navigate("/admin/login", { replace: true });
    }
  };

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin' || location.pathname === '/admin/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="bg-[#0f172a] border-b border-white/10 sticky top-0 z-50 flex-shrink-0 shadow-2xl">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="cursor-pointer group relative" onClick={() => navigate('/admin/settings')}>
              {!imageError && profilePhotoUrl ? (
                <img src={profilePhotoUrl} alt={displayName} onError={() => setImagePhotoError(true)} className="w-12 h-12 rounded-full object-cover border-2 border-teal-500 bg-slate-800 shadow-xl" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-white/20 shadow-xl">{initials}</div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#0f172a] rounded-full shadow-sm"></div>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-white leading-none">{displayName}</p>
              <p className="text-[9px] text-teal-400 font-black uppercase tracking-[0.2em] mt-1.5">{user?.role === 'developer' ? 'Technical Node' : 'Systems Admin'}</p>
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
                    <>
                      {searchResults.map((result, idx) => (
                        <button key={`${result.type}-${result.id}-${idx}`} onClick={() => { navigate(result.link); setShowResults(false); setSearchQuery(""); }} className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl text-left border-b border-white/5 last:border-0 transition-all group">
                          <div className="bg-teal-500/10 p-2 rounded-lg group-hover:bg-teal-500/20"><IconComponent name={result.type === 'user' ? 'Users' : result.type === 'project' ? 'FolderKanban' : result.type === 'task' ? 'CheckSquare' : 'Calculator'} size={18} className="text-teal-400" /></div>
                          <div><p className="text-sm font-bold text-white leading-tight">{result.title}</p><p className="text-[9px] font-black text-slate-500 uppercase mt-1">{result.subtitle}</p></div>
                        </button>
                      ))}
                      <button
                        onClick={() => { navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`); setShowResults(false); }}
                        className="w-full p-4 text-[9px] font-black text-teal-400 uppercase tracking-widest hover:bg-white/5 transition-all text-center border-t border-white/5"
                      >
                        Deep Scan Database for "{searchQuery}"
                      </button>
                    </>
                  ) : (
                    <div className="p-10 text-center text-slate-600 uppercase font-black text-[9px] tracking-widest">No Matches Found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/activity')} className="p-3 text-slate-400 hover:text-white rounded-2xl transition-all relative group"><Bell className="h-5 w-5 group-hover:scale-110 transition-transform" /><span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0f172a]"></span></button>
            <button onClick={handleLogoutClick} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white font-black text-[9px] uppercase tracking-widest border border-rose-600/20 shadow-xl shadow-rose-900/10 transition-all active:scale-95">
              <LogOut size={14} /> Logout
            </button>
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

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-[1600px] mx-auto px-6 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
