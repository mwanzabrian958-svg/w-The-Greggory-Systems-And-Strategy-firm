import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tgf_user')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Only hydrate a real session — a profile without a token is stale
        if (parsed?.token) return parsed
      } catch (e) {
        console.error('Auth parse error:', e)
      }
    }
    const adminSaved = localStorage.getItem('gf_admin_user')
    if (adminSaved) {
      try {
        const adminData = JSON.parse(adminSaved)
        if (adminData?.token) return { ...adminData, role: adminData.role || 'admin' }
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
            setUser(parsed)
            return
          }
        } catch (e) {}
      }
      const adminSaved = localStorage.getItem('gf_admin_user')
      if (adminSaved) {
        try {
          const adminData = JSON.parse(adminSaved)
          if (adminData?.token) {
            setUser({ ...adminData, role: adminData.role || 'admin' })
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
    setUser(userData)
    localStorage.setItem('tgf_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('tgf_user')
    localStorage.removeItem('gf_admin_user')
    localStorage.removeItem('gf_admin_session_token')
  }

  const value = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    login,
    logout,
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
