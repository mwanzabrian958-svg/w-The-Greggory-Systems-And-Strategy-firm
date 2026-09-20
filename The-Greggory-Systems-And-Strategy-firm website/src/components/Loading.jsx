import { useEffect, useId, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   GSSF "SIGNAL CORE" LOADING SYSTEM  —  src/components/Loading.jsx
   ───────────────────────────────────────────────────────────────────────────
   Every loading moment in the product renders through this file, so the whole
   site (public pages, client portal, admin console) shares ONE loader language
   instead of a dozen ad-hoc spinners.

   Design: an animated emblem — a gradient "sweep" tracing the outer ring, a
   slow arc carrying an orbiting node, a counter-rotating dashed ring and a
   breathing hexagonal core — above micro-caps status copy with a shimmer and a
   travelling progress rail. Skeleton loaders borrow the same shimmer.

   Usage
     <Spinner size={16} />                       // inside buttons / inputs
     <InlineLoader label="Compiling matrix…" />  // a block of a page
     <SectionLoader label="…" rows={3} />        // card / panel
     <PageLoader label="…" tone="gold" />        // whole page
     <LoadingOverlay show={busy} label="…" />    // auth overlays
     <SkeletonTable rows={6} cols={5} />         // tables

   Accessibility: role="status" + aria-live="polite" + sr-only text, and every
   animation collapses to a static composition under prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════════════════════ */

// Tone → text colour (drives currentColor) + accent used for the second arc,
// the orbiting node and the core pip. Picked from the existing brand palette.
const TONES = {
  gold: { text: 'text-gold-500', accent: '#2dd4bf' },
  teal: { text: 'text-teal-500', accent: '#eab308' },
  emerald: { text: 'text-emerald-500', accent: '#eab308' },
  sage: { text: 'text-[#8fb28a]', accent: '#d1a257' },
  brand: { text: 'text-[#39543b]', accent: '#aa7d3f' },
  ink: { text: 'text-slate-900', accent: '#0d9488' },
  slate: { text: 'text-slate-500', accent: '#14b8a6' },
  white: { text: 'text-white', accent: '#eab308' },
};
export const toneOf = (t) => TONES[t] || TONES.gold;

/**
 * The animated emblem itself. `size` is in px; below ~26px a simplified,
 * crisper geometry is used (the full emblem turns to mush at icon sizes).
 */
export function Emblem({ size = 44, tone = 'gold', className = '' }) {
  const uid = useId().replace(/[:]/g, '');
  const { text, accent } = toneOf(tone);
  const compact = size < 26;
  const grad = `url(#${uid}-arc)`;

  return (
    <span
      className={`ldr-emblem ${text} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="ldr-glow" />
      {compact ? (
        <svg viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="15" stroke="currentColor" strokeOpacity="0.16" strokeWidth="3" />
          <g className="ldr-arc-fast">
            <circle
              cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="3"
              strokeLinecap="round" strokeDasharray="26 68"
            />
          </g>
          <g className="ldr-arc-rev">
            <circle cx="20" cy="20" r="8" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 120 120" fill="none">
          <defs>
            <linearGradient id={`${uid}-arc`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="currentColor" />
              <stop offset="55%" stopColor={accent} />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* static guides */}
          <circle cx="60" cy="60" r="53" stroke="currentColor" strokeOpacity="0.13" />
          <circle cx="60" cy="60" r="39" stroke="currentColor" strokeOpacity="0.07" strokeDasharray="2 7" />

          {/* travelling sweep */}
          <circle className="ldr-sweep" cx="60" cy="60" r="53" stroke={grad} strokeWidth="2.6" strokeLinecap="round" />

          {/* slow arc + orbiting node */}
          <g className="ldr-arc-slow">
            <circle cx="60" cy="60" r="46" stroke={grad} strokeWidth="2" strokeLinecap="round" strokeDasharray="62 227" />
            <circle cx="60" cy="14" r="3.4" fill={accent} />
          </g>

          {/* counter-rotating dashed ring */}
          <g className="ldr-arc-rev">
            <circle
              cx="60" cy="60" r="34" stroke="currentColor" strokeOpacity="0.5"
              strokeWidth="1.4" strokeLinecap="round" strokeDasharray="10 15"
            />
          </g>

          {/* breathing hex core */}
          <g className="ldr-core">
            <rect x="49" y="49" width="22" height="22" rx="4.5" stroke={grad} strokeWidth="2" />
            <rect x="56.5" y="56.5" width="7" height="7" rx="1.6" fill={accent} fillOpacity="0.92" />
          </g>
        </svg>
      )}
    </span>
  );
}


/** Indeterminate progress rail (the elegant replacement for bouncing dots). */
export function Rail({ tone = 'gold', className = '', width = 'w-56' }) {
  const { text } = toneOf(tone);
  return (
    <div className={`ldr-rail ${text} ${width} ${className}`} aria-hidden="true">
      <span className="ldr-rail-bar" />
    </div>
  );
}

/** Equaliser bars — same rhythm as the rail, for tight spaces. */
export function Bars({ tone = 'gold', className = '' }) {
  const { text } = toneOf(tone);
  return (
    <span className={`ldr-bars ${text} ${className}`} aria-hidden="true">
      <i /><i /><i /><i /><i />
    </span>
  );
}

/** Rotates through status lines so long waits stay informative, not static. */
export function useCyclingText(lines, interval = 2600) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!lines || lines.length < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % lines.length), interval);
    return () => clearInterval(id);
  }, [lines, interval]);
  if (!lines || lines.length === 0) return null;
  return lines[Math.min(index, lines.length - 1)];
}

/** Bare spinner for buttons, inputs and icon slots. */
export function Spinner({ size = 20, tone = 'gold', className = '', label = 'Loading' }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`} role="status" aria-live="polite">
      <Emblem size={size} tone={tone} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * Card/panel loader with optional shimmer rows that echo the content about to
 * replace it (calmer and more informative than a lone spinner).
 */
export function SectionLoader({
  label = 'Loading…',
  sublabel,
  rows = 0,
  tone = 'slate',
  className = '',
  maxWidth = 'max-w-2xl',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 py-12 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Emblem size={52} tone={tone} />
      <div className={`flex flex-col items-center gap-3 ${toneOf(tone).text}`}>
        <p className="ldr-label">{label}</p>
        <Rail tone={tone} width="w-44" />
        {sublabel && <p className="ldr-sublabel">{sublabel}</p>}
      </div>
      {rows > 0 && (
        <div className={`w-full ${maxWidth} space-y-3 mt-2 ${toneOf('slate').text}`} aria-hidden="true">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="ldr-skel h-10" />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Whole-page loader. The surface stays with the caller (pass the same bg the
 * page uses) so it never flashes a mismatched backdrop.
 */
export function PageLoader({
  label = 'Loading…',
  sublabel,
  messages,
  tone = 'gold',
  className = 'bg-white dark:bg-slate-900',
  minHeight = 'min-h-screen',
  emblemSize = 104,
}) {
  const cycled = useCyclingText(messages);
  const text = cycled || label;
  return (
    <div
      className={`${minHeight} w-full flex items-center justify-center relative overflow-hidden ${toneOf(tone).text} ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="ldr-backdrop" />
      <span
        className="absolute w-[440px] h-[440px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, currentColor, transparent 70%)', opacity: 0.16 }}
      />
      <div className="relative flex flex-col items-center px-6">
        <Emblem size={emblemSize} tone={tone} />
        <div className="mt-9 flex flex-col items-center gap-4">
          <p className="ldr-label text-center">{text}</p>
          <Rail tone={tone} width="w-56" />
          {sublabel && <p className="ldr-sublabel">{sublabel}</p>}
        </div>
      </div>
    </div>
  );
}

/**
 * Full-screen blocking overlay (auth handshakes, destructive operations).
 * `status` renders a small step checklist; `success` swaps the emblem for a
 * confirmation state without changing the layout.
 */
export function LoadingOverlay({
  show = true,
  label = 'Processing…',
  sublabel,
  messages,
  status = [],
  success = false,
  successLabel = 'Confirmed',
  tone = 'gold',
  className = '',
}) {
  const cycled = useCyclingText(messages);
  if (!show) return null;
  const activeTone = success ? 'emerald' : tone;
  const { text } = toneOf(activeTone);
  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/92 backdrop-blur-xl ${text} ${className}`}
      role="status"
      aria-live="polite"
      aria-busy={!success}
    >
      <span className="ldr-backdrop" />
      <span
        className="absolute w-[560px] h-[560px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, currentColor, transparent 70%)', opacity: 0.18 }}
      />
      <div className="relative flex flex-col items-center px-6 text-center">
        <Emblem size={116} tone={activeTone} />
        <div className="mt-9 flex flex-col items-center gap-4 max-w-sm">
          <p className="ldr-label">{success ? successLabel : cycled || label}</p>
          {!success && <Rail tone={activeTone} width="w-56" />}
          {status.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-left">
              {status.map((step, i) => (
                <li key={i} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.25em] opacity-70">
                  <span className="w-1 h-1 rounded-full bg-current" />
                  {step}
                </li>
              ))}
            </ul>
          )}
          {sublabel && !success && <p className="ldr-sublabel">{sublabel}</p>}
                </div>
      </div>
    </div>
  );
}

/* ── Skeletons ─────────────────────────────────────────────────────────────
   Same shimmer as the emblem's rail, so a loading table and a loading page
   look like two states of one system. */

/** Generic shimmer block. Size it with Tailwind (h-4, w-32, rounded-lg…). */
export function Skeleton({ className = 'h-4 w-full', tone = 'slate' }) {
  return <div className={`ldr-skel ${className} ${toneOf(tone).text}`} aria-hidden="true"></div>;
}

/** Paragraph placeholder: last line shortened like real ragged text. */
export function SkeletonText({ lines = 3, className = '', tone = 'slate' }) {
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          tone={tone}
          className={`h-3 ${i === lines - 1 ? 'w-2/5' : i % 2 ? 'w-11/12' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/** Card placeholder matching the site's rounded card rhythm. */
export function SkeletonCard({ className = '', rows = 3, tone = 'slate' }) {
  return (
    <div className={`rounded-2xl border border-black/5 dark:border-white/10 p-5 ${className}`} aria-hidden="true">
      <div className="flex items-center gap-3">
        <Skeleton tone={tone} className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton tone={tone} className="h-3 w-1/3" />
          <Skeleton tone={tone} className="h-2.5 w-1/2" />
        </div>
      </div>
      <div className="mt-5">
        <SkeletonText lines={rows} tone={tone} />
      </div>
    </div>
  );
}

/** One table/list row. */
export function SkeletonRow({ cols = 4, tone = 'slate' }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton tone={tone} className={`h-3 ${i === 0 ? 'w-3/4' : i === cols - 1 ? 'w-1/3' : 'w-1/2'}`} />
        </td>
      ))}
    </tr>
  );
}

/** Full table placeholder (drop inside an existing <tbody>). */
export function SkeletonTableRows({ rows = 6, cols = 5, tone = 'slate' }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} tone={tone} />
      ))}
    </>
  );
}

/** Standalone table shell — header + shimmer rows, for pages that early-return. */
export function SkeletonTable({ rows = 6, cols = 5, tone = 'slate', className = '' }) {
  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 ${className}`}>
      <table className="w-full">
        <tbody>
          <SkeletonTableRows rows={rows} cols={cols} tone={tone} />
        </tbody>
      </table>
    </div>
  );
}

/** Grid of card placeholders (dashboards, galleries). */
export function SkeletonGrid({ items = 6, rows = 2, cols = 'sm:grid-cols-2 lg:grid-cols-3', tone = 'slate', className = '' }) {
  return (
    <div className={`grid grid-cols-1 ${cols} gap-6 ${className}`} aria-hidden="true">
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} rows={rows} tone={tone} />
      ))}
    </div>
  );
}

/** Centred loader for a section of a page (replaces "RefreshCw + Loading…"). */
export function InlineLoader({ label = 'Loading…', size = 34, tone = 'teal', className = '', rail = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-10 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Emblem size={size} tone={tone} />
      <div className={`flex flex-col items-center gap-2 ${toneOf(tone).text}`}>
        <p className="ldr-label">{label}</p>
        {rail && <Rail tone={tone} width="w-40" />}
      </div>
    </div>
  );
}

export default {
  Emblem, Spinner, InlineLoader, SectionLoader, PageLoader, LoadingOverlay,
  Rail, Bars, Skeleton, SkeletonText, SkeletonCard, SkeletonRow,
  SkeletonTableRows, SkeletonTable, SkeletonGrid, useCyclingText,
};
