import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, X, UserPlus, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { hasAdminToken } from '../utils/adminSession'

/**
 * Full "Authentication platform" experience: gradient header, member sign-in/up, admin console path.
 * Opened from footer three-dots or navbar; admin step uses server-backed credentials + code.
 */
export default function AuthPlatformModal({
  isOpen,
  onClose,
  onAdminSuccess,
  /** When true, open directly on admin credentials (e.g. ?admin=1). */
  startOnAdminStep = false
}) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [view, setView] = useState('platform')
  const [hasAdminSessionToken, setHasAdminSessionToken] = useState(() => hasAdminToken())
  
  // Admin/Developer registration state - ONLY for admin area use, not shown in user platform
  const [regRole, setRegRole] = useState('') // 'admin' or 'developer'
  const [regStep, setRegStep] = useState(1) // 1: credentials, 2: success
  const [regData, setRegData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [regError, setRegError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null)

  // Admin/Developer login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginRole, setLoginRole] = useState('admin') // 'admin' or 'developer'

  useEffect(() => {
    const sync = () => setHasAdminSessionToken(hasAdminToken())
    window.addEventListener('gf-admin-session-changed', sync)
    return () => window.removeEventListener('gf-admin-session-changed', sync)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setView('platform')
      setRegRole('') // Reset role when closed
      return
    }
    // Auto-set role based on which platform is opened
    if (startOnAdminStep) {
      setView('admin')
      setRegRole('admin') // Auto-select admin role
    } else {
      setView('platform')
    }
    // Clear profile photo when modal opens
    setProfilePhoto(null)
    setProfilePhotoPreview(null)
  }, [isOpen, startOnAdminStep])

  if (!isOpen) return null

  const handleClose = () => {
    setView('platform')
    setProfilePhoto(null)
    setProfilePhotoPreview(null)
    onClose()
  }

  const handleAdminCta = () => {
    if (hasAdminSessionToken) {
      handleClose()
      navigate('/admin')
    } else {
      setView('admin')
    }
  }

  const handleCredentialsSuccess = () => {
    onAdminSuccess?.()
    handleClose()
  }

  // Admin/Developer registration handlers - NOT shown to regular users
  const handleRegisterStart = (role) => {
    const goToRegister = () => {
      setRegStep(1)
      setRegData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: ''
      })
      setRegError('')
      setProfilePhoto(null)
      setProfilePhotoPreview(null)
      setView('register')
    }
    setRegRole(role)
    goToRegister()
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => setProfilePhotoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setRegError('')
    
    // Simple validation like user signup
    if (!regData.first_name || !regData.last_name || !regData.email || !regData.password) {
      setRegError('All fields are required')
      return
    }
    
    if (regData.password !== regData.confirmPassword) {
      setRegError('Passwords do not match')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      let profileImageId = null
      
      // Upload profile photo first if selected
      if (profilePhoto) {
        console.log('[REGISTER] Uploading profile photo...')
        const photoData = profilePhotoPreview.split(',')[1] // Get base64 data after comma
        const contentType = profilePhoto.type || 'image/jpeg'
        
        const imageResponse = await fetch('/api/images/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataBase64: photoData,
            contentType: contentType,
            fileName: profilePhoto.name || 'profile.jpg'
          })
        })
        
        if (!imageResponse.ok) {
          throw new Error('Failed to upload profile photo')
        }
        
        const imageData = await imageResponse.json()
        profileImageId = imageData.image_id
        console.log('[REGISTER] Profile photo uploaded, image_id:', profileImageId)
      }
      
      // Register with role - 'admin' or 'developer'
      const response = await fetch('/api/admin-verification/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: regData.first_name,
          last_name: regData.last_name,
          email: regData.email,
          password: regData.password,
          role: regRole, // 'admin' or 'developer' - tells backend which table to use
          profile_image_id: profileImageId
        })
      })
      
      // Get response text first to check if it's HTML or JSON
      const responseText = await response.text()
      
      // Check if response starts with HTML doctype
      if (responseText.trim().startsWith('<')) {
        console.error('[REGISTER] Server returned HTML error page:', responseText.substring(0, 200))
        throw new Error(`Server error (${response.status}). Backend may be down or misconfigured.`)
      }
      
      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseErr) {
        console.error('[REGISTER] Invalid JSON response:', responseText.substring(0, 200))
        throw new Error(`Server returned invalid data (${response.status})`)
      }
      
      if (data.success) {
        setRegStep(3) // Success
      } else {
        setRegError(data.message || 'Registration failed')
      }
    } catch (err) {
      console.error('[REGISTER] Network error:', err)
      setRegError('Network error: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle admin/developer login
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      // Use correct endpoint based on role
      const endpoint = loginRole === 'developer' 
        ? '/api/developer-verification/authenticate'
        : '/api/admin-verification/authenticate-enhanced'
      
      console.log('[AUTH] Logging in as', loginRole, 'using', endpoint)
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      })

      // Get response as text first
      const responseText = await response.text()
      
      console.log('[AUTH] Response status:', response.status)
      console.log('[AUTH] Response text:', responseText.substring(0, 500))
      
      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        // Not JSON - likely an error page
        console.error('[AUTH] Server returned HTML/text:', responseText.substring(0, 200))
        throw new Error(`Server error (${response.status}). Backend issue - check console for details.`)
      }

      console.log('[AUTH] Parsed data:', data)

      if (!response.ok) {
        throw new Error(data.message || data.error || `Authentication failed (${response.status})`)
      }

      // Upload/update profile photo if selected
      if (profilePhoto && profilePhotoPreview) {
        try {
          console.log('[LOGIN] Uploading profile photo...')
          const photoData = profilePhotoPreview.split(',')[1]
          const contentType = profilePhoto.type || 'image/jpeg'
          
          const imageResponse = await fetch('/api/images/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dataBase64: photoData,
              contentType: contentType,
              fileName: profilePhoto.name || 'profile.jpg'
            })
          })
          
          if (imageResponse.ok) {
            const imageData = await imageResponse.json()
            console.log('[LOGIN] Profile photo uploaded, image_id:', imageData.image_id)
            data.user.profile_image_id = imageData.image_id
          }
        } catch (photoErr) {
          console.error('[LOGIN] Photo upload failed:', photoErr)
        }
      }

      // Store session using proper token key for adminSession.js compatibility
      sessionStorage.setItem('gf_admin_session_token', data.token)
      // Also store full user data for reference
      sessionStorage.setItem('gf_admin_user', JSON.stringify(data.user))
      window.dispatchEvent(new Event('gf-admin-session-changed'))
      
      handleCredentialsSuccess()
      
    } catch (err) {
      console.error('Login error:', err)
      setLoginError(err.message || 'Failed to connect to server.')
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-platform-title"
    >
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl border border-white/15 bg-slate-900 flex flex-col">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1">
          {view === 'platform' && (
            <section
              className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white border-b border-purple-400/40 px-6 pt-10 pb-8 sm:px-8"
              aria-label="Authentication platform"
            >
              <div className="flex items-start gap-3 mb-6">
                <div className="mt-0.5 p-2.5 rounded-lg bg-white/10 border border-white/20 shrink-0">
                  <Shield className="w-6 h-6 text-purple-200" aria-hidden />
                </div>
                <div>
                  <p
                    id="auth-platform-title"
                    className="text-xs font-bold uppercase tracking-widest text-purple-200"
                  >
                    Authentication platform
                  </p>
                  <p className="text-sm text-gray-200 mt-1.5 leading-relaxed">
                    Member sign-in for protected pages, or admin access for the console.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                {isAuthenticated && (
                  <p className="text-sm text-gray-300 w-full sm:mr-auto py-1">
                    You are signed in as a member.
                  </p>
                )}
                
                <button
                  type="button"
                  onClick={handleAdminCta}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-500 text-white text-sm font-semibold hover:bg-purple-400 transition-colors sm:ml-auto"
                >
                  <Shield className="w-4 h-4" />
                  {hasAdminSessionToken ? 'Open admin' : 'access'}
                </button>
              </div>
            </section>
          )}

          {view === 'admin' && (
            <div className="bg-white px-6 py-8 sm:px-8">
              {/* Admin Login Form */}
              <div className="text-center mb-6">
                <button
                  onClick={() => setView('platform')}
                  className="absolute left-6 top-6 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="relative w-20 h-20 mb-4 shrink-0 mx-auto">
                  {/* Main purple circle with shield or photo - display only */}
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 overflow-hidden flex items-center justify-center">
                    {profilePhotoPreview ? (
                      <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-10 h-10 text-white" />
                    )}
                  </div>
                  {/* Plus badge - CLICKABLE for photo upload */}
                  <label className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:bg-green-600 transition-colors">
                    <span className="text-white text-sm font-bold leading-none">+</span>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Admin & Developer Access</h2>
                <p className="text-gray-600 mt-2 text-sm">Sign in to access the admin or developer panel</p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                  <Shield className="w-5 h-5 text-red-500 mr-2 shrink-0" />
                  <span className="text-red-700 text-sm">{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Role Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Login As</label>
                  <select
                    value={loginRole}
                    onChange={(e) => setLoginRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="admin">Administrator</option>
                    <option value="developer">Developer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600 mb-4">Need an account?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleRegisterStart('admin')}
                    className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                  >
                    Register as Admin
                  </button>
                  <button
                    onClick={() => handleRegisterStart('developer')}
                    className="px-4 py-2 border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium"
                  >
                    Register as Dev
                  </button>
                </div>
              </div>
            </div>
          )}

          {view === 'register' && (
            <div className="bg-white px-6 py-8 sm:px-8">
              {/* Registration Header */}
              <div className="text-center mb-6">
                <button
                  onClick={() => setView('platform')}
                  className="absolute left-6 top-6 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="relative w-20 h-20 mb-4 shrink-0 mx-auto">
                  {/* Main purple circle with shield or photo - display only */}
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 overflow-hidden flex items-center justify-center">
                    {profilePhotoPreview ? (
                      <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-10 h-10 text-white" />
                    )}
                  </div>
                  {/* Plus badge - CLICKABLE for photo upload */}
                  <label className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:bg-green-600 transition-colors">
                    <span className="text-white text-sm font-bold leading-none">+</span>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Create {regRole === 'admin' ? 'Admin' : 'Developer'} Account
                </h2>
                <p className="text-gray-600 mt-2 text-sm">
                  Register as a {regRole} to access the {regRole} console
                </p>
              </div>

              {/* Error Display */}
              {regError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                  <Shield className="w-5 h-5 text-red-500 mr-2 shrink-0" />
                  <span className="text-red-700 text-sm">{regError}</span>
                </div>
              )}

              {regStep === 3 ? (
                // Success State
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Account Created!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your {regRole} account has been created successfully.
                  </p>
                  <button
                    onClick={() => {
                      setRegRole('')
                      setRegStep(1)
                      setRegData({
                        first_name: '',
                        last_name: '',
                        email: '',
                        password: '',
                        confirmPassword: ''
                      })
                      setRegError('')
                      setView('admin')
                    }}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Proceed to Login
                  </button>
                </div>
              ) : (
                // Registration Form
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={regData.first_name}
                        onChange={(e) => setRegData({...regData, first_name: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={regData.last_name}
                        onChange={(e) => setRegData({...regData, last_name: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={regData.email}
                      onChange={(e) => setRegData({...regData, email: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regData.password}
                        onChange={(e) => setRegData({...regData, password: e.target.value})}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={regData.confirmPassword}
                      onChange={(e) => setRegData({...regData, confirmPassword: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Confirm your password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Create {regRole === 'admin' ? 'Admin' : 'Developer'} Account
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setView('admin')}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Sign in here
                    </button>
                  </p>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
