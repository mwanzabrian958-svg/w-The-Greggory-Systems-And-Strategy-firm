import React, { useState, useEffect } from "react";
import { apiCall } from "../../services/api";
import { RefreshCw, Shield, ShieldCheck, ShieldAlert, ShieldX, Activity, Users, FileText, Database, Play } from "lucide-react";

export function DataSafety() {
  const [summary, setSummary] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => { fetchData(); }, []);

  // ---- Secondary Backup (cloud Aiven -> local phpMyAdmin/XAMPP) ----
  const [backupStatus, setBackupStatus] = useState(null);
  const [backupBusy, setBackupBusy] = useState(false);

  useEffect(() => { fetchBackupStatus(); }, []);
  useEffect(() => {
    if (!backupBusy) return;
    const t = setInterval(fetchBackupStatus, 5000);
    return () => clearInterval(t);
  }, [backupBusy]);

  const fetchBackupStatus = async () => {
    try {
      const res = await apiCall("/api/admin/backup/status");
      if (res.success) {
        setBackupStatus(res);
        setBackupBusy(Boolean(res.running));
      }
    } catch (error) {
      console.error("Backup status fetch failed:", error);
    }
  };

  const runBackupNow = async () => {
    try {
      setBackupBusy(true);
      const res = await apiCall("/api/admin/backup/run", { method: "POST" });
      if (!res.success) {
        alert(res.message || "Could not start the backup");
        setBackupBusy(false);
      }
    } catch (error) {
      console.error("Backup trigger failed:", error);
      setBackupBusy(false);
    }
  };

  const BackupMetric = ({ label, value, tone = "text-slate-900" }) => (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
      <p className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className={`text-[10px] font-black mt-1 ${tone}`}>{value}</p>
    </div>
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, auditRes, accessRes] = await Promise.all([
        apiCall("/api/admin/data-safety-summary"),
        apiCall("/api/admin/audit-logs?limit=50"),
        apiCall("/api/admin/data-access-logs?limit=50")
      ]);

      if (summaryRes.success) setSummary(summaryRes);
      if (auditRes.success) setAuditLogs(auditRes.logs || []);
      if (accessRes.success) setAccessLogs(accessRes.logs || []);
    } catch (error) {
      console.error("Data safety fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getClassificationColor = (level) => {
    switch(level) {
      case 'public': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'internal': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'confidential': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'restricted': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return <ShieldCheck size={12} className="text-emerald-500" />;
      case 'failure': return <ShieldX size={12} className="text-rose-500" />;
      case 'warning': return <ShieldAlert size={12} className="text-orange-500" />;
      default: return <Shield size={12} className="text-slate-500" />;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <RefreshCw className="animate-spin text-teal-600 w-8 h-8" />
      <p className="mt-4 text-[7px] font-black text-slate-400 uppercase tracking-[0.6em]">Scanning Data Safety Protocols...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Data Safety & Compliance</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Audit Logs, Access Control & Classification</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-black text-[7px] uppercase tracking-widest hover:bg-slate-50">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {activeTab === 'summary' && summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={14} className="text-teal-500" />
                <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Data Classifications</h3>
              </div>
              <div className="space-y-2">
                {summary.classifications?.map((c) => (
                  <div key={c.sensitivity_level} className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-md border text-[7px] font-black uppercase ${getClassificationColor(c.sensitivity_level)}`}>{c.sensitivity_level}</span>
                    <span className="text-[9px] font-black text-slate-900">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Activity size={14} className="text-blue-500" />
                <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Access Stats (30d)</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[7px] text-slate-500 uppercase font-bold">Total Accesses</span>
                  <span className="text-[9px] font-black text-slate-900">{summary.accessStats?.total_accesses || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[7px] text-slate-500 uppercase font-bold">Granted</span>
                  <span className="text-[9px] font-black text-emerald-600">{summary.accessStats?.granted || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[7px] text-slate-500 uppercase font-bold">Denied</span>
                  <span className="text-[9px] font-black text-rose-600">{summary.accessStats?.denied || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[7px] text-slate-500 uppercase font-bold">Unique Users</span>
                  <span className="text-[9px] font-black text-slate-900">{summary.accessStats?.unique_users || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Users size={14} className="text-violet-500" />
                <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Consent Status</h3>
              </div>
              <div className="space-y-2">
                {summary.consentStats?.map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[7px] text-slate-500 uppercase font-bold">{c.consent_type}</span>
                    <span className={`text-[9px] font-black ${c.consent_given ? 'text-emerald-600' : 'text-rose-600'}`}>{c.consent_given ? 'Granted' : 'Denied'} ({c.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-md overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Audit Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-[7px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-[7px] font-black text-slate-500 uppercase tracking-widest">User</th>
                  <th className="px-4 py-3 text-[7px] font-black text-slate-500 uppercase tracking-widest">Action</th>
                  <th className="px-4 py-3 text-[7px] font-black text-slate-500 uppercase tracking-widest">Entity</th>
                  <th className="px-4 py-3 text-[7px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length > 0 ? auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{getStatusIcon(log.status)}</td>
                    <td className="px-4 py-3">
                      <p className="text-[9px] font-bold text-slate-900">{log.user_name || 'System'}</p>
                      <p className="text-[7px] text-slate-500">{log.user_email || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-[8px] font-bold text-slate-700">{log.action_type}</td>
                    <td className="px-4 py-3 text-[8px] text-slate-600">{log.affected_table} #{log.affected_record_id}</td>
                    <td className="px-4 py-3 text-[8px] text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-[8px] text-slate-500">No audit logs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'access' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-md overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Data Access Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-[7px] font-black text-slate-500 uppercase tracking-widest">User</th>
                  <th className="px-4 py-3 text-[7px] font-black text-slate-500 uppercase tracking-widest">Action</th>
                  <th className="px-4 py-3 text-[7px] font-black text-slate-500 uppercase tracking-widest">Entity</th>
                  <th className="px-4 py-3 text-[7px] font-black text-slate-500 uppercase tracking-widest">Granted</th>
                  <th className="px-4 py-3 text-[7px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accessLogs.length > 0 ? accessLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="text-[9px] font-bold text-slate-900">{log.user_name || 'System'}</p>
                      <p className="text-[7px] text-slate-500">{log.user_type}</p>
                    </td>
                    <td className="px-4 py-3 text-[8px] font-bold text-slate-700 uppercase">{log.action}</td>
                    <td className="px-4 py-3 text-[8px] text-slate-600">{log.entity_type} #{log.entity_id}</td>
                    <td className="px-4 py-3">
                      {log.access_granted ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[7px] font-black uppercase border border-emerald-100">Granted</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[7px] font-black uppercase border border-rose-100">Denied</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[8px] text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-[8px] text-slate-500">No access logs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-md p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Database size={14} className="text-teal-500" />
              <div>
                <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Secondary Backup — Cloud → Local phpMyAdmin</h3>
                <p className="text-[6.5px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{backupStatus?.scheduledTask || "Daily at 02:00 (Windows Task Scheduler)"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchBackupStatus} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-black text-[7px] uppercase tracking-widest hover:bg-slate-50">
                <RefreshCw size={11} /> Refresh
              </button>
              <button
                onClick={runBackupNow}
                disabled={backupBusy}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-black text-[7px] uppercase tracking-widest text-white ${backupBusy ? "bg-slate-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"}`}
              >
                <Play size={11} /> {backupBusy ? "Backup Running…" : "Backup Now"}
              </button>
            </div>
          </div>

          {!backupStatus ? (
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Backup telemetry unavailable — is the backend running?</p>
          ) : (
            <>
              {!backupStatus.configured && (
                <p className="text-[8px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                  Cloud DB not configured — set DB_CLOUD_HOST / DB_CLOUD_USER / DB_CLOUD_PASSWORD in .env
                </p>
              )}
              {backupStatus.lastRun && !backupStatus.lastRun.ok && backupStatus.lastRun.error && (
                <p className="text-[8px] font-black uppercase tracking-wide text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                  Last run failed: {backupStatus.lastRun.error}
                </p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <BackupMetric
                  label="Last Run"
                  value={backupStatus.lastRun ? (backupStatus.lastRun.ok ? "SUCCESS" : "FAILED") : "NEVER"}
                  tone={backupStatus.lastRun ? (backupStatus.lastRun.ok ? "text-emerald-600" : "text-rose-600") : "text-slate-400"}
                />
                <BackupMetric label="Trigger" value={backupStatus.lastRun?.trigger || "—"} />
                <BackupMetric label="Finished" value={backupStatus.lastRun?.finishedAt ? new Date(backupStatus.lastRun.finishedAt).toLocaleString() : "—"} />
                <BackupMetric label="Duration" value={backupStatus.lastRun?.durationMs ? `${(backupStatus.lastRun.durationMs / 1000).toFixed(1)}s` : "—"} />
                <BackupMetric label="Cloud Tables" value={backupStatus.lastRun?.cloud?.tables ?? "—"} />
                <BackupMetric label="Cloud Rows" value={backupStatus.lastRun?.cloud?.rows ?? "—"} />
                <BackupMetric label="Rows Copied" value={backupStatus.lastRun?.local?.rowsCopied ?? "—"} />
                <BackupMetric
                  label="Mismatches"
                  value={backupStatus.lastRun?.local?.mismatches ?? "—"}
                  tone={backupStatus.lastRun?.local?.mismatches > 0 ? "text-rose-600" : "text-emerald-600"}
                />
              </div>
              {backupStatus.latestSnapshot && (
                <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                  <p className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest">Latest JSON Snapshot</p>
                  <p className="text-[9px] font-bold text-slate-800 mt-1">
                    {backupStatus.latestSnapshot.file} · {backupStatus.latestSnapshot.sizeKB} KB · {new Date(backupStatus.latestSnapshot.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 rounded-lg text-[7px] font-black uppercase tracking-widest ${activeTab === 'summary' ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>Summary</button>
        <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 rounded-lg text-[7px] font-black uppercase tracking-widest ${activeTab === 'audit' ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>Audit Logs</button>
        <button onClick={() => setActiveTab('access')} className={`px-4 py-2 rounded-lg text-[7px] font-black uppercase tracking-widest ${activeTab === 'access' ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>Data Access</button>
        <button onClick={() => setActiveTab('backup')} className={`px-4 py-2 rounded-lg text-[7px] font-black uppercase tracking-widest ${activeTab === 'backup' ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>Backup</button>
      </div>
    </div>
  );
}
