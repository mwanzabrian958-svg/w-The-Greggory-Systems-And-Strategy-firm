import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, Phone, Camera, CheckCircle } from 'lucide-react'
import GoogleSignIn from '../components/GoogleSignIn'
import AuthLayout from '../components/AuthLayout'
import { usersAPI } from '../services/api'
import { SITE_NAME } from '../constants/siteBrand'

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
      
      // Prepare user data
      const userData = {
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        display_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`
      };
      
      // Add profile photo directly as base64 if selected
      if (profileFile) {
        console.log('[SIGNUP] Converting profile photo to base64...');
        
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(profileFile);
        });
        
        // Add base64 photo data directly to registration payload
        userData.profile_photo_base64 = base64Data;
        userData.profile_photo_mime_type = profileFile.type || 'image/jpeg';
        userData.profile_photo_file_name = profileFile.name || 'profile.jpg';
        
        console.log('[SIGNUP] Profile photo ready for direct upload');
      }

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
    <AuthLayout title="Create Strategic Account" subtitle="Join our elite systems network">
      {/* Signup Form */}
      <div className="relative z-10">
          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-gold-500 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              {/* Circle with user icon or preview */}
              <div className="relative w-24 h-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/20 backdrop-blur-xl">
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-500" />
                )}
              </div>
              {/* Small + button on bottom-left of the circle */}
              <label
                htmlFor="profilePhoto"
                className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-gold-500 border-2 border-[#0f172a] flex items-center justify-center text-slate-950 text-sm cursor-pointer shadow-xl hover:bg-gold-400 transition-colors"
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
            <p className="mt-4 text-[10px] text-slate-500 text-center max-w-xs font-black uppercase tracking-widest">
              Optional: Establish your visual identity
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* First Name Input */}
              <div className="space-y-2">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500 group-focus-within:text-gold-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    required
                    className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500/40 transition-all text-sm font-medium ${errors.firstName ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                </div>
                {errors.firstName && <p className="mt-1 text-[10px] text-red-400 font-bold ml-1">{errors.firstName}</p>}
              </div>

              {/* Last Name Input */}
              <div className="space-y-2">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500 group-focus-within:text-gold-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    required
                    className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500/40 transition-all text-sm font-medium ${errors.lastName ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                </div>
                {errors.lastName && <p className="mt-1 text-[10px] text-red-400 font-bold ml-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-gold-500 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500/40 transition-all text-sm font-medium ${errors.email ? 'border-red-500/50' : 'border-white/10'}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-[10px] text-red-400 font-bold ml-1">{errors.email}</p>}
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-500 group-focus-within:text-gold-500 transition-colors" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number (Optional)"
                  className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500/40 transition-all text-sm font-medium ${errors.phone ? 'border-red-500/50' : 'border-white/10'}`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-[10px] text-red-400 font-bold ml-1">{errors.phone}</p>}
            </div>

            {/* Password Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className={`w-full pl-4 pr-10 py-4 bg-white/5 border rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500/40 transition-all text-sm font-medium ${errors.password ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-gold-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-[10px] text-red-400 font-bold ml-1">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm"
                    required
                    className={`w-full pl-4 pr-10 py-4 bg-white/5 border rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500/40 transition-all text-sm font-medium ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-gold-500 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-[10px] text-red-400 font-bold ml-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-1">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-white/20 bg-white/5 text-gold-500 focus:ring-gold-500/40 transition-all cursor-pointer"
                  />
                </div>
                <label htmlFor="terms" className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                  I agree to the <Link to="/terms" className="text-gold-400 hover:text-gold-300">Terms of Use</Link> & <Link to="/privacy" className="text-gold-400 hover:text-gold-300">Privacy Policy</Link>
                </label>
              </div>
              {errors.terms && <p className="text-[10px] text-red-400 font-bold ml-1">{errors.terms}</p>}
            </div>

            {/* Signup Button */}
            <div className="space-y-4 pt-4">
              {errors.submit && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-bold rounded-2xl text-center">
                  {errors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-base font-black text-slate-950 bg-gradient-to-r from-gold-500 to-yellow-500 hover:from-gold-400 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-[0.1em]"
              >
                {isLoading ? 'Registering...' : 'Initialize Account'}
              </button>

              <div className="text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Already joined?{' '}
                  <Link to="/login" className="text-gold-500 hover:text-gold-400 transition-colors">
                    Log In
                  </Link>
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black tracking-[0.3em]">
                <span className="px-4 bg-[#0f172a]/50 backdrop-blur-md text-slate-600">OR CONTINUE WITH</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <div className="flex justify-center">
              <GoogleSignIn buttonText="Strategic Signup" isSignUp={true} />
            </div>
          </form>
      </div>

      {/* Loading Overlays - Styled for Dark Theme */}
      {(isLoading || isRedirecting) && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100]">
          <div className="bg-[#0f1f3d] border border-white/10 rounded-[40px] shadow-2xl p-10 w-96 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-40 w-40 bg-gold-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative flex flex-col items-center space-y-8">
              {/* Complex Loader */}
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 rounded-full border-4 border-gold-500/10"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-gold-500 animate-spin"></div>
                {showSuccess && (
                  <div className="absolute inset-0 flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">
                  {showSuccess ? 'Deployment Successful' : 'Initializing Systems'}
                </h3>
                <p className="text-sm text-slate-400 font-medium">
                  {showSuccess 
                    ? 'Redirecting to command center...'
                    : 'Setting up your organizational parameters'}
                </p>
              </div>
              
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${
                    showSuccess ? 'bg-green-500' : 'bg-gold-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  }`}
                  style={{ width: showSuccess ? '100%' : '75%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Copy (Handled by AuthLayout ideally, but kept here for precision) */}
      <div className="text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mt-8 relative z-10">
        &copy; {new Date().getFullYear()} {SITE_NAME.toUpperCase()}. All Rights Reserved.
      </div>
    </AuthLayout>
  )
}

export default Signup
