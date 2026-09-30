import { apiCall } from '../services/api'

const TOKEN_KEY = 'gf_admin_session_token'

const LEGACY_KEYS = ['admin_authenticated', 'admin_code_validated', 'admin_user', 'admin_session']

export function clearLegacyAdminStorage() {
  LEGACY_KEYS.forEach((k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  })
}

function emitAdminSessionChanged() {
  try {
    window.dispatchEvent(new Event('gf-admin-session-changed'))
  } catch {
    /* ignore */
  }
}

export function getAdminToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAdminToken(token) {
  clearLegacyAdminStorage()
  localStorage.setItem(TOKEN_KEY, token)
  emitAdminSessionChanged()
}

export function clearAdminSession() {
  clearLegacyAdminStorage()
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('gf_admin_session')
    localStorage.removeItem('gf_admin_user')
  } catch {
    /* ignore */
  }
  emitAdminSessionChanged()
}

export function hasAdminToken() {
  return !!getAdminToken()
}

export async function verifyAdminSession() {
  const token = getAdminToken()
  if (!token) {
    clearLegacyAdminStorage()
    return { ok: false, user: null }
  }
  try {
    // Use apiCall for built-in error handling and consistency
    const data = await apiCall('/admin/session')

    if (!data.success || !data.user) {
      clearAdminSession()
      return { ok: false, user: null }
    }
    return { ok: true, user: data.user }
  } catch (err) {
    console.error('[SESSION VERIFY] failure:', err)
    clearAdminSession()
    return { ok: false, user: null }
  }
}

// NOTE: the former adminAuthenticate()/developerAuthenticate() helpers called
// POST /api/admin/authenticate and /api/developer/authenticate. Neither route
// exists on the server (verified live 2026-09-29 by scripts/check-auth-route-map.js:
// /api/admin/authenticate fails closed 401 via admin.js's blanket session gate,
// /api/developer/authenticate is 404). The real login flows use
// /admin-verification/authenticate-enhanced (AuthPlatformModal, admin/hooks/useAuth)
// and /developer-verification/authenticate. See AUTH-PLATFORMS-LINKING.md.

