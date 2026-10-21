import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogIn, ChevronDown, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import companies from '../data/companies'

// ── NAVY NAVBAR ──────────────────────────────────────────────────────────────
// The bar is the brand navy (#0f172a). It stays navy in BOTH light and dark
// mode so the header reads the same across the whole site.
//
// On navy, text is LIGHT (white), which measures ~16:1 -- far above the 4.5:1
// WCAG AA threshold for body text. Hierarchy comes from opacity (white/80 for
// the muted step) plus a gold accent for the active underline and hover, not
// from a darker hue.
//
// Gold never carries plain text ON the bar; it is used as an accent rule (the
// active underline) and as the solid fill of the pill buttons + client-chip
// avatar, where gold-500 pairs with dark slate-950 text (10.5:1).
//
// Every value is measured, not eyeballed; ratios are against the surface each
// one sits on, including the translucent white/25 client chip, which lightens
// the navy beneath it.
//
// `border-b` is required alongside the border COLOUR: Tailwind's preflight
// resets every border-width to 0, so a border colour on its own would set a
// colour for an invisible border and silently drop the separator.
const NAV_BG = 'bg-[#0f172a] dark:bg-[#0f172a] border-b border-[#1e293b] dark:border-[#1e293b]';
// Light text for use ON the navy bar.
const NAV_TEXT = 'text-white dark:text-white';
// 80% white for the muted step -- still well above AA on navy.
const NAV_TEXT_MUTED = 'text-white/80 dark:text-white/80';

