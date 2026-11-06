import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, User, X, Send } from "lucide-react";
import { apiCall } from "../../services/api";
import { Spinner } from "../../components/Loading";
import { formatKSH } from "../../utils/currencyUtils";
import { TAX_PRESETS, taxLabel, roundMoney } from "../../utils/kraTax";
import SearchBlock from "../../components/SearchBlock";

export function CreateInvoice() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsError, setProjectsError] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [invoiceForm, setInvoiceForm] = useState({
    project_id: '', title: '', invoice_type: 'project_fee', tax_type: 'vat', tax_rate: '16',
    issue_date: new Date().toISOString().split('T')[0], due_date: '',
    client_name: '', client_email: '', client_phone: '', client_company: '',
    client_address: '', client_city: '', client_postal_code: '', client_country: 'Kenya',
    notes: '',
    payment_method: 'bank_transfer',
    items: [{ description: '', quantity: '1', unit_price: '' }]
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Gated (valid session only); returns [] until signed in.
        const data = await apiCall("/user-projects");
        setProjects(Array.isArray(data) ? data : []);
        setProjectsError('');
      } catch (error) {
        console.error(error);
        setProjectsError(error.message || 'Could not load projects. Check your admin session and try again.');
      }
    };
    fetchProjects();
  }, []);

  const itemsSubtotal = invoiceForm.items.reduce(
    (s, it) => s + parseFloat(it.quantity || 0) * parseFloat(it.unit_price || 0), 0
  );

  // Live KRA tax math (tax_rate is a whole percent in the UI; the server
  // converts it to the DECIMAL FRACTION the DB's generated columns require).
  const taxPct = parseFloat(invoiceForm.tax_rate || 0);
  const taxAmount = roundMoney(itemsSubtotal * (taxPct / 100));
  const grandTotal = roundMoney(itemsSubtotal + taxAmount);

  // DB-backed project suggestions — filters as the admin types
  const filteredProjects = projects.filter((p) =>
    p.linked_client_email &&
    (p.project_name || p.name || '').toLowerCase().includes(projectSearch.toLowerCase())
  );
  const selectedProject = projects.find((project) => String(project.id) === invoiceForm.project_id);

  const pickTaxPreset = (pct) => {
    const preset = TAX_PRESETS.find(p => p.pct === Number(pct)) || TAX_PRESETS[0];
    setInvoiceForm((f) => ({ ...f, tax_rate: String(preset.pct), tax_type: preset.type }));
  };

  const updateItem = (idx, field, value) =>
    setInvoiceForm((f) => ({ ...f, items: f.items.map((it, i) => (i === idx ? { ...it, [field]: value } : it)) }));
  const addLineItem = () =>
    setInvoiceForm((f) => ({ ...f, items: [...f.items, { description: '', quantity: '1', unit_price: '' }] }));
  const removeLineItem = (idx) =>
    setInvoiceForm((f) => ({ ...f, items: f.items.length > 1 ? f.items.filter((_, i) => i !== idx) : f.items }));

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      // ── 1) Create the invoice ──
      const clientAddress = [
        invoiceForm.client_company && `Company: ${invoiceForm.client_company}`,
        invoiceForm.client_address,
        [
          invoiceForm.client_postal_code,
          invoiceForm.client_city,
          invoiceForm.client_country,
        ].filter(Boolean).join(', '),
      ].filter(Boolean).join('\n');
      const created = await apiCall('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          ...invoiceForm,
          client_address: clientAddress,
          subtotal: itemsSubtotal,
          items: invoiceForm.items.map((it) => ({
            description: it.description || invoiceForm.title,
            quantity: parseFloat(it.quantity || 1),
            unit_price: parseFloat(it.unit_price || 0),
            line_total: parseFloat((parseFloat(it.quantity || 1) * parseFloat(it.unit_price || 0)).toFixed(2)),
          })),
          currency: 'KES',
        }),
      });

      const invoiceId = created?.id;
      if (!invoiceId) {
        throw new Error('Invoice created but no id returned');
      }

      navigate(`/admin/billing/pdf/${invoiceId}`);
    } catch (error) {
      console.error(error);
      setSubmitError(error.message || 'Invoice failed. Check you are signed in as admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-[500] flex flex-col font-sans overflow-hidden">
      <div className="bg-[#0f172a] w-full h-full flex flex-col">
        <div className="px-6 py-3 flex items-center justify-between border-b border-white/5 bg-[#1e293b]/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white font-black text-sm">GS</div>
            <div className="hidden sm:block">
              <h2 className="text-sm font-black text-white uppercase tracking-tight">Mission Deployment</h2>
              <p className="text-[6px] text-teal-500 font-black uppercase tracking-[0.4em]">Operational Protocol 7-Beta</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-6">
            <SearchBlock variant="admin" placeholder="Search clients..." />
          </div>
          <button onClick={() => navigate('/admin/billing')} className="p-2 hover:bg-rose-600/20 text-slate-400 hover:text-rose-500 rounded-lg transition-all"><X size={16} /></button>
        </div>

        <form onSubmit={handleInvoiceSubmit} className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {submitError && (
              <div role="alert" className="md:col-span-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300">
                {submitError}
              </div>
            )}
            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-teal-500 border-b border-white/5 pb-1.5"><Briefcase size={10} /><h4 className="text-[7px] font-black uppercase tracking-widest">Alignment</h4></div>
                <div className="grid gap-3">
                  <div className="relative"><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Project Node</label>
                    <input
                      type="text"
                      value={projectSearch}
                      placeholder="Type to search projects…"
                      onChange={(e) => {
                        setProjectSearch(e.target.value);
                        setInvoiceForm((f) => ({ ...f, project_id: '' }));
                        setShowProjectSuggestions(true);
                      }}
                      onFocus={() => setShowProjectSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowProjectSuggestions(false), 150)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all"
                    />
                    {showProjectSuggestions && projectSearch.trim() && filteredProjects.length > 0 && (
                      <div className="absolute z-50 w-full bg-[#0f172a] border border-white/10 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                        {filteredProjects.slice(0, 10).map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setProjectSearch(p.project_name || p.name || '');
                              setInvoiceForm((f) => ({
                                ...f,
                                project_id: String(p.id),
                                client_name: p.linked_client_name || p.client_name || '',
                                client_email: p.linked_client_email || '',
                                client_phone: p.linked_client_phone || '',
                              }));
                              setShowProjectSuggestions(false);
                            }}
                            className="px-3 py-2 text-[9px] text-white hover:bg-teal-600 cursor-pointer border-b border-white/5 last:border-0"
                          >
                            {p.project_name || p.name || 'Unnamed project'}
                          </div>
                        ))}
                      </div>
                    )}
                    {!invoiceForm.project_id && !projectSearch && (
                      <p className="text-[6px] font-bold text-slate-500 mt-1 px-1">Optional: link a project, or leave blank for a standalone invoice.</p>
                    )}
                    {projectsError && (
                      <p role="alert" className="text-[7px] font-bold text-rose-400 mt-1 px-1">{projectsError}</p>
                    )}
                    {selectedProject && (
                      <p className="text-[7px] font-bold text-teal-400 mt-1 px-1">
                        Client: {selectedProject.linked_client_name || selectedProject.client_name} · {selectedProject.linked_client_email}
                      </p>
                    )}
                  </div>
                  <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Objective</label><input type="text" placeholder="Description..." value={invoiceForm.title} onChange={(e) => setInvoiceForm({...invoiceForm, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all" required /></div>
                  <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Tax (KRA rate)</label>
                    <select value={invoiceForm.tax_rate} onChange={(e) => pickTaxPreset(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all">
                      {TAX_PRESETS.map(p => <option key={p.type} value={p.pct} className="bg-[#0f172a]">{p.label}</option>)}
                    </select>
                    <p className="mt-0.5 px-1 text-[6px] font-bold text-teal-400/80">{taxLabel(taxPct)} — {formatKSH(taxAmount)}</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-blue-500 border-b border-white/5 pb-1.5"><User size={10} /><h4 className="text-[7px] font-black uppercase tracking-widest">Client Details</h4></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Client Name</label><input type="text" placeholder="Full name or legal name" value={invoiceForm.client_name} onChange={(e) => setInvoiceForm({ ...invoiceForm, client_name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-blue-500 transition-all" required /></div>
                  <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Client Email</label><input type="email" placeholder="client@example.com" value={invoiceForm.client_email} onChange={(e) => setInvoiceForm({ ...invoiceForm, client_email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-blue-500 transition-all" required /></div>
                  <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Client Phone</label><input type="tel" placeholder="+254..." value={invoiceForm.client_phone} onChange={(e) => setInvoiceForm({ ...invoiceForm, client_phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-blue-500 transition-all" /></div>
                  <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Company (optional)</label><input type="text" placeholder="Company or organization" value={invoiceForm.client_company} onChange={(e) => setInvoiceForm({ ...invoiceForm, client_company: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-blue-500 transition-all" /></div>
                  <div className="sm:col-span-2"><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Billing Address</label><input type="text" placeholder="Street address" value={invoiceForm.client_address} onChange={(e) => setInvoiceForm({ ...invoiceForm, client_address: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-blue-500 transition-all" /></div>
                  <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">City</label><input type="text" placeholder="City" value={invoiceForm.client_city} onChange={(e) => setInvoiceForm({ ...invoiceForm, client_city: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-blue-500 transition-all" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Postal Code</label><input type="text" placeholder="Postal code" value={invoiceForm.client_postal_code} onChange={(e) => setInvoiceForm({ ...invoiceForm, client_postal_code: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-blue-500 transition-all" /></div>
                    <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Country</label><input type="text" value={invoiceForm.client_country} onChange={(e) => setInvoiceForm({ ...invoiceForm, client_country: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-blue-500 transition-all" /></div>
                  </div>
                  <div className="sm:col-span-2"><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Deadline</label><input type="date" value={invoiceForm.due_date} onChange={(e) => setInvoiceForm({...invoiceForm, due_date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-blue-500 transition-all" required /></div>
                </div>
              </section>
            </div>

            <div className="md:col-span-2">
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                  <div className="flex items-center gap-2 text-emerald-400"><Briefcase size={10} /><h4 className="text-[7px] font-black uppercase tracking-widest">Line Items</h4></div>
                  <button type="button" onClick={addLineItem} className="text-[7px] font-black text-teal-400 uppercase tracking-widest hover:text-white transition-colors">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  <div className="hidden md:grid grid-cols-12 gap-2 px-1 text-[6px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Rate (KSH)</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                  {invoiceForm.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input type="text" placeholder="Service / deliverable..." value={it.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} className="col-span-12 md:col-span-6 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all" />
                      <input type="number" min="1" step="any" value={it.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} className="col-span-4 md:col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all" />
                      <input type="number" min="0" step="any" placeholder="0" value={it.unit_price} onChange={(e) => updateItem(idx, 'unit_price', e.target.value)} className="col-span-5 md:col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all" />
                      <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-2">
                        <span className="text-[10px] font-black text-emerald-400">{formatKSH(parseFloat(it.quantity || 0) * parseFloat(it.unit_price || 0))}</span>
                        <button type="button" onClick={() => removeLineItem(idx)} className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all" title="Remove item"><X size={11} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="md:col-span-2">
              <textarea value={invoiceForm.notes} onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})} className="w-full bg-white/2 border border-white/5 rounded-xl text-[9px] font-medium text-slate-400 p-4 outline-none h-16 resize-none" placeholder="Mission constraints..."></textarea>
            </div>
          </div>
        </form>

        <div className="p-6 bg-[#0f172a] border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex gap-6">
              <div className="text-left">
                <p className="text-[5.5px] font-black text-slate-500 uppercase tracking-widest">Subtotal</p>
                <p className="text-sm font-bold text-white">{formatKSH(itemsSubtotal)}</p>
                <p className="text-[5.5px] font-black text-teal-400 uppercase tracking-widest mt-1">{taxLabel(taxPct) || "No tax"}</p>
                <p className="text-[10px] font-bold text-teal-300">{formatKSH(taxAmount)}</p>
                <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest mt-2 border-t border-white/10 pt-1">Total incl. tax</p>
                <p className="text-xl font-black text-emerald-400">{formatKSH(grandTotal)}</p>
              </div>
           </div>
           <button onClick={handleInvoiceSubmit} disabled={isSubmitting} className="w-full md:w-auto bg-teal-600 hover:bg-teal-500 text-white px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2">
              {isSubmitting ? <Spinner size={12} tone="white" /> : <Send size={12} />} Deploy to Ledger
           </button>
        </div>
      </div>
    </div>
  );
}
