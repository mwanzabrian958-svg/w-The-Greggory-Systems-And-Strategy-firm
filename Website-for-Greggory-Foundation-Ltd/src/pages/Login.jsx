import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'user'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [loginProcessing, setLoginProcessing] = useState(false) // New state for login processing
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Start login processing - prevents any interference
    setLoginProcessing(true)
    setIsLoading(true)
    
    try {
      console.log('[Login] Attempting login with:', { email: formData.email.trim(), userType: formData.userType });
      
      // Direct API call - bypass AuthContext
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          userType: formData.userType
        }),
      });
      
      console.log('[Login] Response status:', response.status);
      
      const data = await response.json();
      console.log('[Login] Response data:', data);
      
      if (response.ok && data.success) {
        console.log('[Login] Login successful, storing data...');
        
        // Store token and user directly
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('[Login] Processing complete, navigating...');
        
        // Direct navigation - bypass React Router
        window.location.href = '/dashboard';
        
      } else {
        console.log('[Login] Login failed:', data.message);
        alert(data.message || 'Login failed');
      }
      
    } catch (err) {
      console.error('[Login] Error:', err);
      alert('Login error: ' + err.message);
    } finally {
      setIsLoading(false)
      setLoginProcessing(false) // Reset processing state
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

        {/* Welcome Message for New Registrations */}
        {welcomeMessage && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {welcomeMessage}
                </p>
              </div>
            </div>
          </div>
        )}
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
                  disabled={loginProcessing || isLoading}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    (loginProcessing || isLoading) ? 'bg-gray-100 cursor-not-allowed border-gray-200' : 'border-gray-300'
                  }`}
                />
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
                  disabled={loginProcessing || isLoading}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    (loginProcessing || isLoading) ? 'bg-gray-100 cursor-not-allowed border-gray-200' : 'border-gray-300'
                  }`}
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

            {/* User Type Selection */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Login as:</p>
              <div className="flex space-x-6">
                <div className="flex items-center">
                  <input
                    id="user-type-user"
                    name="userType"
                    type="radio"
                    value="user"
                    checked={formData.userType === 'user'}
                    onChange={() => setFormData({...formData, userType: 'user'})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="user-type-user" className="ml-2 block text-sm text-gray-700">
                    User
                  </label>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loginProcessing || isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginProcessing ? 'Processing Login...' : (isLoading ? 'Logging in...' : 'Log in')}
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

      {/* Loading Overlay - Prevents interference during login processing */}
      {(loginProcessing || isLoading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {loginProcessing ? 'Processing Login...' : 'Logging In...'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {loginProcessing 
                  ? 'Please wait while we process your login and set up your session...' 
                  : 'Verifying your credentials...'}
              </p>
              {loginProcessing && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                </div>
              )}
              <p className="text-xs text-gray-500">
                This may take up to 4 seconds to complete
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
