import { useState, useEffect, useCallback } from "react";
import { apiCall } from "../../services/api";

/**
 * useAuth - Restored Session & Identity Protocol
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(async (revokeSessions = true) => {
    if (revokeSessions) {
      await apiCall("/admin-verification/logout", { method: "POST" });
      localStorage.setItem("gf_admin_logout_at", String(Date.now()));
    }
    sessionStorage.removeItem("gf_admin_session");
    sessionStorage.removeItem("gf_admin_user");
    sessionStorage.removeItem("gf_admin_authenticated_hint");
    localStorage.removeItem("gf_admin_session");
    localStorage.removeItem("gf_admin_session_token");
    localStorage.removeItem("gf_admin_user");
    localStorage.removeItem("gf_admin_authenticated_hint");
    localStorage.removeItem("gf_role_permissions");
    setUser(null);
    setIsAuthenticated(false);
    window.dispatchEvent(new Event("gf-admin-session-changed"));
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const data = await apiCall("/admin/session");

      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        await logout(false);
      }
    } catch (error) {
      console.error("Identity Handshake Failure:", error.message);
      await logout(false);
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    try {
      const data = await apiCall("/admin-verification/authenticate-enhanced", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const session = {
        user: data.user,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      sessionStorage.setItem("gf_admin_session", JSON.stringify(session));
      sessionStorage.setItem("gf_admin_user", JSON.stringify(data.user));
      sessionStorage.setItem("gf_admin_authenticated_hint", "true");

      setUser(data.user);
      setIsAuthenticated(true);
      window.dispatchEvent(new Event("gf-admin-session-changed"));

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiCall("/admin/session");
      if (data.success && data.user) {
        setUser(data.user);
        const sessionStr = sessionStorage.getItem("gf_admin_session");
        if (sessionStr) {
           const session = JSON.parse(sessionStr);
           const updated = { ...session, user: data.user };
           sessionStorage.setItem("gf_admin_session", JSON.stringify(updated));
        }
      }
    } catch (error) { console.error("Node Refresh Failure:", error); }
  }, []);

  return { user, isLoading, isAuthenticated, login, logout, refreshUser };
}
