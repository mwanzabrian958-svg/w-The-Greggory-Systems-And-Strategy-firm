import React, { useState, useEffect } from "react";
import { FileText, Download, Calendar, Filter, Plus, BarChart3, PieChart, TrendingUp, CheckCircle, RefreshCw, Bell } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../utils/permissions";
import { apiCall } from "../../services/api";

export function Reports({ user }) {
  const { can } = usePermissions(user);
  const [activeTab, setActiveTab] = useState("post");
  const [stats, setStats] = useState({ total: 0, thisMonth: 0 });

  // Post Report State
  const [projects, setProjects] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [reportForm, setReportForm] = useState({
    projectId: '',
    title: '',
    summary: '',
    file: null,
    fileBase64: '',
    fileType: '',
    fileSize: 0
  });

  useEffect(() => {
    loadProjects();
    fetchReportStats();
  }, []);

  const fetchReportStats = async () => {
    try {
      const data = await apiCall('/admin/dashboard');
      // In a real scenario we'd have a specific endpoint for report counts
      // For now we set to 0 if not provided by dashboard
      setStats({ total: 0, thisMonth: 0 });
    } catch (e) { console.error(e); }
  };

  const loadProjects = async () => {
    try {
      const data = await apiCall('/admin/projects/all');
      if (data.success) setProjects(data.projects);
    } catch (e) { console.error("Failed to load projects", e); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setReportForm({
        ...reportForm,
        file: file,
        fileBase64: reader.result,
        fileType: file.type,
        fileSize: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!reportForm.projectId || !reportForm.title || !reportForm.fileBase64) return;

    setIsPosting(true);
    try {
      const response = await apiCall('/admin/reports', {
        method: 'POST',
        body: JSON.stringify({
          project_id: reportForm.projectId,
          title: reportForm.title,
          summary: reportForm.summary,
          file_data: reportForm.fileBase64,
          file_type: reportForm.fileType,
          file_size: reportForm.fileSize,
          admin_id: user?.id
        })
      });

      if (response.success) {
        setPostSuccess(true);
        setReportForm({ projectId: '', title: '', summary: '', file: null, fileBase64: '', fileType: '', fileSize: 0 });
        fetchReportStats();
        setTimeout(() => setPostSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Report publication failed", e);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Overview Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Blueprints</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.total}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Relays</p>
              <p className="mt-2 text-3xl font-semibold text-teal-600">ONLINE</p>
            </div>
            <TrendingUp className="h-10 w-10 text-teal-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Sync Requests</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-600">{stats.thisMonth}</p>
            </div>
            <RefreshCw className="h-10 w-10 text-emerald-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Main Report Panel */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTab("post")}
            className={`flex-1 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition ${
              activeTab === "post"
                ? "bg-white border-b-2 border-teal-600 text-teal-600"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Post Technical Report
          </button>
          <button
            onClick={() => setActiveTab("alert")}
            className={`flex-1 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition ${
              activeTab === "alert"
                ? "bg-white border-b-2 border-rose-600 text-rose-600"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Relay Media Alert
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition ${
              activeTab === "custom"
                ? "bg-white border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Custom Query Builder
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "alert" && (
            <div className="max-w-2xl space-y-6 animate-fade-in">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const file = formData.get('media');
                let fileBase64 = '';
                if (file && file.size > 0) {
                  fileBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                  });
                }

                setIsPosting(true);
                try {
                  const res = await apiCall('/admin/relay-alert', {
                    method: 'POST',
                    body: JSON.stringify({
                      project_name: formData.get('projectName'),
                      user_identity: formData.get('userEmail'),
                      title: formData.get('title'),
                      message: formData.get('message'),
                      media_data: fileBase64,
                      media_type: file?.type,
                      media_name: file?.name,
                      priority: formData.get('priority')
                    })
                  });
                  if (res.success) {
                    setPostSuccess(true);
                    e.target.reset();
                    setTimeout(() => setPostSuccess(false), 3000);
                  }
                } catch (err) { console.error(err); }
                finally { setIsPosting(false); }
              }} className="space-y-6">

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Project</label>
                    <input name="projectName" required type="text" placeholder="Search project name..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">User Email / Name</label>
                    <input name="userEmail" required type="text" placeholder="Unique user ID..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Alert Title</label>
                    <input name="title" required type="text" placeholder="e.g. Infrastructure Deployment" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Priority</label>
                    <select name="priority" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-500">
                       <option value="normal">Normal</option>
                       <option value="high">High (Security)</option>
                       <option value="urgent">Urgent (Immediate)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Message</label>
                  <textarea name="message" required rows="3" placeholder="Enter transmission details..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Media Attachment (Image/Video/Doc)</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
                    <Plus className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Click to attach media payload</p>
                    <input name="media" type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>

                <div className="pt-4">
                   <button
                    type="submit"
                    disabled={isPosting}
                    className="w-full py-4 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-rose-900/10 hover:bg-rose-500 transition-all flex items-center justify-center gap-3"
                   >
                     {isPosting ? <RefreshCw className="animate-spin h-4 w-4" /> : <Bell size={14} />}
                     Relay Alert to Secure Node
                   </button>
                </div>

                {postSuccess && (
                  <div className="p-4 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700 uppercase">Transmission Successful</span>
                  </div>
                )}
              </form>
            </div>
          )}
          {activeTab === "post" && (
            <div className="max-w-2xl space-y-6">
              <form onSubmit={handlePostSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Project Target</label>
                    <select
                      required
                      value={reportForm.projectId}
                      onChange={(e) => setReportForm({...reportForm, projectId: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select Project Node...</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.project_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Report Header</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Q3 Progress Blueprint"
                      value={reportForm.title}
                      onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Technical Summary</label>
                  <textarea
                    rows="3"
                    placeholder="Provide detailed context for this transmission..."
                    value={reportForm.summary}
                    onChange={(e) => setReportForm({...reportForm, summary: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payload Document (PDF)</label>
                  <div
                    onClick={() => document.getElementById('report-upload').click()}
                    className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer group ${reportForm.file ? 'border-teal-500 bg-teal-50/30' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    {reportForm.file ? (
                      <>
                        <CheckCircle className="h-10 w-10 text-teal-500 mb-4" />
                        <p className="text-sm font-bold text-teal-600">{reportForm.file.name}</p>
                        <p className="text-[10px] text-teal-400 mt-1 uppercase">{(reportForm.fileSize / 1024).toFixed(1)} KB Loaded</p>
                      </>
                    ) : (
                      <>
                        <Plus className="h-10 w-10 text-slate-300 group-hover:text-teal-500 transition-colors mb-4" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Technical Specification PDF</p>
                      </>
                    )}
                    <input
                      id="report-upload"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div className="pt-4">
                   <button
                    type="submit"
                    disabled={isPosting || !reportForm.projectId || !reportForm.title || !reportForm.file}
                    className="w-full py-4 bg-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-teal-900/10 hover:bg-teal-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {isPosting ? <RefreshCw className="animate-spin h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                     {isPosting ? 'Relaying Telemetry...' : 'Publish Report to Client Node'}
                   </button>
                </div>

                {postSuccess && (
                  <div className="p-4 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-3 animate-bounce">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700 uppercase">Transmission Solidified Successfully</span>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === "custom" && (
            <div className="space-y-4 max-w-2xl animate-fade-in">
              <div className="p-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                 <BarChart3 className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                 <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Global Analytics Node Offline</p>
                 <p className="text-[10px] text-slate-500 mt-2 uppercase">Custom report generation is restricted during the current audit cycle.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
