import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "../../services/api";

const API_URL = import.meta.env.VITE_API_URL || API_BASE_URL;

export function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginRole, setLoginRole] = useState("admin");

  const from = location.state?.from?.pathname || "/admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = loginRole === "developer"
          ? `${API_URL}/developer-verification/authenticate`
          : `${API_URL}/admin-verification/authenticate-enhanced`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Authentication failed");

      const session = {
        user: data.user,
        token: data.token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      localStorage.setItem("gf_admin_session", JSON.stringify(session));
      localStorage.setItem("gf_admin_session_token", data.token);

      if (typeof onLoginSuccess === 'function') onLoginSuccess(data.user);

      window.dispatchEvent(new Event("gf-admin-session-changed"));

      // Redirect to MISSION CONTROL
      navigate("/admin", { replace: true });

    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Failed to reach protocol relay.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-400/20"><Shield className="w-10 h-10 text-white" /></div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Systems Access</h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2">Firmware Relay Initialization</p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start">
            <AlertCircle className="w-4 h-4 text-rose-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-[9px] font-black uppercase text-rose-400 tracking-widest">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-8 shadow-2xl space-y-6">
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Mission Context</label>
            <select value={loginRole} onChange={(e) => setLoginRole(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold text-white outline-none focus:border-blue-500">
              <option value="admin">SYSTEM ADMINISTRATOR</option>
              <option value="developer">TECHNICAL DEVELOPER</option>
            </select>
          </div>

          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Identity Relay</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold text-white outline-none focus:border-blue-500" placeholder="node@relay.gss" />
          </div>

          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Access Key</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold text-white outline-none focus:border-blue-500" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-500">{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Initialize Node Access"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
