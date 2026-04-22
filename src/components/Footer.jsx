import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import SocialMediaIcons from './SocialMediaIcons'
import AuthPlatformModal from './AuthPlatformModal'
import { hasAdminToken } from '../utils/adminSession'
import { useAuth } from '../context/AuthContext'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const [startOnAdminStep, setStartOnAdminStep] = useState(false)
  const [hasAdminSessionToken, setHasAdminSessionToken] = useState(() => hasAdminToken())
  // Check if regular user is logged in
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const sync = () => setHasAdminSessionToken(hasAdminToken())
    window.addEventListener('gf-admin-session-changed', sync)
    return () => window.removeEventListener('gf-admin-session-changed', sync)
  }, [])

  useEffect(() => {
    if (searchParams.get('admin') !== '1') return
    setStartOnAdminStep(true)
    setAdminModalOpen(true)
    const next = new URLSearchParams(searchParams)
    next.delete('admin')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const handleFooterAdminTrigger = () => {
    // Silently block regular users from accessing admin
    if (isAuthenticated) return
    
    if (hasAdminSessionToken) {
      navigate('/admin')
    } else {
      setStartOnAdminStep(false)
      setAdminModalOpen(true)
    }
  }

  const handleAuthPlatformClose = () => {
    setStartOnAdminStep(false)
    setAdminModalOpen(false)
  }

  const handleAdminModalSuccess = () => {
    console.log('[FOOTER] Admin login success! Navigating to /admin...')
    setStartOnAdminStep(false)
    setAdminModalOpen(false)
    navigate('/admin')
  }

  return (
    <>
      <footer className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="mb-6">
                <Link to="/">
                  <h2 className="text-2xl font-bold text-white">The Greggory Foundation Ltd.</h2>
                  <p className="text-teal-400 font-medium">Project Management Consultancy</p>
                </Link>
              </div>
              <p className="text-gray-300 mb-4">
                Strategic Project Development for all clients. Your Vision Delivered with Trust.
              </p>
              <SocialMediaIcons
                className="text-gray-300"
                hoverColor="hover:text-teal-400"
                iconSize={20}
              />
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-teal-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-teal-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-gray-300 hover:text-teal-400 transition-colors">
                    Our Services
                  </Link>
                </li>
                <li>
                  <Link to="/case-studies" className="text-gray-300 hover:text-teal-400 transition-colors">
                    Case Studies
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-gray-300 hover:text-teal-400 transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Mail size={18} className="text-teal-400 mt-1 flex-shrink-0" />
                  <a
                    href="mailto:brianmwanza651@gmail.com"
                    className="text-gray-300 hover:text-teal-400 transition-colors"
                  >
                    brianmwanza651@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone size={18} className="text-teal-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">+254799789956</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={18} className="text-teal-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">
                    rafiki kabarak
                    <br />
                    kabarak
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar — hidden admin entry: three dots under copyright */}
          <div className="border-t border-navy-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {currentYear} The Greggory Foundation Ltd. All rights reserved.</p>
            <button
              type="button"
              onClick={handleFooterAdminTrigger}
              className="mt-2 inline-flex py-2 px-3 bg-transparent hover:bg-gray-800 opacity-30 hover:opacity-100 transition-all duration-300 rounded-full border border-gray-600 hover:border-white"
              aria-label="Admin console access"
              title="Admin console"
            >
              <span className="flex gap-1" aria-hidden>
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
              </span>
            </button>
          </div>
        </div>
      </footer>

      <AuthPlatformModal
        isOpen={adminModalOpen}
        onClose={handleAuthPlatformClose}
        onAdminSuccess={handleAdminModalSuccess}
        startOnAdminStep={startOnAdminStep}
      />
    </>
  )
}

export default Footer
