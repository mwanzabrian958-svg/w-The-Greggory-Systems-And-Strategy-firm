import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogIn, ChevronDown, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import companies from '../data/companies'

// ── ORANGE NAVBAR ────────────────────────────────────────────────────────────
// The bar itself is brand orange. Everything inside it is deliberately DARK
// (orange-950) rather than white: white on orange-500 is only 2.80:1, well
// under the 4.5:1 WCAG AA threshold for body text, whereas orange-950 on
// orange-500 is 5.58:1 and stays comfortably legible.
//
// Hierarchy comes from OPACITY, not from a lighter hue. The obvious "muted"
// pick, orange-900, is only 3.34:1 on this bar -- it reads as grey on a dark
// theme but it is a genuine AA failure here, and it was in the first pass.
// orange-950 at 90% keeps the visual step down while measuring 4.75:1.
//
// Gold never carries text or rules ON the bar. It survives only on the surfaces
// where it still passes: the white dropdown panel (4.98:1 as gold-600 hover on
// the dark panel) and the client-chip avatar, which is a dark slate-950 initial
// on gold-500 (10.52:1) rather than gold-on-orange.
//
// Every value below is measured, not eyeballed; run
// `node scripts/check-navbar-contrast.js` to reprint the table. Ratios are
// against the surface each one actually sits on, including the translucent
// white/25 client chip, which lightens to #fb9650.
//
// `border-b` is required alongside the border COLOUR: Tailwind's preflight
// resets every border-width to 0, so `border-orange-600` on its own would set
// a colour for an invisible border and silently drop the separator.
const NAV_BG = 'bg-orange-500 dark:bg-orange-500 border-b border-orange-600 dark:border-orange-600';
// Dark text for use ON the orange bar. 5.58:1 on orange-500.
const NAV_TEXT = 'text-orange-950 dark:text-orange-950';
// 4.75:1 on the bar, 5.95:1 on the client chip -- AA in both places.
const NAV_TEXT_MUTED = 'text-orange-950/90 dark:text-orange-950/90';

// The mobile panel sits on orange-500, NOT the orange-600 it used before:
// orange-950 on orange-600 measures 4.40:1, which is a hair under AA for body
// text. Matching the bar keeps the ratio at 5.58:1, so opening the menu does
// not silently drop the whole panel below the contrast it was designed for.
const NAV_PANEL_BG = 'bg-orange-500 border-t border-orange-700';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [companiesDropdownOpen, setCompaniesDropdownOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const scrollTimer = useRef(null)

  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout, user } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(false)
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
      scrollTimer.current = setTimeout(() => {
        setIsVisible(true)
      }, 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
    }
  }, [])

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
      path: user?.admin_level || user?.developer_level ? '/admin' : '/client-portal'
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
    <nav className={`${NAV_BG} sticky top-0 z-50 shadow-lg shadow-orange-900/20 transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
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
                        // Active page is signalled by a dark underline rule rather
                        // than the old gold text, which would vanish on orange.
                        location.pathname === item.path
                          ? `${NAV_TEXT} border-b-2 border-orange-950`
                          : `${NAV_TEXT_MUTED} hover:text-orange-950`
                      }`}
                    >
                      {item.name}
                    </Link>
                    {item.name === 'Home' && (
                      <div className="mt-1">
                        {isAuthenticated ? (
                          <button
                            onClick={handleLogout}
                            className="bg-orange-950 text-orange-50 px-2.5 py-1 rounded-full text-[10px] font-black hover:bg-orange-900 transition-all shadow-lg"
                          >
                            LOGOUT
                          </button>
                        ) : (
                          <Link
                            to="/login"
                            className="bg-orange-950 text-orange-50 px-2.5 py-1 rounded-full text-[10px] font-black hover:bg-orange-900 transition-all shadow-lg inline-flex items-center gap-1"
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

          <div className="flex items-center space-x-3 sm:space-x-4 bg-white/25 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-orange-800/25 backdrop-blur-md min-w-0">
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
                <div className="hidden lg:block text-sm font-black text-orange-950 tracking-wide uppercase transition-colors">
                  {user.display_name || user.name || 'User'}
                </div>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-3 group">
                <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-full bg-orange-950 text-orange-50 flex items-center justify-center text-sm font-black border-2 border-white/30 transition-all">
                  <User size={16} className="sm:hidden" />
                  <User size={18} className="hidden sm:block" />
                </div>
                <div className="hidden lg:block text-xs font-black text-orange-950 tracking-widest uppercase group-hover:text-orange-950 transition-colors">
                  Client Access
                </div>
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-orange-950 hover:bg-white/20"
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
                    <Link key={sub.path + sub.name} to={sub.path} onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-lg font-bold text-orange-950 hover:bg-white/20 transition-colors">
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
                    ? 'bg-orange-950 text-orange-50'
                    : 'text-orange-950 hover:bg-white/20'
                }`}
              >
                {item.name}
              </Link>
              )
            ))}
            {isAuthenticated && (
               <button onClick={() => { setIsOpen(false); handleLogout() }} className="w-full bg-orange-950 text-orange-50 px-4 py-2 rounded-xl text-sm font-bold border border-orange-900 transition-colors">Logout</button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
