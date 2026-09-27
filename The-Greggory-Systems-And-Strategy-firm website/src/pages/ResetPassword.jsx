import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, ShieldAlert, ArrowLeft, CheckCircle } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { SITE_NAME } from '../constants/siteBrand'
import { apiCall } from '../services/api'
import { useSeo, SEO } from '../hooks/useSeo'

/**
 * ResetPassword — the destination of the link mailed by
 * POST /api/users/forgot-password (/reset-password?token=...).
 *
 * The token is checked as soon as the page opens so an expired or already-used
 * link is reported before the client wastes time writing a new password, and the
 * 8-character floor mirrors the single password rule the backend enforces
 * (auth_validation_rules → password_min_length = 8) so the hint can never
 * promise something the server will reject.
 */
const ResetPassword = () => {
  useSeo(SEO.resetPassword)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  // 'checking' → 'valid' | 'invalid'. A missing token is invalid outright, so we
  // never render a form that cannot possibly succeed.
  const [linkState, setLinkState] = useState(token ? 'checking' : 'invalid')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ password: '', confirmPassword: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    const check = async () => {
      try {
        const result = await apiCall('/users/verify-reset-token', {
          method: 'POST',
          body: JSON.stringify({ token }),
        })
        if (!cancelled) setLinkState(result?.valid ? 'valid' : 'invalid')
      } catch {
        // A failed probe is not proof the link is dead, so the form still
        // renders; the submit call remains the authority on validity.
        if (!cancelled) setLinkState('valid')
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const nextFieldErrors = { password: '', confirmPassword: '' }
    if (password.length < 8) nextFieldErrors.password = 'Must be at least 8 characters'
    if (password !== confirmPassword) nextFieldErrors.confirmPassword = 'Passwords do not match'
    setFieldErrors(nextFieldErrors)
    if (nextFieldErrors.password || nextFieldErrors.confirmPassword) return

    setIsLoading(true)
    try {
      await apiCall('/users/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      })
      setDone(true)
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      // The server's wording is the accurate one — it already distinguishes
      // "link no longer valid" from a rejected password.
      setError(err.message || 'We could not reset your password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = (hasError) =>
    `w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
      hasError ? 'border-red-500' : 'border-gray-200'
    }`

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a password for your account">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {linkState === 'checking' ? (
          <p className="text-center text-sm text-gray-500 py-6">Checking your reset link…</p>
        ) : linkState === 'invalid' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">This link won&apos;t work</h2>
            <p className="text-gray-500 text-sm mb-6">
              Reset links can only be used once and expire after one hour. Request a fresh link and
              try again — if you pasted the address by hand, make sure all of it came across.
            </p>
            <Link
              to="/forgot-password"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Request a new link
            </Link>
            <Link
              to="/login"
              className="mt-4 flex items-center justify-center gap-2 text-blue-600 hover:underline text-sm"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        ) : done ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Password updated</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your password has been changed and every other device has been signed out. Taking you
              back to sign in…
            </p>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-blue-600 hover:underline text-sm"
            >
              <ArrowLeft size={16} />
              Go to Login now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                required
                className={inputClass(fieldErrors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              <p className="mt-1.5 text-[11px] text-gray-400">Use at least 8 characters.</p>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                required
                className={inputClass(fieldErrors.confirmPassword)}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Saving…' : 'Reset password'}
            </button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-blue-600 hover:underline text-sm"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </form>
        )}
      </div>

      <p className="text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mt-8 relative z-10">
        &copy; {new Date().getFullYear()} {SITE_NAME.toUpperCase()}. All Rights Reserved.
      </p>
    </AuthLayout>
  )
}

export default ResetPassword
