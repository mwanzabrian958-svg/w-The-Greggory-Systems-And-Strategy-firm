import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const defaultContext = {
  isAuthenticated: false,
  user: null,
  login: () => {},
  loginAsEmployee: (_jobId, _name) => {},
  loginAsDeveloper: (_profile) => {},
  logout: () => {},
}

const AuthContext = createContext(defaultContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Restore auth state from localStorage on page load
    // Check for regular user first
    const saved = localStorage.getItem('tgf_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse regular auth:', e)
      }
    }

    // Fallback: Check for Admin/Developer session
    const adminSaved = localStorage.getItem('gf_admin_user')
    if (adminSaved) {
      try {
        const adminData = JSON.parse(adminSaved)
        // Ensure role is correctly identified
        return {
          ...adminData,
          role: adminData.role || (adminData.admin_level ? 'admin' : 'developer')
        }
      } catch (e) {
        console.error('Failed to parse admin auth:', e)
      }
    }

    return null
  })

  useEffect(() => {
    // Sync logic for when other tabs or modals update storage
    const syncAuth = () => {
      const saved = localStorage.getItem('tgf_user')
      if (saved) {
        setUser(JSON.parse(saved))
      } else {
        const adminSaved = localStorage.getItem('gf_admin_user')
        if (adminSaved) {
          const adminData = JSON.parse(adminSaved)
          setUser({
            ...adminData,
            role: adminData.role || (adminData.admin_level ? 'admin' : 'developer')
          })
        } else {
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', syncAuth)
    window.addEventListener('gf-admin-session-changed', syncAuth)

    return () => {
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('gf-admin-session-changed', syncAuth)
    }
  }, [])

  const persist = (u) => {
    setUser(u)
    if (u) localStorage.setItem('tgf_user', JSON.stringify(u))
    else localStorage.removeItem('tgf_user')
  }

  const login = (userData = null, fallbackUser = null) => {
    const normalizedUser = typeof userData === 'string'
      ? { token: userData, ...(fallbackUser || {}) }
      : userData || fallbackUser || null

    if (normalizedUser) {
      persist(normalizedUser)
    } else {
      persist({ role: 'employee' })
    }
  }

  const loginAsEmployee = (jobId, name) => {
    // Placeholder: real impl should verify jobId + password on backend
    const displayName = name && name.trim() ? name.trim() : `Employee ${jobId}`
    persist({ role: 'employee', jobId, name: displayName })
  }

  const loginAsDeveloper = (profile) => {
    // profile may include login/name/id from GitHub
    persist({ role: 'developer', ...profile })
  }

  const logout = () => {
    persist(null)
  }

  const value = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    login,
    loginAsEmployee,
    loginAsDeveloper,
    logout,
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
