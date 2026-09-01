import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, X, UserPlus, Eye, EyeOff,
  ArrowLeft, CheckCircle, RefreshCw
} from "lucide-react";
import { apiCall } from "../../services/api";

/**
 * RESTORED: Authentication Platform UI
 * Full-screen split layout: dark brand rail (3-dots identity) + full-height
 * white access panel. No popup card — the auth UI occupies the entire viewport.
 */
export function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [view, setView] = useState("platform"); // 'platform' or 'admin' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register State
  const [regStep, setRegStep] = useState(1);
  const [regData, setRegData] = useState({
    first_name: "", last_name: "", email: "",
    password: "", confirmPassword: ""
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiCall("/admin-verification/authenticate-enhanced", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const session = {
        user: data.user,
        token: data.token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      localStorage.setItem("gf_admin_session", JSON.stringify(session));
      localStorage.setItem("gf_admin_session_token", data.token);

      if (onLoginSuccess) onLoginSuccess(data.user);
      window.dispatchEvent(new Event("gf-admin-session-changed"));
      navigate("/admin", { replace: true });

    } catch (err) {
      setError(err.message || "Credential verification failure.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (regData.password !== regData.confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    try {
      const data = await apiCall("/admin-verification/register", {
        method: "POST",
        body: JSON.stringify({
          ...regData,
          role: "admin"
        }),
      });
      if (data.success) setRegStep(3);
      else setError(data.message || "Registration failure.");
    } catch (err) {
      setError(err.message || "Network relay failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] flex flex-col lg:flex-row font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* LEFT — full-height brand rail (no popup card) */}
      <aside className="relative z-10 w-full lg:w-[42%] xl:w-[38%] bg-gradient-to-br from-slate-950 via-[#170f2e] to-slate-950 text-white flex flex-col justify-between px-8 py-10 lg:px-12 lg:py-14 border-b lg:border-b-0 lg:border-r border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-10" aria-hidden="true">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            <span className="w-2 h-2 rounded-full bg-purple-800"></span>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/20 shadow-xl">
              <Shield className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-300">Authentication platform</p>
              <h1 className="text-xl font-black uppercase tracking-tight mt-1">Command Relay Node</h1>
            </div>
          </div>

          {view === "platform" ? (
            <div className="mt-10 max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="text-sm text-slate-300 leading-relaxed mb-8">
                Secure identity verification protocol for administrative console access.
                Initialize secure handshake to proceed.
              </p>
              <button
                onClick={() => setView("admin")}
                className="w-full flex items-center justify-center gap-3 bg-purple-500 hover:bg-purple-400 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-purple-900/40"
              >
                <Shield size={16} /> Access Admin Console
              </button>
              <button
                onClick={() => { setView("register"); setError(""); }}
                className="mt-4 w-full text-[9px] font-black text-purple-300/80 uppercase tracking-[0.3em] hover:text-purple-200 transition-colors"
              >
                Initialize New Admin Node
              </button>
            </div>
          ) : (
            <p className="mt-10 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] leading-loose max-w-xs">
              Secure handshake in progress — complete the protocol on the access panel.
            </p>
          )}
        </div>

        <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.5em] pt-16">System Property of Greggory Systems &amp; Strategy Firm © {new Date().getFullYear()}</p>
      </aside>

      {/* RIGHT — full-height access panel */}
      <main className="relative z-10 flex-1 bg-white flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16 min-h-[58vh]">
        {view !== "platform" && (
          <button
            onClick={() => { setView("platform"); setError(""); }}
            className="absolute left-6 top-6 lg:left-10 lg:top-10 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="w-full max-w-md">

            {view === "admin" && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300 w-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Identity Handshake</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Authorized Personnel Only</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3">
                    <Shield className="w-5 h-5 text-rose-500 shrink-0" />
                    <span className="text-rose-700 text-[10px] font-black uppercase tracking-widest leading-tight">{error}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Identity Relay (Email)</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" placeholder="node@relay.gss" />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Secure Key</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all pr-12" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-500 transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                    {loading ? <RefreshCw className="animate-spin" size={16} /> : "Verify Identity"}
                  </button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4">Unregistered Personnel Node?</p>
                   <button onClick={() => setView("register")} className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline">Initialize New Admin Node</button>
                </div>
              </div>
            )}

            {view === "register" && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300 w-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Node Creation</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Initialize Administrator Credentials</p>
                </div>

                {regStep === 3 ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-inner">
                      <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Node Solidified!</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-8">Your identity has been synced to the matrix.</p>
                    <button onClick={() => setView("admin")} className="w-full bg-slate-900 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Proceed to Handshake</button>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="First Name" value={regData.first_name} onChange={(e) => setRegData({...regData, first_name: e.target.value})} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-900 outline-none" />
                      <input type="text" placeholder="Last Name" value={regData.last_name} onChange={(e) => setRegData({...regData, last_name: e.target.value})} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-900 outline-none" />
                    </div>
                    <input type="email" placeholder="Identity Relay (Email)" value={regData.email} onChange={(e) => setRegData({...regData, email: e.target.value})} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-900 outline-none" />
                    <input type="password" placeholder="Access Key" value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} required minLength={6} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-900 outline-none" />
                    <input type="password" placeholder="Confirm Key" value={regData.confirmPassword} onChange={(e) => setRegData({...regData, confirmPassword: e.target.value})} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-900 outline-none" />

                    {error && <p className="text-[8px] font-black text-rose-500 uppercase text-center">{error}</p>}

                    <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl transition-all">
                      {loading ? <RefreshCw className="animate-spin" size={16} /> : "Solidify Admin Node"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {view === "platform" && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                  <Shield className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Awaiting secure handshake</p>
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-2">Select an access protocol from the command rail</p>
              </div>
            )}

        </div>
      </main>
    </div>
  );
}

export default Login;
