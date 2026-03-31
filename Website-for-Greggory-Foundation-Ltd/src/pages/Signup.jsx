import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, Phone, Camera } from 'lucide-react'
import GoogleSignIn from '../components/GoogleSignIn'
import AuthLayout from '../components/AuthLayout'
import { usersAPI } from '../services/api'

// Add animation styles
const animationStyles = `
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  }
  
  .animate-fade-out {
    animation: fadeOut 1.5s ease-in-out forwards;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slide-in {
    animation: slideIn 0.5s ease-out;
  }
`

// Inject styles into head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.type = 'text/css'
  styleSheet.innerText = animationStyles
  document.head.appendChild(styleSheet)
}

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
    password: '',
    confirmPassword: '',
    userType: 'user'
  })
  const [profilePreview, setProfilePreview] = useState(null)
  const [profileFile, setProfileFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
    password: '',
    confirmPassword: '',
    terms: ''
  })
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setProfileFile(file)
    const previewUrl = URL.createObjectURL(file)
    setProfilePreview(previewUrl)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = { 
      fullName: '', 
      email: '', 
      phone: '', 
      password: '', 
      confirmPassword: '', 
      terms: '',
      submit: ''
    };

    // Validation
    if (!formData.fullName.trim()) nextErrors.fullName = 'Please enter your full name.';
    if (!formData.email.trim()) {
      nextErrors.email = 'Please enter your email address.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        nextErrors.email = 'Please enter a valid email address.';
      }
    }
    if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }
    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!agreedToTerms) nextErrors.terms = 'You must agree to the Terms and Privacy Policy.';

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsLoading(true);

    try {
      console.log('Attempting to register user:', formData.email);
      // derive username, firstName, lastName from fullName
      const names = formData.fullName.trim().split(/\s+/);
      const firstName = names.shift() || '';
      const lastName = names.join(' ') || '';

      // Build FormData to handle both JSON and file upload
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('password', formData.password);
      formDataToSend.append('firstName', firstName);
      formDataToSend.append('lastName', lastName);
      
      // Append photo if provided
      if (profileFile) {
        formDataToSend.append('photo', profileFile);
      }

      const data = await usersAPI.register(formDataToSend);
      console.log('Registration response:', data);

      // Verify registration was successful
      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful - user details confirmed in database
      const userName = data.user?.fullName || formData.fullName.trim();
      
      if (data.existingUser) {
        // User already exists - show welcome back message
        setSuccessMessage(`Welcome back, ${userName}! Your details are confirmed in our database. Redirecting to login page...`);
      } else {
        // New user registration - show congratulations message
        setSuccessMessage(`🎉 Registration Success! ${userName}, your details have been successfully saved to our database. Redirecting to login page...`);
      }
      
      // Clear form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        userType: 'user'
      });
      setAgreedToTerms(false);
      setProfilePreview(null);
      setProfileFile(null);
      
      // Add animation class for transition
      const formElement = document.querySelector('.bg-white');
      if (formElement) {
        formElement.classList.add('animate-fade-out');
      }
      
      // Redirect to login after 3 seconds with animation
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            registrationSuccess: true, 
            userName: userName,
            isExistingUser: data.existingUser || false
          } 
        });
      }, 3000);
    } catch (error) {
      console.error('Signup error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Signup failed. Please try again later.'
      }));
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignup = () => {
    console.log('Google signup initiated')
    // Implement Google OAuth here
  }

  return (
    <AuthLayout title="Create Account">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg animate-slide-in">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {successMessage}
              </p>
              <div className="mt-2 flex items-center text-xs text-green-600">
                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirecting to login page...
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Signup Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {!successMessage ? (
          <>
          {/* Profile Photo Selector */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden shadow-sm">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-semibold text-gray-400">
                    {formData.fullName.trim()
                      ? formData.fullName.trim().charAt(0).toUpperCase()
                      : 'A'}
                  </span>
                )}
              </div>
              {/* Small + button on bottom-left of the circle */}
              <label
                htmlFor="profilePhoto"
                className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white text-sm cursor-pointer shadow-md hover:bg-blue-700"
                title="Add profile photo"
              >
                <Camera className="w-4 h-4" />
              </label>
              <input
                id="profilePhoto"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileChange}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 text-center max-w-xs">
              Optional: add a profile photo now. This will be shown next to your name on your profile page when backend support is added.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.fullName ? 'border-red-500' : 'border-gray-200'}`}
              />
              {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
            </div>

            {/* Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                required
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Phone Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number (optional)"
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
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
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-xs text-gray-500">
                I agree to The Greggory Foundation's{' '}
                <Link to="/terms" className="text-blue-600 hover:underline underline">
                  Terms of Use
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && <p className="-mt-2 text-xs text-red-600">{errors.terms}</p>}

            {/* Signup Button */}
            {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.submit}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <GoogleSignIn buttonText="Sign up with Google" isSignUp={true} />
          </form>
          </>
        ) : (
          /* Success state - show loading indicator */
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="animate-pulse">
              <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
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

export default Signup
