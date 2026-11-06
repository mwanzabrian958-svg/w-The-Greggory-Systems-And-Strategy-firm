import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
})

const withoutInlineProfilePhoto = (userData) => {
  if (!userData || typeof userData !== 'object') return userData
  if (!Object.prototype.hasOwnProperty.call(userData, 'profilePhotoData')) return userData
  const { profilePhotoData, ...sessionUser } = userData
  return sessionUser
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tgf_user')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Only hydrate a real session — a profile without a token is stale
        if (parsed?.token) {
          const sessionUser = withoutInlineProfilePhoto(parsed)
          if (sessionUser !== parsed) {
            localStorage.setItem('tgf_user', JSON.stringify(sessionUser))
          }
          return sessionUser
        }
      } catch (e) {
        console.error('Auth parse error:', e)
      }
    }
    const adminSaved = localStorage.getItem('gf_admin_user')
    if (adminSaved) {
      try {
        const adminData = JSON.parse(adminSaved)
        if (adminData?.token) return withoutInlineProfilePhoto({ ...adminData, role: adminData.role || 'admin' })
      } catch (e) {}
    }
    return null
  })

  useEffect(() => {
    const syncAuth = () => {
      const saved = localStorage.getItem('tgf_user')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed?.token) {
            const sessionUser = withoutInlineProfilePhoto(parsed)
            if (sessionUser !== parsed) {
              localStorage.setItem('tgf_user', JSON.stringify(sessionUser))
            }
            setUser(sessionUser)
            return
          }
        } catch (e) {}
      }
      const adminSaved = localStorage.getItem('gf_admin_user')
      if (adminSaved) {
        try {
          const adminData = JSON.parse(adminSaved)
          if (adminData?.token) {
            setUser(withoutInlineProfilePhoto({ ...adminData, role: adminData.role || 'admin' }))
            return
          }
        } catch (e) {}
      }
      setUser(null)
    }
    window.addEventListener('storage', syncAuth)
    window.addEventListener('gf-admin-session-changed', syncAuth)
    return () => {
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('gf-admin-session-changed', syncAuth)
    }
  }, [])

  const login = (userData) => {
    const sessionUser = withoutInlineProfilePhoto(userData)
    setUser(sessionUser)
    localStorage.setItem('tgf_user', JSON.stringify(sessionUser))
  }

  const logout = async () => {
    // Attempt to invalidate the token on the backend first
    const token = user?.token
    const isAdminSession = user?.role === 'admin' || user?.role_type === 'admin' || !!user?.admin_level
    if (isAdminSession && token) {
      const response = await fetch('/api/admin-verification/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Could not close all admin sessions')
      localStorage.setItem('gf_admin_logout_at', String(Date.now()))
    }
    if (token && !isAdminSession) {
      try {
        const res = await fetch('/api/users/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        })
        // Backend invalidation is best-effort — don't block local cleanup
        // on network errors or server downtime.
        if (!res.ok) { /* best-effort only */ }
      } catch {
        /* best-effort only — local cleanup proceeds below */
      }
    }

    // Clear all session data from localStorage
    setUser(null)
    localStorage.removeItem('tgf_user')
    localStorage.removeItem('gf_admin_user')
    localStorage.removeItem('gf_admin_session')
    localStorage.removeItem('gf_admin_session_token')
    sessionStorage.removeItem('gf_admin_session')
    window.dispatchEvent(new Event('gf-admin-session-changed'))
  }

  const value = useMemo(() => ({
    // A session is only authenticated when a real token exists — a saved
    // profile object without a token is stale (e.g. from a previous session
    // that was cleared) and must not pass PrivateRoute guards.
    isAuthenticated: !!user?.token,
    user,
    login,
    logout,
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
