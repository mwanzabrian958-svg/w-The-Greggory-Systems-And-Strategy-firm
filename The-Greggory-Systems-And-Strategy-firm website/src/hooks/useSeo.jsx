import { useEffect } from 'react'

// The public origin, resolved where it is actually knowable. Order:
//   1. VITE_SITE_URL — explicit override (set it to name a custom domain as the
//      canonical while the SPA is still served from onrender.com).
//   2. window.location.origin — this app serves the API and the built SPA from
//      ONE origin, so the browser always knows the answer: correct on Render, on
//      a custom domain, and on localhost, with zero build-time config.
//   3. LAST_RESORT_ORIGIN — only reached without a browser and without the env
//      var; keeps the constants below absolute.
// It used to be `import.meta.env.VITE_SITE_URL || 'http://localhost:5173'`, and
// VITE_SITE_URL is not declared in render.yaml — so every deployed page ran
// useSeo() and OVERWROTE the correct index.html canonical/og:url with a
// localhost one. Runtime resolution also survives future Render renames without
// a rebuild.
const LAST_RESORT_ORIGIN = 'https://w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com'

function normalizeOrigin(origin) {
  return String(origin || '')
    .trim()
    .replace(/\/+$/, '')
}

// The resolver also reports WHICH branch produced the origin, so the warning
// below fires only when the last-resort literal is genuinely in use. Comparing
// the value against LAST_RESORT_ORIGIN instead would warn on every deployed
// page, because the live browser origin legitimately equals that host.
function resolveSiteUrl() {
  const configured = normalizeOrigin(import.meta.env?.VITE_SITE_URL)
  if (configured) return { origin: configured, source: 'VITE_SITE_URL' }
  const browser = typeof window !== 'undefined' ? normalizeOrigin(window.location?.origin) : ''
  if (/^https?:/i.test(browser)) return { origin: browser, source: 'window.location.origin' }
  return { origin: LAST_RESORT_ORIGIN, source: 'last-resort' }
}

const { origin: SITE_URL, source: SITE_URL_SOURCE } = resolveSiteUrl()

if (import.meta.env?.PROD && SITE_URL_SOURCE === 'last-resort') {
  console.warn(
    '[seo] neither VITE_SITE_URL nor a browser origin was available — falling back to ' +
      SITE_URL +
      '. Normally window.location.origin covers this; set VITE_SITE_URL to canonicalise a custom domain.'
  )
}
const DEFAULT_IMAGE = `${SITE_URL}/hero-phoenix.jpg`
const SITE_NAME = 'The Greggory Systems And Strategy Firm'

function upsertTag(selector, create) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  return el
}

function setMetaName(name, content) {
  if (!content) return
  const el = upsertTag(`meta[name="${name}"]`, () => {
    const m = document.createElement('meta')
    m.setAttribute('name', name)
    return m
  })
  el.setAttribute('content', content)
}

function setMetaProperty(property, content) {
  if (!content) return
  const el = upsertTag(`meta[property="${property}"]`, () => {
    const m = document.createElement('meta')
    m.setAttribute('property', property)
    return m
  })
  el.setAttribute('content', content)
}

function setCanonical(path) {
  const href = path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
  const el = upsertTag('link[rel="canonical"]', () => {
    const l = document.createElement('link')
    l.setAttribute('rel', 'canonical')
    return l
  })
  el.setAttribute('href', href)
  return href
}

/**
 * useSeo — per-page titles, descriptions, canonical + social preview.
 * The SPA ships one index.html shell, so without this every route shares
 * one title/description (social unfurls + Google show the wrong page).
 */
