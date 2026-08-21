import { useState, useEffect } from "react";
import {
  Briefcase,
  FileText,
  Bell,
  DollarSign,
  RefreshCw,
  LayoutDashboard,
  BarChart3,
  HelpCircle,
  X,
  FileDown,
  Download,
  Search,
  CheckSquare,
  ArrowLeft,
  Eye,
  Activity
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../services/api";
import { useNavigate } from "react-router-dom";

const ClientReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const navItems = [
    { id: "overview", label: "Home", icon: LayoutDashboard, path: '/client-portal' },
    { id: "projects", label: "Projects", icon: Briefcase, path: '/client-portal' },
    { id: "billing", label: "Billing", icon: DollarSign, path: '/client-portal' },
    { id: "notifications", label: "Alerts", icon: Bell, path: '/client-alerts' },
    { id: "reports", label: "Reports", icon: BarChart3, path: '/client-reports' },
    { id: "feedback", label: "Help", icon: HelpCircle, path: '/client-portal' },
  ];

  const loadProjectReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/users/my-reports'), {
        headers: { Authorization: `Bearer ${user?.token || ''}` },
      });
      const data = await response.json();
      if (data.success) setReports(data.reports || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadProjectReports();
  }, [user]);

  const handleOpenReport = async (report) => {
    setSelectedReport(report);

    // Send feedback/notification to admin
    try {
      await fetch(getApiUrl('/api/users/client-feedback'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token || ''}`
        },
        body: JSON.stringify({
          userId: user.userId || user.id,
          title: 'Report Accessed',
          message: `Client ${user.display_name} has opened the technical report: "${report.title}" for project "${report.project_name}".`,
          type: 'service_feedback',
          priority: 'Low',
          rating: 5
        })
      });
    } catch (err) {
      console.error("Failed to relay access feedback", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
      <RefreshCw className="animate-spin text-teal-500 w-6 h-6 mb-2" />
      <p className="text-[10px] font-bold uppercase tracking-widest">Accessing Node...</p>
    </div>
  );

  const filteredReports = reports.filter(r =>
    r.title.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
    r.project_name.toLowerCase().includes(reportSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-10 px-4 pb-8 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* REPLICATED PORTAL NAV */}
        <nav className="mb-6 border-b border-white/5 bg-[#0f172a]/95 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center justify-between gap-1 py-1 overflow-x-auto no-scrollbar">
            <div className="flex gap-0.5">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all border ${item.id === 'reports' ? "bg-teal-600 text-white border-teal-500" : "bg-transparent text-slate-500 border-transparent hover:bg-white/5"}`}
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
               <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400"><BarChart3 size={16} /></div>
               <h2 className="text-[11px] font-bold uppercase tracking-widest text-white">Technical Blueprints</h2>
            </div>
            <div className="flex gap-1.5 items-center">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600" size={10} />
                <input
                  type="text"
                  placeholder="Search Node..."
                  value={reportSearchQuery}
                  onChange={(e) => setReportSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg pl-6 pr-2 py-1 text-[8px] font-bold outline-none w-32 focus:border-teal-500/50"
                />
              </div>
              <button onClick={loadProjectReports} className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"><RefreshCw size={12} className="text-slate-400" /></button>
            </div>
          </div>

          {/* REPORT LIST */}
          <div className="grid grid-cols-1 gap-1">
            {/* HEADERS */}
            <div className="px-4 py-2 flex items-center justify-between text-[7px] font-black uppercase tracking-[0.3em] text-slate-500">
               <span className="w-24">Submission Date</span>
               <span className="flex-1 text-center">Project Module</span>
               <span className="w-32 text-right">Technical Payload</span>
            </div>

            {filteredReports.length > 0 ? filteredReports.map((report) => (
              <div key={report.id} className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/[0.06] transition-all group">
                {/* DATE LEFT */}
                <div className="w-24">
                  <p className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">{new Date(report.report_date).toLocaleDateString()}</p>
                </div>

                {/* PROJECT MIDDLE */}
                <button
                  onClick={() => handleOpenReport(report)}
                  className="flex-1 flex flex-col items-center group/title"
                >
                  <h4 className="text-[10px] font-black uppercase text-teal-400 group-hover/title:text-teal-300 transition-colors tracking-widest">{report.project_name}</h4>
                  <p className="text-[7px] font-bold text-slate-500 uppercase mt-0.5 opacity-60 group-hover/title:opacity-100 transition-opacity">View Documentation: {report.title}</p>
                </button>

                {/* PDF RIGHT */}
                <div className="w-32 flex justify-end">
                   <a
                    href={getApiUrl(`/api/users/my-reports/${report.id}/download?token=${user?.token}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-white/5 hover:bg-teal-600 text-white rounded-lg transition-all border border-white/5 flex items-center gap-2 group/dl"
                  >
                    <span className="text-[7px] font-black uppercase hidden sm:block text-slate-500 group-hover/dl:text-white">PDF Spec</span>
                    <Download size={14} className="text-teal-500 group-hover/dl:text-white" />
                  </a>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-16 text-center bg-white/1 rounded-xl border border-dashed border-white/10 opacity-30">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em]">
                  {reportSearchQuery ? `Zero matches for "${reportSearchQuery}"` : "Waiting for Admin publication..."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FULL PAGE REPORT VIEWER OVERLAY */}
        {selectedReport && (
          <div className="fixed inset-0 z-[100] bg-[#0f172a] animate-in fade-in duration-300 flex flex-col overflow-hidden">
            {/* VIEWER HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#111827]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-400">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase text-white tracking-tight">{selectedReport.title}</h2>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Project Node: {selectedReport.project_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={getApiUrl(`/api/users/my-reports/${selectedReport.id}/download?token=${user?.token}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl transition-all"
                >
                  <Download size={16} />
                  <span>Download Spec</span>
                </a>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-3 bg-white/5 hover:bg-rose-600/20 hover:text-rose-500 rounded-xl transition-all border border-white/5"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* VIEWER BODY */}
            <div className="flex-1 overflow-y-auto p-10 max-w-5xl mx-auto w-full">
              <div className="space-y-12 pb-20">
                <div className="grid grid-cols-2 gap-8 border-b border-white/5 pb-12">
                   <div>
                      <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-2">Transmission Date</label>
                      <p className="text-xl font-mono text-white">{new Date(selectedReport.report_date).toLocaleDateString()}</p>
                   </div>
                   <div className="text-right">
                      <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-2">System Status</label>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase">Verified Blueprint</span>
                   </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase text-teal-400 tracking-[0.3em] flex items-center gap-3">
                    <Activity size={14} />
                    Executive Briefing
                  </h3>
                  <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 leading-relaxed text-slate-300 text-lg italic">
                    "{selectedReport.summary || "No technical summary provided for this transmission node."}"
                  </div>
                </div>

                <div className="p-10 bg-white/2 rounded-[50px] border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-6">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-slate-700">
                      <FileDown size={40} />
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-lg font-black uppercase text-white">Interactive Blueprint Integration</h4>
                      <p className="text-xs text-slate-500 uppercase tracking-widest max-w-md">For the full architectural experience, open the synchronized PDF document to view technical diagrams and flow prototypes.</p>
                   </div>
                   <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Launch PDF Viewer</button>
                </div>
              </div>
            </div>

            {/* VIEWER FOOTER */}
            <div className="p-4 border-t border-white/5 bg-[#0f172a] text-center">
               <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.5em]">GSSF Technical Relay // Node {user?.id} // End of Transmission</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ClientReports;
