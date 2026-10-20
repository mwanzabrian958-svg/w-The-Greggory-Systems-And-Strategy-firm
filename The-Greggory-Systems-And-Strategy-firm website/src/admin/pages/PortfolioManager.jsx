/**
 * Portfolio Manager — the single editor for the public "Project Portfolio"
 * section of the home page.
 *
 * Every row saved here is persisted in MySQL (backend/routes/posts.js) and is
 * read back by the public home page carousel through GET /posts/portfolio.
 * Only rows with status='published' AND is_active=1 reach the public site.
 *
 * This page replaced the old "Work Portfolio" tab that lived inside Posts.jsx
 * so that there is exactly ONE place where portfolio content is authored —
 * the home page carousel and this manager can never drift apart.
 *
 * Deletes are soft (the API sets deleted_at), so nothing is lost by accident.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, Plus, Pencil, Trash2, Save, X,
  RefreshCw, Star, CheckCircle, AlertCircle, LayoutGrid, Database,
} from 'lucide-react';
import { apiCall } from '../../services/api';

const EMPTY_ITEM = {
  title: '', client_name: '', sector: '', summary: '', body: '', image_url: '',
  outcomes: '', status: 'draft', sort_order: 0, is_featured: false, is_active: true,
};

const inputCls =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100';

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="block text-[7px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1.5">
        {label}
      </span>
      {children}
      {hint ? <span className="block text-[7px] text-slate-400 mt-1">{hint}</span> : null}
    </label>
  );
}

function StatusPill({ status, active }) {
  const live = status === 'published' && active;
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border whitespace-nowrap ${
        live
          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
          : 'bg-slate-100 text-slate-500 border-slate-200'
      }`}
    >
      {live ? 'Live' : status === 'published' ? 'Live (hidden)' : 'Draft'}
    </span>
  );
}

/** A dash for genuinely empty cells, so a blank never reads as "loading…". */
function Cell({ value }) {
  const empty = value === null || value === undefined || String(value).trim() === '';
  return (
    <span className={empty ? 'text-slate-300' : undefined}>{empty ? '—' : value}</span>
  );
}

// Table header cell.
const TH =
  'px-3 py-3 text-left text-[7px] font-black uppercase tracking-[0.2em] ' +
  'text-slate-400 whitespace-nowrap bg-slate-50/70 border-b border-slate-200';
// Table body cell.
const TD = 'px-3 py-3 text-[10px] text-slate-600 align-top';

