import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  X,
  UserPlus,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { hasAdminToken } from "../utils/adminSession";
import { apiCall, getApiUrl } from "../services/api";

/**
 * Full "Authentication platform" experience: gradient header, member sign-in/up, admin console path.
 * Opened from footer three-dots or navbar; admin step uses server-backed credentials + code.
 */
export default function AuthPlatformModal({
  isOpen,
  onClose,
  onAdminSuccess,
  /** When true, open directly on admin credentials (e.g. ?admin=1). */
  startOnAdminStep = false,
}) {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [view, setView] = useState("platform");
  const [hasAdminSessionToken, setHasAdminSessionToken] = useState(() =>
    hasAdminToken(),
  );

  // Admin registration state
  const [regRole, setRegRole] = useState("admin");
  const [regStep, setRegStep] = useState(1); // 1: credentials, 2: success
  const [regData, setRegData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [regError, setRegError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);

  // Admin login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginRole, setLoginRole] = useState("admin");

  useEffect(() => {
    const sync = () => setHasAdminSessionToken(hasAdminToken());
    window.addEventListener("gf-admin-session-changed", sync);
    return () => window.removeEventListener("gf-admin-session-changed", sync);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setView("platform");
      return;
    }
    if (startOnAdminStep) {
      setView("admin");
    } else {
      setView("platform");
    }
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
  }, [isOpen, startOnAdminStep]);

  if (!isOpen) return null;

  const handleClose = () => {
    setView("platform");
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
    onClose();
  };

  const handleAdminCta = () => {
    if (hasAdminSessionToken) {
      handleClose();
      navigate("/admin");
    } else {
      setView("admin");
    }
  };

  const handleCredentialsSuccess = () => {
    onAdminSuccess?.();
    handleClose();
  };

  const handleRegisterStart = () => {
    setRegRole("admin");
    setRegStep(1);
    setRegData({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setRegError("");
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
    setView("register");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError("");

    if (!regData.first_name || !regData.last_name || !regData.email || !regData.password) {
      setRegError("All fields are required");
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      setRegError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const registerData = {
        first_name: regData.first_name,
        last_name: regData.last_name,
        email: regData.email,
        password: regData.password,
        role: "admin",
      };

      if (profilePhoto) {
        registerData.profile_photo_base64 = profilePhotoPreview;
        registerData.profile_photo_mime_type = profilePhoto.type || "image/jpeg";
        registerData.profile_photo_file_name = profilePhoto.name || "profile.jpg";
      }

      const data = await apiCall("/admin-verification/register", {
        method: "POST",
        body: JSON.stringify(registerData),
      });

      if (data.success) {
        setRegStep(3);
      } else {
        setRegError(data.message || "Registration failed");
      }
    } catch (err) {
      setRegError("Network error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      // Switch to standard apiCall for better error handling and JSON stability
      const data = await apiCall("/admin-verification/authenticate-enhanced", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const session = {
        token: data.token,
        user: data.user,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      localStorage.setItem("gf_admin_session", JSON.stringify(session));
      localStorage.setItem("gf_admin_session_token", data.token);
      localStorage.setItem("gf_admin_user", JSON.stringify(data.user));

      login({
        ...data.user,
        role: "admin",
        token: data.token
      });

      window.dispatchEvent(new Event("gf-admin-session-changed"));
      handleCredentialsSuccess();
    } catch (err) {
      console.error("[AUTH HANDSHAKE FAILURE]", err);
      setLoginError(err.message || "Credential verification handshake failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl border border-white/15 bg-slate-900 flex flex-col font-sans">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1">
          {view === "platform" && (
            <section className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white border-b border-purple-400/40 px-6 pt-10 pb-8 sm:px-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="mt-0.5 p-2.5 rounded-lg bg-white/10 border border-white/20 shrink-0">
                  <Shield className="w-6 h-6 text-purple-200" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-purple-200">
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
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-purple-400 transition-colors sm:ml-auto"
                >
                  <Shield className="w-4 h-4" />
                  {hasAdminSessionToken ? "Open admin" : "access"}
                </button>
              </div>
            </section>
          )}

          {view === "admin" && (
            <div className="bg-white px-6 py-8 sm:px-8 relative">
              <button
                onClick={() => setView("platform")}
                className="absolute left-6 top-6 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="relative w-20 h-20 mb-4 shrink-0 mx-auto">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 overflow-hidden flex items-center justify-center border-2 border-slate-100 shadow-lg">
                    {profilePhotoPreview ? (
                      <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:bg-green-600 shadow-md">
                    <span className="text-white text-sm font-bold leading-none">+</span>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  Administrative Access
                </h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2">
                  Initialize Secure Access Protocol
                </p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center">
                  <Shield className="w-5 h-5 text-red-500 mr-2 shrink-0" />
                  <span className="text-red-700 text-[10px] font-bold uppercase tracking-widest">{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Email Node</label>
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[10px] font-bold" placeholder="admin@thegreggoryfirm.org" />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Access Key</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[10px] font-bold pr-10" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 transition-colors">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <button type="submit" disabled={loginLoading} className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-purple-900/10">
                  {loginLoading ? "Synchronizing..." : <><Shield className="w-4 h-4" />Sign In</>}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-center text-[8px] font-black text-gray-400 uppercase tracking-widest mb-4">Request New Authorization Node?</p>
                <button onClick={handleRegisterStart} className="w-full px-4 py-2 border border-purple-200 text-purple-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-purple-50 transition-all">Register Admin Node</button>
              </div>
            </div>
          )}

          {view === "register" && (
            <div className="bg-white px-6 py-8 sm:px-8 relative">
              <button onClick={() => setView("platform")} className="absolute left-6 top-6 text-gray-400 hover:text-gray-600"><ArrowLeft className="w-6 h-6" /></button>
              <div className="text-center mb-6">
                <div className="relative w-20 h-20 mb-4 shrink-0 mx-auto">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center overflow-hidden border-2 border-slate-100 shadow-lg">
                    {profilePhotoPreview ? <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" /> : <Shield className="w-10 h-10 text-white" />}
                  </div>
                  <label className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:bg-green-600 shadow-md"><span className="text-white text-sm font-bold">+</span><input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" /></label>
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Identity Initialization</h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">ADMINISTRATOR NODE</p>
              </div>

              {regError && <div className="mb-4 p-3 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-red-100">{regError}</div>}

              {regStep === 3 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4 border border-emerald-100"><CheckCircle className="w-8 h-8 text-emerald-500" /></div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">Node Solidified!</h3>
                  <button onClick={() => setView("admin")} className="w-full px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Proceed to Verification</button>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" value={regData.first_name} onChange={(e) => setRegData({ ...regData, first_name: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[10px] font-bold" placeholder="First Name" />
                    <input type="text" value={regData.last_name} onChange={(e) => setRegData({ ...regData, last_name: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[10px] font-bold" placeholder="Last Name" />
                  </div>
                  <input type="email" value={regData.email} onChange={(e) => setRegData({ ...regData, email: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[10px] font-bold" placeholder="Identity Relay (Email)" />
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={regData.password} onChange={(e) => setRegData({ ...regData, password: e.target.value })} required minLength={6} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[10px] font-bold" placeholder="Access Key" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 transition-colors">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  <input type="password" value={regData.confirmPassword} onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[10px] font-bold" placeholder="Confirm Key" />
                  <button type="submit" disabled={isSubmitting} className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">{isSubmitting ? "Solidifying..." : "Initialize Node"}</button>
                  <p className="text-center text-[7px] font-black text-gray-400 uppercase tracking-widest">Pre-existing Node? <button type="button" onClick={() => setView("admin")} className="text-purple-600">Access Console here</button></p>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
