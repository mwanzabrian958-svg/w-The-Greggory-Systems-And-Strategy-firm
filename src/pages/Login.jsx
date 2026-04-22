import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { usersAPI } from '../services/api'

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

    setIsLoading(true)
    try {
      // Call backend to update last_login and validate user
      const response = await usersAPI.login({
        email: formData.email.trim(),
        password: formData.password
      })
      
      console.log('Login response:', response);
      
      // Ensure loading state lasts for full 4 seconds
      await new Promise(resolve => setTimeout(resolve, 4000));
      
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
        has_photo: userData.has_photo || false,
        profilePhotoData: userData.profilePhotoData || null,
        profile_image_id: userData.profile_image_id || null
      };
      
      // Update auth context with user info
      login(userInfo);
      
      const from = location.state && location.state.from ? location.state.from : '/'
      navigate(from, { replace: true })
    } catch (err) {
      console.error('Login failed:', err)
      setIsLoading(false)
      alert('Login failed. Please check your credentials and try again.')
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-r-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700 font-medium">Authenticating...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we verify your credentials</p>
          </div>
        </div>
      )}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/brand-header.png/sja.PNG" 
            alt="SJA" 
            className="h-24 w-auto object-contain"
            onError={(e) => {
              console.error('Failed to load sja image:', e.target.src);
              e.target.style.display = 'none';
            }}
          />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-lg text-gray-600">
          {user?.name || 'Welcome back'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Phone number / email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="text"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="text-xs text-gray-600 text-center mb-4">
              <p>By signing up or logging in, you consent to The Greggory Foundation's</p>
              <p>
                <Link to="/terms" className="text-blue-600 hover:underline">
                  Terms of Use
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </>
                ) : 'Log in'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
              >
                Sign up
              </Link>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <div className="text-center text-xs text-gray-500 mt-8">
              &copy; 2024 THE GREGGORY FOUNDATION LTD. All rights reserved.
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