function Th({ children, className = '' }) {
  return (
    <th scope="col" className={`${TH} ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = '' }) {
  return <td className={`${TD} ${className}`}>{children}</td>;
}

/** Wrapper giving the table the same card chrome + horizontal scroll. */
function TableShell({ caption, count, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
        <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-700">
          {caption}
        </h2>
        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
          {count} {count === 1 ? 'entry' : 'entries'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[860px]">{children}</table>
      </div>
    </div>
  );
}

/** The per-row actions for a portfolio row. */
function RowActions({ item, onToggle, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onToggle(item, 'is_featured')}
        className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-teal-50 hover:text-teal-600 transition-colors"
        title="Feature / unfeature"
      >
        <Star size={13} fill={item.is_featured ? 'currentColor' : 'none'} />
      </button>
      <button
        type="button"
        onClick={() => onEdit(item)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-[7px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors"
      >
        <Pencil size={11} /> Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete(item)}
        className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-colors"
        title="Delete"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export function PortfolioManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_ITEM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const set = (key) => (e) => {
    const t = e.target;
    const v = t.type === 'checkbox' ? t.checked : t.value;
    setForm((f) => ({ ...f, [key]: v }));
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/posts/admin/portfolio');
      setItems(data?.portfolio || []);
    } catch (e) {
      setError(e.message || 'Could not load the portfolio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_ITEM);
    setError('');
  };

  const startEdit = (item) => {
    setForm({
      title: item.title || '',
      client_name: item.client_name || '',
      sector: item.sector || '',
      summary: item.summary || '',
      body: item.body || '',
      image_url: item.image_url || '',
      outcomes: Array.isArray(item.outcomes)
        ? item.outcomes.map((o) => `${o.metric} | ${o.label}`).join('\n')
        : '',
      status: item.status || 'draft',
      sort_order: item.sort_order || 0,
      is_featured: !!item.is_featured,
      is_active: !!item.is_active,
    });
    setEditingId(item.id);
    setNotice('');
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const payload = { ...form };
      payload.sort_order = parseInt(payload.sort_order, 10) || 0;
      if (editingId) {
        await apiCall(`/posts/admin/portfolio/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setNotice('Portfolio entry saved.');
      } else {
        await apiCall('/posts/admin/portfolio', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setNotice('Portfolio entry created.');
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (item, key) => {
    setError('');
    try {
      await apiCall(`/posts/admin/portfolio/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ [key]: !item[key] }),
      });
      await load();
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  };

  const remove = async (item) => {
    if (!window.confirm('Delete this portfolio entry? It will be removed from the public site.')) return;
    setError('');
    try {
      await apiCall(`/posts/admin/portfolio/${item.id}`, { method: 'DELETE' });
      if (editingId === item.id) resetForm();
      await load();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Portfolio Manager</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">
            Project Portfolio — posts to the database, renders on the public home page
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[7px] font-black uppercase tracking-widest text-slate-600 hover:border-teal-400 hover:text-teal-600 transition-colors"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Where the entries end up — makes the DB round-trip obvious to the admin. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <Database size={16} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Source of truth</p>
            <p className="text-[10px] font-bold text-slate-800">MySQL — portfolio_items</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <LayoutGrid size={16} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Public home page</p>
            <p className="text-[10px] font-bold text-slate-800">Project Portfolio carousel</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Briefcase size={16} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Live entries</p>
            <p className="text-[10px] font-bold text-slate-800">
              {items.filter((i) => i.status === 'published' && i.is_active).length} published &amp; visible
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-[9px] font-bold">
          <AlertCircle size={14} /> {error}
        </div>
      ) : null}
      {notice ? (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-[9px] font-bold">
          <CheckCircle size={14} /> {notice}
        </div>
      ) : null}

      <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Plus size={14} className="text-teal-500" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700">
            {editingId ? `Editing #${editingId}` : 'New Portfolio Entry'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Title">
            <input className={inputCls} value={form.title} onChange={set('title')} required />
          </Field>
          <Field label="Client">
            <input className={inputCls} value={form.client_name} onChange={set('client_name')} />
          </Field>
          <Field label="Sector">
            <input className={inputCls} value={form.sector} onChange={set('sector')} placeholder="Technology" />
          </Field>
        </div>
        <Field label="Summary" hint="Shown on the public portfolio tile.">
          <textarea rows={2} className={inputCls} value={form.summary} onChange={set('summary')} />
        </Field>
        <Field label="Details">
          <textarea rows={4} className={inputCls} value={form.body} onChange={set('body')} />
        </Field>
        <Field label="Image URL" hint="Absolute URL or a path under /images.">
          <input className={inputCls} value={form.image_url} onChange={set('image_url')} />
        </Field>
        <Field label="Outcomes" hint='One per line, "metric | label" — e.g. "35% | Faster delivery".'>
          <textarea rows={3} className={inputCls} value={form.outcomes} onChange={set('outcomes')} />
        </Field>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={set('status')}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <Field label="Order">
            <input type="number" className={inputCls} value={form.sort_order} onChange={set('sort_order')} />
          </Field>
          <Field label="Featured">
            <select
              className={inputCls}
              value={form.is_featured ? '1' : '0'}
              onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.value === '1' }))}
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </Field>
          <Field label="Visible">
            <select
              className={inputCls}
              value={form.is_active ? '1' : '0'}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === '1' }))}
            >
              <option value="1">Shown</option>
              <option value="0">Hidden</option>
            </select>
          </Field>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
          >
            <Save size={12} /> {busy ? 'Saving…' : editingId ? 'Save changes' : 'Create entry'}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
            >
              <X size={12} /> Cancel
            </button>
          ) : null}
        </div>
      </form>

      {/* Projects handled by the company, posted by the admin. */}
      <TableShell caption="Portfolio entries" count={items.length}>
        <thead>
          <tr>
            <Th className="w-12">#</Th>
            <Th>Project</Th>
            <Th>Client</Th>
            <Th>Sector</Th>
            <Th className="min-w-[220px]">Summary</Th>
            <Th>Outcomes</Th>
            <Th>Featured</Th>
            <Th>Status</Th>
            <Th>Order</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && !loading ? (
            <tr>
              <td colSpan={10} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Briefcase size={22} className="text-slate-300" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    No portfolio entries yet
                  </p>
                  <p className="text-[9px] text-slate-400 max-w-sm">
                    Create the first entry above — it posts to the database and appears in the
                    Project Portfolio carousel on the public home page once published and visible.
                  </p>
                </div>
              </td>
            </tr>
          ) : null}
          {items.map((item) => (
            <tr
              key={item.id}
              className={`border-b border-slate-100 last:border-0 transition-colors ${
                editingId === item.id ? 'bg-teal-50/40' : 'hover:bg-slate-50/60'
              }`}
            >
              <Td className="text-slate-400 font-bold">#{item.id}</Td>
              <Td className="font-black text-slate-900 uppercase min-w-[150px]">{item.title}</Td>
              <Td><Cell value={item.client_name} /></Td>
              <Td><Cell value={item.sector} /></Td>
              <Td>
                <span className="line-clamp-2">{item.summary}</span>
              </Td>
              <Td>
                {Array.isArray(item.outcomes) && item.outcomes.length ? (
                  <div className="flex flex-wrap gap-1">
                    {item.outcomes.map((o, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[7px] font-bold text-slate-600 whitespace-nowrap"
                      >
                        {o.metric}{o.label ? ` · ${o.label}` : ''}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </Td>
              <Td>
                <span
                  className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border whitespace-nowrap ${
                    item.is_featured
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {item.is_featured ? 'Yes' : 'No'}
                </span>
              </Td>
              <Td><StatusPill status={item.status} active={item.is_active} /></Td>
              <Td className="font-bold whitespace-nowrap">{item.sort_order}</Td>
              <Td>
                <div className="flex justify-end">
                  <RowActions item={item} onToggle={toggle} onEdit={startEdit} onDelete={remove} />
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

export default PortfolioManager;
