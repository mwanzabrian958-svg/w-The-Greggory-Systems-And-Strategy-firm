import { useState, useEffect } from "react";
import {
  Bell,
  X,
  RefreshCw,
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  DollarSign,
  FileText,
  BarChart3,
  HelpCircle,
  AlertCircle,
  Clock,
  CheckCircle,
  ShieldAlert,
  Terminal,
  Search,
  Download
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getApiUrl } from "../services/api";
import SearchBlock from "../components/SearchBlock";
import { useNavigate } from "react-router-dom";

const ClientAlerts = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const authFetch = async (url, options = {}, timeoutMs = 15000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token || ''}`,
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.status === 401 || res.status === 403) {
        logout();
        navigate('/login', { replace: true });
        throw new Error('Session expired');
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') throw new Error('Request timed out');
      throw err;
    }
  };

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { id: "overview", label: "Home", icon: LayoutDashboard, path: '/client-portal' },
    { id: "projects", label: "Projects", icon: Briefcase, path: '/client-portal' },
    { id: "billing", label: "Billing", icon: DollarSign, path: '/client-portal' },
    { id: "notifications", label: "Alerts", icon: Bell, path: '/client-alerts' },
    { id: "reports", label: "Reports", icon: BarChart3, path: '/client-reports' },
    { id: "feedback", label: "Help", icon: HelpCircle, path: '/client-portal' },
  ];

  const loadAlerts = async (retries = 2) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authFetch(getApiUrl('/api/users/notifications/me'));
      if (!response.ok) throw new Error(`Server error (${response.status})`);
      const data = await response.json();
      if (data.success) setAlerts(data.notifications || []);
      else throw new Error(data.message || 'Failed to load alerts');
    } catch (err) {
      console.error('Alerts load failed:', err);
      if (retries > 0) {
        setTimeout(() => loadAlerts(retries - 1), 1500);
        return;
      }
      setError(err.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadAlerts();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await authFetch(getApiUrl(`/api/users/notifications/${id}/read`), {
        method: 'PUT',
      });
      loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900">
      <RefreshCw className="animate-spin text-teal-600 w-6 h-6 mb-2" />
      <p className="text-[10px] font-bold uppercase tracking-widest">Scanning Protocols...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900 p-4">
      <AlertCircle className="text-rose-500 w-8 h-8 mb-3" />
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Connection Failed</p>
      <p className="text-[8px] text-slate-400 mb-4 text-center max-w-md">{error}</p>
      <button onClick={() => loadAlerts()} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-teal-500 transition-all">
        Retry
      </button>
    </div>
  );

  const filteredAlerts = alerts.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen pt-10 px-4 pb-8 font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      <div className="max-w-6xl mx-auto">

        {/* GLOBAL SYSTEM SEARCH */}
        <div className="mb-3 flex justify-end">
          <div className="w-full sm:w-72 md:w-96">
            <SearchBlock endpoint="/api/users/search" resultsBase="/client-search" variant="client" placeholder="Search workspace…" />
          </div>
        </div>

        {/* NAV */}
        <nav className="mb-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/95 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center justify-between gap-1 py-1 overflow-x-auto no-scrollbar">
            <div className="flex gap-0.5">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all border ${item.id === 'notifications' ? "bg-teal-600 text-white border-teal-500" : "bg-transparent text-slate-500 dark:text-slate-300 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  <item.icon size={11} />
                  <span className="text-[8px] font-bold uppercase">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-lg">
                {user?.id || user?.userId ? (
                  <img
                    src={getApiUrl(`/api/users/profile-photo/${user.id || user.userId}`)}
                    alt="User"
                    className="w-5 h-5 rounded-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div
                  className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-[8px] font-bold"
                  style={{ display: (user?.id || user?.userId) ? 'none' : 'flex' }}
                >
                  {(user?.display_name || "U")[0]}
                </div>
                <p className="text-[8px] font-bold hidden sm:block truncate max-w-[60px] text-slate-900 dark:text-white">{user?.display_name || "User"}</p>
              </div>
              <button onClick={() => navigate('/')} className="p-1 bg-slate-50 dark:bg-slate-800 hover:bg-rose-600/20 rounded-lg transition-all"><X size={12} /></button>
            </div>
          </div>
        </nav>

        {/* CONTENT */}
        <div className="space-y-4 animate-fade-in">

          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
               <div className={`p-2 rounded-lg ${darkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-500/10 text-rose-600'}`}><Bell size={16} /></div>
               <h2 className={`text-[11px] font-bold uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-900'}`}>Security & System Alerts</h2>
            </div>
            <div className="flex gap-1.5 items-center">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={10} />
                <input
                  type="text"
                  placeholder="Search Alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-6 pr-2 py-1 text-[8px] font-bold outline-none w-32 focus:border-rose-500/50 text-slate-900 dark:text-white"
                />
              </div>
              <button onClick={loadAlerts} className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"><RefreshCw size={12} className="text-slate-500 dark:text-slate-400" /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {/* HEADERS */}
            <div className="px-4 py-2 flex items-center justify-between text-[7px] font-black uppercase tracking-[0.3em] text-slate-600">
               <span className="w-32">Timestamp</span>
               <span className="flex-1 px-4">Event Description</span>
               <span className="w-24 text-right">Priority</span>
            </div>

            {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => (
              <div key={alert.id} className={`bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-rose-500/30 transition-all group ${alert.status === 'unread' ? 'border-l-2 border-l-rose-500' : ''}`}>
                <div className="w-32">
                   <p className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase">{new Date(alert.created_at).toLocaleString([], {dateStyle:'short', timeStyle:'short'})}</p>
                </div>

                <div className="flex-1 px-4 flex flex-col gap-3">
                   <div className="flex items-center gap-3">
                       <div className={`p-1.5 rounded-lg ${alert.status === 'unread' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-slate-500/10 text-slate-500 dark:text-slate-400'}`}>
                           {alert.type === 'system' ? <ShieldAlert size={12} /> : <Terminal size={12} />}
                       </div>
                       <div>
                           <h4 className={`text-[10px] font-bold uppercase tracking-tight ${alert.status === 'unread' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-300'}`}>{alert.title}</h4>
                           <p className="text-[8px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{alert.message}</p>
                       </div>
                    </div>

                   {/* MEDIA PAYLOAD DISPLAY */}
                   {alert.attachment_type && (
                     <div className="ml-8 mt-2 max-w-sm">
                        {alert.attachment_type.startsWith('image/') ? (
                          <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                             <img
                               src={getApiUrl(`/api/users/notifications/${alert.id}/attachment?token=${user?.token}`)}
                               alt="Transmission Payload"
                               className="w-full h-auto max-h-40 object-cover opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                               onClick={async () => {
                                 window.open(getApiUrl(`/api/users/notifications/${alert.id}/attachment?token=${user?.token}`), '_blank');
                                 // Notify Admin
                                 try {
                                    await authFetch(getApiUrl('/api/users/client-feedback'), {
                                      method: 'POST',
                                      body: JSON.stringify({
                                        userId: user.userId || user.id,
                                        title: 'Media Alert Accessed',
                                        message: `User viewed media attachment in alert: "${alert.title}"`,
                                        type: 'service_feedback', priority: 'Low', rating: 5, author: 'client'
                                      })
                                   });
                                 } catch(e) {}
                               }}
                             />
                          </div>
                        ) : alert.attachment_type.startsWith('video/') ? (
                          <video
                            controls
                            onPlay={async () => {
                               try {
                                  await authFetch(getApiUrl('/api/users/client-feedback'), {
                                    method: 'POST',
                                    body: JSON.stringify({
                                      userId: user.userId || user.id,
                                      title: 'Video Alert Played',
                                      message: `User started video playback in alert: "${alert.title}"`,
                                      type: 'service_feedback', priority: 'Low', rating: 5, author: 'client'
                                    })
                                 });
                               } catch(e) {}
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 max-h-40"
                            src={getApiUrl(`/api/users/notifications/${alert.id}/attachment?token=${user?.token}`)}
                          />
                        ) : (
                           <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all group/file ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-rose-500/30'}`}>
                              <div className={`p-2 rounded-lg ${darkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-500/10 text-rose-600'}`}>
                                 <FileText size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className={`text-[9px] font-bold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{alert.attachment_name || 'Download Specification'}</p>
                                 <p className={`text-[7px] uppercase ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Secure Document Payload</p>
                              </div>
                              <Download size={14} className={`${darkMode ? 'text-slate-400 group-hover/file:text-slate-300' : 'text-slate-600 group-hover/file:text-slate-900'}`} />
                           </div>
                        )}
                     </div>
                   )}
                </div>

                 <div className="w-24 flex flex-col items-end gap-2">
                    <span className={`text-[6px] font-black uppercase px-1.5 py-0.5 rounded ${alert.priority === 'high' ? 'bg-rose-500 text-slate-900' : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                       {alert.priority || 'Normal'}
                    </span>
                    {alert.status === 'unread' && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className={`text-[7px] font-black uppercase transition-colors ${darkMode ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-500'}`}
                      >
                        Dismiss Node
                      </button>
                    )}
                 </div>
              </div>
            )) : (
              <div className={`col-span-full py-16 text-center rounded-xl border border-dashed ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-[9px] font-bold uppercase tracking-[0.3em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No security events logged in this cycle.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientAlerts;
