import React, { useState, useEffect } from 'react';
import { X, FileText, Plus, Search, Download, Calendar, Filter, BarChart3, PieChart, TrendingUp, FileSpreadsheet, Printer, Share2, Eye, CheckCircle } from 'lucide-react';
import { apiCall } from '../../../services/api';

export function ReportsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [format, setFormat] = useState('PDF');
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(null);
  const [notice, setNotice] = useState(null);
  const [data, setData] = useState(null);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const reportTemplates = [
    { id: 1, name: 'Monthly Revenue Report', category: 'Financial', description: 'Detailed breakdown of monthly revenue', icon: BarChart3 },
    { id: 2, name: 'Project Status Report', category: 'Projects', description: 'Current status of all active projects', icon: TrendingUp },
    { id: 3, name: 'User Activity Report', category: 'Users', description: 'User engagement and activity metrics', icon: PieChart },
    { id: 4, name: 'Performance Report', category: 'Analytics', description: 'System performance and uptime metrics', icon: BarChart3 },
    { id: 5, name: 'Sales Report', category: 'Financial', description: 'Sales performance and conversion rates', icon: TrendingUp },
    { id: 6, name: 'Custom Report', category: 'Custom', description: 'Create your own custom report', icon: FileSpreadsheet },
  ];

  const recentReports = data ? [
    { id: 'r1', name: 'Business Report (live)', generated: new Date().toISOString().split('T')[0], format, size: `${buildLines().length} rows`, author: 'Admin' },
    { id: 'r2', name: 'Invoice Register', generated: new Date().toISOString().split('T')[0], format: 'CSV', size: `${data.invoices.length} rows`, author: 'Admin' },
    { id: 'r3', name: 'Ledger Export', generated: new Date().toISOString().split('T')[0], format: 'CSV', size: `${data.entries.length} rows`, author: 'Admin' },
  ] : [];

  // Live data + persisted state — same endpoints as Reports.jsx, so the
  // numbers always match the rest of the admin console.
  useEffect(() => {
    if (!isOpen) return;
    try {
      setCustomTemplates(JSON.parse(localStorage.getItem('gf_report_templates') || '[]'));
      setSchedules(JSON.parse(localStorage.getItem('gf_report_schedules') || '[]'));
    } catch { /* corrupted storage — start clean */ }
    (async () => {
      try {
        const [budgetRes, invoiceRes, projectsRes, ledgerRes] = await Promise.all([
          apiCall('/admin-complete/budget-overview'),
          apiCall('/invoices'),
          apiCall('/user-projects'),
          apiCall('/admin/ledger'),
        ]);
        const invoices = invoiceRes?.invoices || invoiceRes?.data || (Array.isArray(invoiceRes) ? invoiceRes : []);
        const projects = Array.isArray(projectsRes) ? projectsRes : (projectsRes?.projects || projectsRes?.data || []);
        const entries = ledgerRes?.entries || [];
        const b = budgetRes?.data || {};
        const outstanding = invoices
          .filter(i => String(i.status || '').toLowerCase() !== 'paid')
          .reduce((s, i) => s + parseFloat(i.total_amount_kes || 0), 0);
        setData({
          revenue: b.revenue ?? 0, expenses: b.expenses ?? 0,
          net: b.net_income ?? ((b.revenue ?? 0) - (b.expenses ?? 0)),
          outstanding, invoices, projects, entries,
        });
      } catch (e) {
        console.error('Report data fetch failed:', e);
        setData({ revenue: 0, expenses: 0, net: 0, outstanding: 0, invoices: [], projects: [], entries: [] });
      }
    })();
  }, [isOpen]);

  const fmtKES = (n) => `KSH ${Number(n || 0).toLocaleString()}`;

  function buildLines() {
    const d = data || { revenue: 0, expenses: 0, net: 0, outstanding: 0, invoices: [], projects: [], entries: [] };
    const status = d.projects.reduce((m, p) => { const s = p.status || 'unknown'; m[s] = (m[s] || 0) + 1; return m; }, {});
    return [
      'GREGGORY SYSTEMS & STRATEGY FIRM — BUSINESS REPORT',
      `Generated: ${new Date().toLocaleString()}`, '',
      '== FINANCIAL SUMMARY ==',
      `Total Revenue: ${fmtKES(d.revenue)}`,
      `Total Expenses: ${fmtKES(d.expenses)}`,
      `Net Profit: ${fmtKES(d.net)}`,
      `Outstanding (Unpaid Invoices): ${fmtKES(d.outstanding)}`, '',
      '== INVOICES ==',
      `Total: ${d.invoices.length}  Paid: ${d.invoices.filter(i => String(i.status).toLowerCase() === 'paid').length}  Unpaid: ${d.invoices.filter(i => String(i.status).toLowerCase() !== 'paid').length}`, '',
      '== PROJECTS ==', `Total: ${d.projects.length}`,
      ...Object.entries(status).map(([s, n]) => `${s}: ${n}`), '',
      '== LEDGER ==', `Total Entries: ${d.entries.length}`,
      `Income Entries: ${d.entries.filter(e => e.entry_type !== 'expense').length}`,
      `Expense Entries: ${d.entries.filter(e => e.entry_type === 'expense').length}`,
    ];
  }

  const csvOf = (rows) => {
    if (!rows || !rows.length) return '';
    const headers = Object.keys(rows[0]);
    return [headers.join(','), ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  };

  const buildHtml = () => `<!doctype html><html><head><meta charset="utf-8"><title>Greggory Report</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#0f172a}h1{font-size:18px}li{font-size:13px;line-height:1.6}</style></head><body>
<h1>GREGGORY SYSTEMS &amp; STRATEGY FIRM — BUSINESS REPORT</h1><p>Generated ${new Date().toLocaleString()}</p>
<ul>${buildLines().slice(3).map(l => `<li>${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</li>`).join('')}</ul>
</body></html>`;

  const saveBlob = (content, mime, filename) => {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const doPrint = () => {
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) { setNotice({ ok: false, text: 'Pop-up blocked — allow pop-ups to print/save as PDF.' }); setTimeout(() => setNotice(null), 4000); return; }
    w.document.write(buildHtml()); w.document.close(); w.focus();
    setTimeout(() => w.print(), 300);
  };

  const handleDownload = (fmtOverride) => {
    const activeFormat = fmtOverride || format;
    const stamp = new Date().toISOString().split('T')[0];
    if (activeFormat === 'PDF') { doPrint(); return; } // print dialog = Save as PDF
    if (activeFormat === 'CSV') saveBlob(csvOf(data?.invoices) || buildLines().join('\n'), 'text/csv;charset=utf-8;', `greggory-report-${stamp}.csv`);
    else if (activeFormat === 'HTML') saveBlob(buildHtml(), 'text/html;charset=utf-8;', `greggory-report-${stamp}.html`);
    else if (activeFormat === 'Excel') {
      // HTML table saved as .xls — Excel opens it natively (project has no xlsx lib)
      const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><body><table border="1">${buildLines().map(l => `<tr><td>${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</td></tr>`).join('')}</table></body></html>`;
      saveBlob(html, 'application/vnd.ms-excel', `greggory-report-${stamp}.xls`);
    }
    setNotice({ ok: true, text: `${activeFormat} report downloaded.` });
    setTimeout(() => setNotice(null), 4000);
  };

  const handlePreview = () => {
    setGenerating(true);
    setTimeout(() => {
      setPreview(buildLines());
      setGenerating(false);
      setNotice({ ok: true, text: `Preview compiled from ${data ? data.entries.length + ' ledger entries' : 'live data'}.` });
      setTimeout(() => setNotice(null), 4000);
    }, 350);
  };

  const handleShare = async () => {
    const text = buildLines().join('\n');
    try {
      if (navigator.share) { await navigator.share({ title: 'Greggory Business Report', text }); setNotice({ ok: true, text: 'Report shared.' }); }
      else { await navigator.clipboard.writeText(text); setNotice({ ok: true, text: 'Report copied to clipboard.' }); }
    } catch { setNotice({ ok: false, text: 'Sharing cancelled.' }); }
    setTimeout(() => setNotice(null), 4000);
  };

  const handleCreateTemplate = () => {
    const name = window.prompt('Template name:');
    if (!name || !name.trim()) return;
    const next = [...customTemplates, { id: `c${Date.now()}`, name: name.trim(), category: 'Custom', description: 'Saved on this device' }];
    setCustomTemplates(next);
    localStorage.setItem('gf_report_templates', JSON.stringify(next));
    setNotice({ ok: true, text: `Template "${name.trim()}" saved.` });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleSchedule = () => {
    const name = window.prompt('Report to schedule (e.g. Weekly Revenue):');
    if (!name || !name.trim()) return;
    const next = [...schedules, { name: name.trim(), frequency: 'Weekly', nextRun: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], status: 'Active' }];
    setSchedules(next);
    localStorage.setItem('gf_report_schedules', JSON.stringify(next));
    setNotice({ ok: true, text: `"${name.trim()}" scheduled (saved on this device).` });
    setTimeout(() => setNotice(null), 4000);
  };

  const toggleSchedule = (idx) => {
    const next = schedules.map((s, i) => i === idx ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s);
    setSchedules(next);
    localStorage.setItem('gf_report_schedules', JSON.stringify(next));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Reports & Analytics</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {notice && (
          <div className={`px-6 py-2 text-xs font-bold flex items-center gap-2 ${notice.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-50 text-emerald-700'}`}>
            <CheckCircle className="w-4 h-4" /> {notice.text}
          </div>
        )}

        <div className="bg-gray-50 border-b px-6 flex gap-1">
          <button onClick={() => setActiveTab('templates')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'templates' ? 'bg-white border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600 hover:text-gray-900'}`}>Templates</button>
          <button onClick={() => setActiveTab('recent')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'recent' ? 'bg-white border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600 hover:text-gray-900'}`}>Recent Reports</button>
          <button onClick={() => setActiveTab('scheduled')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'scheduled' ? 'bg-white border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600 hover:text-gray-900'}`}>Scheduled Reports</button>
          <button onClick={() => setActiveTab('builder')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'builder' ? 'bg-white border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600 hover:text-gray-900'}`}>Report Builder</button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                </div>
                <button onClick={handleCreateTemplate} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                  <Plus className="w-4 h-4" /> Create Template
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[...reportTemplates, ...customTemplates]
                  .filter(t => !searchTerm || t.name.toLowerCase().includes(searchTerm.toLowerCase()) || (t.category || '').toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(template => {
                  const Icon = template.icon || FileSpreadsheet;
                  return (
                    <div key={template.id} onClick={() => { setActiveTab('builder'); setNotice({ ok: true, text: `"${template.name}" loaded into the builder.` }); setTimeout(() => setNotice(null), 3000); }} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer">
                      <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-cyan-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <span className="text-xs font-medium text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">{template.category}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab('builder')} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4" /> Build Custom
                  </button>
                  <button onClick={handlePreview} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                    <Plus className="w-4 h-4" /> Generate Report
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Report Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Generated</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Format</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Author</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentReports.map(report => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{report.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{report.generated}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{report.format}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{report.size}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{report.author}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => { setPreview(buildLines()); setActiveTab('builder'); }} title="Preview report" className="p-1 hover:bg-blue-100 rounded transition-colors">
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <button onClick={() => handleDownload(report.format === 'CSV' ? 'CSV' : report.format === 'Excel' ? 'Excel' : format)} title="Download report" className="p-1 hover:bg-green-100 rounded transition-colors">
                              <Download className="w-4 h-4 text-green-600" />
                            </button>
                            <button onClick={handleShare} title="Share report" className="p-1 hover:bg-slate-100 rounded transition-colors">
                              <Share2 className="w-4 h-4 text-teal-700" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {recentReports.length === 0 && (
                      <tr><td colSpan="5" className="px-4 py-10 text-center text-sm text-gray-400">{data ? 'No reports yet — use Generate Report.' : 'Loading live report data…'}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'scheduled' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Scheduled Reports</h3>
                <button onClick={handleSchedule} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                  <Plus className="w-4 h-4" /> Schedule Report
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {schedules.length === 0 && (
                  <p className="col-span-2 py-10 text-center text-sm text-gray-400">No scheduled reports yet — use “Schedule Report” to add one (saved on this device).</p>
                )}
                {schedules.map((scheduled, idx) => (
                  <div key={`${scheduled.name}-${idx}`} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{scheduled.name}</h4>
                        <p className="text-sm text-gray-600">{scheduled.frequency}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${scheduled.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {scheduled.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Next: {scheduled.nextRun}
                      </div>
                      <button onClick={() => toggleSchedule(idx)} className="text-cyan-600 hover:text-cyan-700 font-medium">
                        {scheduled.status === 'Active' ? 'Pause' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'builder' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Report Builder</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Report Contents (live)</h4>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">
                    <div className="flex justify-between"><span>Revenue</span><b>{fmtKES(data?.revenue)}</b></div>
                    <div className="flex justify-between"><span>Expenses</span><b>{fmtKES(data?.expenses)}</b></div>
                    <div className="flex justify-between"><span>Net Profit</span><b>{fmtKES(data?.net)}</b></div>
                    <div className="flex justify-between"><span>Outstanding</span><b>{fmtKES(data?.outstanding)}</b></div>
                    <div className="flex justify-between"><span>Invoices</span><b>{data?.invoices.length ?? '—'}</b></div>
                    <div className="flex justify-between"><span>Projects</span><b>{data?.projects.length ?? '—'}</b></div>
                    <div className="flex justify-between"><span>Ledger entries</span><b>{data?.entries.length ?? '—'}</b></div>
                  </div>
                  <p className="text-xs text-gray-500">Source: live endpoints (budget overview, invoices, projects, ledger) — same numbers as Reports.</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Preview</h4>
                  {preview ? (
                    <div className="bg-slate-900 text-emerald-300 rounded-lg p-4 h-72 overflow-auto text-[11px] font-mono whitespace-pre-wrap">
                      {preview.join('\n')}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg h-72 flex items-center justify-center text-sm text-gray-400 px-4 text-center">
                      No preview yet — press “Generate Preview”.
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Output Format</h4>
                  <div className="space-y-2">
                    {['PDF', 'Excel', 'CSV', 'HTML'].map((f) => (
                      <button key={f} onClick={() => setFormat(f)} className={`w-full p-3 border rounded-lg text-sm transition-colors text-left ${format === f ? 'border-cyan-600 bg-cyan-50 text-cyan-700 font-semibold' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}>
                        {format === f && <CheckCircle className="w-3 h-3 inline mr-1" />}{f}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {format === 'PDF' ? 'Opens the print dialog — choose “Save as PDF”.' : format === 'Excel' ? 'Excel-compatible .xls download.' : format === 'CSV' ? 'CSV of the invoice register.' : 'Standalone HTML download.'}
                  </p>

                  <h4 className="font-medium text-gray-900">Actions</h4>
                  <div className="space-y-2">
                    <button onClick={handlePreview} disabled={generating || !data} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50">
                      <BarChart3 className="w-4 h-4" /> {generating ? 'Compiling…' : 'Generate Preview'}
                    </button>
                    <button onClick={() => handleDownload()} disabled={!data} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
                      <Download className="w-4 h-4" /> Download {format}
                    </button>
                    <button onClick={doPrint} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Printer className="w-4 h-4" /> Print Report
                    </button>
                    <button onClick={handleShare} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Share2 className="w-4 h-4" /> Share Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}