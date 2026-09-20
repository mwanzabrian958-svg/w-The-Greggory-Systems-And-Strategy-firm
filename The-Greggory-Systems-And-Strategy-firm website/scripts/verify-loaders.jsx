/**
 * verify-loaders.jsx — SSR regression test for the "Signal Core" loading system.
 *
 * Why this exists: Loading.jsx is imported by ~60 files, so a typo or a missing
 * symbol used to build cleanly (esbuild/rollup don't fail on undefined
 * identifiers) and only blow up at runtime when a loading state mounted. This
 * bundles the module with esbuild and statically renders every exported loader,
 * every tone (including a bogus one, to prove the fallback) and every skeleton.
 *
 * Run: npm run test:loaders
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Emblem, Spinner, InlineLoader, SectionLoader, PageLoader,
  LoadingOverlay, Rail, Bars, Skeleton, SkeletonText, SkeletonCard,
  SkeletonRow, SkeletonTableRows, SkeletonTable, SkeletonGrid, toneOf,
} from '../src/components/Loading.jsx';

const cases = {
  Emblem: <Emblem />,
  'Emblem compact': <Emblem size={14} tone="white" />,
  'Emblem every tone': ['gold', 'teal', 'emerald', 'sage', 'brand', 'ink', 'slate', 'white', 'bogus']
    .map((t) => <Emblem key={t} tone={t} />),
  Spinner: <Spinner />,
  Rail: <Rail />,
  Bars: <Bars />,
  InlineLoader: <InlineLoader label="x" rail />,
  SectionLoader: <SectionLoader label="x" rows={3} />,
  PageLoader: <PageLoader label="x" messages={['a', 'b']} sublabel="s" />,
  'PageLoader dark': <PageLoader label="x" className="bg-[#0f172a]" minHeight="min-h-[40vh]" emblemSize={72} />,
  LoadingOverlay: <LoadingOverlay label="x" status={['a', 'b']} />,
  'LoadingOverlay success': <LoadingOverlay success successLabel="Done" />,
  'LoadingOverlay hidden': <LoadingOverlay show={false} />,
  Skeleton: <Skeleton />,
  SkeletonText: <SkeletonText lines={4} />,
  SkeletonCard: <SkeletonCard rows={2} />,
  SkeletonTableRows: <table><tbody><SkeletonTableRows rows={3} cols={4} /></tbody></table>,
  SkeletonTable: <SkeletonTable rows={2} cols={3} />,
  SkeletonGrid: <SkeletonGrid items={2} />,
  toneOf: <span>{toneOf('nope').text}</span>,
};

let failed = 0;
for (const [name, el] of Object.entries(cases)) {
  const allowsNull = name === 'LoadingOverlay hidden';
  try {
    const html = renderToStaticMarkup(el);
    if (!allowsNull && (!html || html.length === 0)) throw new Error('rendered empty');
    console.log(`PASS  ${name}  (${html.length} chars)${allowsNull ? ' [null expected]' : ''}`);
  } catch (err) {
    failed += 1;
    console.log(`FAIL  ${name}  ->  ${err.message}`);
  }
}
console.log(failed === 0 ? '\nSSR TEST: ALL PASS' : `\nSSR TEST: ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
