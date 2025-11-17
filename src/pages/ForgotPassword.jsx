import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmed = email.trim()
    if (!trimmed) {
      setError('Please enter your email address.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log('Password reset email sent to:', email)
      setIsLoading(false)
      setEmailSent(true)
    }, 1500)
  }

  return (
    <AuthLayout title="Forgot Password" subtitle="Enter your email and we'll send you a reset link">
      {/* Forgot Password Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
          {!emailSent ? (
            <>
              {/* Title/subtitle moved to AuthLayout */}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${error ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {error && (
                    <p className="mt-1 text-xs text-red-600">{error}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

                {/* Back to Login */}
                <Link 
                  to="/login"
                  className="flex items-center justify-center gap-2 text-blue-600 hover:underline text-sm"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Check Your Email</h2>
              <p className="text-gray-500 text-sm mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-gray-500 text-xs mb-6">
                Didn't receive the email? Check your spam folder or{' '}
                <button 
                  onClick={() => setEmailSent(false)}
                  className="text-blue-600 hover:underline"
                >
                  try again
                </button>
              </p>
              <Link 
                to="/login"
                className="flex items-center justify-center gap-2 text-blue-600 hover:underline text-sm"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          )}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-500 mt-6">
        &copy; 2024 THE GREGGORY FOUNDATION LTD. All rights reserved.
      </p>
    </AuthLayout>
  )
}

export default ForgotPassword
