// Ad-hoc WCAG check for the orange navbar palette. Not shipped; run with:
//   node scripts/check-navbar-contrast.js
// Kept out of the build so the ratios stay reproducible without a browser.

function hexToRgb(hex) {
  const int = parseInt(hex.replace('#', ''), 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}
function luminance(c) {
  const f = (v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b)
}
function contrast(a, b) {
  const A = luminance(a)
  const B = luminance(b)
  return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05)
}
// Composite a translucent foreground over an opaque backdrop.
function blend(fg, alpha, bg) {
  return {
    r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
  }
}

const ORANGE_500 = hexToRgb('#f97316')
const ORANGE_900 = hexToRgb('#7c2d12')
const ORANGE_950 = hexToRgb('#431407')
const WHITE = hexToRgb('#ffffff')
const ORANGE_50 = hexToRgb('#fff7ed')

// The client chip is bg-white/25 over the bar, so it lightens the surface.
const CHIP_BG = blend(WHITE, 0.25, ORANGE_500)

// `required: false` rows document colours that were considered and REJECTED.
// They are printed so the rejected options stay visible as a record of why
// they are not used, but they must not fail the run.
const CASES = [
  ['white on orange-500', WHITE, ORANGE_500, 4.5, false],
  ['orange-950 on orange-500 (bar)', ORANGE_950, ORANGE_500, 4.5, true],
  ['orange-900 on orange-500', ORANGE_900, ORANGE_500, 4.5, false],
  ['orange-950/90 on orange-500 (muted)', blend(ORANGE_950, 0.9, ORANGE_500), ORANGE_500, 4.5, true],
  ['orange-950 on orange-600 (old mobile panel)', ORANGE_950, hexToRgb('#ea580c'), 4.5, false],
  ['orange-950 on chip bg', ORANGE_950, CHIP_BG, 4.5, true],
  ['orange-950/90 on chip bg', blend(ORANGE_950, 0.9, CHIP_BG), CHIP_BG, 4.5, true],
  ['orange-950 on hover white/20', ORANGE_950, blend(WHITE, 0.2, ORANGE_500), 4.5, true],
  ['orange-950 on hover orange-950/15', ORANGE_950, blend(ORANGE_950, 0.15, ORANGE_500), 4.5, false],
  ['orange-50 on orange-950 (LOGIN btn)', ORANGE_50, ORANGE_950, 4.5, true],
  ['orange-50 on orange-900 (btn hover)', ORANGE_50, ORANGE_900, 4.5, true],
]

let failed = 0
for (const [name, fg, bg, min, required] of CASES) {
  const ratio = contrast(fg, bg)
  const ok = ratio >= min
  if (!ok && required) failed++
  const verdict = ok ? 'PASS' : required ? 'FAIL' : 'skip'
  console.log(
    `${verdict}  ${ratio.toFixed(2).padStart(5)}:1  (min ${min})  ${name}` +
      (required ? '' : '   [reference only]')
  )
}

if (failed === 0) console.log('\nAll required pairs meet WCAG AA for normal text.')
else {
  console.log(`\n${failed} required pair(s) below AA.`)
  process.exitCode = 1
}
