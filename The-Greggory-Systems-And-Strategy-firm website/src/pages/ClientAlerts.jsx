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
  Search
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../services/api";
import { useNavigate } from "react-router-dom";

const ClientAlerts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { id: "overview", label: "Home", icon: LayoutDashboard, path: '/client-portal' },
    { id: "projects", label: "Projects", icon: Briefcase, path: '/client-portal' },
    { id: "billing", label: "Billing", icon: DollarSign, path: '/client-portal' },
    { id: "notifications", label: "Alerts", icon: Bell, path: '/client-alerts' },
    { id: "reports", label: "Reports", icon: BarChart3, path: '/client-reports' },
    { id: "feedback", label: "Help", icon: HelpCircle, path: '/client-portal' },
  ];

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/users/notifications/me'), {
        headers: { Authorization: `Bearer ${user?.token || ''}` },
      });
      const data = await response.json();
      if (data.success) setAlerts(data.notifications || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadAlerts();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await fetch(getApiUrl(`/api/users/notifications/${id}/read`), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user?.token || ''}` },
      });
      loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
      <RefreshCw className="animate-spin text-teal-500 w-6 h-6 mb-2" />
      <p className="text-[10px] font-bold uppercase tracking-widest">Scanning Protocols...</p>
    </div>
  );

  const filteredAlerts = alerts.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-10 px-4 pb-8 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* NAV */}
        <nav className="mb-6 border-b border-white/5 bg-[#0f172a]/95 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center justify-between gap-1 py-1 overflow-x-auto no-scrollbar">
            <div className="flex gap-0.5">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all border ${item.id === 'notifications' ? "bg-teal-600 text-white border-teal-500" : "bg-transparent text-slate-500 border-transparent hover:bg-white/5"}`}
                >
                  <item.icon size={11} />
                  <span className="text-[8px] font-bold uppercase">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/5 px-1.5 py-0.5 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-[8px] font-bold">{(user?.display_name || "U")[0]}</div>
                <p className="text-[8px] font-bold hidden sm:block truncate max-w-[60px]">{user?.display_name || "User"}</p>
              </div>
              <button onClick={() => navigate('/')} className="p-1 bg-white/5 hover:bg-rose-600/20 rounded-lg transition-all"><X size={12} /></button>
            </div>
          </div>
        </nav>

        {/* CONTENT */}
        <div className="space-y-4 animate-fade-in">

          <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><Bell size={16} /></div>
               <h2 className="text-[11px] font-bold uppercase tracking-widest text-white">Security & System Alerts</h2>
            </div>
            <div className="flex gap-1.5 items-center">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600" size={10} />
                <input
                  type="text"
                  placeholder="Search Alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg pl-6 pr-2 py-1 text-[8px] font-bold outline-none w-32 focus:border-rose-500/50"
                />
              </div>
              <button onClick={loadAlerts} className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"><RefreshCw size={12} className="text-slate-400" /></button>
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
              <div key={alert.id} className={`bg-white/[0.03] p-3 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/[0.06] transition-all group ${alert.status === 'unread' ? 'border-l-2 border-l-rose-500' : ''}`}>
                <div className="w-32">
                   <p className="text-[9px] font-mono text-slate-500 uppercase">{new Date(alert.created_at).toLocaleString([], {dateStyle:'short', timeStyle:'short'})}</p>
                </div>

                <div className="flex-1 px-4 flex flex-col gap-3">
                   <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${alert.status === 'unread' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-500'}`}>
                          {alert.type === 'system' ? <ShieldAlert size={12} /> : <Terminal size={12} />}
                      </div>
                      <div>
                          <h4 className={`text-[10px] font-bold uppercase tracking-tight ${alert.status === 'unread' ? 'text-white' : 'text-slate-500'}`}>{alert.title}</h4>
                          <p className="text-[8px] text-slate-500 leading-tight mt-0.5">{alert.message}</p>
                      </div>
                   </div>

                   {/* MEDIA PAYLOAD DISPLAY */}
                   {alert.attachment_type && (
                     <div className="ml-8 mt-2 max-w-sm">
                        {alert.attachment_type.startsWith('image/') ? (
                          <div className="rounded-lg overflow-hidden border border-white/5 bg-white/5">
                             <img
                               src={getApiUrl(`/api/users/notifications/${alert.id}/attachment?token=${user?.token}`)}
                               alt="Transmission Payload"
                               className="w-full h-auto max-h-40 object-cover opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                               onClick={async () => {
                                 window.open(getApiUrl(`/api/users/notifications/${alert.id}/attachment?token=${user?.token}`), '_blank');
                                 // Notify Admin
                                 try {
                                   await fetch(getApiUrl('/api/users/client-feedback'), {
                                     method: 'POST',
                                     headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
                                     body: JSON.stringify({
                                       userId: user.userId || user.id,
                                       title: 'Media Alert Accessed',
                                       message: `User viewed media attachment in alert: "${alert.title}"`,
                                       type: 'service_feedback', priority: 'Low', rating: 5
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
                                 await fetch(getApiUrl('/api/users/client-feedback'), {
                                   method: 'POST',
                                   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
                                   body: JSON.stringify({
                                     userId: user.userId || user.id,
                                     title: 'Video Alert Played',
                                     message: `User started video playback in alert: "${alert.title}"`,
                                     type: 'service_feedback', priority: 'Low', rating: 5
                                   })
                                 });
                               } catch(e) {}
                            }}
                            className="w-full rounded-lg border border-white/5 bg-white/5 max-h-40"
                            src={getApiUrl(`/api/users/notifications/${alert.id}/attachment?token=${user?.token}`)}
                          />
                        ) : (
                          <a
                            href={getApiUrl(`/api/users/notifications/${alert.id}/attachment?token=${user?.token}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={async () => {
                               try {
                                 await fetch(getApiUrl('/api/users/client-feedback'), {
                                   method: 'POST',
                                   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
                                   body: JSON.stringify({
                                     userId: user.userId || user.id,
                                     title: 'Document Alert Downloaded',
                                     message: `User downloaded document in alert: "${alert.title}"`,
                                     type: 'service_feedback', priority: 'Low', rating: 5
                                   })
                                 });
                               } catch(e) {}
                            }}
                            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all group/file"
                          >
                             <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                                <FileText size={14} />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-bold text-white truncate">{alert.attachment_name || 'Download Specification'}</p>
                                <p className="text-[7px] text-slate-500 uppercase">Secure Document Payload</p>
                             </div>
                             <Download size={14} className="text-slate-600 group-hover/file:text-white" />
                          </a>
                        )}
                     </div>
                   )}
                </div>

                <div className="w-24 flex flex-col items-end gap-2">
                   <span className={`text-[6px] font-black uppercase px-1.5 py-0.5 rounded ${alert.priority === 'high' ? 'bg-rose-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                      {alert.priority || 'Normal'}
                   </span>
                   {alert.status === 'unread' && (
                     <button
                       onClick={() => markAsRead(alert.id)}
                       className="text-[7px] font-black uppercase text-teal-400 hover:text-teal-300 transition-colors"
                     >
                       Dismiss Node
                     </button>
                   )}
                </div>
              </div>
            )) : (
              <div className="col-span-full py-16 text-center bg-white/1 rounded-xl border border-dashed border-white/10 opacity-30">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em]">No security events logged in this cycle.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientAlerts;
