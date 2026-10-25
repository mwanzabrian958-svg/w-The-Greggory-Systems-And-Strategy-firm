import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { COOKIE_CONSENT_EVENT, COOKIE_CONSENT_STORAGE_KEY } from '../constants/cookieConsent'

function readConsent() {
  try {
    return window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
  } catch (error) {
    console.error('[cookie-consent] Could not read saved consent.', error)
    return null
  }
}

const CookieConsentBanner = () => {
  const [consent, setConsent] = useState(readConsent)

  const chooseConsent = (choice) => {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice)
    } catch (error) {
      console.error('[cookie-consent] Could not save consent.', error)
    }

    setConsent(choice)
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: choice }))
  }

  if (consent === 'accepted' || consent === 'rejected') return null

  return createPortal(
    <aside
      id="cookie-banner"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-[10000] border-t border-white/15 bg-slate-950 px-4 py-4 text-white shadow-[0_-12px_40px_rgba(0,0,0,0.45)]"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="max-w-3xl text-sm leading-relaxed text-slate-200">
          We use essential cookies to operate this site. With your permission, analytics cookies help us understand site usage.
          You can accept all cookies or reject cookies. Read our{' '}
          <Link to="/privacy" className="font-semibold text-white underline underline-offset-2 hover:text-gold-300">
            Privacy Policy
          </Link>.
        </p>
        <div className="flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            onClick={() => chooseConsent('rejected')}
            className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Reject cookies
          </button>
          <button
            type="button"
            onClick={() => chooseConsent('accepted')}
            className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
          >
            Accept all cookies
          </button>
        </div>
      </div>
    </aside>,
    document.body
  )
}

export default CookieConsentBanner
