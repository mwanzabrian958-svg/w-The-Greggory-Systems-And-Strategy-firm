import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
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
    if (nextErrors.email || nextErrors.password) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log('Login attempt:', formData)
      setIsLoading(false)
      // Navigate to dashboard or home after successful login
      login()
      const from = location.state && location.state.from ? location.state.from : '/'
      navigate(from, { replace: true })
    }, 1500)
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
    <AuthLayout title="Welcome back">
      {/* Login Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8">

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email/Phone Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Phone number / email address"
                required
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              By{' '}
              <Link to="/signup" className="text-blue-600 hover:underline">
                signing up
              </Link>{' '}
              or{' '}
              <span className="text-blue-600">logging in</span>, you consent to The Greggory Foundation's{' '}
              <Link to="/terms" className="text-blue-600 hover:underline underline">
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline underline">
                Privacy Policy
              </Link>
              .
            </p>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>

            {/* Links */}
            <div className="flex justify-between text-sm">
              <Link to="/forgot-password" className="text-blue-600 hover:underline">
                Forgot password?
              </Link>
              <Link to="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Google Login */}
            {ENABLE_GOOGLE && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-gray-700 font-medium">Log in with Google</span>
              </button>
            )}
          </form>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-500 mt-6">
        &copy; 2024 THE GREGGORY FOUNDATION LTD. All rights reserved.
      </p>
    </AuthLayout>
  )
}

export default Login
