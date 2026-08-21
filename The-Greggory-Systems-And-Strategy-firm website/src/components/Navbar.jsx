import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogIn, ChevronDown, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import companies from '../data/companies'

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

  const profilePhotoUrl = user?.has_photo && (user?.id || user?.userId)
    ? `/api/users/profile-photo/${user.id || user.userId}`
    : null

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
      path: user?.admin_level || user?.developer_level ? '/admin' : '/client-portal'
    }] : []),
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className={`bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-white/5 sticky top-0 z-50 shadow-xl transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24 sm:h-28">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <img
                src="/brand-header.png/sja.PNG"
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
                      className="flex items-center text-base font-bold text-slate-600 dark:text-slate-100 hover:text-gold-600 transition-colors py-2"
                      onClick={() => setCompaniesDropdownOpen(!companiesDropdownOpen)}
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
                            key={subItem.path}
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
                        location.pathname === item.path
                          ? 'text-gold-600 dark:text-gold-400'
                          : 'text-slate-600 dark:text-slate-100 hover:text-gold-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                    {item.name === 'Home' && (
                      <div className="mt-1">
                        {isAuthenticated ? (
                          <button
                            onClick={handleLogout}
                            className="bg-gold-500 text-slate-950 px-2.5 py-1 rounded-full text-[10px] font-black hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20"
                          >
                            LOGOUT
                          </button>
                        ) : (
                          <Link
                            to="/login"
                            className="bg-gold-500 text-slate-950 px-2.5 py-1 rounded-full text-[10px] font-black hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20 inline-flex items-center gap-1"
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

          <div className="flex items-center space-x-4 bg-slate-100 dark:bg-white/5 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md">
            {isAuthenticated && user ? (
              <>
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt="User"
                    className="h-10 w-10 rounded-full object-cover border-2 border-gold-500/50"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gold-500 flex items-center justify-center text-slate-950 text-sm font-black border-2 border-white/20">
                    {user.first_name ? user.first_name[0] : (user.name ? user.name[0] : 'U')}
                  </div>
                )}
                <div className="hidden lg:block text-sm font-black text-slate-900 dark:text-white tracking-wide uppercase transition-colors">
                  {user.display_name || user.name || 'User'}
                </div>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-black border-2 border-transparent group-hover:border-gold-500/50 transition-all">
                  <User size={18} />
                </div>
                <div className="hidden lg:block text-xs font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase group-hover:text-gold-500 transition-colors">
                  Client Access
                </div>
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-teal-600 hover:bg-gray-100"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#0f172a] border-t border-white/5 pb-8 px-4 animate-fade-in">
          <div className="flex flex-col space-y-2 mt-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-xl text-lg font-bold transition-all ${
                  location.pathname === item.path
                    ? 'bg-gold-500 text-slate-950'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated && (
               <button onClick={() => { setIsOpen(false); handleLogout() }} className="w-full bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/10">Logout</button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
