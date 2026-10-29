import { apiCall } from '../services/api'

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
  return null
}

export function setAdminToken(token) {
  clearLegacyAdminStorage()
  localStorage.removeItem('gf_admin_session_token')
  if (token) sessionStorage.setItem('gf_admin_authenticated_hint', 'true')
  emitAdminSessionChanged()
}

export function clearAdminSession() {
  clearLegacyAdminStorage()
  try {
    sessionStorage.removeItem('gf_admin_authenticated_hint')
    localStorage.removeItem('gf_admin_session_token')
    localStorage.removeItem('gf_admin_session')
    localStorage.removeItem('gf_admin_user')
    localStorage.removeItem('gf_role_permissions')
    sessionStorage.removeItem('gf_admin_session')
    sessionStorage.removeItem('gf_admin_user')
  } catch {
    /* ignore */
  }
  emitAdminSessionChanged()
}

export function hasAdminToken() {
  return sessionStorage.getItem('gf_admin_authenticated_hint') === 'true'
}

export async function verifyAdminSession() {
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

// NOTE: the former adminAuthenticate() helper called
// POST /api/admin/authenticate. That route does not exist on the server
// (verified live 2026-09-29 by scripts/check-auth-route-map.js:
// /api/admin/authenticate fails closed 401 via admin.js's blanket session gate).
// The real login flow uses /admin-verification/authenticate-enhanced
// (AuthPlatformModal, admin/hooks/useAuth). See AUTH-PLATFORMS-LINKING.md.
