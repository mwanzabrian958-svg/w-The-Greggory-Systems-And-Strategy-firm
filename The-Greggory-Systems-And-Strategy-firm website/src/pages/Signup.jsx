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
    userType: 'user'
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
    const nextErrors = { firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', terms: '', submit: '' };

    if (!formData.firstName.trim()) nextErrors.firstName = 'Required';
    if (!formData.lastName.trim()) nextErrors.lastName = 'Required';
    if (!formData.email.trim()) {
      nextErrors.email = 'Required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) nextErrors.email = 'Invalid format';
    }
    if (formData.password.length < 6) nextErrors.password = 'Min 6 chars';
    if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'Mismatch';
    if (!agreedToTerms) nextErrors.terms = 'Agreement required';

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsLoading(true);
    try {
      const userData = {
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        display_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`
      };
      
      if (profileFile) {
        const base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(profileFile);
        });
        userData.profile_photo_base64 = base64Data;
        userData.profile_photo_mime_type = profileFile.type;
        userData.profile_photo_file_name = profileFile.name;
      }

      const response = await usersAPI.register(userData);
      if (!response.success) throw new Error(response.message || 'Registration failed');

      setShowSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message }));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Create Strategic Account" subtitle="Join our elite systems network">
      <div className="relative z-10 font-sans">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-gold-500 to-cyan-500 rounded-full blur opacity-25"></div>
            <div className="relative w-20 h-20 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/20 backdrop-blur-xl">
              {profilePreview ? <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-slate-500" />}
            </div>
            <label htmlFor="profilePhoto" className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-gold-500 border-2 border-[#0f172a] flex items-center justify-center text-slate-950 cursor-pointer shadow-xl">
              <Camera className="w-3.5 h-3.5" />
            </label>
            <input id="profilePhoto" type="file" accept="image/*" className="hidden" onChange={handleProfileChange} />
          </div>
          <p className="mt-4 text-[8px] text-slate-500 font-black uppercase tracking-widest">Establish Identity Node</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[11px] font-bold outline-none" />
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[11px] font-bold outline-none" />
          </div>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Node" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[11px] font-bold outline-none" />
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="M-Pesa Relay" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[11px] font-bold outline-none" />

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Access Key" required className="w-full px-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[11px] font-bold outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-500">{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            </div>
            <div className="relative">
              <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm" required className="w-full px-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[11px] font-bold outline-none" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-slate-500">{showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            </div>
          </div>

          <div className="flex items-center gap-3 px-1">
            <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-4 h-4 rounded border-white/10 bg-white/5 text-gold-500" />
            <label htmlFor="terms" className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Consent to Protocols</label>
          </div>

          {errors.submit && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-[8px] text-rose-400 font-bold rounded-lg text-center uppercase">{errors.submit}</div>}

          <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-gold-500 to-yellow-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
            {isLoading ? 'Relaying Data...' : 'Initialize Node'}
          </button>

          <p className="text-center text-[8px] font-black text-slate-500 uppercase tracking-widest">Node exists? <Link to="/login" className="text-gold-500">Access Login</Link></p>
        </form>
      </div>

      {(isLoading || showSuccess) && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="bg-slate-900 border border-white/10 rounded-[40px] p-10 flex flex-col items-center space-y-6">
            <div className="w-16 h-16 rounded-full border-4 border-gold-500/10 border-t-gold-500 animate-spin flex items-center justify-center">
              {showSuccess && <CheckCircle className="w-10 h-10 text-emerald-500 animate-bounce" />}
            </div>
            <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{showSuccess ? 'Node Solidified' : 'Deploying Identity'}</p>
          </div>
        </div>
      )}

      <div className="text-center text-[7px] font-black text-slate-700 uppercase tracking-[0.4em] mt-8">&copy; {new Date().getFullYear()} GSS SYSTEMS NODE</div>
    </AuthLayout>
  )
}

export default Signup
