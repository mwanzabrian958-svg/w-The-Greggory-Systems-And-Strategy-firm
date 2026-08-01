import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogIn, ChevronDown, Briefcase, User } from 'lucide-react'
import BrandHeader from './BrandHeader'
import { useAuth } from '../context/AuthContext'
import AuthPlatformModal from './AuthPlatformModal'
import companies from '../data/companies'
import { hasAdminToken } from '../utils/adminSession'
import { getApiUrl } from '../services/api'
import { SITE_NAME } from '../constants/siteBrand'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [companiesDropdownOpen, setCompaniesDropdownOpen] = useState(false)
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const scrollTimer = useRef(null)

  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout, user } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      // Hide the navbar as soon as scrolling starts
      setIsVisible(false)

      // Clear existing timer
      if (scrollTimer.current) clearTimeout(scrollTimer.current)

      // Show navbar again after scrolling stops (wait 200ms)
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
  // Use a relative path so the Vite proxy forwards it to the backend.
  // Works on both localhost:5173 and network IP (192.168.x.x:5173).
  const profilePhotoUrl = user?.has_photo && (user?.id || user?.userId)
    ? `/api/users/profile-photo/${user.id || user.userId}`
    : null

  const [hasAdminSessionToken, setHasAdminSessionToken] = useState(() => hasAdminToken())

  useEffect(() => {
    const sync = () => setHasAdminSessionToken(hasAdminToken())
    window.addEventListener('gf-admin-session-changed', sync)
    return () => window.removeEventListener('gf-admin-session-changed', sync)
  }, [])

  const navigation = [
    { name: 'Home', path: '/' },
    {
      name: 'Our Companies',
      path: '#',
      dropdown: companies
    },
    { name: 'About Us', path: '/about' },
    { name: 'Our Services', path: '/services' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
    ...(isAuthenticated && user ? [{
      name: 'Client Portal',
      path: user?.admin_level || user?.developer_level ? '/admin' : '/projects'
    }] : []),
  ]

  const clientPortalNav = [
    { name: 'Dashboard', path: '/client-portal' },
    { name: 'Client Portal', path: '/projects' },
    { name: 'Pricing', path: '/pricing' },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleAdminLoginSuccess = () => {
    console.log('[NAVBAR] Admin login success! Navigating to /admin...')
    setAdminLoginModalOpen(false)
    navigate('/admin')
  }

  const openAdminFromDirect = () => {
    // Silently block regular users from accessing admin
    if (isAuthenticated) return

    if (hasAdminSessionToken) {
      navigate('/admin')
    } else {
      setAdminLoginModalOpen(true)
    }
  }

  return (
    <>
      <nav className={`bg-[#07111f] border-b border-white/5 sticky top-0 z-50 shadow-2xl transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[120px] sm:h-[140px]">
            {/* Brand Header with Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="hover:opacity-90 transition-opacity">
                <img
                  src="/brand-header.png/sja.PNG"
                  alt="Company Brand"
                  className="h-[120px] sm:h-[150px] w-auto max-w-[320px] object-contain brightness-110 contrast-110"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navigation.map((item, index) => (
                <div key={item.path} className="relative group flex items-center">
                  {item.dropdown ? (
                    <>
                      <button
                        className="flex items-center text-base font-bold text-slate-300 hover:text-amber-400 transition-colors duration-300 py-2"
                        onClick={() => setCompaniesDropdownOpen(!companiesDropdownOpen)}
                      >
                        {item.name}
                        <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-300 ${companiesDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <div
                        className={`absolute left-0 top-full mt-2 w-80 bg-[#0f1f3d] border border-white/10 rounded-2xl shadow-2xl py-4 z-50 backdrop-blur-xl ${
                          companiesDropdownOpen ? 'block' : 'hidden'
                        }`}
                        onMouseLeave={() => setCompaniesDropdownOpen(false)}
                      >
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            onClick={() => setCompaniesDropdownOpen(false)}
                            className="flex items-center px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-amber-400 transition-all"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Link
                        to={item.path}
                        className={`text-base font-bold transition-all duration-300 py-2 ${
                          location.pathname === item.path
                            ? 'text-amber-400'
                            : 'text-slate-300 hover:text-amber-400'
                        }`}
                      >
                        {item.name}
                      </Link>
                      {item.name === 'Home' && (
                        <div className="mt-1">
                          {isAuthenticated ? (
                            <button
                              onClick={handleLogout}
                              className="bg-amber-500 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black hover:bg-amber-400 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20"
                            >
                              LOGOUT
                            </button>
                          ) : (
                            <Link
                              to="/login"
                              className="bg-amber-500 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black hover:bg-amber-400 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20 inline-flex items-center gap-1"
                            >
                              <LogIn size={14} />
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

            {/* User Profile Display */}
            <div className="flex items-center space-x-4 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
              {isAuthenticated && user ? (
                <>
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt={user.display_name || user.name}
                      className="h-10 w-10 rounded-full object-cover border-2 border-amber-500/50"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 text-sm font-black border-2 border-white/20">
                      {user.first_name ? user.first_name[0] : (user.name ? user.name[0] : 'U')}
                    </div>
                  )}
                  <div className="hidden lg:block text-sm font-black text-white tracking-wide uppercase">
                    {user.display_name || user.name || 'User'}
                  </div>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 text-sm font-black border-2 border-white/20">
                    JL
                  </div>
                  <div className="hidden lg:block text-sm font-black text-white tracking-wide uppercase">
                    John Lee
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-teal-600 hover:bg-gray-100"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-[#07111f] border-t border-white/5 pb-8 px-4 animate-fade-in">
            {/* Mobile User Profile Display */}
            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-2xl border border-white/10 my-6">
              {isAuthenticated && user ? (
                <>
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt={user.display_name || user.name}
                      className="h-10 w-10 rounded-full object-cover border-2 border-amber-500/50"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 text-sm font-black border-2 border-white/20">
                      {user.first_name ? user.first_name[0] : (user.name ? user.name[0] : 'U')}
                    </div>
                  )}
                  <div className="text-sm font-black text-white tracking-wide uppercase">
                    {user.display_name || user.name || 'User'}
                  </div>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 text-sm font-black border-2 border-white/20">
                    JL
                  </div>
                  <div className="text-sm font-black text-white tracking-wide uppercase">
                    John Lee
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                item.dropdown ? (
                  <div key={item.path}>
                    <MobileDropdown item={item} closeMenu={() => setIsOpen(false)} />
                  </div>
                 ) : (
                   <div key={item.path} className={item.name === 'Home' ? 'flex flex-col' : ''}>
                     <Link
                       to={item.path}
                       onClick={() => setIsOpen(false)}
                       className={`px-4 py-3 rounded-xl text-lg font-bold transition-all ${
                         location.pathname === item.path
                           ? 'bg-amber-500 text-slate-950'
                           : 'text-slate-300 hover:bg-white/5 hover:text-amber-400'
                       }`}
                     >
                       {item.name}
                     </Link>
                     {/* Show Login/Logout button directly under Home link on mobile */}
                     {item.name === 'Home' && (
                       <div className="px-4 mt-2">
                         {isAuthenticated ? (
                           <button
                             onClick={() => { setIsOpen(false); handleLogout() }}
                             className="w-full bg-white/10 text-white px-4 py-3 rounded-xl text-base font-bold hover:bg-white/20 transition-all border border-white/10"
                           >
                             Logout
                           </button>
                         ) : (
                           <Link
                             to="/login"
                             onClick={() => setIsOpen(false)}
                             className="w-full bg-amber-500 text-slate-950 px-4 py-3 rounded-xl text-base font-bold hover:bg-amber-400 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                           >
                             <LogIn size={18} />
                             Login
                           </Link>
                         )}
                       </div>
                     )}
                   </div>
                 )
               ))}

            </div>
          </div>
        )}
      </nav>

      <AuthPlatformModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onAdminSuccess={handleAdminLoginSuccess}
      />
    </>
  )
}

// MobileDropdown component used inside Navbar for mobile 'Our Companies' submenu
function MobileDropdown({ item, closeMenu }){
  const [open, setOpen] = useState(false)
  return (
    <div className="px-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex items-center justify-between py-3 rounded-xl text-lg font-bold text-slate-300 hover:text-amber-400"
      >
        <span>{item.name}</span>
        <ChevronDown className={`h-5 w-5 transform transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-2 ml-4 border-l-2 border-amber-500/30 pl-4 flex flex-col space-y-2">
          {item.dropdown.map((sub) => (
            <Link
              key={sub.path}
              to={sub.path}
              onClick={() => { closeMenu(); }}
              className="block py-2 text-base font-semibold text-slate-400 hover:text-amber-400"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Navbar
