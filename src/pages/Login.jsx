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
  const { login } = useAuth()
  const ENABLE_GOOGLE = false

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

      setIsLoading(false)

      const userData = response.user || response;

      // Store user information in auth context
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
        token: response.token || userData.token || null,
        has_photo: !!userData.has_photo,
        profilePhotoData: userData.profilePhotoData || null,
        profile_image_id: userData.profile_image_id || null,
        whatsapp_verified: true
      };

      // Update auth context with user info
      login(userInfo);

      // Redirect to home page after login
      const from = location.state?.from || '/'
      navigate(from, { replace: true })
    } catch (err) {
      console.error('Login failed:', err)
      setIsLoading(false)
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

  return (
    <AuthLayout title="Welcome Back" subtitle="Command center access authorized">
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10 font-sans">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
            Email or Phone
          </label>
          <div className="relative group">
            <input
              id="email"
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter credentials"
              className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all text-[11px] font-bold"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-[8px] text-red-400 font-bold ml-1">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
            Password
          </label>
          <div className="relative group">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="block w-full px-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all text-[11px] font-bold"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-gold-500 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-[8px] text-red-400 font-bold ml-1">{errors.password}</p>
          )}
        </div>

        {errors.submit && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-[8px] text-rose-400 font-bold rounded-lg text-center uppercase tracking-widest">
            {errors.submit}
          </div>
        )}

        <div className="text-[7px] text-slate-500 text-center leading-relaxed font-black uppercase tracking-[0.2em] px-2">
          By signing in, you consent to our{' '}
          <Link to="/terms" className="text-gold-500">Terms</Link>
          {' '}&{' '}
          <Link to="/privacy" className="text-gold-500">Privacy</Link>
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-xl text-[10px] font-black text-slate-950 bg-gradient-to-r from-gold-500 to-yellow-500 hover:from-gold-400 hover:to-yellow-400 transition-all transform uppercase tracking-[0.2em]"
          >
            {isLoading ? 'Synchronizing...' : 'Initialize Secure Access'}
          </button>

          <div className="flex items-center justify-between px-2">
            <Link
              to="/forgot-password"
              className="text-[8px] font-black text-slate-500 hover:text-gold-400 transition-colors uppercase tracking-widest"
            >
              Forgot?
            </Link>
            <Link
              to="/signup"
              className="text-[8px] font-black text-gold-500 hover:text-gold-400 transition-colors uppercase tracking-widest"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[8px] font-black tracking-[0.4em]">
            <span className="px-4 bg-[#0f172a] text-slate-700">OR</span>
          </div>
        </div>

        <div className="text-center text-[7px] font-black text-slate-700 uppercase tracking-[0.4em] pt-2">
          &copy; {new Date().getFullYear()} {SITE_NAME.toUpperCase()} NODE
        </div>
      </form>
    </AuthLayout>
  )
}

export default Login
