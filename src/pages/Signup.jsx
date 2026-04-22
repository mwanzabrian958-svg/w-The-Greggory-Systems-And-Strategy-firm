import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, Phone, Camera } from 'lucide-react'
import GoogleSignIn from '../components/GoogleSignIn'
import AuthLayout from '../components/AuthLayout'
import { usersAPI } from '../services/api'

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'user',
    profilePhotoUrl: ''
  })
  const [profilePreview, setProfilePreview] = useState(null)
  const [profileFile, setProfileFile] = useState(null)
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: '',
    submit: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
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
      firstName: '', 
      lastName: '',
      email: '', 
      phone: '', 
      password: '', 
      confirmPassword: '', 
      terms: '',
      adminCode: '',
      submit: ''
    };

    // Validation
    if (!formData.firstName.trim()) nextErrors.firstName = 'Please enter your first name.';
    if (!formData.lastName.trim()) nextErrors.lastName = 'Please enter your last name.';
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
      
      let profileImageId = null;
      
      // Upload profile photo first if selected
      if (profileFile) {
        console.log('[SIGNUP] Uploading profile photo...');
        
        // Convert file to base64
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(profileFile);
        });
        
        const photoData = base64Data.split(',')[1]; // Get base64 data after comma
        const contentType = profileFile.type || 'image/jpeg';
        
        const imageResponse = await fetch('/api/images/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataBase64: photoData,
            contentType: contentType,
            fileName: profileFile.name || 'profile.jpg'
          })
        });
        
        if (!imageResponse.ok) {
          throw new Error('Failed to upload profile photo');
        }
        
        const imageData = await imageResponse.json();
        profileImageId = imageData.image_id;
        console.log('[SIGNUP] Profile photo uploaded, image_id:', profileImageId);
      }
      
      // Send JSON data with profile image id
      const userData = {
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        display_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        phone: formData.phone,
        profile_image_id: profileImageId
      };

      const response = await usersAPI.register(userData);

      console.log('Raw API response:', response);
      console.log('Response type:', typeof response);
      
      // Ensure we have the data in the correct format
      const data = response && typeof response === 'object' ? response : {};
      
      console.log('Processed registration response:', data);

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful
      console.log('Registration successful, showing loading sequence');
      console.log('About to set isRedirecting to true');
      
      // Start redirect loading sequence
      setIsRedirecting(true);
      
      console.log('isRedirecting set to true, starting 4-second countdown');
      
      // Show 4-second loading sequence
      setTimeout(() => {
        console.log('4 seconds passed, showing success feedback');
        setShowSuccess(true);
        // Show success feedback for 1 second before redirect
        setTimeout(() => {
          console.log('Now redirecting to login');
          try {
            window.location.href = '/login';
          } catch (error) {
            console.error('Redirect failed, trying alternative:', error);
            window.location.replace('/login');
          }
        }, 1000);
      }, 4000);
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
      {/* Signup Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {/* Circle with user icon or preview */}
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
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
              Optional: add a profile photo now. This will be shown next to your name on your profile page.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.firstName ? 'border-red-500' : 'border-gray-200'}`}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
            </div>

            {/* Last Name Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.lastName ? 'border-red-500' : 'border-gray-200'}`}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
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
      </div>

      {/* Loading Overlay */}
      {(isLoading || isRedirecting) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* Small White Rectangle Block */}
          <div className="bg-white rounded-lg shadow-2xl p-6 w-80">
            <div className="flex flex-col items-center space-y-4">
              {/* Blue Loader */}
              <div className="relative">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animation-delay-150"></div>
              </div>
              
              {/* Loading Message */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {showSuccess ? 'Registration Successful!' : 'Creating Account...'}
                </h3>
                <p className="text-sm text-gray-600">
                  {showSuccess 
                    ? 'Redirecting to login...' 
                    : 'Please wait while we set up your account'}
                </p>
              </div>
              
              {/* Progress Indicator */}
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${
                    showSuccess ? 'bg-green-500' : 'bg-blue-600'
                  }`}
                  style={{ width: showSuccess ? '100%' : '75%' }}
                ></div>
              </div>
              
              {/* Success Checkmark */}
              {showSuccess && (
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-gray-500 mt-6">
        &copy; 2024 THE GREGGORY FOUNDATION LTD. All rights reserved.
      </p>
    </AuthLayout>
  )
}

export default Signup
