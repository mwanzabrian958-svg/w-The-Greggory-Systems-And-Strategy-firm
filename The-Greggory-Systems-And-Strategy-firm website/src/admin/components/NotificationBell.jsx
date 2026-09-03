import React, { useState, useEffect } from "react";
import { apiCall } from "../../services/api";
import { Bell, CheckCircle, AlertCircle, Info, X } from "lucide-react";

export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await apiCall("/api/admin/change-requests");
      const items = Array.isArray(data) ? data : (data.requests || data.data || []);
      setNotifications(items.slice(0, 10));
      setUnread(items.filter(i => i.status === "pending" || i.status === "new").length);
    } catch (e) { /* silent */ }
  };

  const markAllRead = () => { setUnread(0); };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[6px] font-black rounded-full flex items-center justify-center">{unread}</span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-[7px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-700">Mark all read</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <CheckCircle size={20} className="mx-auto text-slate-300 mb-2" />
                <p className="text-[8px] text-slate-400">All caught up!</p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className={`p-3 border-b border-slate-50 hover:bg-slate-50 ${n.status === "pending" ? "bg-amber-50/30" : ""}`}>
                  <div className="flex items-start gap-2">
                    {n.status === "pending" ? <AlertCircle size={12} className="text-amber-500 mt-0.5 shrink-0" /> :
                     n.status === "approved" ? <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" /> :
                     <Info size={12} className="text-blue-500 mt-0.5 shrink-0" />}
                    <div>
                      <p className="text-[8px] font-bold text-slate-700">{n.title || n.description || "New notification"}</p>
                      <p className="text-[6px] text-slate-400 mt-0.5">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ""}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