// The mobile panel matches the bar colour so opening the menu does not shift
// the background.
const NAV_PANEL_BG = 'bg-[#0f172a] border-t border-[#1e293b]';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [companiesDropdownOpen, setCompaniesDropdownOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const scrollTimer = useRef(null)
  const navRef = useRef(null)

  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout, user } = useAuth()

  useEffect(() => {
    let lastY = window.scrollY

    const handleScroll = () => {
      const y = window.scrollY

      // Always show the bar at the very top of the page.
      if (y <= 8) {
        setIsVisible(true)
        if (scrollTimer.current) clearTimeout(scrollTimer.current)
        lastY = y
        return
      }

      // Only react to a DELIBERATE scroll (ignore sub-threshold jitter from
      // trackpads / momentum). Without this, a 1-2px up-flick mid-scroll
      // toggles the bar and restarts its animation, which reads as "struggling".
      const delta = y - lastY
      if (Math.abs(delta) > 6) {
        // Hide while scrolling down, reveal the moment the user scrolls up.
        setIsVisible(delta < 0)
        lastY = y
      }

      // Safety net: no matter the direction, if scrolling STOPS, bring the
      // navbar back. This is what guarantees it reappears once the scroll is
      // complete. Each scroll event resets the timer, so it only fires after
      // the user actually stops.
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
      scrollTimer.current = setTimeout(() => setIsVisible(true), 250)
    }

    // NOTE: we deliberately do NOT use the `scrollend` event as an immediate
    // "show" trigger: Chrome fires it after every discrete wheel tick settles,
    // which would instantly re-show the bar between notches (flicker). The
    // 250ms debounce below is the single source of truth for "scrolling has
    // stopped" — it cannot be starved anymore because the scroll-anchoring
    // feedback loop (negative-margin collapse) has been removed.

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
    }
  }, [])

  // NOTE: the bar used to collapse the space it reserved with a negative
  // margin when hidden. That mutated layout ABOVE the viewport while the
  // page was scrolled, which made Chrome's scroll anchoring compensate
  // scrollY — firing synthetic scroll events that re-hid the bar and reset
  // its idle timer in an endless loop (diagnosed: 78 scroll events + 29
  // visibility flips in 3 seconds of zero input; bar stuck hidden).
  // `.site-header` is now a transparent sticky frame, so content slides
  // beneath the bar with zero layout involvement instead — no margin, no
  // anchoring, no loop, no content jump on reveal.

  // Always attempt to load the photo if we have a user ID; fall back to initials on error.
  // This avoids depending solely on has_photo (which may be stale in localStorage for sessions
  // created before the photo flag was added to the login response).
  const userId = user?.id || user?.userId
  const profilePhotoUrl = userId ? `/api/users/profile-photo/${userId}` : null

  const navigation = [
    { name: 'Home', path: '/' },
    {
      name: 'Our Companies',
      path: '/companies',
      dropdown: companies
    },
    { name: 'About Us', path: '/about' },
    { name: 'Our Services', path: '/services' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
    ...(isAuthenticated && user ? [{
      name: 'Client Portal',
      path: user?.admin_level ? '/admin' : '/client-portal'
    }] : []),
  ]

  const handleLogout = () => {
    // Fire the backend invalidation + local cleanup, then navigate.
    // We don't await so the UI transitions immediately; any backend
    // failure is ignored and doesn't block the redirect.
    logout().catch(() => {})
    navigate('/')
  }

  return (
    <nav
      ref={navRef}
      className={`${NAV_BG} z-50 shadow-lg shadow-black/20 transition-all duration-300 ease-out will-change-transform ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24 sm:h-28">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <img
                                src="/brand-header.jpg"
                alt="Logo"
                className="h-14 sm:h-18 w-auto object-contain brightness-110 contrast-110"
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative group flex items-center">
                {item.dropdown ? (
                  <>
                    <button
                      className={`flex items-center text-base font-bold ${NAV_TEXT} hover:bg-white/20 rounded-lg transition-colors py-2 px-1 -mx-1`}
                      onClick={() => setCompaniesDropdownOpen(!companiesDropdownOpen)}
                      onMouseEnter={() => setCompaniesDropdownOpen(true)}
                      aria-expanded={companiesDropdownOpen}
                      aria-haspopup="true"
                    >
                      {item.name}
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-300 ${companiesDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {companiesDropdownOpen && (
                      <div
                        className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl py-4 z-50"
                        onMouseLeave={() => setCompaniesDropdownOpen(false)}
                      >
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.path + subItem.name}
                            to={subItem.path}
                            onClick={() => setCompaniesDropdownOpen(false)}
                            className="flex items-center px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-gold-600 transition-all"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <Link
                      to={item.path}
                      className={`text-base font-bold transition-all py-2 ${
                        // Active page is signalled by a gold underline rule.
                        location.pathname === item.path
                          ? `${NAV_TEXT} border-b-2 border-gold-500`
                          : `${NAV_TEXT_MUTED} hover:text-gold-400`
                      }`}
                    >
                      {item.name}
                    </Link>
                    {item.name === 'Home' && (
                      <div className="mt-1">
                        {isAuthenticated ? (
                          <button
                            onClick={handleLogout}
                            className="bg-gold-500 text-slate-950 px-2.5 py-1 rounded-full text-[10px] font-black hover:bg-gold-400 transition-all shadow-lg"
                          >
                            LOGOUT
                          </button>
                        ) : (
                          <Link
                            to="/login"
                            className="bg-gold-500 text-slate-950 px-2.5 py-1 rounded-full text-[10px] font-black hover:bg-gold-400 transition-all shadow-lg inline-flex items-center gap-1"
                          >
                            <LogIn size={12} />
                            LOGIN
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 bg-white/25 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-white/20 backdrop-blur-md min-w-0">
            {isAuthenticated && user ? (
              <>
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt="User"
                    className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-full object-cover aspect-square border-2 border-gold-500/50 bg-slate-200 dark:bg-white/10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-full bg-gold-500 flex items-center justify-center text-slate-950 text-xs sm:text-sm font-black border-2 border-white/20"
                  style={{ display: profilePhotoUrl ? 'none' : 'flex' }}
                >
                  {user.first_name ? user.first_name[0] : (user.name ? user.name[0] : 'U')}
                </div>
                <div className="hidden lg:block text-sm font-black text-white tracking-wide uppercase transition-colors">
                  {user.display_name || user.name || 'User'}
                </div>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-3 group">
                <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-full bg-white/15 text-white flex items-center justify-center text-sm font-black border-2 border-white/30 transition-all">
                  <User size={16} className="sm:hidden" />
                  <User size={18} className="hidden sm:block" />
                </div>
                <div className="hidden lg:block text-xs font-black text-white/80 tracking-widest uppercase group-hover:text-white transition-colors">
                  Client Access
                </div>
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-white hover:bg-white/20"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className={`md:hidden ${NAV_PANEL_BG} pb-8 px-4 animate-fade-in`}>
          <div className="flex flex-col space-y-2 mt-6">
            {navigation.map((item) => (
              item.dropdown ? (
                <div key={item.name}>
                  <p className={`px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-[0.3em] ${NAV_TEXT_MUTED}`}>{item.name}</p>
                  {item.dropdown.map((sub) => (
                    <Link key={sub.path + sub.name} to={sub.path} onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-lg font-bold text-white hover:bg-white/20 transition-colors">
                      {sub.name}
                    </Link>
                  ))}
                </div>
              ) : (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-xl text-lg font-bold transition-all ${
                  location.pathname === item.path
                    ? 'bg-gold-500 text-slate-950'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                {item.name}
              </Link>
              )
            ))}
            {isAuthenticated && (
               <button onClick={() => { setIsOpen(false); handleLogout() }} className="w-full bg-gold-500 text-slate-950 px-4 py-2 rounded-xl text-sm font-bold border border-gold-400 transition-colors">Logout</button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

