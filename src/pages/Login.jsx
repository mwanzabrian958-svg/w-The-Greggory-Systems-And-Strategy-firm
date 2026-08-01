import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { usersAPI } from '../services/api'
import { SITE_NAME } from '../constants/siteBrand'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '', submit: '' })
  const navigate = useNavigate()
  const location = useLocation()
  const { login, user } = useAuth()
  const googleLoadedRef = useRef(false)
  const tokenClientRef = useRef(null)
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const ENABLE_GOOGLE = false

  useEffect(() => {
    if (!ENABLE_GOOGLE) return
    // Dynamically load Google Identity Services script
    if (document.getElementById('google-gis')) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.id = 'google-gis'
    script.onload = () => {
      googleLoadedRef.current = true
      if (window.google && GOOGLE_CLIENT_ID) {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: (resp) => {
            if (resp && resp.access_token) {
              // In a real app, verify token on the backend.
              login()
              const from = location.state && location.state.from ? location.state.from : '/'
              navigate(from, { replace: true })
            } else {
              alert('Google sign-in failed. Please try again.')
            }
          },
        })
      }
    }
    document.head.appendChild(script)
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Basic validation
    const nextErrors = { email: '', password: '' }
    const value = formData.email.trim()

    if (!value) {
      nextErrors.email = 'Please enter your email or phone number.'
    } else if (value.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        nextErrors.email = 'Please enter a valid email address.'
      }
    }

    if (!formData.password) {
      nextErrors.password = 'Please enter your password.'
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.'
    }

    setErrors(nextErrors)
    if (Object.values(nextErrors).some(error => error)) return

    setErrors({ email: '', password: '', submit: '' })
    setIsLoading(true)
    try {
      // Call backend to validate user
      const response = await usersAPI.login({
        email: formData.email.trim(),
        password: formData.password
      })

      console.log('Login response:', response);

      setIsLoading(false)

      // Store user information in auth context
      const userData = response.user || response;
      const userInfo = {
        role: 'user',
        name: userData.display_name || (userData.first_name && userData.last_name
          ? `${userData.first_name} ${userData.last_name}`
          : formData.email.split('@')[0]),
        email: userData.email || formData.email,
        userId: userData.id || userData.userId,
        id: userData.id || userData.userId,
        first_name: userData.first_name,
        last_name: userData.last_name,
        display_name: userData.display_name,
        // has_photo tells the Navbar whether to build the photo URL from the id.
        // The Navbar always reconstructs the URL dynamically — nothing is stored.
        has_photo: !!userData.has_photo,
        profilePhotoData: userData.profilePhotoData || null,
        profile_image_id: userData.profile_image_id || null
      };

      // Update auth context with user info
      login(userInfo);

      // Redirect to home page after login
      const from = location.state?.from || '/'
      navigate(from, { replace: true })
    } catch (err) {
      console.error('Login failed:', err)
      setIsLoading(false)
      // Distinguish between server offline vs wrong credentials
      const isNetworkError = err.message === 'Failed to fetch' ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('fetch') ||
        err.name === 'TypeError'
      setErrors(prev => ({
        ...prev,
        submit: isNetworkError
          ? 'Cannot reach the server. Please make sure the app is running (npm run dev) and try again.'
          : err.message || 'Login failed. Please check your credentials and try again.'
      }))
    }
  }

  const handleGoogleLogin = () => {
    if (!ENABLE_GOOGLE) return
    if (!GOOGLE_CLIENT_ID) {
      alert('Google Client ID missing. Please set VITE_GOOGLE_CLIENT_ID in your environment.')
      return
    }
    if (!googleLoadedRef.current || !window.google) {
      alert('Google services are still loading. Please try again in a moment.')
      return
    }
    if (!tokenClientRef.current) {
      // Initialize if not ready (edge case if script loaded after mount)
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: (resp) => {
          if (resp && resp.access_token) {
            login()
            const from = location.state && location.state.from ? location.state.from : '/'
            navigate(from, { replace: true })
          } else {
            alert('Google sign-in failed. Please try again.')
          }
        },
      })
    }
    tokenClientRef.current.requestAccessToken()
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
            Email or Phone
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <input
              id="email"
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter credentials"
              className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all text-sm font-medium"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-[10px] text-red-400 font-bold ml-1">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
            Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="block w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all text-sm font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-amber-500 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-[10px] text-red-400 font-bold ml-1">{errors.password}</p>
          )}
        </div>

        <div className="text-[9px] text-slate-400 text-center leading-relaxed font-bold uppercase tracking-wider px-2">
          By signing in, you consent to our{' '}
          <Link to="/terms" className="text-amber-400 hover:text-amber-300">Terms</Link>
          {' '}&{' '}
          <Link to="/privacy" className="text-amber-400 hover:text-amber-300">Privacy</Link>
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-xl text-sm font-black text-slate-950 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-[0.1em]"
          >
            {isLoading ? 'Processing...' : 'Secure Access'}
          </button>

          <div className="flex items-center justify-between px-2">
            <Link
              to="/forgot-password"
              className="text-[10px] font-bold text-slate-500 hover:text-amber-400 transition-colors uppercase tracking-widest"
            >
              Forgot?
            </Link>
            <Link
              to="/signup"
              className="text-[10px] font-black text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-widest"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black tracking-[0.5em]">
            <span className="px-4 bg-[#07111f]/50 backdrop-blur-md text-slate-600">OR</span>
          </div>
        </div>

        <div className="text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] pt-4">
          &copy; {new Date().getFullYear()} {SITE_NAME.toUpperCase()}. All Rights Reserved.
        </div>
      </form>
    </AuthLayout>
  )
}

export default Login