export function useSeo({ title, description, path = '/', image, type = 'website' } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Strategic Systems & Business Solutions`
    document.title = fullTitle
    setMetaName('description', description)
    const canonical = setCanonical(path)
    const img = image?.startsWith('http') ? image : image ? `${SITE_URL}${image}` : DEFAULT_IMAGE
    setMetaProperty('og:type', type)
    setMetaProperty('og:site_name', SITE_NAME)
    setMetaProperty('og:title', fullTitle)
    setMetaProperty('og:description', description)
    setMetaProperty('og:url', canonical)
    setMetaProperty('og:image', img)
    setMetaProperty('og:image:alt', fullTitle)
    setMetaProperty('og:locale', 'en_US')
    setMetaName('twitter:card', 'summary_large_image')
    setMetaName('twitter:title', fullTitle)
    setMetaName('twitter:description', description)
    setMetaName('twitter:image', img)
  }, [title, description, path, image, type])
}

export const SEO = {
  home: {
    title: 'Strategic Systems, Business Consultancy & Project Delivery',
    description: 'We develop, maintain, upgrade, and stand behind the projects, systems, and platforms clients depend on — for individuals and organizations, for-profit and non-profit, across every industry.',
    path: '/',
  },
  about: {
    title: 'About Us — Leadership, Personnel & Philosophy',
    description: 'Meet the leadership and personnel behind The Greggory Systems And Strategy Firm and the ecosystem-thinking philosophy that guides every engagement.',
    path: '/about',
  },
  services: {
    title: 'Services — Operations Architecture, Strategy & Delivery',
    description: 'Project development, maintenance, upgrades, web & desktop applications, network build-out, and the business consultancy that turns delivery into lasting success.',
    path: '/services',
  },
  projects: {
    title: 'Client Portal — Projects, Billing & Documents',
    description: 'Track your projects, invoices, documents, and support conversations in the secure Greggory client portal.',
    path: '/projects',
  },
  caseStudies: {
    title: 'Case Studies — Delivery Results',
    description: 'Real engagements, real outcomes: faster delivery, lower waste, and measurable returns from Greggory systems work.',
    path: '/case-studies',
  },
  blog: {
    title: 'Strategic Journal — Insights & Analysis',
    description: 'Notes on systems design, strategy, and execution from The Greggory Systems And Strategy Firm.',
    path: '/blog',
  },
  contact: {
    title: 'Contact — Start the Conversation',
    description: 'Tell us about your project. Reach the firm by form, email, or WhatsApp — we respond to every serious inquiry.',
    path: '/contact',
  },
  pricing: {
    title: 'Pricing — Flexible Support Plans',
    description: 'Flexible support plans for organizations at different stages — from focused advisory to full delivery partnerships.',
    path: '/pricing',
  },
  companies: {
    title: 'Our Companies — The Greggory Network',
    description: 'The companies and practices operating under The Greggory Systems And Strategy Firm umbrella.',
    path: '/companies',
  },
  terms: {
    title: 'Terms of Use',
    description: 'A clear framework for working with The Greggory Systems And Strategy Firm.',
    path: '/terms',
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'How The Greggory Systems And Strategy Firm handles information across the site and service delivery.',
    path: '/privacy',
  },
  login: {
    title: 'Client Access — Sign In',
    description: 'Sign in to the secure Greggory client portal to track projects, invoices, and support.',
    path: '/login',
  },
  signup: {
    title: 'Create Your Client Account',
    description: 'Register for the Greggory client portal and bring your project under structured delivery.',
    path: '/signup',
  },
  forgotPassword: {
    title: 'Reset Your Password',
    description: 'Request a secure password reset link for your Greggory client portal account.',
    path: '/forgot-password',
  },
  resetPassword: {
    title: 'Choose a New Password',
    description: 'Complete the secure password reset for your Greggory client portal account.',
    path: '/reset-password',
  },
  personnel: {
    title: 'Team Member Profile',
    description: 'Meet a member of The Greggory Systems And Strategy Firm leadership and delivery team.',
    path: '/about',
  },
  notFound: {
    title: 'Page Not Found',
    description: 'The page you requested was moved, renamed, or never existed. Head home or contact support.',
    path: '/',
  },
}

export default useSeo
