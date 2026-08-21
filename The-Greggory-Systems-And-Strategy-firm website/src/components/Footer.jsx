import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import SocialMediaIcons from './SocialMediaIcons'
import AuthPlatformModal from './AuthPlatformModal'
import { hasAdminToken } from '../utils/adminSession'
import { useAuth } from '../context/AuthContext'
import { SITE_NAME, SITE_TAGLINE } from '../constants/siteBrand'

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
      <footer className="bg-[#0f172a] text-white border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div>
                <Link to="/" className="group inline-block">
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight group-hover:text-gold-500 transition-colors">{SITE_NAME}</h2>
                  <div className="h-1 w-10 bg-gold-500 mt-2 rounded-full group-hover:w-16 transition-all duration-500" />
                  <p className="text-[9px] sm:text-[10px] text-gold-500 font-black uppercase tracking-[0.4em] mt-3">{SITE_TAGLINE}</p>
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-md uppercase tracking-widest">
                Architecting high-tier strategic systems and tactical business solutions. Excellence through systemic innovation.
              </p>
              <div className="pt-2">
                <SocialMediaIcons
                  className="text-slate-500"
                  hoverColor="hover:text-gold-500"
                  iconSize={18}
                />
              </div>
            </div>

            {/* Contact Protocol */}
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Contact Protocol</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 group">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-gold-500 group-hover:bg-gold-500 group-hover:text-slate-950 transition-all">
                    <Mail size={14} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Secure Relay</p>
                    <a
                      href="mailto:thegreggorysystemsandstrategyf@gmail.com"
                      className="text-xs font-bold text-slate-100 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      thegreggorysystemsandstrategyf@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                   <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-gold-500 group-hover:bg-gold-500 group-hover:text-slate-950 transition-all">
                    <Phone size={14} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Direct Uplink</p>
                    <a
                      href="https://wa.me/254715312251"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-100 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      +254 715 312 251
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                   <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-gold-500 group-hover:bg-gold-500 group-hover:text-slate-950 transition-all">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Node Location</p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=RAFIKI+KABARAK,+KABARAK"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-100 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      RAFIKI KABARAK, KABARAK
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar Protocol */}
          <div className="border-t border-white/5 mt-10 sm:mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
                &copy; {currentYear} {SITE_NAME}. Mission Synchronized.
              </p>

              <button
                type="button"
                onClick={handleFooterAdminTrigger}
                className="group p-1.5 rounded-full border border-white/5 hover:border-gold-500/20 hover:bg-gold-500/5 transition-all duration-500 opacity-40 hover:opacity-100"
                aria-label="Admin console access"
                title="Command Terminal"
              >
                <div className="flex gap-1 px-1.5 py-0.5">
                  <span className="w-0.5 h-0.5 bg-slate-600 rounded-full group-hover:bg-gold-500 transition-colors" />
                  <span className="w-0.5 h-0.5 bg-slate-600 rounded-full group-hover:bg-gold-500 transition-colors duration-300" />
                  <span className="w-0.5 h-0.5 bg-slate-600 rounded-full group-hover:bg-gold-500 transition-colors duration-500" />
                </div>
              </button>
            </div>

            <div className="flex items-center gap-6">
               <Link to="/privacy" className="text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors">Privacy Protocol</Link>
               <Link to="/terms" className="text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors">Terms of Service</Link>
            </div>
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
