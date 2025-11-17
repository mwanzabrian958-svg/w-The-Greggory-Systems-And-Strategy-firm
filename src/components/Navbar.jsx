import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogIn } from 'lucide-react'
import BrandHeader from './BrandHeader'
import { useAuth } from '../context/AuthContext'
import companies from '../data/companies'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()

  const navigation = [
    { name: 'Home', path: '/' },
    { 
      name: 'Our Companies', 
      path: '#',
      dropdown: companies
    },
    { name: 'Projects & Activities', path: '/projects' },
    { name: 'About Us', path: '/about' },
    { name: 'Our Services', path: '/services' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto pl-0 pr-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[160px]">
          {/* Brand Header with Logo */}
          <div className="flex items-center flex-shrink-0" style={{ marginLeft: '-16px' }}>
            <img 
              src="/brand-header.png/sja.PNG" 
              alt="SJA" 
              className="h-30 w-auto object-contain"
              style={{ 
                display: 'block',
                marginLeft: '-16px',
                position: 'relative',
                zIndex: 10
              }}
              onError={(e) => {
                console.error('Failed to load sja image:', e.target.src);
              }}
              onLoad={() => {
                console.log('SJA image loaded successfully');
              }}
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 flex-nowrap overflow-visible">
            {navigation.map((item) => (
              <div key={item.path} className="relative group whitespace-nowrap">
                {item.dropdown ? (
                  <>
                    <button 
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors duration-200 px-2 py-1"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      {item.name}
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div 
                      className={`absolute left-0 mt-2 w-80 bg-gradient-to-br from-blue-500/90 to-blue-600/90 backdrop-blur-lg rounded-lg shadow-xl py-3 z-50 border border-blue-400/30 ${
                        dropdownOpen ? 'block' : 'hidden'
                      }`}
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm font-medium text-white hover:bg-white/20 rounded-md mx-1 transition-all duration-200"
                        >
                          <span className="text-blue-200 mr-3">•</span>
                          <span className="break-words">{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`text-sm font-medium transition-colors duration-200 px-2 py-1 ${
                      location.pathname === item.path
                        ? 'text-teal-600'
                        : 'text-gray-700 hover:text-teal-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-gray-100 text-navy-900 px-5 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link 
                to="/login"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <LogIn size={18} />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-teal-600 hover:bg-gray-100"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                item.dropdown ? (
                  <div key={item.path} className="px-3">
                    <MobileDropdown item={item} closeMenu={() => setIsOpen(false)} />
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.path)
                        ? 'bg-teal-50 text-teal-600'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              {isAuthenticated ? (
                <button
                  onClick={() => { setIsOpen(false); handleLogout() }}
                  className="bg-gray-100 text-navy-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link 
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <LogIn size={18} />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

  // MobileDropdown component used inside Navbar for mobile 'Our Companies' submenu
  function MobileDropdown({ item, closeMenu }){
    const [open, setOpen] = useState(false)
    return (
      <div>
        <button onClick={() => setOpen(!open)} className="w-full text-left flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
          <span>{item.name}</span>
          <svg className={`ml-2 h-4 w-4 transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="mt-2 ml-2 border-l border-gray-200 pl-2">
            {item.dropdown.map((sub) => (
              <Link key={sub.path} to={sub.path} onClick={() => { closeMenu(); }} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                {sub.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  export default Navbar
